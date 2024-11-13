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

/**
 * Represents raw write data for a CLValue.
 * Used for serializing and deserializing the arguments of a CLValue write operation.
 */
@jsonObject
export class RawWriteCLValue {
  /**
   * The write operation on a CLValue represented as `Args`.
   */
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

/**
 * Represents a write operation in a transaction.
 */
@jsonObject
class Write {
  /**
   * The CLValue write operation represented as `Args`.
   */
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

/**
 * Represents raw write data for version 2 of a CLValue.
 */
@jsonObject
export class RawWriteCLValueV2 {
  /**
   * The write operation represented as `Write`.
   */
  @jsonMember({ name: 'Write', constructor: Write })
  write?: Write;
}

/**
 * Represents different types of transformation that can be applied.
 * Used for parsing and processing transformation data in a transaction.
 */
@jsonObject
export class TransformKind {
  private data: string;

  /**
   * Constructs a new `TransformKind` instance.
   *
   * @param data The transformation data as a string.
   */
  constructor(data = '') {
    this.data = data;
  }

  /**
   * Creates a `TransformKind` instance from a JSON string.
   *
   * @param data The transformation data as a string.
   * @returns The `TransformKind` instance.
   */
  public static fromJSON(data: string): TransformKind {
    return new TransformKind(data);
  }

  /**
   * Converts the transformation data into a JSON string.
   *
   * @returns The transformation data as a string.
   */
  public toJSON(): string {
    return this.data || 'null';
  }

  /**
   * Checks if the transformation is a WriteTransfer.
   *
   * @returns `true` if the transformation is a WriteTransfer, otherwise `false`.
   */
  public isWriteTransfer(): boolean {
    return this.data.includes('WriteTransfer');
  }

  /**
   * Checks if the transformation is a WriteAccount.
   *
   * @returns `true` if the transformation is a WriteAccount, otherwise `false`.
   */
  public isWriteAccount(): boolean {
    return this.data.includes('WriteAccount');
  }

  /**
   * Checks if the transformation is a WriteContract.
   *
   * @returns `true` if the transformation is a WriteContract, otherwise `false`.
   */
  public isWriteContract(): boolean {
    return this.data === '"WriteContract"';
  }

  /**
   * Checks if the transformation is a WriteWithdraw.
   *
   * @returns `true` if the transformation is a WriteWithdraw, otherwise `false`.
   */
  public isWriteWithdraw(): boolean {
    return this.data.includes('WriteWithdraw');
  }

  /**
   * Checks if the transformation is a WriteUnbonding.
   *
   * @returns `true` if the transformation is a WriteUnbonding, otherwise `false`.
   */
  public isWriteUnbonding(): boolean {
    return this.data.includes('WriteUnbonding');
  }

  /**
   * Checks if the transformation is a WriteCLValue.
   *
   * @returns `true` if the transformation is a WriteCLValue, otherwise `false`.
   */
  public isWriteCLValue(): boolean {
    return this.data.includes('CLValue');
  }

  /**
   * Checks if the transformation is a WritePackage.
   *
   * @returns `true` if the transformation is a WritePackage, otherwise `false`.
   */
  public isWritePackage(): boolean {
    return this.data.includes('"Package"');
  }

  /**
   * Checks if the transformation is a WriteAddressableEntity.
   *
   * @returns `true` if the transformation is a WriteAddressableEntity, otherwise `false`.
   */
  public isWriteAddressableEntity(): boolean {
    return this.data.includes('"AddressableEntity"');
  }

  /**
   * Checks if the transformation is a WriteBidKind.
   *
   * @returns `true` if the transformation is a WriteBidKind, otherwise `false`.
   */
  public isWriteBidKind(): boolean {
    return this.data.includes('"BidKind"');
  }

  /**
   * Checks if the transformation is a WriteNamedKey.
   *
   * @returns `true` if the transformation is a WriteNamedKey, otherwise `false`.
   */
  public isWriteNamedKey(): boolean {
    return this.data.includes('"NamedKey"');
  }

  /**
   * Checks if the transformation is a WriteMessage.
   *
   * @returns `true` if the transformation is a WriteMessage, otherwise `false`.
   */
  public isWriteMessage(): boolean {
    return this.data.includes('"Message"');
  }

  /**
   * Checks if the transformation is a WriteMessageTopic.
   *
   * @returns `true` if the transformation is a WriteMessageTopic, otherwise `false`.
   */
  public isWriteMessageTopic(): boolean {
    return this.data.includes('"MessageTopic"');
  }

  /**
   * Checks if the transformation is a WriteBid.
   *
   * @returns `true` if the transformation is a WriteBid, otherwise `false`.
   */
  public isWriteBid(): boolean {
    return this.data.includes('WriteBid');
  }

  /**
   * Checks if the transformation is an AddUInt512.
   *
   * @returns `true` if the transformation is AddUInt512, otherwise `false`.
   */
  public isAddUint512(): boolean {
    return this.data.includes('AddUInt512');
  }

  /**
   * Checks if the transformation is a WriteDeployInfo.
   *
   * @returns `true` if the transformation is a WriteDeployInfo, otherwise `false`.
   */
  public isWriteDeployInfo(): boolean {
    return this.data.includes('WriteDeployInfo');
  }

  /**
   * Attempts to parse the transformation as a WriteTransfer.
   *
   * @returns A `WriteTransfer` object if the data matches, otherwise `null`.
   */
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

