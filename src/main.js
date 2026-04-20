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

function animate(timestamp) {
  if (!isPlaying) return;
  requestAnimationFrame(animate);
  let delta = timestamp - then;
  if (delta > interval) {
    then = timestamp - (delta % interval);
    //animation logic
    const freq = getAudioData();
    const ctx = getCanvasCtx();
    const canvasDimensions = getCanvasDimensions();
    clearCanvas();
    visualizeSpectrum(freq, ctx, canvasDimensions);
    // === ЗАХВАТ И БАТЧИНГ PNG ===
    captureAndQueue();
  }
}


let socket = null;
let currentTrackId = null;
let frameIndex = 0;
const BATCH_SIZE = 10;
let currentBatch = [];

const WS_URL = 'ws://localhost:3000';   // or server IP

function startVisualization(trackId) {
  currentTrackId = trackId || 'track-' + Date.now();
  frameIndex = 0;
  currentBatch = [];

  socket = new WebSocket(WS_URL);

  socket.onopen = () => {
    console.log('🔌 WebSocket подключён');
    socket.send(JSON.stringify({
      type: 'init',
      trackId: currentTrackId
    }));
  };

  socket.onclose = () => console.log('🔌 WebSocket закрыт');
}

// Асинхронный захват (не блокирует отрисовку)
function captureAndQueue() {
  canvas.toBlob(blob => {
    const reader = new FileReader();
    reader.onload = () => {
      currentBatch.push({
        index: frameIndex++,
        data: reader.result.split(',')[1]   // чистый base64 без data:image/png;base64,
      });

      if (currentBatch.length >= BATCH_SIZE) {
        sendBatch();
      }
    };
    reader.readAsDataURL(blob);   // 'image/png' по умолчанию
  }, 'image/png');                // ← прозрачность гарантирована
}

// Отправка батча
function sendBatch() {
  if (!socket || socket.readyState !== WebSocket.OPEN || currentBatch.length === 0) return;

  socket.send(JSON.stringify({
    type: 'batch',
    trackId: currentTrackId,
    frames: [...currentBatch]   // копия массива
  }));
  currentBatch = [];
}

// При окончании трека
player.addEventListener('pause', () => {
  isPlaying = false;
  sendBatch();                    // отправляем остаток
});

player.addEventListener('ended', () => {
  isPlaying = false;
  sendBatch();
  if (socket && socket.readyState === WebSocket.OPEN) {
    socket.send(JSON.stringify({ type: 'end', trackId: currentTrackId }));
  }
  console.log('🎬 Трек окончен — все кадры отправлены!');
});