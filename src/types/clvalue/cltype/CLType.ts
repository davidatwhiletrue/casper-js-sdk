/**
 * The byte size of a 32-bit integer.
 */
export const Int32ByteSize = 4;

/**
 * The byte size of a 64-bit integer.
 */
export const Int64ByteSize = 8;

/**
 * Enumeration of type identifiers used within the Casper type system.
 * Each TypeID uniquely identifies a specific data type.
 */
export enum TypeID {
  Bool,
  I32,
  I64,
  U8,
  U32,
  U64,
  U128,
  U256,
  U512,
  Unit,
  String,
  Key,
  URef,
  Option,
  List,
  ByteArray,
  Result,
  Map,
  Tuple1,
  Tuple2,
  Tuple3,
  Any,
  PublicKey
}

/**
 * Type alias for the string representation of a type name.
 */
export type TypeName = string;

/**
 * Object containing string constants for each type name in the Casper type system.
 */
export const TypeName = {
  Bool: 'Bool' as TypeName,
  I32: 'I32' as TypeName,
  I64: 'I64' as TypeName,
  U8: 'U8' as TypeName,
  U32: 'U32' as TypeName,
  U64: 'U64' as TypeName,
  U128: 'U128' as TypeName,
  U256: 'U256' as TypeName,
  U512: 'U512' as TypeName,
  Unit: 'Unit' as TypeName,
  String: 'String' as TypeName,
  Key: 'Key' as TypeName,
  URef: 'URef' as TypeName,
  Option: 'Option' as TypeName,
  List: 'List' as TypeName,
  ByteArray: 'ByteArray' as TypeName,
  Result: 'Result' as TypeName,
  Map: 'Map' as TypeName,
  Tuple1: 'Tuple1' as TypeName,
  Tuple2: 'Tuple2' as TypeName,
  Tuple3: 'Tuple3' as TypeName,
  Any: 'Any' as TypeName,
  PublicKey: 'PublicKey' as TypeName
};

/**
 * Interface representing a CLType in the Casper type system.
 */
export interface CLType {
  /**
   * Converts the CLType instance to its byte representation.
   * @returns A Uint8Array representing the CLType.
   */
  toBytes(): Uint8Array;

  /**
   * Provides a string representation of the CLType.
   * @returns A string representation of the CLType.
   */
  toString(): string;

  /**
   * Retrieves the type ID of the CLType.
   * @returns The TypeID associated with the CLType.
   */
  getTypeID(): TypeID;

  /**
   * Retrieves the name of the CLType.
   * @returns The TypeName associated with the CLType.
   */
  getName(): TypeName;

  /**
   * Converts the CLType instance to a JSON representation.
   * @returns A JSON-compatible representation of the CLType.
   */
  toJSON(): any;
}

/**
 * Represents a simple data type in the Casper type system.
 */
export class SimpleType implements CLType {
  private readonly typeID: TypeID;
  private readonly typeName: TypeName;

  /**
   * Constructs a new instance of the SimpleType class.
   * @param typeID - The TypeID for the simple type.
   * @param name - The TypeName for the simple type.
   */
  constructor(typeID: TypeID, name: TypeName) {
    this.typeID = typeID;
    this.typeName = name;
  }

  /**
   * Converts the SimpleType to its byte representation.
   * @returns A Uint8Array containing a single byte representing the type ID.
   */
  toBytes(): Uint8Array {
    return new Uint8Array([this.typeID]);
  }

  /**
   * Provides a string representation of the SimpleType.
   * @returns The name of the SimpleType.
   */
  toString(): string {
    return this.getName();
  }

  /**
   * Retrieves the type ID of the SimpleType.
   * @returns The TypeID for the SimpleType.
   */
  getTypeID(): TypeID {
    return this.typeID;
  }

  /**
   * Retrieves the name of the SimpleType.
   * @returns The TypeName for the SimpleType.
   */
  getName(): TypeName {
    return this.typeName;
  }

  /**
   * Converts the SimpleType instance to a JSON representation.
   * @returns The name of the SimpleType as a string.
   */
  toJSON(): string {
    return this.getName();
  }
}

// Predefined SimpleType instances

/**
 * Represents a Boolean type in the Casper type system.
 */
export const CLTypeBool = new SimpleType(TypeID.Bool, TypeName.Bool);

/**
 * Represents a 32-bit signed integer type in the Casper type system.
 */
export const CLTypeInt32 = new SimpleType(TypeID.I32, TypeName.I32);

/**
 * Represents a 64-bit signed integer type in the Casper type system.
 */
export const CLTypeInt64 = new SimpleType(TypeID.I64, TypeName.I64);

/**
 * Represents an 8-bit unsigned integer type in the Casper type system.
 */
export const CLTypeUInt8 = new SimpleType(TypeID.U8, TypeName.U8);

/**
 * Represents a 32-bit unsigned integer type in the Casper type system.
 */
export const CLTypeUInt32 = new SimpleType(TypeID.U32, TypeName.U32);

/**
 * Represents a 64-bit unsigned integer type in the Casper type system.
 */
export const CLTypeUInt64 = new SimpleType(TypeID.U64, TypeName.U64);

/**
 * Represents a 128-bit unsigned integer type in the Casper type system.
 */
export const CLTypeUInt128 = new SimpleType(TypeID.U128, TypeName.U128);

/**
 * Represents a 256-bit unsigned integer type in the Casper type system.
 */
export const CLTypeUInt256 = new SimpleType(TypeID.U256, TypeName.U256);

/**
 * Represents a 512-bit unsigned integer type in the Casper type system.
 */
export const CLTypeUInt512 = new SimpleType(TypeID.U512, TypeName.U512);

/**
 * Represents a Unit type (similar to void) in the Casper type system.
 */
export const CLTypeUnit = new SimpleType(TypeID.Unit, TypeName.Unit);

/**
 * Represents a String type in the Casper type system.
 */
export const CLTypeString = new SimpleType(TypeID.String, TypeName.String);

/**
 * Represents a Key type in the Casper type system.
 */
export const CLTypeKey = new SimpleType(TypeID.Key, TypeName.Key);

/**
 * Represents a URef (Unforgeable Reference) type in the Casper type system.
 */
export const CLTypeUref = new SimpleType(TypeID.URef, TypeName.URef);

/**
 * Represents an Any type in the Casper type system.
 */
export const CLTypeAny = new SimpleType(TypeID.Any, TypeName.Any);

/**
 * Represents a PublicKey type in the Casper type system.
 */
export const CLTypePublicKey = new SimpleType(
  TypeID.PublicKey,
  TypeName.PublicKey
);
