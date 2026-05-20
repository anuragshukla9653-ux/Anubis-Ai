import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const frontendDir = path.join(__dirname, 'Frontend');
const backendDir = path.join(__dirname, 'Backend');
const publicDir = path.join(backendDir, 'public');

console.log('--- Starting build process ---');

// 1. Install frontend dependencies
console.log('Installing Frontend dependencies...');
execSync('npm install --legacy-peer-deps', { cwd: frontendDir, stdio: 'inherit' });

// 2. Build frontend
console.log('Building Frontend...');
execSync('npm run build', { cwd: frontendDir, stdio: 'inherit' });

// 3. Install backend dependencies
console.log('Installing Backend dependencies...');
execSync('npm install --legacy-peer-deps', { cwd: backendDir, stdio: 'inherit' });

// 4. Copy frontend build to backend/public
console.log('Cleaning existing Backend public directory...');
if (fs.existsSync(publicDir)) {
  fs.rmSync(publicDir, { recursive: true, force: true });
}

console.log('Copying Frontend build to Backend public directory...');
fs.mkdirSync(publicDir, { recursive: true });
fs.cpSync(path.join(frontendDir, 'dist'), publicDir, { recursive: true });

console.log('--- Build process completed successfully! ---');
