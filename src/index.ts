import {
  getTypeSystem,
  identity,
  Type,
  TypeOf,
  ValidationError,
  Context,
  TypeSystem,
  NullType,
  UndefinedType,
  AnyType,
  NeverType,
  StringType,
  NumberType,
  BooleanType,
  RefinementCombinator,
  FunctionType,
  ObjectType,
  AnyArrayType,
  AnyDictionaryType,
  RefinementType,
  LiteralCombinator,
  KeyofCombinator,
  RecursionCombinator,
  ArrayCombinator,
  InterfaceCombinator,
  UnionCombinator,
  PartialCombinator,
  DictionaryCombinator,
  IntersectionCombinator,
  TupleCombinator,
  ReadonlyCombinator,
  ReadonlyArrayCombinator,
  StrictCombinator
} from './core'
import { monadTypeEitherAll, validate } from './either'
import { URI, Either, right, left } from 'fp-ts/lib/Either'

const t: TypeSystem<URI> = getTypeSystem(monadTypeEitherAll)

export { TypeOf, identity, validate, Type, nullType as null, type as interface }
export type Validation<A> = Either<Array<ValidationError>, A>
export const success = right
export function failure<A>(value: any, context: Context): Validation<A> {
  return left([{ value, context }])
}
export const nullType: NullType<URI> = t.nullType
export const undefined: UndefinedType<URI> = t.undefined
export const any: AnyType<URI> = t.any
export const never: NeverType<URI> = t.never
export const string: StringType<URI> = t.string
export const number: NumberType<URI> = t.number
export const boolean: BooleanType<URI> = t.boolean
export const Function: FunctionType<URI> = t.Function
export const object: ObjectType<URI> = t.object
export const Array: AnyArrayType<URI> = t.Array
export const Dictionary: AnyDictionaryType<URI> = t.Dictionary
export const refinement: RefinementCombinator<URI> = t.refinement
export const Integer: RefinementType<URI, NumberType<URI>> = t.Integer
export const literal: LiteralCombinator<URI> = t.literal
export const keyof: KeyofCombinator<URI> = t.keyof
export const recursion: RecursionCombinator<URI> = t.recursion
export const array: ArrayCombinator<URI> = t.array
export const type: InterfaceCombinator<URI> = t.type
export const union: UnionCombinator<URI> = t.union
export const partial: PartialCombinator<URI> = t.partial
export const dictionary: DictionaryCombinator<URI> = t.dictionary
export const intersection: IntersectionCombinator<URI> = t.intersection
export const tuple: TupleCombinator<URI> = t.tuple
export const readonly: ReadonlyCombinator<URI> = t.readonly
export const readonlyArray: ReadonlyArrayCombinator<URI> = t.readonlyArray
export const strict: StrictCombinator<URI> = t.strict
