import axios from 'axios';
import { createCanvas, loadImage } from '@napi-rs/canvas';
import fs from 'fs';
import path from 'path';

export default {
    command: 'data',
    aliases: ['cnic'],
    category: 'tools',
    description: 'Get SIM data and show ID Card',
    async execute(sock, msg, args, config) {
        const text = msg.message.conversation || msg.message.extendedTextMessage?.text || '';
        const cmd = text.slice(config.prefix.length).trim().split(/ +/)[0].toLowerCase();
        
        const number = args[0];

        if (!number || !number.startsWith('92')) {
            return await sock.sendMessage(msg.key.remoteJid, {
                text: `❌ *Usage:*\n• ${config.prefix}data 923001234567\n• ${config.prefix}cnic 923001234567\n\n*Note:* Number hamesha 92 se shuru hona chahiye.`
            }, { quoted: msg });
        }

        await sock.sendMessage(msg.key.remoteJid, { react: { text: '⏳', key: msg.key } });

        let finalData = {
            name: 'N/A',
            cnic: 'N/A',
            network: 'N/A',
            address: 'N/A'
        };

        // 1. Famous API Try karein
        try {
            const res = await axios.get(`https://famofc.site/api/database.php?number=${number}`, { timeout: 10000 });
            if (res.data && res.data.success !== false && !String(res.data).toLowerCase().includes('not found')) {
                finalData.name = res.data.name || res.data.owner || 'N/A';
                finalData.cnic = res.data.cnic || res.data.CNIC || 'N/A';
                finalData.network = res.data.network || res.data.operator || 'N/A';
                finalData.address = res.data.address || 'N/A';
            }
        } catch (e) {
            console.log('Famofc API down, trying Abstract...');
        }

        // 2. Agar Famous API se data nahi mila, toh Abstract API try karein
        if (finalData.name === 'N/A' && process.env.ABSTRACT_API_KEY) {
            try {
                const res = await axios.get(`https://phonevalidation.abstractapi.com/v1/?api_key=${process.env.ABSTRACT_API_KEY}&phone=${number}`);
                if (res.data && res.data.valid) {
                    finalData.network = res.data.carrier || 'N/A';
                    finalData.address = `${res.data.location || ''}, ${res.data.country.name}`;
                }
            } catch (e) {
                console.log('Abstract API failed too');
            }
        }

        // Agar dono fail ho jayein
        if (finalData.name === 'N/A' && finalData.network === 'N/A') {
            await sock.sendMessage(msg.key.remoteJid, { react: { text: '❌', key: msg.key } });
            return await sock.sendMessage(msg.key.remoteJid, { text: `❌ *Error:* Dono databases mein data nahi mila.` }, { quoted: msg });
        }

        // ================= ID CARD IMAGE GENERATION =================
        try {
            // Canvas create karein (800x450)
            const canvas = createCanvas(800, 450);
            const ctx = canvas.getContext('2d');

            // Background (Dark Hacker Theme)
            ctx.fillStyle = '#0d1117';
            ctx.fillRect(0, 0, 800, 450);

            // Card Background (Neon Box)
            ctx.fillStyle = '#161b22';
            ctx.shadowColor = '#00ff00';
            ctx.shadowBlur = 20;
            ctx.fillRect(40, 40, 720, 370); 
            ctx.shadowBlur = 0; // Reset shadow

            // Card Border
            ctx.strokeStyle = '#00ff00';
            ctx.lineWidth = 2;
            ctx.strokeRect(40, 40, 720, 370);

            // Header Text
            ctx.fillStyle = '#00ff00';
            ctx.font = 'bold 30px Arial';
            ctx.fillText('HACKER-MD / PROFACHNEL', 70, 90);

            ctx.fillStyle = '#888888';
            ctx.font = '18px Arial';
            ctx.fillText('PAKISTAN SIM DATABASE RECORD', 70, 120);

            // Line separator
            ctx.strokeStyle = '#30363d';
            ctx.beginPath();
            ctx.moveTo(70, 140);
            ctx.lineTo(730, 140);
            ctx.stroke();

            // Data Fields
            ctx.fillStyle = '#00ff00';
            ctx.font = 'bold 20px Arial';
            ctx.fillText('NAME:', 70, 190);
            ctx.fillText('CNIC:', 70, 240);
            ctx.fillText('NUMBER:', 70, 290);
            ctx.fillText('NETWORK:', 70, 340);
            ctx.fillText('ADDRESS:', 70, 390);

            // Data Values (White)
            ctx.fillStyle = '#ffffff';
            ctx.font = '20px Arial';
            ctx.fillText(finalData.name, 220, 190);
            ctx.fillText(cmd === 'cnic' ? finalData.cnic : '[ HIDDEN ]', 220, 240);
            ctx.fillText(number, 220, 290);
            ctx.fillText(finalData.network, 220, 340);
            
            // Address (Chota font taake box se bahar na jaye)
            ctx.font = '16px Arial';
            let addressText = finalData.address;
            if (addressText.length > 40) addressText = addressText.substring(0, 40) + '...';
            ctx.fillText(addressText, 220, 390);

            // Photo Box (Placeholder)
            ctx.fillStyle = '#21262d';
            ctx.fillRect(580, 180, 140, 160);
            ctx.strokeStyle = '#00ff00';
            ctx.strokeRect(580, 180, 140, 160);
            
            ctx.fillStyle = '#00ff00';
            ctx.font = 'bold 50px Arial';
            ctx.fillText('👤', 625, 270);

            // Canvas ko Buffer mein convert karein
            const buffer = canvas.toBuffer('image/png');

            await sock.sendMessage(msg.key.remoteJid, { react: { text: '✅', key: msg.key } });

            // Image send karein
            await sock.sendMessage(msg.key.remoteJid, { 
                image: buffer, 
                caption: `✅ *Data Found for ${number}*\n\n> *Generated by HACKER-MD*` 
            }, { quoted: msg });

        } catch (imgError) {
            console.error('[CANVAS ERROR]', imgError.message);
            // Agar image banane mein error aaye, toh text fallback bhej dein
            await sock.sendMessage(msg.key.remoteJid, { 
                text: `📂 *DATA FOUND*\n\n👤 *Name:* ${finalData.name}\n🆔 *CNIC:* ${finalData.cnic}\n📡 *Network:* ${finalData.network}\n📍 *Address:* ${finalData.address}` 
            }, { quoted: msg });
        }
    }
};
