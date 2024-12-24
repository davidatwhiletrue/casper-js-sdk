import { jsonObject, jsonMember, TypedJSON } from 'typedjson';

import { AccountHash, Key } from './key';
import { UnbondingPurse } from './UnbondingPurse';
import { AddressableEntity } from './AddressableEntity';
import { Package } from './Package';
import { BidKind } from './BidKind';
import { MessageChecksum, MessageTopicSummary } from './MessageTopic';
import { DeployInfo } from './DeployInfo';
import { CLValue, CLValueUInt512 } from './clvalue';
import { Args } from './Args';
import { deserializeArgs, serializeArgs } from './SerializationUtils';
import {
  BidKindRawData,
  PackageRawData,
  RawDataMessage,
  RawDataMessageTopic,
  RawDataNamedKey,
  RawUInt512,
  RawWriteAccount,
  RawWriteCLValue,
  RawWriteCLValueV2,
  RawWriteDeployInfo,
  RawWriteTransferTransform,
  RawWriteUnbonding,
  RawWriteWithdrawals,
  TranformAddressableEntityRawData,
  WriteTransfer
} from './TransformRaw';

/**
 * Represents different types of transformation that can be applied.
 * Used for parsing and processing transformation data in a transaction.
 */
@jsonObject
export class TransformKind {
  private data: any;

  /**
   * Constructs a new `TransformKind` instance.
   *
   * @param data The transformation data as a string.
   */
  constructor(data: any) {
    this.data = data;
  }

  /**
   * Getter for transformation data.
   *
   * @returns The transformation data.
   */
  public get transformationData(): any {
    return this.data;
  }

  /**
   * Creates a `TransformKind` instance from a JSON string.
   *
   * @param json The transformation data as a string.
   * @returns The `TransformKind` instance.
   */
  static fromJSON(json: any): TransformKind | undefined {
    if (!json) {
      throw new Error('TransformKind: fromJSON on empty string');
    }
    return new TransformKind(json);
  }

  /**
   * Converts the transformation data into a JSON string.
   *
   * @returns The transformation data as a string.
   */
  public toJSON(): any {
    return this.data;
  }

  /**
   * Checks if the transformation is a WriteTransfer.
   *
   * @returns `true` if the transformation is a WriteTransfer, otherwise `false`.
   */
  public isWriteTransfer(): boolean {
    return this.isTransformation('WriteTransfer');
  }

  /**
   * Checks if the transformation is a WriteAccount.
   *
   * @returns `true` if the transformation is a WriteAccount, otherwise `false`.
   */
  public isWriteAccount(): boolean {
    return this.isTransformation('WriteAccount');
  }

  /**
   * Checks if the transformation is a WriteCLValue.
   *
   * @returns `true` if the transformation is a WriteCLValue, otherwise `false`.
   */
  public isCLValueWrite(): boolean {
    return this.isTransformation('WriteCLValue');
  }

  /**
   * Checks if the transformation is a WriteContract.
   *
   * @returns `true` if the transformation is a WriteContract, otherwise `false`.
   */
  public isWriteContract(): boolean {
    return this.isTransformation('WriteContract');
  }

  /**
   * Checks if the transformation is a WriteWithdraw.
   *
   * @returns `true` if the transformation is a WriteWithdraw, otherwise `false`.
   */
  public isWriteWithdraw(): boolean {
    return this.isTransformation('WriteWithdraw');
  }

  /**
   * Checks if the transformation is a WriteUnbonding.
   *
   * @returns `true` if the transformation is a WriteUnbonding, otherwise `false`.
   */
  public isWriteUnbonding(): boolean {
    return this.isTransformation('WriteUnbonding');
  }

  /**
   * Checks if the transformation is a WriteCLValue.
   *
   * @returns `true` if the transformation is a WriteCLValue, otherwise `false`.
   */
  public isWriteCLValue(): boolean {
    return this.isTransformation('CLValue');
  }

  /**
   * Checks if the transformation is a WritePackage.
   *
   * @returns `true` if the transformation is a WritePackage, otherwise `false`.
   */
  public isWritePackage(): boolean {
    return this.isTransformation('Package');
  }

  /**
   * Checks if the transformation is a WriteAddressableEntity.
   *
   * @returns `true` if the transformation is a WriteAddressableEntity, otherwise `false`.
   */
  public isWriteAddressableEntity(): boolean {
    return this.isTransformation('AddressableEntity');
  }

  /**
   * Checks if the transformation is a WriteBidKind.
   *
   * @returns `true` if the transformation is a WriteBidKind, otherwise `false`.
   */
  public isWriteBidKind(): boolean {
    return this.isTransformation('BidKind');
  }

  /**
   * Checks if the transformation is a WriteNamedKey.
   *
   * @returns `true` if the transformation is a WriteNamedKey, otherwise `false`.
   */
  public isWriteNamedKey(): boolean {
    return this.isTransformation('NamedKey');
  }

  /**
   * Checks if the transformation is a WriteMessage.
   *
   * @returns `true` if the transformation is a WriteMessage, otherwise `false`.
   */
  public isWriteMessage(): boolean {
    return this.isTransformation('Message');
  }

