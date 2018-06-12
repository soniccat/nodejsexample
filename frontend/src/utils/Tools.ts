
export function isObject(obj: any) {
  return obj != null && typeof obj === 'object';
}

export function isEmptyArray(array: any) {
  return Array.isArray(array) && array.length === 0;
}
