const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('======================================================');
console.log('🚀 Starting Online Food Ordering System (Full-Stack)');
console.log('======================================================');

// Auto-launch MongoDB if installed
let mongoProcess = null;
const possibleMongodPaths = [
  'C:\\Program Files\\MongoDB\\Server\\9.0\\bin\\mongod.exe',
  'C:\\Program Files\\MongoDB\\Server\\8.0\\bin\\mongod.exe',
  'C:\\Program Files\\MongoDB\\Server\\7.0\\bin\\mongod.exe',
  'mongod',
];

const dbPath = path.resolve(__dirname, '../backend/data/db');
if (!fs.existsSync(dbPath)) {
  fs.mkdirSync(dbPath, { recursive: true });
}

for (const mPath of possibleMongodPaths) {
  if (fs.existsSync(mPath)) {
    try {
      console.log(`[Database] Auto-starting MongoDB from ${mPath}...`);
      mongoProcess = spawn(mPath, ['--dbpath', dbPath, '--bind_ip', '127.0.0.1', '--quiet'], {
        stdio: 'ignore',
        detached: false,
      });
      console.log('[Database] MongoDB instance initialized on port 27017.');
      break;
    } catch (err) {
      console.warn('[Database] Could not launch mongod process:', err.message);
    }
  }
}

const backend = spawn('npm', ['--prefix', 'backend', 'start'], {
  stdio: 'inherit',
  shell: true,
});

const frontend = spawn('npm', ['--prefix', 'frontend', 'run', 'dev'], {
  stdio: 'inherit',
  shell: true,
});

const cleanup = () => {
  try {
    if (mongoProcess) mongoProcess.kill();
    backend.kill();
    frontend.kill();
  } catch (e) {}
  process.exit(0);
};

process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);
