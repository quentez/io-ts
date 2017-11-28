import { HKT } from 'fp-ts/lib/HKT'
import { Monad } from 'fp-ts/lib/Monad'
import { Predicate } from 'fp-ts/lib/function'

export interface ContextEntry {
  readonly key: string
  readonly type: any
}

export type Context = Array<ContextEntry>

export interface ValidationError {
  readonly value: any
  readonly context: Context
}

export interface MonadThrow<E, M> extends Monad<M> {
  throwError: <A>(e: E) => HKT<M, A>
}

export interface MonadType<M> extends MonadThrow<Array<ValidationError>, M> {
  zipWith: <A, B, C>(f: (a: A, b: B) => C) => (fa: HKT<M, A>, lazyfb: () => HKT<M, B>) => HKT<M, C>
  attempt: <A>(fx: HKT<M, A>, lazyfy: () => HKT<M, A>) => HKT<M, A>
}

export type Is<A> = (v: any) => v is A
export type Validate<M, S, A> = (s: S, context: Context) => HKT<M, A>
export type Serialize<S, A> = (a: A) => S

/**
 * Laws:
 * 1. validate(x).fold(() => x, serialize) = x
 * 2. validate(serialize(x)) = Right(x)
 */
export class Type<M, S, A> {
  // prettier-ignore
  readonly '_A': A
  // prettier-ignore
  readonly '_S': S
  // prettier-ignore
  readonly '_M': M
  constructor(
    readonly name: string,
    readonly is: Is<A>,
    readonly validate: Validate<M, S, A>,
    readonly serialize: Serialize<S, A>
  ) {}
}

export const identity = <A>(a: A): A => a

export const getFunctionName = (f: any): string => f.displayName || f.name || `<function${f.length}>`

export type Any = Type<any, any, any>

export type InputOf<RT extends Any> = RT['_S']

export type TypeOf<RT extends Any> = RT['_A']

//
// basic types
//

export class NullType<M> extends Type<M, any, null> {
  readonly _tag: 'NullType' = 'NullType'
  constructor(M: MonadType<M>) {
    super(
      'null',
      (v): v is null => v === null,
      (s, c) => (this.is(s) ? M.of(s) : M.throwError([{ value: s, context: c }])),
      identity
    )
  }
}

export const getNullType = <M>(M: MonadType<M>): NullType<M> => new NullType(M)

export class UndefinedType<M> extends Type<M, any, undefined> {
  readonly _tag: 'UndefinedType' = 'UndefinedType'
  constructor(M: MonadType<M>) {
    super(
      'undefined',
      (v): v is undefined => v === void 0,
      (s, c) => (this.is(s) ? M.of(s) : M.throwError([{ value: s, context: c }])),
      identity
    )
  }
}

export const getUndefinedType = <M>(M: MonadType<M>): UndefinedType<M> => new UndefinedType(M)

export class AnyType<M> extends Type<M, any, any> {
  readonly _tag: 'AnyType' = 'AnyType'
  constructor(M: MonadType<M>) {
    super('any', (_): _ is any => true, M.of, identity)
  }
}

export const getAnyType = <M>(M: MonadType<M>): AnyType<M> => new AnyType(M)

export class NeverType<M> extends Type<M, any, never> {
  readonly _tag: 'NeverType' = 'NeverType'
  constructor(M: MonadType<M>) {
    super(
      'never',
      (_): _ is never => false,
      (s, c) => M.throwError([{ value: s, context: c }]),
      () => {
        throw new Error('cannot serialize never')
      }
    )
  }
}

export const getNeverType = <M>(M: MonadType<M>): NeverType<M> => new NeverType(M)

export class StringType<M> extends Type<M, any, string> {
  readonly _tag: 'StringType' = 'StringType'
  constructor(M: MonadType<M>) {
    super(
      'string',
      (v): v is string => typeof v === 'string',
      (s, c) => (this.is(s) ? M.of(s) : M.throwError([{ value: s, context: c }])),
      identity
    )
  }
}

