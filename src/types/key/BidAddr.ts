import { BigNumber } from '@ethersproject/bignumber';

import { jsonObject, jsonMember } from 'typedjson';
import { Hash } from './Hash';
import { IResultWithBytes } from '../clvalue';

/**
 * Enum representing the types of bid addresses.
 * Each type corresponds to a unique tag value that identifies the specific type of bid address.
 */
export enum BidAddrTag {
  Unified = 0,
  Validator = 1,
  Delegator = 2,
  Credit = 4
}

/** Error thrown when an invalid BidAddrTag is encountered. */
export const ErrInvalidBidAddrTag = new Error('invalid BidAddrTag');

/** Error thrown when an unexpected BidAddrTag is found in a BidAddr. */
export const ErrUnexpectedBidAddrTagInBidAddr = new Error(
  'unexpected BidAddrTag in BidAddr'
);

/** Error thrown when the BidAddr format is invalid. */
export const ErrInvalidBidAddrFormat = new Error('invalid BidAddr format');

/**
 * Utility class for handling operations related to BidAddrTag.
 */
export class BidAddrTagUtils {
  /**
   * Converts a byte to a BidAddrTag.
   * @param tag - The byte value to convert.
   * @returns The corresponding BidAddrTag.
   * @throws {ErrInvalidBidAddrTag} If the byte doesn't match a valid BidAddrTag.
   */
  static fromByte(tag: number): BidAddrTag {
    const addrTag = tag as BidAddrTag;
    if (
      addrTag !== BidAddrTag.Unified &&
      addrTag !== BidAddrTag.Validator &&
      addrTag !== BidAddrTag.Delegator &&
      addrTag !== BidAddrTag.Credit
    ) {
      throw ErrInvalidBidAddrTag;
    }
    return addrTag;
  }
}

const UnifiedOrValidatorAddrLen = 33;
const CreditAddrLen = 41;

/**
 * Represents information for a delegator in a Delegator BidAddr.
 */
@jsonObject
export class DelegatorInfo {
  /** The validator hash associated with this delegator. */
  @jsonMember({
    name: 'Validator',
    constructor: Hash,
    deserializer: json => Hash.fromJSON(json),
    serializer: value => value.toJSON()
  })
  validator: Hash;

  /** The delegator's hash. */
  @jsonMember({
    name: 'Delegator',
    constructor: Hash,
    deserializer: json => Hash.fromJSON(json),
    serializer: value => value.toJSON()
  })
  delegator: Hash;
}

/**
 * Represents credit information within a Credit BidAddr.
 */
@jsonObject
export class CreditInfo {
  /** The validator associated with this credit. */
  @jsonMember({
    name: 'Validator',
    constructor: Hash,
    deserializer: json => Hash.fromJSON(json),
    serializer: value => value.toJSON()
  })
  validator: Hash;

  /** The era ID for this credit. */
  @jsonMember({ name: 'EraId', constructor: Number })
  eraId: number;
}

/**
 * Represents a bid address, which can store information for unified, validator, delegator, or credit types.
 */
@jsonObject
export class BidAddr {
  /** The unified hash if this is a unified bid address. */
  @jsonMember({ name: 'Unified', constructor: Hash })
  unified?: Hash;

  /** The validator hash if this is a validator bid address. */
  @jsonMember({ name: 'Validator', constructor: Hash })
  validator?: Hash;

  /** The delegator information if this is a delegator bid address. */
  @jsonMember({ name: 'Delegator', constructor: DelegatorInfo })
  delegator?: DelegatorInfo;

  /** The credit information if this is a credit bid address. */
  @jsonMember({ name: 'Credit', constructor: CreditInfo })
  credit?: CreditInfo;

  /**
   * Constructs a new BidAddr instance.
   * @param unified - The unified hash.
   * @param validator - The validator hash.
   * @param delegator - The delegator information.
   * @param credit - The credit information.
   */
  constructor(
    unified?: Hash,
    validator?: Hash,
    delegator?: { validator: Hash; delegator: Hash },
    credit?: {
      validator: Hash;
      eraId: number;
    }
  ) {
    this.unified = unified;
    this.validator = validator;
    this.delegator = delegator;
    this.credit = credit;
  }

  /**
   * Creates a BidAddr from a hexadecimal string.
   * @param source - The hexadecimal string.
   * @returns A new BidAddr instance.
   * @throws {ErrInvalidBidAddrFormat} If the format is invalid.
   * @throws {ErrUnexpectedBidAddrTagInBidAddr} If an unexpected tag is encountered.
   */
  static fromHex(source: string): BidAddr {
    const hexBytes = Buffer.from(source, 'hex');
    if (hexBytes.length < UnifiedOrValidatorAddrLen)
      throw ErrInvalidBidAddrFormat;

    const bidAddrTag = BidAddrTagUtils.fromByte(hexBytes[0]);

    if (hexBytes.length === UnifiedOrValidatorAddrLen) {
      const hash = Hash.fromBytes(hexBytes.slice(1))?.result;
      switch (bidAddrTag) {
        case BidAddrTag.Unified:
          return new BidAddr(hash);
        case BidAddrTag.Validator:
          return new BidAddr(undefined, hash);
        default:
          throw ErrUnexpectedBidAddrTagInBidAddr;
      }
    }

    const validatorHash = Hash.fromBytes(hexBytes.slice(1, 33));

    if (hexBytes.length === CreditAddrLen) {
      const eraId = hexBytes.readUInt32LE(33);
      return new BidAddr(undefined, undefined, undefined, {
        validator: validatorHash?.result,
        eraId
      });
    }

    const delegatorHash = Hash.fromBytes(hexBytes.slice(33));
    return new BidAddr(undefined, undefined, {
      validator: validatorHash?.result,
      delegator: delegatorHash?.result
    });
  }

