"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __assign = (this && this.__assign) || Object.assign || function(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
            t[p] = s[p];
    }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
var Either_1 = require("fp-ts/lib/Either");
/**
 * Laws:
 * 1. T.decode(x).fold(() => x, T.serialize) = x
 * 2. T.decode(T.serialize(x)) = right(x)
 *
 * where `T` is a runtime type
 */
var Type = /** @class */ (function () {
    function Type(
    /** a unique name for this runtime type */
    name, 
    /** a custom type guard */
    is, 
    /** succeeds if a value of type I can be decoded to a value of type A */
    validate, 
    /** converts a value of type A to a value of type O */
    encode) {
        this.name = name;
        this.is = is;
        this.validate = validate;
        this.encode = encode;
    }
    Type.prototype.pipe = function (ab, name) {
        var _this = this;
        return new Type(name || "pipe(" + this.name + ", " + ab.name + ")", ab.is, function (i, c) { return _this.validate(i, c).chain(function (a) { return ab.validate(a, c); }); }, this.encode === exports.identity && ab.encode === exports.identity ? exports.identity : function (b) { return _this.encode(ab.encode(b)); });
    };
    Type.prototype.asDecoder = function () {
        return this;
    };
    Type.prototype.asEncoder = function () {
        return this;
    };
    /** a version of `validate` with a default context */
    Type.prototype.decode = function (i) {
        return this.validate(i, exports.getDefaultContext(this));
    };
    return Type;
}());
exports.Type = Type;
exports.identity = function (a) { return a; };
exports.getFunctionName = function (f) {
    return f.displayName || f.name || "<function" + f.length + ">";
};
exports.getContextEntry = function (key, type) { return ({ key: key, type: type }); };
exports.getValidationError = function (value, context) { return ({ value: value, context: context }); };
exports.getDefaultContext = function (type) { return [{ key: '', type: type }]; };
exports.appendContext = function (c, key, type) {
    var len = c.length;
    var r = Array(len + 1);
    for (var i = 0; i < len; i++) {
        r[i] = c[i];
    }
    r[len] = { key: key, type: type };
    return r;
};
exports.failures = function (errors) { return new Either_1.Left(errors); };
exports.failure = function (value, context) {
    return exports.failures([exports.getValidationError(value, context)]);
};
exports.success = function (value) { return new Either_1.Right(value); };
var pushAll = function (xs, ys) { return Array.prototype.push.apply(xs, ys); };
//
// basic types
//
var NullType = /** @class */ (function (_super) {
    __extends(NullType, _super);
    function NullType() {
        var _this = _super.call(this, 'null', function (m) { return m === null; }, function (m, c) { return (_this.is(m) ? exports.success(m) : exports.failure(m, c)); }, exports.identity) || this;
        _this._tag = 'NullType';
        return _this;
    }
    return NullType;
}(Type));
exports.NullType = NullType;
/** @alias `null` */
exports.nullType = new NullType();
exports.null = exports.nullType;
var UndefinedType = /** @class */ (function (_super) {
    __extends(UndefinedType, _super);
    function UndefinedType() {
        var _this = _super.call(this, 'undefined', function (m) { return m === void 0; }, function (m, c) { return (_this.is(m) ? exports.success(m) : exports.failure(m, c)); }, exports.identity) || this;
        _this._tag = 'UndefinedType';
        return _this;
    }
    return UndefinedType;
}(Type));
exports.UndefinedType = UndefinedType;
var undefinedType = new UndefinedType();
exports.undefined = undefinedType;
var AnyType = /** @class */ (function (_super) {
    __extends(AnyType, _super);
    function AnyType() {
        var _this = _super.call(this, 'any', function (_) { return true; }, exports.success, exports.identity) || this;
        _this._tag = 'AnyType';
        return _this;
    }
    return AnyType;
}(Type));
exports.AnyType = AnyType;
exports.any = new AnyType();
var NeverType = /** @class */ (function (_super) {
    __extends(NeverType, _super);
    function NeverType() {
        var _this = _super.call(this, 'never', function (_) { return false; }, function (m, c) { return exports.failure(m, c); }, function () {
            throw new Error('cannot serialize never');
        }) || this;
        _this._tag = 'NeverType';
        return _this;
    }
    return NeverType;
}(Type));
exports.NeverType = NeverType;
exports.never = new NeverType();
var StringType = /** @class */ (function (_super) {
    __extends(StringType, _super);
    function StringType() {
        var _this = _super.call(this, 'string', function (m) { return typeof m === 'string'; }, function (m, c) { return (_this.is(m) ? exports.success(m) : exports.failure(m, c)); }, exports.identity) || this;
        _this._tag = 'StringType';
        return _this;
    }
    return StringType;
}(Type));
exports.StringType = StringType;
exports.string = new StringType();
var NumberType = /** @class */ (function (_super) {
    __extends(NumberType, _super);
    function NumberType() {
        var _this = _super.call(this, 'number', function (m) { return typeof m === 'number'; }, function (m, c) { return (_this.is(m) ? exports.success(m) : exports.failure(m, c)); }, exports.identity) || this;
        _this._tag = 'NumberType';
        return _this;
    }
    return NumberType;
}(Type));
exports.NumberType = NumberType;
exports.number = new NumberType();
var BooleanType = /** @class */ (function (_super) {
    __extends(BooleanType, _super);
    function BooleanType() {
        var _this = _super.call(this, 'boolean', function (m) { return typeof m === 'boolean'; }, function (m, c) { return (_this.is(m) ? exports.success(m) : exports.failure(m, c)); }, exports.identity) || this;
        _this._tag = 'BooleanType';
        return _this;
    }
    return BooleanType;
}(Type));
exports.BooleanType = BooleanType;
exports.boolean = new BooleanType();
var AnyArrayType = /** @class */ (function (_super) {
    __extends(AnyArrayType, _super);
    function AnyArrayType() {
        var _this = _super.call(this, 'Array', Array.isArray, function (m, c) { return (_this.is(m) ? exports.success(m) : exports.failure(m, c)); }, exports.identity) || this;
        _this._tag = 'AnyArrayType';
        return _this;
    }
    return AnyArrayType;
}(Type));
exports.AnyArrayType = AnyArrayType;
var arrayType = new AnyArrayType();
exports.Array = arrayType;
var AnyDictionaryType = /** @class */ (function (_super) {
    __extends(AnyDictionaryType, _super);
    function AnyDictionaryType() {
        var _this = _super.call(this, 'Dictionary', function (m) { return m !== null && typeof m === 'object'; }, function (m, c) { return (_this.is(m) ? exports.success(m) : exports.failure(m, c)); }, exports.identity) || this;
        _this._tag = 'AnyDictionaryType';
        return _this;
    }
    return AnyDictionaryType;
}(Type));
exports.AnyDictionaryType = AnyDictionaryType;
exports.Dictionary = new AnyDictionaryType();
var ObjectType = /** @class */ (function (_super) {
    __extends(ObjectType, _super);
    function ObjectType() {
        var _this = _super.call(this, 'object', exports.Dictionary.is, exports.Dictionary.validate, exports.identity) || this;
        _this._tag = 'ObjectType';
        return _this;
    }
    return ObjectType;
}(Type));
exports.ObjectType = ObjectType;
exports.object = new ObjectType();
var FunctionType = /** @class */ (function (_super) {
    __extends(FunctionType, _super);
    function FunctionType() {
        var _this = _super.call(this, 'Function', function (m) { return typeof m === 'function'; }, function (m, c) { return (_this.is(m) ? exports.success(m) : exports.failure(m, c)); }, exports.identity) || this;
        _this._tag = 'FunctionType';
        return _this;
    }
    return FunctionType;
}(Type));
exports.FunctionType = FunctionType;
exports.Function = new FunctionType();
//
// refinements
//
var RefinementType = /** @class */ (function (_super) {
    __extends(RefinementType, _super);
    function RefinementType(name, is, validate, serialize, type, predicate) {
        var _this = _super.call(this, name, is, validate, serialize) || this;
        _this.type = type;
        _this.predicate = predicate;
        _this._tag = 'RefinementType';
        return _this;
    }
    return RefinementType;
}(Type));
exports.RefinementType = RefinementType;
exports.refinement = function (type, predicate, name) {
    if (name === void 0) { name = "(" + type.name + " | " + exports.getFunctionName(predicate) + ")"; }
    return new RefinementType(name, function (m) { return type.is(m) && predicate(m); }, function (i, c) { return type.validate(i, c).chain(function (a) { return (predicate(a) ? exports.success(a) : exports.failure(a, c)); }); }, type.encode, type, predicate);
};
exports.Integer = exports.refinement(exports.number, function (n) { return n % 1 === 0; }, 'Integer');
//
// literals
//
var LiteralType = /** @class */ (function (_super) {
    __extends(LiteralType, _super);
    function LiteralType(name, is, validate, serialize, value) {
        var _this = _super.call(this, name, is, validate, serialize) || this;
        _this.value = value;
        _this._tag = 'LiteralType';
        return _this;
    }
    return LiteralType;
}(Type));
exports.LiteralType = LiteralType;
exports.literal = function (value, name) {
    if (name === void 0) { name = JSON.stringify(value); }
    var is = function (m) { return m === value; };
    return new LiteralType(name, is, function (m, c) { return (is(m) ? exports.success(value) : exports.failure(m, c)); }, exports.identity, value);
};
//
// keyof
//
var KeyofType = /** @class */ (function (_super) {
    __extends(KeyofType, _super);
    function KeyofType(name, is, validate, serialize, keys) {
        var _this = _super.call(this, name, is, validate, serialize) || this;
        _this.keys = keys;
        _this._tag = 'KeyofType';
        return _this;
    }
    return KeyofType;
}(Type));
exports.KeyofType = KeyofType;
exports.keyof = function (keys, name) {
    if (name === void 0) { name = "(keyof " + JSON.stringify(Object.keys(keys)) + ")"; }
    var is = function (m) { return exports.string.is(m) && keys.hasOwnProperty(m); };
    return new KeyofType(name, is, function (m, c) { return (is(m) ? exports.success(m) : exports.failure(m, c)); }, exports.identity, keys);
};
//
// recursive types
//
var RecursiveType = /** @class */ (function (_super) {
    __extends(RecursiveType, _super);
    function RecursiveType(name, is, validate, serialize, runDefinition) {
        var _this = _super.call(this, name, is, validate, serialize) || this;
        _this.runDefinition = runDefinition;
        _this._tag = 'RecursiveType';
        return _this;
    }
    Object.defineProperty(RecursiveType.prototype, "type", {
        get: function () {
            return this.runDefinition();
        },
        enumerable: true,
        configurable: true
    });
    return RecursiveType;
}(Type));
exports.RecursiveType = RecursiveType;
exports.recursion = function (name, definition) {
    var cache;
    var runDefinition = function () {
        if (!cache) {
            cache = definition(Self);
        }
        return cache;
    };
    var Self = new RecursiveType(name, function (m) { return runDefinition().is(m); }, function (m, c) { return runDefinition().validate(m, c); }, function (a) { return runDefinition().encode(a); }, runDefinition);
    return Self;
};
//
// arrays
//
var ArrayType = /** @class */ (function (_super) {
    __extends(ArrayType, _super);
    function ArrayType(name, is, validate, serialize, type) {
        var _this = _super.call(this, name, is, validate, serialize) || this;
        _this.type = type;
        _this._tag = 'ArrayType';
        return _this;
    }
    return ArrayType;
}(Type));
exports.ArrayType = ArrayType;
exports.array = function (type, name) {
    if (name === void 0) { name = "Array<" + type.name + ">"; }
    return new ArrayType(name, function (m) { return arrayType.is(m) && m.every(type.is); }, function (m, c) {
        return arrayType.validate(m, c).chain(function (xs) {
            var len = xs.length;
            var a = xs;
            var errors = [];
            var _loop_1 = function (i) {
                var x = xs[i];
                var validation = type.validate(x, exports.appendContext(c, String(i), type));
                validation.fold(function (e) { return pushAll(errors, e); }, function (vx) {
                    if (vx !== x) {
                        if (a === xs) {
                            a = xs.slice();
                        }
                        a[i] = vx;
                    }
                });
            };
            for (var i = 0; i < len; i++) {
                _loop_1(i);
            }
            return errors.length ? exports.failures(errors) : exports.success(a);
        });
    }, type.encode === exports.identity ? exports.identity : function (a) { return a.map(type.encode); }, type);
};
//
// interfaces
//
var InterfaceType = /** @class */ (function (_super) {
    __extends(InterfaceType, _super);
    function InterfaceType(name, is, validate, serialize, props) {
        var _this = _super.call(this, name, is, validate, serialize) || this;
        _this.props = props;
        _this._tag = 'InterfaceType';
        return _this;
    }
    return InterfaceType;
}(Type));
exports.InterfaceType = InterfaceType;
var getNameFromProps = function (props) {
    return "{ " + Object.keys(props)
        .map(function (k) { return k + ": " + props[k].name; })
        .join(', ') + " }";
};
var useIdentity = function (props) {
    for (var k in props) {
        if (props[k].encode !== exports.identity) {
            return false;
        }
    }
    return true;
};
/** @alias `interface` */
exports.type = function (props, name) {
    if (name === void 0) { name = getNameFromProps(props); }
    return new InterfaceType(name, function (m) {
        if (!exports.Dictionary.is(m)) {
            return false;
        }
        for (var k in props) {
            if (!props[k].is(m[k])) {
                return false;
            }
        }
        return true;
    }, function (m, c) {
        return exports.Dictionary.validate(m, c).chain(function (o) {
            var a = o;
            var errors = [];
            var _loop_2 = function (k) {
                var ok = o[k];
                var type_1 = props[k];
                var validation = type_1.validate(ok, exports.appendContext(c, k, type_1));
                validation.fold(function (e) { return pushAll(errors, e); }, function (vok) {
                    if (vok !== ok) {
                        if (a === o) {
                            a = __assign({}, o);
                        }
                        a[k] = vok;
                    }
                });
            };
            for (var k in props) {
                _loop_2(k);
            }
            return errors.length ? exports.failures(errors) : exports.success(a);
        });
    }, useIdentity(props)
        ? exports.identity
        : function (a) {
            var s = __assign({}, a);
            for (var k in props) {
                s[k] = props[k].encode(a[k]);
            }
            return s;
        }, props);
};
exports.interface = exports.type;
//
// partials
//
var PartialType = /** @class */ (function (_super) {
    __extends(PartialType, _super);
    function PartialType(name, is, validate, serialize, props) {
        var _this = _super.call(this, name, is, validate, serialize) || this;
        _this.props = props;
        _this._tag = 'PartialType';
        return _this;
    }
    return PartialType;
}(Type));
exports.PartialType = PartialType;
exports.partial = function (props, name) {
    if (name === void 0) { name = "PartialType<" + getNameFromProps(props) + ">"; }
    var partials = {};
    for (var k in props) {
        partials[k] = exports.union([props[k], undefinedType]);
    }
    var partial = exports.type(partials);
    return new PartialType(name, partial.is, partial.validate, useIdentity(props)
        ? exports.identity
        : function (a) {
            var s = {};
            for (var k in props) {
                var ak = a[k];
                if (ak !== undefined) {
                    s[k] = props[k].encode(ak);
                }
            }
            return s;
        }, props);
};
//
// dictionaries
//
var DictionaryType = /** @class */ (function (_super) {
    __extends(DictionaryType, _super);
    function DictionaryType(name, is, validate, serialize, domain, codomain) {
        var _this = _super.call(this, name, is, validate, serialize) || this;
        _this.domain = domain;
        _this.codomain = codomain;
        _this._tag = 'DictionaryType';
        return _this;
    }
    return DictionaryType;
}(Type));
exports.DictionaryType = DictionaryType;
exports.dictionary = function (domain, codomain, name) {
    if (name === void 0) { name = "{ [K in " + domain.name + "]: " + codomain.name + " }"; }
    return new DictionaryType(name, function (m) {
        return exports.Dictionary.is(m) && Object.keys(m).every(function (k) { return domain.is(k) && codomain.is(m[k]); });
    }, function (m, c) {
        return exports.Dictionary.validate(m, c).chain(function (o) {
            var a = {};
            var errors = [];
            var changed = false;
            var _loop_3 = function (k) {
                var ok = o[k];
                var domainValidation = domain.validate(k, exports.appendContext(c, k, domain));
                var codomainValidation = codomain.validate(ok, exports.appendContext(c, k, codomain));
                domainValidation.fold(function (e) { return pushAll(errors, e); }, function (vk) {
                    changed = changed || vk !== k;
                    k = vk;
                });
                codomainValidation.fold(function (e) { return pushAll(errors, e); }, function (vok) {
                    changed = changed || vok !== ok;
                    a[k] = vok;
                });
            };
            for (var k in o) {
                _loop_3(k);
            }
            return errors.length ? exports.failures(errors) : exports.success((changed ? a : o));
        });
    }, domain.encode === exports.identity && codomain.encode === exports.identity
        ? exports.identity
        : function (a) {
            var s = {};
            for (var k in a) {
                s[String(domain.encode(k))] = codomain.encode(a[k]);
            }
            return s;
        }, domain, codomain);
};
//
// unions
//
var UnionType = /** @class */ (function (_super) {
    __extends(UnionType, _super);
    function UnionType(name, is, validate, serialize, types) {
        var _this = _super.call(this, name, is, validate, serialize) || this;
        _this.types = types;
        _this._tag = 'UnionType';
        return _this;
    }
    return UnionType;
}(Type));
exports.UnionType = UnionType;
exports.union = function (types, name) {
    if (name === void 0) { name = "(" + types.map(function (type) { return type.name; }).join(' | ') + ")"; }
    var len = types.length;
    return new UnionType(name, function (m) { return types.some(function (type) { return type.is(m); }); }, function (m, c) {
        var errors = [];
        for (var i = 0; i < len; i++) {
            var type_2 = types[i];
            var validation = type_2.validate(m, exports.appendContext(c, String(i), type_2));
            if (validation.isRight()) {
                return validation;
            }
            else {
                pushAll(errors, validation.value);
            }
        }
        return exports.failures(errors);
    }, types.every(function (type) { return type.encode === exports.identity; })
        ? exports.identity
        : function (a) {
            var i = 0;
            for (; i < len - 1; i++) {
                var type_3 = types[i];
                if (type_3.is(a)) {
                    return type_3.encode(a);
                }
            }
            return types[i].encode(a);
        }, types);
};
//
// intersections
//
var IntersectionType = /** @class */ (function (_super) {
    __extends(IntersectionType, _super);
    function IntersectionType(name, is, validate, serialize, types) {
        var _this = _super.call(this, name, is, validate, serialize) || this;
        _this.types = types;
        _this._tag = 'IntersectionType';
        return _this;
    }
    return IntersectionType;
}(Type));
exports.IntersectionType = IntersectionType;
function intersection(types, name) {
    if (name === void 0) { name = "(" + types.map(function (type) { return type.name; }).join(' & ') + ")"; }
    var len = types.length;
    return new IntersectionType(name, function (m) { return types.every(function (type) { return type.is(m); }); }, function (m, c) {
        var a = m;
        var errors = [];
        for (var i = 0; i < len; i++) {
            var type_4 = types[i];
            var validation = type_4.validate(a, c);
            validation.fold(function (e) { return pushAll(errors, e); }, function (va) { return (a = va); });
        }
        return errors.length ? exports.failures(errors) : exports.success(a);
    }, types.every(function (type) { return type.encode === exports.identity; })
        ? exports.identity
        : function (a) {
            var s = a;
            for (var i = 0; i < len; i++) {
                var type_5 = types[i];
                s = type_5.encode(s);
            }
            return s;
        }, types);
}
exports.intersection = intersection;
//
// tuples
//
var TupleType = /** @class */ (function (_super) {
    __extends(TupleType, _super);
    function TupleType(name, is, validate, serialize, types) {
        var _this = _super.call(this, name, is, validate, serialize) || this;
        _this.types = types;
        _this._tag = 'TupleType';
        return _this;
    }
    return TupleType;
}(Type));
exports.TupleType = TupleType;
function tuple(types, name) {
    if (name === void 0) { name = "[" + types.map(function (type) { return type.name; }).join(', ') + "]"; }
    var len = types.length;
    return new TupleType(name, function (m) { return arrayType.is(m) && m.length === len && types.every(function (type, i) { return type.is(m[i]); }); }, function (m, c) {
        return arrayType.validate(m, c).chain(function (as) {
            var t = as;
            var errors = [];
            var _loop_4 = function (i) {
                var a = as[i];
                var type_6 = types[i];
                var validation = type_6.validate(a, exports.appendContext(c, String(i), type_6));
                validation.fold(function (e) { return pushAll(errors, e); }, function (va) {
                    if (va !== a) {
                        if (t === as) {
                            t = as.slice();
                        }
                        t[i] = va;
                    }
                });
            };
            for (var i = 0; i < len; i++) {
                _loop_4(i);
            }
            if (as.length > len) {
                errors.push(exports.getValidationError(as[len], exports.appendContext(c, String(len), exports.never)));
            }
            return errors.length ? exports.failures(errors) : exports.success(t);
        });
    }, types.every(function (type) { return type.encode === exports.identity; }) ? exports.identity : function (a) { return types.map(function (type, i) { return type.encode(a[i]); }); }, types);
}
exports.tuple = tuple;
//
// readonly objects
//
var ReadonlyType = /** @class */ (function (_super) {
    __extends(ReadonlyType, _super);
    function ReadonlyType(name, is, validate, serialize, type) {
        var _this = _super.call(this, name, is, validate, serialize) || this;
        _this.type = type;
        _this._tag = 'ReadonlyType';
        return _this;
    }
    return ReadonlyType;
}(Type));
exports.ReadonlyType = ReadonlyType;
exports.readonly = function (type, name) {
    if (name === void 0) { name = "Readonly<" + type.name + ">"; }
    return new ReadonlyType(name, type.is, function (m, c) {
        return type.validate(m, c).map(function (x) {
            if (process.env.NODE_ENV !== 'production') {
                return Object.freeze(x);
            }
            return x;
        });
    }, type.encode === exports.identity ? exports.identity : type.encode, type);
};
//
// readonly arrays
//
var ReadonlyArrayType = /** @class */ (function (_super) {
    __extends(ReadonlyArrayType, _super);
    function ReadonlyArrayType(name, is, validate, serialize, type) {
        var _this = _super.call(this, name, is, validate, serialize) || this;
        _this.type = type;
        _this._tag = 'ReadonlyArrayType';
        return _this;
    }
    return ReadonlyArrayType;
}(Type));
exports.ReadonlyArrayType = ReadonlyArrayType;
exports.readonlyArray = function (type, name) {
    if (name === void 0) { name = "ReadonlyArray<" + type.name + ">"; }
    var arrayType = exports.array(type);
    return new ReadonlyArrayType(name, arrayType.is, function (m, c) {
        return arrayType.validate(m, c).map(function (x) {
            if (process.env.NODE_ENV !== 'production') {
                return Object.freeze(x);
            }
            else {
                return x;
            }
        });
    }, arrayType.encode, type);
};
//
// strict interfaces
//
var StrictType = /** @class */ (function (_super) {
    __extends(StrictType, _super);
    function StrictType(name, is, validate, serialize, props) {
        var _this = _super.call(this, name, is, validate, serialize) || this;
        _this.props = props;
        _this._tag = 'StrictType';
        return _this;
    }
    return StrictType;
}(Type));
exports.StrictType = StrictType;
/** Specifies that only the given interface properties are allowed */
exports.strict = function (props, name) {
    if (name === void 0) { name = "StrictType<" + getNameFromProps(props) + ">"; }
    var loose = exports.type(props);
    return new StrictType(name, function (m) { return loose.is(m) && Object.getOwnPropertyNames(m).every(function (k) { return props.hasOwnProperty(k); }); }, function (m, c) {
        return loose.validate(m, c).chain(function (o) {
            var keys = Object.getOwnPropertyNames(o);
            var len = keys.length;
            var errors = [];
            for (var i = 0; i < len; i++) {
                var key = keys[i];
                if (!props.hasOwnProperty(key)) {
                    errors.push(exports.getValidationError(o[key], exports.appendContext(c, key, exports.never)));
                }
            }
            return errors.length ? exports.failures(errors) : exports.success(o);
        });
    }, loose.encode, props);
};
var isTagged = function (tag) {
    var f = function (type) {
        if (type instanceof InterfaceType || type instanceof StrictType) {
            return type.props.hasOwnProperty(tag);
        }
        else if (type instanceof IntersectionType) {
            return type.types.some(f);
        }
        else if (type instanceof UnionType) {
            return type.types.every(f);
        }
        else if (type instanceof RefinementType) {
            return f(type.type);
        }
        else {
            return false;
        }
    };
    return f;
};
var findTagged = function (tag, types) {
    var len = types.length;
    var is = isTagged(tag);
    var i = 0;
    for (; i < len - 1; i++) {
        var type_7 = types[i];
        if (is(type_7)) {
            return type_7;
        }
    }
    return types[i];
};
var getTagValue = function (tag) {
    var f = function (type) {
        switch (type._tag) {
            case 'InterfaceType':
            case 'StrictType':
                return type.props[tag].value;
            case 'IntersectionType':
                return f(findTagged(tag, type.types));
            case 'UnionType':
                return f(type.types[0]);
            case 'RefinementType':
                return f(type.type);
        }
    };
    return f;
};
exports.taggedUnion = function (tag, types, name) {
    if (name === void 0) { name = "(" + types.map(function (type) { return type.name; }).join(' | ') + ")"; }
    var tagValue2Index = {};
    var tagValues = {};
    var len = types.length;
    var get = getTagValue(tag);
    for (var i = 0; i < len; i++) {
        var value = get(types[i]);
        tagValue2Index[value] = i;
        tagValues[value] = null;
    }
    var TagValue = exports.keyof(tagValues);
    return new UnionType(name, function (v) {
        if (!exports.Dictionary.is(v)) {
            return false;
        }
        var tagValue = v[tag];
        return TagValue.is(tagValue) && types[tagValue2Index[tagValue]].is(v);
    }, function (s, c) {
        return exports.Dictionary.validate(s, c).chain(function (d) {
            return TagValue.validate(d[tag], exports.appendContext(c, tag, TagValue)).chain(function (tagValue) {
                var i = tagValue2Index[tagValue];
                var type = types[i];
                return type.validate(d, exports.appendContext(c, String(i), type));
            });
        });
    }, types.every(function (type) { return type.encode === exports.identity; }) ? exports.identity : function (a) { return types[tagValue2Index[a[tag]]].encode(a); }, types);
};
//# sourceMappingURL=index.js.map