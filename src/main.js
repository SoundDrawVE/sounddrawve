import './style.css'
import { canvas, getCanvasCtx, clearCanvas, getCanvasDimensions } from './canvas.js';
import { player, getAudioData } from './audio.js';
import { visualizeSpectrum } from './visualizer.js';
import { initFraming, createFrames } from './frames.js';
import { queue } from './storage.js';


let fps = 30;
let now;
let then = performance.now();
let interval = 1000 / fps;
let isPlaying = false;


player.addEventListener('play', () => {
  isPlaying = true;
  requestAnimationFrame(animate);
  initFraming('track1');
});

player.addEventListener('pause', () => {
  isPlaying = false;
});

// ==================== ЗАПУСК ОФФЛАЙН-РЕНДЕРА ПОСЛЕ ТРЕКА ====================
player.addEventListener('ended', async () => {
  isPlaying = false;
  console.log(`🎬 Трек окончен. Собрано ${queue.totalItems()} кадров. Начинаем оффлайн-рендер...`);

  await createFrames();
});


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
    queue.saveItem(Array.from(freq));
  }
}