export const getStringType = <M>(M: MonadType<M>): StringType<M> => new StringType(M)

export class NumberType<M> extends Type<M, any, number> {
  readonly _tag: 'NumberType' = 'NumberType'
  constructor(M: MonadType<M>) {
    super(
      'number',
      (v): v is number => typeof v === 'number',
      (s, c) => (this.is(s) ? M.of(s) : M.throwError([{ value: s, context: c }])),
      identity
    )
  }
}

export const getNumberType = <M>(M: MonadType<M>): NumberType<M> => new NumberType(M)

export class BooleanType<M> extends Type<M, any, boolean> {
  readonly _tag: 'BooleanType' = 'BooleanType'
  constructor(M: MonadType<M>) {
    super(
      'boolean',
      (v): v is boolean => typeof v === 'boolean',
      (s, c) => (this.is(s) ? M.of(s) : M.throwError([{ value: s, context: c }])),
      identity
    )
  }
}

export const getBooleanType = <M>(M: MonadType<M>): BooleanType<M> => new BooleanType(M)

export class ObjectType<M> extends Type<M, any, object> {
  readonly _tag: 'ObjectType' = 'ObjectType'
  constructor(anyDictionaryType: AnyDictionaryType<M>) {
    super('object', anyDictionaryType.is, anyDictionaryType.validate, identity)
  }
}

export const getObjectType = <M>(anyDictionaryType: AnyDictionaryType<M>): ObjectType<M> =>
  new ObjectType(anyDictionaryType)

export class FunctionType<M> extends Type<M, any, Function> {
  readonly _tag: 'FunctionType' = 'FunctionType'
  constructor(M: MonadType<M>) {
    super(
      'Function',
      (v): v is Function => typeof v === 'function',
      (s, c) => (this.is(s) ? M.of(s) : M.throwError([{ value: s, context: c }])),
      identity
    )
  }
}

export const getFunctionType = <M>(M: MonadType<M>): FunctionType<M> => new FunctionType(M)

export class AnyArrayType<M> extends Type<M, any, Array<any>> {
  readonly _tag: 'AnyArrayType' = 'AnyArrayType'
  constructor(M: MonadType<M>) {
    super(
      'Array',
      (v): v is Array<any> => Array.isArray(v),
      (s, c) => (this.is(s) ? M.of(s) : M.throwError([{ value: s, context: c }])),
      identity
    )
  }
}

export const getAnyArrayType = <M>(M: MonadType<M>): AnyArrayType<M> => new AnyArrayType(M)

export class AnyDictionaryType<M> extends Type<M, any, { [key: string]: any }> {
  readonly _tag: 'AnyDictionaryType' = 'AnyDictionaryType'
  constructor(M: MonadType<M>) {
    super(
      'Dictionary',
      (v): v is { [key: string]: any } => v !== null && typeof v === 'object',
      (s, c) => (this.is(s) ? M.of(s) : M.throwError([{ value: s, context: c }])),
      identity
    )
  }
}

export const getAnyDictionaryType = <M>(M: MonadType<M>): AnyDictionaryType<M> => new AnyDictionaryType(M)

//
// refinements
//

export class RefinementType<M, RT extends Any> extends Type<M, InputOf<RT>, TypeOf<RT>> {
  readonly _tag: 'RefinementType' = 'RefinementType'
  constructor(
    name: string,
    is: RefinementType<M, RT>['is'],
    validate: RefinementType<M, RT>['validate'],
    serialize: RefinementType<M, RT>['serialize'],
    readonly type: RT,
    readonly predicate: Predicate<TypeOf<RT>>
  ) {
    super(name, is, validate, serialize)
  }
}

export interface RefinementCombinator<M> {
  <RT extends Any>(type: RT, predicate: Predicate<TypeOf<RT>>, name?: string): RefinementType<M, RT>
}

