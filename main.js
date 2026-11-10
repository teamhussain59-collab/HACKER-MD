import makeWASocket, {
    useMultiFileAuthState,
    DisconnectReason,
    fetchLatestBaileysVersion,
    makeCacheableSignalKeyStore,
    delay
} from '@whiskeysockets/baileys';
import express from 'express';
import pino from 'pino';
import fs from 'fs';
import path from 'path';
import axios from 'axios';
import { config } from './config.js';

// ================= GLOBAL VARIABLES & ERROR HANDLERS =================
global.plugins = new Map();
global.messageCache = new Map();
global.botInstances = new Map(); 

process.on('uncaughtException', (err) => console.error('\x1b[31m[ANTI-CRASH] Exception:\x1b[0m', err.message));
process.on('unhandledRejection', (reason) => console.error('\x1b[31m[ANTI-CRASH] Rejection:\x1b[0m', reason));

const displayBanner = () => {
    console.log('\x1b[36m%s\x1b[0m', `
    ██╗  ██╗ █████╗  ██████╗██╗  ██╗███████╗██████╗       ███╗   ███╗██████╗ 
    ██║  ██║██╔══██╗██╔════╝██║ ██╔╝██╔════╝██╔══██╗      ████╗ ████║██╔══██╗
    ███████║███████║██║     █████╔╝ █████╗  ██████╔╝████╗ ██╔████╔██║██║  ██║
    ██╔══██║██╔══██║██║     ██╔═██╗ ██╔══╝  ██╔══██╗╚═══╝ ██║╚██╔╝██║██║  ██║
    ██║  ██║██║  ██║╚██████╗██║  ██╗███████╗██║  ██║      ██║ ╚═╝ ██║██████╔╝
    ╚═╝  ╚═╝╚═╝  ╚═╝ ╚═════╝╚═╝  ╚═╝╚══════╝╚═╝  ╚═╝      ╚═╝     ╚═╝╚═════╝ 
    `);
    console.log('\x1b[35m=========================================================\x1b[0m');
    console.log('\x1b[33m       >> ULTIMATE WHATSAPP BOT ENGINE <<\x1b[0m');
    console.log('\x1b[32m       >> CREATED BY: HUSSAIN <<\x1b[0m');
    console.log('\x1b[35m=========================================================\x1b[0m\n');
};

class BotClient {
    constructor(phoneNumber) {
        this.phoneNumber = phoneNumber.replace(/[^0-9]/g, '');
        this.sessionPath = path.join(config.sessionDir, `session_${this.phoneNumber}`);
        this.sock = null;
    }

    async initialize() {
        if (!fs.existsSync(this.sessionPath)) fs.mkdirSync(this.sessionPath, { recursive: true });

        const { state, saveCreds } = await useMultiFileAuthState(this.sessionPath);
        const { version } = await fetchLatestBaileysVersion();
        const logger = pino({ level: 'silent' });

        this.sock = makeWASocket({
            version,
            logger,
            printQRInTerminal: false,
            browser: ['Mac OS', 'Safari', '17.0'], 
            auth: {
                creds: state.creds,
                keys: makeCacheableSignalKeyStore(state.keys, logger),
            },
            markOnlineOnConnect: true,
            generateHighQualityLinkPreview: true,
            // BAD MAC FIX (WhatsApp ko lagta hai purane messages cache se aaye hain)
            getMessage: async (key) => {
                if (global.messageCache.has(key.id)) return global.messageCache.get(key.id).media;
                return { conversation: 'HACKER-MD' };
            }
        });

        this.setupEvents(saveCreds);
        global.botInstances.set(this.phoneNumber, this);
        return this;
    }

