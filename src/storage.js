export const queue = {
  data: [],

  saveItem(item) {
    this.data.push(item)
  },

  getItem(index) {
    return this.data[index];
  },

  totalItems() {
    return this.data.length;
  },

  clear() {
    this.data = [];
  }
};


export const batch = {
  BATCH_SIZE: 10,
  data: [],

  reset() {
    this.data = [];
  },

  add(element) {
    this.data.push(element);
  },

  isFull() {
    return this.data.length >= this.BATCH_SIZE;
  },

  undload() {
    const data = [...this.data];
    this.reset();
    return data;
  },

  len() {
    return this.data.length;
  }
};