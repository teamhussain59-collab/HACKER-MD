import { spawn } from 'child_process';

function startBot() {
    console.log('[HACKER-MD] Starting bot main process...');
    
    // main.js ko spawn karna
    const child = spawn('node', ['main.js'], { stdio: 'inherit' });

    child.on('exit', (code) => {
        console.log(`[HACKER-MD] Bot crashed or stopped (code: ${code}). Restarting in 3 seconds...`);
        setTimeout(startBot, 3000);
    });
}

startBot();
