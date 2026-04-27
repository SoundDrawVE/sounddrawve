const canvasContainer = document.querySelector('.canvas-container');
const canvas = document.getElementById('canvas');
const areaContainer = document.querySelector('.area-container');
const area = document.getElementById('area');

let isDragging = false;
let areaX = 0;
let areaY = canvas.offsetHeight - 255;
let startX, startY;


area.addEventListener('mousedown', (e) => {
  if (e.target.classList.contains('resizer')) {
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

    // Ограничение в пределах контейнера
    const containerRect = areaContainer.getBoundingClientRect();
    const areaRect = area.getBoundingClientRect();

    if (newLeft < 0) newLeft = 0;
    if (newTop < 0) newTop = 0;
    if (newLeft + areaRect.width > containerRect.width) newLeft = containerRect.width - areaRect.width;
    if (newTop + areaRect.height > containerRect.height) newTop = containerRect.height - areaRect.height;

    area.style.left = newLeft + 'px';
    area.style.top = newTop + 'px';

    areaX = newLeft;
    areaY = newTop;
  }
});


document.addEventListener('mouseup', () => {
  isDragging = false;
  area.style.cursor = 'move';
});


export function initArea() {
  areaContainer.style.top = canvas.offsetTop + 'px';
  areaContainer.style.left = canvas.offsetLeft + 'px';
  areaContainer.style.width = canvas.clientWidth + 'px';
  areaContainer.style.height = canvas.clientHeight + 'px';
}

window.addEventListener('resize', initArea);