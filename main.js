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
import { config } from './config.js';

// ================= GLOBAL VARIABLES & ERROR HANDLERS =================
global.plugins = new Map();
global.messageCache = new Map();
global.botInstances = new Map(); 
global.antiDeleteStatus = false;

// Crash se bachne ke liye global handlers
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
            // MAC OS SPOOFING (Baileys ka naam chupane ke liye)
            browser: ['Mac OS', 'Safari', '17.0'], 
            auth: {
                creds: state.creds,
                keys: makeCacheableSignalKeyStore(state.keys, logger),
            },
            markOnlineOnConnect: true,
            generateHighQualityLinkPreview: true
        });

        this.setupEvents(saveCreds);
        
        global.botInstances.set(this.phoneNumber, this);
        return this;
    }

    async requestPairingCode() {
        await delay(3000);
        try {
            const code = await this.sock.requestPairingCode(this.phoneNumber);
            console.log(`\n\x1b[33m╔══════════════════════════════════════════════════╗`);
            console.log(`\x1b[32m   [PAIRING CODE for ${this.phoneNumber}]: \x1b[1m\x1b[36m${code}\x1b[0m\x1b[32m`);
            console.log(`\x1b[33m╚══════════════════════════════════════════════════╝\x1b[0m\n`);
            return code;
        } catch (error) {
            console.error(`\x1b[31m[PAIRING ERROR]: ${error.message}\x1b[0m`);
            throw error;
        }
    }

    setupEvents(saveCreds) {
        this.sock.ev.on('creds.update', saveCreds);

        this.sock.ev.on('connection.update', async (update) => {
            const { connection, lastDisconnect } = update;
            
            if (connection === 'close') {
                const statusCode = lastDisconnect?.error?.output?.statusCode;
                const shouldReconnect = statusCode !== DisconnectReason.loggedOut;
                
                console.log(`\x1b[31m[⚠️ ${this.phoneNumber}] Connection Closed. Reconnecting: ${shouldReconnect}\x1b[0m`);
                
                if (shouldReconnect) {
                    await delay(5000);
                    this.initialize().catch(err => console.error("Reconnect error:", err.message));
                } else {
                    global.botInstances.delete(this.phoneNumber);
                }
            } else if (connection === 'open') {
                console.log(`\n\x1b[32m[✅ ${this.phoneNumber}] HACKER-MD CONNECTED SUCCESSFULLY!\x1b[0m\n`);
                
                // Welcome Message (Safe Send)
                await delay(2000);
                try {
                    const botId = this.sock.user.id;
                    const welcomeText = `
╭━━━〔 *${config.botName}* 〕━━━⬣
┃ ✅ *CONNECTION SUCCESSFUL!*
┃ 
┃ 👑 *Owner:* Hussain
┃ ⚡ *Status:* Online & Active
┃ 🧩 *Prefix:* [ ${config.prefix} ]
┃ 🚀 *Engine:* Premium Multi-Device
╰━━━━━━━━━━━━━━━━━━⬣

> *Welcome to HACKER-MD Engine!*
> *Type ${config.prefix}menu to explore all commands.*
`;
                    await this.sock.sendMessage(botId, { text: welcomeText });
                } catch (err) {
                    console.error('Welcome message error:', err.message);
                }
            }
        });

        this.sock.ev.on('messages.upsert', async (chatUpdate) => {
            try {
                const msg = chatUpdate.messages[0];
                if (!msg.message) return;
                if (msg.key.remoteJid === 'status@broadcast') return;

                const type = Object.keys(msg.message)[0];
                const body = (type === 'conversation') ? msg.message.conversation 
                           : (type === 'extendedTextMessage') ? msg.message.extendedTextMessage.text 
                           : '';

                // Khud ke messages ka check (Message Yourself ke liye)
                if (msg.key.fromMe) {
                    if (!body || !body.startsWith(config.prefix)) return; 
                }

                // Anti-Delete Cache
                const textMsg = body || 'Media';
                global.messageCache.set(msg.key.id, { text: textMsg, media: msg.message });
                if (global.messageCache.size > 200) global.messageCache.delete(global.messageCache.keys().next().value);

                // Auto-React trigger
                for (const [name, p] of global.plugins) {
                    if (p.onMessage) p.onMessage(this.sock, msg).catch(() => {});
                }

                if (!body || !body.startsWith(config.prefix)) return;

                // Auto Read (Public mode)
                if (config.mode === 'public' && !msg.key.fromMe) {
                    await this.sock.readMessages([msg.key]).catch(() => {});
                    await this.sock.sendPresenceUpdate('composing', msg.key.remoteJid).catch(() => {});
                }

                const args = body.slice(config.prefix.length).trim().split(/ +/);
                const commandName = args.shift().toLowerCase();

                // Command Execute (Safe execution)
                const plugin = global.plugins.get(commandName) || Array.from(global.plugins.values()).find(p => p.aliases && p.aliases.includes(commandName));
                
                if (plugin) {
                    console.log(`\x1b[35m[CMD]\x1b[0m Executing: ${commandName}`);
                    await plugin.execute(this.sock, msg, args, config).catch(err => {
                        console.error(`\x1b[31m[PLUGIN ERROR - ${commandName}]:\x1b[0m`, err.message);
                    });
                }
            } catch (err) {
                console.error('\x1b[31m[MESSAGE HANDLER ERROR]\x1b[0m', err.message);
            }
        });

        this.sock.ev.on('messages.update', async (updates) => {
            try {
                for (const update of updates) {
                    if (update.update.message === null || update.update.messageStubType === 1) {
                        const plugin = global.plugins.get('antidelete');
                        if (plugin && plugin.onDelete) {
                            await plugin.onDelete(this.sock, update).catch(() => {});
                        }
                    }
                }
            } catch (e) {}
        });
    }
}

