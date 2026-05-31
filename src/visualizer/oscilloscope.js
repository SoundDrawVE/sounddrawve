export default function drawOscilloscope(ctx, freqs, options, colorFn, tmpData, time = 30, timeData) {
  const { x, y, width, height } = options;

  ctx.save();
  ctx.lineWidth = 2.5;

  for (let glow = 0; glow < 4; glow++) {
    ctx.strokeStyle = `rgba(0,255,255,${0.18 - glow * 0.04})`;
    ctx.beginPath();

    for (let i = 0; i < timeData.length; i++) {
      const v = timeData[i] / 255;

      const px = x + (i / timeData.length) * width;
      const py = y + height / 2 + (v - 0.5) * height * 0.8;

      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }

    ctx.stroke();
  }

  ctx.restore();
}