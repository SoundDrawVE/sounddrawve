import './style.css'
import { canvas, getCanvasCtx, clearCanvas, getCanvasDimensions } from './canvas.js';
import { player, getAudioData } from './audio.js';
import { visualizeSpectrum } from './visualizer.js';


let isPlaying = false;

player.addEventListener('play', () => {
  isPlaying = true;
  requestAnimationFrame(animate);
  startVisualization('track1');
});

player.addEventListener('pause', () => {
  isPlaying = false;
});


let fps = 30;
let now;
let then = performance.now();
let interval = 1000 / fps;


// ==================== ГЛОБАЛЬНЫЕ ПЕРЕМЕННЫЕ ====================
let socket = null;
let currentTrackId = null;
let audioDataQueue = [];        // ← сюда сохраняем ВСЕ freq
//let isPlaying = false;
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

// ==================== ЗАПУСК ВИЗУАЛИЗАЦИИ ====================
function startVisualization(trackId) {
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

// ==================== СБОР ДАННЫХ ВО ВРЕМЯ ПРОИГРЫВАНИЯ ====================
function animate(timestamp) {
  if (!isPlaying) return;
  requestAnimationFrame(animate);

  let delta = timestamp - then;
  if (delta > interval) {
    then = timestamp - (delta % interval);

    const freq = getAudioData();                    // ← Uint8Array 64 значения
    const ctx = getCanvasCtx();
    const canvasDimensions = getCanvasDimensions();

    clearCanvas();
    visualizeSpectrum(freq, ctx, canvasDimensions); // обычная отрисовка для пользователя

    // Сохраняем данные для оффлайн-рендера
    audioDataQueue.push(Array.from(freq));          // копируем в обычный массив
  }
}

// ==================== ЗАПУСК ОФФЛАЙН-РЕНДЕРА ПОСЛЕ ТРЕКА ====================
player.addEventListener('ended', async () => {
  isPlaying = false;
  console.log(`🎬 Трек окончен. Собрано ${audioDataQueue.length} кадров. Начинаем оффлайн-рендер...`);

  await startOfflineRendering();
});

// ==================== ОФФЛАЙН-РЕНДЕР (главная магия) ====================
async function startOfflineRendering() {
  if (isOfflineRendering) return;
  isOfflineRendering = true;

  const totalFrames = audioDataQueue.length;
  let frameIndex = 0;
  const frameInterval = 1000 / OFFLINE_FPS;

  console.log(`🚀 Оффлайн-рендер ${OFFLINE_FPS} fps → всего ${totalFrames} кадров`);

  while (frameIndex < totalFrames) {
    const freq = audioDataQueue[frameIndex];

    // Рисуем на скрытом канвасе
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