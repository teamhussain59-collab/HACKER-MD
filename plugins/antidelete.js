// Global cache banate hain taake message yaad rahe
if (!global.messageCache) global.messageCache = new Map();

export default {
    command: 'antidelete',
    category: 'system',
    description: 'Toggle anti-delete feature',
    async execute(sock, msg, args, config) {
        const action = args[0]?.toLowerCase();
        if (!global.antiDeleteStatus) global.antiDeleteStatus = false;

        if (action === 'on') {
            global.antiDeleteStatus = true;
            await sock.sendMessage(msg.key.remoteJid, { text: '✅ *Anti-Delete Enabled!*' }, { quoted: msg });
        } else if (action === 'off') {
            global.antiDeleteStatus = false;
            await sock.sendMessage(msg.key.remoteJid, { text: '❌ *Anti-Delete Disabled!*' }, { quoted: msg });
        } else {
            await sock.sendMessage(msg.key.remoteJid, { text: `⚙️ *Usage:* ${config.prefix}antidelete on/off` }, { quoted: msg });
        }
    },
    
    // Function jo main.js se call hoga jab message delete ho
    async onDelete(sock, update) {
        if (!global.antiDeleteStatus) return;
        
        const key = update.key;
        const cachedMsg = global.messageCache.get(key.id);
        
        if (cachedMsg) {
            const sender = key.participant || key.remoteJid;
            const text = `🚨 *ANTI-DELETE DETECTED!*\n\n👤 *Sender:* @${sender.split('@')[0]}\n💬 *Message:* ${cachedMsg.text || 'Media'}`;
            
            await sock.sendMessage(key.remoteJid, { text: text, mentions: [sender] });
            
            // Agar message media tha (image/video), toh use bhi bhej dein
            if (cachedMsg.media) {
                await sock.sendMessage(key.remoteJid, { forward: cachedMsg.media, force: true });
            }
        }
    }
};
