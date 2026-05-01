import { settings } from './settings.js';
import droplet from './assets/droplet2.png';


export function visualizeSpectrum(freq, ctx) {
  const areaCoords = settings.getCoords();
  const freqNumber = settings.freqNumber;
  const canvasDimensions = settings.getCanvasDimensions();
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

    if (settings.visualizationType === 'bars') {
      drawBar(options);
    } else if (settings.visualizationType === 'stripes') {
      drawStripe(options);
    } else if (settings.visualizationType === 'barcap') {
      drawBarcap(options);
    } else if (settings.visualizationType === 'droplets') {
      drawDroplet(options);
    }

    x += options.barWidth;
  }
}

const tmpData = {
  data: [],

  reset() { 
    this.data = [];
  },

  getValue(ind) {
    return this.data[ind];
  },

  setValue(ind, value) {
    this.data[ind] = value;
  }
};

settings.onChange(() => tmpData.reset());


const dropletImg = new Image();
dropletImg.src = droplet;
dropletImg.onload = () => { console.log('droplet img loaded!'); }

function drawDroplet({ ind, ctx, value, canvasW, canvasH, areaW, areaH, areaX, areaY, shiftX }) {
  const k = (areaW * areaH) /(canvasW * canvasH);
  const maxSpeed = 5;
  const areaK = value * 0.0001 * Math.exp(k);
  const imgW = dropletImg.width * areaK;
  const imgH = dropletImg.height * areaK;
  const angleRad = 25 * Math.PI / 180;

  let flakeCoords = tmpData.getValue(ind);
  if (!flakeCoords) {
    flakeCoords = calcInitialCoords();
  }

  updateCoords();
  // ctx.beginPath();
  // ctx.arc(flakeCoords.x, flakeCoords.y, flakeCoords.r, 0, 2 * Math.PI);
  // ctx.fill();
  ctx.save();
  ctx.translate(flakeCoords.x, flakeCoords.y);
  ctx.rotate(angleRad);
  ctx.drawImage(dropletImg, -imgW / 2 , -imgH / 2, imgW, imgH);
  ctx.restore();
  tmpData.setValue(ind, flakeCoords);

  function updateCoords() {
    let speedY = value * maxSpeed / 255;
    let speedX = speedY / 3;
    if (speedY < 1) {
      speedY = 1;
      speedX = 1 / 3;
    }

    flakeCoords.x -= speedX;
    flakeCoords.y += speedY;

    if (flakeCoords.x < areaX + imgW / 2 || flakeCoords.y > areaY + areaH - imgH / 2) {
      flakeCoords = calcInitialCoords();
    }
  }

  function calcInitialCoords() {
    return {
      x: randInt(areaX, areaX + areaW),
      y: randInt(areaY, areaY + areaH),
      // r: value * 0.015 * Math.exp(k)
    };
  }
}


function drawBarcap({ ind, ctx, value, canvasH, areaH, areaY, shiftX, barWidth }) {
  const k = areaH / 255;
  const d = canvasH - areaH - areaY;
  const capH = 3;
  const barH = value * k - capH * 2;
  const barY = canvasH - barH - d;

  let capCoords = tmpData.getValue(ind);
  if (!capCoords) capCoords = calcInitialCoords();
  updateCoords();
  // draw
  ctx.fillRect(shiftX, barY, barWidth - 1, barH);
  ctx.fillRect(capCoords.x, capCoords.y, capCoords.w, capCoords.h);
  tmpData.setValue(ind, capCoords);

  function updateCoords() {
    capCoords.y += 1;
    if (capCoords.y > barY - capH * 2) capCoords.y = barY - capH * 2;
    if (capCoords.y > canvasH - d - capH * 2) capCoords.y = canvasH - d - capH * 2;
  }

  function calcInitialCoords() {
    return {
      x: shiftX,
      y: barY - capH * 2,
      w: barWidth - 1,
      h: capH
    };
  }
}


function drawStripe({ ctx, value, canvasH, areaH, areaY, shiftX, barWidth }) {
  const gap = 5, stripeH = 3;
  const k = areaH / 255;
  const d = canvasH - areaH - areaY;
  ctx.fillRect(shiftX, canvasH - value * k - d, barWidth - 1, stripeH);
}


function drawBar({ ctx, value, canvasH, areaH, areaY, shiftX, barWidth }) {
  const k = areaH / 255;
  const d = canvasH - areaH - areaY;
  ctx.fillRect(shiftX, canvasH - value * k - d, barWidth - 1, value * k);
}


function calcColor({ ind, dataLen, value }) {
  return `rgb(${value + 25}, ${250 * (ind / dataLen)}, ${50})`;
}


function randInt(min, max) {
  let rand = min - 0.5 + Math.random() * (max - min + 1);
  return Math.round(rand);
}