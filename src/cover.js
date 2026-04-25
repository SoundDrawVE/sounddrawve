const cover = document.getElementById('cover');
const message = document.querySelector('.cover-message');
let presavedSpinner = null;


window.addEventListener('load', removeCover);
// Force remove loader after 5 seconds if window.load hasn't fired
//setTimeout(removeCover, 5000);


export function removeCover() {
  const spinner = document.querySelector('.spinner');
  if (spinner) presavedSpinner = cover.removeChild(spinner);
  cover.style.display = 'none';
}

export function showCover() {
  cover.style.display = '';
  updateMessage('');
  cover.prepend(presavedSpinner);
}

export function updateMessage(text) {
  message.textContent = text;
}