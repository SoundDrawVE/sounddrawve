export function randInt(min, max) {
  let rand = min - 0.5 + Math.random() * (max - min + 1);
  return Math.round(rand);
}

export function avg(arr, start = 0, end = arr.length) {
  let s = 0;
  for (let i = Math.round(start); i < end; i++) s += arr[i];
  return s / (end - start);
}

export function getBass(freq) {
  return avg(freq, 0, freq.length * 0.08) / 255;
}

export function getMids(freq) {
  return avg(freq, freq.length * 0.08, freq.length * 0.35) / 255;
}

export function rgbaToHsl(r, g, b) {
    r /= 255; g /= 255; b /= 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h, s, l = (max + min) / 2;

    if (max === min) {
        h = s = 0; // ахроматический
    } else {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
        }
        h /= 6;
    }
    return { h: h * 360, s: s * 100, l: l * 100 };
}

export function getColorChannels(rgba) {
  const channels = rgba.match(/[\d.]+/g); 

  const r = +channels[0];
  const g = +channels[1];
  const b = +channels[2];
  const a = +channels[3];

  return { r, g, b, a };
}
