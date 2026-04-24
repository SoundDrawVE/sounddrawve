import { visualizeSpectrum } from './visualizer.js';
import { queue, batch } from './storage.js';
import { settings } from './settings.js';


const WS_URL = 'ws://localhost:3000';
const OFFLINE_FPS = 25;         // ← можно поставить 20 или 30


let socket = null;
let currentTrackId = null;
let isOfflineRendering = false;


// Скрытый канвас (создаём один раз)
const exportCanvas = document.createElement('canvas');
// exportCanvas.width = 976;       // ← твой размер
// exportCanvas.height = 549;
const exportCtx = exportCanvas.getContext('2d', { alpha: true });

//console.log(settings.getCanvasExportDimensions());
function setCanvasDimensions({ w, h }) {
  exportCanvas.width = w;
  exportCanvas.height = h;
}


export function initFraming(trackId) {
  currentTrackId = trackId || 'track-' + Date.now();
  queue.clear();
  batch.reset();

  socket = new WebSocket(WS_URL);
  socket.onopen = () => {
    console.log('🔌 WebSocket подключён');
    socket.send(JSON.stringify({ type: 'init', trackId: currentTrackId }));
  };
}


export async function createFrames(audioSamples) {
  if (!isOfflineRendering) setCanvasDimensions(settings.getCanvasExportDimensions());
  if (isOfflineRendering) return;
  isOfflineRendering = true;

  //const totalFrames = queue.totalItems();
  const totalFrames = audioSamples.length;
  let frameIndex = 0;
  const frameInterval = 1000 / OFFLINE_FPS;

  console.log(`🚀 Оффлайн-рендер ${OFFLINE_FPS} fps → всего ${totalFrames} кадров`);

  while (frameIndex < totalFrames) {
    //const freq = queue.getItem(frameIndex);
    const freq = audioSamples[frameIndex];

    exportCtx.clearRect(0, 0, exportCanvas.width, exportCanvas.height);
    visualizeSpectrum(freq, exportCtx, { w: exportCanvas.width, h: exportCanvas.height });
    await capturePNG(exportCanvas, frameIndex, batch);
    
    frameIndex += 1;

    // Контролируем скорость (чтобы не убить CPU)
    await new Promise(r => setTimeout(r, frameInterval));
  }

  // Отправляем остаток и завершаем
  sendBatch();
  sendEndSignal();

  console.log(`✅ Оффлайн-рендер завершён! Сохранено ${totalFrames} кадров.`);
  isOfflineRendering = false;
}


async function capturePNG(canvas, frameIndex, batch) {
  await new Promise(resolve => {
    canvas.toBlob(blob => {
      const reader = new FileReader();

      reader.onload = () => {
        batch.add({
          index: frameIndex,
          data: reader.result.split(',')[1]
        });

        if (batch.isFull()) sendBatch();
        resolve();
      };

      reader.readAsDataURL(blob);
    }, 'image/png');
  });
}

// ==================== ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ====================
function sendBatch() {
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