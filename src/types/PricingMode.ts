import { concat } from '@ethersproject/bytes';

import { jsonObject, jsonMember } from 'typedjson';
import { Hash } from './key';
import { CLValueUInt64 } from './clvalue';

export enum PricingModeTag {
  Classic = 0,
  Fixed = 1,
  Reserved = 2
}

@jsonObject
export class ClassicMode {
  @jsonMember({ name: 'gas_price_tolerance', constructor: Number })
  gasPriceTolerance: number;

  @jsonMember({ name: 'payment_amount', constructor: Number })
  paymentAmount: number;

  @jsonMember({ name: 'standard_payment', constructor: Boolean })
  standardPayment: boolean;
}

@jsonObject
export class FixedMode {
  @jsonMember({ name: 'gas_price_tolerance', constructor: Number })
  gasPriceTolerance: number;
}

@jsonObject
export class ReservedMode {
  @jsonMember({ name: 'receipt', constructor: Hash })
  receipt: Hash;
}

@jsonObject
export class PricingMode {
  @jsonMember({ name: 'Classic', constructor: ClassicMode })
  classic?: ClassicMode;

  @jsonMember({ name: 'Fixed', constructor: FixedMode })
  fixed?: FixedMode;

  @jsonMember({ name: 'reserved', constructor: ReservedMode })
  reserved?: ReservedMode;

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
