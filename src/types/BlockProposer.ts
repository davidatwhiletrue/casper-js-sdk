import { jsonObject, jsonMember } from 'typedjson';
import * as keypair from './keypair';

/**
 * Represents a proposer in the blockchain context.
 * A proposer is an entity that proposes new blocks, identified by a public key
 * and an optional system status.
 */
@jsonObject
export class Proposer {
  /**
   * Indicates if the proposer is a system-level entity (without a public key).
   */
  @jsonMember({ name: 'isSystem', constructor: Boolean })
  isSystem: boolean;

  /**
   * Public key of the proposer, defined if the proposer is not a system entity.
   */
  @jsonMember({
    name: 'publicKey',
    constructor: keypair.PublicKey,
    deserializer: json => {
      if (!json) return;
      return keypair.PublicKey.fromJSON(json);
    },
    serializer: value => {
      if (!value) return;
      return value.toJSON();
    }
  })
  publicKey?: keypair.PublicKey;

  /**
   * Constructs a new `Proposer` instance.
   * @param isSystem - Indicates if the proposer is a system-level proposer.
   * @param publicKey - Optional public key if the proposer is not a system entity.
   */
  constructor(isSystem = false, publicKey?: keypair.PublicKey) {
    this.isSystem = isSystem;
    this.publicKey = publicKey;
  }

  /**
   * Creates a `Proposer` instance from a string representation.
   * @param src - A string representing the proposer. '00' indicates a system proposer.
   * @returns A new `Proposer` instance.
   */
  static fromString(src: string): Proposer {
    if (src === '00') {
      return new Proposer(true);
    }
    const pubKey = keypair.PublicKey.fromJSON(src);
    return new Proposer(false, pubKey);
  }

  /**
   * Checks if the proposer is a system-level entity.
   * @returns `true` if the proposer is a system entity, otherwise `false`.
   */
  isSystemProposer(): boolean {
    return this.isSystem;
  }

  /**
   * Retrieves the public key of the proposer.
   * Throws an error if the proposer is a system entity without a public key.
   * @returns The public key of the proposer.
   * @throws Will throw an error if the proposer is a system proposer.
   */
  getPublicKey(): keypair.PublicKey {
    if (this.isSystem) {
      throw new Error("System proposer doesn't have a public key");
    }
    return this.publicKey!;
  }

  /**
   * Retrieves the public key of the proposer, if available.
   * @returns The public key if defined; otherwise, `undefined`.
   */
  getPublicKeyOptional(): keypair.PublicKey | undefined {
    return this.publicKey;
  }

  /**
   * Serializes the proposer instance to JSON.
   * System proposers are represented as '00'; otherwise, the public key is serialized.
   * @returns A JSON string representing the proposer.
   */
  toJSON(): string {
    return this.isSystem ? '00' : this?.publicKey!.toJSON();
  }

  /**
   * Deserializes a JSON string to create a `Proposer` instance.
   * @param json - A JSON string representing the proposer.
   * @returns A new `Proposer` instance.
   */
  static fromJSON(json: string): Proposer {
    if (json === '00') {
      return new Proposer(true);
    }
    const pubKey = keypair.PublicKey.fromJSON(json);
    return new Proposer(false, pubKey);
  }
}
