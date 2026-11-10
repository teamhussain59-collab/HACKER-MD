import 'dotenv/config';
import fs from 'fs';

export const config = {
    botName: 'HACKER-MD',
    owner: process.env.OWNER_NUMBER || '',
    pairNumbers: process.env.PAIR_NUMBERS ? process.env.PAIR_NUMBERS.split(',').map(n => n.trim()) : [],
    prefix: process.env.PREFIX || '.',
    tz: process.env.TZ || 'Asia/Karachi',
    mode: process.env.MODE || 'public',
    port: process.env.PORT || 3000,
    sessionDir: process.env.SESSION_DIR || './session',
    dataDir: process.env.DATA_DIR || './data'
};

if (!fs.existsSync(config.sessionDir)) fs.mkdirSync(config.sessionDir, { recursive: true });
if (!fs.existsSync(config.dataDir)) fs.mkdirSync(config.dataDir, { recursive: true });
