import { BigNumber } from '@ethersproject/bignumber';

import { CLValueUInt128 } from './Uint128';
import { CLValueUInt256 } from './Uint256';
import { CLValueUInt512 } from './Uint512';
import { IResultWithBytes } from './CLValue';

/**
 * Converts a BigNumber to a Uint8Array representation.
 *
 * The resulting Uint8Array has the following structure:
 * - The first byte represents the length of the BigNumber in bytes.
 * - The remaining bytes represent the BigNumber value itself.
 *
 * @param val - The BigNumber to convert.
 * @returns A Uint8Array representation of the BigNumber.
 *
 * @example
 * const bigNum = BigNumber.from('123456789');
 * const bytes = bigToBytes(bigNum);
 * console.log(bytes); // Uint8Array [ 4, 7, 91, 205, 21 ]
 */
export const bigToBytes = (val: BigNumber): Uint8Array => {
  let hex = val.toHexString().slice(2);
  if (hex.length % 2 !== 0) {
    hex = '0' + hex;
  }

  const data = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    data[i / 2] = parseInt(hex.slice(i, i + 2), 16);
  }

  const numberLen = data.length;
  const result = new Uint8Array(numberLen + 1);
  result[0] = numberLen;
  result.set(data, 1);

  return result;
};

/**
 * Converts an ArrayBuffer containing a byte representation of a BigNumber back to a BigNumber.
 *
 * The input ArrayBuffer should have the following structure:
 * - The first byte represents the length of the BigNumber in bytes.
 * - The remaining bytes represent the BigNumber value itself.
 *
 * @param buffer - The ArrayBuffer containing the byte representation of a BigNumber.
 * @returns The BigNumber reconstructed from the byte representation.
 *
 * @example
 * const buffer = new Uint8Array([4, 7, 91, 205, 21]).buffer;
 * const bigNum = bigFromBuffer(buffer);
 * console.log(bigNum.toString()); // '123456789'
 */
export const bigFromBuffer = (buffer: ArrayBuffer): BigNumber => {
  const view = new DataView(buffer);
  const size = view.getUint8(0);
  const data = new Uint8Array(buffer.slice(1, size + 1));

  let hex = '';
  for (let i = 0; i < data.length; i++) {
    const byte = data[i];
    hex += (byte < 16 ? '0' : '') + byte.toString(16);
  }

  return BigNumber.from('0x' + hex);
};

const fromBytesBigIntBase = (
  rawBytes: Uint8Array,
  bitSize: number
): IResultWithBytes<BigNumber> => {
  if (rawBytes.length < 1) {
    throw new Error('Early end of stream: no data to parse.');
  }

  const byteSize = bitSize / 8;
  const n = rawBytes[0];

  if (n > byteSize) {
    throw new Error(
      `Formatting error: byte length ${n} exceeds expected size for ${bitSize}-bit integer.`
    );
  }

  if (n + 1 > rawBytes.length) {
    throw new Error(
      'Early end of stream: insufficient data for specified byte length.'
    );
  }

  const bigIntBytes = n === 0 ? [0] : rawBytes.subarray(1, 1 + n);
  const uintBytes = rawBytes.subarray(1 + n);

  return {
    result: BigNumber.from(bigIntBytes.slice().reverse()),
    bytes: uintBytes
  };
};

export const fromBytesUInt128 = (
  rawBytes: Uint8Array
): IResultWithBytes<CLValueUInt128> => {
  const value = fromBytesBigIntBase(rawBytes, 128);
  return { result: new CLValueUInt128(value?.result), bytes: value?.bytes };
};

export const fromBytesUInt256 = (
  rawBytes: Uint8Array
): IResultWithBytes<CLValueUInt256> => {
  const value = fromBytesBigIntBase(rawBytes, 256);
  return { result: new CLValueUInt256(value?.result), bytes: value?.bytes };
};

export const fromBytesUInt512 = (
  rawBytes: Uint8Array
): IResultWithBytes<CLValueUInt512> => {
  const value = fromBytesBigIntBase(rawBytes, 512);
  return { result: new CLValueUInt512(value?.result), bytes: value?.bytes };
};
