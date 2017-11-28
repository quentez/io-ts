import * as assert from 'assert'
import { getTypeSystem } from '../../../src/core'
import { monadTypeEitherFirst, validate } from '../../../src/either'
import { report } from '../../../src/report'

const t = getTypeSystem(monadTypeEitherFirst)

describe('tuple (sync/first)', () => {
  it('should return only the first error', () => {
    const T = t.tuple([t.number, t.string])
    assert.deepEqual(report(validate([], T)), ['Invalid value undefined supplied to : [number, string]/0: number'])
  })
})
