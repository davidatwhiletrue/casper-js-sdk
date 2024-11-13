import { jsonObject, jsonMember, TypedJSON } from 'typedjson';
import { TransactionHash } from './Transaction';
import { InitiatorAddr } from './InitiatorAddr';
import { AccountHash, Hash, URef } from './key';
import { CLValueUInt512 } from './clvalue';

@jsonObject
export class TransferV1 {
  @jsonMember({
    constructor: CLValueUInt512,
    deserializer: json => CLValueUInt512.fromJSON(json),
    serializer: value => value.toJSON()
  })
  public amount: CLValueUInt512;

  @jsonMember({
    name: 'deploy_hash',
    constructor: Hash,
    deserializer: json => Hash.fromJSON(json),
    serializer: value => value.toJSON()
  })
  public deployHash: Hash;

  @jsonMember({
    constructor: AccountHash,
    deserializer: json => AccountHash.fromJSON(json),
    serializer: value => value.toJSON()
  })
  public from: AccountHash;

  @jsonMember({ constructor: Number })
  public gas: number;

  @jsonMember({ constructor: Number })
  public id?: number;

  @jsonMember({
    constructor: URef,
    deserializer: json => URef.fromJSON(json),
    serializer: (value: URef) => value.toJSON()
  })
  public source: URef;

  @jsonMember({
    constructor: URef,
    deserializer: json => URef.fromJSON(json),
    serializer: (value: URef) => value.toJSON()
  })
  public target: URef;

  @jsonMember({
    constructor: AccountHash,
    deserializer: json => {
      if (!json) return;

      return AccountHash.fromJSON(json);
    },
    serializer: value => {
      if (!value) return;

      return value.toJSON();
    }
  })
  public to?: AccountHash;
}

@jsonObject
export class TransferV2 {
  @jsonMember({
    constructor: CLValueUInt512,
    deserializer: json => CLValueUInt512.fromJSON(json),
    serializer: value => value.toJSON()
  })
  public amount: CLValueUInt512;

  @jsonMember({ name: 'transaction_hash', constructor: TransactionHash })
  public transactionHash: TransactionHash;

  @jsonMember({
    constructor: InitiatorAddr,
    deserializer: json => InitiatorAddr.fromJSON(json),
    serializer: value => value.toJSON()
  })
  public from: InitiatorAddr;

  @jsonMember({ constructor: Number })
  public gas: number;

  @jsonMember({ constructor: Number })
  public id?: number;

  @jsonMember({
    constructor: URef,
    deserializer: json => URef.fromJSON(json),
    serializer: (value: URef) => value.toJSON()
  })
  public source: URef;

  @jsonMember({
    constructor: URef,
    deserializer: json => URef.fromJSON(json),
    serializer: (value: URef) => value.toJSON()
  })
  public target: URef;

  @jsonMember({
    constructor: AccountHash,
    deserializer: json => {
      if (!json) return;
      return AccountHash.fromJSON(json);
    },
    serializer: (value: AccountHash) => {
      if (!value) return;
      return value.toJSON();
    }
  })
  public to?: AccountHash;
}

@jsonObject
class TransferVersioned {
  @jsonMember({ name: 'Version1', constructor: TransferV1 })
  public Version1?: TransferV1;

  @jsonMember({ name: 'Version2', constructor: TransferV2 })
  public Version2?: TransferV2;
}

@jsonObject
export class Transfer {
  @jsonMember({
    constructor: CLValueUInt512,
    deserializer: json => CLValueUInt512.fromJSON(json),
    serializer: value => value.toJSON()
  })
  public amount: CLValueUInt512;

  @jsonMember({ name: 'transaction_hash', constructor: TransactionHash })
  public transactionHash: TransactionHash;

  @jsonMember({
    constructor: InitiatorAddr,
    deserializer: json => InitiatorAddr.fromJSON(json),
    serializer: value => value.toJSON()
  })
  public from: InitiatorAddr;

  @jsonMember({ constructor: Number })
  public gas: number;

  @jsonMember({ constructor: Number })
  public id?: number;

  @jsonMember({
    constructor: URef,
    deserializer: json => URef.fromJSON(json),
    serializer: (value: URef) => value.toJSON()
  })
  public source: URef;

  @jsonMember({
    constructor: URef,
    deserializer: json => URef.fromJSON(json),
    serializer: (value: URef) => value.toJSON()
  })
  public target: URef;

  @jsonMember({
    constructor: AccountHash,
    deserializer: json => {
      if (!json) return;
      return AccountHash.fromJSON(json);
    },
    serializer: (value: AccountHash) => {
      if (!value) return;

      return value.toJSON();
    }
  })
  public to?: AccountHash;

  private originTransferV1?: TransferV1;
  private originTransferV2?: TransferV2;

  public getTransferV1(): TransferV1 | undefined {
    return this.originTransferV1;
  }

  public getTransferV2(): TransferV2 | undefined {
    return this.originTransferV2;
  }

  public static fromJSON(data: any): Transfer {
    const versioned = TypedJSON.parse(data, TransferVersioned);

    if (versioned?.Version2) {
      const transfer = new Transfer();
      transfer.amount = versioned.Version2.amount;
      transfer.transactionHash = versioned.Version2.transactionHash;
      transfer.from = versioned.Version2.from;
      transfer.gas = versioned.Version2.gas;
      transfer.id = versioned.Version2.id;
      transfer.source = versioned.Version2.source;
      transfer.target = versioned.Version2.target;
      transfer.to = versioned.Version2.to;
      transfer.originTransferV2 = versioned.Version2;
      return transfer;
    }

    if (versioned?.Version1) {
      return Transfer.fromTransferV1(versioned.Version1);
    }

    const v1Compatible = TypedJSON.parse(data, TransferV1);

    if (v1Compatible) {
      return Transfer.fromTransferV1(v1Compatible);
    }

    throw new Error('Incorrect RPC response structure');
  }

  private static fromTransferV1(transferV1: TransferV1): Transfer {
    const transfer = new Transfer();
    transfer.amount = transferV1.amount;
    transfer.transactionHash = new TransactionHash(transferV1.deployHash);
    transfer.from = new InitiatorAddr(undefined, transferV1.from);
    transfer.gas = transferV1.gas;
    transfer.id = transferV1.id;
    transfer.source = transferV1.source;
    transfer.target = transferV1.target;
    transfer.to = transferV1.to;
    transfer.originTransferV1 = transferV1;
    return transfer;
  }
}
