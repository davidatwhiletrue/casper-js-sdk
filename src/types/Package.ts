import { jsonObject, jsonMember, jsonArrayMember } from 'typedjson';
import { AddressableEntityHash, URef } from './key';

@jsonObject
export class EntityVersionAndHash {
  @jsonMember({
    name: 'addressable_entity_hash',
    constructor: AddressableEntityHash,
    deserializer: json => AddressableEntityHash.fromJSON(json),
    serializer: (value: AddressableEntityHash) => value.toJSON()
  })
  addressableEntityHash: AddressableEntityHash;

  @jsonMember({
    name: 'entity_version_key',
    constructor: () => EntityVersionKey
  })
  entityVersionKey: EntityVersionKey;

  constructor(
    addressableEntityHash: AddressableEntityHash,
    entityVersionKey: EntityVersionKey
  ) {
    this.addressableEntityHash = addressableEntityHash;
    this.entityVersionKey = entityVersionKey;
  }
}

@jsonObject
export class Package {
  @jsonArrayMember(EntityVersionAndHash, { name: 'versions' })
  versions: EntityVersionAndHash[];

  @jsonArrayMember(EntityVersionAndHash, { name: 'disabled_versions' })
  disabledVersions: EntityVersionAndHash[];

  @jsonMember({ name: 'lock_status', constructor: String })
  lockStatus: string;

  @jsonArrayMember(String, { name: 'groups' })
  groups: string[];
}

@jsonObject
export class EntityVersionKey {
  @jsonMember({ name: 'entity_version', constructor: Number })
  entityVersion: number;

  @jsonMember({ name: 'protocol_version_major', constructor: Number })
  protocolVersionMajor: number;

  constructor(entityVersion: number, protocolVersionMajor: number) {
    this.entityVersion = entityVersion;
    this.protocolVersionMajor = protocolVersionMajor;
  }
}

@jsonObject
export class NamedUserGroup {
  @jsonMember({ name: 'group_name', constructor: String })
  groupName: string;

  @jsonArrayMember(URef, {
    name: 'group_users',
    serializer: (value: URef[]) => value.map(it => it.toJSON()),
    deserializer: (json: any) => json.map((it: string) => URef.fromJSON(it))
  })
  groupUsers: URef[];

  constructor(groupName: string, groupUsers: URef[]) {
    this.groupName = groupName;
    this.groupUsers = groupUsers;
  }
}
