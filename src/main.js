import './style.css'
import { getCanvasCtx, clearCanvas, getCanvasDimensions } from './canvas.js';
import { player, getAudioData } from './audio.js';
import { visualizeSpectrum } from './visualizer.js';


let isPlaying = false;

player.addEventListener('play', () => {
  isPlaying = true;
  requestAnimationFrame(animate);
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
  }
}