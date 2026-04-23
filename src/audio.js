import track from './assets/sample.mp3'


export const player = document.getElementById('audio');
player.src = track;

let audioCtx; 
let analyser;
let bufferLength;
let dataArray;
let source;
let fftSize = 128;


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


export function setFftSize(value) {
  analyser.fftSize = value;
  bufferLength = analyser.frequencyBinCount;
  dataArray = new Uint8Array(bufferLength);
}

export function setTrack(src) {
  player.src = src;
  player.play();
}

export function getAudioData() {
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
