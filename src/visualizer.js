import { settings } from './settings.js';

export function visualizeSpectrum(freq, ctx, canvasDimensions) {
  let x = 0;

  for (let i = 0; i < freq.length; i++) {
    const options = {
      ind: i,
      dataLen: freq.length,
      value: freq[i],
      ctx: ctx,
      canvasW: canvasDimensions.w,
      canvasH: canvasDimensions.h,
      shiftX: x,
      barWidth: (canvasDimensions.w / freq.length) //* 1.19 // * 1.19 to hide zero freq
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


function drawBar({ ctx, value, canvasH, shiftX, barWidth }) {
  ctx.fillRect(shiftX, canvasH - value, barWidth - 1, value);
}


function calcColor({ ind, dataLen, value }) {
  return `rgb(${value + 25}, ${250 * (ind / dataLen)}, ${50})`;
}