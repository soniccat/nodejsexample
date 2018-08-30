export function isString(obj?: any) {
  return typeof obj === 'string';
}

export function isObject(obj?: any) {
  return obj != null && typeof obj === 'object';
}
