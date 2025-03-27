import { TypeID, TypeName, CLType } from './CLType';

/**
 * Represents a dynamic CLType in the Casper type system.
 * This class allows for runtime determination of types, enabling dynamic manipulation of CLTypes.
 */
export class CLTypeDynamic implements CLType {
  public typeID: TypeID;
  public inner: CLType;

  /**
   * Initializes a new instance of the CLTypeDynamic class.
   * @param typeID - The TypeID representing the dynamic type.
   * @param inner - The inner CLType that this dynamic type represents.
   */
  constructor(typeID: TypeID, inner: CLType) {
    this.typeID = typeID;
    this.inner = inner;
  }

  /**
   * Converts the CLTypeDynamic instance to its byte representation.
   * @returns A Uint8Array representing the bytes of the inner CLType.
   */
  public toBytes(): Uint8Array {
    return this.inner.toBytes();
  }

  /**
   * Provides a string representation of the CLTypeDynamic.
   * @returns A string representing the inner CLType.
   */
  public toString(): string {
    return this.inner.toString();
  }

  /**
   * Retrieves the type ID of the CLTypeDynamic.
   * @returns The TypeID associated with this dynamic type.
   */
  public getTypeID(): TypeID {
    return this.typeID;
  }

  /**
   * Retrieves the name of the CLTypeDynamic.
   * @returns The TypeName of the inner CLType.
   */
  public getName(): TypeName {
    return this.inner.getName();
  }

  /**
   * Converts the CLTypeDynamic instance to a JSON-compatible representation.
   * @returns A JSON representation of the inner CLType.
   */
  public toJSON(): any {
    return this.inner.toJSON();
  }
}
