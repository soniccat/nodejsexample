
export function isObject(obj: any) : boolean {
  return obj != null && typeof obj === 'object';
}

export function isEmptyArray(array: any) : boolean {
  return Array.isArray(array) && array.length === 0;
}
