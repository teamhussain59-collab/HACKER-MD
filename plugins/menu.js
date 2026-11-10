export default {
    command: 'menu',
    category: 'system',
    description: 'Show bot commands menu',
    async execute(sock, msg, args, config) {
        const time = new Date().toLocaleTimeString('en-US', { timeZone: config.tz, hour12: true });
        const date = new Date().toLocaleDateString('en-GB', { timeZone: config.tz });
        const channelUrl = 'https://whatsapp.com/channel/0029Vb9FRVV8F2pDezlyrD0q';

        const menuText = `
╭━━━〔 *${config.botName}* 〕━━━⬣
┃ 👑 *Owner:* Hussain
┃ 🚀 *Bot:* HACKER-MD V1
┃ 📡 *Mode:* ${config.mode}
┃ ⏰ *Time:* ${time}
┃ 📅 *Date:* ${date}
┃ 🧩 *Prefix:* [ ${config.prefix} ]
╰━━━━━━━━━━━━━━━━━━⬣

╭━━━〔 *SYSTEM MENU* 〕━━━⬣
┃ ⚡ ${config.prefix}ping
┃ 📜 ${config.prefix}menu
┃ 👤 ${config.prefix}owner
┃ 🔗 ${config.prefix}pair
┃ 🔄 ${config.prefix}restart
┃ 📊 ${config.prefix}status
╰━━━━━━━━━━━━━━━━━━⬣

╭━━━〔 *AI & GPT* 〕━━━⬣
┃ 🤖 ${config.prefix}ai <text>
┃ 💬 ${config.prefix}gpt <text>
╰━━━━━━━━━━━━━━━━━━⬣

╭━━━〔 *DOWNLOADER* 〕━━━⬣
┃ 🎵 ${config.prefix}play <song>
┃ 🎬 ${config.prefix}ytmp4 <url>
┃ 📥 ${config.prefix}tt <url>
┃ 📸 ${config.prefix}insta <url>
┃ 📘 ${config.prefix}fb <url>
┃ 🎧 ${config.prefix}song <spotify>
┃ 👁️ ${config.prefix}vv (View Once)
┃ 💾 ${config.prefix}sv (Save Status)
╰━━━━━━━━━━━━━━━━━━⬣

╭━━━〔 *TOOLS & FUN* 〕━━━⬣
┃ 🌤️ ${config.prefix}weather
┃ 😂 ${config.prefix}joke
┃ 🧠 ${config.prefix}fact
┃ 💻 ${config.prefix}hack
┃ 🎭 ${config.prefix}rch <url>
┃ 🔋 ${config.prefix}battery
┃ 🎙️ ${config.prefix}voice
╰━━━━━━━━━━━━━━━━━━⬣

╭━━━〔 *GROUP ADMIN* 〕━━━⬣
┃ 🏷️ ${config.prefix}tagall
┃ 👻 ${config.prefix}hidetag
┃ 👢 ${config.prefix}kick
┃ ➕ ${config.prefix}add
┃ ⬆️ ${config.prefix}promote
┃ ⬇️ ${config.prefix}demote
╰━━━━━━━━━━━━━━━━━━⬣

> *Powered by HACKER-MD Engine ⚡*
`;

        // Bina image ke direct text bhejna, taake koi 404 error na aaye
        await sock.sendMessage(msg.key.remoteJid, {
            text: menuText,
            contextInfo: {
                forwardingScore: 999,
                isForwarded: true,
                externalAdReply: {
                    title: "HACKER-MD OFFICIAL CHANNEL",
                    body: "Tap to join for latest updates!",
                    mediaType: 1,
                    sourceUrl: channelUrl
                }
            }
        }, { quoted: msg });
    }
}