  /**
   * Attempts to parse the transformation as a WriteWithdraw.
   *
   * @returns An array of `UnbondingPurse` objects if the data matches, otherwise `null`.
   */
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

  /**
   * Attempts to parse the transformation as a WriteAddressableEntity.
   *
   * @returns An `AddressableEntity` object if the data matches, otherwise `null`.
   */
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

  /**
   * Attempts to parse the transformation as a WritePackage.
   *
   * @returns A `Package` object if the data matches, otherwise `null`.
   */
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

  /**
   * Attempts to parse the transformation as a WriteBidKind.
   *
   * @returns A `BidKind` object if the data matches, otherwise `null`.
   */
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

  /**
   * Attempts to parse the transformation as a WriteNamedKey.
   *
   * @returns A `NamedKeyKind` object if the data matches, otherwise `null`.
   */
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

  /**
   * Attempts to parse the transformation as a WriteMessage.
   *
   * @returns A `MessageChecksum` if the data matches, otherwise `null`.
   */
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

  /**
   * Attempts to parse the transformation as a WriteMessageTopic.
   *
   * @returns A `MessageTopicSummary` if the data matches, otherwise `null`.
   */
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

  /**
   * Attempts to parse the transformation as a WriteUnbonding.
   *
   * @returns An array of `UnbondingPurse` objects if the data matches, otherwise `null`.
   */
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

  /**
   * Attempts to parse the transformation as a UInt512.
   *
   * @returns A `CLValueUInt512` object if the data matches, otherwise `null`.
   */
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

  /**
   * Attempts to parse the transformation as a WriteDeployInfo.
   *
   * @returns A `DeployInfo` object if the data matches, otherwise `null`.
   */
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

  /**
   * Attempts to parse the transformation as a WriteCLValue.
   *
   * @returns The `Args` object if the data matches, otherwise `null`.
   */
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

/**
 * Represents a transformation, which includes a key and a transformation kind.
 */
@jsonObject
export class Transform {
  /**
   * The key associated with the transformation.
   */
  @jsonMember({
    name: 'key',
    constructor: Key,
    deserializer: json => Key.fromJSON(json),
    serializer: (value: Key) => value.toJSON()
  })
  public key: Key;

  /**
   * The kind of transformation being applied.
   */
  @jsonMember({ name: 'kind', constructor: TransformKind })
  public kind: TransformKind;

  /**
   * Constructs a new `Transform` instance.
   *
   * @param key The key associated with the transformation.
   * @param kind The kind of transformation.
   */
  constructor(key: Key, kind: TransformKind) {
    this.key = key;
    this.kind = kind;
  }
}

/**
 * Represents a key transformation in a transaction.
 */
@jsonObject
export class TransformKey {
  /**
   * The key associated with the transformation.
   */
  @jsonMember({
    name: 'key',
    constructor: Key,
    deserializer: json => Key.fromJSON(json),
    serializer: (value: Key) => value.toJSON()
  })
  public key: Key;

  /**
   * The transformation kind.
   */
  @jsonMember({ name: 'transform', constructor: TransformKind })
  public transform: TransformKind;
}

/**
 * Represents a named key transformation in a transaction.
 */
@jsonObject
export class NamedKeyKind {
  /**
   * The named key transformation data represented as `Args`.
   */
  @jsonMember({
    constructor: Args,
    name: 'named_key',
    deserializer: deserializeArgs,
    serializer: serializeArgs
  })
  public namedKey: Args;

  /**
   * The name of the key represented as `Args`.
   */
  @jsonMember({
    constructor: Args,
    name: 'name',
    deserializer: deserializeArgs,
    serializer: serializeArgs
  })
  public name: Args;
}

/**
 * Represents a transfer operation in a transaction.
 */
@jsonObject
export class WriteTransfer {
  /**
   * The optional ID of the transfer.
   */
  @jsonMember({ name: 'id', constructor: Number })
  public id?: number;

  /**
   * The recipient of the transfer, represented as an `AccountHash`.
   */
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

  /**
   * The deploy hash associated with the transfer.
   */
  @jsonMember({ name: 'deploy_hash', constructor: Hash })
  public deployHash: Hash;

  /**
   * The sender of the transfer, represented as an `AccountHash`.
   */
  @jsonMember({
    name: 'from',
    constructor: AccountHash,
    deserializer: json => AccountHash.fromJSON(json),
    serializer: (value: AccountHash) => value.toJSON()
  })
  public from: AccountHash;

  /**
   * The amount being transferred, represented as a `CLValueUInt512`.
   */
  @jsonMember({
    name: 'amount',
    constructor: CLValueUInt512,
    deserializer: json => CLValueUInt512.fromJSON(json),
    serializer: (value: CLValueUInt512) => value.toJSON()
  })
  public amount: CLValueUInt512;

  /**
   * The source URef (Universal Reference) of the transfer.
   */
  @jsonMember({
    name: 'source',
    constructor: URef,
    deserializer: json => URef.fromJSON(json),
    serializer: (value: URef) => value.toJSON()
  })
  public source: URef;

  /**
   * The target URef (Universal Reference) of the transfer.
   */
  @jsonMember({
    name: 'target',
    constructor: URef,
    deserializer: json => URef.fromJSON(json),
    serializer: (value: URef) => value.toJSON()
  })
  public target: URef;

  /**
   * The gas used for the transfer.
   */
  @jsonMember({ name: 'gas', constructor: Number })
  public gas: number;
}
