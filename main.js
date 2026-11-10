import makeWASocket, {
    useMultiFileAuthState,
    DisconnectReason,
    fetchLatestBaileysVersion,
    makeCacheableSignalKeyStore,
    Browsers,
    delay
} from '@whiskeysockets/baileys';
import pino from 'pino';
import fs from 'fs';
import path from 'path';
import { config } from './config.js';

// ================= GLOBAL ERROR HANDLERS =================
process.on('uncaughtException', (err) => {
    console.error('\x1b[31m[ANTI-CRASH] Uncaught Exception:\x1b[0m', err.message);
});
process.on('unhandledRejection', (reason) => {
    console.error('\x1b[31m[ANTI-CRASH] Unhandled Rejection:\x1b[0m', reason);
});

// ================= STYLISH BANNER =================
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

// ================= BOT CLIENT CLASS =================
class BotClient {
    constructor(phoneNumber) {
        this.phoneNumber = phoneNumber.replace(/[^0-9]/g, '');
        this.sessionPath = path.join(config.sessionDir, `session_${this.phoneNumber}`);
        this.sock = null;
    }

    async initialize() {
        if (!fs.existsSync(this.sessionPath)) {
            fs.mkdirSync(this.sessionPath, { recursive: true });
        }

        const { state, saveCreds } = await useMultiFileAuthState(this.sessionPath);
        const { version } = await fetchLatestBaileysVersion();
        const logger = pino({ level: 'silent' });

        this.sock = makeWASocket({
            version,
            logger,
            printQRInTerminal: false,
            browser: Browsers.ubuntu('Chrome'),
            auth: {
                creds: state.creds,
                keys: makeCacheableSignalKeyStore(state.keys, logger),
            },
            markOnlineOnConnect: true,
            generateHighQualityLinkPreview: true,
            syncFullHistory: false
        });

        this.setupEvents(saveCreds);
        
        if (!this.sock.authState.creds.registered) {
            await this.requestPairingCode();
        }
    }

    async requestPairingCode() {
        await delay(3000);
        try {
            const code = await this.sock.requestPairingCode(this.phoneNumber);
            console.log(`\n\x1b[33m╔══════════════════════════════════════════════════╗`);
            console.log(`\x1b[32m   [PAIRING CODE for ${this.phoneNumber}]: \x1b[1m\x1b[36m${code}\x1b[0m\x1b[32m`);
            console.log(`\x1b[33m╚══════════════════════════════════════════════════╝\x1b[0m\n`);
        } catch (error) {
            console.error(`\x1b[31m[PAIRING ERROR] ${this.phoneNumber}: ${error.message}\x1b[0m`);
        }
    }

    setupEvents(saveCreds) {
        this.sock.ev.on('creds.update', saveCreds);

        this.sock.ev.on('connection.update', async (update) => {
            const { connection, lastDisconnect } = update;
            
            if (connection === 'close') {
                const statusCode = lastDisconnect?.error?.output?.statusCode;
                const shouldReconnect = statusCode !== DisconnectReason.loggedOut;
                
                console.log(`\x1b[31m[⚠️ ${this.phoneNumber}] Connection Closed (Code: ${statusCode}). Reconnecting: ${shouldReconnect}\x1b[0m`);
                
                if (shouldReconnect) {
                    await delay(5000);
                    this.initialize();
                }
            } else if (connection === 'open') {
                console.log(`\n\x1b[32m[✅ ${this.phoneNumber}] HACKER-MD CONNECTED SUCCESSFULLY!\x1b[0m\n`);
            }
        });

        this.sock.ev.on('messages.upsert', async (chatUpdate) => {
            try {
                const msg = chatUpdate.messages[0];
                if (!msg.message || msg.key.fromMe) return;
                if (msg.key.remoteJid === 'status@broadcast') return;

                await this.handleMessage(msg);
            } catch (err) {
                console.error('\x1b[31m[MESSAGE HANDLER ERROR]\x1b[0m', err);
            }
        });
    }

    async handleMessage(msg) {
        const type = Object.keys(msg.message)[0];
        const body = (type === 'conversation') ? msg.message.conversation 
                   : (type === 'extendedTextMessage') ? msg.message.extendedTextMessage.text 
                   : '';

        if (!body || !body.startsWith(config.prefix)) return;

        // Public Mode Auto-Read & Typing
        if (config.mode === 'public') {
            await this.sock.readMessages([msg.key]);
            await this.sock.sendPresenceUpdate('composing', msg.key.remoteJid);
        }

        const args = body.slice(config.prefix.length).trim().split(/ +/);
        const commandName = args.shift().toLowerCase();

        const plugin = global.plugins.get(commandName);
        if (plugin) {
            try {
                console.log(`\x1b[35m[CMD]\x1b[0m Executing: ${commandName}`);
                await plugin.execute(this.sock, msg, args, config);
            } catch (error) {
                console.error(`\x1b[31m[PLUGIN ERROR: ${commandName}]\x1b[0m`, error);
            }
        }
    }
}

// ================= PLUGIN LOADER =================
global.plugins = new Map();
// OTP aur Numpanel blocked rahenge (Safety policy)
const EXCLUDED_PLUGINS = ['otp-forward.js', 'numpanel.js'];

async function loadAllPlugins() {
    const pluginsDir = path.join(process.cwd(), 'plugins');
    if (!fs.existsSync(pluginsDir)) {
        console.log('\x1b[33m[WARN] No plugins directory found.\x1b[0m');
        return;
    }

    const files = fs.readdirSync(pluginsDir).filter(file => file.endsWith('.js'));
    
    for (const file of files) {
        if (EXCLUDED_PLUGINS.includes(file)) {
            console.log(`\x1b[31m[BLOCKED] ${file} (Excluded by rules)\x1b[0m`);
            continue;
        }

        try {
            const module = await import(`./plugins/${file}`);
            if (module.default && module.default.command) {
                global.plugins.set(module.default.command.toLowerCase(), module.default);
            }
        } catch (err) {
            console.error(`\x1b[31m[PLUGIN LOAD ERROR] ${file}:\x1b[0m`, err.message);
        }
    }
    console.log(`\x1b[36m[SYSTEM] Loaded ${global.plugins.size} plugins successfully.\x1b[0m`);
}

// ================= MAIN ENGINE START =================
(async () => {
    displayBanner(); // Stylish Banner display
    
    await loadAllPlugins();

    if (config.pairNumbers.length === 0) {
        console.log('\x1b[31m[ERROR] No PAIR_NUMBERS found in environment.\x1b[0m');
        process.exit(1);
    }

    // Multi-Account Support: Loop through all numbers provided
    for (const number of config.pairNumbers) {
        console.log(`\x1b[36m[SYSTEM] Starting client for number: ${number}...\x1b[0m`);
        const client = new BotClient(number);
        await client.initialize();
        
        await delay(2000); 
    }
})();
