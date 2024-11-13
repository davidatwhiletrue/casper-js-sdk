import { jsonObject, jsonMember, jsonArrayMember } from 'typedjson';
import { AccountHash, URef } from './key';
import { NamedKeys } from './NamedKey';

@jsonObject
export class AssociatedKey {
  @jsonMember({
    name: 'account_hash',
    constructor: AccountHash,
    deserializer: json => AccountHash.fromJSON(json),
    serializer: value => value.toJSON()
  })
  accountHash: AccountHash;

  @jsonMember({
    name: 'weight',
    constructor: Number
  })
  weight: number;
}

@jsonObject
export class ActionThresholds {
  @jsonMember({
    name: 'deployment',
    constructor: Number
  })
  deployment: number;

  @jsonMember({
    name: 'key_management',
    constructor: Number
  })
  keyManagement: number;
}

@jsonObject
export class Account {
  @jsonMember({
    name: 'account_hash',
    deserializer: json => AccountHash.fromJSON(json),
    serializer: value => value.toJSON(),
    constructor: AccountHash
  })
  accountHash: AccountHash;

  @jsonMember({
    name: 'named_keys',
    constructor: NamedKeys
  })
  namedKeys: NamedKeys;

  @jsonMember({
    name: 'main_purse',
    constructor: URef,
    deserializer: json => URef.fromJSON(json),
    serializer: value => value.toJSON()
  })
  mainPurse: URef;

  @jsonArrayMember(AssociatedKey, { name: 'associated_keys' })
  associatedKeys: AssociatedKey[];

  @jsonMember({ name: 'action_thresholds', constructor: ActionThresholds })
  actionThresholds: ActionThresholds;
}
