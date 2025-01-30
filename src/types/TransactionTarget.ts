import isNull from 'lodash/isNull';
import { BigNumber } from '@ethersproject/bignumber';
import { concat } from '@ethersproject/bytes';

import { jsonMember, jsonObject, TypedJSON } from 'typedjson';
import { Hash } from './key';
import {
  CLTypeOption,
  CLTypeUInt32,
  CLValue,
  CLValueOption,
  CLValueString
} from './clvalue';
import { ExecutableDeployItem } from './ExecutableDeployItem';
import { CalltableSerialization } from './CalltableSerialization';
import {
  byteArrayJsonDeserializer,
  byteArrayJsonSerializer
} from './SerializationUtils';

/**
 * Represents a runtime environment for Casper transactions.
 * This class distinguishes between different versions of the Casper Virtual Machine (VM).
 */
@jsonObject
export class TransactionRuntime {
  /**
   * Internal tag representing Casper VM Version 1.
   */
  private static readonly VM_CASPER_V1_TAG = 0;

  /**
   * Internal tag representing Casper VM Version 2.
   */
  private static readonly VM_CASPER_V2_TAG = 1;

  /**
   * The tag used to identify the current VM version.
   */
  private _tag: number = TransactionRuntime.VM_CASPER_V1_TAG;

  /**
   * The index of the field used for tag serialization.
   */
  private static readonly TAG_FIELD_INDEX = 0;

  /**
   * Creates an instance of `TransactionRuntime` from a JSON string.
   *
   * @param json - The JSON string representing the type of the transaction runtime.
   * @returns A `TransactionRuntime` instance matching the specified type.
   * @throws Will throw an error if the provided JSON does not match known VM versions.
   */
  public static fromJSON(json: string): TransactionRuntime {
    switch (json) {
      case 'VmCasperV1':
        return TransactionRuntime.vmCasperV1();
      case 'VmCasperV2':
        return TransactionRuntime.vmCasperV2();
      default:
        throw new Error(`Unknown TransactionRuntime '${json}'`);
    }
  }

  /**
   * Serializes the current `TransactionRuntime` to a JSON string.
   *
   * @returns A JSON string representing the type of the transaction runtime.
   * @throws Will throw an error if the tag does not match known VM versions.
   */
  public toJSON(): string {
    switch (this._tag) {
      case TransactionRuntime.VM_CASPER_V1_TAG:
        return 'VmCasperV1';
      case TransactionRuntime.VM_CASPER_V2_TAG:
        return 'VmCasperV2';
      default:
        throw new Error(`Unknown TransactionRuntime '${this._tag}'`);
    }
  }

  /**
   * Creates a new instance representing the Casper Version 1 Virtual Machine.
   *
   * @returns A `TransactionRuntime` instance configured for VM Version 1.
   */
  public static vmCasperV1(): TransactionRuntime {
    const instance = new TransactionRuntime();
    instance._tag = TransactionRuntime.VM_CASPER_V1_TAG;
    return instance;
  }

  /**
   * Creates a new instance representing the Casper Version 2 Virtual Machine.
   *
   * @returns A `TransactionRuntime` instance configured for VM Version 2.
   */
  public static vmCasperV2(): TransactionRuntime {
    const instance = new TransactionRuntime();
    instance._tag = TransactionRuntime.VM_CASPER_V2_TAG;
    return instance;
  }

  /**
   * Serializes the current `TransactionRuntime` to a byte array.
   *
   * @returns A `Uint8Array` containing the serialized transaction runtime data.
   */
  public toBytes(): Uint8Array {
    return new CalltableSerialization()
      .addField(TransactionRuntime.TAG_FIELD_INDEX, Uint8Array.of(this._tag))
      .toBytes();
  }
}

/**
 * Represents the invocation target for a transaction identified by a package hash.
 */
@jsonObject
export class ByPackageHashInvocationTarget {
  /**
   * The address of the package in the form of a hash.
   */
  @jsonMember({
    name: 'addr',
    constructor: Hash,
    deserializer: json => Hash.fromJSON(json),
    serializer: value => value.toJSON()
  })
  addr: Hash;

  /**
   * The version of the package, if specified.
   */
  @jsonMember({ name: 'version', isRequired: false, constructor: Number })
  version?: number;

