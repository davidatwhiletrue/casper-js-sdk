/**
 * Enum representing supported cryptographic key algorithms.
 */
export enum KeyAlgorithm {
  /** ED25519 digital signature algorithm */
  ED25519 = 1,

  /** SECP256K1 elliptic curve digital signature algorithm */
  SECP256K1 = 2
}

/**
 * Settings for each key algorithm, providing additional metadata.
 * Maps `KeyAlgorithm` enum values to their corresponding name.
 */
export const KeySettings: Record<KeyAlgorithm, { name: string }> = {
  [KeyAlgorithm.ED25519]: { name: 'ED25519' },
  [KeyAlgorithm.SECP256K1]: { name: 'SECP256K1' }
};

/**
 * Utility class for working with key algorithms, allowing conversion to string and byte formats.
 */
export class KeyAlgorithmUtils {
  /**
   * Creates an instance of KeyAlgorithmUtils.
   * @param algorithm - The key algorithm to manage.
   */
  constructor(private algorithm: KeyAlgorithm) {}

  /**
   * Returns the name of the key algorithm as a string.
   * @returns The name of the key algorithm, as defined in `KeySettings`.
   */
  toString(): string {
    return KeySettings[this.algorithm].name;
  }

  /**
   * Returns the numeric byte representation of the key algorithm.
   * @returns The numeric value of the key algorithm.
   */
  toByte(): number {
    return this.algorithm;
  }
}
