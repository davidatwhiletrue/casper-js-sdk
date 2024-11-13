import { jsonObject, jsonMember, TypedJSON } from 'typedjson';
import { AccountHash, Key, Hash, URef } from './key';

import { UnbondingPurse } from './UnbondingPurse';
import { AddressableEntity } from './AddressableEntity';
import { Package } from './Package';
import { BidKind } from './BidKind';
import { MessageChecksum, MessageTopicSummary } from './MessageTopic';
import { DeployInfo } from './DeployInfo';
import { CLValueUInt512 } from './clvalue';
import { Args } from './Args';
import { deserializeArgs, serializeArgs } from './SerializationUtils';

@jsonObject
export class RawWriteCLValue {
  @jsonMember({
    constructor: Args,
    name: 'WriteCLValue',
    deserializer: json => {
      if (!json) return;
      return deserializeArgs(json);
    },
    serializer: value => {
      if (!value) return;
      return serializeArgs(value);
    }
  })
  writeCLValue?: Args;
}

@jsonObject
class Write {
  @jsonMember({
    constructor: Args,
    name: 'CLValue',
    deserializer: json => {
      if (!json) return;
      return deserializeArgs(json);
    },
    serializer: value => {
      if (!value) return;
      return serializeArgs(value);
    }
  })
  clValue?: Args;
}

@jsonObject
export class RawWriteCLValueV2 {
  @jsonMember({ name: 'Write', constructor: Write })
  write?: Write;
}

@jsonObject
export class TransformKind {
  private data: string;

  constructor(data = '') {
    this.data = data;
  }

  public static fromJSON(data: string): TransformKind {
    return new TransformKind(data);
  }

  public toJSON(): string {
    return this.data || 'null';
  }

  public isWriteTransfer(): boolean {
    return this.data.includes('WriteTransfer');
  }

  public isWriteAccount(): boolean {
    return this.data.includes('WriteAccount');
  }

  public isWriteContract(): boolean {
    return this.data === '"WriteContract"';
  }

  public isWriteWithdraw(): boolean {
    return this.data.includes('WriteWithdraw');
  }

  public isWriteUnbonding(): boolean {
    return this.data.includes('WriteUnbonding');
  }

  public isWriteCLValue(): boolean {
    return this.data.includes('CLValue');
  }

  public isWritePackage(): boolean {
    return this.data.includes('"Package"');
  }

  public isWriteAddressableEntity(): boolean {
    return this.data.includes('"AddressableEntity"');
  }

  public isWriteBidKind(): boolean {
    return this.data.includes('"BidKind"');
  }

  public isWriteNamedKey(): boolean {
    return this.data.includes('"NamedKey"');
  }

  public isWriteMessage(): boolean {
    return this.data.includes('"Message"');
  }

  public isWriteMessageTopic(): boolean {
    return this.data.includes('"MessageTopic"');
  }

  public isWriteBid(): boolean {
    return this.data.includes('WriteBid');
  }

  public isAddUint512(): boolean {
    return this.data.includes('AddUInt512');
  }

  public isWriteDeployInfo(): boolean {
    return this.data.includes('WriteDeployInfo');
  }

  parseAsWriteTransfer(): WriteTransfer | null {
    try {
      const jsonObject = JSON.parse(this.data);
      if (jsonObject.Write && jsonObject.Write.WriteTransfer) {
        return Object.assign(
          new WriteTransfer(),
          jsonObject.Write.WriteTransfer
        );
      }
    } catch (e) {
      return null;
    }

    return null;
  }

  public parseAsWriteWithdraws(): UnbondingPurse[] | null {
    try {
      const jsonObject = JSON.parse(this.data);
      if (jsonObject.WriteWithdraw) {
        return jsonObject.WriteWithdraw.map((item: any) =>
          Object.assign(new UnbondingPurse(), item)
        );
      }
    } catch (error) {
      console.error('Error parsing as WriteWithdraws:', error);
      return null;
    }
    return null;
  }

  public parseAsWriteAddressableEntity(): AddressableEntity | null {
    try {
      const jsonObject = JSON.parse(this.data);
      if (jsonObject.Write && jsonObject.Write.AddressableEntity) {
        return Object.assign(
          new AddressableEntity(),
          jsonObject.Write.AddressableEntity
        );
      }
    } catch (error) {
      console.error('Error parsing as WriteAddressableEntity:', error);
      return null;
    }
    return null;
  }

  public parseAsWritePackage(): Package | null {
    try {
      const jsonObject = JSON.parse(this.data);
      if (jsonObject.Write && jsonObject.Write.Package) {
        return Object.assign(new Package(), jsonObject.Write.Package);
      }
    } catch (error) {
      console.error('Error parsing as WritePackage:', error);
      return null;
    }
    return null;
  }

  public parseAsWriteBidKind(): BidKind | null {
    try {
      const jsonObject = JSON.parse(this.data);
      if (jsonObject.Write && jsonObject.Write.BidKind) {
        return Object.assign(new BidKind(), jsonObject.Write.BidKind);
      }
    } catch (error) {
      console.error('Error parsing as WriteBidKind:', error);
      return null;
    }
    return null;
  }