  public toBytes(): Uint8Array {
    const calltableSerialization = new CalltableSerialization();

    const versionBytes = this.version
      ? CLValue.newCLOption(
          CLValue.newCLUInt32(BigNumber.from(this.version))
        ).bytes()
      : new CLValueOption(null, new CLTypeOption(CLTypeUInt32)).bytes();

    calltableSerialization.addField(0, Uint8Array.of(2));
    calltableSerialization.addField(1, this.addr.toBytes());
    calltableSerialization.addField(2, versionBytes);

    return calltableSerialization.toBytes();
  }
}

/**
 * Represents the invocation target for a transaction identified by a package name.
 */
@jsonObject
export class ByPackageNameInvocationTarget {
  /**
   * The name of the package.
   */
  @jsonMember({ name: 'name', constructor: String })
  name: string;

  /**
   * The version of the package, if specified.
   */
  @jsonMember({ name: 'version', isRequired: false, constructor: Number })
  version?: number;

  public toBytes(): Uint8Array {
    const calltableSerialization = new CalltableSerialization();

    const versionBytes = this.version
      ? CLValue.newCLOption(
          CLValue.newCLUInt32(BigNumber.from(this.version))
        ).bytes()
      : new CLValueOption(null, new CLTypeOption(CLTypeUInt32)).bytes();

    calltableSerialization.addField(0, Uint8Array.of(3));
    calltableSerialization.addField(1, CLValue.newCLString(this.name).bytes());
    calltableSerialization.addField(2, versionBytes);

    return calltableSerialization.toBytes();
  }
}

/**
 * Represents a transaction invocation target, which can be one of the following:
 * - By hash
 * - By name
 * - By package hash
 * - By package name
 */
@jsonObject
export class TransactionInvocationTarget {
  /**
   * Invocation target by hash, if specified.
   */
  @jsonMember({
    name: 'ByHash',
    isRequired: false,
    constructor: Hash,
    deserializer: json => {
      if (!json) return;
      return Hash.fromJSON(json);
    },
    serializer: value => {
      if (!value) return;
      return value.toJSON();
    }
  })
  byHash?: Hash;

  /**
   * Invocation target by name, if specified.
   */
  @jsonMember({ name: 'ByName', isRequired: false, constructor: String })
  byName?: string;

  /**
   * Invocation target by package hash, if specified.
   */
  @jsonMember({
    name: 'ByPackageHash',
    isRequired: false,
    constructor: ByPackageHashInvocationTarget
  })
  byPackageHash?: ByPackageHashInvocationTarget;

  /**
   * Invocation target by package name, if specified.
   */
  @jsonMember({
    name: 'ByPackageName',
    isRequired: false,
    constructor: ByPackageNameInvocationTarget
  })
  byPackageName?: ByPackageNameInvocationTarget;

  public toBytes(): Uint8Array {
    if (this.byHash) {
      const calltableSerializer = new CalltableSerialization();
      calltableSerializer.addField(0, Uint8Array.of(0));
      calltableSerializer.addField(1, this.byHash.toBytes());
      return calltableSerializer.toBytes();
    } else if (this.byName) {
      const calltableSerializer = new CalltableSerialization();
      calltableSerializer.addField(0, Uint8Array.of(1));
      calltableSerializer.addField(1, CLValue.newCLString(this.byName).bytes());
      return calltableSerializer.toBytes();
    } else if (this.byPackageHash) {
      return this.byPackageHash.toBytes();
    } else if (this.byPackageName) {
      return this.byPackageName.toBytes();
    }

    throw new Error(
      'Can not convert TransactionInvocationTarget to bytes. Missing values from initialization'
    );
  }

