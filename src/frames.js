import { visualizeSpectrum } from './visualizer/visualizer.js';
import { queue, batch } from './storage.js';
import { settings } from './settings.js';


const WS_URL = 'ws://localhost:3000';
const OFFLINE_FPS = 30; // here we can put 20 or 30


let socket = null;
let currentTrackId = null;
let isOfflineRendering = false;


// Hidden canvas (created once)
const exportCanvas = document.createElement('canvas');
const exportCtx = exportCanvas.getContext('2d', { alpha: true });

function setCanvasDimensions({ w, h }) {
  exportCanvas.width = w;
  exportCanvas.height = h;
}


export function initFraming(trackId) {
  currentTrackId = trackId || 'track-' + Date.now();
  queue.clear();
  batch.reset();

  socket = new WebSocket(WS_URL);
  socket.onopen = () => {
    console.log('🔌 WebSocket connected');
    socket.send(JSON.stringify({ type: 'init', trackId: currentTrackId }));
  };
}


const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

let averageProcTime = OFFLINE_FPS;
export async function createFrames(audioSamples, showStatus = (text) => console.log(text)) {
  if (!isOfflineRendering) setCanvasDimensions(settings.getCanvasExportDimensions());
  if (isOfflineRendering) return;
  isOfflineRendering = true;

  const totalFrames = audioSamples.freqData.length;
  let frameIndex = 0;
  const frameInterval = 1000 / OFFLINE_FPS;

  showStatus(`🚀 Offline rendering ${OFFLINE_FPS} fps → total ${totalFrames} frames`);
  await delay(1000);

  while (frameIndex < totalFrames) {
    const t_now = performance.now();
    const freqs = audioSamples.freqData[frameIndex];
    const timeData = audioSamples.timeData[frameIndex];

    exportCtx.clearRect(0, 0, exportCanvas.width, exportCanvas.height);
    visualizeSpectrum(exportCtx, freqs, timeData);
    await capturePNG(exportCanvas, frameIndex, batch);

    showStatus(createStatusMsg(frameIndex, averageProcTime, totalFrames));
    frameIndex += 1;

    // Control the speed (to avoid killing the CPU)
    await new Promise(r => setTimeout(r, frameInterval));
    averageProcTime = performance.now() - t_now;
  }

  // Send the rest and finish
  sendBatch();
  sendEndSignal();

  showStatus(`✅ Offline rendering complete! ${totalFrames} frames saved.`);
  await delay(1000);
  isOfflineRendering = false;
}


function createStatusMsg(frameIndex, frameInterval, totalFrames) {
  const leftFrames = totalFrames - frameIndex;
  let leftTime = leftFrames * frameInterval / 1000;
  let timeUnit = 'sec';
  if (leftTime > 60) {
    leftTime = leftTime / 60;
    timeUnit = 'min';
  }
  leftTime = Math.round(leftTime);
  return `🔬 ${frameIndex} frame created from ${totalFrames}, preprocessing: ${leftTime}${timeUnit} left`;
}


async function capturePNG(canvas, frameIndex, batch) {
  await new Promise(resolve => {
    canvas.toBlob(blob => {
      const reader = new FileReader();

      reader.onload = () => {
        batch.add({
          index: frameIndex,
          data: reader.result.split(',')[1]
        });

        if (batch.isFull()) sendBatch();
        resolve();
      };

      reader.readAsDataURL(blob);
    }, 'image/png');
  });
}


function sendBatch() {
  if (!socket || socket.readyState !== WebSocket.OPEN || batch.len() === 0) return;
  socket.send(JSON.stringify({
    type: 'batch',
    trackId: currentTrackId,
    frames: batch.undload()
  }));
}

function sendEndSignal() {
  if (socket && socket.readyState === WebSocket.OPEN) {
    socket.send(JSON.stringify({ type: 'end', trackId: currentTrackId }));
    console.log('🏁 Sent "end" - all frames on the server!');
  }
}