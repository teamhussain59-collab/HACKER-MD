import 'dotenv/config';
import fs from 'fs';

export const config = {
    botName: 'HACKER-MD',
    owner: process.env.OWNER_NUMBER || '',
    pairNumber: process.env.PAIR_NUMBER || '',
    prefix: process.env.PREFIX || '.',
    tz: process.env.TZ || 'Asia/Karachi',
    mode: process.env.MODE || 'public',
    multi: process.env.MULTI === 'true',
    adminPassword: process.env.ADMIN_PASSWORD || 'admin',
    web: process.env.WEB === 'true',
    port: process.env.PORT || 3000,
    sessionId: process.env.SESSION_ID || '',
    sessionDir: process.env.SESSION_DIR || './session',
    dataDir: process.env.DATA_DIR || './data',
    openRouterKey: process.env.OPENROUTER_API_KEY || '',
    openRouterModel: process.env.OPENROUTER_MODEL || 'openai/gpt-4o-mini'
};

// Folders auto-create karne ke liye
if (!fs.existsSync(config.sessionDir)) fs.mkdirSync(config.sessionDir, { recursive: true });
if (!fs.existsSync(config.dataDir)) fs.mkdirSync(config.dataDir, { recursive: true });
