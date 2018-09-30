import * as React from 'react';

export type DictType<V> = {[key: string] : V} | {[key: number] : V};
export type RefDictType<V> = DictType<React.RefObject<V>>;

export function ensureRef<K extends number | string, R>(key:K, refStore:RefDictType<R>, newRefStore:RefDictType<R>): React.RefObject<R> {
  let ref = refStore[key as number | string];
  if (ref == null) {
    ref = createRef();
  }

  newRefStore[key as number | string] = ref;
  return ref;
}

function createRef<T>() {
  return React.createRef<T>();
}
