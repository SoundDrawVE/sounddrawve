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


export const batch = {
  BATCH_SIZE: 10,
  data: [],

  reset() {
    this.data = [];
  },

  add(element) {
    this.data.push(element);
  },

  isFull() {
    return this.data.length >= this.BATCH_SIZE;
  },

  undload() {
    const data = [...this.data];
    this.reset();
    return data;
  },

  len() {
    return this.data.length;
  }
};