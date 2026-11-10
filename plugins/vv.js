import { downloadMediaMessage } from '@whiskeysockets/baileys';

export default {
    command: 'vv',
    aliases: ['save', 'vv2'],
    category: 'tools',
    description: 'Save view once messages',
    async execute(sock, msg, args, config) {
        const quoted = msg.message.extendedTextMessage?.contextInfo?.quotedMessage;
        if (!quoted) {
            return await sock.sendMessage(msg.key.remoteJid, { text: '❌ *Usage:* Kisi View Once photo/video ko reply karke .vv likhein.' }, { quoted: msg });
        }

        const type = Object.keys(quoted)[0];
        const isViewOnce = quoted[type]?.viewOnce || quoted[type]?.viewOnceV2;

        if (!isViewOnce && !['imageMessage', 'videoMessage', 'audioMessage'].includes(type)) {
            return await sock.sendMessage(msg.key.remoteJid, { text: '❌ Yeh View Once message nahi hai.' }, { quoted: msg });
        }

        await sock.sendMessage(msg.key.remoteJid, { text: '⏳ *Downloading Media...*' }, { quoted: msg });

        try {
            const buffer = await downloadMediaMessage(
                { message: quoted, key: msg.key },
                'buffer',
                {},
                { logger: console }
            );

            if (type === 'imageMessage') {
                await sock.sendMessage(msg.key.remoteJid, { image: buffer, caption: '✅ *Saved by HACKER-MD*' }, { quoted: msg });
            } else if (type === 'videoMessage') {
                await sock.sendMessage(msg.key.remoteJid, { video: buffer, caption: '✅ *Saved by HACKER-MD*' }, { quoted: msg });
            } else if (type === 'audioMessage') {
                await sock.sendMessage(msg.key.remoteJid, { audio: buffer, mimetype: 'audio/mp4' }, { quoted: msg });
            }
        } catch (error) {
            await sock.sendMessage(msg.key.remoteJid, { text: '❌ Media download fail ho gaya.' }, { quoted: msg });
        }
    }
};
