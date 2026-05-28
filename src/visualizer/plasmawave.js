import { getBass, getMids } from './utils.js';


export default function drawPlasma(ctx, freq, rect, time = 30) {
  const { x, y, width, height } = rect;

  const bass = getBass(freq);
  const mids = getMids(freq);
  const cell = 10;
  const gap = 1;

  for (let px = 0; px < width; px += cell) {
    for (let py = 0; py < height; py += cell) {

      const nx = px / width;
      const ny = py / height;

      const v =
        Math.sin(nx * 10 + time * 0.0015) +
        Math.sin(ny * 12 + time * 0.0012) +
        Math.sin((nx + ny) * 8 + time * 0.002);

      const intensity =
        (v * 0.5 + 0.5) * (0.4 + bass * 1.4);

      const hue =
        220 +
        intensity * 120 +
        mids * 100 +
        Math.sin(time * 0.001) * 40;

      const saturation = 100;
      const lightness = 40 + intensity * 40;
      const alpha = 0.7;

      ctx.fillStyle = `hsla(${hue},${saturation}%,${lightness}%,${alpha})`;

      ctx.fillRect(
        x + px,
        y + py,
        cell - gap,
        cell - gap
      );
    }
  }
}