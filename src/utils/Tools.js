
export const isObject = function (obj) {
  return obj != null && typeof obj === 'object';
};

export const isEmptyArray = function (array) {
  return Array.isArray(array) && array.length == 0;
};
