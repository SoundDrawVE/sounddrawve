import { getColorChannels } from './utils.js';


export default function drawOscilloscope(ctx, freqs, options, colorFn, tmpData, time = 30, timeData) {
  const { areaX, areaY, areaW, areaH, colorType, color } = options;

  ctx.save();
  ctx.lineWidth = 2.5;

  for (let glow = 0; glow < 4; glow++) {
    ctx.strokeStyle = calcColor(colorType, color, glow);
    ctx.beginPath();

    for (let i = 0; i < timeData.length; i++) {
      const v = timeData[i] / 255;

      const px = areaX + (i / timeData.length) * areaW;
      const py = areaY + areaH / 2 + (v - 0.5) * areaH * 1.8;

      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }

    ctx.stroke();
  }

  ctx.restore();
}


function calcColor(colorType, color, glow) {
  if (colorType === 'default') {
    return `rgba(0,255,255,${0.18 - glow * 0.04})`;
  } else {
    const userColor = getColorChannels(color);
    return `rgba(${userColor.r},${userColor.g},${userColor.b},${0.18 - glow * 0.04})`;
  }
}