  /**
   * Creates a BidAddr from a byte array.
   * @param bytes - The byte array.
   * @returns A new BidAddr instance.
   * @throws {ErrInvalidBidAddrFormat} If the format is invalid.
   */
  static fromBytes(bytes: Uint8Array): IResultWithBytes<BidAddr> {
    if (bytes.length < UnifiedOrValidatorAddrLen) throw ErrInvalidBidAddrFormat;

    const tag = bytes[0];
    const rem = bytes.subarray(1);
    const bidAddrTag = BidAddrTagUtils.fromByte(tag);

    if (bidAddrTag === BidAddrTag.Unified) {
      const { result: unifiedHash, bytes } = Hash.fromBytes(rem);
      return { result: new BidAddr(unifiedHash), bytes };
    }

    if (bidAddrTag === BidAddrTag.Validator) {
      const { result: validatorHash, bytes } = Hash.fromBytes(rem);
      return { result: new BidAddr(undefined, validatorHash), bytes };
    }

    if (bidAddrTag === BidAddrTag.Delegator) {
      const { result: validatorHash, bytes: delegatorBytes } = Hash.fromBytes(
        rem
      );
      const { result: delegatorHash, bytes } = Hash.fromBytes(delegatorBytes!);

      return {
        result: new BidAddr(undefined, undefined, {
          validator: validatorHash,
          delegator: delegatorHash
        }),
        bytes
      };
    }

    // Credit
    const { result: validatorHash, bytes: validatorBytes } = Hash.fromBytes(
      rem
    );
    const u64Bytes = Uint8Array.from(validatorBytes!.subarray(0, 8));
    const eraId = BigNumber.from(u64Bytes.slice().reverse());

    return {
      result: new BidAddr(undefined, undefined, undefined, {
        validator: validatorHash,
        eraId: eraId?.toNumber()
      }),
      bytes: validatorBytes
    };
  }

  /**
   * Returns a prefixed string representation of the BidAddr.
   * @returns The prefixed string representation.
   */
  toPrefixedString(): string {
    return `bid-addr-${this.toHex()}`;
  }

  /**
   * Returns a hexadecimal string representation of the BidAddr.
   * @returns The hexadecimal string representation.
   * @throws {Error} If the BidAddr type is unexpected.
   */
  toHex(): string {
    switch (true) {
      case !!this.unified:
        return `${BidAddrTag.Unified}${this.unified!.toHex()}`;
      case !!this.validator:
        return `${BidAddrTag.Validator}${this.validator!.toHex()}`;
      case !!this.delegator:
        return `${
          BidAddrTag.Delegator
        }${this.delegator!.validator.toHex()}${this.delegator!.delegator.toHex()}`;
      case !!this.credit:
        const validatorHex = this.credit!.validator.toHex();
        const eraIdHex = Buffer.alloc(8);
        eraIdHex.writeUInt32LE(this.credit!.eraId, 0);
        return `${BidAddrTag.Credit}${validatorHex}${eraIdHex.toString('hex')}`;
      default:
        throw new Error('Unexpected BidAddr type');
    }
  }

  /**
   * Converts the BidAddr to a byte array.
   * @returns The byte array representation of the BidAddr.
   * @throws {Error} If the BidAddr type is unexpected.
   */
  toBytes(): Uint8Array {
    const typeByte = this.getTypeByte();
    let result = Buffer.alloc(0);

    switch (typeByte) {
      case BidAddrTag.Unified:
        result = Buffer.concat([
          Buffer.from([typeByte]),
          this.unified!.toBytes()
        ]);
        break;
      case BidAddrTag.Validator:
        result = Buffer.concat([
          Buffer.from([typeByte]),
          this.validator!.toBytes()
        ]);
        break;
      case BidAddrTag.Delegator:
        if (this.delegator) {
          result = Buffer.concat([
            Buffer.from([typeByte]),
            this.delegator.validator.toBytes(),
            this.delegator.delegator.toBytes()
          ]);
        }
        break;
      case BidAddrTag.Credit:
        if (this.credit) {
          const eraIdBuffer = Buffer.alloc(8);
          eraIdBuffer.writeBigUInt64LE(BigInt(this.credit.eraId), 0);
          result = Buffer.concat([
            Buffer.from([typeByte]),
            this.credit.validator.toBytes(),
            eraIdBuffer
          ]);
        }
        break;
      default:
        throw new Error('Unexpected BidAddr type');
    }

    return new Uint8Array(result);
  }

  /**
   * Gets the type byte of the BidAddr.
   * @returns The type byte.
   * @throws {Error} If the BidAddr type is not set.
   */
  private getTypeByte(): number {
    if (this.unified) return BidAddrTag.Unified;
    if (this.validator) return BidAddrTag.Validator;
    if (this.delegator) return BidAddrTag.Delegator;
    if (this.credit) return BidAddrTag.Credit;
    throw new Error('BidAddr type is not set');
  }

  /**
   * Creates a BidAddr from its JSON representation.
   * @param json - The JSON string.
   * @returns A new BidAddr instance.
   */
  public static fromJSON(json: string): BidAddr {
    return this.fromHex(json);
  }

  /**
   * Converts the BidAddr to its JSON representation.
   * @returns The JSON string representation.
   */
  public toJSON(): string {
    return this.toPrefixedString();
  }
}
