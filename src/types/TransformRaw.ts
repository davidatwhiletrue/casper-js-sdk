import { jsonArrayMember, jsonMember, jsonObject } from 'typedjson';

import { UnbondingPurse } from './UnbondingPurse';
import { NamedKeyKind, WriteTransfer } from './Transform';
import { AddressableEntity } from './AddressableEntity';
import { Package } from './Package';
import { BidKind } from './BidKind';
import { MessageTopicSummary } from './MessageTopic';
import { CLValueUInt512 } from './clvalue';
import { DeployInfo } from './DeployInfo';
import { Args } from './Args';
import { deserializeArgs, serializeArgs } from './SerializationUtils';

/**
 * Represents raw data for a write operation involving withdrawals.
 */
@jsonObject
export class RawWriteWithdrawals {
  /**
   * The list of unbonding purses in the withdrawal write operation.
   */
  @jsonArrayMember(UnbondingPurse, { name: 'WriteWithdraw' })
  UnbondingPurses?: UnbondingPurse[];
}

/**
 * Represents raw data for a write transfer operation.
 */
@jsonObject
export class RawWriteTransferTransform {
  /**
   * The write transfer operation.
   */
  @jsonMember({ name: 'WriteTransfer', constructor: WriteTransfer })
  WriteTransfer?: WriteTransfer;
}

/**
 * Represents a transform for an addressable entity.
 */
@jsonObject
export class TranformAddressableEntity {
  /**
   * The addressable entity involved in the transform.
   */
  @jsonMember({ name: 'AddressableEntity', constructor: AddressableEntity })
  AddressableEntity?: AddressableEntity;
}

/**
 * Represents raw data for a write operation on an addressable entity.
 */
@jsonObject
export class TranformAddressableEntityRawData {
  /**
   * The write operation containing an addressable entity transform.
   */
  @jsonMember({ name: 'Write', constructor: TranformAddressableEntity })
  Write?: TranformAddressableEntity;
}

/**
 * Represents transform data for a package entity.
 */
@jsonObject
export class TranformPackageData {
  /**
   * The package data in the transform.
   */
  @jsonMember({ name: 'Package', constructor: Package })
  Package?: Package;
}

/**
 * Represents raw data for a write operation involving a package.
 */
@jsonObject
export class PackageRawData {
  /**
   * The write operation containing package data.
   */
  @jsonMember({ name: 'Write', constructor: TranformPackageData })
  Write?: TranformPackageData;
}

/**
 * Represents transform data for a bid kind.
 */
@jsonObject
export class TranformBidKindData {
  /**
   * The bid kind data in the transform.
   */
  @jsonMember({ name: 'BidKind', constructor: BidKind })
  BidKind?: BidKind;
}

/**
 * Represents raw data for a write operation on a bid kind.
 */
@jsonObject
export class BidKindRawData {
  /**
   * The write operation containing bid kind data.
   */
  @jsonMember({ name: 'Write' })
  Write?: TranformBidKindData;
}

/**
 * Represents a write operation involving a named key.
 */
@jsonObject
class WriteNamedKey {
  /**
   * The named key in the write operation.
   */
  @jsonMember({ constructor: NamedKeyKind, name: 'NamedKey' })
  NamedKey?: NamedKeyKind;
}

/**
 * Represents raw data for a write operation on a named key.
 */
@jsonObject
export class RawDataNamedKey {
  /**
   * The write operation containing the named key data.
   */
  @jsonMember({ constructor: WriteNamedKey, name: 'Write' })
  Write?: WriteNamedKey;
}

/**
 * Represents a write operation involving a message.
 */
@jsonObject
export class WriteMessage {
  /**
   * The message content in the write operation.
   */
  @jsonMember({ constructor: String, name: 'Message' })
  Message?: string;
}

/**
 * Represents raw data for a write operation on a message.
 */
@jsonObject
export class RawDataMessage {
  /**
   * The write operation containing message data.
   */
  @jsonMember({ constructor: WriteMessage, name: 'Write' })
  Write?: WriteMessage;
}

/**
 * Represents a write operation involving a message topic.
 */
@jsonObject
export class WriteMessageTopic {
  /**
   * The message topic in the write operation.
   */
  @jsonMember({ constructor: MessageTopicSummary, name: 'MessageTopic' })
  MessageTopic?: MessageTopicSummary;
}

/**
 * Represents raw data for a write operation on a message topic.
 */
@jsonObject
export class RawDataMessageTopic {
  /**
   * The write operation containing message topic data.
   */
  @jsonMember({ constructor: WriteMessageTopic, name: 'Write' })
  Write?: WriteMessageTopic;
}

/**
 * Represents raw write data for unbonding purses.
 */
@jsonObject
export class RawWriteUnbonding {
  /**
   * The list of unbonding purses in the write operation.
   */
  @jsonArrayMember(UnbondingPurse, { name: 'WriteUnbonding' })
  UnbondingPurses?: UnbondingPurse[];
}

/**
 * Represents raw write data for a UInt512 value.
 */
@jsonObject
export class RawUInt512 {
  /**
   * The UInt512 value in the write operation.
   */
  @jsonMember({
    name: 'AddUInt512',
    constructor: CLValueUInt512,
    deserializer: json => {
      if (!json) return;
      return CLValueUInt512.fromJSON(json);
    },
    serializer: value => {
      if (!value) return;
      return value.toJSON();
    }
  })
  UInt512?: CLValueUInt512;
}

/**
 * Represents raw write data for deploying information.
 */
@jsonObject
export class RawWriteDeployInfo {
  /**
   * The deploy information in the write operation.
   */
  @jsonMember({ constructor: DeployInfo, name: 'WriteDeployInfo' })
  WriteDeployInfo?: DeployInfo;
}

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
  WriteCLValue?: Args;
}

/**
 * Represents a write operation in a transaction.
 */
@jsonObject
export class WriteCLValue {
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
  CLValue?: Args;
}

/**
 * Represents raw write data for version 2 of a CLValue.
 */
@jsonObject
export class RawWriteCLValueV2 {
  /**
   * The write operation represented as `Write`.
   */
  @jsonMember({
    name: 'Write',
    constructor: WriteCLValue
  })
  Write?: WriteCLValue;
}
