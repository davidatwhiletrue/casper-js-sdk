import { concat } from '@ethersproject/bytes';

import {
  CLValue,
  CLValueParser,
  CLValueString,
  CLValueUInt32,
  IResultWithBytes,
  CLTypeString
} from './clvalue';
import { jsonMapMember, jsonObject } from 'typedjson';
import { toBytesString, toBytesU32 } from './ByteConverters';

export class NamedArg {
  constructor(public name: string, public value: CLValue) {}

  public toBytes(): Uint8Array {
    const name = toBytesString(this.name);
    const value = CLValueParser.toBytesWithType(this.value);
    return concat([name, value]);
  }

  public static fromBytes(bytes: Uint8Array): NamedArg {
    const stringValue = CLValueString.fromBytes(bytes);

    if (!stringValue.bytes) {
      new Error('Missing data for value of named arg');
    }

    const value = CLValueParser.fromBytesByType(
      stringValue.bytes,
      CLTypeString
    );
    return new NamedArg(value.result.toString(), value.result);
  }
}

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

const serRA = (map: Map<string, CLValue>) => {
  return Array.from(map, ([key, value]) => {
    return [key, CLValueParser.toJSON(value)];
  });
};

@jsonObject
export class Args {
  @jsonMapMember(String, CLValue, {
    serializer: serRA,
    deserializer: desRA
  })
  public args: Map<string, CLValue>;

  constructor(args: Map<string, CLValue>) {
    this.args = args;
  }

  public static fromMap(args: Record<string, CLValue>) {
    const map: Map<string, CLValue> = new Map(
      Object.keys(args).map(k => [k, args[k]])
    );
    return new Args(map);
  }

  public static fromNamedArgs(namedArgs: NamedArg[]) {
    const args = namedArgs.reduce<Record<string, CLValue>>((pre, cur) => {
      pre[cur.name] = cur.value;
      return pre;
    }, {});
    return this.fromMap(args);
  }

  public insert(key: string, value: CLValue) {
    this.args.set(key, value);
  }

  public toBytes(): Uint8Array {
    const vec = Array.from(this.args.entries()).map((a: [string, CLValue]) => {
      return new NamedArg(a[0], a[1]);
    });
    const valueByteList = vec.map(e => e.toBytes());
    valueByteList.splice(0, 0, toBytesU32(vec.length));

    return concat(valueByteList);
  }

  public static fromBytes(bytes: Uint8Array): IResultWithBytes<Args> {
    const uint32 = CLValueUInt32.fromBytes(bytes);
    const size = uint32.result.getValue().toNumber();

    let remainBytes: Uint8Array | undefined = uint32.bytes;
    const res: NamedArg[] = [];
    for (let i = 0; i < size; i++) {
      if (!remainBytes) {
        new Error('Error while parsing bytes');
        break;
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
