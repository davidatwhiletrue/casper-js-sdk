import isNull from 'lodash/isNull';
import { concat } from '@ethersproject/bytes';

import { jsonMember, jsonObject } from 'typedjson';
import { getRuntimeTag, TransactionRuntime } from './AddressableEntity';
import { Hash } from './key';
import { CLValueString } from './clvalue';
import { ExecutableDeployItem } from './ExecutableDeployItem';

/**
 * Enum representing different types of transaction targets.
 */
enum TransactionTargetType {
  /** Native target type, used for transactions without a specific target. */
  Native = 0,
  /** Stored target type, used for contracts or stored items. */
  Stored = 1,
  /** Session target type, used for session-based transactions. */
  Session = 2
}

/**
 * Enum representing different invocation target tags for identifying transaction target types.
 */
enum InvocationTargetTag {
  /** Invocation target by hash. */
  ByHash = 0,
  /** Invocation target by name. */
  ByName = 1,
  /** Invocation target by package hash. */
  ByPackageHash = 2,
  /** Invocation target by package name. */
  ByPackageName = 3
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
  @jsonMember({ name: 'runtime', constructor: String })
  runtime: TransactionRuntime;
}

/**
 * Represents a session target, which includes both the module bytes and runtime.
 */
@jsonObject
export class SessionTarget {
  /**
   * The module bytes associated with the session target.
   */
  @jsonMember({ name: 'module_bytes', constructor: String })
  moduleBytes: string;

  /**
   * The runtime associated with the session target.
   */
  @jsonMember({ name: 'runtime', constructor: String })
  runtime: TransactionRuntime;
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
   * Converts a 32-bit unsigned integer to a byte array.
   *
   * @param value The 32-bit unsigned integer to convert.
   * @returns A `Uint8Array` representing the value.
   */
  private uint32ToBytes(value: number): Uint8Array {
    const buffer = new ArrayBuffer(4);
    new DataView(buffer).setUint32(0, value, true);
    return new Uint8Array(buffer);
  }

  /**
   * Converts a hexadecimal string to a byte array.
   *
   * @param hexString The hexadecimal string to convert.
   * @returns A `Uint8Array` representing the hexadecimal string.
   */
  private hexStringToBytes(hexString: string): Uint8Array {
    return Uint8Array.from(Buffer.from(hexString, 'hex'));
  }

