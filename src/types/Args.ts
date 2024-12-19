import { concat } from '@ethersproject/bytes';
import { jsonMapMember, jsonObject } from 'typedjson';

import { CLValue, CLValueParser } from './clvalue';
import { toBytesString, toBytesU32, writeInteger } from './ByteConverters';

/**
 * Represents a named argument with a name and associated `CLValue`, which can be serialized to bytes.
 */
export class NamedArg {
  /**
   * Creates an instance of NamedArg.
   * @param name - The name of the argument.
   * @param value - The `CLValue` associated with this argument.
   */
  constructor(public name: string, public value: CLValue) {}

  /**
   * Converts the named argument to a byte array representation.
   * @returns A `Uint8Array` containing the serialized argument name and value.
   */
  public toBytes(): Uint8Array {
    const name = toBytesString(this.name);
    const value = CLValueParser.toBytesWithType(this.value);
    return concat([name, value]);
  }

  /**
   * Converts a `NamedArg` object to a `Uint8Array` for serialization.
   *
   * The method encodes the name of the argument as a UTF-8 string, followed by the serialized
   * bytes of its value. The resulting `Uint8Array` can be used for further processing, such as
   * storage or transmission.
   *
   * @param source - The `NamedArg` object to serialize. It contains a name and a value.
   * @returns A `Uint8Array` representing the serialized `NamedArg`.
   *
   * @example
   * ```typescript
   * const namedArg = new NamedArg("arg1", CLValue.u32(42));
   * const serializedBytes = YourClass.toBytesWithNamedArg(namedArg);
   * console.log(serializedBytes); // Logs the serialized bytes.
   * ```
   */
  public static toBytesWithNamedArg(source: NamedArg): Uint8Array {
    // The buffer size is fixed at 1024 bytes based on the expected maximum size of
    // encoded data, with room for edge cases. If inputs exceed this size, revisit
    // the implementation.
    const buffer = new ArrayBuffer(1024);
    const view = new DataView(buffer);
    let offset = 0;

    const nameBytes = new TextEncoder().encode(source.name);
    offset = writeInteger(view, offset, nameBytes.length);
    new Uint8Array(buffer, offset).set(nameBytes);
    offset += nameBytes.length;

    const valueBytes = CLValueParser.toBytesWithType(source.value);
    new Uint8Array(buffer, offset).set(valueBytes);
    offset += valueBytes.length;

    return new Uint8Array(buffer, 0, offset);
  }

  /**
   * Creates a `NamedArg` instance from a byte array.
   * @param bytes - The byte array to parse.
   * @returns A `NamedArg` instance.
   */
  public static fromBytes(bytes: Uint8Array): NamedArg {
    let offset = 0;

    const nameLength = new DataView(bytes.buffer).getUint32(offset, true);
    offset += 4;
    const nameBytes = bytes.slice(offset, offset + nameLength);
    offset += nameLength;
    const name = new TextDecoder().decode(nameBytes);

    const valueBytes = bytes.slice(offset);
    const value = CLValueParser.fromBytesWithType(valueBytes);

    return new NamedArg(name, value.result);
  }
}

/**
 * Serializes a map of arguments to an array format for JSON.
 * @param map - The map of arguments to serialize.
 * @returns An array where each entry is a key-value pair in JSON format.
 */
const serRA = (map: Map<string, CLValue>) => {
  return Array.from(map, ([key, value]) => [key, CLValueParser.toJSON(value)]);
};

/**
 * Deserializes an array format to a map of arguments.
 * @param _arr - The array of key-value pairs to deserialize.
 * @returns A map containing each key-value pair.
 * @throws Error if a duplicate key is detected.
 */
const desRA = (_arr: any) => {
  const parsed = new Map(
    Array.from(_arr, ([key, value]) => {
      const val = CLValueParser.fromJSON(value);
      return [key, val];
    })
  );

  if (parsed.size !== Array.from(_arr).length)
    throw Error(`Duplicate key exists.`);

  return parsed;
};

/**
 * Represents a set of named arguments (`NamedArg`) for a contract call.
 * Provides methods to serialize, deserialize, and manipulate argument entries.
 */
@jsonObject
export class Args {
  /**
   * The map of argument names to `CLValue` values.
   */
  @jsonMapMember(String, CLValue, {
    serializer: (map: Map<string, CLValue>) => serRA(map),
    deserializer: desRA
  })
  public args: Map<string, CLValue>;

  public getByName(argName: string): CLValue | undefined {
    return this.args.get(argName);
  }

  /**
   * Creates an instance of `Args` from a map of arguments.
   * @param args - A map containing argument names as keys and `CLValue` instances as values.
   */
  constructor(args: Map<string, CLValue>) {
    this.args = args;
  }

  /**
   * Creates an `Args` instance from an object.
   * @param args - An object containing argument names as keys and `CLValue` instances as values.
   * @returns A new `Args` instance.
   */
  public static fromMap(args: Record<string, CLValue>): Args {
    const map: Map<string, CLValue> = new Map(
      Object.keys(args).map(k => [k, args[k]])
    );
    return new Args(map);
  }

  /**
   * Creates an `Args` instance from an array of `NamedArg` instances.
   * @param namedArgs - An array of `NamedArg` instances.
   * @returns A new `Args` instance.
   */
  public static fromNamedArgs(namedArgs: NamedArg[]): Args {
    const args = namedArgs.reduce<Record<string, CLValue>>((pre, cur) => {
      pre[cur.name] = cur.value;
      return pre;
    }, {});
    return this.fromMap(args);
  }

  /**
   * Inserts a new argument into the map.
   * @param key - The argument name.
   * @param value - The `CLValue` for the argument.
   */
  public insert(key: string, value: CLValue) {
    this.args.set(key, value);
  }

  /**
   * Converts the arguments to a byte array.
   * The format includes the number of arguments followed by each argument in bytes.
   * @returns A `Uint8Array` containing the serialized arguments.
   */
  public toBytes(): Uint8Array {
    const vec = Array.from(this.args.entries()).map((a: [string, CLValue]) => {
      return new NamedArg(a[0], a[1]);
    });
    const valueByteList = vec.map(e => e.toBytes());
    valueByteList.splice(0, 0, toBytesU32(vec.length));

    return concat(valueByteList);
  }

  /**
   * Creates an `Args` instance from a byte array.
   * @param bytes - The byte array to parse.
   * @returns An `Args` instance.
   */
  public static fromBytes(bytes: Uint8Array): Args {
    let offset = 0;

    const numArgs = new DataView(bytes.buffer).getUint32(offset, true);
    offset += 4;

    const args = new Map<string, CLValue>();

    for (let i = 0; i < numArgs; i++) {
      const namedArgBytes = bytes.slice(offset);
      const namedArg = NamedArg.fromBytes(namedArgBytes);

      const nameLength = new DataView(namedArgBytes.buffer).getUint32(0, true);
      const valueBytes = CLValueParser.toBytesWithType(namedArg.value);
      const consumedBytes = 4 + nameLength + valueBytes.length;

      offset += consumedBytes;

      args.set(namedArg.name, namedArg.value);
    }

    return new Args(args);
  }
}
