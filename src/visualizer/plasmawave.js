import { getBass, getMids, getColorChannels, rgbaToHsl } from './utils.js';


export default function drawPlasma(ctx, freqs, options, colorFn, tmpData, time = 30) {
  const {areaX, areaY, areaW, areaH, aFactor, colorType, color } = options;

  const bass = getBass(freqs);
  const mids = getMids(freqs);
  let cell = 20 * aFactor;
  const gap = 1;

  if (cell < 5) cell = 5;

  for (let px = 0; px < areaW; px += cell) {
    for (let py = 0; py < areaH; py += cell) {

      const nx = px / areaW;
      const ny = py / areaH;

      const v =
        Math.sin(nx * 10 + time * 0.0015) +
        Math.sin(ny * 12 + time * 0.0012) +
        Math.sin((nx + ny) * 8 + time * 0.002);

      const intensity =
        (v * 0.5 + 0.5) * (0.4 + bass * 1.4);

      if (colorType !== 'default') {
        ctx.fillStyle = calcCustomColor(intensity, mids, time, color);
      } else {
        ctx.fillStyle = calcDefaultColor(intensity, mids, time);
      }

      ctx.fillRect(
        areaX + px,
        areaY + py,
        cell - gap,
        cell - gap
      );
    }
  }
}


function calcCustomColor(intensity, mids, time, color) {
  const userColor = getColorChannels(color);
  const base = rgbaToHsl(userColor.r, userColor.g, userColor.b);

  const k = 0.5;

  const hue = 
    ( base.h + 
      intensity * 120 * k + mids * 100 * k + 
      Math.sin(time * 0.001) * 40 ) % 360;

  const saturation = base.s; 
  const lightness = Math.min(100, base.l + intensity * (100 - base.l) * 0.8);
  const alpha = userColor.a;

  return `hsla(${hue}, ${saturation}%, ${lightness}%, ${alpha})`;
}


function calcDefaultColor(intensity, mids, time) {
  const hue =
    220 +
    intensity * 120 +
    mids * 100 +
    Math.sin(time * 0.001) * 40;

  const saturation = 100;
  const lightness = 40 + intensity * 40;
  const alpha = 0.7;

  return `hsla(${hue},${saturation}%,${lightness}%,${alpha})`;
}