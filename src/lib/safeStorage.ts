/**
 * Safe Storage & JSON utilities for Blaze Music
 * Guarantees zero circular structure errors and safe DOM-node stripping.
 */

const nativeStringify = JSON.stringify;

export function safeJsonStringify(
  value: any,
  replacer?: any,
  space?: string | number
): string {
  const seen = new WeakSet();

  const safeReplacer = function (this: any, key: string, val: any) {
    let currentVal = val;
    if (typeof replacer === 'function') {
      try {
        currentVal = replacer.call(this, key, val);
      } catch {
        return undefined;
      }
    }

    if (currentVal === null || currentVal === undefined) {
      return currentVal;
    }

    // Ignore React Fiber and internal properties
    if (
      typeof key === 'string' &&
      (key.startsWith('__react') ||
        key.startsWith('_react') ||
        key === 'stateNode' ||
        key === 'nativeEvent' ||
        key === 'return' ||
        key === 'child' ||
        key === 'sibling')
    ) {
      return undefined;
    }

    if (typeof currentVal === 'function' || typeof currentVal === 'symbol') {
      return undefined;
    }

    // If DOM node or window or React synthetic event or FiberNode
    if (typeof currentVal === 'object') {
      if (
        typeof currentVal.nodeType === 'number' ||
        typeof currentVal.nodeName === 'string' ||
        (currentVal.constructor &&
          (currentVal.constructor.name === 'SyntheticBaseEvent' ||
            currentVal.constructor.name.includes('Event') ||
            currentVal.constructor.name.includes('HTML') ||
            currentVal.constructor.name.includes('Fiber') ||
            currentVal.constructor.name === 'Window')) ||
        ('stateNode' in currentVal && '_reactRootContainer' in currentVal)
      ) {
        return undefined;
      }

      if (seen.has(currentVal)) {
        return undefined;
      }
      seen.add(currentVal);
    }

    return currentVal;
  };

  try {
    return nativeStringify(value, safeReplacer, space);
  } catch (err) {
    return '{}';
  }
}


export function safeLocalStorageSet(key: string, value: any): void {
  try {
    if (typeof value === 'string') {
      localStorage.setItem(key, value);
    } else {
      const stringified = safeJsonStringify(value);
      localStorage.setItem(key, stringified);
    }
  } catch (err) {
    console.warn(`Failed to safely set localStorage key "${key}":`, err);
  }
}

export function safeLocalStorageGet<T>(key: string, fallback: T): T {
  try {
    const item = localStorage.getItem(key);
    if (!item) return fallback;
    const parsed = JSON.parse(item);
    if (parsed === null || parsed === undefined) return fallback;
    return parsed as T;
  } catch (err) {
    console.warn(`Failed to safely get localStorage key "${key}":`, err);
    return fallback;
  }
}

