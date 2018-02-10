import { Either } from 'fp-ts/lib/Either';
import { Predicate } from 'fp-ts/lib/function';
declare global  {
    interface Array<T> {
        _A: T;
    }
}
export declare type mixed = object | number | string | boolean | symbol | undefined | null;
export interface ContextEntry {
    readonly key: string;
    readonly type: Decoder<any, any>;
}
export declare type Context = Array<ContextEntry>;
export interface ValidationError {
    readonly value: mixed;
    readonly context: Context;
}
export declare type Errors = Array<ValidationError>;
export declare type Validation<A> = Either<Errors, A>;
export declare type Is<A> = (m: mixed) => m is A;
export declare type Validate<I, A> = (i: I, context: Context) => Validation<A>;
export declare type Decode<I, A> = (i: I) => Validation<A>;
export declare type Encode<A, O> = (a: A) => O;
export declare type Any = Type<any, any, any>;
export declare type Mixed = Type<any, any, mixed>;
export declare type TypeOf<RT extends Any> = RT['_A'];
export declare type InputOf<RT extends Any> = RT['_I'];
export declare type OutputOf<RT extends Any> = RT['_O'];
export interface Decoder<I, A> {
    readonly name: string;
    readonly validate: Validate<I, A>;
    readonly decode: Decode<I, A>;
}
export interface Encoder<A, O> {
    readonly encode: Encode<A, O>;
}
/**
 * Laws:
 * 1. T.decode(x).fold(() => x, T.serialize) = x
 * 2. T.decode(T.serialize(x)) = right(x)
 *
 * where `T` is a runtime type
 */
