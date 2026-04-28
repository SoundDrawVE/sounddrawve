import { settings } from './settings.js';


export function visualizeSpectrum(freq, ctx, canvasDimensions) {
  const areaCoords = settings.getCoords();
  const freqNumber = settings.freqNumber;
  let x = areaCoords.x;

  for (let i = 0; i < freqNumber; i++) {
    const options = {
      ind: i,
      dataLen: freqNumber,
      value: freq[i],
      ctx: ctx,
      canvasW: canvasDimensions.w,
      canvasH: canvasDimensions.h,
      areaX: areaCoords.x,
      areaY: areaCoords.y,
      areaW: areaCoords.w,
      areaH: areaCoords.h,
      shiftX: x,
      barWidth: (areaCoords.w / freqNumber)
    };

    if (settings.colorType === 'default') {
      ctx.fillStyle = calcColor(options);
    } else {
      ctx.fillStyle = settings.color;
    }

    drawBar(options);

    x += options.barWidth;
  }
}


function drawBar({ ctx, value, canvasH, areaH, areaY, shiftX, barWidth }) {
  const k = areaH / 255;
  const d = canvasH - areaH - areaY;
  ctx.fillRect(shiftX, canvasH - value * k - d, barWidth - 1, value * k);
}


function calcColor({ ind, dataLen, value }) {
  return `rgb(${value + 25}, ${250 * (ind / dataLen)}, ${50})`;
}