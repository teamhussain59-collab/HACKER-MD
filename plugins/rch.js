import axios from 'axios';

export default {
    command: 'rch',
    aliases: ['reactchannel', 'chreact'],
    category: 'tools',
    description: 'React to a WhatsApp channel post using Omegatech API',
    async execute(sock, msg, args, config) {
        const channelUrl = args[0];
        // Agar user ne emoji nahi diye, toh default emojis use honge
        const emojis = args[1] || '🔥,❤️,👍';

        if (!channelUrl || !channelUrl.includes('whatsapp.com/channel')) {
            return await sock.sendMessage(msg.key.remoteJid, { 
                text: `❌ *Usage:* ${config.prefix}rch <channel_post_url> [emoji1,emoji2]\n\n*Example:*\n${config.prefix}rch https://whatsapp.com/channel/... 🔥,🤫` 
            }, { quoted: msg });
        }

        await sock.sendMessage(msg.key.remoteJid, { 
            text: `⏳ *Processing reaction...* (This may take a few seconds)` 
        }, { quoted: msg });

        try {
            const apiUrl = `https://api.omegatech.app/api/Fun/Rch`;
            
            // API ko call karna
            const res = await axios.get(apiUrl, {
                params: {
                    action: 'react',
                    url: channelUrl,
                    emoji: emojis
                }
            });

            const data = res.data;

            if (data.success && data.data && data.data.ok) {
                const usage = data.data.usage_today;
                const limit = data.data.limit;
                const time = data.data.time;

                const successText = `
✅ *REACTION SUCCESSFUL!*

🔗 *Target:* ${channelUrl}
🎭 *Emojis:* ${data.data.emojis}
⏱️ *Time:* ${time}
📊 *Usage:* ${usage}/${limit} (Today)

> *Powered by Omegatech VIP API*`;

                await sock.sendMessage(msg.key.remoteJid, { text: successText }, { quoted: msg });
            } else {
                // Agar API limit cross ho jaye ya koi aur issue ho
                throw new Error(data.data?.message || 'API returned an error');
            }

        } catch (error) {
            let errorMsg = '❌ *Reaction Failed!*';
            
            if (error.response?.data?.data?.message) {
                errorMsg += `\n\nReason: ${error.response.data.data.message}`;
            } else if (error.message) {
                errorMsg += `\n\nReason: ${error.message}`;
            }

            errorMsg += `\n\n*Note:* Check if the URL is correct or if the API limit (50/day) is reached.`;

            await sock.sendMessage(msg.key.remoteJid, { text: errorMsg }, { quoted: msg });
        }
    }
};
