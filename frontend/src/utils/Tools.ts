
export function isObject(obj) {
  return obj != null && typeof obj === 'object';
}

export function isEmptyArray(array) {
  return Array.isArray(array) && array.length === 0;
}
