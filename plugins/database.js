import axios from 'axios';

export default {
    command: 'data',
    aliases: ['cnic'],
    category: 'tools',
    description: 'Get SIM data and CNIC from database',
    async execute(sock, msg, args, config) {
        const text = msg.message.conversation || msg.message.extendedTextMessage?.text || '';
        const cmd = text.slice(config.prefix.length).trim().split(/ +/)[0].toLowerCase();
        
        const number = args[0];

        // Number validation
        if (!number || !number.startsWith('92')) {
            return await sock.sendMessage(msg.key.remoteJid, {
                text: `❌ *Usage:*\n• ${config.prefix}data 923001234567\n• ${config.prefix}cnic 923001234567\n\n*Note:* Number hamesha 92 se shuru hona chahiye.`
            }, { quoted: msg });
        }

        // React lagana
        await sock.sendMessage(msg.key.remoteJid, { react: { text: '⏳', key: msg.key } });

        try {
            // API Call
            const apiUrl = `https://famofc.site/api/database.php?number=${number}`;
            const response = await axios.get(apiUrl, { timeout: 15000 });
            const data = response.data;

            // Data check
            if (!data || data.success === false || (typeof data === 'string' && data.toLowerCase().includes('not found'))) {
                throw new Error('Record nahi mila');
            }

            // React Success
            await sock.sendMessage(msg.key.remoteJid, { react: { text: '✅', key: msg.key } });

            // Stylish Formatting
            let replyText = '';
            
            if (cmd === 'cnic') {
                // Agar .cnic command hai toh poora data + CNIC
                replyText = `
╭━━━〔 *🆔 FULL CNIC RECORD* 〕━━━⬣
┃ 📱 *Number:* ${number}
┃ 
┃ 👤 *Name:* ${data.name || data.owner || 'N/A'}
┃ 🆔 *CNIC:* ${data.cnic || data.CNIC || 'N/A'}
┃ 📡 *Network:* ${data.network || data.operator || 'N/A'}
┃ 📍 *Address:* ${data.address || 'N/A'}
┃ 
┃ 📊 *Status:* Verified Data
╰━━━━━━━━━━━━━━━━━━⬣

> *Powered by HACKER-MD Engine*`;

            } else {
                // Agar .data command hai toh sirf normal data (CNIC hidden)
                replyText = `
╭━━━〔 *📂 SIM DATABASE DATA* 〕━━━⬣
┃ 📱 *Number:* ${number}
┃ 
┃ 👤 *Name:* ${data.name || data.owner || 'N/A'}
┃ 📡 *Network:* ${data.network || data.operator || 'N/A'}
┃ 📍 *Address:* ${data.address || 'N/A'}
┃ 
┃ 🔒 *CNIC:* [ Hidden ] (Use ${config.prefix}cnic ${number})
╰━━━━━━━━━━━━━━━━━━⬣

> *Powered by HACKER-MD Engine*`;
            }

            await sock.sendMessage(msg.key.remoteJid, { text: replyText }, { quoted: msg });

        } catch (error) {
            console.error('[DATABASE ERROR]', error.message);
            
            // React Fail
            await sock.sendMessage(msg.key.remoteJid, { react: { text: '❌', key: msg.key } });
            
            await sock.sendMessage(msg.key.remoteJid, { 
                text: `❌ *Error:* Is number ka data database mein nahi mila.\n\n*Note:* Number 92 se shuru karein aur sahi digit check karein.` 
            }, { quoted: msg });
        }
    }
};
