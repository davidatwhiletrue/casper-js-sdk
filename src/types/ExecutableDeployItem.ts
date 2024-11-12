import { jsonMember, jsonObject } from 'typedjson';
import { BigNumber, BigNumberish } from '@ethersproject/bignumber';
import { concat } from '@ethersproject/bytes';

import { Args } from './Args';
import {
  CLValue,
  CLValueByteArray,
  CLValueOption,
  CLValueString,
  CLValueUInt32,
  CLValueUInt512,
  CLValueUInt64
} from './clvalue';
import { ContractHash, URef } from './key';
import { deserializeArgs, serializeArgs } from './SerializationUtils';
import { PublicKey } from './keypair';

enum ExecutableDeployItemType {
  ModuleBytes,
  StoredContractByHash,
  StoredContractByName,
  StoredVersionedContractByHash,
  StoredVersionedContractByName,
  Transfer
}

@jsonObject
export class ModuleBytes {
  @jsonMember({ name: 'module_bytes', constructor: String })
  moduleBytes: string;
  @jsonMember({
    constructor: Args,
    name: 'args',
    deserializer: deserializeArgs,
    serializer: serializeArgs
  })
  args: Args;

  constructor(moduleBytes: string, args: Args) {
    this.moduleBytes = moduleBytes;
    this.args = args;
  }

  bytes(): Uint8Array {
    const moduleBytes = new Uint8Array(Buffer.from(this.moduleBytes, 'hex'));
    const lengthBytes = CLValueUInt32.newCLUInt32(
      BigNumber.from(moduleBytes.length)
    ).bytes();
    const bytesArrayBytes = CLValueByteArray.newCLByteArray(
      moduleBytes
    ).bytes();

    let result = concat([lengthBytes, bytesArrayBytes]);

    if (this.args) {
      const argBytes = this.args.toBytes();
      result = concat([result, argBytes]);
    }

    return result;
  }
}

@jsonObject
export class StoredContractByHash {
  @jsonMember({ name: 'hash', constructor: ContractHash }) hash: ContractHash;
  @jsonMember({ name: 'entry_point', constructor: String }) entryPoint: string;
  @jsonMember({
    constructor: Args,
    name: 'args',
    deserializer: deserializeArgs,
    serializer: serializeArgs
  })
  args: Args;

  constructor(hash: ContractHash, entryPoint: string, args: Args) {
    this.hash = hash;
    this.entryPoint = entryPoint;
    this.args = args;
  }

  bytes(): Uint8Array {
    const hashBytes = this.hash.hash.toBytes();
    const entryPointBytes = CLValueString.newCLString(this.entryPoint).bytes();
    const argBytes = this.args.toBytes();

    return concat([hashBytes, entryPointBytes, argBytes]);
  }
}

@jsonObject
export class StoredContractByName {
  @jsonMember({ name: 'name', constructor: String }) name: string;
  @jsonMember({ name: 'entry_point', constructor: String }) entryPoint: string;
  @jsonMember({
    constructor: Args,
    name: 'args',
    deserializer: deserializeArgs,
    serializer: serializeArgs
  })
  args: Args;

  constructor(name: string, entryPoint: string, args: Args) {
    this.name = name;
    this.entryPoint = entryPoint;
    this.args = args;
  }

  bytes(): Uint8Array {
    const nameBytes = CLValueString.newCLString(this.name).bytes();
    const entryPointBytes = CLValueString.newCLString(this.entryPoint).bytes();
    const argBytes = this.args.toBytes();

    return concat([nameBytes, entryPointBytes, argBytes]);
  }
}

@jsonObject
export class StoredVersionedContractByHash {
  @jsonMember({ name: 'hash', constructor: ContractHash }) hash: ContractHash;
  @jsonMember({ name: 'entry_point', constructor: String }) entryPoint: string;
  @jsonMember({
    constructor: Args,
    name: 'args',
    deserializer: deserializeArgs,
    serializer: serializeArgs
  })
  args: Args;
  @jsonMember({ name: 'version', constructor: Number }) version?: number;

  constructor(
    hash: ContractHash,
    entryPoint: string,
    args: Args,
    version?: number
  ) {
    this.hash = hash;
    this.entryPoint = entryPoint;
    this.version = version;
    this.args = args;
  }

  bytes(): Uint8Array {
    const hashBytes = this.hash.hash.toBytes();
    const optionBytes = new CLValueOption(
      this.version
        ? CLValueUInt32.newCLUInt32(BigNumber.from(this.version))
        : null
    ).bytes();
    const entryPointBytes = CLValueString.newCLString(this.entryPoint).bytes();
    const argBytes = this.args?.toBytes() || new Uint8Array();

    return concat([hashBytes, optionBytes, entryPointBytes, argBytes]);
  }
}

@jsonObject
export class StoredVersionedContractByName {
  @jsonMember({ name: 'name', constructor: String }) name: string;
  @jsonMember({ name: 'entry_point', constructor: String }) entryPoint: string;
  @jsonMember({ name: 'version', constructor: Number }) version?: number;
  @jsonMember({
    constructor: Args,
    name: 'args',
    deserializer: deserializeArgs,
    serializer: serializeArgs
  })
  args: Args;