export const getRefinement = <M>(M: MonadType<M>): RefinementCombinator<M> => {
  return (type, predicate, name = `(${type.name} | ${getFunctionName(predicate)})`) =>
    new RefinementType(
      name,
      (v): v is any => type.is(v) && predicate(v),
      (s, c) => M.chain(a => (predicate(a) ? M.of(a) : M.throwError([{ value: a, context: c }])), type.validate(s, c)),
      type.serialize,
      type,
      predicate
    )
}

//
// literals
//

export class LiteralType<M, V extends string | number | boolean> extends Type<M, any, V> {
  readonly _tag: 'LiteralType' = 'LiteralType'
  constructor(
    name: string,
    is: LiteralType<M, V>['is'],
    validate: LiteralType<M, V>['validate'],
    serialize: LiteralType<M, V>['serialize'],
    readonly value: V
  ) {
    super(name, is, validate, serialize)
  }
}

export interface LiteralCombinator<M> {
  <V extends string | number | boolean>(value: V, name?: string): LiteralType<M, V>
}

export const getLiteral = <M>(M: MonadType<M>): LiteralCombinator<M> => {
  return (value, name = JSON.stringify(value)) => {
    const is = (v: any): v is any => v === value
    return new LiteralType(
      name,
      is,
      (s, c) => (is(s) ? M.of(s) : M.throwError([{ value: s, context: c }])),
      identity,
      value
    )
  }
}

//
// keyof
//

export class KeyofType<M, D extends { [key: string]: any }> extends Type<M, any, keyof D> {
  readonly _tag: 'KeyofType' = 'KeyofType'
  constructor(
    name: string,
    is: KeyofType<M, D>['is'],
    validate: KeyofType<M, D>['validate'],
    serialize: KeyofType<M, D>['serialize'],
    readonly keys: D
  ) {
    super(name, is, validate, serialize)
  }
}

export interface KeyofCombinator<M> {
  <D extends { [key: string]: any }>(keys: D, name?: string): KeyofType<M, D>
}

export const getKeyof = <M>(M: MonadType<M>) => (string: StringType<M>): KeyofCombinator<M> => {
  return (keys, name = `(keyof ${JSON.stringify(Object.keys(keys))})`) => {
    const is = (v: any): v is any => string.is(v) && keys.hasOwnProperty(v)
    return new KeyofType(
      name,
      is,
      (s, c) => (is(s) ? M.of(s) : M.throwError([{ value: s, context: c }])),
      identity,
      keys
    )
  }
}

//
// recursive types
//

export class RecursiveType<M, A> extends Type<M, any, A> {
  readonly _tag: 'RecursiveType' = 'RecursiveType'
  // prettier-ignore
  readonly 'type': Any
  constructor(name: string, is: Is<A>, validate: Validate<M, any, A>, serialize: Serialize<any, A>) {
    super(name, is, validate, serialize)
  }
}

export interface RecursionCombinator<M> {
  <A>(name: string, definition: (self: Any) => Any): RecursiveType<M, A>
}

export const getRecursion = <M>(M: MonadType<M>): RecursionCombinator<M> => {
  return (name, definition) => {
    const Self: any = new RecursiveType(name, (v): v is any => type.is(v), (s, c) => type.validate(s, c), identity)
    const type = definition(Self)
    Self.type = type
    Self.serialize = type.serialize
    return Self
  }
}

//
// arrays
//

export class ArrayType<M, RT extends Type<M, any, any>> extends Type<M, any, Array<TypeOf<RT>>> {
  readonly _tag: 'ArrayType' = 'ArrayType'
  constructor(
    name: string,
    is: ArrayType<M, RT>['is'],
    validate: ArrayType<M, RT>['validate'],
    serialize: ArrayType<M, RT>['serialize'],
    readonly type: RT
  ) {
    super(name, is, validate, serialize)
  }
}

export interface ArrayCombinator<M> {
  <RT extends Type<M, any, any>>(type: RT, name?: string): ArrayType<M, RT>
}

