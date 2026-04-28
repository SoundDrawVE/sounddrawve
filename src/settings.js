export const settings = {
  aspectRatio: '16:9',
  exportCanvasDimensions: {
    '16:9': { w: 976, h: 549 },
    '9:16': { w: 549, h: 976 }
  },
  fftSize: 128,
  colorType: 'default',
  color: 'rgba(144, 104, 190, 1)',
  coords: null,
  freqType: 'all',
  freqNumber: 64,

  getCanvasExportDimensions() {
    return {...this.exportCanvasDimensions[this.aspectRatio]};
  },

  getCoords() {
    return { ...this.coords };
  },

  setProp(name, value) {
    console.log(name, value);
    this[name] = value;
    if (this.callback) {
      this.callback();
    };
  },

  init(callback) {
    this.callback = callback;
    this.callback();
  }
};

const form = document.getElementById('settings-form');
const selectedColor = document.getElementById('colorCode');
const freqNumber = document.getElementById('freq-number');

form.addEventListener('input', (e) => {
  const field = e.target;
  const fieldName = toCamelCase(field.name);
  let value = field.value;
  
  if (fieldName === 'color') {
    value = selectedColor.value;
  }

  if (fieldName === 'fftSize') {
    settings.setProp('freqNumber', value / 2);
    freqNumber.setAttribute('data-max', value / 2);
    freqNumber.setAttribute('data-value', value / 2);
    freqNumber.textContent = value / 2;
  }

  settings.setProp(fieldName, value);


  if (fieldName === 'aspectRatio') {
    window.dispatchEvent(new Event('resize'));
  }

  if (fieldName === 'colorType') {
    toggleColorPicker();
  }

  if (fieldName === 'visibilityArea') {
    toggleWaveArea();
  }

  if (fieldName === 'freqType') {
    if (value === 'all') {
      settings.setProp('freqNumber', +freqNumber.dataset.max);
      freqNumber.setAttribute('data-max', +freqNumber.dataset.max);
      freqNumber.setAttribute('data-value', +freqNumber.dataset.max);
      freqNumber.textContent = +freqNumber.dataset.max;
    }

    toggleFreqNumberContainer();
  }
});


window.onload = function() {
  form.reset();
};


const freqNumberContainer = document.querySelector('.freq-number-container');
freqNumberContainer.addEventListener('click', (e) => {
  const target = e.target;
  const type = target.dataset.type;
  if (type) {
    const max = +freqNumber.dataset.max;
    const value = +freqNumber.dataset.value;
    let newValue;

    if (type === 'decr') {
      newValue = value - 1;
    } else {
      newValue = value + 1;
    }

    if (newValue > 0 && newValue <= max) {
      settings.setProp('freqNumber', newValue);
      freqNumber.setAttribute('data-value', newValue);
      freqNumber.textContent = newValue;
    }
  }
  e.preventDefault();
});

function toggleFreqNumberContainer() {
  freqNumberContainer.classList.toggle('hide');
}


const pickerContainer = document.querySelector('.color-picker-container');
function toggleColorPicker() {
  pickerContainer.classList.toggle('hide');
}

const soundWaveArea = document.querySelector('.area-container');
function toggleWaveArea() {
  soundWaveArea.classList.toggle('hide');
}

function toCamelCase(str) {
  return str.replace(/[-_](.)/g, (_, char) => char.toUpperCase());
}