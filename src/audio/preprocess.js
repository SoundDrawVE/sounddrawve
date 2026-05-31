import { settings } from '../settings.js';
import { player } from './audio.js';


const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));


export async function preprocessAudioData(audioFile, fps = 30, showStatus = (text) => console.log(text)) {
  //let arrayBuffer;

  showStatus(`The audio track is loading...`);

  // if (!audioFile) {
  //   const response = await fetch(player.src);
  //   arrayBuffer = await response.arrayBuffer();
  // } else {
  //   arrayBuffer = await audioFile.arrayBuffer();
  // }

  const audioContext = new (window.AudioContext || window.webkitAudioContext)();
  const arrayBuffer = await getArrayBuffer(audioFile);
  const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

  const duration = audioBuffer.duration;
  const totalFrames = Math.floor(duration * fps);

  showStatus(`🔬 Preprocessing: ${duration.toFixed(2)} sec → ${totalFrames} frames @ ${fps} fps`);
  await delay(1000);


  const analyser = audioContext.createAnalyser();
  analyser.fftSize = settings.fftSize;

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


async function getArrayBuffer(audioFile) {
  let arrayBuffer;
  if (!audioFile) {
    const response = await fetch(player.src);
    arrayBuffer = await response.arrayBuffer();
  } else {
    arrayBuffer = await audioFile.arrayBuffer();
  }
  return arrayBuffer;
}