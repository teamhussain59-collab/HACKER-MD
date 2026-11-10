import axios from 'axios';

export default {
    command: 'play', 
    aliases: ['song', 'ytmp3', 'video', 'ytmp4', 'tt', 'tiktok', 'ig', 'insta', 'fb', 'pinterest', 'pin'],
    category: 'downloader',
    description: 'Download media from various platforms',
    async execute(sock, msg, args, config) {
        const text = msg.message.conversation || msg.message.extendedTextMessage?.text || '';
        const cmd = text.slice(config.prefix.length).trim().split(/ +/)[0].toLowerCase();
        const query = args.join(' ');

        if (!query) {
            return await sock.sendMessage(msg.key.remoteJid, { text: `❌ *Usage:* ${config.prefix}${cmd} <url ya song ka naam>` }, { quoted: msg });
        }

        await sock.sendMessage(msg.key.remoteJid, { text: `⏳ *Processing...* (${cmd})` }, { quoted: msg });

        try {
            let url = query;
            let isAudio = ['play', 'song', 'ytmp3', 'mp3'].includes(cmd);

            // 1. YOUTUBE (Audio & Video)
            if (isAudio && !query.includes('http')) {
                const res = await axios.get(`https://api.vreden.my.id/api/ytplaymp3?query=${encodeURIComponent(query)}`);
                const result = res.data.result;
                await sock.sendMessage(msg.key.remoteJid, { 
                    audio: { url: result.downloadUrl }, 
                    mimetype: 'audio/mp4',
                    fileName: `${result.title}.mp3`
                }, { quoted: msg });
            } 
            else if (cmd === 'video' || cmd === 'ytmp4' || cmd === 'mp4') {
                const res = await axios.get(`https://api.vreden.my.id/api/ytplaymp4?query=${encodeURIComponent(query)}`);
                const result = res.data.result;
                await sock.sendMessage(msg.key.remoteJid, { 
                    video: { url: result.downloadUrl }, 
                    caption: `✅ *${result.title}*\n\n> Downloaded by HACKER-MD` 
                }, { quoted: msg });
            }

            // 2. TIKTOK
            else if (cmd === 'tt' || cmd === 'tiktok') {
                const res = await axios.get(`https://api.vreden.my.id/api/tiktok?url=${encodeURIComponent(url)}`);
                const videoUrl = res.data.result.video;
                await sock.sendMessage(msg.key.remoteJid, { 
                    video: { url: videoUrl }, 
                    caption: `✅ *TikTok Video Downloaded*\n\n> HACKER-MD` 
                }, { quoted: msg });
            } 
            
            // 3. INSTAGRAM
            else if (cmd === 'ig' || cmd === 'insta') {
                const res = await axios.get(`https://api.vreden.my.id/api/igdl?url=${encodeURIComponent(url)}`);
                const mediaUrl = res.data.result[0].url;
                await sock.sendMessage(msg.key.remoteJid, { 
                    video: { url: mediaUrl }, 
                    caption: `✅ *Instagram Media Downloaded*\n\n> HACKER-MD` 
                }, { quoted: msg });
            }
            
            // 4. FACEBOOK
            else if (cmd === 'fb') {
                const res = await axios.get(`https://api.vreden.my.id/api/fbdl?url=${encodeURIComponent(url)}`);
                const videoUrl = res.data.result.hd || res.data.result.sd;
                await sock.sendMessage(msg.key.remoteJid, { 
                    video: { url: videoUrl }, 
                    caption: `✅ *Facebook Video Downloaded*\n\n> HACKER-MD` 
                }, { quoted: msg });
            }
            
            // 5. PINTEREST
            else if (cmd === 'pinterest' || cmd === 'pin') {
                await sock.sendMessage(msg.key.remoteJid, { text: `⏳ *Searching Pinterest...*` }, { quoted: msg });
                // Pinterest image fetch (Demo API)
                const res = await axios.get(`https://api.vreden.my.id/api/pinterest?query=${encodeURIComponent(query)}`);
                const imgUrl = res.data.result[Math.floor(Math.random() * res.data.result.length)];
                await sock.sendMessage(msg.key.remoteJid, { 
                    image: { url: imgUrl }, 
                    caption: `✅ *Pinterest Image*\n\n> HACKER-MD` 
                }, { quoted: msg });
            }

        } catch (error) {
            console.error(error);
            await sock.sendMessage(msg.key.remoteJid, { text: `❌ *Error:* Media download nahi ho saka. Link check karein ya API down ho sakti hai.` }, { quoted: msg });
        }
    }
};