  constructor(name: string, entryPoint: string, args: Args, version?: number) {
    this.name = name;
    this.entryPoint = entryPoint;
    this.version = version;
    this.args = args;
  }

  bytes(): Uint8Array {
    const nameBytes = CLValueString.newCLString(this.name).bytes();
    const optionBytes = new CLValueOption(
      this.version
        ? CLValueUInt32.newCLUInt32(BigNumber.from(this.version))
        : null
    ).bytes();
    const entryPointBytes = CLValueString.newCLString(this.entryPoint).bytes();
    const argBytes = this.args?.toBytes() || new Uint8Array();

    return concat([nameBytes, optionBytes, entryPointBytes, argBytes]);
  }
}

@jsonObject
export class TransferDeployItem {
  @jsonMember({
    constructor: Args,
    name: 'args',
    deserializer: deserializeArgs,
    serializer: serializeArgs
  })
  args: Args;

  constructor(args: Args) {
    this.args = args;
  }

  public static newTransfer(
    amount: BigNumber | string,
    target: URef | PublicKey,
    sourcePurse: URef | null = null,
    id: BigNumberish
  ): TransferDeployItem {
    const runtimeArgs = Args.fromMap({});
    runtimeArgs.insert('amount', CLValueUInt512.newCLUInt512(amount));
    if (sourcePurse) {
      runtimeArgs.insert('source', CLValue.newCLUref(sourcePurse));
    }
    if (target instanceof URef) {
      runtimeArgs.insert('target', CLValue.newCLUref(target));
    } else if (target instanceof PublicKey) {
      runtimeArgs.insert('target', CLValue.newCLPublicKey(target));
    } else {
      throw new Error('Please specify target');
    }
    if (id === undefined) {
      throw new Error('transfer-id missing in new transfer.');
    } else {
      runtimeArgs.insert(
        'id',
        CLValueOption.newCLOption(CLValueUInt64.newCLUint64(id))
      );
    }
    return new TransferDeployItem(runtimeArgs);
  }

  bytes(): Uint8Array {
    return this.args.toBytes();
  }
}

@jsonObject
export class ExecutableDeployItem {
  @jsonMember({ name: 'ModuleBytes', constructor: ModuleBytes })
  moduleBytes?: ModuleBytes;
  @jsonMember({
    name: 'StoredContractByHash',
    constructor: StoredContractByHash
  })
  storedContractByHash?: StoredContractByHash;
  @jsonMember({
    name: 'StoredContractByName',
    constructor: StoredContractByName
  })
  storedContractByName?: StoredContractByName;
  @jsonMember({
    name: 'StoredVersionedContractByHash',
    constructor: StoredVersionedContractByHash
  })
  storedVersionedContractByHash?: StoredVersionedContractByHash;
  @jsonMember({
    name: 'StoredVersionedContractByName',
    constructor: StoredVersionedContractByName
  })
  storedVersionedContractByName?: StoredVersionedContractByName;
  @jsonMember({ name: 'Transfer', constructor: TransferDeployItem })
  transfer?: TransferDeployItem;

  getArgs(): Args {
    if (this.moduleBytes) return this.moduleBytes.args;
    if (this.storedContractByHash) return this.storedContractByHash.args;
    if (this.storedContractByName) return this.storedContractByName.args;
    if (this.storedVersionedContractByHash)
      return this.storedVersionedContractByHash.args;
    if (this.storedVersionedContractByName)
      return this.storedVersionedContractByName.args;
    if (this.transfer) return this.transfer.args;
    throw new Error('failed to serialize ExecutableDeployItemJsonWrapper');
  }

  bytes(): Uint8Array {
    let bytes: Uint8Array;

    if (this.moduleBytes) {
      bytes = this.moduleBytes.bytes();
      return concat([
        Uint8Array.of(ExecutableDeployItemType.ModuleBytes),
        bytes
      ]);
    } else if (this.storedContractByHash) {
      bytes = this.storedContractByHash.bytes();
      return concat([
        Uint8Array.of(ExecutableDeployItemType.StoredContractByHash),
        bytes
      ]);
    } else if (this.storedContractByName) {
      bytes = this.storedContractByName.bytes();
      return concat([
        Uint8Array.of(ExecutableDeployItemType.StoredContractByName),
        bytes
      ]);
    } else if (this.storedVersionedContractByHash) {
      bytes = this.storedVersionedContractByHash.bytes();
      return concat([
        Uint8Array.of(ExecutableDeployItemType.StoredVersionedContractByHash),
        bytes
      ]);
    } else if (this.storedVersionedContractByName) {
      bytes = this.storedVersionedContractByName.bytes();
      return concat([
        Uint8Array.of(ExecutableDeployItemType.StoredVersionedContractByName),
        bytes
      ]);
    } else if (this.transfer) {
      bytes = this.transfer.bytes();
      return concat([Uint8Array.of(ExecutableDeployItemType.Transfer), bytes]);
    }

    return new Uint8Array();
  }

  public static standardPayment(
    amount: BigNumber | string
  ): ExecutableDeployItem {
    const executableDeployItem = new ExecutableDeployItem();
    executableDeployItem.moduleBytes = new ModuleBytes(
      '',
      Args.fromMap({ amount: CLValueUInt512.newCLUInt512(amount) })
    );
    return executableDeployItem;
  }
}
