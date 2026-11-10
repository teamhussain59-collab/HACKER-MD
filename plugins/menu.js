export default {
    command: 'menu',
    category: 'system',
    description: 'Show bot commands menu',
    async execute(sock, msg, args, config) {
        const time = new Date().toLocaleTimeString('en-US', { timeZone: config.tz, hour12: true });
        const date = new Date().toLocaleDateString('en-GB', { timeZone: config.tz });
        const channelUrl = 'https://whatsapp.com/channel/0029Vb9FRVV8F2pDezlyrD0q';
        
        // Aap ki README wali picture ka link
        const imageUrl = 'https://n.uguu.se/mthRRtqg.jpg';

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
┃ 🎨 ${config.prefix}dalle <prompt>
╰━━━━━━━━━━━━━━━━━━⬣

╭━━━〔 *DOWNLOADER* 〕━━━⬣
┃ 🎵 ${config.prefix}play <song>
┃ 🎬 ${config.prefix}ytmp4 <url>
┃ 📥 ${config.prefix}tt <url>
┃ 📸 ${config.prefix}insta <url>
┃ 📘 ${config.prefix}fb <url>
┃ 🐦 ${config.prefix}twitter <url>
┃ 🎧 ${config.prefix}spotify <url>
┃ 👁️ ${config.prefix}vv (View Once)
┃ 💾 ${config.prefix}sv (Save Status)
╰━━━━━━━━━━━━━━━━━━⬣

╭━━━〔 *STICKER & CONVERT* 〕━━━⬣
┃ 🖼️ ${config.prefix}sticker
┃ 🔄 ${config.prefix}toimg
┃ 🎞️ ${config.prefix}v2 (Video to Audio)
┃ 🎭 ${config.prefix}emojimix
┃ ✨ ${config.prefix}take
╰━━━━━━━━━━━━━━━━━━⬣

╭━━━〔 *TOOLS & UTILS* 〕━━━⬣
┃ 🌤️ ${config.prefix}weather <city>
┃ 🎤 ${config.prefix}lyrics <song>
┃ 📖 ${config.prefix}wiki <query>
┃ 🌐 ${config.prefix}translate <lang>
┃ 💵 ${config.prefix}currency
┃ 🔗 ${config.prefix}shorturl <url>
┃ 📱 ${config.prefix}qrcode <text>
┃ 🕋 ${config.prefix}prayer <city>
┃ 🌍 ${config.prefix}country <name>
╰━━━━━━━━━━━━━━━━━━⬣

╭━━━〔 *GROUP & ADMIN* 〕━━━⬣
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
┃ 📩 ${config.prefix}invite
╰━━━━━━━━━━━━━━━━━━⬣

╭━━━〔 *FUN & GAMES* 〕━━━⬣
┃ 😂 ${config.prefix}joke
┃ 📝 ${config.prefix}quote
┃ 🧠 ${config.prefix}fact
┃ 🖼️ ${config.prefix}meme
┃ 🎮 ${config.prefix}truth
┃ 🎯 ${config.prefix}dare
╰━━━━━━━━━━━━━━━━━━⬣

╭━━━〔 *ANIME & LOGO* 〕━━━⬣
┃ 🌸 ${config.prefix}anime
┃ 🦊 ${config.prefix}waifu
┃ 🎨 ${config.prefix}textpro
┃ 🖌️ ${config.prefix}logo
┃ 🔮 ${config.prefix}neon
╰━━━━━━━━━━━━━━━━━━⬣

╭━━━〔 *ISLAMIC* 〕━━━⬣
┃ 📖 ${config.prefix}quran
┃ 🕌 ${config.prefix}hadith
┃ 📿 ${config.prefix}tasbih
╰━━━━━━━━━━━━━━━━━━⬣

> *Powered by HACKER-MD Engine ⚡*
> *Stay tuned for more updates...*
`;

        // Menu ko image ke sath send karna
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
    }
}
