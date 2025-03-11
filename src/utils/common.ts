export function getEnumKeyByValue<T extends object>(
  enumObj: T,
  value: T[keyof T]
): string | undefined {
  return Object.keys(enumObj).find(key => enumObj[key as keyof T] === value);
}

/**
 * Compares two `Uint8Array`s
 * @param a The first `Uint8Array`
 * @param b The second `Uint8Array`
 * @returns `true` if the two `Uint8Array`s match, and `false` otherwise
 */
export const arrayEquals = (a: Uint8Array, b: Uint8Array): boolean => {
  return a.length === b.length && a.every((val, index) => val === b[index]);
};