  /**
   * Deserializes a `Uint8Array` into a `TransactionInvocationTarget` instance.
   *
   * This method reconstructs a `TransactionInvocationTarget` object from its serialized byte array representation.
   * The type of invocation target is determined by the tag extracted from the serialized data.
   *
   * @param bytes - The serialized byte array representing a `TransactionInvocationTarget`.
   * @returns A deserialized `TransactionInvocationTarget` instance.
   * @throws Error - If the byte array is invalid, missing required fields, or contains an unrecognized tag.
   *
   * ### Tags and Their Associated Targets:
   * - `0`: Represents an invocation target identified by a hash (`ByHash`).
   * - `1`: Represents an invocation target identified by a name (`ByName`).
   * - `2`: Represents an invocation target identified by a package hash and an optional version (`ByPackageHash`).
   * - `3`: Represents an invocation target identified by a package name and an optional version (`ByPackageName`).
   *
   * ### Example
   * ```typescript
   * const bytes = new Uint8Array([...]); // Provide valid TransactionInvocationTarget bytes
   * const invocationTarget = TransactionInvocationTarget.fromBytes(bytes);
   * console.log(invocationTarget); // Parsed TransactionInvocationTarget instance
   * ```
   */
  static fromBytes(bytes: Uint8Array): TransactionInvocationTarget {
    const calltable = CalltableSerialization.fromBytes(bytes);

    const tagBytes = calltable.getField(0);
    if (!tagBytes || tagBytes.length !== 1) {
      throw new Error(
        'Invalid or missing tag in serialized TransactionInvocationTarget'
      );
    }
    const tag = tagBytes[0];
    const invocationTarget = new TransactionInvocationTarget();

    switch (tag) {
      case 0: {
        const hashBytes = calltable.getField(1);
        if (!hashBytes) {
          throw new Error('Missing hash field for ByHash target');
        }
        invocationTarget.byHash = Hash.fromBytes(hashBytes).result;
        return invocationTarget;
      }

      case 1: {
        const nameBytes = calltable.getField(1);
        if (!nameBytes) {
          throw new Error('Missing name field for ByName target');
        }
        invocationTarget.byName = CLValueString.fromBytes(
          nameBytes
        ).result.toString();
        return invocationTarget;
      }

      case 2: {
        const packageHashBytes = calltable.getField(1);
        const versionBytes = calltable.getField(2);

        if (!packageHashBytes || !versionBytes) {
          throw new Error('Missing fields for ByPackageHash target');
        }

        const packageHash = Hash.fromBytes(packageHashBytes);
        const version = CLValueOption.fromBytes(
          versionBytes,
          new CLTypeOption(CLTypeUInt32)
        ).result.toString();
        const byPackageHash = new ByPackageHashInvocationTarget();
        byPackageHash.addr = packageHash.result;
        byPackageHash.version = BigNumber.from(version).toNumber();
        invocationTarget.byPackageHash = byPackageHash;
        return invocationTarget;
      }

      case 3: {
        const nameBytes = calltable.getField(1);
        const versionBytes = calltable.getField(2);

        if (!nameBytes || !versionBytes) {
          throw new Error('Missing fields for ByPackageName target');
        }

        const name = CLValueString.fromBytes(nameBytes).result.toString();
        const version = CLValueOption.fromBytes(
          versionBytes,
          new CLTypeOption(CLTypeUInt32)
        ).result.toString();
        const byPackageName = new ByPackageNameInvocationTarget();
        byPackageName.version = BigNumber.from(version).toNumber();
        byPackageName.name = name;
        invocationTarget.byPackageName = byPackageName;
        return invocationTarget;
      }

      default:
        throw new Error(`Unknown TransactionInvocationTarget tag: ${tag}`);
    }
  }
}

/**
 * Represents a stored target, which includes both the invocation target and runtime.
 */
@jsonObject
export class StoredTarget {
  /**
   * The invocation target for the stored transaction.
   */
  @jsonMember({ name: 'id', constructor: TransactionInvocationTarget })
  id: TransactionInvocationTarget;

  /**
   * The runtime associated with the stored transaction.
   */
  @jsonMember({
    name: 'runtime',
    constructor: TransactionRuntime,
    deserializer: json => {
      if (!json) return;
      return TransactionRuntime.fromJSON(json);
    },
    serializer: (value: TransactionRuntime) => value.toJSON()
  })
  runtime: TransactionRuntime;

  public toBytes() {
    const calltableSerializer = new CalltableSerialization();
    calltableSerializer.addField(0, Uint8Array.of(1));
    calltableSerializer.addField(1, this.id.toBytes());
    calltableSerializer.addField(2, this.runtime.toBytes());

    return calltableSerializer.toBytes();
  }
}

