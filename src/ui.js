document.getElementById('settings-form').addEventListener('click', (e) => {
  // Toggle menu item options
  const settingsItem = e.target.closest('.item');
  if (settingsItem) {
    const expand = settingsItem.nextElementSibling;
    const chevron = settingsItem.querySelector('.chevron');
    const groupItem = settingsItem.parentNode;
    if (expand) expand.classList.toggle('open');
    if (chevron) chevron.classList.toggle('open');
    if (groupItem) groupItem.classList.toggle('active');
  }

  // Highlight the currently selected option
  const itemOption = e.target.closest('.option');
  if (itemOption) {
    const text = itemOption.querySelector('.checkmark').textContent;
    const expand = itemOption.parentNode;
    const settingsItem = expand.previousElementSibling;
    if (settingsItem) {
      const value = settingsItem.querySelector('.value');
      value.textContent = text.length > 9 ? `${text.slice(0, 6)}...` : text;
      expand.querySelectorAll('.option').forEach(el => el.classList.remove('active'));
      itemOption.classList.add('active');
    }
  }

  // Toggle option settings
  if (e.target.classList.contains('checkmark')) {
    const expand = itemOption.parentNode
    const lastElm = expand.lastElementChild;
    if (!lastElm.classList.contains('option')) {
      lastElm.classList.toggle('hide');
    }
  }

  // Toggle visualization area
  if (e.target.dataset.name && e.target.dataset.name === 'visibility-area') {
    document.querySelector('.area-container').classList.toggle('hide');
  }

  // Dispatch a resize event if the aspect ratio option is selected
  if (e.target.dataset.name && e.target.dataset.name === 'aspect-ratio') {
    // Wait for the aspect ratio value to update
    setTimeout(() => {
      window.dispatchEvent(new Event('resize', { bubbles: true }));
    }, 100);
  }

  // Update frequencies number when fft size is changed
  if (e.target.dataset.name && e.target.dataset.name === 'fft-size') {
    const freqNumber = document.getElementById('freq-number');
    const input = e.target.previousElementSibling;
    const newValue = input.value / 2;
    freqNumber.setAttribute('data-max', newValue);
    freqNumber.setAttribute('data-value', newValue);
    freqNumber.textContent = newValue;
  }

  // Update frequencies number when the all option is selected
  if (e.target.dataset.name && e.target.dataset.name === 'freq-type') {
    const value = e.target.dataset.value;
    if (value === 'all') {
      const freqNumber = document.getElementById('freq-number');
      freqNumber.setAttribute('data-max', freqNumber.dataset.max);
      freqNumber.setAttribute('data-value', freqNumber.dataset.max);
      freqNumber.textContent = freqNumber.dataset.max;
    }
  }
});


const freqNumberContainer = document.querySelector('.freq-number-container');
const freqNumber = document.getElementById('freq-number');
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
      freqNumber.setAttribute('data-value', newValue);
      freqNumber.textContent = newValue;
      const event = new Event('input', { bubbles: true });
      freqNumber.dispatchEvent(event);
    }
  }
  e.preventDefault();
});


// Reset form when page is loaded
const form = document.getElementById('settings-form');
window.onload = function() {
  form.reset();
};