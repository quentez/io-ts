import * as assert from 'assert'
import { Either } from 'funfix-core'
import { HKT } from 'fp-ts/lib/HKT'
import { ValidationError, MonadType, getTypeSystem, Type } from '../../../src/core'
import { failure, success } from '../../../src/report'

const { right, left } = Either

//
// make funfix's Either fp-ts compliant
//

const URI = 'funfix/Either'

type URI = typeof URI

declare module 'funfix-core/dist/disjunctions' {
  interface Either<L, R> {
    _A: R
    _L: L
    _URI: URI
  }
}

declare module 'fp-ts/lib/HKT' {
  interface URI2HKT2<L, A> {
    'funfix/Either': Either<L, A>
  }
}

import { Monad } from 'fp-ts/lib/Monad'

export const map = <L, A, B>(f: (a: A) => B, fa: Either<L, A>): Either<L, B> => fa.map(f)
export const of = <L, A>(a: A): Either<L, A> => right(a)
export const ap = <L, A, B>(fab: Either<L, (a: A) => B>, fa: Either<L, A>): Either<L, B> => fab.flatMap(f => fa.map(f))
export const chain = <L, A, B>(f: (a: A) => Either<L, B>, fa: Either<L, A>): Either<L, B> => fa.flatMap(f)

export const either: Monad<URI> = {
  URI,
  map,
  of,
  ap,
  chain
}

//
// MonadType instance
//

type Validation<A> = Either<Array<ValidationError>, A>

const zipEither = <A, B, C>(f: (a: A, b: B) => C, fa: Validation<A>, fb: Validation<B>): Validation<C> =>
  fa.fold(la => fb.fold(lb => left(la.concat(lb)), () => left(la)), a => fb.fold(lb => left(lb), b => right(f(a, b))))

const monadTypeEitherAll: MonadType<URI> = {
  URI: URI,
  map,
  of,
  ap,
  chain,
  throwError: e => left(e),
  zipWith: <A, B, C>(f: (a: A, b: B) => C) => (fa: HKT<URI, A>, lazyfb: () => HKT<URI, B>) => {
    const fa_: Validation<A> = fa as any
    const lazyfb_: () => Validation<B> = lazyfb as any
    return zipEither(f, fa_, lazyfb_())
  },
  attempt: <A>(fx: HKT<URI, A>, lazyfy: () => HKT<URI, A>): HKT<URI, A> => {
    const fx_: Validation<A> = fx as any
    const lazyfy_: () => Validation<A> = lazyfy as any
    return fx_.fold(lx => lazyfy_().fold(ly => left(lx.concat(ly)), a => right(a)), () => fx_)
  }
}

//
// create a runtime type system
//
const t = getTypeSystem(monadTypeEitherAll)

const validate = <A>(value: any, type: Type<URI, any, A>): Either<Array<ValidationError>, A> =>
  type.validate(value, [{ key: '', type }]) as any

//
// test helpers
//

function assertSuccess<A>(validation: Validation<A>): void {
  assert.ok(validation.isRight())
}

function assertFailure<A>(validation: Validation<A>, descriptions: Array<string>): void {
  assert.ok(validation.isLeft())
  assert.deepEqual(report(validation), descriptions)
}

export const report = (validation: Either<Array<ValidationError>, any>): Array<string> => {
  return validation.fold(failure, success)
}

describe('funfix integration (sync/all)', () => {
  it('should succeed validating a valid value', () => {
    const T = t.type({ a: t.string })
    assertSuccess(validate({ a: 's' }, T))
  })

  it('should fail validating an invalid value', () => {
    const T = t.type({ a: t.string })
    assertFailure(validate(1, T), ['Invalid value 1 supplied to : { a: string }'])
    assertFailure(validate({}, T), ['Invalid value undefined supplied to : { a: string }/a: string'])
    assertFailure(validate({ a: 1 }, T), ['Invalid value 1 supplied to : { a: string }/a: string'])
  })
})
