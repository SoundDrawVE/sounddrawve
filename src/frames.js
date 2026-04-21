import { visualizeSpectrum } from './visualizer.js';
import { getSample, getTotalSamples, clearStorage, batch } from './storage.js';


const WS_URL = 'ws://localhost:3000';
const BATCH_SIZE = 10;
const OFFLINE_FPS = 25;         // ← можно поставить 20 или 30


let socket = null;
let currentTrackId = null;
let isOfflineRendering = false;
//let currentBatch = [];


// Скрытый канвас (создаём один раз)
const exportCanvas = document.createElement('canvas');
exportCanvas.width = 976;       // ← твой размер
exportCanvas.height = 549;
const exportCtx = exportCanvas.getContext('2d', { alpha: true });


export function initFraming(trackId) {
  currentTrackId = trackId || 'track-' + Date.now();
  clearStorage();
  //currentBatch = [];
  batch.reset();

  socket = new WebSocket(WS_URL);
  socket.onopen = () => {
    console.log('🔌 WebSocket подключён');
    socket.send(JSON.stringify({ type: 'init', trackId: currentTrackId }));
  };
}



export async function createFrames() {
  if (isOfflineRendering) return;
  isOfflineRendering = true;

  const totalFrames = getTotalSamples();
  let frameIndex = 0;
  const frameInterval = 1000 / OFFLINE_FPS;

  console.log(`🚀 Оффлайн-рендер ${OFFLINE_FPS} fps → всего ${totalFrames} кадров`);

  while (frameIndex < totalFrames) {
    const freq = getSample(frameIndex);

    exportCtx.clearRect(0, 0, exportCanvas.width, exportCanvas.height);
    visualizeSpectrum(freq, exportCtx, { w: exportCanvas.width, h: exportCanvas.height });

    // Захватываем PNG
    await new Promise(resolve => {
      exportCanvas.toBlob(blob => {
        const reader = new FileReader();
        reader.onload = () => {
          // currentBatch.push({
          //   index: frameIndex,
          //   data: reader.result.split(',')[1]
          // });
          batch.add({
            index: frameIndex,
            data: reader.result.split(',')[1]
          });

          // if (currentBatch.length >= BATCH_SIZE) {
          //   sendBatch();
          // }

          if (batch.isFull()) {
            sendBatch();
          }

          frameIndex++;
          resolve();
        };
        reader.readAsDataURL(blob);
      }, 'image/png');
    });

    // Контролируем скорость (чтобы не убить CPU)
    await new Promise(r => setTimeout(r, frameInterval));
  }

  // Отправляем остаток и завершаем
  sendBatch();
  sendEndSignal();

  console.log(`✅ Оффлайн-рендер завершён! Сохранено ${totalFrames} кадров.`);
  isOfflineRendering = false;
}

// ==================== ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ====================
function sendBatch() {
  // if (!socket || socket.readyState !== WebSocket.OPEN || currentBatch.length === 0) return;
  // socket.send(JSON.stringify({
  //   type: 'batch',
  //   trackId: currentTrackId,
  //   frames: [...currentBatch]
  // }));
  // currentBatch = [];

  if (!socket || socket.readyState !== WebSocket.OPEN || batch.len() === 0) return;
  socket.send(JSON.stringify({
    type: 'batch',
    trackId: currentTrackId,
    frames: batch.undload()
  }));
}

function sendEndSignal() {
  if (socket && socket.readyState === WebSocket.OPEN) {
    socket.send(JSON.stringify({ type: 'end', trackId: currentTrackId }));
    console.log('🏁 Отправлено "end" — все кадры на сервере!');
  }
}