import "@fontsource/dejavu-serif"; // Defaults to weight 400
import "@fontsource/inter";
import './style.css';
import { getCanvasCtx, clearCanvas } from './canvas.js';
import { player, getAudioData, preprocessFrequencyData, audioSamples } from './audio.js';
import { visualizeSpectrum } from './visualizer/visualizer.js';
import { initFraming, createFrames } from './frames.js';
import { queue } from './storage.js';
import { showCover, removeCover, updateMessage } from './cover.js';
import { drawCanvas as initColorPicker } from './color.js';
import { initArea as initVisualizationArea } from './area.js';
import { settings } from './settings.js';
import {} from './ui.js';


// init color picker
initColorPicker();
// init visualization area
initVisualizationArea();

let isPlaying = false;

// init settings - visualize spectrum when settings are changed
function visualizeStaticSpectrum() {
  if (isPlaying) return;
  const ctx = getCanvasCtx();
  clearCanvas();
  visualizeSpectrum(audioSamples[settings.fftSize], ctx);
}

visualizeStaticSpectrum();
settings.onChange(visualizeStaticSpectrum);


let fps = 30;
let now;
let then = performance.now();
let interval = 1000 / fps;


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

    clearCanvas();
    visualizeSpectrum(freq, ctx);
  }
}


const renderBtn = document.getElementById('render-btn');
let preprocessedFreqData = null;

renderBtn.addEventListener('click', async () => {
  settings.setProp('mode', 'render');
  player.pause();
  await onFileSelected();
  initFraming('track1');
  await createFrames(preprocessedFreqData, updateMessage);
  removeCover();
  settings.setProp('mode', 'visualize');
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


function genTestSample() {
  const min = 135;
  const max = 255;
  const length = 128;
  return Array.from({ length: length }, () => Math.floor(Math.random() * (max - min + 1)) + min);
}


const uploadimgBtn = document.getElementById('upload-img-btn');
const imgInput = document.getElementById('img-upload');
uploadimgBtn.addEventListener('click', (e) => {
  imgInput.click();
});

const canvasContainer = document.querySelector('.canvas');
imgInput.addEventListener('change', (e) => {
  const files = e.target.files;
  if (files.length === 0) return;
  const imgURL = URL.createObjectURL(files[0]);
  const tempImage = new Image();
  tempImage.src = imgURL;
  tempImage.onload = () => {
    canvasContainer.style.backgroundImage = `url('${imgURL}')`;
    //console.log(tempImage.naturalWidth, tempImage.naturalHeight);
    URL.revokeObjectURL(imgURL);
  };
});