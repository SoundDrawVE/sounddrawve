let audioDataQueue = [];

export function saveSample(sample) {
  audioDataQueue.push(sample);
}

export function getSample(sampleIndex) {
  return audioDataQueue[sampleIndex];
}

export function getTotalSamples() {
  return audioDataQueue.length;
}

export function clearStorage() {
  audioDataQueue = [];
}