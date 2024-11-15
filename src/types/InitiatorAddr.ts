import { jsonObject, jsonMember } from 'typedjson';
import { concat } from '@ethersproject/bytes';

import { PublicKey } from './keypair';
import { AccountHash } from './key';

/**
 * Represents an address for an initiator, which can either be a public key or an account hash.
 */
@jsonObject
export class InitiatorAddr {
  /**
   * The public key of the initiator, if available.
   */
  @jsonMember({
    name: 'PublicKey',
    constructor: PublicKey
  })
  public publicKey?: PublicKey;

  /**
   * The account hash of the initiator, if available.
   */
  @jsonMember({
    name: 'AccountHash',
    constructor: AccountHash
  })
  public accountHash?: AccountHash;

  /**
   * Creates an instance of `InitiatorAddr` with an optional public key and account hash.
   *
   * @param publicKey The public key of the initiator.
   * @param accountHash The account hash of the initiator.
   */
  constructor(publicKey?: PublicKey, accountHash?: AccountHash) {
    this.publicKey = publicKey;
    this.accountHash = accountHash;
  }

  /**
   * Converts the `InitiatorAddr` instance to a byte array representation.
   * The result depends on whether the address is a public key or an account hash.
   *
   * @returns A `Uint8Array` representing the initiator address.
   */
  public toBytes(): Uint8Array {
    let result: Uint8Array;

    if (this.accountHash) {
      const prefix = new Uint8Array([1]);
      result = concat([prefix, this.accountHash.toBytes()]);
    } else if (this.publicKey) {
      const prefix = new Uint8Array([0]);
      const publicKeyBytes = this.publicKey.bytes() || new Uint8Array(0);
      result = concat([prefix, publicKeyBytes]);
    } else {
      result = new Uint8Array(0);
    }

    return result;
  }

  /**
   * Creates an `InitiatorAddr` instance from a JSON object.
   * The JSON object can contain either a `publicKey` or an `accountHash` string.
   *
   * @param json The JSON object containing the address data.
   * @returns A new `InitiatorAddr` instance.
   */
  static fromJSON(json: any): InitiatorAddr {
    const initiatorAddr = new InitiatorAddr();
    const jsonPubKey = json?.publicKey || json?.PublicKey;
    const jsonAccountHash = json?.accountHash || json?.AccountHash;

    if (jsonPubKey) {
      initiatorAddr.publicKey = PublicKey.fromHex(jsonPubKey);
    } else if (jsonAccountHash) {
      initiatorAddr.accountHash = AccountHash.fromString(jsonAccountHash);
    }

    return initiatorAddr;
  }

  /**
   * Converts the `InitiatorAddr` instance to a JSON object.
   * The JSON object will contain either a `publicKey` or an `accountHash` depending on which is available.
   *
   * @returns A JSON object representing the initiator address.
   */
  public toJSON(): unknown {
    if (this.accountHash) {
      return {
        AccountHash: this.accountHash.toPrefixedString()
      };
    } else if (this.publicKey) {
      return {
        PublicKey: this.publicKey.toHex()
      };
    }
    return undefined;
  }
}
