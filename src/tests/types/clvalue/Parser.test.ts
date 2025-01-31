import { expect } from 'chai';

import { CLValueParser, CLValue, CLTypeMap } from '../../../types';

describe('CLValue Parser', () => {
  it('should parse json to StoredValue', async () => {
    const json = {
      cl_type: {
        Map: {
          key: 'String',
          value: {
            List: {
              Tuple2: ['String', 'Any']
            }
          }
        }
      },
      bytes:
        '080000000a0000004665654368616e6765640100000003000000666565081000000046656557616c6c65744368616e676564010000000a0000006665655f77616c6c65740b0d0000004f666665724163636570746564040000000a000000636f6c6c656374696f6e0b08000000746f6b656e5f69640a070000006f6666657265720b050000006f776e65720b0d0000004f6666657243616e63656c6564030000000a000000636f6c6c656374696f6e0b08000000746f6b656e5f69640a070000006f6666657265720b0d000000546f6b656e44656c6973746564020000000a000000636f6c6c656374696f6e0b08000000746f6b656e5f69640a0b000000546f6b656e4c6973746564040000000a000000636f6c6c656374696f6e0b08000000746f6b656e5f69640a050000006f776e65720b050000007072696365080c000000546f6b656e4f666665726564050000000a000000636f6c6c656374696f6e0b08000000746f6b656e5f69640a070000006f6666657265720b05000000707269636508140000006164646974696f6e616c5f726563697069656e740d0b09000000546f6b656e536f6c64040000000a000000636f6c6c656374696f6e0b08000000746f6b656e5f69640a0500000062757965720b140000006164646974696f6e616c5f726563697069656e740d0b',
      parsed: null
    };

    const parsedCLValue = CLValueParser.fromJSON(json);

    expect(parsedCLValue).to.be.instanceOf(CLValue);
    expect(parsedCLValue.getType()).to.be.instanceOf(CLTypeMap);
    expect(
      parsedCLValue.map
        ?.getData()[0]
        .inner1.getType()
        .toString()
    ).to.be.deep.equal('String');
    expect(
      parsedCLValue.map
        ?.getData()[0]
        .inner2.getType()
        .toJSON()
    ).to.deep.equal({ List: { Tuple2: ['String', 'Any'] } });
  });
});
