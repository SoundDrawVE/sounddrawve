export default function getColorFn(colorType) {
  const colorFns = {
    'default': calcColor,
    'rainbow': rainbowColor,
    'enhanced': enhanceColor,
    'select': (options) => options.color
  };

  return colorFns[colorType]
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