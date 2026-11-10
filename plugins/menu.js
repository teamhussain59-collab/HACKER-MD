export default {
    command: 'menu',
    category: 'system',
    description: 'Show bot commands menu',
    async execute(sock, msg, args, config) {
        const time = new Date().toLocaleTimeString('en-US', { timeZone: config.tz, hour12: true });
        const date = new Date().toLocaleDateString('en-GB', { timeZone: config.tz });
        const channelUrl = 'https://whatsapp.com/channel/0029Vb9FRVV8F2pDezlyrD0q';
        
        // Yahan apni image ka GitHub Raw Link dalein
        const imageUrl = 'https://files.catbox.moe/jejz5q.jpg'; // (Yeh temporary hai, apna GitHub link lagayein)

        const menuText = `
╭━━━〔 *${config.botName}* 〕━━━⬣
┃ 👑 *Owner:* Hussain
┃ 🚀 *Bot:* HACKER-MD V1
┃ 📡 *Mode:* ${config.mode}
┃ ⏰ *Time:* ${time}
┃ 📅 *Date:* ${date}
┃ 🧩 *Prefix:* [ ${config.prefix} ]
┃ 📜 *Total Cmds:* 150+
╰━━━━━━━━━━━━━━━━━━⬣

╭━━━〔 *SYSTEM* 〕━━━⬣
┃ ⚡ ${config.prefix}ping
┃ 📜 ${config.prefix}menu
┃ 👤 ${config.prefix}owner
┃ 🔗 ${config.prefix}pair
┃ 🔄 ${config.prefix}restart
┃ 📊 ${config.prefix}status
┃ 🕒 ${config.prefix}uptime
╰━━━━━━━━━━━━━━━━━━⬣

╭━━━〔 *DOWNLOADER* 〕━━━⬣
┃ 🎵 ${config.prefix}play <song>
┃ 🎬 ${config.prefix}video <url>
┃ 📥 ${config.prefix}tt <url>
┃ 📸 ${config.prefix}insta <url>
┃ 📘 ${config.prefix}fb <url>
┃ 🎧 ${config.prefix}song <spotify>
┃ 🐦 ${config.prefix}twitter <url>
┃ 📌 ${config.prefix}pinterest <url>
┃ 👁️ ${config.prefix}vv (View Once)
┃ 💾 ${config.prefix}sv (Save Status)
╰━━━━━━━━━━━━━━━━━━⬣

╭━━━〔 *AI & GPT* 〕━━━⬣
┃ 🤖 ${config.prefix}ai <text>
┃ 💬 ${config.prefix}gpt <text>
┃ 🎨 ${config.prefix}imagine <prompt>
┃ 🧠 ${config.prefix}gemini <text>
╰━━━━━━━━━━━━━━━━━━⬣

╭━━━〔 *TOOLS & UTILS* 〕━━━⬣
┃ 🌤️ ${config.prefix}weather
┃ 📖 ${config.prefix}wiki
┃ 🌐 ${config.prefix}translate
┃ 🎤 ${config.prefix}lyrics
┃ 🔋 ${config.prefix}battery
┃ 📱 ${config.prefix}qrcode
┃ 🔗 ${config.prefix}shorturl
┃ 💵 ${config.prefix}currency
┃ 🕋 ${config.prefix}prayer
┃ 🎭 ${config.prefix}rch <url>
╰━━━━━━━━━━━━━━━━━━⬣

╭━━━〔 *FUN & PRANK* 〕━━━⬣
┃ 😂 ${config.prefix}joke
┃ 📝 ${config.prefix}quote
┃ 🧠 ${config.prefix}fact
┃ 💻 ${config.prefix}hack
┃ 🎮 ${config.prefix}truth
┃ 🎯 ${config.prefix}dare
┃ 🎲 ${config.prefix}dice
┃ 🎱 ${config.prefix}8ball
╰━━━━━━━━━━━━━━━━━━⬣

╭━━━〔 *GROUP ADMIN* 〕━━━⬣
┃ 🏷️ ${config.prefix}tagall
┃ 👻 ${config.prefix}hidetag
┃ 👢 ${config.prefix}kick
┃ ➕ ${config.prefix}add
┃ ⬆️ ${config.prefix}promote
┃ ⬇️ ${config.prefix}demote
┃ 🔗 ${config.prefix}antilink
┃ 🔓 ${config.prefix}open
┃ 🔒 ${config.prefix}close
┃ 👋 ${config.prefix}welcome
┃ 🚪 ${config.prefix}goodbye
╰━━━━━━━━━━━━━━━━━━⬣

╭━━━〔 *CONVERTER* 〕━━━⬣
┃ 🖼️ ${config.prefix}sticker
┃ 🔄 ${config.prefix}toimg
┃ 🎞️ ${config.prefix}tovideo
┃ 🎙️ ${config.prefix}voice
┃ 🔉 ${config.prefix}tomp3
╰━━━━━━━━━━━━━━━━━━⬣

╭━━━〔 *ISLAMIC* 〕━━━⬣
┃ 📖 ${config.prefix}quran
┃ 🕌 ${config.prefix}hadith
┃ 📿 ${config.prefix}tasbih
┃ ☪️ ${config.prefix}allah
╰━━━━━━━━━━━━━━━━━━⬣

╭━━━〔 *ANIME* 〕━━━⬣
┃ 🌸 ${config.prefix}anime
┃ 🦊 ${config.prefix}waifu
┃ 🐱 ${config.prefix}neko
╰━━━━━━━━━━━━━━━━━━⬣

> *Powered by HACKER-MD Engine ⚡*
> *Total 150+ Commands Loaded...*
`;

        try {
            // Image ke sath bhejne ki koshish
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
            // Agar image 404 de toh bina image ke text bhej de
            console.log('Image load nahi hui, text bhej rahe hain...');
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
