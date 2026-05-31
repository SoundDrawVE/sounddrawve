import track from '../assets/track.mp3';
import { settings } from '../settings.js';


export const player = document.getElementById('audio');
player.src = track;

let fftSize = settings.fftSize;

let audioCtx; 
let analyser;
let freqData;
let source;
let timeData;


function createAnalyser(fftSize) {
  audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  analyser = audioCtx.createAnalyser(); 
  analyser.fftSize = fftSize;
  freqData = new Uint8Array(analyser.frequencyBinCount);
  timeData = new Uint8Array(analyser.fftSize);
  source = audioCtx.createMediaElementSource(player);
  source.connect(analyser);
  analyser.connect(audioCtx.destination);
}


function setFftSize(value) {
  analyser.fftSize = value;
  freqData = new Uint8Array(analyser.frequencyBinCount);
  timeData = new Uint8Array(analyser.fftSize);
}

function updateFftSize() {
  if (fftSize !== settings.fftSize) {
    setFftSize(settings.fftSize);
    fftSize = settings.fftSize;
  };
}

export function setTrack(src) {
  player.src = src;
  player.play();
}

export function getAudioData() {
  updateFftSize();
  analyser.getByteFrequencyData(freqData);
  analyser.getByteTimeDomainData(timeData);
  return {
    freqs: [...freqData],
    timeData: [...timeData]
  };
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
export async function preprocessAudioData(audioFile, fps = 30, showStatus = (text) => console.log(text)) {
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

  const source = audioContext.createBufferSource();
  source.buffer = audioBuffer;

  const gainNode = audioContext.createGain();
  gainNode.gain.value = 0; // no sound

  source.connect(analyser);
  analyser.connect(gainNode);
  gainNode.connect(audioContext.destination);

  source.start(0);

  const freqData = [];
  const timeData = [];
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
        setTimeout(() => resolve({ freqData, timeData }), 1000);
        return;
      }

      const fData = new Uint8Array(analyser.frequencyBinCount);
      const tData = new Uint8Array(analyser.fftSize);

      analyser.getByteFrequencyData(fData);
      analyser.getByteTimeDomainData(tData);
      freqData.push(Array.from(fData));
      timeData.push(Array.from(timeData));

      const percent = Math.round((frameIndex / totalFrames) * 100);
      if (percent > lastLoggedPercent) { // output only when % changes
        lastLoggedPercent = percent;
        showStatus(`📊 Audio analysis: ${percent}%`);
      }

      frameIndex++;
    }, intervalMs);
  });
}
