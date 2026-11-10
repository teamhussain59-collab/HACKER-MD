import makeWASocket, {
    useMultiFileAuthState,
    DisconnectReason,
    fetchLatestBaileysVersion,
    makeCacheableSignalKeyStore,
    Browsers,
    delay
} from '@whiskeysockets/baileys';
import express from 'express';
import pino from 'pino';
import fs from 'fs';
import path from 'path';
import { config } from './config.js';

// ================= GLOBAL VARIABLES =================
global.sock = null;
global.plugins = new Map();
let pairingCode = null;

// ================= WEB SERVER (RAILWAY) =================
const app = express();
app.use(express.json());
app.get('/health', (req, res) => res.status(200).send({ status: 'HACKER-MD is alive', uptime: process.uptime() }));
app.get('/pair', (req, res) => {
    if (!pairingCode) return res.status(400).send({ error: 'Code not ready or already paired.' });
    res.send({ code: pairingCode });
});
app.listen(config.port, () => {
    console.log(`[WEB] Express server running on port ${config.port}`);
});

// ================= ASCII BANNER =================
console.log(`
\x1b[32m=============================================
   _   _    _    ____ _  _______ ____    ____  
  | | | |  / \  / ___| |/ / ____|  _ \  |  _ \ 
  | |_| | / _ \| |   | ' /|  _| | |_) | | | | |
  |  _  |/ ___ \ |___| . \| |___|  _ <  | |_| |
  |_| |_/_/   \_\____|_|\_\_____|_| \_\ |____/ 
                                              
  >> HACKER-MD Professional WhatsApp Bot <<
  >> Created for: ${config.owner || 'Hussain'} <<
=============================================\x1b[0m
`);

// ================= PLUGIN LOADER =================
const pluginsDir = path.join(process.cwd(), 'plugins');
if (!fs.existsSync(pluginsDir)) fs.mkdirSync(pluginsDir, { recursive: true });

async function loadPlugins() {
    const files = fs.readdirSync(pluginsDir).filter(file => file.endsWith('.js'));
    for (const file of files) {
        try {
            const module = await import(`./plugins/${file}`);
            if (module.default && module.default.command) {
                global.plugins.set(module.default.command.toLowerCase(), module.default);
                console.log(`[PLUGIN] Loaded: ${module.default.command}`);
            }
        } catch (err) {
            console.error(`[PLUGIN ERROR] Failed to load ${file}:`, err.message);
        }
    }
}

// ================= WHATSAPP CONNECTION =================
async function connectToWhatsApp() {
    const { state, saveCreds } = await useMultiFileAuthState(config.sessionDir);
    const { version } = await fetchLatestBaileysVersion();
    const logger = pino({ level: 'silent' });

    global.sock = makeWASocket({
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

    // Pairing Code Generation
    if (!global.sock.authState.creds.registered && config.pairNumber) {
        await delay(3000);
        try {
            pairingCode = await global.sock.requestPairingCode(config.pairNumber);
            console.log(`\n\x1b[33m[PAIRING CODE]: \x1b[1m${pairingCode}\x1b[0m\n`);
        } catch (error) {
            console.error('[ERROR] Pairing failed:', error.message);
        }
    }

    global.sock.ev.on('creds.update', saveCreds);

    // Connection Updates
    global.sock.ev.on('connection.update', async (update) => {
        const { connection, lastDisconnect } = update;
        
        if (connection === 'close') {
            const statusCode = lastDisconnect?.error?.output?.statusCode;
            const shouldReconnect = statusCode !== DisconnectReason.loggedOut;
            
            console.log(`\x1b[31m[CONNECTION] Closed (Code: ${statusCode}). Reconnecting: ${shouldReconnect}\x1b[0m`);
            
            if (shouldReconnect) {
                await delay(3000);
                connectToWhatsApp();
            } else {
                console.log('\x1b[31m[CONNECTION] Logged out. Delete session folder to pair again.\x1b[0m');
            }
        } else if (connection === 'open') {
            console.log('\x1b[32m[CONNECTION] HACKER-MD Connected to WhatsApp Successfully!\x1b[0m');
            pairingCode = null;
            
            // Set bot presence to online
            await global.sock.sendPresenceUpdate('available');
        }
    });

    // Message Handler (Pro Level)
    global.sock.ev.on('messages.upsert', async (chatUpdate) => {
        try {
            const msg = chatUpdate.messages[0];
            if (!msg.message || msg.key.fromMe) return;
            if (msg.key.remoteJid === 'status@broadcast') return;

            // Auto Read & Auto Typing (Pro Features)
            if (config.mode === 'public') {
                await global.sock.readMessages([msg.key]);
                await global.sock.sendPresenceUpdate('composing', msg.key.remoteJid);
            }

            const type = Object.keys(msg.message)[0];
            const body = (type === 'conversation') ? msg.message.conversation 
                       : (type === 'extendedTextMessage') ? msg.message.extendedTextMessage.text 
                       : '';

            if (!body.startsWith(config.prefix)) return;

            const args = body.slice(config.prefix.length).trim().split(/ +/);
            const commandName = args.shift().toLowerCase();
            
            // Execute Plugin
            const plugin = global.plugins.get(commandName);
            if (plugin) {
                await plugin.execute(global.sock, msg, args, config);
            }
        } catch (error) {
            console.error('[MESSAGE ERROR]', error);
        }
    });
}

// ================= START ENGINE =================
(async () => {
    await loadPlugins();
    await connectToWhatsApp();
})();
