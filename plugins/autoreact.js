import fs from 'fs';
import path from 'path';

// Data folder mein auto-react ki state save karne ke liye
const dataFile = path.join(process.cwd(), 'data', 'autoreact.json');

const getState = () => {
    if (!fs.existsSync(dataFile)) return { enabled: false, emojis: ['❤️', '🔥', '👍', '😂', '😮', '💯', '⚡'] };
    return JSON.parse(fs.readFileSync(dataFile, 'utf-8'));
};

const saveState = (state) => {
    fs.writeFileSync(dataFile, JSON.stringify(state, null, 2));
};

export default {
    command: 'autoreact',
    category: 'system',
    description: 'Toggle auto reaction on messages',
    async execute(sock, msg, args, config) {
        const state = getState();
        const action = args[0]?.toLowerCase();

        if (action === 'on') {
            state.enabled = true;
            saveState(state);
            await sock.sendMessage(msg.key.remoteJid, { text: '✅ *Auto-React Enabled!* Ab bot har message par react karega.' }, { quoted: msg });
        } else if (action === 'off') {
            state.enabled = false;
            saveState(state);
            await sock.sendMessage(msg.key.remoteJid, { text: '❌ *Auto-React Disabled!*' }, { quoted: msg });
        } else {
            await sock.sendMessage(msg.key.remoteJid, { text: `⚙️ *Usage:* ${config.prefix}autoreact on/off` }, { quoted: msg });
        }
    },
    // Yeh function main.js se trigger hoga
    async onMessage(sock, msg) {
        const state = getState();
        if (!state.enabled) return;
        
        const randomEmoji = state.emojis[Math.floor(Math.random() * state.emojis.length)];
        try {
            await sock.sendMessage(msg.key.remoteJid, { react: { text: randomEmoji, key: msg.key } });
        } catch (e) {
            // Ignore errors
        }
    }
};
