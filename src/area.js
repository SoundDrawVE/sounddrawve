const canvasContainer = document.querySelector('.canvas-container');
const canvas = document.getElementById('canvas');
const areaContainer = document.querySelector('.area-container');

export function initArea() {
  areaContainer.style.top = canvas.offsetTop + 'px';
  areaContainer.style.left = canvas.offsetLeft + 'px';
  areaContainer.style.width = canvas.clientWidth + 'px';
  areaContainer.style.height = canvas.clientHeight + 'px';
}

window.addEventListener('resize', initArea);