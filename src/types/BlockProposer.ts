import { jsonObject, jsonMember } from 'typedjson';
import * as keypair from './keypair';

@jsonObject
export class Proposer {
  @jsonMember({ name: 'isSystem', constructor: Boolean })
  isSystem: boolean;

  @jsonMember({ name: 'publicKey', constructor: keypair.PublicKey })
  publicKey?: keypair.PublicKey;

  constructor(isSystem = false, publicKey?: keypair.PublicKey) {
    this.isSystem = isSystem;
    this.publicKey = publicKey;
  }

  static fromString(src: string): Proposer {
    if (src === '00') {
      return new Proposer(true);
    }
    const pubKey = keypair.PublicKey.fromJSON(src);
    return new Proposer(false, pubKey);
  }

  isSystemProposer(): boolean {
    return this.isSystem;
  }

  getPublicKey(): keypair.PublicKey {
    if (this.isSystem) {
      throw new Error("System proposer doesn't have a public key");
    }
    return this.publicKey!;
  }

  getPublicKeyOptional(): keypair.PublicKey | undefined {
    return this.publicKey;
  }

  toJSON(): string {
    return this.isSystem ? '00' : JSON.stringify(this.publicKey);
  }

  static fromJSON(json: string): Proposer {
    if (json === '00') {
      return new Proposer(true);
    }
    const pubKey = keypair.PublicKey.fromJSON(json);
    return new Proposer(false, pubKey);
  }
}
