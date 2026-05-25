export const settings = {
  aspectRatio: '16:9',
  canvasDimensions: null,
  exportCanvasDimensions: {
    '16:9': { w: 1920, h: 1080 },
    '9:16': { w: 720, h: 1280 } // { w: 549, h: 976 }
  },
  fftSize: 128,
  colorType: 'default',
  color: 'rgba(144, 104, 190, 1)',
  coords: null,
  //exportCoords: null,
  freqType: 'all',
  freqNumber: 64,
  visualizationType: 'bars',
  mode: 'visualize',
  callbacks: [],


  getCanvasExportDimensions() {
    return { ...this.exportCanvasDimensions[this.aspectRatio] };
  },

  getCanvasDimensions() {
    if (this.mode === 'render') {
      return { ...this.exportCanvasDimensions[this.aspectRatio] };
    } else {
      return { ...this.canvasDimensions };
    }
  },

  getCoords(mode) {
    const coords = { ... this.coords };
    if (this.mode === 'render') {
      const renderH = this.exportCanvasDimensions[this.aspectRatio].h;
      const h = this.canvasDimensions.h;
      const k = renderH / h;
      for (let prop in coords) {
        coords[prop] *= k;
      }
      return coords;
    } else {
      return coords;
   }
  },

  setProp(name, value) {
    console.log(name, value);
    this[name] = value;
    this.callbacks.forEach(f => f());
  },

  onChange(fn) {
    this.callbacks.push(fn);
  }
};


const form = document.getElementById('settings-form');
form.addEventListener('input', (e) => {
  const field = e.target;
  const fieldName = toCamelCase(field.name || field.dataset.name);
  let value = field.value || field.dataset.value;


  if (fieldName === 'fftSize') {
    settings.setProp('freqNumber', value / 2);
  } else if (fieldName === 'freqType' && value === 'all') {
    settings.setProp('freqNumber', settings.fftSize / 2);
  }

  settings.setProp(fieldName, value);
});


function toCamelCase(str) {
  return str.replace(/[-_](.)/g, (_, char) => char.toUpperCase());
}