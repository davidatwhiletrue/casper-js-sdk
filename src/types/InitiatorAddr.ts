import { jsonObject, jsonMember } from 'typedjson';
import { concat } from '@ethersproject/bytes';

import { PublicKey } from './keypair';
import { AccountHash } from './key';

@jsonObject
export class InitiatorAddr {
  @jsonMember({ name: 'PublicKey', constructor: PublicKey })
  public publicKey?: PublicKey;

  @jsonMember({ name: 'AccountHash', constructor: AccountHash })
  public accountHash?: AccountHash;

  constructor(publicKey?: PublicKey, accountHash?: AccountHash) {
    this.publicKey = publicKey;
    this.accountHash = accountHash;
  }

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

  static fromJSON(json: string): InitiatorAddr {
    let parsed;
    try {
      parsed = JSON.parse(json);
    } catch {
      throw new Error('Invalid JSON input for InitiatorAddr');
    }

    const initiatorAddr = new InitiatorAddr();

    if (parsed.publicKey) {
      initiatorAddr.publicKey = PublicKey.fromHex(parsed.publicKey);
    } else if (parsed.accountHash) {
      initiatorAddr.accountHash = AccountHash.fromString(parsed.accountHash);
    }

    return initiatorAddr;
  }

  public toJSON(): unknown {
    if (this.accountHash) {
      return {
        accountHash: this.accountHash.toPrefixedString()
      };
    } else if (this.publicKey) {
      return {
        publicKey: this.publicKey.toHex()
      };
    }
    return undefined;
  }
}
