import track from './assets/track.mp3';
import { settings } from './settings.js';


export const player = document.getElementById('audio');
player.src = track;

let audioCtx; 
let analyser;
let bufferLength;
let dataArray;
let source;
let fftSize = settings.fftSize;


function createAnalyser(fftSize) {
  audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  analyser = audioCtx.createAnalyser(); 
  analyser.fftSize = fftSize;
  bufferLength = analyser.frequencyBinCount;
  dataArray = new Uint8Array(bufferLength);
  source = audioCtx.createMediaElementSource(player);
  source.connect(analyser);
  analyser.connect(audioCtx.destination);
}


function setFftSize(value) {
  analyser.fftSize = value;
  bufferLength = analyser.frequencyBinCount;
  dataArray = new Uint8Array(bufferLength);
}

export function setTrack(src) {
  player.src = src;
  player.play();
}

export function getAudioData() {
  if (fftSize !== settings.fftSize) {
    setFftSize(settings.fftSize);
    fftSize = settings.fftSize;
  };
  analyser.getByteFrequencyData(dataArray);
  return [...dataArray];
}


player.addEventListener('play', () => {
  if (!audioCtx) {
    createAnalyser(fftSize);
  }

  if (audioCtx.state === 'suspended') audioCtx.resume();

  // const timer = setInterval(() => {
  //   console.log(JSON.stringify(getAudioData()));
  // }, 1000);

  // setTimeout(() => {
  //   clearInterval(timer);
  // }, 2000);
});


const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Предварительно собирает frequency data с фиксированным FPS
 * @param {File|Blob} audioFile — выбранный mp3-файл
 * @param {number} fps — желаемый FPS (рекомендую 25 или 30)
 * @param {number} fftSize — размер FFT (должен совпадать с твоим)
 * @returns {Promise<Array<number[]>>}
 */
export async function preprocessFrequencyData(audioFile, fps = 30, showStatus = (text) => console.log(text)) {
  let arrayBuffer;

  showStatus(`The audio track is loading...`);

  if (!audioFile) {
    const response = await fetch(player.src);
    arrayBuffer = await response.arrayBuffer();
  } else {
    arrayBuffer = await audioFile.arrayBuffer();
  }

  const audioContext = new (window.AudioContext || window.webkitAudioContext)();
  const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

  const duration = audioBuffer.duration;
  const totalFrames = Math.floor(duration * fps);

  showStatus(`🔬 Preprocessing: ${duration.toFixed(2)} sec → ${totalFrames} frames @ ${fps} fps`);
  await delay(1000);


  const analyser = audioContext.createAnalyser();
  analyser.fftSize = fftSize;
  const bufferLength = analyser.frequencyBinCount;

  const source = audioContext.createBufferSource();
  source.buffer = audioBuffer;

  const gainNode = audioContext.createGain();
  gainNode.gain.value = 0; // no sound

  source.connect(analyser);
  analyser.connect(gainNode);
  gainNode.connect(audioContext.destination);

  source.start(0);

  const freqData = [];
  const intervalMs = 1000 / fps;
  let frameIndex = 0;
  let lastLoggedPercent = -1; // for good output

  return new Promise((resolve) => {
    const timer = setInterval(() => {
      if (frameIndex >= totalFrames) {
        clearInterval(timer);
        source.stop();
        audioContext.close().catch(() => {});
        showStatus(`✅ Preprocessing completed: ${freqData.length} frames`);
        setTimeout(() => resolve(freqData), 1000);
        return;
      }

      const dataArray = new Uint8Array(bufferLength);
      analyser.getByteFrequencyData(dataArray);
      freqData.push(Array.from(dataArray));

      const percent = Math.round((frameIndex / totalFrames) * 100);
      if (percent > lastLoggedPercent) { // output only when % changes
        lastLoggedPercent = percent;
        showStatus(`📊 Audio analysis: ${percent}%`);
      }

      frameIndex++;
    }, intervalMs);
  });
}


const audioSample32 = [152,156,155,140,148,166,173,181,175,156,149,156,143,104,50,0];
const audioSample64 = [159,152,145,143,132,132,127,129,137,144,154,150,161,167,169,171,166,160,146,152,158,152,147,144,127,104,75,39,0,0,0,0];
const audioSample128 = [142,133,114,119,119,131,140,131,121,124,123,113,117,123,122,120,125,141,152,151,146,148,132,135,148,151,143,146,136,145,156,146,137,148,151,142,123,142,151,148,140,146,148,140,133,140,129,118,119,95,67,68,57,28,0,0,0,0,0,0,0,0,0,0];
const audioSample256 = [134,140,121,96,90,96,89,99,99,100,111,105,114,122,111,105,98,94,104,105,105,98,89,92,89,95,103,100,102,100,106,108,105,110,99,102,125,134,132,138,138,129,132,131,128,122,127,136,133,120,125,136,125,117,125,127,137,145,147,148,145,140,132,140,132,131,130,119,110,124,135,132,138,128,121,118,123,131,135,126,124,112,108,117,109,115,119,124,133,125,117,94,104,118,110,100,87,71,82,67,52,55,69,57,42,38,20,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];

export const audioSamples = {
  '32': audioSample32,
  '64': audioSample64,
  '128': audioSample128,
  '256': audioSample256
};