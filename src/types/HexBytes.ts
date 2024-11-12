import { jsonObject, jsonArrayMember } from 'typedjson';

@jsonObject
export class HexBytes {
  @jsonArrayMember(Uint8Array)
  bytes: Uint8Array;

  constructor(bytes: Uint8Array) {
    this.bytes = bytes;
  }

  toHex(): string {
    return Array.from(this.bytes)
      .map(byte => byte.toString(16).padStart(2, '0'))
      .join('');
  }

  toJSON(): string {
    return this.toHex();
  }

  static fromHex(hexString: string): HexBytes {
    const bytes = new Uint8Array(
      hexString.match(/.{1,2}/g)!.map(byte => parseInt(byte, 16))
    );
    return new HexBytes(bytes);
  }

  static fromJSON(json: string): HexBytes {
    return HexBytes.fromHex(json);
  }

  toString(): string {
    return this.toHex();
  }
}