  public parseAsWriteNamedKey(): NamedKeyKind | null {
    try {
      const jsonObject = JSON.parse(this.data);
      if (jsonObject.Write && jsonObject.Write.NamedKey) {
        return Object.assign(new NamedKeyKind(), jsonObject.Write.NamedKey);
      }
    } catch (error) {
      console.error('Error parsing as WriteNamedKey:', error);
      return null;
    }
    return null;
  }

  public parseAsWriteMessage(): MessageChecksum | null {
    try {
      const jsonObject = JSON.parse(this.data);
      if (jsonObject.Write && jsonObject.Write.Message) {
        return jsonObject.Write.Message;
      }
    } catch (error) {
      console.error('Error parsing as WriteMessage:', error);
      return null;
    }
    return null;
  }

  public parseAsWriteMessageTopic(): MessageTopicSummary | null {
    try {
      const jsonObject = JSON.parse(this.data);
      if (jsonObject.Write && jsonObject.Write.MessageTopic) {
        return Object.assign(
          new MessageTopicSummary(),
          jsonObject.Write.MessageTopic
        );
      }
    } catch (error) {
      console.error('Error parsing as WriteMessageTopic:', error);
      return null;
    }
    return null;
  }

  public parseAsWriteUnbondings(): UnbondingPurse[] | null {
    try {
      const jsonObject = JSON.parse(this.data);
      if (jsonObject.WriteUnbonding) {
        return jsonObject.WriteUnbonding.map((item: any) =>
          Object.assign(new UnbondingPurse(), item)
        );
      }
    } catch (error) {
      console.error('Error parsing as WriteUnbonding:', error);
      return null;
    }
    return null;
  }

  public parseAsUInt512(): CLValueUInt512 | null {
    try {
      const jsonObject = JSON.parse(this.data);
      if (jsonObject.AddUInt512) {
        return new CLValueUInt512(jsonObject.AddUInt512);
      }
    } catch (error) {
      console.error('Error parsing as UInt512:', error);
      return null;
    }
    return null;
  }

  public parseAsWriteDeployInfo(): DeployInfo | null {
    try {
      const jsonObject = JSON.parse(this.data);
      if (jsonObject.WriteDeployInfo) {
        return Object.assign(new DeployInfo(), jsonObject.WriteDeployInfo);
      }
    } catch (error) {
      console.error('Error parsing as WriteDeployInfo:', error);
      return null;
    }
    return null;
  }

  public parseAsWriteCLValue(): Args | null {
    try {
      const parser = new TypedJSON(RawWriteCLValue);
      const jsonRes = parser.parse(this.data);
      if (jsonRes && jsonRes.writeCLValue) {
        return jsonRes.writeCLValue;
      }

      const parserV2 = new TypedJSON(RawWriteCLValueV2);
      const jsonResV2 = parserV2.parse(this.data);

      if (jsonResV2?.write?.clValue) {
        return jsonResV2.write.clValue;
      }
    } catch (error) {
      console.error('Error parsing as WriteCLValue:', error);
    }

    return null;
  }
}

@jsonObject
export class Transform {
  @jsonMember({
    name: 'key',
    constructor: Key,
    deserializer: json => Key.fromJSON(json),
    serializer: (value: Key) => value.toJSON()
  })
  public key: Key;

  @jsonMember({ name: 'kind', constructor: TransformKind })
  public kind: TransformKind;

  constructor(key: Key, kind: TransformKind) {
    this.key = key;
    this.kind = kind;
  }
}

@jsonObject
export class TransformKey {
  @jsonMember({
    name: 'key',
    constructor: Key,
    deserializer: json => Key.fromJSON(json),
    serializer: (value: Key) => value.toJSON()
  })
  public key: Key;

  @jsonMember({ name: 'transform', constructor: TransformKind })
  public transform: TransformKind;
}

@jsonObject
export class NamedKeyKind {
  @jsonMember({
    constructor: Args,
    name: 'named_key',
    deserializer: deserializeArgs,
    serializer: serializeArgs
  })
  public namedKey: Args;

  @jsonMember({
    constructor: Args,
    name: 'name',
    deserializer: deserializeArgs,
    serializer: serializeArgs
  })
  public name: Args;
}

@jsonObject
export class WriteTransfer {
  @jsonMember({ name: 'id', constructor: Number })
  public id?: number;

  @jsonMember({
    name: 'to',
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

  @jsonMember({ name: 'deploy_hash', constructor: Hash })
  public deployHash: Hash;

  @jsonMember({
    name: 'from',
    constructor: AccountHash,
    deserializer: json => AccountHash.fromJSON(json),
    serializer: (value: AccountHash) => value.toJSON()
  })
  public from: AccountHash;

  @jsonMember({
    name: 'amount',
    constructor: CLValueUInt512,
    deserializer: json => CLValueUInt512.fromJSON(json),
    serializer: (value: CLValueUInt512) => value.toJSON()
  })
  public amount: CLValueUInt512;

  @jsonMember({
    name: 'source',
    constructor: URef,
    deserializer: json => URef.fromJSON(json),
    serializer: (value: URef) => value.toJSON()
  })
  public source: URef;

  @jsonMember({
    name: 'target',
    constructor: URef,
    deserializer: json => URef.fromJSON(json),
    serializer: (value: URef) => value.toJSON()
  })
  public target: URef;

  @jsonMember({ name: 'gas', constructor: Number })
  public gas: number;
}
