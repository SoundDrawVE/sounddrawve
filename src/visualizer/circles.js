import { randInt } from './utils.js';


export default function drawCircles(ctx, freqs, options, colorFn, tmpData) {
  const { dataLen, areaX, barWidth} = options;
  let x = areaX;
  
  for (let i = 0; i < dataLen; i++) {
    options.ind = i;
    options.value = freqs[i];
    options.shiftX = x;

    ctx.fillStyle = colorFn(options);
    drawPulsatingCircle(options, tmpData);

    x += barWidth;
  }
}


function drawPulsatingCircle(options, tmpData) {
  const { ind, ctx, value, areaW, areaH, areaX, areaY, aFactor } = options;

  let coords = tmpData.getValue(ind);
  if (!coords) coords = calcInitialCoords();
  updateCoords();

  ctx.beginPath();
  ctx.arc(coords.x, coords.y, coords.r, 0, 2 * Math.PI);
  ctx.fill();
  ctx.strokeStyle = ctx.fillStyle;
  ctx.beginPath();
  ctx.arc(coords.x, coords.y, coords.r + 5, 0, 2 * Math.PI);
  ctx.stroke();

  tmpData.setValue(ind, coords);

  function updateCoords() {
    coords.r = value * 0.015 * Math.exp(aFactor);
  }

  function calcInitialCoords() {
    return {
      x: randInt(areaX, areaX + areaW),
      y: randInt(areaY, areaY + areaH),
      r: 0
    };
  }
}