// https://github.com/Romakita/example-ts-express-decorator/blob/2.0.0/example-testing/test/tools.ts
import * as Chai from 'chai'
import * as ChaiAsPromised from 'chai-as-promised'
import * as SinonLib from 'sinon'
import * as SinonChai from 'sinon-chai'
import { $log } from 'ts-log-debug'
import {} from 'mocha'

Chai.should()
Chai.use(SinonChai)
Chai.use(ChaiAsPromised)

const expect = Chai.expect
const assert = Chai.assert
const Sinon = SinonLib

Sinon.stub($log, 'info')
Sinon.stub($log, 'debug')
Sinon.stub($log, 'error')
Sinon.stub($log, 'warn')

export {
    expect,
    assert,
    Sinon,
    SinonChai,
}
