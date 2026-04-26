const canvas = document.getElementById('colorCanvas');
const ctx = canvas.getContext('2d', { willReadFrequently: true });
const hueSlider = document.getElementById('hueRange');
const opacitySlider = document.getElementById('opacityRange');
const preview = document.getElementById('colorPreview');
const code = document.getElementById('colorCode');

let currentHue = 0;

export function drawCanvas() {
    const width = canvas.width;
    const height = canvas.height;

    // 1. Fill base Hue
    ctx.fillStyle = `hsl(${currentHue}, 100%, 50%)`;
    ctx.fillRect(0, 0, width, height);

    // 2. Add Saturation (White to Transparent)
    let whiteGrad = ctx.createLinearGradient(0, 0, width, 0);
    whiteGrad.addColorStop(0, 'rgba(255,255,255,1)');
    whiteGrad.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = whiteGrad;
    ctx.fillRect(0, 0, width, height);

    // 3. Add Value (Transparent to Black)
    let blackGrad = ctx.createLinearGradient(0, 0, 0, height);
    blackGrad.addColorStop(0, 'rgba(0,0,0,0)');
    blackGrad.addColorStop(1, 'rgba(0,0,0,1)');
    ctx.fillStyle = blackGrad;
    ctx.fillRect(0, 0, width, height);
}

function getColor(e) {
    // Get mouse/touch position
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Get pixel data
    const imageData = ctx.getImageData(x, y, 1, 1).data;
    const opacity = opacitySlider.value / 100;
    
    const rgba = `rgba(${imageData[0]}, ${imageData[1]}, ${imageData[2]}, ${opacity})`;
    
    updateUI(rgba);
}

function updateUI(rgba) {
    preview.style.backgroundColor = rgba;
    code.value = rgba;
    
    // Update opacity slider track color for visual feedback
    const baseColor = `rgb(${rgba.split('(')[1].split(',').slice(0,3).join(',')})`;
    opacitySlider.style.background = `linear-gradient(to right, transparent, ${baseColor})`;
}

// Listeners
hueSlider.addEventListener('input', () => {
    currentHue = hueSlider.value;
    drawCanvas();
});

opacitySlider.addEventListener('input', () => {
    // Re-calculate based on last picked color logic
    // For simplicity, we just trigger the UI update
    updateUI(code.value.replace(/[^,]+(?=\))/, opacitySlider.value / 100));
});

canvas.addEventListener('mousedown', (e) => {
    getColor(e);
    const moveHandler = (ev) => getColor(ev);
    window.addEventListener('mousemove', moveHandler);
    window.addEventListener('mouseup', () => {
        window.removeEventListener('mousemove', moveHandler);
    }, { once: true });
});

// Initialize
//drawCanvas();
