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

process.on('uncaughtException', (err) => console.error('\x1b[31m[ANTI-CRASH] Exception:\x1b[0m', err.message));
process.on('unhandledRejection', (reason) => console.error('\x1b[31m[ANTI-CRASH] Rejection:\x1b[0m', reason));

const displayBanner = () => {
    console.log('\x1b[36m%s\x1b[0m', `
    ██████╗ ██████╗  ██████╗ ███████╗ █████╗  ██████╗██╗  ██╗███╗   ██╗███████╗██╗     
    ██╔══██╗██╔══██╗██╔═══██╗██╔════╝██╔══██╗██╔════╝██║  ██║████╗  ██║██╔════╝██║     
    ██████╔╝██████╔╝██║   ██║█████╗  ███████║██║     ███████║██╔██╗ ██║█████╗  ██║     
    ██╔═══╝ ██╔══██╗██║   ██║██╔══╝  ██╔══██║██║     ██╔══██║██║╚██╗██║██╔══╝  ██║     
    ██║     ██║  ██║╚██████╔╝██║     ██║  ██║╚██████╗██║  ██║██║ ╚████║███████╗███████╗
    ╚═╝     ╚═╝  ╚═╝ ╚═════╝ ╚═╝     ╚═╝  ╚═╝ ╚═════╝╚═╝  ╚═╝╚═╝  ╚═══╝╚══════╝╚══════╝
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
            getMessage: async (key) => {
                if (global.messageCache.has(key.id)) return global.messageCache.get(key.id).media;
                return { conversation: 'PROFACHNEL' };
            }
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
                const shouldReconnect = lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut;
                if (shouldReconnect) {
                    await delay(5000);
                    this.initialize().catch(() => {});
                }
            } else if (connection === 'open') {
                console.log(`\n\x1b[32m[✅ ${this.phoneNumber}] PROFACHNEL CONNECTED SUCCESSFULLY!\x1b[0m\n`);
                
                await delay(2000);
                try {
                    const botId = this.sock.user.id;
                    const welcomeText = `✅ *PROFACHNEL IS ONLINE!*\n\nBot successfully connected to your WhatsApp.\nType ${config.prefix}menu to start.`;
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
                if (global.messageCache.size > 500) global.messageCache.delete(global.messageCache.keys().next().value);

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

// ================= PROFACHNEL WEB SERVER & PAIRING PAGE =================
const app = express();
app.use(express.json());

app.get('/', (req, res) => {
    res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>PROFACHNEL Pairing</title>
        <style>
            body { background-color: #0a0a0a; color: #00ffcc; font-family: 'Courier New', Courier, monospace; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; }
            .container { background: #121212; padding: 30px; border-radius: 10px; border: 1px solid #00ffcc; box-shadow: 0 0 20px rgba(0,255,204,0.2); text-align: center; width: 90%; max-width: 400px; }
            h1 { margin-top: 0; font-size: 26px; text-shadow: 0 0 10px #00ffcc; letter-spacing: 2px;}
            p { color: #888; font-size: 14px; }
            input { width: 90%; padding: 12px; margin: 10px 0; background: #1a1a1a; border: 1px solid #00ffcc; color: #00ffcc; font-size: 16px; outline: none; border-radius: 5px; }
            button { background: #00ffcc; color: #000; border: none; padding: 12px 20px; font-size: 16px; cursor: pointer; font-weight: bold; width: 100%; border-radius: 5px; transition: 0.3s; }
            button:hover { background: #00cca3; }
            #code-box { margin-top: 20px; font-size: 28px; font-weight: bold; color: #fff; text-shadow: 0 0 10px #fff; letter-spacing: 5px; display: none; padding: 15px; border: 1px dashed #00ffcc; border-radius: 5px;}
            #status { margin-top: 15px; font-size: 14px; color: #ffaa00; }
        </style>
    </head>
    <body>
        <div class="container">
            <h1>PROFACHNEL</h1>
            <p>Enter Password to unlock</p>
            <input type="password" id="password" placeholder="Admin Password">
            <button onclick="unlock()">Unlock Page</button>
            
            <div id="pair-section" style="display:none; margin-top:20px;">
                <p>Enter bot's WhatsApp number</p>
                <input type="text" id="number" placeholder="e.g. 923001234567">
                <button onclick="getCode()">Get Pairing Code</button>
            </div>

            <div id="code-box"></div>
            <div id="status"></div>
        </div>

        <script>
            let adminPass = "";

            function unlock() {
                adminPass = document.getElementById('password').value;
                if(!adminPass) return alert('Enter Password!');
                document.getElementById('pair-section').style.display = 'block';
                document.getElementById('status').innerText = 'Page Unlocked.';
            }

            async function getCode() {
                const number = document.getElementById('number').value;
                if(!number) return alert('Please enter a number!');
                
                document.getElementById('status').innerText = 'Generating code...';
                document.getElementById('code-box').style.display = 'none';

                try {
                    const res = await fetch('/api/pair', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ number: number, password: adminPass })
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
    const { number, password } = req.body;
    
    // Password Check
    if (password !== config.adminPassword) {
        return res.status(401).json({ error: 'Invalid Password' });
    }
    if (!number) return res.status(400).json({ error: 'Number is required' });

    const cleanNumber = number.replace(/[^0-9]/g, '');
    const sessionPath = path.join(config.sessionDir, `session_${cleanNumber}`);

    try {
        if (fs.existsSync(sessionPath)) {
            fs.rmSync(sessionPath, { recursive: true, force: true });
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
        console.log(`\n\x1b[32m[WEB SERVER] PROFACHNEL running on port ${config.port}\x1b[0m`);
    });

    // Agar Railway mein PAIR_NUMBERS set hai toh auto connect karega
    if (config.pairNumbers.length > 0) {
        for (const number of config.pairNumbers) {
            if(number) {
                const client = new BotClient(number);
                await client.initialize().catch(err => console.error(err.message));
                await delay(2000);
            }
        }
    }
})();
