export default function drawBars(ctx, freqs, options, colorFn) {
  const { dataLen, areaX, barWidth} = options;
  let x = areaX;
  
  for (let i = 0; i < dataLen; i++) {
    options.ind = i;
    options.value = freqs[i];
    options.shiftX = x;

    ctx.fillStyle = colorFn(options);
    drawBar(options);

    x += barWidth;
  }
}


function drawBar({ ctx, value, canvasH, areaBottom, shiftX, barWidth, hFactor }) {
  const minH = 2;
  const gapX = 1;
  const barH = value * hFactor;

  const x = shiftX;
  let y = canvasH - barH - areaBottom;
  const w = barWidth - gapX;
  let h = barH;

  if (h === 0) {
    h = minH;
    y -= minH;
  }

  ctx.fillRect(x, y, w, h);
}