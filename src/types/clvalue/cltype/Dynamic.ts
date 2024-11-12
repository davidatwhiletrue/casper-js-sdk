import { TypeID, TypeName, CLType } from './CLType';

/**
 * Represents a dynamic CLType in the CasperLabs type system.
 * This class allows for runtime determination of CLTypes.
 */
export class CLTypeDynamic implements CLType {
  public typeID: TypeID;
  public inner: CLType;

  /**
   * Constructs a new CLTypeDynamic instance.
   * @param typeID - The TypeID of the dynamic type.
   * @param inner - The inner CLType that this dynamic type represents.
   */
  constructor(typeID: TypeID, inner: CLType) {
    this.typeID = typeID;
    this.inner = inner;
  }

  /**
   * Converts the CLTypeDynamic to its byte representation.
   * @returns A Uint8Array representing the bytes of the inner CLType.
   */
  public toBytes(): Uint8Array {
    return this.inner.toBytes();
  }

  /**
   * Returns a string representation of the CLTypeDynamic.
   * @returns A string representation of the inner CLType.
   */
  public toString(): string {
    return this.inner.toString();
  }

  /**
   * Gets the type ID of the CLTypeDynamic.
   * @returns The TypeID of the dynamic type.
   */
  public getTypeID(): TypeID {
    return this.typeID;
  }

  /**
   * Gets the name of the CLTypeDynamic.
   * @returns The TypeName of the inner CLType.
   */
  public getName(): TypeName {
    return this.inner.getName();
  }

  /**
   * Converts the CLTypeDynamic to a JSON representation.
   * @returns The JSON representation of the inner CLType.
   */
  public toJSON(): any {
    return this.inner.toJSON();
  }
}
