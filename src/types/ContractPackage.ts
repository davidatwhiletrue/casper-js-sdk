import { jsonArrayMember, jsonMember, jsonObject } from 'typedjson';
import { ContractHash, URef } from './key';

@jsonObject
class DisabledContractVersion {
  @jsonMember({ name: 'contract_version', constructor: Number })
  contractVersion: number;

  @jsonMember({ name: 'protocol_version_major', constructor: Number })
  protocolVersionMajor: number;

  constructor(contractVersion: number, protocolVersionMajor: number) {
    this.contractVersion = contractVersion;
    this.protocolVersionMajor = protocolVersionMajor;
  }
}

@jsonObject
export class ContractGroup {
  @jsonMember({ name: 'group', constructor: String })
  group: string;

  @jsonArrayMember(URef, { name: 'keys' })
  keys: URef[];

  constructor(group: string, keys: URef[]) {
    this.group = group;
    this.keys = keys;
  }
}

@jsonObject
export class ContractVersion {
  @jsonMember({ name: 'contract_hash', constructor: ContractHash })
  contractHash: ContractHash;

  @jsonMember({ name: 'contract_version', constructor: Number })
  contractVersion: number;

  @jsonMember({ name: 'protocol_version_major', constructor: Number })
  protocolVersionMajor: number;

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

@jsonObject
export class ContractPackage {
  @jsonMember({ name: 'access_key', constructor: URef })
  accessKey: URef;

  @jsonArrayMember(DisabledContractVersion, { name: 'disabled_versions' })
  disabledVersions: DisabledContractVersion[];

  @jsonArrayMember(ContractGroup, { name: 'groups' })
  groups: ContractGroup[];

  @jsonArrayMember(ContractVersion, { name: 'versions' })
  versions: ContractVersion[];

  @jsonMember({ name: 'lock_status', constructor: String })
  lockStatus: string;

  constructor(
    accessKey: URef,
    disabledVersions: DisabledContractVersion[],
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