  /**
   * Checks if the transformation is a WriteMessageTopic.
   *
   * @returns `true` if the transformation is a WriteMessageTopic, otherwise `false`.
   */
  public isWriteMessageTopic(): boolean {
    return this.isTransformation('MessageTopic');
  }

  /**
   * Checks if the transformation is a WriteBid.
   *
   * @returns `true` if the transformation is a WriteBid, otherwise `false`.
   */
  public isWriteBid(): boolean {
    return this.isTransformation('WriteBid');
  }

  /**
   * Checks if the transformation is an AddUInt512.
   *
   * @returns `true` if the transformation is AddUInt512, otherwise `false`.
   */
  public isAddUint512(): boolean {
    return this.isTransformation('AddUInt512');
  }

  /**
   * Checks if the transformation is a WriteDeployInfo.
   *
   * @returns `true` if the transformation is a WriteDeployInfo, otherwise `false`.
   */
  public isWriteDeployInfo(): boolean {
    return this.isTransformation('WriteDeployInfo');
  }

  /**
   * Attempts to parse the transformation as a WriteTransfer.
   *
   * @returns A `WriteTransfer` object if the data matches, otherwise throw an error`.
   */
  public parseAsWriteTransfer(): WriteTransfer {
    const serializer = new TypedJSON(RawWriteTransferTransform);
    const jsonRes = serializer.parse(this.data);

    if (!jsonRes || !jsonRes.WriteTransfer) {
      throw new Error(`Error parsing as WriteTransfer`);
    }

    return jsonRes.WriteTransfer;
  }
  /**
   * Attempts to parse the transformation as a WriteWithdraw.
   *
   * @returns An array of `UnbondingPurse` objects if the data matches, otherwise `[]`.
   */
  public parseAsWriteWithdraws(): UnbondingPurse[] {
    const serializer = new TypedJSON(RawWriteWithdrawals);
    const jsonRes = serializer.parse(this.data);

    if (!jsonRes || !jsonRes.UnbondingPurses) {
      return [];
    }

    return jsonRes.UnbondingPurses;
  }

  /**
   * Attempts to parse the transformation as a WriteAddressableEntity.
   *
   * @returns An `AddressableEntity` object if the data matches, otherwise throw an error`.
   */
  public parseAsWriteAddressableEntity(): AddressableEntity {
    const serializer = new TypedJSON(TranformAddressableEntityRawData);
    const jsonRes = serializer.parse(this.data);

    if (!jsonRes?.Write?.AddressableEntity) {
      throw new Error(`Error parsing as AddressableEntity`);
    }

    return jsonRes.Write.AddressableEntity;
  }

  /**
   * Attempts to parse the transformation as a WritePackage.
   *
   * @returns A `Package` object if the data matches, otherwise `throw an error`.
   */
  public parseAsWritePackage(): Package {
    const serializer = new TypedJSON(PackageRawData);
    const jsonRes = serializer.parse(this.data);

    if (!jsonRes?.Write?.Package) {
      throw new Error(`Error parsing as Package`);
    }

    return jsonRes.Write.Package;
  }

  /**
   * Attempts to parse the transformation as a WriteBidKind.
   *
   * @returns A `BidKind` object if the data matches, otherwise `throw an error`.
   */
  public parseAsWriteBidKind(): BidKind {
    const serializer = new TypedJSON(BidKindRawData);
    const jsonRes = serializer.parse(this.data);

    if (!jsonRes?.Write?.BidKind) {
      throw new Error(`Error parsing as BidKind`);
    }

    return jsonRes.Write.BidKind;
  }

  /**
   * Attempts to parse the transformation as a WriteNamedKey.
   *
   * @returns A `NamedKeyKind` object if the data matches, otherwise `throw an error`.
   */
  public parseAsWriteNamedKey(): NamedKeyKind | null {
    const serializer = new TypedJSON(RawDataNamedKey);
    const jsonRes = serializer.parse(this.data);

    if (!jsonRes || !jsonRes.Write || !jsonRes.Write.NamedKey) {
      throw new Error(`Error parsing as NamedKeyKind`);
    }

    return jsonRes.Write.NamedKey;
  }

  /**
   * Attempts to parse the transformation as a WriteMessage.
   *
   * @returns A `MessageChecksum` if the data matches, otherwise `throw an error`.
   */
  public parseAsWriteMessage(): MessageChecksum {
    const serializer = new TypedJSON(RawDataMessage);
    const jsonRes = serializer.parse(this.data);

    if (!jsonRes || !jsonRes.Write || !jsonRes.Write.Message) {
      throw new Error(`Error parsing as MessageChecksum`);
    }

    return jsonRes.Write.Message;
  }

  /**
   * Attempts to parse the transformation as a WriteMessageTopic.
   *
   * @returns A `MessageTopicSummary` if the data matches, otherwise `throw an error`.
   */
  public parseAsWriteMessageTopic(): MessageTopicSummary {
    const serializer = new TypedJSON(RawDataMessageTopic);
    const jsonRes = serializer.parse(this.data);

    if (!jsonRes || !jsonRes.Write || !jsonRes.Write.MessageTopic) {
      throw new Error(`Error parsing as MessageTopicSummary`);
    }

    return jsonRes.Write.MessageTopic;
  }

