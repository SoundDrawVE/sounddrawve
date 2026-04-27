import { settings } from './settings.js';


const container = document.querySelector('.canvas-container');
export const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

let w, h;

export function setDimensions() {
  const conWidth = container.clientWidth;
  const conHeight = container.clientHeight;
  const { aspectRatio } = settings;

  switch (aspectRatio) {
    case '16:9': {
      w = conWidth;
      h = (conWidth / 16) * 9;

      if (h > conHeight) {
        h = conHeight;
        w = (conHeight / 9) * 16;
      }

      break;
    };

    case '9:16': {
      h = conHeight;
      w = (h / 16) * 9;
      break;
    }
  }

  w = w - w * 0.01;
  h = h - h * 0.01;

  canvas.width = w;
  canvas.height = h;

}

setDimensions();
window.addEventListener('resize', setDimensions);


export function getCanvasCtx() {
  return canvas.getContext("2d");
}

export function clearCanvas() {
  ctx.clearRect(0, 0, w, h);
}

export function getCanvasDimensions() {
  return {w, h};
}