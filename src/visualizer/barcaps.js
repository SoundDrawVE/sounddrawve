export default function drawBarcaps(ctx, freqs, options, colorFn, tmpData) {
  const { dataLen, areaX, barWidth} = options;
  let x = areaX;
  
  for (let i = 0; i < dataLen; i++) {
    options.ind = i;
    options.value = freqs[i];
    options.shiftX = x;

    ctx.fillStyle = colorFn(options);
    drawBarcap(options, tmpData);

    x += barWidth;
  }
}


function drawBarcap(options, tmpData) {
  const { ind, ctx, value, canvasH, areaBottom, shiftX, barWidth, hFactor } = options;

  const capH = 3;
  const minH = 2;
  const gap = 3;
  const gapX = 1;

  let barH = value * hFactor;
  const barX = shiftX;
  let barY = canvasH - barH - areaBottom;
  const barW = barWidth - gapX;

  if (barH === 0) {
    barH = minH;
    barY -= minH;
  }

  if (barH > capH + gap) {
    barH -= capH + gap;
    barY += capH + gap;
  }

  let capCoords = tmpData.getValue(ind);
  if (!capCoords) capCoords = calcInitialCoords();
  updateCoords();

  ctx.fillRect(barX, barY, barW, barH);
  ctx.fillRect(capCoords.x, capCoords.y, capCoords.w, capCoords.h);

  tmpData.setValue(ind, capCoords);


  function updateCoords() {
    const bcY = barY - capH - gap;
    const cmY = canvasH - areaBottom - capH - gap;

    capCoords.y += 1;
    // Raising the cap to the top of the bar while touching in the movement of the bar up and the cap down
    if (capCoords.y > bcY) capCoords.y = bcY;
    // When the cap reaches the bottom, it just lies there
    if (capCoords.y > cmY) capCoords.y = cmY;
  }

  function calcInitialCoords() {
    return {
      x: shiftX,
      y: barY - capH - gap,
      w: barWidth - 1,
      h: capH
    };
  }
}