import { jsonObject, jsonMember } from 'typedjson';

/**
 * A container for contract's WASM bytes.
 */
@jsonObject
export class ContractWasm {
  /**
   * The WASM bytes of the contract as a string.
   */
  @jsonMember({ name: 'bytes', constructor: String })
  public bytes!: string;

  constructor(bytes: string) {
    this.bytes = bytes;
  }
}
