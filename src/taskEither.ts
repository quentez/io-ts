import { HKT } from 'fp-ts/lib/HKT'
import { Either, left, right } from 'fp-ts/lib/Either'
import { Task } from 'fp-ts/lib/Task'
import { TaskEither, URI, map, of, ap, chain, fromEither } from 'fp-ts/lib/TaskEither'
import { MonadType, Type, Errors, createContext } from './core'
import { zipEither } from './either'

export type Validation<A> = TaskEither<Errors, A>

/** Asynchronous validation, all errors */
export const monadTypeTaskEitherAll: MonadType<URI> = {
  URI: URI,
  map: map,
  of: of,
  ap: ap,
  chain: chain,
  throwError: e => fromEither(left(e)),
  zipWith: <A, B, C>(f: (a: A, b: B) => C) => (fa: HKT<URI, A>, lazyfb: () => HKT<URI, B>) => {
    const fa_: Validation<A> = fa as any
    const lazyfb_: () => Validation<B> = lazyfb as any
    return new TaskEither(
      new Task(() => Promise.all([fa_.run(), lazyfb_().run()]).then(([fa, fb]) => zipEither(f, fa, fb)))
    )
  },
  attempt: <A>(fx: HKT<URI, A>, lazyfy: () => HKT<URI, A>): HKT<URI, A> => {
    const fx_: Validation<A> = fx as any
    const lazyfy_: () => Validation<A> = lazyfy as any
    return new TaskEither(
      new Task(() =>
        fx_.run().then(ex =>
          ex.fold(
            lx =>
              lazyfy_()
                .run()
                .then(ey => ey.fold<Either<Errors, A>>(ly => left(lx.concat(ly)), a => right(a))),
            () => Promise.resolve(ex)
          )
        )
      )
    )
  }
}

/** Asynchronous validation, first error only */
export const monadTypeTaskEitherFirst: MonadType<URI> = {
  URI: URI,
  map: map,
  of: of,
  ap: ap,
  chain: chain,
  throwError: e => fromEither(left(e)),
  zipWith: <A, B, C>(f: (a: A, b: B) => C) => (fa: HKT<URI, A>, lazyfb: () => HKT<URI, B>) => {
    const fa_: Validation<A> = fa as any
    const lazyfb_: () => Validation<B> = lazyfb as any
    return fa_.chain(a => lazyfb_().map(b => f(a, b)))
  },
  attempt: monadTypeTaskEitherAll.attempt
}

export function validate<A>(value: any, type: Type<URI, any, A>): Validation<A> {
  return type.validate(value, createContext('', type)) as any
}
