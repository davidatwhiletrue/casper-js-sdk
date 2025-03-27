import { jsonArrayMember, jsonMember, jsonObject, TypedJSON } from 'typedjson';
import { ContractHash, URef } from './key';
import { deserializeDisabledVersions } from './SerializationUtils';

export interface IDisabledVersion {
  protocol_version_major: number;
  contract_version: number;
}

/**
 * Represents a group of keys associated with a contract, allowing access control and permissions management.
 */
@jsonObject
export class ContractGroup {
  /**
   * The name of the group.
   */
  @jsonMember({ name: 'group_name', constructor: String, preserveNull: true })
  groupName: string;

  /**
   * The list of URef keys associated with this group, defining permissions for contract interaction.
   */
  @jsonArrayMember(URef, {
    name: 'group_users',
    serializer: (value: URef[]) => value.map(it => it.toJSON()),
    deserializer: (json: any) => {
      if (!json) return;
      return json.map((it: string) => URef.fromJSON(it));
    }
  })
  groupUsers: URef[];

  /**
   * Converts a plain JSON object into an instance of `ContractGroup`.
   *
   * @param json The JSON object to parse.
   * @returns An instance of `ContractGroup` or `undefined` if parsing fails.
   */
  public static fromJSON(json: any): ContractGroup | undefined {
    const serializer = new TypedJSON(ContractGroup);
    const contractGroup = serializer.parse(json);

    // V1 Compatible
    if (contractGroup) {
      if (Array.isArray(json?.keys)) {
        contractGroup.groupUsers = json.keys.map((it: any) =>
          URef.fromJSON(it)
        );
      }

      if (typeof json?.group === 'string') {
        contractGroup.groupName = json.group;
      }
    }

    return contractGroup;
  }
}

/**
 * Represents a specific version of a contract, identified by a unique hash and protocol compatibility.
 */
@jsonObject
export class ContractVersion {
  /**
   * The unique hash identifying this version of the contract.
   */
  @jsonMember({
    name: 'contract_hash',
    constructor: ContractHash,
    deserializer: json => ContractHash.fromJSON(json),
    serializer: value => value.toJSON()
  })
  contractHash: ContractHash;

  /**
   * The version number of the contract.
   */
  @jsonMember({ name: 'contract_version', constructor: Number })
  contractVersion: number;

  /**
   * Major version of the protocol that this contract version is compatible with.
   */
  @jsonMember({ name: 'protocol_version_major', constructor: Number })
  protocolVersionMajor: number;

  /**
   * Constructs a new `ContractVersion` instance.
   * @param contractHash - The unique hash for this version of the contract.
   * @param contractVersion - The version number of the contract.
   * @param protocolVersionMajor - The major protocol version compatible with this contract.
   */
  constructor(
    contractHash: ContractHash,
    contractVersion: number,
    protocolVersionMajor: number
  ) {
    this.contractHash = contractHash;
    this.contractVersion = contractVersion;
    this.protocolVersionMajor = protocolVersionMajor;
  }
}

/**
 * Represents a package containing different versions and groups of a contract, including access control and lock status.
 */
@jsonObject
export class ContractPackage {
  /**
   * Access key (URef) for the contract package, controlling permissions.
   */
  @jsonMember({
    name: 'access_key',
    constructor: URef,
    deserializer: json => URef.fromJSON(json),
    serializer: value => value.toJSON()
  })
  accessKey: URef;

  /**
   * Array of disabled contract versions, marking incompatible versions.
   */
  @jsonArrayMember(Number, {
    name: 'disabled_versions',
    dimensions: 2,
    deserializer: json => {
      if (!json) return;
      return deserializeDisabledVersions(json);
    }
  })
  disabledVersions: number[][];

  /**
   * Array of contract groups, managing access control with sets of URef keys.
   */
  @jsonArrayMember(ContractGroup, {
    name: 'groups',
    deserializer: json => {
      if (!json) return;
      return json.map((it: ContractGroup) => ContractGroup.fromJSON(it));
    }
  })
  groups: ContractGroup[];

  /**
   * Array of contract versions, each compatible with a specific protocol version.
   */
  @jsonArrayMember(ContractVersion, { name: 'versions' })
  versions: ContractVersion[];

  /**
   * Lock status of the contract package, indicating whether the package is locked or unlocked.
   */
  @jsonMember({ name: 'lock_status', constructor: String })
  lockStatus: string;

  /**
   * Constructs a new `ContractPackage` instance.
   * @param accessKey - The URef access key for controlling the contract package.
   * @param disabledVersions - Array of disabled contract versions.
   * @param groups - Array of contract groups for access management.
   * @param versions - Array of contract versions within this package.
   * @param lockStatus - The lock status of the contract package.
   */
  constructor(
    accessKey: URef,
    disabledVersions: number[][],
    groups: ContractGroup[],
    versions: ContractVersion[],
    lockStatus: string
  ) {
    this.accessKey = accessKey;
    this.disabledVersions = disabledVersions;
    this.groups = groups;
    this.versions = versions;
    this.lockStatus = lockStatus;
  }
}
