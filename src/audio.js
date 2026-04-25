import track from './assets/sample.mp3';
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


export const audioSample1 = [255,255,229,221,230,228,211,173,145,155,172,170,158,160,161,159,159,150,154,161,159,144,155,162,159,156,161,172,168,162,158,154,147,153,158,153,142,151,153,158,171,171,172,167,159,155,150,135,121,89,23,0,0,0,0,0,0,0,0,0,0,0,0,0];
export const audioSample2 = [153,145,102,124,128,132,143,143,126,114,116,113,110,106,114,128,126,124,140,145,149,145,127,131,137,137,141,140,145,145,156,165,152,139,139,133,133,142,151,144,123,139,141,139,128,119,125,124,119,99,54,30,30,12,0,0,0,0,0,0,0,0,0,0];

/**
 * Предварительно собирает frequency data с фиксированным FPS
 * @param {File|Blob} audioFile — выбранный mp3-файл
 * @param {number} fps — желаемый FPS (рекомендую 25 или 30)
 * @param {number} fftSize — размер FFT (должен совпадать с твоим)
 * @returns {Promise<Array<number[]>>}
 */
export async function preprocessFrequencyData(audioFile, fps = 30, showStatus = (text) => console.log(text)) {
  let arrayBuffer;

  if (!audioFile) {
    const response = await fetch(track);
    arrayBuffer = await response.arrayBuffer();
  } else {
    arrayBuffer = await audioFile.arrayBuffer();
  }

  const audioContext = new (window.AudioContext || window.webkitAudioContext)();
  const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

  const duration = audioBuffer.duration;
  const totalFrames = Math.floor(duration * fps);

  showStatus(`🔬 Предобработка: ${duration.toFixed(2)} сек → ${totalFrames} кадров @ ${fps} fps`)


  const analyser = audioContext.createAnalyser();
  analyser.fftSize = fftSize;
  const bufferLength = analyser.frequencyBinCount;

  const source = audioContext.createBufferSource();
  source.buffer = audioBuffer;

  const gainNode = audioContext.createGain();
  gainNode.gain.value = 0;                       // без звука

  source.connect(analyser);
  analyser.connect(gainNode);
  gainNode.connect(audioContext.destination);

  source.start(0);

  const freqData = [];
  const intervalMs = 1000 / fps;
  let frameIndex = 0;
  let lastLoggedPercent = -1;                    // ← для красивого вывода

  return new Promise((resolve) => {
    const timer = setInterval(() => {
      if (frameIndex >= totalFrames) {
        clearInterval(timer);
        source.stop();
        audioContext.close().catch(() => {});
        showStatus(`✅ Предобработка завершена: ${freqData.length} кадров`);
        resolve(freqData);
        return;
      }

      const dataArray = new Uint8Array(bufferLength);
      analyser.getByteFrequencyData(dataArray);
      freqData.push(Array.from(dataArray));

      // === ВЫВОД ПРОГРЕССА ===
      const percent = Math.round((frameIndex / totalFrames) * 100);
      if (percent > lastLoggedPercent) {           // выводим только при изменении %
        lastLoggedPercent = percent;
        showStatus(`📊 Анализ аудио: ${percent}%`);
      }

      frameIndex++;
    }, intervalMs);
  });
}