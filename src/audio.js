import track from './assets/track.mp3'

const player = document.getElementById('audio');
player.src = track;

let audioCtx; 
let analyser;
let bufferLength;
let dataArray;
let source;


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

export function setTrack(src) {
  player.src = src;
  player.play();
}

export function getAudioData() {
  analyser.getByteFrequencyData(dataArray);
  return [...dataArray];
}


player.addEventListener('play', () => {
  createAnalyser(128);

  const timer = setInterval(() => {
    console.log(getAudioData());
  }, 1000);

  setTimeout(() => {
    clearInterval(timer);
  }, 2000);
});