/**
 * Represents a session target, which includes both the module bytes and runtime.
 */
@jsonObject
export class SessionTarget {
  /**
   * The module bytes associated with the session target.
   */
  @jsonMember({
    name: 'module_bytes',
    constructor: Uint8Array,
    deserializer: byteArrayJsonDeserializer,
    serializer: byteArrayJsonSerializer
  })
  moduleBytes: Uint8Array;

  /**
   * The runtime associated with the session target.
   */
  @jsonMember({
    name: 'runtime',
    constructor: TransactionRuntime,
    deserializer: json => {
      if (!json) return;
      return TransactionRuntime.fromJSON(json);
    },
    serializer: (value: TransactionRuntime) => value.toJSON()
  })
  runtime: TransactionRuntime;

  /**
   * The runtime associated with the session target.
   */
  @jsonMember({ name: 'is_install_upgrade', constructor: Boolean })
  isInstallUpgrade: boolean;

  public toBytes(): Uint8Array {
    const moduleBytesLength = new Uint8Array(
      new Uint32Array([this.moduleBytes.length]).buffer
    );

    const calltableSerializer = new CalltableSerialization();
    calltableSerializer.addField(0, Uint8Array.of(2));
    calltableSerializer.addField(
      1,
      new Uint8Array([this.isInstallUpgrade ? 0x01 : 0x00])
    );
    calltableSerializer.addField(2, this.runtime.toBytes());
    calltableSerializer.addField(
      3,
      concat([moduleBytesLength, this.moduleBytes])
    );

    return calltableSerializer.toBytes();
  }
}

/**
 * Represents a transaction target, which could be one of the following types:
 * - Native (no specific target)
 * - Stored (contract or stored item target)
 * - Session (session-based target)
 */
@jsonObject
export class TransactionTarget {
  /**
   * Native transaction target, representing a transaction with no specific target.
   */
  @jsonMember({ constructor: Object, name: 'Native' })
  native?: object;

  /**
   * Stored transaction target, representing a transaction that targets a stored contract or item.
   */
  @jsonMember({ name: 'Stored', constructor: StoredTarget })
  stored?: StoredTarget;

  /**
   * Session transaction target, representing a session-based transaction.
   */
  @jsonMember({ name: 'Session', constructor: SessionTarget })
  session?: SessionTarget;

  /**
   * Constructs a `TransactionTarget` instance with the specified values for native, stored, or session targets.
   *
   * @param native The native transaction target, if applicable.
   * @param stored The stored transaction target, if applicable.
   * @param session The session transaction target, if applicable.
   */
  constructor(native?: object, stored?: StoredTarget, session?: SessionTarget) {
    this.native = native;
    this.stored = stored;
    this.session = session;
  }

  /**
   * Serializes the `TransactionTarget` into a byte array.
   *
   * @returns A `Uint8Array` representing the serialized transaction target.
   */
  toBytes(): Uint8Array {
    if (this.native) {
      const calltableSerializer = new CalltableSerialization();
      calltableSerializer.addField(0, Uint8Array.of(0));

      return calltableSerializer.toBytes();
    } else if (this.stored) {
      return this.stored.toBytes();
    } else if (this.session) {
      return this.session.toBytes();
    }

    throw new Error(
      'Can not convert TransactionTarget to bytes. Missing values ( native | stored | session ) from initialization'
    );
  }

  /**
   * Deserializes a `TransactionTarget` from a JSON object.
   *
   * @param json The JSON object to deserialize.
   * @returns A `TransactionTarget` instance.
   * @throws Error if the JSON object format is invalid.
   */
  static fromJSON(json: any): TransactionTarget {
    const target = new TransactionTarget();

    if (typeof json === 'string' && json === 'Native') {
      target.native = {};
    } else if (json.Stored) {
      const serializer = new TypedJSON(StoredTarget);
      target.stored = serializer.parse(json.Stored);
    } else if (json.Session) {
      const serializer = new TypedJSON(SessionTarget);
      target.session = serializer.parse(json.Session);
    }

    return target;
  }