  /**
   * Attempts to parse the transformation as a WriteUnbonding.
   *
   * @returns An array of `UnbondingPurse` objects if the data matches, otherwise `throw an error`.
   */
  public parseAsWriteUnbondings(): UnbondingPurse[] | null {
    const serializer = new TypedJSON(RawWriteUnbonding);
    const jsonRes = serializer.parse(this.data);

    if (!jsonRes || !jsonRes.UnbondingPurses) {
      throw new Error(`Error parsing as UnbondingPurse array`);
    }

    return jsonRes.UnbondingPurses;
  }

  /**
   * Attempts to parse the transformation as a UInt512.
   *
   * @returns A `CLValueUInt512` object if the data matches, otherwise `throw an error`.
   */
  public parseAsUInt512(): CLValueUInt512 {
    const serializer = new TypedJSON(RawUInt512);
    const jsonRes = serializer.parse(this.data);

    if (!jsonRes || !jsonRes.UInt512) {
      throw new Error(`Error parsing as CLValueUInt512`);
    }

    return jsonRes.UInt512;
  }

  /**
   * Attempts to parse the transformation as a WriteDeployInfo.
   *
   * @returns A `DeployInfo` object if the data matches, otherwise `throw an error`.
   */
  public parseAsWriteAccount(): AccountHash {
    const serializer = new TypedJSON(RawWriteAccount);
    const jsonRes = serializer.parse(this.data);

    if (!jsonRes || !jsonRes.WriteAccount) {
      throw new Error(`Error parsing as WriteAccount`);
    }

    return jsonRes.WriteAccount;
  }

  /**
   * Attempts to parse the transformation as a WriteDeployInfo.
   *
   * @returns A `DeployInfo` object if the data matches, otherwise `throw an error`.
   */
  public parseAsWriteDeployInfo(): DeployInfo {
    const serializer = new TypedJSON(RawWriteDeployInfo);
    const jsonRes = serializer.parse(this.data);

    if (!jsonRes || !jsonRes.WriteDeployInfo) {
      throw new Error(`Error parsing as DeployInfo`);
    }

    return jsonRes.WriteDeployInfo;
  }

  /**
   * Attempts to parse the transformation as a WriteCLValue.
   *
   * @returns The `Args` object if the data matches, otherwise `throw an error`.
   */
  public parseAsWriteCLValue(): CLValue {
    const serializer = new TypedJSON(RawWriteCLValue);
    const jsonRes = serializer.parse(this.data);

    if (jsonRes && jsonRes.WriteCLValue) {
      return jsonRes.WriteCLValue;
    }

    const serializer2 = new TypedJSON(RawWriteCLValueV2);
    const jsonRes2 = serializer2.parse(this.data);

    if (!jsonRes2 || !jsonRes2.Write || !jsonRes2?.Write.CLValue) {
      throw new Error(`Error parsing as RawWriteCLValueV2`);
    }

    return jsonRes2.Write?.CLValue;
  }

  /**
   * Checks if `TransformKind` has the transformation specified by name.
   *
   * @param `name` - transformation name (aka WriteTransfer)
   * @returns `true` if the transformation is a WriteTransfer, otherwise `false`.
   */
  public isTransformation(name: string): boolean {
    if (typeof this.data === 'string') {
      return this.data.includes(name);
    } else if (typeof this.data === 'object') {
      return Object.keys(this.data).some(key => key.includes(name));
    }

    return false;
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
    deserializer: (json: string) => {
      if (!json) return;
      return Key.newKey(json);
    },
    serializer: value => {
      if (!value) return;
      return value.toPrefixedString();
    }
  })
  public key: Key;

  /**
   * The kind of transformation being applied.
   */
  @jsonMember({
    name: 'kind',
    constructor: TransformKind,
    deserializer: json => {
      if (!json) return;
      return TransformKind.fromJSON(json);
    },
    serializer: (value: TransformKind) => {
      if (!value) return;
      return value.toJSON();
    }
  })
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
    deserializer: (json: string) => {
      if (!json) return;
      return Key.newKey(json);
    },
    serializer: value => {
      if (!value) return;
      return value.toPrefixedString();
    }
  })
  public key: Key;

  /**
   * The transformation kind.
   */
  @jsonMember({
    name: 'transform',
    constructor: TransformKind,
    deserializer: json => {
      if (!json) return;
      return TransformKind.fromJSON(json);
    },
    serializer: (value: TransformKind) => {
      if (!value) return;
      return value.toJSON();
    }
  })
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
  @jsonMember(() => Args, {
    deserializer: deserializeArgs,
    serializer: (args: Args) => serializeArgs(args, false)
  })
  public namedKey: Args;

  /**
   * The name of the key represented as `Args`.
   */
  @jsonMember(() => Args, {
    deserializer: deserializeArgs,
    serializer: (args: Args) => serializeArgs(args, false)
  })
  public name: Args;
}