export declare class Type<A, O = A, I = mixed> implements Decoder<I, A>, Encoder<A, O> {
    /** a unique name for this runtime type */
    readonly name: string;
    /** a custom type guard */
    readonly is: Is<A>;
    /** succeeds if a value of type I can be decoded to a value of type A */
    readonly validate: Validate<I, A>;
    /** converts a value of type A to a value of type O */
    readonly encode: Encode<A, O>;
    readonly '_A': A;
    readonly '_O': O;
    readonly '_I': I;
    constructor(
        /** a unique name for this runtime type */
        name: string, 
        /** a custom type guard */
        is: Is<A>, 
        /** succeeds if a value of type I can be decoded to a value of type A */
        validate: Validate<I, A>, 
        /** converts a value of type A to a value of type O */
        encode: Encode<A, O>);
    pipe<B>(ab: Type<B, A, A>, name?: string): Type<B, O, I>;
    asDecoder(): Decoder<I, A>;
    asEncoder(): Encoder<A, O>;
    /** a version of `validate` with a default context */
    decode(i: I): Validation<A>;
}
export declare const identity: <A>(a: A) => A;
export declare const getFunctionName: (f: Function) => string;
export declare const getContextEntry: (key: string, type: Decoder<any, any>) => ContextEntry;
export declare const getValidationError: (value: mixed, context: ContextEntry[]) => ValidationError;
export declare const getDefaultContext: (type: Decoder<any, any>) => ContextEntry[];
export declare const appendContext: (c: ContextEntry[], key: string, type: Decoder<any, any>) => ContextEntry[];
export declare const failures: <T>(errors: ValidationError[]) => Either<ValidationError[], T>;
export declare const failure: <T>(value: mixed, context: ContextEntry[]) => Either<ValidationError[], T>;
export declare const success: <T>(value: T) => Either<ValidationError[], T>;
export declare class NullType extends Type<null> {
    readonly _tag: 'NullType';
    constructor();
}
/** @alias `null` */
export declare const nullType: NullType;
export declare class UndefinedType extends Type<undefined> {
    readonly _tag: 'UndefinedType';
    constructor();
}
declare const undefinedType: UndefinedType;
export declare class AnyType extends Type<any> {
    readonly _tag: 'AnyType';
    constructor();
}
export declare const any: AnyType;
export declare class NeverType extends Type<never> {
    readonly _tag: 'NeverType';
    constructor();
}
export declare const never: NeverType;
export declare class StringType extends Type<string> {
    readonly _tag: 'StringType';
    constructor();
}
export declare const string: StringType;
export declare class NumberType extends Type<number> {
    readonly _tag: 'NumberType';
    constructor();
}
export declare const number: NumberType;
export declare class BooleanType extends Type<boolean> {
    readonly _tag: 'BooleanType';
    constructor();
}
export declare const boolean: BooleanType;
export declare class AnyArrayType extends Type<Array<mixed>> {
    readonly _tag: 'AnyArrayType';
    constructor();
}
declare const arrayType: AnyArrayType;
export declare class AnyDictionaryType extends Type<{
    [key: string]: mixed;
}> {
    readonly _tag: 'AnyDictionaryType';
    constructor();
}
export declare const Dictionary: AnyDictionaryType;
export declare class ObjectType extends Type<object> {
    readonly _tag: 'ObjectType';
    constructor();
}
export declare const object: ObjectType;
export declare class FunctionType extends Type<Function> {
    readonly _tag: 'FunctionType';
    constructor();
}
export declare const Function: FunctionType;
export declare class RefinementType<RT extends Any, A = any, O = A, I = mixed> extends Type<A, O, I> {
    readonly type: RT;
    readonly predicate: Predicate<A>;
    readonly _tag: 'RefinementType';
    constructor(name: string, is: RefinementType<RT, A, O, I>['is'], validate: RefinementType<RT, A, O, I>['validate'], serialize: RefinementType<RT, A, O, I>['encode'], type: RT, predicate: Predicate<A>);
}
export declare const refinement: <RT extends Type<any, any, any>>(type: RT, predicate: Predicate<RT["_A"]>, name?: string) => RefinementType<RT, RT["_A"], RT["_O"], RT["_I"]>;
export declare const Integer: RefinementType<NumberType, number, number, mixed>;
export declare class LiteralType<V extends string | number | boolean> extends Type<V> {
    readonly value: V;
    readonly _tag: 'LiteralType';
    constructor(name: string, is: LiteralType<V>['is'], validate: LiteralType<V>['validate'], serialize: LiteralType<V>['encode'], value: V);
}
export declare const literal: <V extends string | number | boolean>(value: V, name?: string) => LiteralType<V>;
export declare class KeyofType<D extends {
    [key: string]: mixed;
}> extends Type<keyof D> {
    readonly keys: D;
    readonly _tag: 'KeyofType';
    constructor(name: string, is: KeyofType<D>['is'], validate: KeyofType<D>['validate'], serialize: KeyofType<D>['encode'], keys: D);
}
export declare const keyof: <D extends {
    [key: string]: mixed;
}>(keys: D, name?: string) => KeyofType<D>;
export declare class RecursiveType<RT extends Any, A = any, O = A, I = mixed> extends Type<A, O, I> {
    private runDefinition;
    readonly _tag: 'RecursiveType';
    constructor(name: string, is: RecursiveType<RT, A, O, I>['is'], validate: RecursiveType<RT, A, O, I>['validate'], serialize: RecursiveType<RT, A, O, I>['encode'], runDefinition: () => RT);
    readonly type: RT;
}
export declare const recursion: <A, O = A, I = mixed, RT extends Type<A, O, I> = Type<A, O, I>>(name: string, definition: (self: RT) => RT) => RecursiveType<RT, A, O, I>;
export declare class ArrayType<RT extends Any, A = any, O = A, I = mixed> extends Type<A, O, I> {
    readonly type: RT;
    readonly _tag: 'ArrayType';
    constructor(name: string, is: ArrayType<RT, A, O, I>['is'], validate: ArrayType<RT, A, O, I>['validate'], serialize: ArrayType<RT, A, O, I>['encode'], type: RT);
}
export declare const array: <RT extends Type<any, any, mixed>>(type: RT, name?: string) => ArrayType<RT, RT["_A"][], RT["_O"][], mixed>;
export declare class InterfaceType<P extends AnyProps, A = any, O = A, I = mixed> extends Type<A, O, I> {
    readonly props: P;
    readonly _tag: 'InterfaceType';
    constructor(name: string, is: InterfaceType<P, A, O, I>['is'], validate: InterfaceType<P, A, O, I>['validate'], serialize: InterfaceType<P, A, O, I>['encode'], props: P);
}
export interface AnyProps {
    [key: string]: Any;
}
export declare type TypeOfProps<P extends AnyProps> = {
    [K in keyof P]: TypeOf<P[K]>;
};
export declare type OutputOfProps<P extends AnyProps> = {
    [K in keyof P]: OutputOf<P[K]>;
};
export interface Props {
    [key: string]: Mixed;
}
/** @alias `interface` */
export declare const type: <P extends Props>(props: P, name?: string) => InterfaceType<P, { [K in keyof P]: P[K]["_A"]; }, { [K in keyof P]: P[K]["_O"]; }, mixed>;
export declare class PartialType<P extends AnyProps, A = any, O = A, I = mixed> extends Type<A, O, I> {
    readonly props: P;
    readonly _tag: 'PartialType';
    constructor(name: string, is: PartialType<P, A, O, I>['is'], validate: PartialType<P, A, O, I>['validate'], serialize: PartialType<P, A, O, I>['encode'], props: P);
}
export declare type TypeOfPartialProps<P extends AnyProps> = {
    [K in keyof P]?: TypeOf<P[K]>;
};
export declare type InputOfPartialProps<P extends AnyProps> = {
    [K in keyof P]?: OutputOf<P[K]>;
};
export declare const partial: <P extends Props>(props: P, name?: string) => PartialType<P, { [K in keyof P]?: P[K]["_A"] | undefined; }, { [K in keyof P]?: P[K]["_O"] | undefined; }, mixed>;
export declare class DictionaryType<D extends Any, C extends Any, A = any, O = A, I = mixed> extends Type<A, O, I> {
    readonly domain: D;
    readonly codomain: C;
    readonly _tag: 'DictionaryType';
    constructor(name: string, is: DictionaryType<D, C, A, O, I>['is'], validate: DictionaryType<D, C, A, O, I>['validate'], serialize: DictionaryType<D, C, A, O, I>['encode'], domain: D, codomain: C);
}
export declare type TypeOfDictionary<D extends Any, C extends Any> = {
    [K in TypeOf<D>]: TypeOf<C>;
};
export declare type OutputOfDictionary<D extends Any, C extends Any> = {
    [K in OutputOf<D>]: OutputOf<C>;
};
export declare const dictionary: <D extends Type<any, any, mixed>, C extends Type<any, any, mixed>>(domain: D, codomain: C, name?: string) => DictionaryType<D, C, { [K in D["_A"]]: C["_A"]; }, { [K in D["_O"]]: C["_O"]; }, mixed>;
export declare class UnionType<RTS extends Array<Any>, A = any, O = A, I = mixed> extends Type<A, O, I> {
    readonly types: RTS;
    readonly _tag: 'UnionType';
    constructor(name: string, is: UnionType<RTS, A, O, I>['is'], validate: UnionType<RTS, A, O, I>['validate'], serialize: UnionType<RTS, A, O, I>['encode'], types: RTS);
}
export declare const union: <RTS extends Type<any, any, mixed>[]>(types: RTS, name?: string) => UnionType<RTS, RTS["_A"]["_A"], RTS["_A"]["_O"], mixed>;
export declare class IntersectionType<RTS extends Array<Any>, A = any, O = A, I = mixed> extends Type<A, O, I> {
    readonly types: RTS;
    readonly _tag: 'IntersectionType';
    constructor(name: string, is: IntersectionType<RTS, A, O, I>['is'], validate: IntersectionType<RTS, A, O, I>['validate'], serialize: IntersectionType<RTS, A, O, I>['encode'], types: RTS);
}
export declare function intersection<A extends Mixed, B extends Mixed, C extends Mixed, D extends Mixed, E extends Mixed>(types: [A, B, C, D, E], name?: string): IntersectionType<[A, B, C, D, E], TypeOf<A> & TypeOf<B> & TypeOf<C> & TypeOf<D> & TypeOf<E>, OutputOf<A> & OutputOf<B> & OutputOf<C> & OutputOf<D> & OutputOf<E>, mixed>;
export declare function intersection<A extends Mixed, B extends Mixed, C extends Mixed, D extends Mixed>(types: [A, B, C, D], name?: string): IntersectionType<[A, B, C, D], TypeOf<A> & TypeOf<B> & TypeOf<C> & TypeOf<D>, OutputOf<A> & OutputOf<B> & OutputOf<C> & OutputOf<D>, mixed>;
export declare function intersection<A extends Mixed, B extends Mixed, C extends Mixed>(types: [A, B, C], name?: string): IntersectionType<[A, B, C], TypeOf<A> & TypeOf<B> & TypeOf<C>, OutputOf<A> & OutputOf<B> & OutputOf<C>, mixed>;
export declare function intersection<A extends Mixed, B extends Mixed>(types: [A, B], name?: string): IntersectionType<[A, B], TypeOf<A> & TypeOf<B>, OutputOf<A> & OutputOf<B>, mixed>;
export declare function intersection<A extends Mixed>(types: [A], name?: string): IntersectionType<[A], TypeOf<A>, OutputOf<A>, mixed>;
export declare class TupleType<RTS extends Array<Any>, A = any, O = A, I = mixed> extends Type<A, O, I> {
    readonly types: RTS;
    readonly _tag: 'TupleType';
    constructor(name: string, is: TupleType<RTS, A, O, I>['is'], validate: TupleType<RTS, A, O, I>['validate'], serialize: TupleType<RTS, A, O, I>['encode'], types: RTS);
}
export declare function tuple<A extends Mixed, B extends Mixed, C extends Mixed, D extends Mixed, E extends Mixed>(types: [A, B, C, D, E], name?: string): TupleType<[A, B, C, D, E], [TypeOf<A>, TypeOf<B>, TypeOf<C>, TypeOf<D>, TypeOf<E>], [OutputOf<A>, OutputOf<B>, OutputOf<C>, OutputOf<D>, OutputOf<E>], mixed>;
export declare function tuple<A extends Mixed, B extends Mixed, C extends Mixed, D extends Mixed>(types: [A, B, C, D], name?: string): TupleType<[A, B, C, D], [TypeOf<A>, TypeOf<B>, TypeOf<C>, TypeOf<D>], [OutputOf<A>, OutputOf<B>, OutputOf<C>, OutputOf<D>], mixed>;
export declare function tuple<A extends Mixed, B extends Mixed, C extends Mixed>(types: [A, B, C], name?: string): TupleType<[A, B, C], [TypeOf<A>, TypeOf<B>, TypeOf<C>], [OutputOf<A>, OutputOf<B>, OutputOf<C>], mixed>;
export declare function tuple<A extends Mixed, B extends Mixed>(types: [A, B], name?: string): TupleType<[A, B], [TypeOf<A>, TypeOf<B>], [OutputOf<A>, OutputOf<B>], mixed>;
export declare function tuple<A extends Mixed>(types: [A], name?: string): TupleType<[A], [TypeOf<A>], [OutputOf<A>], mixed>;
export declare class ReadonlyType<RT extends Any, A = any, O = A, I = mixed> extends Type<A, O, I> {
    readonly type: RT;
    readonly _tag: 'ReadonlyType';
    constructor(name: string, is: ReadonlyType<RT, A, O, I>['is'], validate: ReadonlyType<RT, A, O, I>['validate'], serialize: ReadonlyType<RT, A, O, I>['encode'], type: RT);
}
export declare const readonly: <RT extends Type<any, any, mixed>>(type: RT, name?: string) => ReadonlyType<RT, Readonly<RT["_A"]>, Readonly<RT["_O"]>, mixed>;
export declare class ReadonlyArrayType<RT extends Any, A = any, O = A, I = mixed> extends Type<A, O, I> {
    readonly type: RT;
    readonly _tag: 'ReadonlyArrayType';
    constructor(name: string, is: ReadonlyArrayType<RT, A, O, I>['is'], validate: ReadonlyArrayType<RT, A, O, I>['validate'], serialize: ReadonlyArrayType<RT, A, O, I>['encode'], type: RT);
}
export declare const readonlyArray: <RT extends Type<any, any, mixed>>(type: RT, name?: string) => ReadonlyArrayType<RT, ReadonlyArray<RT["_A"]>, ReadonlyArray<RT["_O"]>, mixed>;
export declare class StrictType<P extends AnyProps, A = any, O = A, I = mixed> extends Type<A, O, I> {
    readonly props: P;
    readonly _tag: 'StrictType';
    constructor(name: string, is: StrictType<P, A, O, I>['is'], validate: StrictType<P, A, O, I>['validate'], serialize: StrictType<P, A, O, I>['encode'], props: P);
}
/** Specifies that only the given interface properties are allowed */
export declare const strict: <P extends Props>(props: P, name?: string) => StrictType<P, { [K in keyof P]: P[K]["_A"]; }, { [K in keyof P]: P[K]["_O"]; }, mixed>;
export declare type TaggedProps<Tag extends string> = {
    [K in Tag]: LiteralType<any>;
};
export interface TaggedRefinement<Tag extends string, A, O = A> extends RefinementType<Tagged<Tag>, A, O> {
}
export interface TaggedUnion<Tag extends string, A, O = A> extends UnionType<Array<Tagged<Tag>>, A, O> {
}
export declare type TaggedIntersectionArgument<Tag extends string> = [Tagged<Tag>] | [Tagged<Tag>, Mixed] | [Mixed, Tagged<Tag>] | [Tagged<Tag>, Mixed, Mixed] | [Mixed, Tagged<Tag>, Mixed] | [Mixed, Mixed, Tagged<Tag>] | [Tagged<Tag>, Mixed, Mixed, Mixed] | [Mixed, Tagged<Tag>, Mixed, Mixed] | [Mixed, Mixed, Tagged<Tag>, Mixed] | [Mixed, Mixed, Mixed, Tagged<Tag>] | [Tagged<Tag>, Mixed, Mixed, Mixed, Mixed] | [Mixed, Tagged<Tag>, Mixed, Mixed, Mixed] | [Mixed, Mixed, Tagged<Tag>, Mixed, Mixed] | [Mixed, Mixed, Mixed, Tagged<Tag>, Mixed] | [Mixed, Mixed, Mixed, Mixed, Tagged<Tag>];
export interface TaggedIntersection<Tag extends string, A, O = A> extends IntersectionType<TaggedIntersectionArgument<Tag>, A, O> {
}
export declare type Tagged<Tag extends string, A = any, O = A> = InterfaceType<TaggedProps<Tag>, A, O> | StrictType<TaggedProps<Tag>, A, O> | TaggedRefinement<Tag, A, O> | TaggedUnion<Tag, A, O> | TaggedIntersection<Tag, A, O>;
export declare const taggedUnion: <Tag extends string, RTS extends Tagged<Tag, any, any>[]>(tag: Tag, types: RTS, name?: string) => UnionType<RTS, RTS["_A"]["_A"], RTS["_A"]["_O"], mixed>;
export { nullType as null, undefinedType as undefined, arrayType as Array, type as interface };
