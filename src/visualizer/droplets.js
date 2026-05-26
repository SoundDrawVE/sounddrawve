import droplet from '../assets/droplet2.png';
import { randInt } from './utils.js';


export default function drawDroplets(ctx, freqs, options, colorFn, tmpData) {
  const { dataLen, areaX, barWidth} = options;
  let x = areaX;
  
  for (let i = 0; i < dataLen; i++) {
    options.ind = i;
    options.value = freqs[i];
    options.shiftX = x;

    ctx.fillStyle = colorFn(options);
    drawDroplet(options, tmpData);

    x += barWidth;
  }
}


const dropletImg = new Image();
dropletImg.src = droplet;
dropletImg.onload = () => { console.log('droplet img loaded!'); }


function drawDroplet(options, tmpData) {
  const { ind, ctx, value, areaW, areaH, areaX, areaY, aFactor } = options;

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