export const getArray = <M>(M: MonadType<M>) => (anyArrayType: Type<M, any, Array<any>>): ArrayCombinator<M> => {
  const f = M.zipWith((a: Array<any>, b: any) => a.concat([b]))
  return (type, name = `Array<${type.name}>`) =>
    new ArrayType(
      name,
      (v): v is Array<any> => anyArrayType.is(v) && v.every(type.is),
      (s, c) =>
        M.chain(xs => {
          let r = M.of<Array<any>>([])
          for (let i = 0; i < xs.length; i++) {
            r = f(r, () => type.validate(xs[i], c.concat({ key: String(i), type })))
          }
          return r
        }, anyArrayType.validate(s, c)),
      type.serialize === identity ? identity : a => a.map(type.serialize),
      type
    )
}

//
// interfaces
//

export type Props<M> = { [key: string]: Type<M, any, any> }

export type InterfaceOf<P extends Props<any>> = { [K in keyof P]: TypeOf<P[K]> }

export class InterfaceType<M, P extends Props<M>> extends Type<M, any, InterfaceOf<P>> {
  readonly _tag: 'InterfaceType' = 'InterfaceType'
  constructor(
    name: string,
    is: InterfaceType<M, P>['is'],
    validate: InterfaceType<M, P>['validate'],
    serialize: InterfaceType<M, P>['serialize'],
    readonly props: P
  ) {
    super(name, is, validate, serialize)
  }
}

const getNameFromProps = (props: Props<any>): string =>
  `{ ${Object.keys(props)
    .map(k => `${k}: ${props[k].name}`)
    .join(', ')} }`

const useIdentity = (props: Props<any>): boolean => {
  for (let k in props) {
    if (props[k].serialize !== identity) {
      return false
    }
  }
  return true
}

export interface InterfaceCombinator<M> {
  <P extends Props<M>>(props: P, name?: string): InterfaceType<M, P>
}

export const getInterface = <M>(M: MonadType<M>) => (
  anyDictionaryType: Type<M, any, { [key: string]: any }>
): InterfaceCombinator<M> => {
  const f = M.zipWith((a: { [key: string]: any }, b: { k: string; v: any }) => ({ ...a, [b.k]: b.v }))
  return (props, name = getNameFromProps(props)) =>
    new InterfaceType(
      name,
      (v): v is any => {
        if (!anyDictionaryType.is(v)) {
          return false
        }
        for (let k in props) {
          if (!props[k].is(v[k])) {
            return false
          }
        }
        return true
      },
      (s, c) =>
        M.chain(o => {
          let r: HKT<M, any> = M.of({ ...o })
          for (let k in props) {
            const type = props[k]
            r = f(r, () => M.map(v => ({ k, v }), type.validate(o[k], c.concat({ key: k, type }))))
          }
          return r
        }, anyDictionaryType.validate(s, c)),
      useIdentity(props)
        ? identity
        : a => {
            const s: { [x: string]: any } = { ...(a as any) }
            for (let k in props) {
              s[k] = props[k].serialize(a[k])
            }
            return s
          },
      props
    )
}

//
// unions
//

export class UnionType<M, RTS, A> extends Type<M, any, A> {
  readonly _tag: 'UnionType' = 'UnionType'
  constructor(
    name: string,
    is: UnionType<M, RTS, A>['is'],
    validate: UnionType<M, RTS, A>['validate'],
    serialize: UnionType<M, RTS, A>['serialize'],
    readonly types: RTS
  ) {
    super(name, is, validate, serialize)
  }
}

declare global {
  interface Array<T> {
    _A: T
  }
}

export interface UnionCombinator<M> {
  <RTS extends Array<Type<M, any, any>>>(types: RTS, name?: string): UnionType<M, RTS, TypeOf<RTS['_A']>>
}

export const getUnion = <M>(M: MonadType<M>): UnionCombinator<M> => {
  return (types, name = `(${types.map(type => type.name).join(' | ')})`) =>
    new UnionType(
      name,
      (v): v is any => types.some(type => type.is(v)),
      (s, c) => {
        if (types.length > 0) {
          let type = types[0]
          let r = type.validate(s, c.concat({ key: String(0), type }))
          for (let i = 1; i < types.length; i++) {
            type = types[i]
            r = M.attempt(r, () => type.validate(s, c.concat({ key: String(i), type })))
          }
          return r
        } else {
          return M.throwError([{ value: s, context: c }])
        }
      },
      types.every(type => type.serialize === identity)
        ? identity
        : a => {
            for (let i = 0; i < types.length; i++) {
              const type = types[i]
              if (type.is(a)) {
                return type.serialize(a)
              }
            }
            return a
          },
      types
    )
}

