export const settings = {
  aspectRatio: '16:9',
  exportCanvasDimensions: {
    '16:9': { w: 976, h: 549 },
    '9:16': { w: 549, h: 976 }
  },
  fftSize: 128,
  colorType: 'default',
  color: '',

  getCanvasExportDimensions() {
    return {...this.exportCanvasDimensions[this.aspectRatio]};
  },

  setProp(name, value) {
    this[name] = value;
  }
};

const form = document.getElementById('settings-form');
const selectedColor = document.getElementById('colorCode');
form.addEventListener('input', (e) => {
  const field = e.target;
  const fieldName = toCamelCase(field.name);
  let value = field.value;
  
  if (fieldName === 'color') {
    value = selectedColor.value;
  }

  console.log(fieldName, value);
  settings.setProp(fieldName, value);

  if (fieldName === 'aspectRatio') {
    window.dispatchEvent(new Event('resize'));
  }
});

window.onload = function() {
  form.reset();
};



function toCamelCase(str) {
  return str.replace(/[-_](.)/g, (_, char) => char.toUpperCase());
}