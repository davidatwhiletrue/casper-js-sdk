import { assert, expect } from 'chai';
import { TypedJSON } from 'typedjson';

import { Transform, TransformKey, TransformKind } from './Transform';
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

  it('should correctly parse and match the ContractPackage V1', () => {
    const transformContractPackageV1Json = {
      key:
        'hash-f1740bb7fecb174954378ced69b2ced7d0fedd0f37957f6bf00da27670a113ae',
      transform: 'WriteContractPackage'
    };
    const serializer = new TypedJSON(TransformKey);
    const jsonRes = serializer.parse(transformContractPackageV1Json);

    const isWriteContractPackage = jsonRes?.transform?.isWriteContractPackage();
    expect(isWriteContractPackage).to.be.true;
  });

  it('should correctly parse and match the ContractPackage V2', () => {
    const transformContractPackageV2Json = {
      key:
        'hash-b71675d8cf701d9bc584cb5152706873110e5158b004fb966ed28be49c66b39a',
      kind: {
        Write: {
          ContractPackage: {
            access_key:
              'uref-5268245ec93d03335ed91c860ac48885fa6ee15156871458a84daa93b2d04f06-007',
            versions: [
              {
                protocol_version_major: 2,
                contract_version: 1,
                contract_hash:
                  'contract-94b21891ae273b17eeb6a1899a52ab952bcc4da2e19626563f88d6cf7ab6a2bd'
              }
            ],
            disabled_versions: [],
            groups: [],
            lock_status: 'Locked'
          }
        }
      }
    };

    const serializer = new TypedJSON(Transform);
    const jsonRes = serializer.parse(transformContractPackageV2Json);
    const transformKind = jsonRes?.kind;

    const isWriteContractPackage = transformKind?.isWriteContractPackage();
    const contractPackage = transformKind?.parseAsWriteContractPackage();

    expect(isWriteContractPackage).to.be.true;
    expect(contractPackage).to.not.be.undefined;
    expect(contractPackage?.groups).to.deep.equal([]);
    expect(contractPackage?.disabledVersions).to.deep.equal([]);
    expect(contractPackage?.lockStatus).to.deep.equal(
      transformContractPackageV2Json.kind.Write.ContractPackage.lock_status
    );
    expect(contractPackage?.accessKey.toPrefixedString()).to.deep.equal(
      transformContractPackageV2Json.kind.Write.ContractPackage.access_key
    );

    expect(
      contractPackage?.versions[0]?.contractHash?.toPrefixedString()
    ).to.deep.equal(
      transformContractPackageV2Json.kind.Write.ContractPackage.versions[0]
        .contract_hash
    );
    expect(contractPackage?.versions[0]?.contractVersion).to.deep.equal(
      transformContractPackageV2Json.kind.Write.ContractPackage.versions[0]
        .contract_version
    );
    expect(contractPackage?.versions[0]?.protocolVersionMajor).to.deep.equal(
      transformContractPackageV2Json.kind.Write.ContractPackage.versions[0]
        .protocol_version_major
    );
  });

  it('should correctly parse and match the Contract V1', () => {
    const transformContractV1Json = {
      key:
        'hash-000022b5e09c1c45c35b228f0be16864d7da3985c69ea3c4e16133e9f476e03e',
      transform: 'WriteContract'
    };
    const serializer = new TypedJSON(TransformKey);
    const jsonRes = serializer.parse(transformContractV1Json);

    const isWriteContract = jsonRes?.transform?.isWriteContract();
    expect(isWriteContract).to.be.true;
  });

  it('should correctly parse and match the Contract V2', () => {
    const transformContractV2Json = {
      key:
        'hash-94b21891ae273b17eeb6a1899a52ab952bcc4da2e19626563f88d6cf7ab6a2bd',
      kind: {
        Write: {
          Contract: {
            contract_package_hash:
              'contract-package-b71675d8cf701d9bc584cb5152706873110e5158b004fb966ed28be49c66b39a',
            contract_wasm_hash:
              'contract-wasm-a9fb7ec293465829432a8e543a2c2d5bba6d622c512af7e0cf204f6f536a1cbf',
            named_keys: [
              {
                name: '__events',
                key:
                  'uref-821900c35dcc7bedfa01d4901621990552d80870228b4d9a37e47364ae7d12a6-007'
              },
              {
                name: '__events_ces_version',
                key:
                  'uref-993d25549280a839ef18c81d1211e86766ff29e7b7685912bc0e4e4a4964d886-007'
              },
              {
                name: '__events_length',
                key:
                  'uref-c640355c74023b0eb6025d376285235767ffe73d9be57d83576e647aa720eacc-007'
              },
              {
                name: '__events_schema',
                key:
                  'uref-5bf9cb0884874cc7d80e5bcab54c5100bfc8773908b85099ab569b32bd6bd72d-007'
              },
              {
                name: 'state',
                key:
                  'uref-c5ae802a50fb72194d3c543805bab1a612186bdf2cc5d62758595694a1928fff-007'
              }
            ],
            entry_points: [
              {
                name: 'add_to_the_pool',
                entry_point: {
                  name: 'add_to_the_pool',
                  args: [],
                  ret: 'Unit',
                  access: 'Public',
                  entry_point_type: 'Called'
                }
              },
              {
                name: 'allowance',
                entry_point: {
                  name: 'allowance',
                  args: [
                    {
                      name: 'owner',
                      cl_type: 'Key'
                    },
                    {
                      name: 'spender',
                      cl_type: 'Key'
                    }
                  ],
                  ret: 'U256',
                  access: 'Public',
                  entry_point_type: 'Called'
                }
              },
              {
                name: 'approve',
                entry_point: {
                  name: 'approve',
                  args: [
                    {
                      name: 'spender',
                      cl_type: 'Key'
                    },
                    {
                      name: 'amount',
                      cl_type: 'U256'
                    }
                  ],
                  ret: 'Unit',
                  access: 'Public',
                  entry_point_type: 'Called'
                }
              },
              {
                name: 'balance_of',
                entry_point: {
                  name: 'balance_of',
                  args: [
                    {
                      name: 'account',
                      cl_type: 'Key'
                    }
                  ],
                  ret: 'U256',
                  access: 'Public',
                  entry_point_type: 'Called'
                }
              },
              {
                name: 'burn',
                entry_point: {
                  name: 'burn',
                  args: [
                    {
                      name: 'owner',
                      cl_type: 'Key'
                    },
                    {
                      name: 'amount',
                      cl_type: 'U256'
                    }
                  ],
                  ret: 'Unit',
                  access: 'Public',
                  entry_point_type: 'Called'
                }
              },
              {
                name: 'change_security',
                entry_point: {
                  name: 'change_security',
                  args: [
                    {
                      name: 'admin_list',
                      cl_type: {
                        List: 'Key'
                      }
                    },
                    {
                      name: 'minter_list',
                      cl_type: {
                        List: 'Key'
                      }
                    },
                    {
                      name: 'none_list',
                      cl_type: {
                        List: 'Key'
                      }
                    }
                  ],
                  ret: 'Unit',
                  access: 'Public',
                  entry_point_type: 'Called'
                }
              },
              {
                name: 'claim',
                entry_point: {
                  name: 'claim',
                  args: [
                    {
                      name: 'receipt_id',
                      cl_type: 'U32'
                    }
                  ],
                  ret: 'Unit',
                  access: 'Public',
                  entry_point_type: 'Called'
                }
              },
              {
                name: 'decimals',
                entry_point: {
                  name: 'decimals',
                  args: [],
                  ret: 'U8',
                  access: 'Public',
                  entry_point_type: 'Called'
                }
              },
              {
                name: 'decrease_allowance',
                entry_point: {
                  name: 'decrease_allowance',
                  args: [
                    {
                      name: 'spender',
                      cl_type: 'Key'
                    },
                    {
                      name: 'decr_by',
                      cl_type: 'U256'
                    }
                  ],
                  ret: 'Unit',
                  access: 'Public',
                  entry_point_type: 'Called'
                }
              },
              {
                name: 'grant_role',
                entry_point: {
                  name: 'grant_role',
                  args: [
                    {
                      name: 'role',
                      cl_type: {
                        ByteArray: 32
                      }
                    },
                    {
                      name: 'address',
                      cl_type: 'Key'
                    }
                  ],
                  ret: 'Unit',
                  access: 'Public',
                  entry_point_type: 'Called'
                }
              },
              {
                name: 'has_role',
                entry_point: {
                  name: 'has_role',
                  args: [
                    {
                      name: 'role',
                      cl_type: {
                        ByteArray: 32
                      }
                    },
                    {
                      name: 'address',
                      cl_type: 'Key'
                    }
                  ],
                  ret: 'Bool',
                  access: 'Public',
                  entry_point_type: 'Called'
                }
              },
              {
                name: 'increase_allowance',
                entry_point: {
                  name: 'increase_allowance',
                  args: [
                    {
                      name: 'spender',
                      cl_type: 'Key'
                    },
                    {
                      name: 'inc_by',
                      cl_type: 'U256'
                    }
                  ],
                  ret: 'Unit',
                  access: 'Public',
                  entry_point_type: 'Called'
                }
              },
              {
                name: 'init',
                entry_point: {
                  name: 'init',
                  args: [
                    {
                      name: 'validator_address',
                      cl_type: 'PublicKey'
                    },
                    {
                      name: 'claim_time',
                      cl_type: 'U64'
                    }
                  ],
                  ret: 'Unit',
                  access: {
                    Groups: ['constructor_group']
                  },
                  entry_point_type: 'Called'
                }
              },
              {
                name: 'mint',
                entry_point: {
                  name: 'mint',
                  args: [
                    {
                      name: 'owner',
                      cl_type: 'Key'
                    },
                    {
                      name: 'amount',
                      cl_type: 'U256'
                    }
                  ],
                  ret: 'Unit',
                  access: 'Public',
                  entry_point_type: 'Called'
                }
              },
              {
                name: 'name',
                entry_point: {
                  name: 'name',
                  args: [],
                  ret: 'String',
                  access: 'Public',
                  entry_point_type: 'Called'
                }
              },
              {
                name: 'remove_from_the_pool',
                entry_point: {
                  name: 'remove_from_the_pool',
                  args: [
                    {
                      name: 'amount',
                      cl_type: 'U512'
                    }
                  ],
                  ret: 'Unit',
                  access: 'Public',
                  entry_point_type: 'Called'
                }
              },
              {
                name: 'revoke_role',
                entry_point: {
                  name: 'revoke_role',
                  args: [
                    {
                      name: 'role',
                      cl_type: {
                        ByteArray: 32
                      }
                    },
                    {
                      name: 'address',
                      cl_type: 'Key'
                    }
                  ],
                  ret: 'Unit',
                  access: 'Public',
                  entry_point_type: 'Called'
                }
              },
              {
                name: 'stake',
                entry_point: {
                  name: 'stake',
                  args: [],
                  ret: 'Unit',
                  access: 'Public',
                  entry_point_type: 'Called'
                }
              },
              {
                name: 'staked_cspr',
                entry_point: {
                  name: 'staked_cspr',
                  args: [],
                  ret: 'U512',
                  access: 'Public',
                  entry_point_type: 'Called'
                }
              },
              {
                name: 'symbol',
                entry_point: {
                  name: 'symbol',
                  args: [],
                  ret: 'String',
                  access: 'Public',
                  entry_point_type: 'Called'
                }
              },
              {
                name: 'total_supply',
                entry_point: {
                  name: 'total_supply',
                  args: [],
                  ret: 'U256',
                  access: 'Public',
                  entry_point_type: 'Called'
                }
              },
              {
                name: 'transfer',
                entry_point: {
                  name: 'transfer',
                  args: [
                    {
                      name: 'recipient',
                      cl_type: 'Key'
                    },
                    {
                      name: 'amount',
                      cl_type: 'U256'
                    }
                  ],
                  ret: 'Unit',
                  access: 'Public',
                  entry_point_type: 'Called'
                }
              },
              {
                name: 'transfer_from',
                entry_point: {
                  name: 'transfer_from',
                  args: [
                    {
                      name: 'owner',
                      cl_type: 'Key'
                    },
                    {
                      name: 'recipient',
                      cl_type: 'Key'
                    },
                    {
                      name: 'amount',
                      cl_type: 'U256'
                    }
                  ],
                  ret: 'Unit',
                  access: 'Public',
                  entry_point_type: 'Called'
                }
              },
              {
                name: 'unstake',
                entry_point: {
                  name: 'unstake',
                  args: [
                    {
                      name: 'scspr_amount',
                      cl_type: 'U256'
                    }
                  ],
                  ret: 'U32',
                  access: 'Public',
                  entry_point_type: 'Called'
                }
              },
              {
                name: 'withdraw_from_the_pool',
                entry_point: {
                  name: 'withdraw_from_the_pool',
                  args: [
                    {
                      name: 'amount',
                      cl_type: 'U512'
                    }
                  ],
                  ret: 'Unit',
                  access: 'Public',
                  entry_point_type: 'Called'
                }
              }
            ],
            protocol_version: '2.0.0'
          }
        }
      }
    };

    const serializer = new TypedJSON(Transform);
    const jsonRes = serializer.parse(transformContractV2Json);
    const transformKind = jsonRes?.kind;
    const isWriteContract = transformKind?.isWriteContract();
    const contract = transformKind?.parseAsWriteContract();

    expect(isWriteContract).to.be.true;
    expect(contract?.contractPackageHash.toPrefixedString()).to.deep.equal(
      transformContractV2Json.kind.Write.Contract.contract_package_hash
    );
    expect(contract?.contractWasmHash.toPrefixedWasmString()).to.deep.equal(
      transformContractV2Json.kind.Write.Contract.contract_wasm_hash
    );
    expect(contract?.entryPoints[0].entryPoint).to.not.be.empty;
  });
});