//
// partials
//

export type PartialOf<P extends Props<any>> = { [K in keyof P]?: TypeOf<P[K]> }

export class PartialType<M, P extends Props<M>> extends Type<M, any, PartialOf<P>> {
  readonly _tag: 'PartialType' = 'PartialType'
  constructor(
    name: string,
    is: PartialType<M, P>['is'],
    validate: PartialType<M, P>['validate'],
    serialize: PartialType<M, P>['serialize'],
    readonly props: P
  ) {
    super(name, is, validate, serialize)
  }
}

export interface PartialCombinator<M> {
  <P extends Props<M>>(props: P, name?: string): PartialType<M, P>
}

export const getPartial = <M>(M: MonadType<M>) => (
  union: <RTS extends Array<Any>>(types: RTS, name?: string) => UnionType<M, RTS, TypeOf<RTS['_A']>>,
  undefinedType: UndefinedType<M>,
  type: <P extends Props<M>>(props: P, name?: string) => InterfaceType<M, P>
): PartialCombinator<M> => {
  return (props, name = `PartialType<${getNameFromProps(props)}>`) => {
    const partials: Props<M> = {}
    for (let k in props) {
      partials[k] = union([props[k], undefinedType])
    }
    const partial = type(partials)
    return new PartialType(
      name,
      (v): v is any => partial.is(v),
      (s, c) => partial.validate(s, c) as any,
      useIdentity(props)
        ? identity
        : a => {
            const s: { [key: string]: any } = {}
            for (let k in props) {
              const ak = a[k]
              if (ak !== undefined) {
                s[k] = props[k].serialize(ak)
              }
            }
            return s
          },
      props
    )
  }
}

//
// dictionaries
//

export class DictionaryType<M, D extends Any, C extends Any> extends Type<M, any, { [K in TypeOf<D>]: TypeOf<C> }> {
  readonly _tag: 'DictionaryType' = 'DictionaryType'
  constructor(
    name: string,
    is: DictionaryType<M, D, C>['is'],
    validate: DictionaryType<M, D, C>['validate'],
    serialize: DictionaryType<M, D, C>['serialize'],
    readonly domain: D,
    readonly codomain: C
  ) {
    super(name, is, validate, serialize)
  }
}

export interface DictionaryCombinator<M> {
  <D extends Any, C extends Any>(domain: D, codomain: C, name?: string): DictionaryType<M, D, C>
}

export const getDictionary = <M>(M: MonadType<M>) => (
  anyDictionaryType: AnyDictionaryType<M>
): DictionaryCombinator<M> => {
  const f = M.zipWith((a: { [key: string]: any }, b: { k: string; v: any }) => ({ ...a, [b.k]: b.v }))
  return (domain, codomain, name = `{ [K in ${domain.name}]: ${codomain.name} }`) =>
    new DictionaryType(
      name,
      (v): v is any => anyDictionaryType.is(v) && Object.keys(v).every(k => domain.is(k) && codomain.is(v[k])),
      (s, c) =>
        M.chain(o => {
          let r: HKT<M, any> = M.of({})
          for (let k in o) {
            r = f(r, () =>
              M.chain(
                kk => M.map(v => ({ k: kk, v }), codomain.validate(o[k], c.concat({ key: k, type: codomain }))),
                domain.validate(k, c.concat({ key: k, type: domain }))
              )
            )
          }
          return r
        }, anyDictionaryType.validate(s, c)),
      domain.serialize === identity && codomain.serialize === identity
        ? identity
        : a => {
            const s: { [key: string]: any } = {}
            for (let k in a) {
              s[domain.serialize(k)] = codomain.serialize((a as any)[k])
            }
            return s
          },
      domain,
      codomain
    )
}

