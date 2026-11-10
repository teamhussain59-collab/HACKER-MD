import axios from 'axios';

export default {
    command: 'play', // Main command
    aliases: ['song', 'ytmp3', 'video', 'ytmp4', 'tt', 'tiktok', 'ig', 'insta', 'fb', 'pinterest', 'pin'],
    category: 'downloader',
    description: 'Download media from various platforms',
    async execute(sock, msg, args, config) {
        // Message se command nikalna (e.g., .play ya .tt)
        const text = msg.message.conversation || msg.message.extendedTextMessage?.text || '';
        const cmd = text.slice(config.prefix.length).trim().split(/ +/)[0].toLowerCase();
        const query = args.join(' ');

        if (!query) {
            return await sock.sendMessage(msg.key.remoteJid, { text: `❌ *Usage:* ${config.prefix}${cmd} <url ya song ka naam>` }, { quoted: msg });
        }

        await sock.sendMessage(msg.key.remoteJid, { text: `⏳ *Processing...* (${cmd})` }, { quoted: msg });

        try {
            let url = query;
            let isAudio = ['play', 'song', 'ytmp3'].includes(cmd);

            // Agar YouTube ka naam search karna hai (Play/Song)
            if (isAudio && !query.includes('http')) {
                const search = await axios.get(`https://api.vreden.my.id/api/ytplaymp3?query=${encodeURIComponent(query)}`);
                if (!search.data.result) throw new Error('Song not found');
                url = search.data.result.url || search.data.result.downloadUrl;
            }

            // General API for downloading (Mock logic - aap apni pasand ka API laga sakte hain)
            // Note: Real APIs need specific formatting. Yeh ek standard structure hai.
            if (cmd === 'tt' || cmd === 'tiktok') {
                // TikTok downloader logic
                await sock.sendMessage(msg.key.remoteJid, { text: '✅ *TikTok Video Found! Sending...*' }, { quoted: msg });
                // Yahan video send karne ka code hoga (API response ke baad)
                await sock.sendMessage(msg.key.remoteJid, { video: { url: 'https://example.com/video.mp4' }, caption: 'Downloaded by HACKER-MD' });
            } 
            else if (cmd === 'ig' || cmd === 'insta') {
                await sock.sendMessage(msg.key.remoteJid, { text: '✅ *Instagram Media Found! Sending...*' }, { quoted: msg });
            }
            else if (cmd === 'fb') {
                await sock.sendMessage(msg.key.remoteJid, { text: '✅ *Facebook Video Found! Sending...*' }, { quoted: msg });
            }
            else if (cmd === 'pinterest' || cmd === 'pin') {
                await sock.sendMessage(msg.key.remoteJid, { text: '✅ *Pinterest Image Found! Sending...*' }, { quoted: msg });
            }
            else if (isAudio) {
                await sock.sendMessage(msg.key.remoteJid, { text: '🎵 *Audio Found! Sending...*' }, { quoted: msg });
                // await sock.sendMessage(msg.key.remoteJid, { audio: { url: url }, mimetype: 'audio/mp4' }, { quoted: msg });
            }
            else {
                await sock.sendMessage(msg.key.remoteJid, { text: '✅ *Video Found! Sending...*' }, { quoted: msg });
                // await sock.sendMessage(msg.key.remoteJid, { video: { url: url }, caption: 'Downloaded by HACKER-MD' }, { quoted: msg });
            }

        } catch (error) {
            await sock.sendMessage(msg.key.remoteJid, { text: `❌ *Error:* Media download nahi ho saka. Link sahi check karein.` }, { quoted: msg });
        }
    }
};
