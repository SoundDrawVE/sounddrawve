export const settings = {
  aspectRatio: '16:9',
  exportCanvasDimensions: {
    '16:9': { w: 976, h: 549 },
    '9:16': { w: 549, h: 976 }
  },

  getCanvasExportDimensions() {
    return {...this.exportCanvasDimensions[this.aspectRatio]};
  },

  setProp(name, value) {
    console.log(name, value);
    this[name] = value;
  }
};

const form = document.getElementById('settings-form');
form.addEventListener('input', (e) => {
  const field = e.target;
  const fieldName = toCamelCase(field.name);
  
  settings.setProp(fieldName, field.value);

  if (fieldName === 'aspectRatio') {
    window.dispatchEvent(new Event('resize'));
  }
});


function toCamelCase(str) {
  return str.replace(/[-_](.)/g, (_, char) => char.toUpperCase());
}