export default {
    command: 'ping',
    category: 'system',
    description: 'Check bot response speed',
    async execute(sock, msg, args, config) {
        const start = Date.now();
        const sent = await sock.sendMessage(msg.key.remoteJid, { text: '🏓 Pinging...' });
        const end = Date.now();
        const latency = end - start;

        await sock.sendMessage(msg.key.remoteJid, { 
            text: `🚀 *PONG!*\n\n⚡ *Speed:* ${latency}ms\n🤖 *Bot:* ${config.botName}\n✅ *Status:* Online`, 
            edit: sent.key 
        });
    }
}
