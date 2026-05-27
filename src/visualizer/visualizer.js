import { settings } from '../settings.js';
import drawBars from './bars.js';
import drawStripes from './stripes.js';
import drawBarcaps from './barcaps.js';
import drawDroplets from './droplets.js';
import drawCircles from './circles.js';
import getColorFn from './colors.js';
import drawOrb from './orb.js';


const tmpData = {
  data: [],

  reset() { 
    this.data = [];
  },

  getValue(ind) {
    return this.data[ind];
  },

  setValue(ind, value) {
    this.data[ind] = value;
  }
};

settings.onChange(() => tmpData.reset());


const drawFns = {
  'bars': drawBars,
  'stripes': drawStripes,
  'barcap': drawBarcaps,
  'droplets': drawDroplets,
  'pulsecircle': drawCircles
};


export function visualizeSpectrum(freq, ctx) {
  const areaCoords = settings.getCoords();
  const freqNumber = settings.freqNumber;
  const canvasDimensions = settings.getCanvasDimensions();
  let x = areaCoords.x;

  const options = {
    ind: null,
    dataLen: freqNumber,
    value: null,
    ctx: ctx,
    canvasW: canvasDimensions.w,
    canvasH: canvasDimensions.h,
    areaX: areaCoords.x,
    areaY: areaCoords.y,
    areaW: areaCoords.w,
    areaH: areaCoords.h,
    areaBottom: canvasDimensions.h - areaCoords.h - areaCoords.y,
    shiftX: null,
    barWidth: (areaCoords.w / freqNumber),
    hFactor: areaCoords.h / 255, // height scaling factor
    aFactor: (areaCoords.w * areaCoords.h) / (canvasDimensions.w * canvasDimensions.h), // area scaling factor
    color: settings.color,
    colorType: settings.colorType
  };

  const colorFn = getColorFn(settings.colorType);
  const drawFn = drawFns[settings.visualizationType];

  //drawFn(ctx, freq, options, colorFn, tmpData);

  drawOrb(ctx, freq, options, colorFn, tmpData);
}