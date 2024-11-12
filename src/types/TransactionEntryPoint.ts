import { jsonObject, jsonMember } from 'typedjson';
import { CLValueString } from './clvalue';

export enum TransactionEntryPointEnum {
  Custom = 'Custom',
  Transfer = 'Transfer',
  AddBid = 'AddBid',
  WithdrawBid = 'WithdrawBid',
  Delegate = 'Delegate',
  Undelegate = 'Undelegate',
  Redelegate = 'Redelegate',
  ActivateBid = 'ActivateBid',
  ChangeBidPublicKey = 'ChangeBidPublicKey',
  Call = 'Call'
}

export enum TransactionEntryPointTag {
  Custom = 0,
  Transfer,
  AddBid,
  WithdrawBid,
  Delegate,
  Undelegate,
  Redelegate,
  ActivateBid,
  ChangeBidPublicKey,
  Call
}

@jsonObject
export class TransactionEntryPoint {
  @jsonMember({ constructor: String })
  custom?: string;

  // Use Record<string, unknown> for generic empty objects
  @jsonMember({ constructor: Object })
  transfer?: Record<string, unknown>;

  @jsonMember({ constructor: Object })
  addBid?: Record<string, unknown>;

  @jsonMember({ constructor: Object })
  withdrawBid?: Record<string, unknown>;

  @jsonMember({ constructor: Object })
  delegate?: Record<string, unknown>;

  @jsonMember({ constructor: Object })
  undelegate?: Record<string, unknown>;

  @jsonMember({ constructor: Object })
  redelegate?: Record<string, unknown>;

  @jsonMember({ constructor: Object })
  activateBid?: Record<string, unknown>;

  @jsonMember({ constructor: Object })
  changeBidPublicKey?: Record<string, unknown>;

  @jsonMember({ constructor: Object })
  call?: Record<string, unknown>;

  constructor(
    custom?: string,
    transfer?: Record<string, unknown>,
    addBid?: Record<string, unknown>,
    withdrawBid?: Record<string, unknown>,
    delegate?: Record<string, unknown>,
    undelegate?: Record<string, unknown>,
    redelegate?: Record<string, unknown>,
    activateBid?: Record<string, unknown>,
    changeBidPublicKey?: Record<string, unknown>,
    call?: Record<string, unknown>
  ) {
    this.custom = custom;
    this.transfer = transfer;
    this.addBid = addBid;
    this.withdrawBid = withdrawBid;
    this.delegate = delegate;
    this.undelegate = undelegate;
    this.redelegate = redelegate;
    this.activateBid = activateBid;
    this.changeBidPublicKey = changeBidPublicKey;
    this.call = call;
  }

  private tag(): number {
    if (this.transfer) return TransactionEntryPointTag.Transfer;
    if (this.addBid) return TransactionEntryPointTag.AddBid;
    if (this.withdrawBid) return TransactionEntryPointTag.WithdrawBid;
    if (this.delegate) return TransactionEntryPointTag.Delegate;
    if (this.undelegate) return TransactionEntryPointTag.Undelegate;
    if (this.redelegate) return TransactionEntryPointTag.Redelegate;
    if (this.activateBid) return TransactionEntryPointTag.ActivateBid;
    if (this.changeBidPublicKey)
      return TransactionEntryPointTag.ChangeBidPublicKey;
    if (this.call) return TransactionEntryPointTag.Call;
    return TransactionEntryPointTag.Custom;
  }

  // Convert entry point to bytes, adding custom entry data if present
  bytes(): Uint8Array {
    let result = new Uint8Array([this.tag()]);
    if (this.custom) {
      const customBytes = new CLValueString(this.custom).bytes();
      result = new Uint8Array([...result, ...customBytes]);
    }
    return result;
  }

  toJSON(): unknown {
    if (this.custom) {
      return { Custom: this.custom };
    }

    if (this.transfer) return TransactionEntryPointEnum.Transfer;
    if (this.addBid) return TransactionEntryPointEnum.AddBid;
    if (this.withdrawBid) return TransactionEntryPointEnum.WithdrawBid;
    if (this.delegate) return TransactionEntryPointEnum.Delegate;
    if (this.undelegate) return TransactionEntryPointEnum.Undelegate;
    if (this.redelegate) return TransactionEntryPointEnum.Redelegate;
    if (this.activateBid) return TransactionEntryPointEnum.ActivateBid;
    if (this.changeBidPublicKey)
      return TransactionEntryPointEnum.ChangeBidPublicKey;
    if (this.call) return TransactionEntryPointEnum.Call;

    throw new Error('Unknown entry point');
  }

  static fromJSON(json: string): TransactionEntryPoint {
    let parsed;
    try {
      parsed = JSON.parse(json);
    } catch {
      throw new Error('Invalid JSON input for TransactionEntryPoint');
    }

    const entryPoint = new TransactionEntryPoint();
    if (parsed instanceof Object && parsed.Custom) {
      entryPoint.custom = parsed.Custom;
      return entryPoint;
    }

    switch (parsed) {
      case TransactionEntryPointEnum.Transfer:
        entryPoint.transfer = {};
        break;
      case TransactionEntryPointEnum.AddBid:
        entryPoint.addBid = {};
        break;
      case TransactionEntryPointEnum.WithdrawBid:
        entryPoint.withdrawBid = {};
        break;
      case TransactionEntryPointEnum.Delegate:
        entryPoint.delegate = {};
        break;
      case TransactionEntryPointEnum.Undelegate:
        entryPoint.undelegate = {};
        break;
      case TransactionEntryPointEnum.Redelegate:
        entryPoint.redelegate = {};
        break;
      case TransactionEntryPointEnum.ActivateBid:
        entryPoint.activateBid = {};
        break;
      case TransactionEntryPointEnum.ChangeBidPublicKey:
        entryPoint.changeBidPublicKey = {};
        break;
      case TransactionEntryPointEnum.Call:
        entryPoint.call = {};
        break;
      default:
        throw new Error('Unknown entry point');
    }

    return entryPoint;
  }
}
