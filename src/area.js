import { settings } from './settings.js';

const canvas = document.getElementById('canvas');
const areaContainer = document.querySelector('.area-container');
const area = document.getElementById('area');

let isDragging = false;
let isResizing = false;
let currentResizer = null;
let areaX = 0;
let areaY = 0;
let areaW = 0;
let areaH = 0;
let startX, startY;
const minW = 100, minH = 50;


let areaCoords = { ...getInitiaCoords() };
// initial area coords
settings.setProp('coords', { ...getInitiaCoords() });

function getInitiaCoords() {
  return {
    x: 0,
    y: canvas.clientHeight - 255,
    w: canvas.clientWidth,
    h: 255
  }
}


area.addEventListener('mousedown', (e) => {
  if (e.target.classList.contains('resizer')) {
    isResizing = true;
    currentResizer = e.target;
    initResize(e);
    return;
  }

  isDragging = true;
  startX = e.clientX - area.offsetLeft;
  startY = e.clientY - area.offsetTop;
  area.style.cursor = 'grabbing';
});


document.addEventListener('mousemove', (e) => {
  if (isDragging) {
    let newLeft = e.clientX - startX;
    let newTop = e.clientY - startY;

    const containerRect = areaContainer.getBoundingClientRect();
    const areaRect = area.getBoundingClientRect();

    if (newLeft < 0) newLeft = 0;
    if (newTop < 0) newTop = 0;
    if (newLeft + areaRect.width > containerRect.width) newLeft = containerRect.width - areaRect.width;
    if (newTop + areaRect.height > containerRect.height) newTop = containerRect.height - areaRect.height;

    area.style.left = newLeft + 'px';
    area.style.top = newTop + 'px';

    areaCoords.x = newLeft;
    areaCoords.y = newTop;

  } else if (isResizing) {
    doResize(e);
  }

  if (isDragging || isResizing) {
    settings.setProp('coords', { ...areaCoords });
  }
});


document.addEventListener('mouseup', () => {
  isDragging = false;
  isResizing = false;
  area.style.cursor = 'move';
});


function initResize(e) {
  startX = e.clientX;
  startY = e.clientY;
  areaW = area.offsetWidth;
  areaH = area.offsetHeight;
  areaX = area.offsetLeft;
  areaY = area.offsetTop;
  // prevent selection
  e.preventDefault();
}


function doResize(e) {
  const direction = currentResizer.getAttribute('data-direction');
  const containerRect = areaContainer.getBoundingClientRect();

  if (direction.includes('right')) {
    let newWidth = areaW + (e.clientX - startX);
    if (areaX + newWidth <= containerRect.width && newWidth >= minW) {
      area.style.width = newWidth + 'px';
      areaCoords.w = newWidth;
    }
  }

  if (direction.includes('left')) {
    let newWidth = areaW - (e.clientX - startX);
    let newLeft = areaX + (e.clientX - startX);
    if (newWidth >= minW && newLeft >= 0) {
      area.style.width = newWidth + 'px';
      area.style.left = newLeft + 'px';
      areaCoords.w = newWidth;
      areaCoords.x = newLeft;
    }
  }

  if (direction.includes('bottom')) {
    let newHeight = areaH + (e.clientY - startY);
    if (areaY + newHeight <= containerRect.height && newHeight >= minH) {
      area.style.height = newHeight + 'px';
      areaCoords.h = newHeight;
    }
  }

  if (direction.includes('top')) {
    let newHeight = areaH - (e.clientY - startY);
    let newTop = areaY + (e.clientY - startY);
    if (newHeight >= minH && newTop >= 0) {
      area.style.height = newHeight + 'px';
      area.style.top = newTop + 'px';
      areaCoords.h = newHeight;
      areaCoords.y = newTop;
    }
  }
}


export function initArea() {
  areaContainer.style.top = canvas.offsetTop + 'px';
  areaContainer.style.left = canvas.offsetLeft + 'px';
  areaContainer.style.width = canvas.clientWidth + 'px';
  areaContainer.style.height = canvas.clientHeight + 'px';
}


window.addEventListener('resize', () => {
  initArea();
  area.style.width = canvas.clientWidth + 'px';
  area.style.height = 255 + 'px';
  area.style.left = 0 + 'px';
  area.style.top = canvas.clientHeight - 255 + 'px';
  settings.setProp('coords', getInitiaCoords());
  areaCoords = getInitiaCoords();
});