  /**
   * Converts the `TransactionTarget` into a JSON-compatible format.
   *
   * @returns The JSON representation of the `TransactionTarget`.
   * @throws Error if the target type is unknown.
   */
  toJSON(): any {
    if (this.native !== undefined) {
      return 'Native';
    } else if (this.stored !== undefined) {
      const serializer = new TypedJSON(StoredTarget);
      return {
        Stored: serializer.toPlainJson(this.stored)
      };
    } else if (this.session !== undefined) {
      const serializer = new TypedJSON(SessionTarget);
      return {
        Session: serializer.toPlainJson(this.session)
      };
    } else {
      throw new Error('unknown target type');
    }
  }

  /**
   * Creates a new `TransactionTarget` from a session-based transaction.
   *
   * @param session The `ExecutableDeployItem` that defines the session-based transaction.
   * @returns A new `TransactionTarget` instance derived from the session.
   */
  public static newTransactionTargetFromSession(
    session: ExecutableDeployItem
  ): TransactionTarget {
    const transactionTarget = new TransactionTarget();
    if (session.transfer !== undefined) {
      transactionTarget.native = {};
      return transactionTarget;
    }

    if (session.moduleBytes !== undefined) {
      const sessionTarget = new SessionTarget();
      sessionTarget.moduleBytes = session.moduleBytes.moduleBytes;
      sessionTarget.runtime = TransactionRuntime.vmCasperV1();

      transactionTarget.session = sessionTarget;
      return transactionTarget;
    }

    if (session.storedContractByHash !== undefined) {
      const storedTarget = new StoredTarget();
      const invocationTarget = new TransactionInvocationTarget();
      invocationTarget.byHash = session.storedContractByHash.hash.hash;
      storedTarget.runtime = TransactionRuntime.vmCasperV1();
      storedTarget.id = invocationTarget;

      transactionTarget.stored = storedTarget;
      return transactionTarget;
    }

    if (session.storedContractByName !== undefined) {
      const storedTarget = new StoredTarget();
      const invocationTarget = new TransactionInvocationTarget();
      invocationTarget.byName = session.storedContractByName.name;

      storedTarget.runtime = TransactionRuntime.vmCasperV1();
      storedTarget.id = invocationTarget;

      transactionTarget.stored = storedTarget;

      return transactionTarget;
    }

    if (session.storedVersionedContractByHash !== undefined) {
      let version: number | undefined;
      if (
        session.storedVersionedContractByHash.version !== undefined &&
        !isNull(session.storedVersionedContractByHash.version)
      ) {
        const versionNum = parseInt(
          session.storedVersionedContractByHash.version.toString(),
          10
        );
        if (!isNaN(versionNum)) {
          version = versionNum;
        }
      }

      const packageHashInvocationTarget = new ByPackageHashInvocationTarget();
      packageHashInvocationTarget.addr =
        session.storedVersionedContractByHash.hash.hash;
      packageHashInvocationTarget.version = version;

      const invocationTarget = new TransactionInvocationTarget();
      invocationTarget.byPackageHash = packageHashInvocationTarget;

      const storedTarget = new StoredTarget();
      storedTarget.runtime = TransactionRuntime.vmCasperV1();
      storedTarget.id = invocationTarget;

      transactionTarget.stored = storedTarget;

      return transactionTarget;
    }

    if (session.storedVersionedContractByName !== undefined) {
      let version: number | undefined;
      if (
        session.storedVersionedContractByName.version !== undefined &&
        !isNull(session.storedVersionedContractByName.version)
      ) {
        const versionNum = parseInt(
          session.storedVersionedContractByName.version.toString(),
          10
        );
        if (!isNaN(versionNum)) {
          version = versionNum;
        }
      }

      const packageNameInvocationTarget = new ByPackageNameInvocationTarget();
      packageNameInvocationTarget.name =
        session.storedVersionedContractByName.name;
      packageNameInvocationTarget.version = version;

      const invocationTarget = new TransactionInvocationTarget();
      invocationTarget.byPackageName = packageNameInvocationTarget;

      const storedTarget = new StoredTarget();
      storedTarget.runtime = TransactionRuntime.vmCasperV1();
      storedTarget.id = invocationTarget;

      transactionTarget.stored = storedTarget;

      return transactionTarget;
    }

    return new TransactionTarget();
  }
}