  /**
   * Serializes the `TransactionTarget` into a byte array.
   *
   * @returns A `Uint8Array` representing the serialized transaction target.
   */
  toBytes(): Uint8Array {
    let result: Uint8Array = new Uint8Array();

    if (this.native !== undefined) {
      result = concat([result, Uint8Array.of(TransactionTargetType.Native)]);
    } else if (this.stored !== undefined) {
      result = concat([result, Uint8Array.of(TransactionTargetType.Stored)]);

      if (this.stored.id.byHash !== undefined) {
        result = concat([
          result,
          Uint8Array.of(InvocationTargetTag.ByHash),
          this.stored.id.byHash.toBytes()
        ]);
      } else if (this.stored.id.byName !== undefined) {
        const nameBytes = new CLValueString(this.stored.id.byName).bytes();
        result = concat([
          result,
          Uint8Array.of(InvocationTargetTag.ByName),
          nameBytes
        ]);
      } else if (this.stored.id.byPackageHash !== undefined) {
        result = concat([
          result,
          Uint8Array.of(InvocationTargetTag.ByPackageHash),
          this.stored.id.byPackageHash.addr.toBytes()
        ]);

        if (this.stored.id.byPackageHash.version !== undefined) {
          const versionBytes = this.uint32ToBytes(
            this.stored.id.byPackageHash.version
          );
          result = concat([result, Uint8Array.of(1), versionBytes]);
        } else {
          result = concat([result, Uint8Array.of(0)]);
        }
      } else if (this.stored.id.byPackageName !== undefined) {
        const nameBytes = new CLValueString(
          this.stored.id.byPackageName.name
        ).bytes();
        result = concat([
          result,
          Uint8Array.of(InvocationTargetTag.ByPackageName),
          nameBytes
        ]);

        if (this.stored.id.byPackageName.version !== undefined) {
          const versionBytes = this.uint32ToBytes(
            this.stored.id.byPackageName.version
          );
          result = concat([result, Uint8Array.of(1), versionBytes]);
        } else {
          result = concat([result, Uint8Array.of(0)]);
        }
      }

      const runtimeTag = getRuntimeTag(this.stored.runtime);
      result = concat([result, Uint8Array.of(runtimeTag)]);
    } else if (this.session !== undefined) {
      result = concat([result, Uint8Array.of(TransactionTargetType.Session)]);

      const moduleBytes = this.session.moduleBytes
        ? this.hexStringToBytes(this.session.moduleBytes)
        : new Uint8Array([0]);
      const moduleLengthBytes = this.uint32ToBytes(moduleBytes.length);
      result = concat([result, moduleLengthBytes, moduleBytes]);

      const runtimeTag = getRuntimeTag(this.session.runtime);
      result = concat([result, Uint8Array.of(runtimeTag)]);
    }

    return result;
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
      const storedTarget = new StoredTarget();
      storedTarget.runtime = json.Stored.runtime;

      const invocationTarget = new TransactionInvocationTarget();
      if (json.Stored.id.byHash) {
        invocationTarget.byHash = Hash.fromHex(json.Stored.id.byHash);
      } else if (json.Stored.id.byName) {
        invocationTarget.byName = json.Stored.id.byName;
      } else if (json.Stored.id.byPackageHash) {
        invocationTarget.byPackageHash = new ByPackageHashInvocationTarget();
        invocationTarget.byPackageHash.addr = Hash.fromHex(
          json.Stored.id.byPackageHash.addr
        );
        invocationTarget.byPackageHash.version =
          json.Stored.id.byPackageHash.version;
      } else if (json.Stored.id.byPackageName) {
        invocationTarget.byPackageName = new ByPackageNameInvocationTarget();
        invocationTarget.byPackageName.name = json.Stored.id.byPackageName.name;
        invocationTarget.byPackageName.version =
          json.Stored.id.byPackageName.version;
      }

      storedTarget.id = invocationTarget;
      target.stored = storedTarget;
    } else if (json.Session) {
      const sessionTarget = new SessionTarget();
      sessionTarget.runtime = json.Session.runtime;
      sessionTarget.moduleBytes = json.Session.module_bytes;
      target.session = sessionTarget;
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
      return {
        Stored: {
          id: this.stored.id,
          runtime: this.stored.runtime
        }
      };
    } else if (this.session !== undefined) {
      return {
        Session: {
          module_bytes: this.session.moduleBytes,
          runtime: this.session.runtime
        }
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
      sessionTarget.runtime = 'VmCasperV1';

      transactionTarget.session = sessionTarget;
      return transactionTarget;
    }

    if (session.storedContractByHash !== undefined) {
      const storedTarget = new StoredTarget();
      const invocationTarget = new TransactionInvocationTarget();
      const hash = session.storedContractByHash.hash.hash;
      invocationTarget.byHash = hash;
      storedTarget.runtime = 'VmCasperV1';
      storedTarget.id = invocationTarget;

      transactionTarget.stored = storedTarget;
      return transactionTarget;
    }

    if (session.storedContractByName !== undefined) {
      const storedTarget = new StoredTarget();
      const invocationTarget = new TransactionInvocationTarget();
      invocationTarget.byName = session.storedContractByName.name;

      storedTarget.runtime = 'VmCasperV1';
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
      storedTarget.runtime = 'VmCasperV1';
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
      storedTarget.runtime = 'VmCasperV1';
      storedTarget.id = invocationTarget;

      transactionTarget.stored = storedTarget;

      return transactionTarget;
    }

    return new TransactionTarget();
  }
}
