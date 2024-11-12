import { jsonMember, jsonObject } from 'typedjson';
import { Hash } from './Hash';
import { PrefixName } from './Key';

/**
 * Represents a contract package hash in the system.
 */
@jsonObject
export class ContractPackageHash {
  /**
   * The hash of the contract package.
   */
  @jsonMember({ name: 'hash', constructor: Hash })
  hash: Hash;

  /**
   * The original prefix of the contract package hash string, if any.
   */
  @jsonMember({ name: 'originPrefix', constructor: String })
  originPrefix: string;

  /**
   * Creates a new ContractPackageHash instance.
   * @param hash - The Hash object representing the contract package hash.
   * @param originPrefix - The original prefix of the contract package hash string.
   */
  constructor(hash: Hash, originPrefix: string) {
    this.hash = hash;
    this.originPrefix = originPrefix;
  }

  /**
   * Converts the ContractPackageHash to its JSON representation.
   * @returns A string representation of the ContractPackageHash, including the original prefix.
   */
  toJSON(): string {
    return this.originPrefix + this.hash.toHex();
  }

  /**
   * Returns the contract package hash as a prefixed string.
   * @returns The contract package hash with the ContractPackage prefix.
   */
  toPrefixedString(): string {
    return PrefixName.ContractPackage + this.hash.toHex();
  }

  /**
   * Creates a ContractPackageHash instance from its JSON representation.
   * @param json - The JSON string representation of the ContractPackageHash.
   * @returns A new ContractPackageHash instance.
   */
  static fromJSON(json: string): ContractPackageHash {
    return ContractPackageHash.newContractPackage(json);
  }

  /**
   * Creates a new ContractPackageHash instance from a string representation.
   * @param source - The string representation of the contract package hash.
   * @returns A new ContractPackageHash instance.
   */
  static newContractPackage(source: string): ContractPackageHash {
    let originPrefix = '';
    if (source.startsWith(PrefixName.Hash)) {
      originPrefix = PrefixName.Hash;
    } else if (source.startsWith(PrefixName.ContractPackageWasm)) {
      originPrefix = PrefixName.ContractPackageWasm;
    } else if (source.startsWith(PrefixName.ContractPackage)) {
      originPrefix = PrefixName.ContractPackage;
    }

    const hexBytes = Hash.fromHex(source.slice(originPrefix.length));
    return new ContractPackageHash(hexBytes, originPrefix);
  }
}
