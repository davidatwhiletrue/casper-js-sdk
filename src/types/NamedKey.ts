import { jsonMember, jsonObject } from 'typedjson';
import { Key } from './key';
import { CLValue, CLValueParser } from './clvalue';

const ErrNamedKeyNotFound = new Error('NamedKey not found');

@jsonObject
export class NamedKey {
  @jsonMember({ name: 'name', constructor: String })
  name: string;

  @jsonMember({ name: 'key', constructor: Key })
  key: Key;

  constructor(name: string, key: Key) {
    this.name = name;
    this.key = key;
  }
}

@jsonObject
export class NamedKeyValue {
  @jsonMember({
    name: 'name',
    constructor: CLValue,
    deserializer: json => {
      if (!json) return;
      return CLValueParser.fromJSON(json);
    },
    serializer: value => {
      if (!value) return;
      return CLValueParser.toJSON(value);
    }
  })
  name: CLValue;

  @jsonMember({
    name: 'named_key',
    constructor: CLValue,
    deserializer: json => {
      if (!json) return;
      return CLValueParser.fromJSON(json);
    },
    serializer: value => {
      if (!value) return;
      return CLValueParser.toJSON(value);
    }
  })
  namedKey: CLValue;

  constructor(name: CLValue, namedKey: CLValue) {
    this.name = name;
    this.namedKey = namedKey;
  }
}

export class NamedKeys {
  keys: NamedKey[];

  constructor(keys: NamedKey[]) {
    this.keys = keys;
  }

  toMap(): Map<string, string> {
    const result = new Map<string, string>();
    this.keys.forEach(namedKey => {
      result.set(namedKey.name, namedKey.key.toString());
    });
    return result;
  }

  find(target: string): Key {
    for (const nk of this.keys) {
      if (nk.name === target) {
        return nk.key;
      }
    }
    throw ErrNamedKeyNotFound;
  }
}
