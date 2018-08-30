export function isString(obj?: any): obj is string {
  return typeof obj === 'string';
}

export function isObject(obj?: any): obj is object {
  return obj != null && typeof obj === 'object';
}
