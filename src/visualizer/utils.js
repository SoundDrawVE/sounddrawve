export function randInt(min, max) {
  let rand = min - 0.5 + Math.random() * (max - min + 1);
  return Math.round(rand);
}

export function avg(arr, start = 0, end = arr.length) {
  let s = 0;
  for (let i = start; i < end; i++) s += arr[i];
  return s / (end - start);
}

export function getBass(freq) {
  return avg(freq, 0, freq.length * 0.08) / 255;
}