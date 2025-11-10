(function(){
    /*
const isObj = (v)=>null!==v && 'object'===typeof v && '[object Object]'===Object.prototype.toString.call(v);
const getFIError = (v,n,isI=false)=>new TypeError(`${n}はNumber型有限${isI ? '整' : '実'}数リテラル値(非NaN)であるべきです。:${v}`);
const isNum = (v)=>'number'===typeof v || !Number.isNaN(v);
const isFloat = (v,n)=>{if (!isNum(v) || !Number.isFinite(v)) {throw getFIError(v,n)} return true;};
const isInt = (v,n)=>{if (!isNum(v) || !Number.isInteger(v)) {throw getFIError(v,n,true)} return true;};
const isBool = (v,n)=>{if ('boolean'!==typeof v) {throw new TypeError(`${n}は真偽値であるべきです。:${v}`)}}
const validRange = (expected, actual, name)=>{
    if (!'min max'.split(' ').some(v=>v===name)) {throw new TypeError('nameはminかmaxのみ有効です。')}
    if (actual < expected) {throw new RangeError(`${name}はunsigned,bitで設定した範囲より${'min'===name ? '小さい' : '大きい'}です。範囲内に指定してください。`)}
}
const isSafeNum = (v)=>(v < Number.MIN_SAFE_INTEGER || Number.MAX_SAFE_INTEGER < v);
const isNu = (v)=>[null,undefined].some(V=>V===v);
const isNun = (v)=>[null,undefined].some(V=>V===v) || Number.isNaN(v);
// プリミティブ値か（undefined,null,NaN,-+Infinityを除く。数値,文字列,論理値,配列,オブジェクト,BigInt,正規表現(/[a-z]/等の表現があるが実際はRegExpインスタンス故除外)）
const isPrim = (v)=>null!==value && 'object'!==typeof v; // nullやundefinedもプリミティブ値だがそれらは除外する
const primTypes = ()=>[Boolean,Number,BigInt,String,Integer,Float]; // プリミティブ型一覧(undefined,null,symbolを除く)
const isPrimIns = (v)=>primTypes().some(T=>v instanceof T); // プリミティブ型インスタンスか
*/
const isObj = (v)=>null!==v && 'object'===typeof v && '[object Object]'===Object.prototype.toString.call(v),
    getFIError = (v,n,isI=false)=>new TypeError(`${n}はNumber型有限${isI ? '整' : '実'}数リテラル値(非NaN)であるべきです。:${v}`),
    isNum = (v)=>'number'===typeof v || !Number.isNaN(v);
    isFloat = (v,n)=>{if (!isNum(v) || !Number.isFinite(v)) {throw getFIError(v,n)} return true;},
    isInt = (v,n)=>{if (!isNum(v) || !Number.isInteger(v)) {throw getFIError(v,n,true)} return true;},
    isBool = (v,n)=>{if ('boolean'!==typeof v) {throw new TypeError(`${n}は真偽値であるべきです。:${v}`)}}
    validRange = (expected, actual, name)=>{
        if (!'min max'.split(' ').some(v=>v===name)) {throw new TypeError('nameはminかmaxのみ有効です。')}
        if (actual < expected) {throw new RangeError(`${name}はunsigned,bitで設定した範囲より${'min'===name ? '小さい' : '大きい'}です。範囲内に指定してください。`)}
    },
    isSafeNum = (v)=>(v < Number.MIN_SAFE_INTEGER || Number.MAX_SAFE_INTEGER < v),
    isNu = (v)=>[null,undefined].some(V=>V===v),
    isNun = (v)=>[null,undefined].some(V=>V===v) || Number.isNaN(v),
    // プリミティブ値か(undefined,null,NaN,-+Infinityを除く。数値,文字列,論理値,配列,オブジェクト,BigInt,正規表現(/[a-z]/等の表現があるが実際はRegExpインスタンス故除外))
    isPrim = (v)=>null!==value && 'object'!==typeof v, // nullやundefinedもプリミティブ値だがそれらは除外する
    primTypes = ()=>[Boolean,Number,BigInt,String,Integer,Float], // プリミティブ型一覧(undefined,null,symbolを除く)
    isPrimIns = (v)=>primTypes().some(T=>v instanceof T); // プリミティブ型インスタンスか

class Quantity extends Number {// NaN,Infinityを制限できるし許容もできるがNumberのように同居はしない
    static validate(value, naned=false, infinited=false, unsafed=false, unsigned=false, min=undefined, max=undefined, fig=0) {
        isFloat(value, 'value');
        isBool(naned, 'naned');
        isBool(infinited, 'infinited');
        isBool(unsafed, 'unsafed');
        isBool(unsigned, 'unsigned');
        if (!isNu(min)) {isFloat(min, 'min')}
        if (!isNu(max)) {isFloat(max, 'max')}
        // https://developer.mozilla.org/ja/docs/Web/JavaScript/Reference/Global_Objects/Number/toFixed
        if (!(Number.isSafeInteger(fig) && 0<=fig && fig<=100)) {throw new TypeError(`figは0〜100の整数値であるべきです。`)}
        // 整合性
        //if(!unsafed && !Number.isSafeInteger(value)) {throw new TypeError(`非安全な整数値は許可されておらず代入できません。unsafed=trueにしてください。`)}// こうすると整数でなく少数が入った時に必ずエラーに成ってしまう。IsSafe()関数があれば良かったのに存在しない……
        if(!unsafed && (value < Number.MIN_SAFE_INTEGER || Number.MAX_SAFE_INTEGER < value)) {throw new TypeError(`非安全な整数値は許可されておらず代入できません。unsafed=trueにしてください。`)}
        if (unsafed && bit) {
            console.warn(`unsafed=trueなら範囲制限なしになります。つまり、bit=0,min=undefined,max=undefinedになります。`)
            min = undefined;
            max = undefined;
        }
        const MIN = min ?? unsafed ? (unsigned ? 0 : Number.MIN_VALUE) : (unsigned ? 0 : Number.MIN_SAFE_INTEGER);
        const MAX = max ?? unsafed ? Number.MAX_VALUE : Number.MAX_SAFE_INTEGER;
        // unsafed/unsigned/bit と min/max が矛盾しないこと
//        if (min < MIN) {throw new RangeError(`minはunsigned,bitで設定した範囲より小さいです。範囲内に指定してください。`)}
//        if (MAX < max) {throw new RangeError(`maxはunsigned,bitで設定した範囲より大きいです。範囲内に指定してください。`)}
        validRange(MIN, min, 'min');
        validRange(MAX, max, 'max');
        return {
            value: value, 
            naned: naned,
            infinited: infinited,
            unsafed: unsafed,
            unsigned: unsigned,
            min: MIN,
            max: MAX,
            fig: fig,
        };
    }
    constructor(value, nanable=false, infinited=false, unsafed=false, unsigned=false, min=undefined, max=undefined, fig=0) {
        super(value);
//        this.construcotr.validate(value, nanable, infinited, unsafed, unsigned, min, max, fig);
        Quantity.validate(value, nanable, infinited, unsafed, unsigned, min, max, fig);
    }
    validate(v) {return this.constructor.validate(v ?? this.valueOf(), this._.unsafed, this._.unsigned, this._.min, this._.max, this._.fig);}
    toFixed(fig) {return super.toFixed(fig ?? this._.fig)}
}
//class Finite extends Quantity {// NaN,Infinityを制限した有限数
class Float extends Quantity {// NaN,Infinityを制限した有限数
    static validate(value, unsafed=false, unsigned=false, min=undefined, max=undefined, fig=0) {
//        this.constructor.prototype.validate(value, false, false, unsafed, unsigned, min, max, fig);
        return Quantity.validate(value, false, false, unsafed, unsigned, min, max, fig);
    }
    constructor(value, unsafed=false, unsigned=false, min=undefined, max=undefined, fig=0) {
        super(value, false, false, unsafed, unsigned, min, max, fig);
    }
}
/*
//class Float extends Number {
class Float extends Finite {
    static validate(value, unsafed=false, unsigned=false, min=undefined, max=undefined, fig=0) {
        console.log(value);
        isFloat(value, 'value');
        isBool(unsafed, 'unsafed');
        isBool(unsigned, 'unsigned');
//        if ('boolean'!==typeof unsafed) {throw new TypeError(`unsafedは真偽値であるべきです。`)}
//        if ('boolean'!==typeof unsigned) {throw new TypeError(`unsignedは真偽値であるべきです。`)}
        if (!isNu(min)) {isFloat(min, 'min')}
        if (!isNu(max)) {isFloat(max, 'max')}
        if (!(Number.isSafeInteger(fig) && -1<fig)) {throw new TypeError(`figは0以上の整数値であるべきです。`)}
        // 整合性
        //if(!unsafed && !Number.isSafeInteger(value)) {throw new TypeError(`非安全な整数値は許可されておらず代入できません。unsafed=trueにしてください。`)}// こうすると整数でなく少数が入った時に必ずエラーに成ってしまう。IsSafe()関数があれば良かったのに存在しない……
        if(!unsafed && (value < Number.MIN_SAFE_INTEGER || Number.MAX_SAFE_INTEGER < value)) {throw new TypeError(`非安全な整数値は許可されておらず代入できません。unsafed=trueにしてください。`)}
        if (unsafed && bit) {
            console.warn(`unsafed=trueなら範囲制限なしになります。つまり、bit=0,min=undefined,max=undefinedになります。`)
            min = undefined;
            max = undefined;
        }
//        min = min ?? unsafed ? (unsigned ? 0 : Number.MIN_VALUE) : (unsigned ? 0 : (0===bit ? Number.MIN_SAFE_INTEGER : -(2**bit)/2));
//        max = max ?? unsafed ? Number.MAX_VALUE : (unsigned ? (0===bit ? Number.MAX_SAFE_INTEGER : (2**bit)-1) : (0===bit ? Number.MAX_SAFE_INTEGER : ((2**bit)/2)-1));
        const MIN = min ?? unsafed ? (unsigned ? 0 : Number.MIN_VALUE) : (unsigned ? 0 : Number.MIN_SAFE_INTEGER);
        const MAX = max ?? unsafed ? Number.MAX_VALUE : Number.MAX_SAFE_INTEGER;
        // unsafed/unsigned/bit と min/max が矛盾しないこと
        if (min < MIN) {throw new RangeError(`minはunsigned,bitで設定した範囲より小さいです。範囲内に指定してください。`)}
        if (MAX < max) {throw new RangeError(`minはunsigned,bitで設定した範囲より小さいです。範囲内に指定してください。`)}
        return {
            value: value, 
            unsafed: unsafed,
            unsigned: unsigned,
            min: MIN,
            max: MAX,
            fig: fig,
        };
    }
    constructor(value, unsafed=false, unsigned=false, min=undefined, max=undefined, fig=0) {
        super(value);
        //this.constructor.validate(value);
        //const options = this.constructor.validate(value, unsafed, unsigned, min, max, fig);
        //this._ = Float.validate(value, unsafed, unsigned, min, max, fig);
        this._ = this.constructor.validate(value, unsafed, unsigned, min, max, fig);
    }

    validate(v) {return this.constructor.validate(v ?? this.valueOf(), this._.unsafed, this._.unsigned, this._.min, this._.max, this._.fig);}
//    validate(v) {return Float.validate(v ?? this.valueOf(), this._.unsafed, this._.unsigned, this._.min, this._.max, this._.fig);}
//    validate() {return Float.validate(this.valueOf());}
//    get valid() {return Float.validate(this.valueOf());}
    // this.valueOf(); でリテラル値を返す
}
*/
class Rate extends Float { constructor(value) {super(value, false, true, 0, 1)} }// 比率(0〜1の実数)
class Percent extends Float { constructor(value, fig=0) {super(value, false, true, 0, 100, fig)} }// 百分率(0〜100の実数)
class Fraction extends Number {// 分数
    constructor(numerator, denominator) {
        super(numerator/denominator);
    }
}
class Ratio extends Number {// 割合(16:9, 1:1.414)
    constructor(...values) {
        this._
    }
}

class Integer extends Quantity {
    static validate(value, unsafed=false, unsigned=false, bit=0, min=undefined, max=undefined) {
        const R = Quantity.validate(value, false, false, unsafed, unsigned, min, max, 0);
        const S = this.#setupMinMax(unsafed, unsigned, bit, min, max);
        return {...R, ...S};
    }
    static #validateMinMax(unsafed, unsigned, bit, min, max) {
        const MIN = min ?? unsafed ? (unsigned ? 0 : Number.MIN_VALUE) : (unsigned ? 0 : (0===bit ? Number.MIN_SAFE_INTEGER : -(2**bit)/2));
        const MAX = max ?? unsafed ? Number.MAX_VALUE : (unsigned ? (0===bit ? Number.MAX_SAFE_INTEGER : (2**bit)-1) : (0===bit ? Number.MAX_SAFE_INTEGER : ((2**bit)/2)-1));
        // unsafed/unsigned/bit と min/max が矛盾しないこと
//        if (min < MIN) {throw new RangeError(`minはunsigned,bitで設定した範囲より小さいです。範囲内に指定してください。`)}
//        if (MAX < max) {throw new RangeError(`maxはunsigned,bitで設定した範囲より大きいです。範囲内に指定してください。`)}
        validRange(MIN, min, 'min');
        validRange(MAX, max, 'max');
        return {min:MIN, max:MAX};
    }
    constructor(value, unsafed=false, unsigned=false, bit=0, min=undefined, max=undefined) {
        super(value);
        //this._ = this.constructor.validate(value, unsafed, unsigned, min, max, 0);
        this._ = Integer.validate(value, unsafed, unsigned, bit, min, max);
        this.#setupMinMax(min, max)
    }
    #setupMinMax(min, max) {// unsafed, unsigned, bit から min, max を算出する
        this._.min = this._.min ?? this._.unsafed ? (this._.unsigned ? 0 : Number.MIN_VALUE) : (this._.unsigned ? 0 : (0===bit ? Number.MIN_SAFE_INTEGER : -(2**bit)/2));
        this._.max = this._.max ?? this._.unsafed ? Number.MAX_VALUE : (this._.unsigned ? (0===bit ? Number.MAX_SAFE_INTEGER : (2**bit)-1) : (0===bit ? Number.MAX_SAFE_INTEGER : ((2**bit)/2)-1));
        // unsafed/unsigned/bit と min/max が矛盾しないこと
        if (this._.min < min) {throw new RangeError(`minはunsigned,bitで設定した範囲より小さいです。範囲内に指定してください。`)}
        if (max < this._.max) {throw new RangeError(`minはunsigned,bitで設定した範囲より小さいです。範囲内に指定してください。`)}
    }

}
/*
class Integer extends Number {
    static validate(value, unsafed=false, unsigned=false, bit=0, min=undefined, max=undefined) {
        // 引数確認
        isInt(value,'value');
//        if ('boolean'!==typeof unsafed) {throw new TypeError(`unsafedは真偽値であるべきです。`)}
//        if ('boolean'!==typeof unsigned) {throw new TypeError(`unsignedは真偽値であるべきです。`)}
        isBool(unsafed, 'unsafed');
        isBool(unsigned, 'unsigned');
        if ((Number.isInteger(bit) && -1<bit && bit<53)) {throw new TypeError(`bitは0〜52迄のNumber型整数値であるべきです。`)}
        if (!isNu(min)) {isInt(min,'min')}
        if (!isNu(max)) {isInt(max,'max')}
        // 整合性
        if(!unsafed && !Number.isSafeInteger(value)) {throw new TypeError(`非安全な整数値は許可されておらず代入できません。unsafed=trueにしてください。`)}
        if (unsafed && bit) {
            console.warn(`unsafed=trueなら範囲制限なしになります。つまり、bit=0,min=undefined,max=undefinedになります。`)
            bit = 0;
            min = undefined;
            max = undefined;
        }
        const MIN = min ?? unsafed ? (unsigned ? 0 : Number.MIN_VALUE) : (unsigned ? 0 : (0===bit ? Number.MIN_SAFE_INTEGER : -(2**bit)/2));
        const MAX = max ?? unsafed ? Number.MAX_VALUE : (unsigned ? (0===bit ? Number.MAX_SAFE_INTEGER : (2**bit)-1) : (0===bit ? Number.MAX_SAFE_INTEGER : ((2**bit)/2)-1));
        // unsafed/unsigned/bit と min/max が矛盾しないこと
        if (min < MIN) {throw new RangeError(`minはunsigned,bitで設定した範囲より小さいです。範囲内に指定してください。`)}
        if (MAX < max) {throw new RangeError(`minはunsigned,bitで設定した範囲より小さいです。範囲内に指定してください。`)}
        return {
            value: value, 
            unsafed: unsafed,
            unsigned: unsigned,
            bit: bit,
            min: MIN,
            max: MAX,
        };
    }
    constructor(value, unsafed=false, unsigned=false, bit=0, min=undefined, max=undefined) {
        super(value);
//        this.#checkArgs(value, unsafed, unsigned, bit, min, max);
        //this._ = {unsafed:unsafed, unsigned:unsigned, bit:bit, min:min, max:max};
        //this.#setupMinMax(min, max);
//        this.validate(value);
        this._ = this.constructor.validate(value, unsafed, unsigned, min, max, fig);
    }
    get unsafed() {return this._.unsafed}
    get unsigned() {return this._.unsigned}
    get bit() {return this._.bit}

    validate(v) {return this.constructor.validate(v ?? this.valueOf(), this._.unsafed, this._.unsigned, this._.bit, this._.min, this._.max);}
    //validate(v) {return Integer.validate(v ?? this.valueOf(), this._.unsafed, this._.unsigned, this._.bit, this._.min, this._.max);}
    // this.valueOf(); でリテラル値を返す
}
*/
// 乱数は疑似乱数であり複数の方式やサイズ等があるため、プリミティブ型に相応しいはず。但し参照する度に乱数を返すべいなのだとしたら、同じ値を参照できなくなってしまう。
/*
class RandomRate extends Rate {
}
class RandomInt extends Integer {
}
*/
// IDは整数値だけでなく文字列表現にしたい場合もあるためvalueOf()でリテラル値を取得するプリミティブ変数にするのは不適切か。
/*
class Id extends Integer {
}
class Uuid extends Integer {
}
class Ulid extends Integer {
}
*/
class FixObservedProperties {// 定数専用
    constructor(options) {
        this._ = {opt:{}, prop:{}, primIns:{}};
        this.#checkArgs(options);
        this.#checkKeys(options)
        this.#setDefaultOptions(options);
        for (let [k, v] of Object.entries(this._.opt)) { this.#makeDescriptor(k, v); }
        return this.#makeProxy();
    }
    #checkArgs(options) {
        if (!isObj(options)) {throw new TypeError(`第一引数optionsはプロパティ名とその型などの情報を持つオブジェクトであるべきです。例:{name:{value:''}, age:{value:0, valid:Obs.valid.range(0,100)}}`)}
    }
    #checkKeys(options) {
        const reserveds = ['_isProxy', '_'];
        const keys = [...Object.keys(options)];
        for (let key of Object.keys(options)) {if (reserveds.some(r=>r===key)) {throw new TypeError(`'${key}' は予約済みキー名です。他の名前にしてください。予約済み名一覧:${reserveds.join(',')}`)}}
    }
    #setDefaultOptions(options) {
        for (let [k, v] of Object.entries(options)) {
            if (!isObj(options[k])) { options[k] = {value:v}; v = {value:v}; }
            if (options[k].hasOwnProperty('value') && options[k].value instanceof ObservedProperties) {continue}
            console.log(k, v);
            if (!options[k].hasOwnProperty('value') && !options[k].hasOwnProperty('type')) {throw TypeError('valueとtypeは少なくともいずれか一つ必要です。')}
            else if (options[k].hasOwnProperty('value') && !options[k].hasOwnProperty('type')) {
                options[k].type = Typed.getTypeFromValue(options[k].value);
            }
            else if (!options[k].hasOwnProperty('value') && options[k].hasOwnProperty('type')) {
                options[k].value = Typed.defaultValue(options[k].type);
            }
            // プリミティブ型インスタンスだった場合
            console.log('isPrimIns(v.value):', isPrimIns(v.value), v);
            if (isPrimIns(v.value)) {this._.primIns[k] = v.value; options[k].value = v.value.valueOf();}
        }
        this._.opt = options;
    }
    #makeDescriptor(k, v) {
        this._.prop[k] = undefined;
        const isObs = (v instanceof ObservedProperties);
        const desc = {
            configurable: false,
            enumerable: true,
            get: ()=>this._.prop[k],
            set: (V)=>{throw new SyntaxError(`定数に代入はできません。`)},
        };
        if (!isObs) {// ToDo: 型、妥当性チェックする
            Typed.valid(this._.opt[k].type, v.value);
        }
        this._.prop[k] = v.value;
        Object.defineProperty(this, k, desc); // どうせProxyを返すから使わないはずだが念の為に用意する。
    }
    #makeProxy() { return new Proxy(this, {
        get: (target, prop, receiver)=>{
            if ('_isProxy'===prop) {return true}
            else if ('_'===prop) {return structuredClone(this._.primIns)}
            else {
                if (!(prop in this._.prop)) {throw new SyntaxError(`未定義のプロパティを参照しました。:${prop}`)}
                return this._.prop[prop];
            }
        },
        set: (target, prop, value, receiver)=>{throw new SyntaxError(`定数に代入はできません。`);},
    });
    }
}
class ObservedProperties {
    constructor(iOpt, oOpt, update) {
        this._ = {opt:{}, prop:{}, primIns:{}, onSet:{}, onChange:{}, update:(i,o)=>{}};
        this.#checkArgs(iOpt, oOpt, update);
        this.#checkKeys(iOpt)
        this.#setDefaultOptions(iOpt);
        for (let [k, v] of Object.entries(this._.opt)) { this.#makeDescriptor(k, v); }
        this._.oOpt = ([undefined,null].some(v=>v===oOpt)) ? ({}) : (oOpt instanceof ObservedProperties) ? oOpt : new ObservedProperties(oOpt);
        if ('function'===typeof update) {this._.update = update;}
        this.#update();
        console.log(this);
        return this.#makeProxy();
    }
    #checkArgs(iOpt, oOpt, update) {
        const isObj = (v)=>null!==v && 'object'===typeof v && '[object Object]'===Object.prototype.toString.call(v);
        if (!isObj(iOpt)) {throw new TypeError(`第一引数iOptはプロパティ名とその型などの情報を持つオブジェクトであるべきです。例:{name:{value:''}, age:{value:0, valid:Obs.valid.range(0,100)}}`)}
        if (undefined!==oOpt && null!==oOpt && !isObj(oOpt) && !(oOpt instanceof ObservedProperties)) {throw new TypeError(`第二引数oOptはObsインスタンスまたはプロパティ名とその型などの情報を持つオブジェクトであるべきです。例:{name:{value:''}, age:{value:0, valid:Obs.valid.range(0,100)}}`)}
        if (undefined!==update && 'function'!==typeof update) {throw new TypeError(`第三引数updateはプロパティに値を代入したら実行されるコールバック関数であるべきです。例: (i,o)=>o.msg = '名:' + i.name + ' 年:' + i.age;`)}
    }
    #checkKeys(iOpt) {
        const reserveds = ['setup', '_', '$', '_isProxy'];
        const keys = [...Object.keys(iOpt)];
        for (let key of Object.keys(iOpt)) {if (reserveds.some(r=>r===key)) {throw new TypeError(`'${key}' は予約済みキー名です。他の名前にしてください。予約済み名一覧:${reserveds.join(',')}`)}}
    }
    #setDefaultOptions(iOpt) {
        for (let [k, v] of Object.entries(iOpt)) {
            //if (!isObj(iOpt[k])) { iOpt[k] = {value:v}; v = {value:v}; }
            if (!isObj(iOpt[k])) {
                iOpt[k] = {value:v}; v = {value:v};
            }
            if (iOpt.hasOwnProperty('value') && iOpt.value instanceof ObservedProperties) {continue}
            console.log(k, v);
            if (!v.hasOwnProperty('value') && !v.hasOwnProperty('type')) {throw TypeError('valueとtypeは少なくともいずれか一つ必要です。')}
            else if (v.hasOwnProperty('value') && !v.hasOwnProperty('type')) {
                iOpt[k].type = Typed.getTypeFromValue(v.value);
            }
            else if (!v.hasOwnProperty('value') && v.hasOwnProperty('type')) {
                iOpt[k].value = Typed.defaultValue(v.type);
            }
            // プリミティブ型インスタンスだった場合
            //if (isPrimIns(v)) {this._.primIns[k] = v; options[k].value = v.valueOf();}
            if (isPrimIns(v.value)) {this._.primIns[k] = v.value; options[k].value = v.value.valueOf();}
        }
        this._.opt = iOpt;
    }
    setup(values) {// values:{name:value, name:value, ...}
        for (let [k, v] of Object.entries(values)) {
            console.log(this._.prop);
            if (!(k in this._.prop)) {throw new SyntaxError(`未定義のプロパティに代入しました。:${prop}`)}
            // ToDo: 型、妥当性チェックする
            Typed.valid(this._.opt[k].type, v);
            // 独自プリミティブ型インスタンスだった場合(Int,Float)
//            if (isPrimIns(v) && 'validate' in v) {this._.primIns[k].validate(v);}
            if (k in this._.primIns) {this._.primIns[k].validate(v)}
            const oldValue = this._.prop[k];
            this._.prop[k] = v;
            //this._.obj.open[k] = v; // update()が毎回発火してしまうので使わぬようにする
            if (k in this._.onSet) {this._.onSet[k](v, oldValue);}
            if (k in this._.onChange && value!==oldValue) {this._.onChange[k](v, oldValue);}
        }
        return this.#update();
    }
    #update() {
        if ('function'===typeof this._.update) {return this._.update(structuredClone(this._.prop), this._.oOpt);}
    }
    #makeProxy() { return new Proxy(this, {
        get: (target, prop, receiver)=>{
            if ('_isProxy'===prop) {return true}
            else if ('_'===prop) {return structuredClone(this._.primIns)}
            else if ('$'===prop) {console.log(this._.oOpt);return this._.oOpt;}
            else if ('setup'===prop) {console.log(this.setup);return this.setup.bind(this);}
            else {
                if (!(prop in this._.prop)) {throw new SyntaxError(`未定義のプロパティを参照しました。:${prop}`)}
                return this._.prop[prop];
            }
        },
        set: (target, prop, value, receiver)=>{
            console.log(target._.prop, this._.prop, target, this);
            if (!(prop in target._.prop)) {throw new SyntaxError(`未定義のプロパティに代入しました。:${prop}`)}
            Typed.valid(target._.opt[prop].type, value);
            // 独自プリミティブ型インスタンスだった場合(Int,Float)
            if (prop in this._.primIns) {this._.primIns[prop].validate(value)}
//            if (isPrimIns(value) && 'validate' in value) {this._.primIns[k].validate(value);}
            const oldValue = target._.prop[prop];
            target._.prop[prop] = value;
            if (prop in target._.onSet) {target._.onSet[prop](value, oldValue);}
            if (prop in target._.onChange && value!==oldValue) {target._.onChange[prop](value, oldValue);}
            target._.update();
        },
    });
    }
    #makeDescriptor(k, v) {
        this._.prop[k] = undefined;
        const isObs = (v instanceof ObservedProperties);
        const desc = {
            configurable: false,
            enumerable: true,
            get: ()=>this._.prop[k],
            set: (V)=>{
                console.log(this, this._.opt[k].type);
                // ToDo: 型、妥当性チェックする
                Typed.valid(this._.opt[k].type, V);
                // 独自プリミティブ型インスタンスだった場合(Int,Float)
                //if (isPrimIns(v) && 'validate' in v) {this._.primIns[k].validate(v);}
                if (k in this._.primIns) {this._.primIns[k].validate(v)}
                const oldValue = this._.prop[k];
                this._.prop[k] = V;
                if (k in this._.onSet) {this._.onSet[k](V, oldValue);}
                if (k in this._.onChange && V!==oldValue) {this._.onChange[k](V, oldValue);}
                this._.update();
            },
        };
        if (!isObs) {// ToDo: 型、妥当性チェックする
            Typed.valid(this._.opt[k].type, v.value);
        }
        this._.prop[k] = v.value;
        Object.defineProperty(this, k, desc);
    }
}
// undefined, null, NaN, Infinity, -Infinity
// Object, Error(SyntaxError,...)
// Function
// Boolean, Number, BigInt, 
// String, RegExp, URL
// TypedArray(Uint8Array,...)
// Temporal, Date
class Typed {
    static getTypeFromValue(value) {
        if ([null, undefined, Infinity, -Infinity].some(v=>v===value) || value===Number.isNaN(value)) {throw new TypeError('null, undefined, Infinity, -Infinity, NaN禁止')}
        if ('boolean'===typeof value) {return Boolean}
        else if ('number'===typeof value) {return Number}
        else if ('bigint'===typeof value) {return BigInt}
        else if ('string'===typeof value) {return String}
        else if ('symbol'===typeof value) {return Symbol}
        else {return value.constructor}// 'object'===typeof value
        /*
        else {// 'object'===typeof value
            if ('[object Object]'===value.property.toString()) {return Object}
            if ('constructor' in value) { return value.constructor } // クラスのインスタンスだった場合
            else { return }
               
            }
            value.hasOwnProperty('constructor')
            value.prototype.toString(); // [object Object], [object Function]
            new Function(`return (${className});`)
        }
        if ('boolean'===typeof value) {return Boolean}
        if ('boolean'===typeof value) {return Boolean}
        if ('boolean'===typeof value) {return Boolean}
        */
    }
    static defaultValue(type) {
        switch(type) {
            case Boolean: return false;
            case Number: return 0;
            case String: return '';
            case Array: return [];
            case Object: return {};
//            case Function: return (()=>{})
            default: return this.#defaultInstance(type);
        }
    }
    static #defaultInstance(type) {
        try { return (new type()); }
        catch (e) { return null; }
    }
    static valid(type, value, nullable=false, undefinedable=false, nanable=false, infinitable=false, unsafable=false) {
        console.log(type, value);
        this.#validType(type, value);
//        this.#validPrimitive(type, value);
//        this.#validObject(type, value);
        if (!nullable && null===value) {throw new TypeError(`許容していないのにnullです。`)}
        if (!undefinedable && undefined===value) {throw new TypeError(`許容していないのにundefinedです。`)}
//        if (Number===type && !nanable && Number.isNaN(value)) {throw new TypeError(`許容していないのにNaNです。`)}
//        if (Number===type && !infinitable && (Infinity===value || -Infinity===value)) {throw new TypeError(`許容していないのに無限数です。`)}
//        if (Number===type && !unsafable && (!Number.isSafeInteger(value))) {throw new TypeError(`許容していないのに非安全な整数値です。`)}
//        if ([Float,Rate,Ratio,Fraction,Int].some(c=>c===instance.constructor)) {instance.valid(value)}
//        if ([Boolean,Number,String,BigInt,Symbol].some(t=>t===v.constructor)) {v.valueOf()}
//        if (null!==value && 'object'===typeof value && 'valid' in value && 'function'===typeof value.valid) {value.valid()}
//        if (null!==value && 'object'===typeof value && 'validate' in value && 'function'===typeof value.validate) {value.validate()}
    }
    static #validType(type, value) {
        console.log(type, value, Number===type, 'number'!==typeof value, typeof value);
        if ((Boolean===type && 'boolean'!==typeof value)
        || (Number===type && 'number'!==typeof value)
        || (BigInt===type && 'bigint'!==typeof value)
        || (String===type && 'string'!==typeof value)
        || (Symbol===type && 'symbol'!==typeof value)) { throw new TypeError(`'${value}'は期待する${type.name}型ではありません。`) } // プリミティブ型
        //else {// オブジェクト型
        else if ('object'===typeof value) {// オブジェクト型
//            const MSG = `'${value}'は期待する${type.constructor.name}型ではありません。`;
            if (Object===type && '[object Object]'!==value.prototype.toString()) { throw new TypeError(`'${value}'は期待する${type.name}型ではありません。`) } // {k:'v'}
            if ('constructor' in type && !(value instanceof type)) {throw new TypeError(`'${value}'は期待する${type.constructor.name}型ではありません。`)} // クラスやオブジェクトのインスタンス
        }
    }
        /*
    static #validPrimitive(type, value) { // value: ⭕Number(1)  ❌new Number(1)
        if ((Boolean===type && 'boolean'!==typeof value)
        || (Number===type && 'number'!==typeof value)
        || (BigInt===type && 'bigint'!==typeof value)
        || (String===type && 'string'!==typeof value)) { throw new TypeError(`${value}は期待する${type}型ではありません。`) }
    }
    static #validObject(type, value) {
        if (!(value instanceof type)) {throw new TypeError(`${value}は期待する${type}型ではありません。`)}
    }
        */
    /*
    static valid(type, value) {
        switch (type) {
            case Boolean: return 'boolean'===typeof value
            case Number: return 'number'===typeof value && !Number.isNaN(value)
            case Function: return 'function'===typeof value
            case String: return 'string'===typeof value
//            default: throw TypeError('未実装の型です。');
            default: return true // 判定しない
        }
    }
    */
}
// Range, Option, Uniq, RegExp
class Valid {
    static valid(type, value) {

    }
}
// ins instanceof Int ができない
//window.Int = (...args)=>new Integer(...args);
//window.Float = (...args)=>new Float(...args);
// ins instanceof Int できる
window.Integer = Integer;
window.Float = Float;
window.Obs = new Proxy({
    version: '0.0.1',
    summary: 'Observerオブジェクトを生成します。リアクティブ・プログラミングに最適です。',
    example: `
const o = Obs.var({name:{value:'Bob'}, age:{value:12}}, {msg:{value:''}}, (i,o)=>o.msg=\`My name is \${i.name}, \${i.age} years old.\`);
console.assert('Bob'===o.name);
console.assert(12===o.age);
console.assert('My name is Bob, 12 years old.'===o.$.msg);
o.name = 'John'; // update.
o.age = 24;      // update.
console.assert('John'===o.name);
console.assert(24===o.age);
console.assert('My name is John, 24 years old.'===o.$.msg);
// o.name = 3; // TypeError
// o.notHas; // SyntaxError
o.setup({name:'Andy', age:36}); // Once update.
console.assert('Andy'===o.name);
console.assert(36===o.age);
console.assert('My name is Andy, 36 years old.'===o.$.msg);

const MATH = Obs.fix({PI:{value:3.14}});
console.assert(3.14===MATH.PI);
// MATH.PI = 3.14159; // SyntaxError
`,
    var: (...args)=>new ObservedProperties(...args),
    fix: (...args)=>new FixObservedProperties(...args),
    C: {// C=Class
        I: Integer,
        Int: Integer,
        Integer: Integer,
        F: Float,
        Flt: Float,
        Float: Float,
    },
    T: {// T=Type
        i:(...args)=>new Integer(...args),
        int:(...args)=>new Integer(...args),
        integer:(...args)=>new Integer(...args),
        f:(...args)=>new Float(...args),
        flt:(...args)=>new Float(...args),
        float:(...args)=>new Float(...args),
    },
    /*
    N: {// N=New
        i:(...args)=>new Integer(...args),
        int:(...args)=>new Integer(...args),
        integer:(...args)=>new Integer(...args),
        f:(...args)=>new Integer(...args),
        flt:(...args)=>new Integer(...args),
        float:(...args)=>new Integer(...args),
    },
    I: {// I=Instance
        i:(...args)=>new Integer(...args),
        int:(...args)=>new Integer(...args),
        integer:(...args)=>new Integer(...args),
        f:(...args)=>new Integer(...args),
        flt:(...args)=>new Integer(...args),
        float:(...args)=>new Integer(...args),
    },
    T: {// T=Type
        I:(...args)=>new Integer(...args),
        Int:(...args)=>new Integer(...args),
        Integer:(...args)=>new Integer(...args),
        F:(...args)=>new Integer(...args),
        Flt:(...args)=>new Integer(...args),
        Float:(...args)=>new Integer(...args),
    },
    T: {// T=Type
        i:(...args)=>new Integer(...args),
        int:(...args)=>new Integer(...args),
        integer:(...args)=>new Integer(...args),
        f:(...args)=>new Float(...args),
        flt:(...args)=>new Float(...args),
        float:(...args)=>new Float(...args),
    },
    */
}, {
    get:(target, prop, receiver)=>{
        console.log([...Object.keys(target)]);
        if (!(prop in target)) {throw SyntaxError(`未定義のプロパティを参照しました。version,summary,example,var,fixのみ有効です。`)}
        return target[prop];
    },
    set:(target, prop, value, receiver)=>{throw new SyntaxError(`名前空間には代入できません。`)}
});
/*
//window.Obs = ObservedProperties;
window.Obs = new Proxy({}, {
    get:(target, prop, receiver)=>{
        console.log(target, prop, receiver);
        if ('version'===prop) {return '0.0.1'}
        else if ('summary'===prop) {return 'Observerオブジェクトを生成します。リアクティブ・プログラミングに最適です。'}
        else if ('example'===prop) {return "const o = Obs.var({name:{value:'Bob'}, age:{value:12}}, {msg:{value:''}}, (i,o)=>o.msg=`My name is ${i.name}, ${i.age} years old.`);\nconsole.assert('My name is Bob, 12 years old.'===o.$.msg);\no.name = 'John';\no.age = 24;\nconsole.assert('My name is John, 24 years old.'===o.$.msg);"}
        else if ('var'===prop) {return ObservedProperties.constructor}
        else if ('fix'===prop) {return FixObservedProperties.constructor}
        else {throw new SyntaxError(`未定義のプロパティを参照しました。var,fix,version,summaryのいずれかのみ有効です。`);}
    },
    set:()=>{throw new SyntaxError(`名前空間には代入できません。`)}
});
*/
})();