// ================= SAFE PLUGIN LOADER =================
const EXCLUDED_PLUGINS = ['otp-forward.js', 'numpanel.js'];

async function loadAllPlugins() {
    const pluginsDir = path.join(process.cwd(), 'plugins');
    if (!fs.existsSync(pluginsDir)) return;

    const files = fs.readdirSync(pluginsDir).filter(file => file.endsWith('.js'));
    for (const file of files) {
        if (EXCLUDED_PLUGINS.includes(file)) continue;
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

// ================= WEB SERVER =================
const app = express();
app.use(express.json());

app.get('/', (req, res) => {
    res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>HACKER-MD Pairing</title>
        <style>
            body { background-color: #0d1117; color: #00ff00; font-family: 'Courier New', Courier, monospace; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; }
            .container { background: #161b22; padding: 30px; border-radius: 10px; border: 1px solid #00ff00; box-shadow: 0 0 15px #00ff00; text-align: center; width: 90%; max-width: 400px; }
            h1 { margin-top: 0; font-size: 24px; text-shadow: 0 0 10px #00ff00; }
            input { width: 90%; padding: 10px; margin: 15px 0; background: #0d1117; border: 1px solid #00ff00; color: #00ff00; font-size: 16px; outline: none; }
            button { background: #00ff00; color: #0d1117; border: none; padding: 10px 20px; font-size: 16px; cursor: pointer; font-weight: bold; width: 100%; }
            button:hover { background: #00cc00; }
            #code-box { margin-top: 20px; font-size: 28px; font-weight: bold; color: #fff; text-shadow: 0 0 10px #fff; letter-spacing: 5px; display: none; }
            #status { margin-top: 15px; font-size: 14px; color: #888; }
        </style>
    </head>
    <body>
        <div class="container">
            <h1>HACKER-MD</h1>
            <p>Enter bot's WhatsApp number</p>
            <input type="text" id="number" placeholder="e.g. 923001234567">
            <button onclick="getCode()">Get Pairing Code</button>
            <div id="code-box"></div>
            <div id="status"></div>
        </div>

        <script>
            async function getCode() {
                const number = document.getElementById('number').value;
                if(!number) return alert('Please enter a number!');
                
                document.getElementById('status').innerText = 'Generating code (Clearing old session)...';
                document.getElementById('code-box').style.display = 'none';

                try {
                    const res = await fetch('/api/pair', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ number: number })
                    });
                    const data = await res.json();
                    
                    if(data.code) {
                        document.getElementById('code-box').innerText = data.code;
                        document.getElementById('code-box').style.display = 'block';
                        document.getElementById('status').innerText = 'Enter this code in WhatsApp (Linked Devices).';
                    } else {
                        document.getElementById('status').innerText = 'Error: ' + (data.error || 'Unknown error');
                    }
                } catch (err) {
                    document.getElementById('status').innerText = 'Failed to connect to server.';
                }
            }
        </script>
    </body>
    </html>
    `);
});

app.post('/api/pair', async (req, res) => {
    const { number } = req.body;
    if (!number) return res.status(400).json({ error: 'Number is required' });

    const cleanNumber = number.replace(/[^0-9]/g, '');
    const sessionPath = path.join(config.sessionDir, `session_${cleanNumber}`);

    try {
        // Agar pehle se bot chal raha hai, toh usko disconnect karein
        if (global.botInstances.has(cleanNumber)) {
            const oldBot = global.botInstances.get(cleanNumber);
            if (oldBot.sock) oldBot.sock.end(undefined);
            global.botInstances.delete(cleanNumber);
        }

        // Purana kharab session delete karein taake Bad MAC error na aaye
        if (fs.existsSync(sessionPath)) {
            fs.rmSync(sessionPath, { recursive: true, force: true });
            console.log(`\x1b[33m[SESSION] Cleared old session for ${cleanNumber}\x1b[0m`);
        }

        const client = new BotClient(cleanNumber);
        await client.initialize();
        const code = await client.requestPairingCode();
        res.json({ code: code });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/health', (req, res) => res.status(200).send('OK'));

// ================= MAIN ENGINE START =================
(async () => {
    displayBanner();
    await loadAllPlugins();

    app.listen(config.port, () => {
        console.log(`\n\x1b[32m[WEB SERVER] Hacker Page running on port ${config.port}\x1b[0m`);
    });

    // Agar env mein number pehle se hai, toh auto connect hoga
    if (config.pairNumbers && config.pairNumbers.length > 0) {
        for (const number of config.pairNumbers) {
            const client = new BotClient(number);
            await client.initialize().catch(err => console.error("Startup Connect Error:", err.message));
            await delay(2000);
        }
    }
})();
