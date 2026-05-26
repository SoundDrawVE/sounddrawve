import { settings } from '../settings.js';
import droplet from '../assets/droplet2.png';


export function visualizeSpectrum(freq, ctx) {
  const areaCoords = settings.getCoords();
  const freqNumber = settings.freqNumber;
  const canvasDimensions = settings.getCanvasDimensions();
  let x = areaCoords.x;

  const options = {
    ind: null,
    dataLen: freqNumber,
    value: null,
    ctx: ctx,
    canvasW: canvasDimensions.w,
    canvasH: canvasDimensions.h,
    areaX: areaCoords.x,
    areaY: areaCoords.y,
    areaW: areaCoords.w,
    areaH: areaCoords.h,
    areaBottom: canvasDimensions.h - areaCoords.h - areaCoords.y,
    shiftX: null,
    barWidth: (areaCoords.w / freqNumber),
    hFactor: areaCoords.h / 255, // height scaling factor
    aFactor: (areaCoords.w * areaCoords.h) / (canvasDimensions.w * canvasDimensions.h), // area scaling factor
    color: settings.color
  };

  

  for (let i = 0; i < freqNumber; i++) {
    options.ind = i;
    options.value = freq[i];
    options.shiftX = x;

    let color;
    switch (settings.colorType) {
      case 'default':
        color = calcColor(options);
        break;
      case 'rainbow':
        color = rainbowColor(options);
        break;
      case 'enhanced':
        color = enhanceColor(options);
        break;
      default:
        color = settings.color;
    }

    ctx.fillStyle = color;


    if (settings.visualizationType === 'bars') {
      drawBar(options);
    } else if (settings.visualizationType === 'stripes') {
      drawStripe(options);
    } else if (settings.visualizationType === 'barcap') {
      drawBarcap(options);
    } else if (settings.visualizationType === 'droplets') {
      drawDroplet(options);
    } else if (settings.visualizationType === 'pulsecircle') {
      drawPulsatingCircle(options);
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


function drawBar({ ctx, value, canvasH, areaBottom, shiftX, barWidth, hFactor }) {
  ctx.fillRect(shiftX, canvasH - value * hFactor - areaBottom - 2, barWidth - 1, value * hFactor + 2);
}


const dropletImg = new Image();
dropletImg.src = droplet;
dropletImg.onload = () => { console.log('droplet img loaded!'); }

function drawDroplet({ ind, ctx, value, canvasW, canvasH, areaW, areaH, areaX, areaY, shiftX, aFactor }) {
  const maxSpeed = 5;
  const areaK = value * 0.0001 * Math.exp(aFactor);
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
      // r: value * 0.015 * Math.exp(aFactor)
    };
  }
}


function drawBarcap({ ind, ctx, value, canvasH, areaBottom, shiftX, barWidth, hFactor }) {
  const capH = 3, gap = 3;
  let barH = value * hFactor;
  if (barH > capH + gap) barH -= capH + gap;
  const barY = canvasH - barH - areaBottom;

  let capCoords = tmpData.getValue(ind);
  if (!capCoords) capCoords = calcInitialCoords();
  updateCoords();
  // draw
  ctx.fillRect(shiftX, barY, barWidth - 1, barH);
  ctx.fillRect(capCoords.x, capCoords.y, capCoords.w, capCoords.h);
  tmpData.setValue(ind, capCoords);

  function updateCoords() {
    capCoords.y += 1;
    if (capCoords.y > barY - capH - gap) capCoords.y = barY - capH - gap;
    if (capCoords.y > canvasH - areaBottom - capH - gap) capCoords.y = canvasH - areaBottom - capH - gap;
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


function drawPulsatingCircle({ ind, ctx, value, canvasW, canvasH, areaW, areaH, areaX, areaY, aFactor }) {
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


function drawStripe({ ctx, value, canvasH, areaBottom, shiftX, barWidth, hFactor }) {
  const gap = 5, stripeH = 3;
  ctx.fillRect(shiftX, canvasH - value * hFactor - areaBottom, barWidth - 1, stripeH);
}


function calcColor({ ind, dataLen, value }) {
  return `rgb(${value + 25}, ${250 * (ind / dataLen)}, ${50})`;
}

// Red #e81416 rgb(232, 20, 22)
// Orange  #ffa500 rgb(255, 165, 0)
// Yellow  #faeb36 rgb(250, 235, 54)
// Green #79c314 rgb(121, 195, 20)
// Blue  #487de7 rgb(72, 125, 231)
// Indigo  #4b369d rgb(75, 54, 157)
// Violet  #70369d rgb(112, 54, 157)
function rainbowColor({ ctx, value, canvasH, areaBottom, hFactor }) {
  const ROYGBIV = {
    Red: { hex: '#e81416', rgb: { r: 232, g: 20, b: 22 } },
    Orange: { hex: '#ffa500', rgb: { r: 255, g: 165, b: 0 } },
    Yellow: { hex: '#faeb36', rgb: { r: 250, g: 235, b: 54 } },
    Green: { hex: '#79c314', rgb: { r: 121, g: 195, b: 20 } },
    Blue: { hex: '#487de7', rgb: { r: 72, g: 125, b: 231 } },
    Indigo: { hex: '#4b369d', rgb: { r: 75, g: 54, b: 157 } },
    Violet: { hex: '#70369d', rgb: { r: 112, g: 54, b: 157 } }
  };

  const keys = ['Red', 'Orange', 'Yellow', 'Green', 'Blue', 'Indigo', 'Violet'];

  const index = Math.floor(value * 7 / 255);
  const activeColorsKeys = keys.slice(0, index + 1);
  const activeColors = activeColorsKeys.map(key => ROYGBIV[key].hex);

  if (activeColors.length === 1) return activeColors[0];

  const rectHeight = value * hFactor + 2;
  const rectY = canvasH - value * hFactor - areaBottom - 2; // Y-координата верхнего края прямоугольника

  // Создаем градиент снизу вверх: 
  // startY = rectY + rectHeight (нижняя точка), endY = rectY (верхняя точка)
  let gradient = ctx.createLinearGradient(0, rectY + rectHeight, 0, rectY);

  // Добавляем цвета в градиент
  activeColors.forEach((color, i) => {
    // Вычисляем позицию цвета от 0 до 1 (снизу вверх)
    let position = i / (activeColors.length - 1);
    gradient.addColorStop(position, color);
  });

  return gradient;
}


function enhanceColor({ color, value }) {
  //const rgbaStr = "rgba(144, 104, 190, 1)";
  const channels = color.match(/[\d.]+/g); 
  // Возвращает массив: ["144", "104", "190", "1"]

  const r = +channels[0]; // 144
  const g = +channels[1]; // 104
  const b = +channels[2]; // 190
  const a = +channels[3]; // 1

  const threshold = 5;
  let gap = Math.floor(value * 7 / 255);

  // if (gap < 3) {
  //   gap = gap * (-1) * (threshold / 3);
  // } else {
  //   gap = gap * threshold;
  // }

  gap = gap * threshold;

  const enhancedChannels = [r, g, b].map(ch => ch + gap > 254 ? 255 : ch + gap);

  return `rgba(${enhancedChannels.join(',')},${a})`;
}


function randInt(min, max) {
  let rand = min - 0.5 + Math.random() * (max - min + 1);
  return Math.round(rand);
}