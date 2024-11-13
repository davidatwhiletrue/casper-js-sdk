import { concat } from '@ethersproject/bytes';

import { jsonObject, jsonMember } from 'typedjson';
import { Hash } from './key';
import { CLValueUInt64 } from './clvalue';

/**
 * Enum representing the different pricing modes available.
 */
export enum PricingModeTag {
  /** Classic pricing mode */
  Classic = 0,
  /** Fixed pricing mode */
  Fixed = 1,
  /** Reserved pricing mode */
  Reserved = 2
}

/**
 * Represents the classic pricing mode, including parameters for gas price tolerance,
 * payment amount, and standard payment.
 */
@jsonObject
export class ClassicMode {
  /**
   * The tolerance for gas price fluctuations in classic pricing mode.
   */
  @jsonMember({ name: 'gas_price_tolerance', constructor: Number })
  gasPriceTolerance: number;

  /**
   * The payment amount associated with classic pricing mode.
   */
  @jsonMember({ name: 'payment_amount', constructor: Number })
  paymentAmount: number;

  /**
   * Whether the payment is a standard payment.
   */
  @jsonMember({ name: 'standard_payment', constructor: Boolean })
  standardPayment: boolean;
}

/**
 * Represents the fixed pricing mode, including a parameter for gas price tolerance.
 */
@jsonObject
export class FixedMode {
  /**
   * The tolerance for gas price fluctuations in fixed pricing mode.
   */
  @jsonMember({ name: 'gas_price_tolerance', constructor: Number })
  gasPriceTolerance: number;
}

/**
 * Represents the reserved pricing mode, which includes a receipt hash.
 */
@jsonObject
export class ReservedMode {
  /**
   * The receipt associated with the reserved pricing mode.
   */
  @jsonMember({
    name: 'receipt',
    constructor: Hash,
    deserializer: json => Hash.fromJSON(json),
    serializer: value => value.toJSON()
  })
  receipt: Hash;
}

/**
 * Represents the pricing mode, which can be one of the following: Classic, Fixed, or Reserved.
 */
@jsonObject
export class PricingMode {
  /**
   * The classic pricing mode, if applicable.
   */
  @jsonMember({ name: 'Classic', constructor: ClassicMode })
  classic?: ClassicMode;

  /**
   * The fixed pricing mode, if applicable.
   */
  @jsonMember({ name: 'Fixed', constructor: FixedMode })
  fixed?: FixedMode;

  /**
   * The reserved pricing mode, if applicable.
   */
  @jsonMember({ name: 'reserved', constructor: ReservedMode })
  reserved?: ReservedMode;

  /**
   * Converts the pricing mode instance into a byte array representation.
   * This method serializes the current pricing mode into bytes that can be used for transactions.
   *
   * @returns A `Uint8Array` representing the serialized pricing mode.
   */
  toBytes(): Uint8Array {
    let result: Uint8Array;

    if (this.classic) {
      const classicPaymentBytes = new CLValueUInt64(
        BigInt(this.classic.paymentAmount)
      ).bytes();
      const gasPriceToleranceByte = new Uint8Array([
        this.classic.gasPriceTolerance
      ]);
      const standardPaymentByte = new Uint8Array([
        this.classic.standardPayment ? 1 : 0
      ]);

      result = concat([
        Uint8Array.of(PricingModeTag.Classic),
        classicPaymentBytes,
        gasPriceToleranceByte,
        standardPaymentByte
      ]);
    } else if (this.fixed) {
      const gasPriceToleranceByte = new Uint8Array([
        this.fixed.gasPriceTolerance
      ]);
      result = concat([
        Uint8Array.of(PricingModeTag.Fixed),
        gasPriceToleranceByte
      ]);
    } else if (this.reserved) {
      const receiptBytes = this.reserved.receipt.toBytes();
      result = concat([Uint8Array.of(PricingModeTag.Reserved), receiptBytes]);
    } else {
      result = new Uint8Array(0); // empty array if none of the conditions match
    }

    return result;
  }
}
