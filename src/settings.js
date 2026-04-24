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
    this[name] = value;
  }
};