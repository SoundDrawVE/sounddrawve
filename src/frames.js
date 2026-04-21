import { visualizeSpectrum } from './visualizer.js';

let socket = null;
let currentTrackId = null;
export let audioDataQueue = [];        // ← сюда сохраняем ВСЕ freq
let isOfflineRendering = false;

const WS_URL = 'ws://localhost:3000';
const BATCH_SIZE = 10;
const OFFLINE_FPS = 25;         // ← можно поставить 20 или 30
let currentBatch = [];
let pendingCaptures = 0;

// Скрытый канвас (создаём один раз)
const exportCanvas = document.createElement('canvas');
exportCanvas.width = 976;       // ← твой размер
exportCanvas.height = 549;
const exportCtx = exportCanvas.getContext('2d', { alpha: true });

export function initFraming(trackId) {
  currentTrackId = trackId || 'track-' + Date.now();
  audioDataQueue = [];
  currentBatch = [];
  pendingCaptures = 0;

  socket = new WebSocket(WS_URL);
  socket.onopen = () => {
    console.log('🔌 WebSocket подключён');
    socket.send(JSON.stringify({ type: 'init', trackId: currentTrackId }));
  };
}

// Сохраняем данные для оффлайн-рендера
export function presaveAudioData(freq) {
  audioDataQueue.push(Array.from(freq));
}

export async function createFrames() {
  if (isOfflineRendering) return;
  isOfflineRendering = true;

  const totalFrames = audioDataQueue.length;
  let frameIndex = 0;
  const frameInterval = 1000 / OFFLINE_FPS;

  console.log(`🚀 Оффлайн-рендер ${OFFLINE_FPS} fps → всего ${totalFrames} кадров`);

  while (frameIndex < totalFrames) {
    const freq = audioDataQueue[frameIndex];

    exportCtx.clearRect(0, 0, exportCanvas.width, exportCanvas.height);
    visualizeSpectrum(freq, exportCtx, { w: exportCanvas.width, h: exportCanvas.height });

    // Захватываем PNG
    await new Promise(resolve => {
      exportCanvas.toBlob(blob => {
        const reader = new FileReader();
        reader.onload = () => {
          currentBatch.push({
            index: frameIndex,
            data: reader.result.split(',')[1]
          });

          if (currentBatch.length >= BATCH_SIZE) {
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
  if (!socket || socket.readyState !== WebSocket.OPEN || currentBatch.length === 0) return;
  socket.send(JSON.stringify({
    type: 'batch',
    trackId: currentTrackId,
    frames: [...currentBatch]
  }));
  currentBatch = [];
}

function sendEndSignal() {
  if (socket && socket.readyState === WebSocket.OPEN) {
    socket.send(JSON.stringify({ type: 'end', trackId: currentTrackId }));
    console.log('🏁 Отправлено "end" — все кадры на сервере!');
  }
}