//
// intersections
//

export class IntersectionType<M, RTS, A> extends Type<M, any, A> {
  readonly _tag: 'IntersectionType' = 'IntersectionType'
  constructor(
    name: string,
    is: IntersectionType<M, RTS, A>['is'],
    validate: IntersectionType<M, RTS, A>['validate'],
    serialize: IntersectionType<M, RTS, A>['serialize'],
    readonly types: RTS
  ) {
    super(name, is, validate, serialize)
  }
}

export interface IntersectionCombinator<M> {
  <A extends Any, B extends Any, C extends Any, D extends Any, E extends Any>(
    types: [A, B, C, D, E],
    name?: string
  ): IntersectionType<M, [A, B, C, D, E], TypeOf<A> & TypeOf<B> & TypeOf<C> & TypeOf<D> & TypeOf<E>>
  <A extends Any, B extends Any, C extends Any, D extends Any>(types: [A, B, C, D], name?: string): IntersectionType<
    M,
    [A, B, C, D],
    TypeOf<A> & TypeOf<B> & TypeOf<C> & TypeOf<D>
  >
  <A extends Any, B extends Any, C extends Any>(types: [A, B, C], name?: string): IntersectionType<
    M,
    [A, B, C],
    TypeOf<A> & TypeOf<B> & TypeOf<C>
  >
  <A extends Any, B extends Any>(types: [A, B], name?: string): IntersectionType<M, [A, B], TypeOf<A> & TypeOf<B>>
  <A extends Any>(types: [A], name?: string): IntersectionType<M, [A], TypeOf<A>>
}

export const getIntersection = <M>(M: MonadType<M>): IntersectionCombinator<M> => {
  return <RTS extends Array<Any>>(
    types: RTS,
    name: string = `(${types.map(type => type.name).join(' & ')})`
  ): IntersectionType<M, RTS, any> => {
    const f = M.zipWith((_, b) => b)
    return new IntersectionType(
      name,
      (v): v is any => types.every(type => type.is(v)),
      (s, c) => {
        let r = M.of(s)
        if (types.length > 0) {
          for (let i = 0; i < types.length; i++) {
            const type = types[i]
            r = f(r, () => M.chain(a => type.validate(a, c), r))
          }
          return r
        } else {
          return M.throwError([{ value: s, context: c }])
        }
      },
      types.every(type => type.serialize === identity)
        ? identity
        : a => {
            let s = a
            for (let i = 0; i < types.length; i++) {
              const type = types[i]
              s = type.serialize(s)
            }
            return s
          },
      types
    )
  }
}

//
// tuples
//

export class TupleType<M, RTS, A> extends Type<M, any, A> {
  readonly _tag: 'TupleType' = 'TupleType'
  constructor(
    name: string,
    is: TupleType<M, RTS, A>['is'],
    validate: TupleType<M, RTS, A>['validate'],
    serialize: TupleType<M, RTS, A>['serialize'],
    readonly types: RTS
  ) {
    super(name, is, validate, serialize)
  }
}

export interface TupleCombinator<M> {
  <A extends Any, B extends Any, C extends Any, D extends Any, E extends Any>(
    types: [A, B, C, D, E],
    name?: string
  ): TupleType<M, [A, B, C, D, E], [TypeOf<A>, TypeOf<B>, TypeOf<C>, TypeOf<D>, TypeOf<E>]>
  <A extends Any, B extends Any, C extends Any, D extends Any>(types: [A, B, C, D], name?: string): TupleType<
    M,
    [A, B, C, D],
    [TypeOf<A>, TypeOf<B>, TypeOf<C>, TypeOf<D>]
  >
  <A extends Any, B extends Any, C extends Any>(types: [A, B, C], name?: string): TupleType<
    M,
    [A, B, C],
    [TypeOf<A>, TypeOf<B>, TypeOf<C>]
  >
  <A extends Any, B extends Any>(types: [A, B], name?: string): TupleType<M, [A, B], [TypeOf<A>, TypeOf<B>]>
  <A extends Any>(types: [A], name?: string): TupleType<M, [A], [TypeOf<A>]>
}

