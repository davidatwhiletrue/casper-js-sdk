import { jsonArrayMember, jsonMember, jsonObject } from 'typedjson';

import { ContractHash, ContractPackageHash } from './key';
import { EntryPointV1 } from './EntryPoint';
import { NamedKeys } from './NamedKey';

@jsonObject
export class Contract {
  @jsonMember({
    name: 'contract_package_hash',
    constructor: ContractPackageHash,
    deserializer: json => ContractPackageHash.fromJSON(json),
    serializer: (value: ContractPackageHash) => value.toJSON()
  })
  contractPackageHash: ContractPackageHash;

  @jsonMember({
    name: 'contract_wasm_hash',
    constructor: ContractHash,
    deserializer: json => ContractHash.fromJSON(json),
    serializer: (value: ContractHash) => value.toJSON()
  })
  contractWasmHash: ContractHash;

  @jsonArrayMember(EntryPointV1, { name: 'entry_points' })
  entryPoints: EntryPointV1[];

  @jsonMember({ name: 'named_keys', constructor: NamedKeys })
  namedKeys: NamedKeys;

  @jsonMember({ name: 'protocol_version', constructor: String })
  protocolVersion: string;

  constructor(
    contractPackageHash: ContractPackageHash,
    contractWasmHash: ContractHash,
    entryPoints: EntryPointV1[],
    namedKeys: NamedKeys,
    protocolVersion: string
  ) {
    this.contractPackageHash = contractPackageHash;
    this.contractWasmHash = contractWasmHash;
    this.entryPoints = entryPoints;
    this.namedKeys = namedKeys;
    this.protocolVersion = protocolVersion;
  }
}
