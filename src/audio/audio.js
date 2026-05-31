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