export const getTuple = <M>(M: MonadType<M>) => (
  anyArrayType: AnyArrayType<M>,
  never: NeverType<M>
): TupleCombinator<M> => {
  return <RTS extends Array<Any>>(
    types: RTS,
    name: string = `[${types.map(type => type.name).join(', ')}]`
  ): TupleType<M, RTS, any> => {
    const len = types.length
    const f = M.zipWith((a: Array<any>, b: any) => a.concat([b]))
    return new TupleType(
      name,
      (v): v is any => anyArrayType.is(v) && v.length === len && types.every((type, i) => type.is(v[i])),
      (s, c) =>
        M.chain(as => {
          if (as.length > len) {
            return M.throwError([{ value: as[len], context: c.concat({ key: String(len), type: never }) }])
          } else {
            let r = M.of<Array<any>>([])
            for (let i = 0; i < len; i++) {
              const type = types[i]
              r = f(r, () => type.validate(as[i], c.concat({ key: String(i), type })))
            }
            return r
          }
        }, anyArrayType.validate(s, c)),
      types.every(type => type.serialize === identity)
        ? identity
        : (a: Array<any>) => types.map((type, i) => type.serialize(a[i])),
      types
    )
  }
}

//
// readonly objects
//

export class ReadonlyType<M, RT extends Any> extends Type<M, any, Readonly<TypeOf<RT>>> {
  readonly _tag: 'ReadonlyType' = 'ReadonlyType'
  constructor(
    name: string,
    is: ReadonlyType<M, RT>['is'],
    validate: ReadonlyType<M, RT>['validate'],
    serialize: ReadonlyType<M, RT>['serialize'],
    readonly type: RT
  ) {
    super(name, is, validate, serialize)
  }
}

export interface ReadonlyCombinator<M> {
  <RT extends Any>(type: RT, name?: string): ReadonlyType<M, RT>
}

export const getReadonly = <M>(M: MonadType<M>): ReadonlyCombinator<M> => {
  return (type, name = `Readonly<${type.name}>`) =>
    new ReadonlyType(
      name,
      type.is,
      (s, c) =>
        M.map(x => {
          if (process.env.NODE_ENV !== 'production') {
            return Object.freeze(x)
          } else {
            return x
          }
        }, type.validate(s, c)),
      type.serialize === identity ? identity : type.serialize,
      type
    )
}

//
// readonly arrays
//

export class ReadonlyArrayType<M, RT extends Any> extends Type<M, any, ReadonlyArray<TypeOf<RT>>> {
  readonly _tag: 'ReadonlyArrayType' = 'ReadonlyArrayType'
  constructor(
    name: string,
    is: ReadonlyArrayType<M, RT>['is'],
    validate: ReadonlyArrayType<M, RT>['validate'],
    serialize: ReadonlyArrayType<M, RT>['serialize'],
    readonly type: RT
  ) {
    super(name, is, validate, serialize)
  }
}

export interface ReadonlyArrayCombinator<M> {
  <RT extends Any>(type: RT, name?: string): ReadonlyArrayType<M, RT>
}

export const getReadonlyArray = <M>(M: MonadType<M>) => (array: ArrayCombinator<M>): ReadonlyArrayCombinator<M> => {
  return (type, name = `ReadonlyArray<${type.name}>`) => {
    const arrayType = array(type)
    return new ReadonlyArrayType(
      name,
      (v): v is any => arrayType.is(v),
      (s, c) =>
        M.map(x => {
          if (process.env.NODE_ENV !== 'production') {
            return Object.freeze(x)
          } else {
            return x
          }
        }, arrayType.validate(s, c)),
      arrayType.serialize as any,
      type
    )
  }
}

//
// strict interfaces
//

