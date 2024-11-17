import { TypedJSON } from 'typedjson';
import humanizeDuration from 'humanize-duration';
import { Args } from './Args';
import { Conversions } from './Conversions';

/**
 * Serializes a `Uint8Array` into a hexadecimal string.
 *
 * @param bytes The `Uint8Array` to be serialized.
 * @returns A base-16 encoded string of the provided byte array.
 */
export const byteArrayJsonSerializer: (bytes: Uint8Array) => string = (
  bytes: Uint8Array
) => {
  return Conversions.encodeBase16(bytes);
};

/**
 * Serializes a `Uint8Array` into a hexadecimal string, but only if the value is not `undefined`.
 *
 * @param bytes The `Uint8Array` to be serialized (or `undefined`).
 * @returns A base-16 encoded string of the provided byte array, or `undefined` if input is `undefined`.
 *
 * @note It's suggested to swap the names of this function with `byteArrayJsonSerializer` for better clarity. This function handles `undefined` inputs, while `byteArrayJsonSerializer` should handle only `Uint8Array` directly.
 */
export const undefinedSafeByteArrayJsonSerializer: (
  bytes: Uint8Array | undefined
) => string | undefined = (bytes: Uint8Array | undefined) => {
  if (!bytes) {
    return undefined;
  }
  return Conversions.encodeBase16(bytes);
};

/**
 * Deserializes a hexadecimal string into a `Uint8Array`.
 *
 * @param str The base-16 encoded string to be deserialized.
 * @returns The decoded `Uint8Array` corresponding to the hexadecimal string.
 */
export const byteArrayJsonDeserializer: (str: string) => Uint8Array = (
  str: string
) => {
  return Conversions.decodeBase16(str);
};

/**
 * Deserializes a hexadecimal string into a `Uint8Array`, but only if the value is not `undefined`.
 *
 * @param str The base-16 encoded string to be deserialized (or `undefined`).
 * @returns The decoded `Uint8Array` corresponding to the hexadecimal string, or `undefined` if input is `undefined`.
 */
export const undefinedSafeByteArrayJsonDeserializer: (
  str: string | undefined
) => Uint8Array | undefined = (str: string | undefined) => {
  if (!str) {
    return undefined;
  }
  return Conversions.decodeBase16(str);
};

/**
 * A humanizer configuration for time durations in short English format (days, hours, minutes, seconds, milliseconds).
 */
const shortEnglishHumanizer = humanizeDuration.humanizer({
  spacer: '',
  serialComma: false,
  conjunction: ' ',
  delimiter: ' ',
  language: 'shortEn',
  languages: {
    // Mapping of duration units to shorter names
    shortEn: {
      d: () => 'day',
      h: () => 'h',
      m: () => 'm',
      s: () => 's',
      ms: () => 'ms'
    }
  }
});

/**
 * Returns a human-readable time duration for a given time-to-live (TTL) in milliseconds.
 *
 * @param ttl The TTL in milliseconds.
 * @returns A human-readable string representation of the TTL, such as "1d 2h 3m 4s".
 */
export const humanizerTTL = (ttl: number) => {
  return shortEnglishHumanizer(ttl);
};

/**
 * Converts a human-readable time duration (e.g., "1d 2h 3m 4s") back to a time-to-live (TTL) in milliseconds.
 *
 * @param ttl The human-readable string representing the time duration.
 * @returns The TTL in milliseconds.
 * @throws Error if an unsupported TTL unit is encountered.
 */
export const dehumanizerTTL = (ttl: string): number => {
  const dehumanizeUnit = (s: string): number => {
    if (s.includes('ms')) {
      return Number(s.replace('ms', ''));
    }
    if (s.includes('s') && !s.includes('m')) {
      return Number(s.replace('s', '')) * 1000;
    }
    if (s.includes('m') && !s.includes('s')) {
      return Number(s.replace('m', '')) * 60 * 1000;
    }
    if (s.includes('h')) {
      return Number(s.replace('h', '')) * 60 * 60 * 1000;
    }
    if (s.includes('day')) {
      return Number(s.replace('day', '')) * 24 * 60 * 60 * 1000;
    }
    throw Error('Unsupported TTL unit');
  };

  return ttl
    .split(' ')
    .map(dehumanizeUnit)
    .reduce((acc, val) => (acc += val));
};

/**
 * Deserializes an array of runtime arguments to a `RuntimeArgs` object.
 *
 * @param arr The array of serialized runtime arguments.
 * @returns A `RuntimeArgs` object containing the deserialized arguments.
 */
export const deserializeArgs = (arr: any) => {
  const raSerializer = new TypedJSON(Args);
  const value = {
    args: arr
  };
  return raSerializer.parse(value);
};

/**
 * Serializes a `RuntimeArgs` object to a byte array.
 *
 * @param ra The `RuntimeArgs` object to be serialized.
 * @returns A byte array representing the serialized runtime arguments.
 */
export const serializeArgs = (ra: Args) => {
  const raSerializer = new TypedJSON(Args);
  const json = raSerializer.toPlainJson(ra);
  return Object.values(json as any)[0];
};

/**
 * Compares two arrays for equality.
 * @param a The first array.
 * @param b The second array.
 * @returns `true` if the arrays are equal, `false` otherwise.
 */
export const arrayEquals = (a: Uint8Array, b: Uint8Array): boolean => {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) return false;
  }
  return true;
};
