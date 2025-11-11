(function(){
const isObj = (v)=>null!==v && 'object'===typeof v && '[object Object]'===Object.prototype.toString.call(v),
    getFIError = (v,n,isI=false)=>new TypeError(`${n}はNumber型有限${isI ? '整' : '実'}数リテラル値(非NaN)であるべきです。:${v}`),
    isNum = (v)=>'number'===typeof v || !Number.isNaN(v);
    isFloat = (v,n)=>{if (!isNum(v) || !Number.isFinite(v)) {throw getFIError(v,n)} return true;},
    isInt = (v,n)=>{if (!isNum(v) || !Number.isInteger(v)) {throw getFIError(v,n,true)} return true;},
    isBool = (v,n)=>{if ('boolean'!==typeof v) {throw new TypeError(`${n}は真偽値であるべきです。:${v}`)}}
    validRange = (expected, actual, name)=>{
        if (!'min max'.split(' ').some(v=>v===name)) {throw new TypeError('nameはminかmaxのみ有効です。')}
        const isOver = 'min'===name ? actual < expected : expected < actual;
        if (isOver) {throw new RangeError(`${name}はunsigned,bitで設定した範囲より${'min'===name ? '小さい' : '大きい'}です。範囲内に指定してください。:expected:${expected}, actual:${actual}`)}
    },
    getNumRange = (unsafed, unsigned, min, max)=>[(min ?? (unsigned ? 0 : (unsafed ? -Number.MAX_VALUE : Number.MIN_SAFE_INTEGER))), (max ?? (unsafed ? Number.MAX_VALUE : Number.MAX_SAFE_INTEGER))];
    getIntRange = (unsafed, unsigned, bit, min, max)=>[(min ?? (unsafed ? (unsigned ? 0 : -Number.MAX_VALUE) : (unsigned ? 0 : (0===bit ? Number.MIN_SAFE_INTEGER : -(2**bit)/2)))), (max ?? (unsafed ? Number.MAX_VALUE : (unsigned ? (0===bit ? Number.MAX_SAFE_INTEGER : (2**bit)-1) : (0===bit ? Number.MAX_SAFE_INTEGER : ((2**bit)/2)-1))))];
    isSafeNum = (v)=>(v < Number.MIN_SAFE_INTEGER || Number.MAX_SAFE_INTEGER < v),
    isNu = (v)=>[null,undefined].some(V=>V===v),
    isNun = (v)=>[null,undefined].some(V=>V===v) || Number.isNaN(v),
    // プリミティブ値か(undefined,null,NaN,-+Infinityを除く。数値,文字列,論理値,配列,オブジェクト,BigInt,正規表現(/[a-z]/等の表現があるが実際はRegExpインスタンス故除外))
    isPrim = (v)=>null!==value && 'object'!==typeof v, // nullやundefinedもプリミティブ値だがそれらは除外する
    primTypes = ()=>[Boolean,Number,BigInt,String,Integer,Float], // プリミティブ型一覧(undefined,null,symbolを除く)
    isPrimIns = (v)=>primTypes().some(T=>v instanceof T); // プリミティブ型インスタンスか

// JavaScriptは数をNumber型で扱うが、これは64bitメモリであり、かつIEEE754の倍精度浮動小数点数で実装されている。このため十進数表示において、整数は15桁まで、少数は17桁までは正確に表現できるが、それ以上の桁になると正確に表現できず、比較式も不正確な結果を返してしまう。しかもそれを正常とし、エラーを発生させない。
class Quantity extends Number {// NaN,Infinityを制限できるし許容もできるがNumberのように同居はしない
    //static validate(value, naned=false, infinited=false, unsafed=false, unsigned=false, min=undefined, max=undefined, fig=17) {
    static validate(value, naned=false, infinited=false, unsafed=false, unsigned=false, min=undefined, max=undefined) {
        isFloat(value, 'value');
        isBool(naned, 'naned');
        isBool(infinited, 'infinited');
        isBool(unsafed, 'unsafed');
        isBool(unsigned, 'unsigned');
        if (!isNu(min)) {isFloat(min, 'min')}
        if (!isNu(max)) {isFloat(max, 'max')}
        /*
        // https://developer.mozilla.org/ja/docs/Web/JavaScript/Reference/Global_Objects/Number/toFixed
        if (!(Number.isSafeInteger(fig) && 0<=fig && fig<=100)) {throw new TypeError(`figは0〜100の整数値であるべきです。`)}
        if (17 < fig) {console.warn(`figが精度保証外です。JavaScriptのNumber型はIEEE 754の倍精度(64bit)浮動小数点数のため、少数部分は十進数で17桁までの精度しかありません。指定されたfigは17を超えているため、17桁以降の数が変更されてもnealyEqual(x,y)による比較は必ず真を返してしまいます。:fig:${fig}`)}
        */
        // 整合性(!Number.isSafeInteger(value)だと整数でなく少数が入った時に必ずエラーに成ってしまう。IsSafe()関数があれば良かったのに存在しない……)
        if(!unsafed && (value < Number.MIN_SAFE_INTEGER || Number.MAX_SAFE_INTEGER < value)) {throw new TypeError(`非安全な整数値は許可されておらず代入できません。unsafed=trueにしてください。`)}
        /*
        if (unsafed && bit) {
            console.warn(`unsafed=trueなら範囲制限なしになります。つまり、bit=0,min=undefined,max=undefinedになります。`)
            min = undefined;
            max = undefined;
        }
        */
        const [MIN, MAX] = getNumRange(unsafed, unsigned, min, max);
        // unsafed/unsigned/bit と min/max が矛盾しないこと
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
//            fig: fig,
        };
    }
    //constructor(value, naned=false, infinited=false, unsafed=false, unsigned=false, min=undefined, max=undefined, fig=0) {
    constructor(value, naned=false, infinited=false, unsafed=false, unsigned=false, min=undefined, max=undefined) {
        super(value);
        //this._ = Quantity.validate(value, naned, infinited, unsafed, unsigned, min, max, fig);
        this._ = Quantity.validate(value, naned, infinited, unsafed, unsigned, min, max);
    }
    //validate(v) {return Quantity.validate(v ?? this.valueOf(), this._.naned, this._.infinited, this._.unsafed, this._.unsigned, this._.min, this._.max, this._.fig);}
    validate(v) {return Quantity.validate(v ?? this.valueOf(), this._.naned, this._.infinited, this._.unsafed, this._.unsigned, this._.min, this._.max);}
//    toFixed(fig) {return super.toFixed(fig ?? this._.fig)}
    valueOf() {return this.value}
    //get value() {return Number(this._.value.toFixed(this._.fig))}
    get value() {return this._.value}
    set value(v) {
        //Quantity.validate(v, this._.naned, this._.infinited, this._.unsafed, this._.unsigned, this._.min, this._.max, this._.fig);
        //this._.value = Number(v.toString().toFixed(this._.fig))
        Quantity.validate(v, this._.naned, this._.infinited, this._.unsafed, this._.unsigned, this._.min, this._.max);
        this._.value = v;
    }
    get naned() {return this._.naned}
    get infinited() {return this._.infinited}
    get unsafed() {return this._.unsafed}
    get unsigned() {return this._.unsigned}
    get min() {return this._.min}
    get max() {return this._.max}
//    get fig() {return this._.fig}
}
/*
//class Finite extends Quantity {// NaN,Infinityを制限した有限数
class Float extends Quantity {// NaN,Infinityを制限した有限数
    static validate(value, unsafed=false, unsigned=false, min=undefined, max=undefined, fig=17) {
        return Quantity.validate(value, false, false, unsafed, unsigned, min, max, fig);
    }
    constructor(value, unsafed=false, unsigned=false, min=undefined, max=undefined, fig=17) {
        super(value, false, false, unsafed, unsigned, min, max, fig);
    }
    nearlyEqual(x, y) {// 等号===の代替。JSのNumber型は64bit浮動少数点数であり比較等号===では完全一致確認できない（console.assert(0.3===0.1+0.2）でエラーになる）これをいくらか解決する。但し15桁の少数まで。
        if (parseInt(x) !== parseInt(y)) {return false}
        const T = parseInt(Math.abs(x + y));
        const tolerance = T < 1 ? Number.EPSILON : Number.EPSILON * T;
        return Math.abs(x - y) < tolerance;
    }
}
*/
/*
class Float extends Quantity {// NaN,Infinityを制限した有限数
    static validate(value, unsafed=false, unsigned=false, min=undefined, max=undefined, fig=17) {
        return Quantity.validate(value, false, false, unsafed, unsigned, min, max, fig);
    }
    constructor(value, unsafed=false, unsigned=false, min=undefined, max=undefined, fig=17) {
        super(value, false, false, unsafed, unsigned, min, max, fig);
        // https://developer.mozilla.org/ja/docs/Web/JavaScript/Reference/Global_Objects/Number/toFixed
        if (!(Number.isSafeInteger(fig) && 0<=fig && fig<=100)) {throw new TypeError(`figは0〜100の整数値であるべきです。`)}
        if (17 < fig) {console.warn(`figが精度保証外です。JavaScriptのNumber型はIEEE 754の倍精度(64bit)浮動小数点数のため、少数部分は十進数で17桁までの精度しかありません。指定されたfigは17を超えているため、17桁以降の数が変更されてもnealyEqual(x,y)による比較は必ず真を返してしまいます。:fig:${fig}`)}


    }
    nearlyEqual(x, y) {// 等号===の代替。JSのNumber型は64bit浮動少数点数であり比較等号===では完全一致確認できない（console.assert(0.3===0.1+0.2）でエラーになる）これをいくらか解決する。但し15桁の少数まで。
        if (parseInt(x) !== parseInt(y)) {return false}
        const T = parseInt(Math.abs(x + y));
        const tolerance = T < 1 ? Number.EPSILON : Number.EPSILON * T;
        return Math.abs(x - y) < tolerance;
    }
    get fig() {return this._.fig}
    toFixed(fig) {return super.toFixed(fig ?? this._.fig)}
}
*/
class Float extends Quantity {// NaN,Infinityを制限した有限数
    static validate(value, unsafed=false, unsigned=false, min=undefined, max=undefined) {
        return Quantity.validate(value, false, false, unsafed, unsigned, min, max);
    }
    constructor(value, unsafed=false, unsigned=false, min=undefined, max=undefined) {
        super(value, false, false, unsafed, unsigned, min, max);
    }
    validate(v) {return Float.validate(v ?? this.value, this._.unsafed, this._.unsigned, this._.min, this._.max);}
    nearlyEqual(x, y) {// 等号===の代替。JSのNumber型は64bit浮動少数点数であり比較等号===では完全一致確認できない（console.assert(0.3===0.1+0.2）でエラーになる）これをいくらか解決する。但し15桁の少数まで。
        if (parseInt(x) !== parseInt(y)) {return false}
        const T = parseInt(Math.abs(x + y));
        const tolerance = T < 1 ? Number.EPSILON : Number.EPSILON * T;
        return Math.abs(x - y) < tolerance;
    }
}
class Rate extends Float { constructor(value) {super(value, false, true, 0, 1)} }// 比率(0〜1の実数)
class Percent extends Float { constructor(value) {super(value, false, true, 0, 100)} }// 百分率(0〜100の実数)
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
class DecimalNumber extends Float {// 十進数における整数と少数を合わせて15桁までの有限数(IEEE754において整数部は15桁までが正確に表現できる上限)
    //static validate(value, unsigned=false, min=undefined, max=undefined, fig=0) {
    static validate(value, fig=0, unsigned=false, min=undefined, max=undefined) {
        //return Quantity.validate(value, false, false, false, unsigned, min, max, fig);
        return {...Float.validate(value, false, unsigned, min, max), fig:fig};
    }
    static get MIN_FIG() {return 0}
    static get MAX_FIG() {return 15}
    /*
    static to(v, fig=DecimalNumber.MIN_FIG) {
        const D = Math.pow(10, fig);
        const I = Math.trunc(v);
        const d = Math.trunc(v * D);
        this._.I = I;
        this._.F = parseInt(d.slice(I.toString().length));
        this._.S = `${this._.I}.${this._.F}`; // 整数部, 少数部それぞれに対してのゼロ埋めやスペース埋めをどうするか
        this._.N = parseFloat(this._.S); // d / D
        return DecimalNumber(v, );
    }
    */
    //constructor(value, unsafed=false, unsigned=false, min=undefined, max=undefined, fig=0) {
    constructor(value, fig=0, unsafed=false, unsigned=false, min=undefined, max=undefined) {
        //super(value, false, false, unsafed, unsigned, min, max, fig);
        super(value, fig, false, unsigned, min, max);
//        if (DecimalNumber.MAX_FIG < fig) {throw new RangeError(`figは15以下であるべきです。:${fig}`)}
        this.#validFig(fig);
        this._.fig = {i:DecimalNumber.MAX_FIG-fig, f:fig} // 整数部/少数部の桁数
        this._.pad = {i:{char:'0',fig:'max/min/任意値'}, f:{char:'0',fig:'max/min/任意値'}} // 文字列表現するときの桁数と埋める字
        this._.I = null;// 整数部; Number型としての整数
        this._.F = null;// 少数部;  Number型としての整数
        this._.S = null;// 文字列型としての表現;(ゼロ埋めせず最短表現)
        this._.T = null;// Sをpadの指定で整形した文字列(15桁全部ゼロで埋めた最長表現)
        this._.N = null;// Number型としての実数;
        this.#roundedFloat(value, fig);
    }
    #validFig(fig) {if(!(Number.isSafeInteger(fig) && DecimalNumber.MIN_FIG<=fig && fig<=DecimalNumber.MAX_FIG)){throw new TypeError(`figは${DecimalNumber.MIN_FIG}〜${DecimalNumber.MAX_FIG}の整数値であるべきです。:${fig}`)}}
    #roundedFloat(v, fig=0) {// v:Number型実数
        //const D = Math.pow(10, fig);
        const D = Math.pow(10, this._.fig);
        const I = Math.trunc(v);
        const d = Math.trunc(v * D);
        this._.I = I;
        this._.F = I===d ? 0 : parseInt(d.toString().slice(I.toString().length));
        this._.S = `${this._.I}.${this._.F}`; // 整数部, 少数部それぞれに対してのゼロ埋めやスペース埋めをどうするか
        this._.N = parseFloat(this._.S); // d / D
    }
    valueOf() {return this._.N}
    //get step() {return Number(Math.pow(0.1, this._.fig).toFixed(this._.fig));}
    //get step() {return Number(0===this._.fig.f ? '0' : `0.${'0'.repeat(this._.fig.f-1)}1`);}
    get step() {return new DecimalNumber(0===this._.fig.f ? '0' : `0.${'0'.repeat(this._.fig.f-1)}1`, this._.fig.f);}
    get #MaxStr() {return '9'.repeat(this._.fig.i)}
    #getMaxInt(isN) {return 0===this._.fig.i ? 0 : parseInt((isN ? '-' : '')+this.#MaxStr)}
    get MinInt() {return this.#getMaxInt(true);}
    get MaxInt() {return this.#getMaxInt();}
//    get MinInt() {return 0===this._.fig.i ? 0 : parseInt('-'+this.#MaxStr)}
//    get MaxInt() {return 0===this._.fig.i ? 0 : parseInt(this.#MaxStr)}
    toPad(options={}) {// {fig:{i:0,f:0},pad:{i:'0',f:'0'}}, 0000009999.99000, 9999.99, 9999.990000, 0000009999.99 9999 0.99
        const o = {fig:{...this._.fig}, pad:{...this._.pad}, ...options}
        'i f'.split(' ').map(n=>this.#validFig(o.fig[n]));
//        this.#validFig(o.fig.i); this.#validFig(o.fig.f);
        return `${this._.I.toString().padStart(o.fig.i, o.pad.i)}.${this._.F.toString().padEnd(o.fig.f, o.pad.f)}`;
    }
    get toLongest() {return this._.S}
    get toShortest() {return this.toPad({fig:{i:0,f:0},pad:{i:'0',f:'0'}})}
    /*
    toPad(i, f) {// 0000009999.99000, 9999.99, 9999.990000, 0000009999.99
        isInt(i, 'i'); isInt(f, 'f');
//        const I = i < this._.fig.i ? DecimalNumber.MIN_FIG : (this._.fig.i < i ? DecimalNumber.MAX_FIG : i);
        const I = i < this._.fig.i || this._.fig.i < i ? this._.fig.i : i;
        const F = f < this._.fig.f || this._.fig.f < f ? this._.fig.f : f;
        padStart(i, this._.fig.char);
    }
    */
    /*
    add(i,f){}
    sub(i,f){}
    mul(i,f){}
    div(i,f){}
    add(i=0, f=0){
        
    }
    */
}

class AllInteger extends Quantity {
    static validate(value, unsafed=false, unsigned=false, bit=0, min=undefined, max=undefined) {
        if (unsafed && bit) {// 論理矛盾を解消する
            console.warn(`unsafed=trueなら範囲制限なしになります。つまり、bit=0,min=undefined,max=undefinedになります。`)
            min = undefined;
            max = undefined;
        }
        //return {...Quantity.validate(value, false, false, unsafed, unsigned, min, max, 0), ...this.validateMinMax(unsafed, unsigned, bit, min, max)};
        return {...Quantity.validate(value, false, false, unsafed, unsigned, min, max), ...this.validateMinMax(unsafed, unsigned, bit, min, max)};
    }
    static validateMinMax(unsafed, unsigned, bit, min, max) {
        const [MIN, MAX] = getIntRange(unsafed, unsigned, bit, min, max);
        // unsafed/unsigned/bit と min/max が矛盾しないこと
        validRange(MIN, min, 'min');
        validRange(MAX, max, 'max');
        return {min:MIN, max:MAX};
    }
    constructor(value, unsafed=false, unsigned=false, bit=0, min=undefined, max=undefined) {
        super(value);
        //this._ = {...Integer.validate(value, unsafed, unsigned, bit, min, max)};
        this._ = Integer.validate(value, unsafed, unsigned, bit, min, max);

    }
    get bit() {return this._.bit}
    validate(v) {return AllInteger.validate(v ?? this.value, this._.unsafed, this._.unsigned, this._.bit, this._.min, this._.max);}
}
// LazyInteger
class FuzzyInteger extends AllInteger {
    static validate(value) { return AllInteger.validate(value, true, true, 0, undefined, undefined); }
    constructor(value) { super(value, true, true, 0, undefined, undefined); }
    validate(v) {return FuzzyInteger.validate(v ?? this.value);}
}
class Integer extends AllInteger {
    static validate(value, unsigned=false, bit=0, min=undefined, max=undefined) {
        if (!Number.isSafeInteger(value)) {throw new TypeError(`valueはNumber.isSafeInteger()で真を返す値のみ有効です。:${value}`)}
        return {...Quantity.validate(value, false, false, false, unsigned, min, max, 0), ...this.validateMinMax(unsigned, bit, min, max)};
    }
    static validateMinMax(unsigned, bit, min, max) {return AllInteger.validateMinMax(false, unsigned, bit, min, max);}
    constructor(value, unsigned=false, bit=0, min=undefined, max=undefined) {
        super(value, false, unsigned, bit, min, max);
        this._ = Integer.validate(value, false, unsigned, bit, min, max);
        console.log(this._);
    }
    validate(v) {return Integer.validate(v ?? this.value, this._.unsigned, this._.bit, this._.min, this._.max);}
}
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
            //if (!isObj(options[k])) { options[k] = {value:v}; v = {value:v}; }
            if (!isObj(options[k])) { // {value:'', type:String}ではなく直接value値をセットした場合
                /*
                if ('number'===typeof v && !Number.isSafeInteger(v)) {throw new TypeError(`Number型リテラル値を直接指定した時は{value:Integer(999)}等の省略形と見做します。しかし指定された値は非Integer値でした。:${v}\nNumber.isSafeInteger()が真を返す範囲内か、少数値でないか等を確認してください。\n少数を使用するなら{weight:Float(62.1)}のように書いてください。`);}
                else {

                }
                */
                //if ('number'===typeof v && [Float,Integer].some(t=>t===v.constructor)) {
                    /*
                if ('number'===typeof v) {
                    if (Number.isSafeInteger(v)) {
                        const V = new Integer(v);
                        options[k] = {value:V}; v = {value:V};
                    } else {
                        throw new TypeError(`Number型リテラル値を直接指定した時は{value:Integer(999)}等の省略形と見做します。しかし指定された値は非Integer値でした。:${v}\nNumber.isSafeInteger()が真を返す範囲内か、少数値でないか等を確認してください。\n少数を使用するなら{weight:Float(62.1)}のように書いてください。`);
                    }
                } else {
                    // 真偽値(true/false), BigInt(1n), String('a'), null, undefined, Symbol, {k:'v'}, ['v'], new Map([['k','v']]), 等
//                    const V = ('number'===typeof v && !Number.isNaN(v) && Number.isFinite(v)) ? new Float(v) : v;
//                    console.log(V);
//                    options[k] = {value:V}; v = {value:V};
                    options[k] = {value:v}; v = {value:v};
                }
                */
                /*
                if ('number'===typeof v) {
                    if (Number.isSafeInteger(v)) {
                        this._.primIns[k] = new Integer(v);
                        this._.primIns[k].validate();
                        const V = this._.primIns[k].valueOf();
                        iOpt[k] = {value:V}; v = {value:V};
                    } else {
                        throw new TypeError(`Number型リテラル値を直接指定した時は{value:Integer(999)}等の省略形と見做します。しかし指定された値は非Integer値でした。:${v}\nNumber.isSafeInteger()が真を返す範囲内か、少数値でないか等を確認してください。\n少数を使用するなら{weight:Float(62.1)}のように書いてください。`);
                    }
                } else { // null, undefined, Symbol, Boolean(true/false), BigInt(1n), String('a'), {k:'v'}, ['v'], new Map([['k','v']]), 等
                    iOpt[k] = {value:v}; v = {value:v};
                }
                */
                if (!isObj(options[k])) { // {value:'', type:String}ではなく直接value値をセットした場合
                    if ('number'===typeof v) {
                        if (Number.isSafeInteger(v)) {
                            this._.primIns[k] = new Integer(v); // {name:0} => {name:new Integer(0)} と見做す
                            this._.primIns[k].validate();
                            const V = this._.primIns[k].valueOf();
                            options[k] = {value:V}; v = {value:V};
                        } else {
                            throw new TypeError(`Number型リテラル値を直接指定した時は{value:Integer(999)}等の省略形と見做します。しかし指定された値は非Integer値でした。:${v}\nNumber.isSafeInteger()が真を返す範囲内か、少数値でないか等を確認してください。\n少数を使用するなら{weight:Float(62.1)}のように書いてください。`);
                        }
                    } else { options[k] = {value:v}; v = {value:v}; }// null, undefined, Symbol, Boolean(true/false), BigInt(1n), String('a'), {k:'v'}, ['v'], new Map([['k','v']]), 等
                }

                /*
                //const V = ('number'===typeof options[k] && !Number.isNaN(options[k]) && Number.isFinite(options[k])) ? new Float(v) : v;
                const V = ('number'===typeof v && !Number.isNaN(v) && Number.isFinite(v)) ? new Float(v) : v;
                console.log(V);
                options[k] = {value:V}; v = {value:V};
                */
                /*
                if ('number'===typeof && !Number.isNaN(options[k]) && Number.isFinite(options[k])) {
                    const F = new Float(v);
                    options[k] = {value:F}; v = {value:F};
                } else {options[k] = {value:v}; v = {value:v};}
                if (isNun(options[k])) {}
                options[k] = {value:v}; v = {value:v};
                */
            }
            if (options[k].hasOwnProperty('value') && options[k].value instanceof ObservedProperties) {continue}
//            console.log(k, v);
            if (!options[k].hasOwnProperty('value') && !options[k].hasOwnProperty('type')) {throw TypeError('valueとtypeは少なくともいずれか一つ必要です。')}
            else if (options[k].hasOwnProperty('value') && !options[k].hasOwnProperty('type')) {
                options[k].type = Typed.getTypeFromValue(options[k].value);
            }
            else if (!options[k].hasOwnProperty('value') && options[k].hasOwnProperty('type')) {
                options[k].value = Typed.defaultValue(options[k].type);
            }
            // プリミティブ型インスタンスだった場合
//            console.log('isPrimIns(v.value):', isPrimIns(v.value), v);
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
//        console.log(this);
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
            /*
            //if (!isObj(iOpt[k])) { iOpt[k] = {value:v}; v = {value:v}; }
            if (!isObj(iOpt[k])) {
                iOpt[k] = {value:v}; v = {value:v};
            }
            if (!isObj(iOpt[k])) { // {value:'', type:String}ではなく直接value値をセットした場合
                const V = ('number'===typeof v && !Number.isNaN(v) && Number.isFinite(v)) ? new Float(v) : v;
                iOpt[k] = {value:V}; v = {value:V};
            }
            */
            if (!isObj(iOpt[k])) { // {value:'', type:String}ではなく直接value値をセットした場合
                if ('number'===typeof v) {
                    if (Number.isSafeInteger(v)) {
                        //const V = new Integer(v);
                        //iOpt[k] = {value:V}; v = {value:V};
                        this._.primIns[k] = new Integer(v);
                        this._.primIns[k].validate();
                        const V = this._.primIns[k].valueOf();
                        iOpt[k] = {value:V}; v = {value:V};
                    } else {
                        throw new TypeError(`Number型リテラル値を直接指定した時は{value:Integer(999)}等の省略形と見做します。しかし指定された値は非Integer値でした。:${v}\nNumber.isSafeInteger()が真を返す範囲内か、少数値でないか等を確認してください。\n少数を使用するなら{weight:Float(62.1)}のように書いてください。`);
                    }
                } else { iOpt[k] = {value:v}; v = {value:v}; }// null, undefined, Symbol, Boolean(true/false), BigInt(1n), String('a'), {k:'v'}, ['v'], new Map([['k','v']]), 等
            }
            if (iOpt.hasOwnProperty('value') && iOpt.value instanceof ObservedProperties) {continue}
//            console.log(k, v);
            if (!v.hasOwnProperty('value') && !v.hasOwnProperty('type')) {throw TypeError('valueとtypeは少なくともいずれか一つ必要です。')}
            else if (v.hasOwnProperty('value') && !v.hasOwnProperty('type')) {
                iOpt[k].type = Typed.getTypeFromValue(v.value);
            }
            else if (!v.hasOwnProperty('value') && v.hasOwnProperty('type')) {
                iOpt[k].value = Typed.defaultValue(v.type);
            }
            // プリミティブ型インスタンスだった場合
            //if (isPrimIns(v)) {this._.primIns[k] = v; options[k].value = v.valueOf();}
            if (isPrimIns(v.value)) {this._.primIns[k] = v.value; iOpt[k].value = v.value.valueOf();}
        }
        this._.opt = iOpt;
//        console.error(this._.opt);
    }
    #makeDescriptor(k, v) {
        this._.prop[k] = undefined;
        const isObs = (v instanceof ObservedProperties);
        const desc = {
            configurable: false,
            enumerable: true,
            get: ()=>this._.prop[k],
            set: (V)=>{
//                console.log(this, this._.opt[k].type);
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
            console.log(v, v.value);
            Typed.valid(this._.opt[k].type, v.value);
        }
        this._.prop[k] = v.value;
        Object.defineProperty(this, k, desc);
    }
    #makeProxy() { return new Proxy(this, {
        get: (target, prop, receiver)=>{
            if ('_isProxy'===prop) {return true}
            else if ('_'===prop) {return structuredClone(this._.primIns)}
            else if ('$'===prop) {return this._.oOpt;}
            else if ('setup'===prop) {return this.setup.bind(this);}
            else {
                if (!(prop in this._.prop)) {throw new SyntaxError(`未定義のプロパティを参照しました。:${prop}`)}
                return this._.prop[prop];
            }
        },
        set: (target, prop, value, receiver)=>{
//            console.log(target._.prop, this._.prop, target, this);
            if (!(prop in target._.prop)) {throw new SyntaxError(`未定義のプロパティに代入しました。:${prop}`)}
            // ToDo: 型、妥当性チェック
//            Typed.valid(target._.opt[prop].type, value);
            // 独自プリミティブ型インスタンスだった場合(Int,Float)
            if (prop in this._.primIns) {this._.primIns[prop].validate(value)}
            else {Typed.valid(target._.opt[prop].type, value);}
//            if (isPrimIns(value) && 'validate' in value) {this._.primIns[k].validate(value);}
            const oldValue = target._.prop[prop];
            target._.prop[prop] = value;
            if (prop in target._.onSet) {target._.onSet[prop](value, oldValue);}
            if (prop in target._.onChange && value!==oldValue) {target._.onChange[prop](value, oldValue);}
            target._.update();
        },
    });}
    setup(values) {// values:{name:value, name:value, ...}
        for (let [k, v] of Object.entries(values)) {
//            console.log(this._.prop);
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
//            if (k in this._.primIns) {this._.primIns[k] = new this._.primIns[k].new(v)}
            if (k in this._.primIns) {this._.primIns[k].value = v}
        }
        return this.#update();
    }
    #update() {
        if ('function'===typeof this._.update) {return this._.update(structuredClone(this._.prop), this._.oOpt);}
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
//        console.log(type, value);
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
//        console.log(type, value, Number===type, 'number'!==typeof value, typeof value);
        if ((Boolean===type && 'boolean'!==typeof value)
        || (Number===type && 'number'!==typeof value)
        || (BigInt===type && 'bigint'!==typeof value)
        || (String===type && 'string'!==typeof value)
        || (Symbol===type && 'symbol'!==typeof value)) { throw new TypeError(`'${value}'は期待する${type.name}型ではありません。`) } // プリミティブ型
        //else {// オブジェクト型
        else if ('object'===typeof value) {// オブジェクト型
            console.log(value, typeof value);
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
//        console.log([...Object.keys(target)]);
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
