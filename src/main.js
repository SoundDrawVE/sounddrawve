import './style.css'
import { canvas, getCanvasCtx, clearCanvas, getCanvasDimensions } from './canvas.js';
import { player, getAudioData, preprocessFrequencyData } from './audio.js';
import { visualizeSpectrum } from './visualizer.js';
import { initFraming, createFrames } from './frames.js';
import { queue } from './storage.js';
import { showCover, removeCover, updateMessage } from './cover.js';
import { drawCanvas as initColorPicker } from './color.js';


// init color picker
initColorPicker();


let fps = 30;
let now;
let then = performance.now();
let interval = 1000 / fps;
let isPlaying = false;


player.addEventListener('play', () => {
  isPlaying = true;
  requestAnimationFrame(animate);
});

player.addEventListener('pause', () => {
  isPlaying = false;
});

player.addEventListener('ended', async () => {
  isPlaying = false;
});



function animate(timestamp) {
  if (!isPlaying) return;
  requestAnimationFrame(animate);

  let delta = timestamp - then;
  if (delta > interval) {
    then = timestamp - (delta % interval);

    const freq = getAudioData();
    const ctx = getCanvasCtx();
    const canvasDimensions = getCanvasDimensions();

    clearCanvas();
    visualizeSpectrum(freq, ctx, canvasDimensions);
  }
}


const renderBtn = document.getElementById('render-btn');
let preprocessedFreqData = null;

renderBtn.addEventListener('click', async () => {
  player.pause();
  await onFileSelected();
  initFraming('track1');
  await createFrames(preprocessedFreqData, updateMessage);
  removeCover();
});


async function onFileSelected(file) {
  try {
    showCover();
    preprocessedFreqData = await preprocessFrequencyData(file, 30, updateMessage); // твой fftSize
    console.log('Готово к проигрыванию и рендеру!');
    // можно сразу показать превью или разблокировать кнопку Play
  } catch (e) {
    console.error('Ошибка предобработки', e);
  }
}


const uploadTrackBtn = document.getElementById('upload-track-btn');
const trackInput = document.getElementById('audio-upload');

uploadTrackBtn.addEventListener('click', () => {
  trackInput.click();
});

trackInput.addEventListener('change', (e) => {
  const files = e.target.files;
  if (files.length === 0) return;

  const fileURL = URL.createObjectURL(files[0]);
  player.src = fileURL;
  player.play();
});