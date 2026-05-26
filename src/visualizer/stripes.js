export default function drawStripes(ctx, freqs, options, colorFn) {
  const { dataLen, areaX, barWidth} = options;
  let x = areaX;
  
  for (let i = 0; i < dataLen; i++) {
    options.ind = i;
    options.value = freqs[i];
    options.shiftX = x;

    ctx.fillStyle = colorFn(options);
    drawStripe(options);

    x += barWidth;
  }
}

function drawStripe({ ctx, value, canvasH, areaBottom, shiftX, barWidth, hFactor }) {
  const stripeH = 3;
  const gapX = 1;

  const x = shiftX;
  let y = canvasH - value * hFactor - areaBottom;
  const w = barWidth - gapX;
  const h = stripeH;

  if (value === 0) y -= stripeH;

  ctx.fillRect(x, y, w, h);
}