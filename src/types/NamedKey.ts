import { jsonMember, jsonObject } from 'typedjson';
import { Key } from './key';
import { CLValue, CLValueParser } from './clvalue';

const ErrNamedKeyNotFound = new Error('NamedKey not found');

/**
 * Represents a named key, consisting of a name and an associated key.
 */
@jsonObject
export class NamedKey {
  /**
   * The name of the named key.
   */
  @jsonMember({ name: 'name', constructor: String })
  name: string;

  /**
   * The key associated with the named key.
   */
  @jsonMember({
    name: 'key',
    constructor: Key,
    deserializer: json => Key.fromJSON(json),
    serializer: (value: Key) => value.toJSON()
  })
  key: Key;

  /**
   * Creates a new instance of `NamedKey` with a name and key.
   *
   * @param name The name of the key.
   * @param key The associated key.
   */
  constructor(name: string, key: Key) {
    this.name = name;
    this.key = key;
  }
}

/**
 * Represents a value of a named key, where both the name and key value are `CLValue` types.
 */
@jsonObject
export class NamedKeyValue {
  /**
   * The name of the named key represented as a `CLValue`.
   */
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

  /**
   * The value of the named key represented as a `CLValue`.
   */
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

  /**
   * Creates a new `NamedKeyValue` instance with a name and named key value.
   *
   * @param name The name of the named key as a `CLValue`.
   * @param namedKey The value of the named key as a `CLValue`.
   */
  constructor(name: CLValue, namedKey: CLValue) {
    this.name = name;
    this.namedKey = namedKey;
  }
}

/**
 * Represents a collection of named keys. Provides methods for mapping and finding named keys.
 */
export class NamedKeys {
  /**
   * A list of `NamedKey` objects that are part of this collection.
   */
  keys: NamedKey[];

  /**
   * Creates a new `NamedKeys` instance with an array of `NamedKey` objects.
   *
   * @param keys An array of `NamedKey` objects.
   */
  constructor(keys: NamedKey[]) {
    this.keys = keys;
  }

  /**
   * Converts the collection of named keys into a `Map`, where the key is the named key's name and the value is the associated key as a string.
   *
   * @returns A `Map` with the named key's name as the key and the associated key as the value.
   */
  toMap(): Map<string, string> {
    const result = new Map<string, string>();
    this.keys.forEach(namedKey => {
      result.set(namedKey.name, namedKey.key.toString());
    });
    return result;
  }

  /**
   * Finds a `Key` by its name within the collection of named keys.
   *
   * @param target The name of the named key to find.
   * @returns The `Key` associated with the named key if found.
   * @throws {Error} If no named key with the specified name is found, throws `ErrNamedKeyNotFound`.
   */
  find(target: string): Key {
    for (const nk of this.keys) {
      if (nk.name === target) {
        return nk.key;
      }
    }
    throw ErrNamedKeyNotFound;
  }
}
