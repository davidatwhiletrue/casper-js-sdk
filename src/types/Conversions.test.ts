import { expect } from 'chai';

import { Conversions } from "./Conversions";

describe('Conversions', () => {
  it('should convert motes to CSPR correctly', function() {
    const bal1 = Conversions.motesToCSPR('1');
    const bal2 = Conversions.motesToCSPR('123400047000');
    const bal3 = Conversions.motesToCSPR('1000000040234023040234023040234023042040230420402000000');
    const bal4 = Conversions.motesToCSPR('0');
    const bal5 = Conversions.motesToCSPR('100000000000');

    expect(bal1).to.deep.equal('0.000000001');
    expect(bal2).to.deep.equal('123.400047');
    expect(bal3).to.deep.equal('1000000040234023040234023040234023042040230420.402');
    expect(bal4).to.deep.equal('0');
    expect(bal5).to.deep.equal('100');
    expect(() => Conversions.motesToCSPR('-100')).to.throw('Motes cannot be negative number');
  });
});
