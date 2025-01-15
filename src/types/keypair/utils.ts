import { Conversions } from '../Conversions';

/**
 * Reads in a base64 private key, ignoring the header: `-----BEGIN PUBLIC KEY-----`
 * and footer: `-----END PUBLIC KEY-----`
 * @param {string} content A .pem private key string with a header and footer
 * @returns A base64 private key as a `Uint8Array`
 * @remarks
 * If the provided base64 `content` string does not include a header/footer,
 * it will pass through this function unaffected
 * @example
 * Example PEM:
 *
 * ```
 * -----BEGIN PUBLIC KEY-----\r\n
 * MFYwEAYHKoZIzj0CAQYFK4EEAAoDQgAEj1fgdbpNbt06EY/8C+wbBXq6VvG+vCVD\r\n
 * Nl74LvVAmXfpdzCWFKbdrnIlX3EFDxkd9qpk35F/kLcqV3rDn/u3dg==\r\n
 * -----END PUBLIC KEY-----\r\n
 * ```
 */
export function readBase64WithPEM(content: string): Uint8Array {
  const base64 = content
    // there are two kinks of line-endings, CRLF(\r\n) and LF(\n)
    // we need handle both
    .split(/\r?\n/)
    .filter(x => !x.startsWith('---'))
    .join('')
    // remove the line-endings in the end of content
    .trim();
  return Conversions.decodeBase64(base64);
}
