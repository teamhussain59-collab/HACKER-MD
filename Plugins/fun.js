import axios from 'axios';

export default {
    command: 'joke',
    aliases: ['quote', 'fact'],
    category: 'fun',
    description: 'Get jokes, quotes, and facts from API',
    async execute(sock, msg, args, config) {
        const text = msg.message.conversation || msg.message.extendedTextMessage?.text || '';
        const cmd = text.slice(config.prefix.length).trim().split(/ +/)[0].toLowerCase();

        try {
            let reply = '';

            if (cmd === 'joke') {
                // Public Joke API
                const res = await axios.get('https://v2.jokeapi.dev/joke/Any?type=single&lang=en');
                if (res.data.error) throw new Error();
                
                reply = `😂 *HACKER-MD JOKE*\n\nYeh raha aap ka mazedaar joke:\n\n"${res.data.joke}"\n\n> *Powered by API*`;
            } 
            
            else if (cmd === 'quote') {
                // Public Quote API
                const res = await axios.get('https://api.quotable.io/random');
                reply = `📝 *QUOTE OF THE DAY*\n\n"${res.data.content}"\n\n- *${res.data.author}*`;
            } 
            
            else if (cmd === 'fact') {
                // Public Fact API
                const res = await axios.get('https://uselessfacts.jsph.pl/api/v2/facts/random');
                reply = `🧠 *DID YOU KNOW?*\n\n${res.data.text}`;
            }

            await sock.sendMessage(msg.key.remoteJid, { text: reply }, { quoted: msg });

        } catch (e) {
            // Agar API down ho toh fallback
            await sock.sendMessage(msg.key.remoteJid, { text: '❌ *Error:* Internet API down hai ya limit khatam ho gayi hai. Thodi der baad try karein.' }, { quoted: msg });
        }
    }
};
