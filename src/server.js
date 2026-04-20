import { WebSocketServer } from 'ws';
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const FRAMES_DIR = path.join(path.resolve(__dirname, '..'), 'frames');
if (!fs.existsSync(FRAMES_DIR)) fs.mkdirSync(FRAMES_DIR);

const wss = new WebSocketServer({ port: 3000 });
const tracks = new Map(); // trackId → {config, width, height, frameDir}

console.log('🚀 WebSocket сервер запущен на ws://localhost:3000');
console.log(FRAMES_DIR);