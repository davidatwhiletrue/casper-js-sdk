import { jsonObject, jsonMember, jsonArrayMember } from 'typedjson';
import { AssociatedKey } from './Account';
import { MessageTopic } from './MessageTopic';
import { EntryPointV1 } from './EntryPoint';
import { AccountHash, URef } from './key';

export type SystemEntityType = string;
export type TransactionRuntime = 'VmCasperV1' | 'VmCasperV2';

@jsonObject
export class EntityKind {
  @jsonMember({ name: 'System', constructor: String })
  system?: SystemEntityType;

  @jsonMember({
    name: 'Account',
    constructor: AccountHash
  })
  account?: AccountHash;

  @jsonMember({
    name: 'SmartContract',
    constructor: String
  })
  smartContract?: TransactionRuntime;
}

@jsonObject
export class EntityActionThresholds {
  @jsonMember({ name: 'deployment', constructor: Number })
  deployment: number;

  @jsonMember({ name: 'upgrade_management', constructor: Number })
  upgradeManagement: number;

  @jsonMember({ name: 'key_management', constructor: Number })
  keyManagement: number;
}

@jsonObject
export class AddressableEntity {
  @jsonMember({
    name: 'entity_kind',
    constructor: EntityKind
  })
  entityKind: EntityKind;

  @jsonMember({ name: 'package_hash', constructor: String })
  packageHash: string;

  @jsonMember({ name: 'byte_code_hash', constructor: String })
  byteCodeHash: string;

  @jsonArrayMember(AssociatedKey, { name: 'associated_keys' })
  associatedKeys: AssociatedKey[];

  @jsonMember({
    name: 'action_thresholds',
    constructor: EntityActionThresholds
  })
  actionThresholds: EntityActionThresholds;

  @jsonMember({
    name: 'main_purse',
    constructor: URef
  })
  mainPurse: URef;

  @jsonMember({ name: 'protocol_version', constructor: String })
  protocolVersion: string;

  @jsonArrayMember(MessageTopic, { name: 'message_topics' })
  messageTopics: MessageTopic[];
}

@jsonObject
export class NamedEntryPoint {
  @jsonMember({
    name: 'entry_point',
    constructor: EntryPointV1
  })
  entryPoint: EntryPointV1;

  @jsonMember({ name: 'name', constructor: String })
  name: string;
}

export function getRuntimeTag(runtime: TransactionRuntime): number {
  switch (runtime) {
    case 'VmCasperV1':
      return 0;
    case 'VmCasperV2':
      return 1;
    default:
      return 0;
  }
}
