import { assert, expect } from 'chai';

import { TransformKind } from './Transform';
import { CLValue } from './clvalue';

describe('TransformKind JSON Parsing and CLValue Transformation', () => {
  const transformJson = {
    WriteCLValue: {
      bytes: '0467295a93',
      parsed: '2472159591',
      cl_type: 'U512'
    }
  };

  it('should correctly parse a valid TransformKind JSON object', () => {
    const transform = TransformKind.fromJSON(transformJson);
    expect(transform).to.not.be.undefined;
  });

  it('should parse WriteCLValue as a valid CLValue instance', () => {
    const transform = TransformKind.fromJSON(transformJson);
    const clValue = transform!.parseAsWriteCLValue()!;
    expect(clValue).to.be.an.instanceOf(CLValue);
  });

  it('should correctly parse and match the U512 value', () => {
    const transform = TransformKind.fromJSON(transformJson);
    const clValue = transform!.parseAsWriteCLValue()!;
    assert.deepEqual(
      clValue.ui512!.toNumber(),
      parseInt(transformJson.WriteCLValue.parsed, 10)
    );
  });

  it('should correctly parse Identity tranform', () => {
    const transformIdentityJson = {
      transform: 'Identity'
    };
    const transform = TransformKind.fromJSON(transformIdentityJson);
    expect(transformIdentityJson.transform).to.deep.equal(
      transform?.transformationData.transform
    );
  });

  it('should correctly parse and match the WriteAccount', () => {
    const transformWriteAccountJson = {
      WriteAccount:
        'account-hash-7f3688d1dc6adff9ce5e3ec90628f88e2fb39b763724cbdf9a7f9f68de0205ba'
    };
    const transform = TransformKind.fromJSON(transformWriteAccountJson);
    const accountHash = transform!.parseAsWriteAccount()!;
    expect(transformWriteAccountJson.WriteAccount).to.deep.equal(
      accountHash.toPrefixedString()
    );
  });

  it('should correctly parse and match the WriteDeployInfo', () => {
    const transformWriteDeployInfoJson = {
      WriteDeployInfo: {
        gas: '981979384',
        from:
          'account-hash-7f3688d1dc6adff9ce5e3ec90628f88e2fb39b763724cbdf9a7f9f68de0205ba',
        source:
          'uref-68b56afb28a42c3787326def04177eaa64ab31afdc7316e936f9ba1810019e4c-007',
        transfers: [],
        deploy_hash:
          'a2a4b37e33a04d5922e435e98ec8d555370a976eb7fa9913155a615fb2536649'
      }
    };
    const transform = TransformKind.fromJSON(transformWriteDeployInfoJson);
    const deployInfo = transform!.parseAsWriteDeployInfo()!;
    expect(deployInfo.from.toPrefixedString()).to.deep.equal(
      transformWriteDeployInfoJson.WriteDeployInfo.from
    );
    expect(deployInfo.gas).to.deep.equal(
      transformWriteDeployInfoJson.WriteDeployInfo.gas
    );
    expect(deployInfo.source.toPrefixedString()).to.deep.equal(
      transformWriteDeployInfoJson.WriteDeployInfo.source
    );
    expect(deployInfo.transfers).to.deep.equal([]);
    expect(deployInfo.deployHash.toHex()).to.deep.equal(
      transformWriteDeployInfoJson.WriteDeployInfo.deploy_hash
    );
  });

  it('should correctly parse and match the AddUInt512', () => {
    const transformAddUInt512Json = {
      AddUInt512: '2472159591'
    };
    const transform = TransformKind.fromJSON(transformAddUInt512Json);
    const uInt512 = transform!.parseAsUInt512()!;
    assert.deepEqual(
      uInt512!.toNumber(),
      parseInt(transformAddUInt512Json.AddUInt512, 10)
    );
  });

  it('should correctly parse and match the WriteTransfer', () => {
    const transformWriteJson = {
      WriteTransfer: {
        id: 0,
        to:
          'account-hash-c54c0a2fd689a68dd4114d4852fefa414d24d04f531176729070ca83bd924bea',
        gas: '0',
        from:
          'account-hash-d9c89d3ef62f1c8c5f951d1e44f136f133b728ae7291ea5d4f36530b6f02a910',
        amount: '193125900000000',
        source:
          'uref-b27476d0aa1d55ce26512424b40b093e3057b4d79636f124a3a5e1a9f44733e8-007',
        target:
          'uref-654802c4a00cf5e05ecb5c57a7d7731b1f8fa50036c17b49a4b0a5e71dd35055-004',
        deploy_hash:
          '683cbcf69dd1a029d4291e873d600566b50b40a7a40da2ba98e169971cd92ddd'
      }
    };

    const transform = TransformKind.fromJSON(transformWriteJson);
    const write = transform!.parseAsWriteTransfer();

    expect(write.from.toPrefixedString()).to.deep.equal(
      transformWriteJson.WriteTransfer.from
    );
    expect(write.to!.toPrefixedString()).to.deep.equal(
      transformWriteJson.WriteTransfer.to
    );
    assert.deepEqual(
      write.gas,
      parseInt(transformWriteJson.WriteTransfer.gas, 10)
    );
    expect(write.source.toPrefixedString()).to.deep.equal(
      transformWriteJson.WriteTransfer.source
    );
    assert.deepEqual(
      write.amount.toNumber(),
      parseInt(transformWriteJson.WriteTransfer.amount, 10)
    );
    assert.deepEqual(write.id, transformWriteJson.WriteTransfer.id);
    expect(write.deployHash.toHex()).to.deep.equal(
      transformWriteJson.WriteTransfer.deploy_hash
    );
    expect(write.target.toPrefixedString()).to.deep.equal(
      transformWriteJson.WriteTransfer.target
    );
  });
});
