export default {
    command: 'menu',
    category: 'system',
    description: 'Show bot commands menu',
    async execute(sock, msg, args, config) {
        const time = new Date().toLocaleTimeString('en-US', { timeZone: config.tz, hour12: true });
        const date = new Date().toLocaleDateString('en-GB', { timeZone: config.tz });

        const menuText = `
╭━━━〔 *${config.botName}* 〕━━━⬣
┃ 👑 *Owner:* Hussain
┃ 📡 *Mode:* ${config.mode}
┃ ⏰ *Time:* ${time}
┃ 📅 *Date:* ${date}
╰━━━━━━━━━━━━━━━━━━⬣

╭━━━〔 *SYSTEM MENU* 〕━━━⬣
┃ ⚡ *${config.prefix}ping*
┃ 📜 *${config.prefix}menu*
╰━━━━━━━━━━━━━━━━━━⬣

> *Powered by HACKER-MD Engine*
`;

        await sock.sendMessage(msg.key.remoteJid, { text: menuText }, { quoted: msg });
    }
}
