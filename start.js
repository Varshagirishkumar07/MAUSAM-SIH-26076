/**
 * MAUSAM - Application Launcher
 * Starts the MAUSAM Unified Server (Frontend + Express API)
 * SIH Problem Statement 26076
 */

import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('====================================================');
console.log('  MAUSAM — Personalized Weather Advisory System');
console.log('  Smart India Hackathon (SIH) Problem Statement 26076');
console.log('====================================================\n');

const backendPath = path.join(__dirname, 'backend');
console.log('[MAUSAM] Starting Unified Application Server on port 5000...');

const serverProc = spawn('node', ['server.js'], {
  cwd: backendPath,
  stdio: 'inherit'
});

serverProc.on('error', (err) => {
  console.error('[MAUSAM ERROR] Failed to start server:', err);
});

serverProc.on('exit', (code) => {
  console.log(`[MAUSAM] Server exited with code ${code}`);
});
