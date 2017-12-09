import * as c from './core'
import { monadTypeEitherAll, validate } from './either'
import { URI, Either, right, left } from 'fp-ts/lib/Either'
import { Predicate } from 'fp-ts/lib/function'

const t = c.getTypeSystem(monadTypeEitherAll)

export const identity = c.identity
export class Type<S, A> extends c.Type<URI, S, A> {}
export interface Any extends c.Any<URI> {}
export type TypeOf<RT extends Any> = c.TypeOf<RT>
export type Validation<A> = Either<c.Errors, A>

export const success = right
export function failure<A>(value: any, context: c.Context): Validation<A> {
  return left([{ value, context }])
}

export interface NullType extends c.NullType<URI> {}
export const nullType: NullType = t.nullType

export interface UndefinedType extends c.UndefinedType<URI> {}
export const undefined: UndefinedType = t.undefined

export interface AnyType extends c.AnyType<URI> {}
export const any: AnyType = t.any

export interface NeverType extends c.NeverType<URI> {}
export const never: NeverType = t.never

export interface StringType extends c.StringType<URI> {}
export const string: StringType = t.string

export interface NumberType extends c.NumberType<URI> {}
export const number: NumberType = t.number

export interface BooleanType extends c.BooleanType<URI> {}
export const boolean: BooleanType = t.boolean

export interface FunctionType extends c.FunctionType<URI> {}
export const Function: FunctionType = t.Function

export interface ObjectType extends c.ObjectType<URI> {}
export const object: ObjectType = t.object

export interface AnyArrayType extends c.AnyArrayType<URI> {}
export const Array: AnyArrayType = t.Array

export interface AnyDictionaryType extends c.AnyDictionaryType<URI> {}
export const Dictionary: AnyDictionaryType = t.Dictionary

export interface RefinementType<RT extends Any, S, A> extends c.RefinementType<URI, RT, S, A> {}
export const refinement: <RT extends Any>(
  type: RT,
  predicate: Predicate<TypeOf<RT>>,
  name?: string
) => RefinementType<RT, c.InputOf<RT>, TypeOf<RT>> =
  t.refinement

export const Integer: RefinementType<NumberType, any, number> = t.Integer

export interface LiteralType<V extends string | number | boolean> extends c.LiteralType<URI, V> {}
export const literal: <V extends string | number | boolean>(value: V, name?: string) => LiteralType<V> = t.literal

export interface KeyofType<D extends { [key: string]: any }> extends c.KeyofType<URI, D> {}
export const keyof: <D extends { [key: string]: any }>(keys: D, name?: string) => KeyofType<D> = t.keyof

export interface RecursiveType<RT extends Any, A> extends c.RecursiveType<URI, RT, A> {}
export const recursion: <A, RT extends Any = Any>(name: string, definition: (self: RT) => RT) => RecursiveType<RT, A> =
  t.recursion

export interface ArrayType<RT extends Any, A> extends c.ArrayType<URI, RT, A> {}
export const array: <RT extends Any>(type: RT, name?: string) => ArrayType<RT, Array<TypeOf<RT>>> = t.array

export interface Props extends c.Props<URI> {}

export interface InterfaceType<P extends Props, A> extends c.InterfaceType<URI, P, A> {}
export const type: <P extends Props>(props: P, name?: string) => InterfaceType<P, c.InterfaceOf<P>> = t.type

export interface UnionType<RTS, A> extends c.UnionType<URI, RTS, A> {}
export const union: <RTS extends Array<Any>>(types: RTS, name?: string) => UnionType<RTS, TypeOf<RTS['_A']>> = t.union

export interface PartialType<P extends Props, A> extends c.PartialType<URI, P, A> {}
export const partial: <P extends Props>(props: P, name?: string) => PartialType<P, c.PartialOf<P>> = t.partial

export interface DictionaryType<D extends Any, C extends Any, A> extends c.DictionaryType<URI, D, C, A> {}
export const dictionary: <D extends Any, C extends Any>(
  domain: D,
  codomain: C,
  name?: string
) => DictionaryType<D, C, { [K in TypeOf<D>]: TypeOf<C> }> =
  t.dictionary

export interface IntersectionType<RTS, A> extends c.IntersectionType<URI, RTS, A> {}

export interface IntersectionCombinator {
  <A extends Any, B extends Any, C extends Any, D extends Any, E extends Any>(
    types: [A, B, C, D, E],
    name?: string
  ): IntersectionType<[A, B, C, D, E], TypeOf<A> & TypeOf<B> & TypeOf<C> & TypeOf<D> & TypeOf<E>>
  <A extends Any, B extends Any, C extends Any, D extends Any>(types: [A, B, C, D], name?: string): IntersectionType<
    [A, B, C, D],
    TypeOf<A> & TypeOf<B> & TypeOf<C> & TypeOf<D>
  >
  <A extends Any, B extends Any, C extends Any>(types: [A, B, C], name?: string): IntersectionType<
    [A, B, C],
    TypeOf<A> & TypeOf<B> & TypeOf<C>
  >
  <A extends Any, B extends Any>(types: [A, B], name?: string): IntersectionType<[A, B], TypeOf<A> & TypeOf<B>>
  <A extends Any>(types: [A], name?: string): IntersectionType<[A], TypeOf<A>>
}

export const intersection: IntersectionCombinator = t.intersection

export interface TupleType<RTS, A> extends c.TupleType<URI, RTS, A> {}

export interface TupleCombinator {
  <A extends Any, B extends Any, C extends Any, D extends Any, E extends Any>(
    types: [A, B, C, D, E],
    name?: string
  ): TupleType<[A, B, C, D, E], [TypeOf<A>, TypeOf<B>, TypeOf<C>, TypeOf<D>, TypeOf<E>]>
  <A extends Any, B extends Any, C extends Any, D extends Any>(types: [A, B, C, D], name?: string): TupleType<
    [A, B, C, D],
    [TypeOf<A>, TypeOf<B>, TypeOf<C>, TypeOf<D>]
  >
  <A extends Any, B extends Any, C extends Any>(types: [A, B, C], name?: string): TupleType<
    [A, B, C],
    [TypeOf<A>, TypeOf<B>, TypeOf<C>]
  >
  <A extends Any, B extends Any>(types: [A, B], name?: string): TupleType<[A, B], [TypeOf<A>, TypeOf<B>]>
  <A extends Any>(types: [A], name?: string): TupleType<[A], [TypeOf<A>]>
}

export const tuple: TupleCombinator = t.tuple

export interface ReadonlyType<RT extends Any, A> extends c.ReadonlyType<URI, RT, A> {}
export const readonly: <RT extends Any>(type: RT, name?: string) => ReadonlyType<RT, Readonly<TypeOf<RT>>> = t.readonly

export interface ReadonlyArrayType<RT extends Any, A> extends c.ReadonlyArrayType<URI, RT, A> {}
export const readonlyArray: <RT extends Any>(
  type: RT,
  name?: string
) => ReadonlyArrayType<RT, ReadonlyArray<TypeOf<RT>>> =
  t.readonlyArray

export interface StrictType<P extends Props, A> extends c.StrictType<URI, P, A> {}
export const strict: <P extends Props>(props: P, name?: string) => StrictType<P, c.InterfaceOf<P>> = t.strict

export { validate, nullType as null, type as interface }
