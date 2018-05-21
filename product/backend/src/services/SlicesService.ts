import { BigNumber } from 'bignumber.js'
import * as _ from 'lodash'
import * as schedule from 'node-schedule'
import { TxModels } from 'shared/dist/models'
import { StrTokenUtils } from 'shared/dist/str'
import { Service } from 'ts-express-decorators'
import * as postgres from '../db/postgres'
import { FAKE_ESCROW_STREAM_USER, TxService } from './TxService'

export const SLICES_RULE = new schedule.RecurrenceRule()
SLICES_RULE.hour = 0
SLICES_RULE.minute = 0

export const DAILY_SUPPLY = 100000

@Service()
export class SlicesService {
  constructor(
    public txService: TxService,
  ) {
    schedule.scheduleJob(SLICES_RULE, this.distributeSlices.bind(this))
  }

  public async distributeSlices() {
    const slices = await postgres.txs.calculateSlices()

    const sum = _(slices).sumBy(({ count }) => parseInt(count, 10))

    // TODO: We need need need tests for this.
    return await Promise.all(slices.map(({ id, address, platform_type, platform_id, count }) => {
      return this.txService.transfer({
        txType: TxModels.PROMO_SLICE,
        value: StrTokenUtils.strToTwei((new BigNumber(count)).div(sum).mul(DAILY_SUPPLY)),
        senderAddress: FAKE_ESCROW_STREAM_USER.address,
        recipientUserId: id,
        recipientAddress: address ? address : FAKE_ESCROW_STREAM_USER.address,
        recipientPlatformId: platform_id,
        recipientPlatformType: platform_type,
      })
    }))
  }
}
