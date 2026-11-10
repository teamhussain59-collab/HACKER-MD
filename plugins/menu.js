export default {
    command: 'menu',
    category: 'system',
    description: 'Show bot commands menu',
    async execute(sock, msg, args, config) {
        const time = new Date().toLocaleTimeString('en-US', { timeZone: config.tz, hour12: true });
        const date = new Date().toLocaleDateString('en-GB', { timeZone: config.tz });
        const channelUrl = 'https://whatsapp.com/channel/0029Vb9FRVV8F2pDezlyrD0q';
        
        // Yahan apni image ka permanent link dalein (Filhal maine ek placeholder lagaya hai)
        const imageUrl = 'https://i.ibb.co/6PZk1Z5/hacker.jpg';

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

╭━━━〔 *DOWNLOADER* 〕━━━⬣
┃ 🎵 ${config.prefix}play <song>
┃ 🎬 ${config.prefix}ytmp4 <url>
┃ 📥 ${config.prefix}tt <url>
┃ 📸 ${config.prefix}insta <url>
┃ 📘 ${config.prefix}fb <url>
┃ 🎧 ${config.prefix}spotify <url>
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

        try {
            // Pehle try karega image ke sath bhejne ki
            await sock.sendMessage(msg.key.remoteJid, {
                image: { url: imageUrl },
                caption: menuText,
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
        } catch (error) {
            // Agar image download fail ho jaye (404), toh sirf text bhej dega
            console.log('Image load nahi hui, sirf text bhej rahe hain...');
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
}
