const container = document.querySelector('#app');
export const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

let w, h;

function setDimensions() {
  const conWidth = container.clientWidth;
  const conHeight = container.clientHeight;

  w = conWidth;
  h = (conWidth / 16) * 9;

  if (h > conHeight) {
    h = conHeight;
    w = (conHeight / 9) * 16;
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