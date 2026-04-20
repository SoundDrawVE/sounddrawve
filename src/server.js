import { WebSocketServer } from 'ws';
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';
//import * as PImage from 'pureimage';
//import { visualizeSpectrum } from './visualizer.js';


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const FRAMES_DIR = path.join(path.resolve(__dirname, '..'), 'frames');
if (!fs.existsSync(FRAMES_DIR)) fs.mkdirSync(FRAMES_DIR);

const wss = new WebSocketServer({ port: 3000 });
const tracks = new Map(); // trackId → {config, width, height, frameDir}

console.log('🚀 WebSocket сервер запущен на ws://localhost:3000');


wss.on('connection', (ws) => {
  console.log('🔌 Новый клиент подключён');

  ws.on('message', async (data) => {
    let msg;
    try {
      msg = JSON.parse(data);               // init, end — JSON
    } catch (e) {
      return; // если пришёл бинарный — игнорируем (у нас всё в JSON)
    }

    if (msg.type === 'init') {
      const { trackId } = msg;
      const frameDir = path.join(FRAMES_DIR, trackId);
      if (!fs.existsSync(frameDir)) fs.mkdirSync(frameDir, { recursive: true });
      tracks.set(trackId, { id: trackId, frameDir });
      console.log(`📂 Новый трек: ${trackId}`);
      return;
    }

    if (msg.type === 'batch') {
      const { trackId, frames } = msg;
      const track = tracks.get(trackId);
      if (!track) return;

      for (const frame of frames) {
        const buffer = Buffer.from(frame.data, 'base64');
        const fileName = `frame-${String(frame.index).padStart(6, '0')}.png`;
        const filePath = path.join(track.frameDir, fileName);

        await fs.promises.writeFile(filePath, buffer);
        console.log(`✅ [${trackId}] Кадр ${frame.index} сохранён (${fileName})`);
      }
      return;
    }

    if (msg.type === 'end') {
      const { trackId } = msg;
      const track = tracks.get(trackId);
      if (track) {
        console.log(`🏁 Трек ${trackId} полностью сохранён!`);
        console.log(`   Папка: ${track.frameDir}`);
      }
      tracks.delete(trackId);
    }
  });

  ws.on('close', () => console.log('🔌 Клиент отключился'));
});








// -------------------------------- create png onthe server side --------------------------------
//const audioSample1 = [255,255,229,221,230,228,211,173,145,155,172,170,158,160,161,159,159,150,154,161,159,144,155,162,159,156,161,172,168,162,158,154,147,153,158,153,142,151,153,158,171,171,172,167,159,155,150,135,121,89,23,0,0,0,0,0,0,0,0,0,0,0,0,0];
// renderFrame({
//   id: 1,
//   config: { type: 'bars' },
//   width: 1920,
//   height: 1080,
//   frameDir: FRAMES_DIR
// }, 1, audioSample1);


// const now = performance.now();
// async function testSpeed() {
//   let counter = 1;
//   while(counter <= 10) {
//     await renderFrame({
//       id: 1,
//       config: { type: 'bars' },
//       width: 1920,
//       height: 1080,
//       frameDir: FRAMES_DIR
//     }, counter, audioSample1);

//     if (counter === 10) console.log(performance.now() - now);
//     counter += 1;
//   }
// }

// testSpeed();


// function renderFrame(track, frameIndex, freq) {
//   const { config, width, height, frameDir } = track;
//   const img = PImage.make(width, height);
//   const ctx = img.getContext('2d');

//   // transparent background
//   ctx.fillStyle = 'rgba(0, 0, 0, 0)';
//   ctx.fillRect(0, 0, width, height);

//   if (config.type === 'bars') {
//     visualizeSpectrum(freq, ctx, { w: width, h: height });
//   } else {
//     // placeholder for future visualizations
//     ctx.fillStyle = '#ff00ff';
//     ctx.fillText('Future viz: ' + config.type, 50, 100);
//   }

//   const fileName = `frame-${String(frameIndex).padStart(6, '0')}.png`;
//   const filePath = path.join(frameDir, fileName);

//   return new Promise((resolve) => {
//     PImage.encodePNGToStream(img, fs.createWriteStream(filePath))
//       .then(() => {
//         console.log(`✅ [${track.id}] Кадр ${frameIndex} → ${fileName}`);
//         resolve();
//       });
//   });
// }