export default {
    command: 'ping',
    category: 'system',
    description: 'Check bot response speed and uptime',
    async execute(sock, msg, args, config) {
        const start = Date.now();
        
        // Pehla stylish message bhejna
        const sent = await sock.sendMessage(msg.key.remoteJid, { 
            text: '⚡ *Testing HACKER-MD Speed...*' 
        }, { quoted: msg });

        const end = Date.now();
        const latency = end - start;

        // Bot ki uptime calculate karna
        const uptimeSeconds = process.uptime();
        const hours = Math.floor(uptimeSeconds / 3600);
        const minutes = Math.floor((uptimeSeconds % 3600) / 60);
        const seconds = Math.floor(uptimeSeconds % 60);
        const uptimeString = `${hours}h ${minutes}m ${seconds}s`;

        // Stylish Reply Format
        const pingText = `
╭━━━〔 ⚡ *PING STATUS* ⚡ 〕━━━⬣
┃ 🚀 *Speed:* ${latency} ms
┃ ⏱️ *Uptime:* ${uptimeString}
┃ 🟢 *Status:* Online & Active
┃ 🤖 *Engine:* Baileys v6
┃ 👑 *Bot:* ${config.botName}
╰━━━━━━━━━━━━━━━━━━⬣

> *HACKER-MD is running at full power!*`;

        // Pehle wale message ko edit kar ke stylish text lagana
        await sock.sendMessage(msg.key.remoteJid, { 
            text: pingText, 
            edit: sent.key 
        });
    }
}