    setupEvents(saveCreds) {
        this.sock.ev.on('creds.update', saveCreds);

        this.sock.ev.on('connection.update', async (update) => {
            const { connection, lastDisconnect } = update;
            
            if (connection === 'close') {
                const shouldReconnect = lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut;
                if (shouldReconnect) {
                    await delay(5000);
                    this.initialize().catch(() => {});
                }
            } else if (connection === 'open') {
                console.log(`\n\x1b[32m[✅ ${this.phoneNumber}] HACKER-MD CONNECTED SUCCESSFULLY!\x1b[0m\n`);
                
                await delay(2000);
                try {
                    const botId = this.sock.user.id;
                    const welcomeText = `✅ *HACKER-MD IS ONLINE!*\n\nBot successfully connected to your WhatsApp.\nType ${config.prefix}menu to start.`;
                    await this.sock.sendMessage(botId, { text: welcomeText });
                } catch (err) {}
            }
        });

        this.sock.ev.on('messages.upsert', async (chatUpdate) => {
            try {
                const msg = chatUpdate.messages[0];
                if (!msg.message || msg.key.remoteJid === 'status@broadcast') return;

                const body = msg.message.conversation || msg.message.extendedTextMessage?.text || '';
                global.messageCache.set(msg.key.id, { text: body, media: msg.message });

                if (msg.key.fromMe && (!body || !body.startsWith(config.prefix))) return;
                if (!body.startsWith(config.prefix)) return;

                const args = body.slice(config.prefix.length).trim().split(/ +/);
                const commandName = args.shift().toLowerCase();

                const plugin = global.plugins.get(commandName) || Array.from(global.plugins.values()).find(p => p.aliases && p.aliases.includes(commandName));
                
                if (plugin) {
                    await plugin.execute(this.sock, msg, args, config).catch(err => {
                        console.error(`\x1b[31m[PLUGIN ERROR - ${commandName}]:\x1b[0m`, err.message);
                    });
                }
            } catch (err) {}
        });
    }
}

async function loadAllPlugins() {
    const pluginsDir = path.join(process.cwd(), 'plugins');
    if (!fs.existsSync(pluginsDir)) return;

    const files = fs.readdirSync(pluginsDir).filter(file => file.endsWith('.js'));
    for (const file of files) {
        if (['otp-forward.js', 'numpanel.js'].includes(file)) continue;
        try {
            const module = await import(`./plugins/${file}`);
            if (module.default && module.default.command) global.plugins.set(module.default.command.toLowerCase(), module.default);
        } catch (err) {}
    }
    console.log(`\x1b[36m[SYSTEM] Loaded ${global.plugins.size} plugins successfully.\x1b[0m`);
}

// ================= WEB SERVER & SMART START (Fallback Setup) =================
const app = express();
app.use(express.json());
app.get('/', (req, res) => res.send('HACKER-MD is Alive!'));
app.get('/health', (req, res) => res.status(200).send('OK'));

app.listen(config.port, () => {
    console.log(`\n\x1b[32m[WEB SERVER] Running on port ${config.port}\x1b[0m`);
});

(async () => {
    displayBanner();
    await loadAllPlugins();

    const isGitHub = process.env.GITHUB_ACTIONS === 'true';

    if (isGitHub) {
        console.log('\x1b[33m[GITHUB FALLBACK] GitHub par chal raha hai. Railway ka wait kar rahe hain...\x1b[0m');
        
        if (process.env.RAILWAY_URL) {
            setInterval(async () => {
                try {
                    const res = await axios.get(`${process.env.RAILWAY_URL}/health`, { timeout: 5000 });
                    if (res.status === 200) {
                        console.log('\x1b[32m[RAILWAY ONLINE] Railway deploy ho gaya hai. GitHub se bot band kiya ja raha hai...\x1b[0m');
                        process.exit(0); // GitHub runner ko band kar dega
                    }
                } catch (e) {
                    // Railway abhi offline hai, GitHub chalta rahega
                }
            }, 15000); 
        }
    }

    // Bot start karein (Dono jagah chalega, SESSION_ID se connect hoga)
    if (config.pairNumbers.length > 0) {
        const client = new BotClient(config.pairNumbers[0]);
        await client.initialize().catch(err => console.error(err.message));
    }
})();
