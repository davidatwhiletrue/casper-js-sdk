import { PublicKey } from './PublicKey';
import { KeyAlgorithm } from './Algorithm';

describe('test', () => {
  //   const pemFileContentEd = `-----BEGIN PUBLIC KEY-----
  // MCowBQYDK2VwAyEAWS6zcDC+hSDvR6T2u0mXdQ0vrcdkouY/hideH0+QGt4=
  // -----END PUBLIC KEY-----`;
  const pemFileContentSecp = `-----BEGIN PUBLIC KEY-----
MDYwEAYHKoZIzj0CAQYFK4EEAAoDIgADcdbp6+DxQ/cMW1XgUcfWnniFOAGUBbXX
f1DrqCh3fhY=
-----END PUBLIC KEY-----`;

  console.log(
    PublicKey.fromPem(pemFileContentSecp, KeyAlgorithm.SECP256K1).toHex()
  );
});
