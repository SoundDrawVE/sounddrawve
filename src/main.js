import './style.css'
import { canvas, getCanvasCtx, clearCanvas, getCanvasDimensions } from './canvas.js';
import { player, getAudioData, preprocessFrequencyData } from './audio.js';
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
  //initFraming('track1');
});

player.addEventListener('pause', () => {
  isPlaying = false;
});

// ==================== ЗАПУСК ОФФЛАЙН-РЕНДЕРА ПОСЛЕ ТРЕКА ====================
player.addEventListener('ended', async () => {
  isPlaying = false;
  //console.log(`🎬 Трек окончен. Собрано ${queue.totalItems()} кадров. Начинаем оффлайн-рендер...`);
  //await createFrames();
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
    //queue.saveItem(Array.from(freq));
  }
}


const renderBtn = document.getElementById('render-btn');
let preprocessedFreqData = null;

renderBtn.addEventListener('click', async () => {
  await onFileSelected();
  initFraming('track1');
  await createFrames(preprocessedFreqData);
});


// При выборе файла (например, в input type="file")
async function onFileSelected(file) {
  try {
    preprocessedFreqData = await preprocessFrequencyData(file, 30, 128); // твой fftSize
    console.log('Готово к проигрыванию и рендеру!');
    // можно сразу показать превью или разблокировать кнопку Play
  } catch (e) {
    console.error('Ошибка предобработки', e);
  }
}

// function handleFile(file) {
//   const audioURL = URL.createObjectURL(file);
//   //const audio = new Audio(audioURL);
//   //audio.play();
// }

// // В HTML: <input type="file" id="fileInput" accept="audio/*">
// document.getElementById('fileInput').addEventListener('change', (event) => {
//   const file = event.target.files[0];
//   if (file) {
//     handleFile(file); // Передаем файл как аргумент
//   }
// });
