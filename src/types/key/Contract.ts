import { jsonMember, jsonObject } from 'typedjson';
import { Hash } from './Hash';
import { PrefixName } from './Key';

/**
 * Represents a contract hash in the system.
 */
@jsonObject
export class ContractHash {
  /**
   * The hash of the contract.
   */
  @jsonMember({ name: 'hash', constructor: Hash })
  hash: Hash;

  /**
   * The original prefix of the contract hash string, if any.
   */
  @jsonMember({ name: 'originPrefix', constructor: String })
  originPrefix: string;

  /**
   * Creates a new ContractHash instance.
   * @param hash - The Hash object representing the contract hash.
   * @param originPrefix - The original prefix of the contract hash string.
   */
  constructor(hash: Hash, originPrefix: string) {
    this.hash = hash;
    this.originPrefix = originPrefix;
  }

  /**
   * Converts the ContractHash to its JSON representation.
   * @returns A string representation of the ContractHash, including the original prefix.
   */
  toJSON(): string {
    return this.originPrefix + this.hash.toHex();
  }

  /**
   * Returns the contract hash as a prefixed WASM string.
   * @returns The contract hash with the ContractWasm prefix.
   */
  toPrefixedWasmString(): string {
    return PrefixName.ContractWasm + this.hash.toHex();
  }

  /**
   * Returns the contract hash as a prefixed string.
   * @returns The contract hash with the Contract prefix.
   */
  toPrefixedString(): string {
    return PrefixName.Contract + this.hash.toHex();
  }

  /**
   * Creates a ContractHash instance from its JSON representation.
   * @param json - The JSON string representation of the ContractHash.
   * @returns A new ContractHash instance.
   */
  static fromJSON(json: string): ContractHash {
    return ContractHash.newContract(json);
  }

  /**
   * Creates a new ContractHash instance from a string representation.
   * @param source - The string representation of the contract hash.
   * @returns A new ContractHash instance.
   */
  static newContract(source: string): ContractHash {
    let originPrefix = '';
    if (source.startsWith(PrefixName.Hash)) {
      originPrefix = PrefixName.Hash;
    } else if (source.startsWith(PrefixName.ContractWasm)) {
      originPrefix = PrefixName.ContractWasm;
    } else if (source.startsWith(PrefixName.Contract)) {
      originPrefix = PrefixName.Contract;
    }
    const hexBytes = Hash.fromHex(source.slice(originPrefix.length));
    return new ContractHash(hexBytes, originPrefix);
  }
}