export class StrictType<M, P extends Props<M>> extends Type<M, any, InterfaceOf<P>> {
  readonly _tag: 'StrictType' = 'StrictType'
  constructor(
    name: string,
    is: StrictType<M, P>['is'],
    validate: StrictType<M, P>['validate'],
    serialize: StrictType<M, P>['serialize'],
    readonly props: P
  ) {
    super(name, is, validate, serialize)
  }
}

export interface StrictCombinator<M> {
  <P extends Props<M>>(props: P, name?: string): StrictType<M, P>
}

export const getStrict = <M>(M: MonadType<M>) => (
  type: InterfaceCombinator<M>,
  never: NeverType<M>
): StrictCombinator<M> => {
  return (props, name = `StrictType<${getNameFromProps(props)}>`) => {
    const f = M.zipWith((a, _) => a)
    const loose = type(props)
    const len = Object.keys(props).length
    return new StrictType(
      name,
      (v): v is any => loose.is(v) && Object.getOwnPropertyNames(v).every(k => props.hasOwnProperty(k)),
      (s, c) =>
        M.chain(o => {
          let r = M.of<any>(o)
          const keys = Object.getOwnPropertyNames(o)
          if (keys.length !== len) {
            for (let i = 0; i < keys.length; i++) {
              const key = keys[i]
              r = f(
                r,
                () =>
                  !props.hasOwnProperty(key)
                    ? M.throwError([{ value: o[key], context: c.concat({ key, type: never }) }])
                    : r
              )
            }
            return r
          } else {
            return r
          }
        }, loose.validate(s, c)),
      loose.serialize,
      props
    )
  }
}

export interface TypeSystem<M> {
  nullType: NullType<M>
  undefined: UndefinedType<M>
  any: AnyType<M>
  never: NeverType<M>
  string: StringType<M>
  number: NumberType<M>
  boolean: BooleanType<M>
  object: ObjectType<M>
  Function: FunctionType<M>
  Array: AnyArrayType<M>
  Dictionary: AnyDictionaryType<M>
  refinement: RefinementCombinator<M>
  Integer: RefinementType<M, NumberType<M>>
  literal: LiteralCombinator<M>
  keyof: KeyofCombinator<M>
  recursion: RecursionCombinator<M>
  array: ArrayCombinator<M>
  type: InterfaceCombinator<M>
  union: UnionCombinator<M>
  partial: PartialCombinator<M>
  dictionary: DictionaryCombinator<M>
  intersection: IntersectionCombinator<M>
  tuple: TupleCombinator<M>
  readonly: ReadonlyCombinator<M>
  readonlyArray: ReadonlyArrayCombinator<M>
  strict: StrictCombinator<M>
}

export const getTypeSystem = <M>(M: MonadType<M>): TypeSystem<M> => {
  const anyArrayType = getAnyArrayType(M)
  const anyDictionaryType = getAnyDictionaryType(M)
  const refinement = getRefinement(M)
  const never = getNeverType(M)
  const string = getStringType(M)
  const number = getNumberType(M)
  const undefinedType = getUndefinedType(M)
  const Integer = refinement(number, n => n % 1 === 0, 'Integer')
  const array = getArray(M)(anyArrayType)
  const type = getInterface(M)(anyDictionaryType)
  const union = getUnion(M)
  return {
    nullType: getNullType(M),
    undefined: undefinedType,
    any: getAnyType(M),
    never,
    string,
    number,
    boolean: getBooleanType(M),
    object: getObjectType(anyDictionaryType),
    Function: getFunctionType(M),
    Array: anyArrayType,
    Dictionary: anyDictionaryType,
    refinement,
    Integer,
    literal: getLiteral(M),
    keyof: getKeyof(M)(string),
    recursion: getRecursion(M),
    array,
    type,
    union,
    partial: getPartial(M)(union, undefinedType, type),
    dictionary: getDictionary(M)(anyDictionaryType),
    intersection: getIntersection(M),
    tuple: getTuple(M)(anyArrayType, never),
    readonly: getReadonly(M),
    readonlyArray: getReadonlyArray(M)(array),
    strict: getStrict(M)(type, never)
  }
}
