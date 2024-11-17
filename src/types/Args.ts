import { concat } from '@ethersproject/bytes';

import {
  CLTypeString,
  CLValue,
  CLValueParser,
  CLValueString,
  CLValueUInt32,
  IResultWithBytes
} from './clvalue';
import { jsonMapMember, jsonObject } from 'typedjson';
import { toBytesString, toBytesU32 } from './ByteConverters';

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
   * Creates a `NamedArg` instance from a byte array.
   * @param bytes - The byte array to parse.
   * @returns A new `NamedArg` instance.
   * @throws Error if the value data is missing.
   */
  public static fromBytes(bytes: Uint8Array): NamedArg {
    const stringValue = CLValueString.fromBytes(bytes);

    if (!stringValue.bytes) {
      throw new Error('Missing data for value of named arg');
    }

    const value = CLValueParser.fromBytesByType(
      stringValue.bytes,
      CLTypeString
    );
    return new NamedArg(value.result.toString(), value.result);
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
    serializer: serRA,
    deserializer: desRA
  })
  public args: Map<string, CLValue>;

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
   * Parses the byte array to extract each argument.
   * @param bytes - The byte array to parse.
   * @returns An object containing a new `Args` instance and any remaining bytes.
   * @throws Error if there is an issue parsing the bytes.
   */
  public static fromBytes(bytes: Uint8Array): IResultWithBytes<Args> {
    const uint32 = CLValueUInt32.fromBytes(bytes);
    const size = uint32.result.getValue().toNumber();

    let remainBytes: Uint8Array | undefined = uint32.bytes;
    const res: NamedArg[] = [];
    for (let i = 0; i < size; i++) {
      if (!remainBytes) {
        throw new Error('Error while parsing bytes');
      }
      const namedArg = NamedArg.fromBytes(remainBytes);
      res.push(namedArg);
      remainBytes = undefined;
    }
    return {
      result: Args.fromNamedArgs(res),
      bytes: remainBytes || Uint8Array.from([])
    };
  }
}
