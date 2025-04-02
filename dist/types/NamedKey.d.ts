import { Key } from './key';
import { CLValue } from './clvalue';
/**
 * Represents a named key, consisting of a name and an associated key.
 */
export declare class NamedKey {
    /**
     * The name of the named key.
     */
    name: string;
    /**
     * The key associated with the named key.
     */
    key: Key;
    /**
     * Creates a new instance of `NamedKey` with a name and key.
     *
     * @param name The name of the key.
     * @param key The associated key.
     */
    constructor(name: string, key: Key);
}
/**
 * Represents a value of a named key, where both the name and key value are `CLValue` types.
 */
export declare class NamedKeyValue {
    /**
     * The name of the named key represented as a `CLValue`.
     */
    name: CLValue;
    /**
     * The value of the named key represented as a `CLValue`.
     */
    namedKey: CLValue;
    /**
     * Creates a new `NamedKeyValue` instance with a name and named key value.
     *
     * @param name The name of the named key as a `CLValue`.
     * @param namedKey The value of the named key as a `CLValue`.
     */
    constructor(name: CLValue, namedKey: CLValue);
}
/**
 * Represents a collection of named keys. Provides methods for mapping and finding named keys.
 */
export declare class NamedKeys {
    /**
     * A list of `NamedKey` objects that are part of this collection.
     */
    keys: NamedKey[];
    /**
     * Creates a new `NamedKeys` instance with an array of `NamedKey` objects.
     *
     * @param keys An array of `NamedKey` objects.
     */
    constructor(keys: NamedKey[]);
    /**
     * Converts the collection of named keys into a `Map`, where the key is the named key's name and the value is the associated key as a string.
     *
     * @returns A `Map` with the named key's name as the key and the associated key as the value.
     */
    toMap(): Map<string, string>;
    /**
     * Finds a `Key` by its name within the collection of named keys.
     *
     * @param target The name of the named key to find.
     * @returns The `Key` associated with the named key if found.
     * @throws {Error} If no named key with the specified name is found, throws `ErrNamedKeyNotFound`.
     */
    find(target: string): Key;
}
