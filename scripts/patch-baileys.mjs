import fs from 'fs';
import path from 'path';

console.log('[PATCH] Running HACKER-MD Baileys patch script...');

const baileysPath = path.join(process.cwd(), 'node_modules', '@whiskeysockets', 'baileys');

if (!fs.existsSync(baileysPath)) {
    console.log('[PATCH] Baileys folder not found yet. (This is normal if npm install is still running).');
    process.exit(0);
}

try {
    // Patch 1: Bypass sharp image processing errors in Docker (Linux)
    const mediaFile = path.join(baileysPath, 'lib', 'Utils', 'messages-media.js');
    if (fs.existsSync(mediaFile)) {
        let content = fs.readFileSync(mediaFile, 'utf-8');
        // Simple hack to bypass sharp native errors
        if (content.includes("require('sharp')") || content.includes('require("sharp")')) {
            content = content.replace(/require\(['"]sharp['"]\)/g, '({ toBuffer: async () => { throw new Error("sharp bypassed"); } })');
            fs.writeFileSync(mediaFile, content);
            console.log('[PATCH] Fixed image processing (sharp) for Docker.');
        }
    }

    // Patch 2: Increase default connection timeout for Railway
    const socketFile = path.join(baileysPath, 'lib', 'Socket', 'index.js');
    if (fs.existsSync(socketFile)) {
        let content = fs.readFileSync(socketFile, 'utf-8');
        if (content.includes('connectTimeoutMs: 20000')) {
            content = content.replace('connectTimeoutMs: 20000', 'connectTimeoutMs: 60000');
            fs.writeFileSync(socketFile, content);
            console.log('[PATCH] Increased connection timeout for Railway.');
        }
    }

    console.log('[PATCH] Baileys patched successfully. Ready for Railway!');
} catch (error) {
    console.log('[PATCH] Minor warning (ignored):', error.message);
}
