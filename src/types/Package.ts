import { jsonObject, jsonMember, jsonArrayMember } from 'typedjson';
import { AddressableEntityHash, URef } from './key';

/**
 * Represents an entity version and its associated addressable entity hash.
 */
@jsonObject
export class EntityVersionAndHash {
  /**
   * The addressable entity hash associated with the entity.
   * This is used to uniquely identify an entity in a decentralized environment.
   */
  @jsonMember({
    name: 'addressable_entity_hash',
    constructor: AddressableEntityHash,
    deserializer: json => AddressableEntityHash.fromJSON(json),
    serializer: (value: AddressableEntityHash) => value.toJSON()
  })
  addressableEntityHash: AddressableEntityHash;

  /**
   * The key representing the version of the entity.
   */
  @jsonMember({
    name: 'entity_version_key',
    constructor: () => EntityVersionKey
  })
  entityVersionKey: EntityVersionKey;

  /**
   * Creates a new instance of `EntityVersionAndHash` with an addressable entity hash and an entity version key.
   *
   * @param addressableEntityHash The addressable entity hash for the entity.
   * @param entityVersionKey The version key of the entity.
   */
  constructor(
    addressableEntityHash: AddressableEntityHash,
    entityVersionKey: EntityVersionKey
  ) {
    this.addressableEntityHash = addressableEntityHash;
    this.entityVersionKey = entityVersionKey;
  }
}

/**
 * Represents a package with its versions and disabled versions, along with its lock status and associated groups.
 */
@jsonObject
export class Package {
  /**
   * A list of versions associated with this package.
   */
  @jsonArrayMember(EntityVersionAndHash, { name: 'versions' })
  versions: EntityVersionAndHash[];

  /**
   * A list of disabled versions of this package.
   */
  @jsonArrayMember(EntityVersionAndHash, { name: 'disabled_versions' })
  disabledVersions: EntityVersionAndHash[];

  /**
   * The lock status of the package (e.g., whether it's locked or unlocked).
   */
  @jsonMember({ name: 'lock_status', constructor: String })
  lockStatus: string;

  /**
   * The groups associated with the package.
   */
  @jsonArrayMember(String, { name: 'groups' })
  groups: string[];
}

/**
 * Represents a key that uniquely identifies the version of an entity, including both the entity version and the protocol version.
 */
@jsonObject
export class EntityVersionKey {
  /**
   * The version of the entity.
   */
  @jsonMember({ name: 'entity_version', constructor: Number })
  entityVersion: number;

  /**
   * The major version of the protocol used by the entity.
   */
  @jsonMember({ name: 'protocol_version_major', constructor: Number })
  protocolVersionMajor: number;

  /**
   * Creates a new instance of `EntityVersionKey` with an entity version and protocol version major.
   *
   * @param entityVersion The version of the entity.
   * @param protocolVersionMajor The major version of the protocol used by the entity.
   */
  constructor(entityVersion: number, protocolVersionMajor: number) {
    this.entityVersion = entityVersion;
    this.protocolVersionMajor = protocolVersionMajor;
  }
}

/**
 * Represents a user group with its associated name and users (identified by their URefs).
 */
@jsonObject
export class NamedUserGroup {
  /**
   * The name of the user group.
   */
  @jsonMember({ name: 'group_name', constructor: String })
  groupName: string;

  /**
   * A list of users in the group, represented by their URefs (Universal References).
   */
  @jsonArrayMember(URef, {
    name: 'group_users',
    serializer: (value: URef[]) => value.map(it => it.toJSON()),
    deserializer: (json: any) => json.map((it: string) => URef.fromJSON(it))
  })
  groupUsers: URef[];

  /**
   * Creates a new `NamedUserGroup` instance with a group name and a list of group users (URefs).
   *
   * @param groupName The name of the user group.
   * @param groupUsers The list of users in the group, identified by their URefs.
   */
  constructor(groupName: string, groupUsers: URef[]) {
    this.groupName = groupName;
    this.groupUsers = groupUsers;
  }
}
