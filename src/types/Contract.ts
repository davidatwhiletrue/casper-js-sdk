import { jsonArrayMember, jsonMember, jsonObject } from 'typedjson';
import { ContractHash, ContractPackageHash } from './key';
import { EntryPointV1 } from './EntryPoint';
import { NamedKeys } from './NamedKey';

/**
 * Represents a smart contract on the blockchain, including its unique identifiers, entry points, named keys, and protocol version.
 */
@jsonObject
export class Contract {
  /**
   * The unique hash representing the contract package.
   */
  @jsonMember({
    name: 'contract_package_hash',
    constructor: ContractPackageHash,
    deserializer: json => ContractPackageHash.fromJSON(json),
    serializer: (value: ContractPackageHash) => value.toJSON()
  })
  contractPackageHash: ContractPackageHash;

  /**
   * The unique hash representing the WebAssembly (Wasm) code of the contract.
   */
  @jsonMember({
    name: 'contract_wasm_hash',
    constructor: ContractHash,
    deserializer: json => ContractHash.fromJSON(json),
    serializer: (value: ContractHash) => value.toJSON()
  })
  contractWasmHash: ContractHash;

  /**
   * The list of entry points (functions) that can be called on this contract.
   */
  @jsonArrayMember(EntryPointV1, { name: 'entry_points' })
  entryPoints: EntryPointV1[];

  /**
   * The named keys associated with the contract, providing access to specific values or data stored by the contract.
   */
  @jsonMember({ name: 'named_keys', constructor: NamedKeys })
  namedKeys: NamedKeys;

  /**
   * The protocol version of the contract, indicating compatibility with specific blockchain protocol versions.
   */
  @jsonMember({ name: 'protocol_version', constructor: String })
  protocolVersion: string;

  /**
   * Constructs a new `Contract` instance.
   * @param contractPackageHash - The unique hash for the contract package.
   * @param contractWasmHash - The unique hash for the Wasm code of the contract.
   * @param entryPoints - An array of entry points defining functions available in the contract.
   * @param namedKeys - Named keys providing access to specific stored data within the contract.
   * @param protocolVersion - The protocol version for this contract.
   */
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
