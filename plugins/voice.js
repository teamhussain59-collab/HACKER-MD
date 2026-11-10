import { downloadMediaMessage } from '@whiskeysockets/baileys';
import { exec } from 'child_process';
import fs from 'fs';
import path from 'path';

export default {
    command: 'voice',
    aliases: ['audiochange'],
    category: 'tools',
    description: 'Change voice effect of audio',
    async execute(sock, msg, args, config) {
        const quoted = msg.message.extendedTextMessage?.contextInfo?.quotedMessage;
        if (!quoted || !quoted.audioMessage) {
            return await sock.sendMessage(msg.key.remoteJid, { text: `❌ *Usage:* Kisi audio ko reply karke ${config.prefix}voice deep/chipmunk likhein.` }, { quoted: msg });
        }

        const effect = args[0]?.toLowerCase();
        if (!['deep', 'chipmunk'].includes(effect)) {
            return await sock.sendMessage(msg.key.remoteJid, { text: `❌ *Effect:* deep ya chipmunk chunein.` }, { quoted: msg });
        }

        await sock.sendMessage(msg.key.remoteJid, { text: `⏳ *Changing voice to ${effect}...*` }, { quoted: msg });

        try {
            const buffer = await downloadMediaMessage({ message: quoted, key: msg.key }, 'buffer', {}, { logger: console });
            const inputPath = path.join(process.cwd(), 'data', `input_${Date.now()}.ogg`);
            const outputPath = path.join(process.cwd(), 'data', `output_${Date.now()}.ogg`);
            
            fs.writeFileSync(inputPath, buffer);

            // FFmpeg command for voice effect
            let filter = effect === 'deep' ? 'asetrate=44100*0.7,atempo=1.2' : 'asetrate=44100*1.5,atempo=0.8';
            const cmd = `ffmpeg -i ${inputPath} -af "${filter}" ${outputPath}`;

            exec(cmd, async (error) => {
                if (error) {
                    fs.unlinkSync(inputPath);
                    return await sock.sendMessage(msg.key.remoteJid, { text: '❌ Voice change fail ho gaya.' });
                }
                
                const outBuffer = fs.readFileSync(outputPath);
                await sock.sendMessage(msg.key.remoteJid, { audio: outBuffer, mimetype: 'audio/ogg; codecs=opus', ptt: true }, { quoted: msg });
                
                // Cleanup
                fs.unlinkSync(inputPath);
                fs.unlinkSync(outputPath);
            });
        } catch (e) {
            await sock.sendMessage(msg.key.remoteJid, { text: '❌ Error aaya hai.' }, { quoted: msg });
        }
    }
};
