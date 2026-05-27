import { avg, getBass } from './utils.js';


export default function drawOrb(ctx, freqs, options, colorFn, tmpData, time = 30) {
  const { dataLen, areaX, areaY, areaW, areaH } = options;

  const cx = areaX + areaW / 2;
  const cy = areaY + areaH / 2;
  const radius = Math.min(areaW, areaH) * 0.22;

  const bass = getBass(freqs);

  ctx.save();
  ctx.translate(cx, cy);
  ctx.lineWidth = 2;

  for (let i = 0; i < dataLen; i++) {
    const v = freqs[i] / 255;

    const angle = (i / dataLen) * Math.PI * 2;

    const dynamicRadius =
      radius +
      v * 120 +
      Math.sin(time * 0.002 + i * 0.15) * 8;

    const x1 = Math.cos(angle) * radius;
    const y1 = Math.sin(angle) * radius;

    const x2 = Math.cos(angle) * dynamicRadius;
    const y2 = Math.sin(angle) * dynamicRadius;

    const hue = i / dataLen * 360 + time * 0.03;

    ctx.strokeStyle = `hsla(${hue},100%,60%,0.85)`;

    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
  }

  // ядро
  const glow = radius * (1 + bass * 0.5);

  const grad = ctx.createRadialGradient(
    0,
    0,
    0,
    0,
    0,
    glow
  );

  grad.addColorStop(0, "rgba(255,255,255,0.9)");
  grad.addColorStop(1, "rgba(255,255,255,0)");

  ctx.fillStyle = grad;

  ctx.beginPath();
  ctx.arc(0, 0, glow, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}