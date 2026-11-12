import 'dotenv/config';
import fs from 'fs';

export const config = {
    botName: 'PROFACHNEL', // Rule ke mutabiq naya naam
    owner: process.env.OWNER_NUMBER || '',
    pairNumbers: process.env.PAIR_NUMBERS ? process.env.PAIR_NUMBERS.split(',').map(n => n.trim()) : [],
    prefix: process.env.PREFIX || '.',
    tz: process.env.TZ || 'Asia/Karachi',
    mode: process.env.MODE || 'public',
    port: process.env.PORT || 3000,
    adminPassword: process.env.ADMIN_PASSWORD || 'admin123', // Default password agar Railway mein set na ho
    sessionDir: process.env.SESSION_DIR || './session',
    dataDir: process.env.DATA_DIR || './data'
};

if (!fs.existsSync(config.sessionDir)) fs.mkdirSync(config.sessionDir, { recursive: true });
if (!fs.existsSync(config.dataDir)) fs.mkdirSync(config.dataDir, { recursive: true });
