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
    const result: number[] = [];
    if (this.classic) {
      result.push(PricingModeTag.Classic);
      result.push(
        ...new CLValueUInt64(BigInt(this.classic.paymentAmount)).bytes()
      );
      result.push(this.classic.gasPriceTolerance);
      result.push(this.classic.standardPayment ? 1 : 0);
    } else if (this.fixed) {
      result.push(PricingModeTag.Fixed);
      result.push(this.fixed.gasPriceTolerance);
    } else if (this.reserved) {
      result.push(PricingModeTag.Reserved);
      result.push(...this.reserved.receipt.toBytes());
    }
    return new Uint8Array(result);
  }
}
