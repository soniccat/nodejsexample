export function isString(obj?: any): obj is string {
  return typeof obj === 'string';
}

export function isObject(obj?: any): obj is object {
  return obj != null && typeof obj === 'object';
}

export function isEmptyObject(obj?: any): boolean {
  return isObject(obj) && Object.keys(obj).length === 0;
}