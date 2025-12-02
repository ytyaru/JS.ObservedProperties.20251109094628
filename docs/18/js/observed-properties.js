(function(){
const isObj = (v)=>null!==v && 'object'===typeof v && '[object Object]'===Object.prototype.toString.call(v),
    isInf = (v)=>[Infinity,-Infinity].some(x=>x===v),
    isNanInf = (value,naned,infinited)=>{
        if (Number.isNaN(value) && !naned) {throw new TypeError(`naned=falseなのにvalue=NaNです。`)}
        if ([Infinity,-Infinity].some(v=>v===value) && !infinited) {throw new TypeError(`infinited=falseなのにvalue=${value}です。`)}
        return true;
    }
    getFIError = (v,n,isI=false)=>new TypeError(`${n}はNumber型有限${isI ? '整' : '実'}数リテラル値(非NaN)であるべきです。:${v}`),
    isNum = (v)=>'number'===typeof v || !Number.isNaN(v);
    isFloat = (v,n)=>{if (!isNum(v) || !Number.isFinite(v)) {throw getFIError(v,n)} return true;},
    isInt = (v,n)=>{if (!isNum(v) || !Number.isInteger(v)) {throw getFIError(v,n,true)} return true;},
    isBool = (v,n)=>{if ('boolean'!==typeof v) {throw new TypeError(`${n}は真偽値であるべきです。:${v}`)}}
    validRange = (infinited, expected, actual, name)=>{
        if (Number.isNaN(actual)) {throw new TypeError(`min/maxにNaNは設定できません。`)}
        if ([Infinity,-Infinity].some(v=>v===actual) && !infinited) {throw new TypeError(`infinited=falseなのにvalue=${actual}です。`)}
        if (!'min max'.split(' ').some(v=>v===name)) {throw new TypeError('nameはminかmaxのみ有効です。')}
        const isOver = 'min'===name ? actual < expected : expected < actual;
        if (isOver) {throw new RangeError(`${name}はunsigned,bitで設定した範囲より${'min'===name ? '小さい' : '大きい'}です。範囲内に指定してください。:expected:${expected}, actual:${actual}`)}
    },
    getNumRange = (infinited, unsafed, unsigned, min, max)=>{
        const [MIN, MAX] = [(unsigned ? 0 : infinited ? -Infinity : (unsafed ? -Number.MAX_VALUE : Number.MIN_SAFE_INTEGER)),
                            infinited ? Infinity : (unsafed ? Number.MAX_VALUE : Number.MAX_SAFE_INTEGER)];
        return [(min && MIN<=min ? min : MIN), (max && min<=MAX ? max : MAX)];
    },
    getIntRange = (unsafed, unsigned, bit, min, max)=>{
        const m = [(unsafed ? (unsigned ? 0 : -Number.MAX_VALUE) : (unsigned ? 0 : (0===bit ? Number.MIN_SAFE_INTEGER : -(2**bit)/2))), (unsafed ? Number.MAX_VALUE : (unsigned ? (0===bit ? Number.MAX_SAFE_INTEGER : (2**bit)-1) : (0===bit ? Number.MAX_SAFE_INTEGER : ((2**bit)/2)-1)))];
        console.log('getIntRange:', unsafed, unsigned, bit, min, max, m);
        if (0 < bit && undefined!==min && min < m[0]) {throw new RangeError(`minがunsafed,unsigned,bitで指定した範囲外です。min:${min},unsafed:${unsafed},unsigned:${unsigned},bit:${bit} = ${m[0]}`)}
        if (0 < bit && undefined!==max && m[1] < max) {throw new RangeError(`maxがunsafed,unsigned,bitで指定した範囲外です。max:${max},unsafed:${unsafed},unsigned:${unsigned},bit:${bit} = ${m[1]}`)}
        return [undefined===min ? m[0] : min, undefined===max ? m[1] : max];
    }
    validMinMax = (min, max)=>{if(max <= min){throw new RangeError(`minとmaxが不正です。両者は異なる値にしつつ大小関係を名前と一致させてください。:${min},${max}`)}},
    isSafeNum = (v)=>(v < Number.MIN_SAFE_INTEGER || Number.MAX_SAFE_INTEGER < v),
    isNu = (v)=>[null,undefined].some(V=>V===v),
    isNun = (v)=>[null,undefined].some(V=>V===v) || Number.isNaN(v),
    // プリミティブ値か(undefined,null,NaN,-+Infinityを除く。数値,文字列,論理値,配列,オブジェクト,BigInt,正規表現(/[a-z]/等の表現があるが実際はRegExpｲﾝｽﾀﾝｽ故除外))
    isPrim = (v)=>null!==value && 'object'!==typeof v, // nullやundefinedもプリミティブ値だがそれらは除外する
    primTypes = ()=>[Boolean,Number,BigInt,String,Integer,Float], // プリミティブ型一覧(undefined,null,symbolを除く)
    isPrimIns = (v)=>primTypes().some(T=>v instanceof T); // プリミティブ型インスタンスか
    sameArys = (x,y)=>[x,y].every(v=>Array.isArray(v)) && x.length===y.length && x.every(v=>v===y); // 二つの配列の内容が順序も含めて同一か

class VarAssignable {// 変数への代入可能性。型を定義するのに用いる。
    static #MEMBERS = 'undefindable nullable nanable infinitable mutable'.split(' ');
    static get MEMBERS() {return this.#MEMBERS}
    static get #OPTIONS() {return this.MEMBERS.reduce((o,k)=>o[k]=false)};
    static isMember(name) {return this.MEMBER.some(n=>n===name)}
    constructor(options) { this.#initOptions(options); }
    #initOptions(options) {
        const D = VarAssignable.#OPTIONS;
        for (let k of Object.keys(options)) {if (!VarAssignable.isMember(k)) {console.warn(`不正なメンバのため削除しました。:${k}`); delete options[k];}}
        this._ = {...D, ...options};
    }
}
// ()
// (value)
// (options)
// (value, options)
// (value, naned, ...)
class QuantityArgs {
    static get #NAMES() {return 'value naned infinited unsafed unsigned min max'.split(' '); }
    static get #defaultOptions() { return {
        value: 0,
        naned: false,
        infinited: false,
        unsafed: undefined,
        unsigned: false,
        min: undefined,
        max: undefined,
    } }
    static argsPattern(...args) {
        if (0===args.length) { return this.#defaultOptions }
        else if (1===args.length) {
            const o = Array.isArray(args[0]) ? ({
                value: 0<args.length && !isObj(args[0]) ? args[0] : 0,
                naned: 1<args.length && !isObj(args[1]) ? args[1] : false,
                infinited: 2<args.length ? args[2] : false,
                unsafed: 3<args.length ? args[3] : undefined,
                unsigned: 4<args.length ? args[4] : false,
                min: 5<args.length ? args[5] : undefined,
                max: 6<args.length ? args[6] : undefined,
            }) : (isObj(args[0]) ? args[0] : ({value:args[0]}));
            const d = this.#defaultOptions
            const p = {...d, ...o}; // バグ 
            const q = Object.assign({}, d, o);
            return p;
        }
        else if (2===args.length) {
            if (isObj(args[1])) {return {...this.#defaultOptions, ...args[1], value:args[0]} }
            else {return {...this.#defaultOptions, value:args[0], naned:args[1]} }
        }
        else if (2===args.length) {return ( {...this.#defaultOptions, ...(isObj(args[1]) ? ({...args[1], value:args[0]}) : ({value:args[0], naned:args[1]})) })}
        else if (args.length <= this.#NAMES.length) { return {...this.#defaultOptions, ...(args.reduce((o,v,i)=>{o[this.#NAMES[i]]=v;return o;}, {}))}}
        else {throw new TypeError(`引数の形式が不正です。${this.#NAMES}の順に渡すか、それらをキーとして持つオブジェクトを渡してください。`)}
    }
}
// JavaScriptは数をNumber型で扱うが、これは64bitメモリであり、かつIEEE754の倍精度浮動小数点数で実装されている。このため十進数表示において、整数は15桁まで、少数は17桁までは正確に表現できるが、それ以上の桁になると正確に表現できず、比較式も不正確な結果を返してしまう。しかもそれを正常とし、エラーを発生させない。
class Quantity extends Number {// 数量:NaN,Infinityを制限できるし許容もできるがNumberのように同居はしない
    static validate(...args) {// value, naned=false, infinited=false, unsafed=false, unsigned=false, min=undefined, max=undefined
        const o = QuantityArgs.argsPattern(...args);
        if (o.infinited) {
            if ('boolean'!==typeof o.unsafed) {console.warn(`infinited=trueでunsafedが未設定か非booleanのためunsafed=trueに強制します。`); o.unsafed=true;}
            else if (false===o.unsafed) {throw new TypeError(`論理矛盾です。infinited=trueなのにunsafed=falseです。infinitedとunsafedはそれ以外の組合せT/F,F/T,F/Fのいずれかにすべきです。`);}
        } else {o.unsafed = o.unsafed ?? false;}
        isBool(o.naned, 'naned');
        isBool(o.infinited, 'infinited');
        isBool(o.unsafed, 'unsafed');
        isBool(o.unsigned, 'unsigned');
        // 論理矛盾を解消する（infinited:trueならunsafed:trueになるはず。無限値は入るのに範囲は安全圏のみは不自然だから。でも、そうしたい場合もありそう）
        isNanInf(o.value, o.naned, o.infinited);
        if (!isNu(o.min)) {isNanInf(o.min, o.naned, o.infinited);}
        if (!isNu(o.max)) {isNanInf(o.max, o.naned, o.infinited);}
        // 整合性(!Number.isSafeInteger(value)だと整数でなく少数が入った時に必ずエラーに成ってしまう。IsSafe()関数があれば良かったのに存在しない……)
        if(!o.unsafed && (o.value < Number.MIN_SAFE_INTEGER || Number.MAX_SAFE_INTEGER < o.value)) {throw new TypeError(`非安全な整数値は許可されておらず代入できません。unsafed=trueにしてください。`)}
        const [MIN, MAX] = getNumRange(o.infinited, o.unsafed, o.unsigned, o.min, o.max);
        // unsafed/unsigned/bit と min/max が矛盾しないこと
        validRange(o.infinited, MIN, o.min, 'min');
        validRange(o.infinited, MAX, o.max, 'max');
        if (undefined===o.min) {o.min=MIN}
        if (undefined===o.max) {o.max=MAX}
        validMinMax(o.min, o.max);
        if (!Number.isNaN(o.value) && (o.value < o.min || o.max < o.value)) {throw new RangeError(`valueがmin〜maxの範囲を超過しています。:value:${o.value}, min:${o.min}, max:${o.max}`)}
        return o;
    }
    constructor(...args) {//value, naned=false, infinited=false, unsafed=false, unsigned=false, min=undefined, max=undefined
        const o = Quantity.validate(...args);
        super(o.value);
        this._ = o;
        if (undefined===this._.value) {this._.value=0}
    }
    validate(v) {return Quantity.validate(v ?? this.valueOf(), this._.naned, this._.infinited, this._.unsafed, this._.unsigned, this._.min, this._.max);}
    valueOf() {return this.value}
    get value() {return this._.value}
    set value(v) {
        Quantity.validate(v, this._.naned, this._.infinited, this._.unsafed, this._.unsigned, this._.min, this._.max);
        this._.value = v;
    }
    get naned() {return this._.naned}
    get infinited() {return this._.infinited}
    get unsafed() {return this._.unsafed}
    get unsigned() {return this._.unsigned}
    get min() {return this._.min}
    get max() {return this._.max}
}
class AllFinite extends Quantity {// 有限数(非NaN,非Infinity)
    constructor(...args) {// value, unsafed, unsigned, min, max    naned=false, infinited=falseな型である
        const o = ((1<=args.length && isObj(args[0])) ? args[0] : ((2<=args.length && isObj(args[1])) ? args[1] : ({})));
        if (o.naned) {throw new TypeError(`nanedはtrueにできません。Quantity型で再試行してください。`)}
        if (o.infinited) {throw new TypeError(`infinitedはtrueにできません。Quantity型で再試行してください。`)}
        const d = {
            value: 0<args.length && !isObj(args[0]) ? args[0] : 0,
            naned: false,
            infinited: false,
            unsafed: 1<args.length && !isObj(args[1]) ? args[1] : undefined,
            unsigned: 2<args.length ? args[2] : false,
            min: 3<args.length ? args[3] : undefined,
            max: 4<args.length ? args[4] : undefined,
        };
        const p = (0 < [...Object.keys(o)].length) ? ({...d, ...o}) : d;
        super(p);
    }
}
class UnsafedFinite extends AllFinite {// 危険(Number.M(IN|AX)_SAFE_INTEGER範囲外を許容する)な有限数(非NaN,非Infinity)
    constructor(...args) {
        const o = ((1<=args.length && isObj(args[0])) ? args[0] : ((2<=args.length && isObj(args[1])) ? args[1] : ({})));
        if (o.naned) {throw new TypeError(`nanedはtrueにできません。Quantity型で再試行してください。`)}
        if (o.infinited) {throw new TypeError(`infinitedはtrueにできません。Quantity型で再試行してください。`)}
        if (false===o.unsafed) {throw new TypeError(`unsafedはfalseにできません。Quantity/AllFinite/Finite型で再試行してください。`)}
        const d = {
            value: 0<args.length && !isObj(args[0]) ? args[0] : 0,
            naned: false,
            infinited: false,
            unsafed: true,
            unsigned: 1<args.length && !isObj(args[1]) ? args[1] : false,
            min: 2<args.length ? args[2] : undefined,
            max: 3<args.length ? args[3] : undefined,
        };
        const p = (0 < [...Object.keys(o)].length) ? ({...d, ...o}) : d;
        super(p);
    }
}
class Finite extends AllFinite {// 安全(Number.M(IN|AX)_SAFE_INTEGER範囲内)な有限数(非NaN,非Infinity)
    constructor(...args) {// value, unsigned, min, max
        const o = ((1<=args.length && isObj(args[0])) ? args[0] : ((2<=args.length && isObj(args[1])) ? args[1] : ({})));
        if (o.naned) {throw new TypeError(`nanedはtrueにできません。Quantity型で再試行してください。`)}
        if (o.infinited) {throw new TypeError(`infinitedはtrueにできません。Quantity型で再試行してください。`)}
        if (true===o.unsafed) {throw new TypeError(`unsafedはtrueにできません。Quantity/AllFinite/UnsafedFinite型で再試行してください。`)}
        const d = {
            value: 0<args.length && !isObj(args[0]) ? args[0] : 0,
            naned: false,
            infinited: false,
            unsafed: false,
            unsigned: 1<args.length && !isObj(args[1]) ? args[1] : false,
            min: 2<args.length ? args[2] : undefined,
            max: 3<args.length ? args[3] : undefined,
        };
        const p = (0 < [...Object.keys(o)].length) ? ({...d, ...o}) : d;
        super(p);
    }
}
class AllFloat extends Finite {// IEEE倍精度浮動小数点数かつNaN,Infinityを除き安全な有限数のみ。
    static validate(value, unsafed=false, unsigned=false, min=undefined, max=undefined) {
        return Quantity.validate(value, false, false, unsafed, unsigned, min, max);
    }
    static nearlyEqual(...args) {// 等号===の代替。JSのNumber型は64bit浮動少数点数であり比較等号===では完全一致確認できない（console.assert(0.3===0.1+0.2）でエラーになる）これをいくらか解決する。但し15桁の少数まで。console.assert(nearlyEqual(0.3, 0.1+0.2))でエラーにならない。
        if (args.length < 2) {throw new TypeError(`引数は比較する数を2個以上渡してください。`)}
        if (!args.every(v=>'number'===typeof v)) {throw new TypeError(`引数値は全てNumberプリミティブ値であるべきです。`)}
        const F = args[0];
        const S = args.slice(1);
        const R = [];
        for (let v of S) {
            if (![F,v].every(x=>Number.isFinite(x))) {return [F,v].every(v=>Number.isNaN(v)) || x===y; }// F,v少なくとも１つがNaN/Infinity/-Infinityのいずれか
            if (parseInt(F) !== parseInt(v)) {return false}
            const T = parseInt(Math.abs(F + v));
            const tolerance = T < 1 ? Number.EPSILON : Number.EPSILON * T;
            R.push(Math.abs(F - v) < tolerance);
        }
        return R.every(r=>r);
    }
    static eq(...args) {return this.nearlyEqual(...args)}
    constructor(...args) {super(...args)}
    validate(v) {return Float.validate(v ?? this.value, this._.unsafed, this._.unsigned, this._.min, this._.max);}
    nearlyEqual(...args) { return Float.nearlyEqual([this.value, ...args]); }// 等号===の代替。JSのNumber型は64bit浮動少数点数であり比較等号===では完全一致確認できない（console.assert(0.3===0.1+0.2）でエラーになる）これをいくらか解決する。但し15桁の少数まで。console.assert(nearlyEqual(0.3, 0.1+0.2))でエラーにならない。
    eq(...args) {return this.nearlyEqual(...args)}
    // get/setは二つで一つなのでsetしか変更せずともgetも再定義する必要がある。じつに不便かつ分かり難い言語仕様。
    get value() {return super.value}
    set value(v) {
        super.value = v;
        // min, maxと同じ値の時だけは等号===比較できるよう同一値をセットして誤差による比較失敗を避ける。nearlyEqualの使用をせずとも成功させる。
        if (this._.min) { this.#setNearlyValue(this._.min); }
        if (this._.max) { this.#setNearlyValue(this._.max); }
        this.validate(v);
    }
    #setNearlyValue(v) {if (this.nearlyEqual(v, super.value)) {super.value = v}} // ほぼ同じ値ならピッタリの値をセットする。等号===比較できるように。
}

class Float extends AllFloat {
    constructor(...args) {// value, min, max
        const o = ((1<=args.length && isObj(args[0])) ? args[0] : ((2<=args.length && isObj(args[1])) ? args[1] : ({})));
        if (o.naned) {throw new TypeError(`nanedはtrueにできません。Quantity型で再試行してください。`)}
        if (o.infinited) {throw new TypeError(`infinitedはtrueにできません。Quantity型で再試行してください。`)}
        if (true===o.unsafed) {throw new TypeError(`unsafedはtrueにできません。Quantity/AllFinite/UnsafedFinite型で再試行してください。`)}
        if (true===o.unsigned) {throw new TypeError(`unsignedはtrueにできません。Quantity/AllFinite/Finite/UnsafedFinite/AllFloat/UnsignedFloat型で再試行してください。`)}
        const d = {
            value: 0<args.length && !isObj(args[0]) ? args[0] : 0,
            naned: false,
            infinited: false,
            unsafed: false,
            unsigned: false,
            min: 1<args.length && !isObj(args[1]) ? args[1] : undefined,
            max: 2<args.length ? args[2] : undefined,
        };
        const p = (0 < [...Object.keys(o)].length) ? ({...d, ...o}) : d;
        super(p);
    }
}
class UnsignedFloat extends AllFloat {
    constructor(...args) {// value, min=undefined, max=undefined
        const o = ((1<=args.length && isObj(args[0])) ? args[0] : ((2<=args.length && isObj(args[1])) ? args[1] : ({})));
        if (o.naned) {throw new TypeError(`nanedはtrueにできません。Quantity型で再試行してください。`)}
        if (o.infinited) {throw new TypeError(`infinitedはtrueにできません。Quantity型で再試行してください。`)}
        if (true===o.unsafed) {throw new TypeError(`unsafedはtrueにできません。Quantity/AllFinite/UnsafedFinite型で再試行してください。`)}
        if (false===o.unsigned) {throw new TypeError(`unsignedはfalseにできません。Quantity/AllFinite/Finite/UnsafedFinite/AllFloat/Float型で再試行してください。`)}
        const d = {
            value: 0<args.length && !isObj(args[0]) ? args[0] : 0,
            naned: false,
            infinited: false,
            unsafed: false,
            unsigned: true,
            min: 1<args.length && !isObj(args[1]) ? args[1] : undefined,
            max: 2<args.length ? args[2] : undefined,
        };
        const p = (0 < [...Object.keys(o)].length) ? ({...d, ...o}) : d;
        super(p);
    }
}
// 最近接遇数丸め（銀行家丸め。四捨五入時に5の時偶数になるほうへ丸める）
// roundToNearestEven()
// halfEven()
//console.log(Math)
//console.log(Math.prototype)
Math.isOdd = function(v) {return 0!==(v % 2)} // 1===だと -1 が渡された時バグった
Math.isEven = function(v) {return 0===(v % 2)}
Math.halfEven = function(v) {
    const S = v < 0 ? -1 : 1;
    const V = Math.abs(v);
    const I = Math.trunc(V);
    const F = V - I;
    const G = Math.trunc(F * 10); // 少数第一位の整数値(0〜9)
    const [C, T] = [Math.ceil(V), Math.trunc(V)];
    return (5 < G ? C : ((G < 5) ? T : (this.isEven(C) ? C : T))*S); // 少数第一位の整数値が5なら偶数に丸める。他は四捨五入と同じ
}
// 丸め https://qiita.com/k8o/items/fec737cdcc290776a9ac
//      https://qiita.com/y-some/items/27ddb39222d528aef7ac
class NumberRounder {
    static round(radix, fractionDigits=1) {return this.#round('round', radix, fractionDigits);} // 四捨五入
    static halfEven(radix, fractionDigits=1) {return this.#round('halfEven', radix, fractionDigits);} // 最近接偶数丸め（四捨五入の対象が5の時偶数になるようにする）
    static ceil(radix, fractionDigits=1) {return this.#round('ceil', radix, fractionDigits);} // 切り上げ
    static floor(radix, fractionDigits=1) {return this.#round('floor', radix, fractionDigits);} // 切り捨て（負数はより大きい負数になってしまうことがあり単純な切り捨てでない）
    static trunc(radix, fractionDigits=1) {return this.#round('trunc', radix, fractionDigits);} // 切り捨て（負数も単純な切り捨てになる）
    static #round(method, radix, fractionDigits=1) {// 指定した少数桁で丸める（標準APIは少数第一位固定）
        const s = (radix < 0 ? -1 : 1);
        const v = Math.abs(radix);
        return this.#_round(method, v, fractionDigits) * s;
    };
    static #_round(method, radix, fractionDigits=1) { // 指定した桁数で丸めるが負数時ゼロ方向に丸められ-5.5が-6にならず-5になってしまう。（標準APIは少数第一位固定）
        const [mantissa, exponent] = `${radix}e`.split('e');
        const value = Math[method](Number(`${mantissa}e${Number(exponent ?? '') + fractionDigits}`));
        const [calcedMantissa, calcedExponent] = `${value}e`.split('e');
        return Number(`${calcedMantissa}e${Number(calcedExponent ?? '') - fractionDigits}`);
    }
}
class RoundableFloat extends AllFloat {// IEEE754による倍精度浮動小数点数であり誤差はあるが、文字列化した時だけはその誤差を丸める（少数部を整数化して切り捨てた文字を返す）
    static get MIN_FIG() {return 0}
    static get MAX_FIG() {return 15}
    static get METHOD_NAMES() {return 'ceil floor round halfEven trunc'.split(' ')}
    static validFig(fig) {if (Number.isSafeInteger(fig) && fig < RoundableFloat.MIN_FIG || RoundableFloat.MAX_FIG < fig) {throw new TypeError(`figは0〜15の整数値であるべきです。`)}; return true;}// Number型の実装IEEE754倍精度浮動小数点数は十進数で整数部15桁、少数部17桁まで保証される。誤差をなくすため小数部を整数化するから15桁が上限。
    static validMethodName(name) {if ('string'===typeof name && !this.METHOD_NAMES.some(n=>n===name)) {throw new TypeError(`methodName「${name}」は不正です。次のいずれかであるべきです。:${this.METHOD_NAMES}`)}; return true;}
    static validValueFig(valueFigMethod) {
        // Number 1個: [value, fig=0, methodName='round']
        // [N, N]:     [value, fig]
        // [N, S]:     [value, fig=0, methodName=S]
        // [N, N, S]:  [value, fig, methodName]
        // '0.1200':   [parseFloat('0.1200'), '0.1200'.split('.').length]
        // '0.1200 trunc':   [parseFloat('0.1200'), '0.1200'.split('.').length, 'trunc']
        const V = ((v)=>{
            if (Number.isSafeInteger(v)) { return [v, RoundableFloat.MIN_FIG, 'round'] }
            else if (Array.isArray(v) && 2===v.length && v.every(x=>'number'===typeof x)) {
                const T1 = typeof v[1];
                     if ('number'===typeof T1 && this.validFig(v[1])) {return [v[0], v[1], 'round']}
                else if ('string'===typeof T1 && this.validMethodName(v[1])) {return [v[0], RoundedFloat.MIN_FIG, v[1]]}
                else {throw new TypeError(`valueFigMethodが要素二つの配列な時は[value,fig]か[value,method]のいずれかのみ有効です。valueは初期値でNumber型、figは少数部桁数をNumber型で、methodは丸める方法を次の文字列のいずれかで指定します。:${this.METHOD_NAMES}`)}
            }
            else if (Array.isArray(v) && 3===v.length && 'number'===typeof v[0] && this.validFig(v[1]) && this.validMethodName(v[2])) {return v}
            else if ('string'===typeof v) {
                const D = `(\d+\.\d)`;
                const RD = new RegExp(`^${D}$`);
                if (v.match(RD)) {return [parseFloat(v), v.split('.')[1].length]}
                const M = `(${this.METHOD_NAMES.join('|')})`;
                const RM = new RegExp(`^${M}$`);
                const RF = new RegExp(`^${D} ${M}$`);
                if (v.match(RM)) {return [0, 0, v]}
                let match = v.match(RF);
                if (match) {return [parseFloat(match[1]), match[1].split('.')[1].length, match[2]]}
                throw new TypeError(`valueFigMethodが文字列の場合、「${D}」か「${M}」か「${D} ${M}」の書式であるべきです。`);
            }
            else {throw new TypeError(`valueFigは[初期値, 少数部桁数]で指定してください。またはNumber型値一個で[任意値,0]、String型値一個(例:'2.3400')で[parsefloat('2.3400'), 少数部桁数(この場合4)])のように短縮指定できます。:${v}`)};
        })(valueFigMethod);
        if (V[1] < RoundableFloat.MIN_FIG || RoundableFloat.MAX_FIG < V[1]) {throw new TypeError(`figは0〜15の整数値であるべきです。`)}
        return ({value:NumberRounder[V[2]](V[0], V[1]), fig:V[1], roundMethodName:V[2]});
    }
    static _validValueFigName(valueFig, methodName) {
        this.validMethodName(methodName);
        // Number 1個: [value, fig=0, methodName='trunc']
        // [N, N]:     [value, fig, methodName='trunc']
        // '0.1200':   [parseFloat('0.1200'), '0.1200'.split('.').length, methodName='trunc']
        const V = ((v)=>{
            if (Number.isSafeInteger(v)) { return [v, 0] }// 123（少数部桁数は0とする（小数点は表示せず小数点以下で四捨五入した文字列を返す））
            else if (Array.isArray(v) && 2===v.length && v.every(x=>'number'===typeof x)) {return v}
            else if ('string'===typeof v && v.match(/^\d+\.\d$/)) {return [parseFloat(v), v.split('.')[1].length]}
            else {throw new TypeError(`valueFigは[初期値, 少数部桁数]で指定してください。またはNumber型値一個で[任意値,0]、String型値一個(例:'2.3400')で[parsefloat('2.3400'), 少数部桁数(この場合4)])のように短縮指定できます。:${v}`)};
        })(valueFig);
        if (V[1] < RoundableFloat.MIN_FIG || RoundableFloat.MAX_FIG < V[1]) {throw new TypeError(`figは0〜15の整数値であるべきです。`)}
        return ({value:V[0], fig:V[1], roundMethodName:methodName});
    }
    constructor(valueFigMethod, unsigned=false, min=undefined, max=undefined) {
        const o = RoundableFloat.validValueFig(valueFigMethod)
        super(0, unsigned, min, max);
        this._ = {...this._, ...o};
    }
    toFixed(fig) {return Number.toFixed(fig ?? this._.fig)} // 123.456789, fig:2 => 123.46
    toRounded(fig, R) {
        fig = fig ?? this._.fig;
        R = R ?? this._.roundMethodName;
        RoundableFloat.validFig(fig);
        RoundableFloat.validMethodName(R);
        if (this._.unsafed && !Number.isFinite(this.value)) {throw new TypeError(`丸める数は有限数であるべきです。:${this.value}`)}
        const V = ['floor','trunc'].some(n=>n===R) ? this.value : NumberRounder[R](this.value, fig);
        const D = 10**fig; // 0:1, 1:10, 2:100, ... figが15までであるべき理由はNumber型の整数が十進数の15桁までしか安全に計測できないから。
        const I = Math.trunc(V);
        if (0===fig) {return `${I}`}
        const F = Math.abs(V - I);
        const G = 'ceil'===R ? Math.round(F*D) : NumberRounder[R](F * D, 0); // 123.456789 * 1000 = 123.456 => '123.456'
        return `${I}.${G.toString().padEnd(fig, '0')}`; // RoundableFloat([123.45678, 2]).toTrunc(): 123.45
    }
    toString(radix=10) {return 10===radix ? this.toRounded(this._.fig) : super.toString(radix);}
    get fig() {return this._.fig}
    get roundMethodName() {return this._.roundMethodName}
}
class RounderFloat extends RoundableFloat {
    constructor(valueFig, methodName, unsigned=false, min=undefined, max=undefined) {
        valueFig = valueFig ?? [0, 0];
        const o = RoundableFloat._validValueFigName(valueFig, methodName);
        super(0, unsigned, min, max);
        this._ = {...this._, ...o};
    }
}
class RoundFloat extends RounderFloat {constructor(valueFig, methodName, unsigned=false, min=undefined, max=undefined) {super(valueFig, 'round', unsigned, min, max)}}
class HalfEvenFloat extends RounderFloat {constructor(valueFig, methodName, unsigned=false, min=undefined, max=undefined) {super(valueFig, 'halfEven', unsigned, min, max)}}
class TruncFloat extends RounderFloat {constructor(valueFig, methodName, unsigned=false, min=undefined, max=undefined) {super(valueFig, 'trunc', unsigned, min, max)}}
class FloorFloat extends RounderFloat {constructor(valueFig, methodName, unsigned=false, min=undefined, max=undefined) {super(valueFig, 'floor', unsigned, min, max)}}
class CeilFloat extends RounderFloat {constructor(valueFig, methodName, unsigned=false, min=undefined, max=undefined) {super(valueFig, 'ceil', unsigned, min, max)}}

class FormatedFloat extends Float {
    constructor(...args) {super(...args)}// value, min, max
    toString(radix=10) {
        if (10===radix) { return (new Intl.NumberFormat('ja-JP', {
            minimumIntegerDigits:1,
            minimumFractionDigits: 1,
            maximumFractionDigits: 3,
            minimumSignificantDigits: 1,
            maximumSignificantDigits: 3,
            roundingPriority: 'auto',
            roundingMode: 'halfEven', // "ceil", "floor", "expand", "trunc", "halfCeil","halfFloor", "halfExpand" （既定値）,"halfTrunc","halfEven"  
        }).format((0.1+0.2)));
        } else {return super.toString(radix)}
    }
}
class Fraction extends AllFloat {// 分数
    constructor(numerator, denominator, unsafed=false, unsigned=false, min=undefined, max=undefined) {
        isInt(numerator, 'numerator');
        isInt(denominator, 'denominator');
        super(numerator/denominator, unsafed, unsigned, min, max);
        this._.numerator = numerator;     // 分子
        this._.denominator = denominator; // 分母
    }
    get numerator() {return this._.numerator}
    get denominator() {return this._.denominator}
    set numerator(v) {isInt(v, 'numerator'); this._.numerator=v;}
    set denominator(v) {isInt(v, 'numerator'); this._.denominator=v;}
    get value() {return super.value}
    set value(v) {
        if (Array.isArray(v) && 2===v.length) {
            this.numerator = v[0];
            this.denominator = v[1];
            super.value = this.numerator / this.denominator;
        }
        else if ('string'===typeof v) {
            const match = v.match(/^(\d)\/(\d)$/);
            if (!match) {throw new TypeError(`代入値がstringの場合、'\d/\d'の書式であるべきです。:${v}`)}
            this.numerator = parseInt(match[1]);
            this.denominator = parseInt(match[2]);
            super.value = this.numerator / this.denominator;
        } else {throw new TypeError(`代入値はnumberかstringのリテラル値であるべきです。`)}
    }
}
class AllInteger extends Quantity {
    static validate(value, unsafed=false, unsigned=false, bit=0, min=undefined, max=undefined) {
        if (unsafed && 0<bit) {// 論理矛盾を解消する
            console.warn(`unsafed=trueなら範囲制限なしになります。つまり、bit=0,min=undefined,max=undefinedになります。`)
            min = undefined;
            max = undefined;
        } else {
            const m = this.validateMinMax(unsafed, unsigned, bit, min, max);
            min = m.min; max = m.max;
        }
        const o = {...Quantity.validate(value, false, false, unsafed, unsigned, min, max), bit:bit};
        if (!Number.isNaN(o.value) && (o.value < o.min || o.max < o.value)) {throw new RangeError(`valueがmin〜maxの範囲を超過しています。:value:${o.value}, min:${o.min}, max:${o.max}`)}
        return o;
    }
    static validateMinMax(unsafed, unsigned, bit, min, max) {
        if (!(Number.isSafeInteger(bit) && -1 < bit && bit < 54)) {throw new TypeError(`bitは0〜53までのNumber型整数値であるべきです。:bit:${bit}`)}
        const [MIN, MAX] = getIntRange(unsafed, unsigned, bit, min, max);
        // unsafed/unsigned/bit と min/max が矛盾しないこと
        validRange(false, MIN, min, 'min');
        validRange(false, MAX, max, 'max');
        const Min = 'number'===typeof min ? min : MIN;
        const Max = 'number'===typeof max ? max : MAX;
        validMinMax(Min, Max);
        return {min:Min, max:Max};
    }
    constructor(value, unsafed=false, unsigned=false, bit=0, min=undefined, max=undefined) {
        const o = AllInteger.validate(value, unsafed, unsigned, bit, min, max);
        super(o.value, o.naned, o.infinited, o.unsafed, o.unsigned, o.min, o.max);
        this._ = o;
        if (undefined===this._.value) {this._.value = 0;}
    }
    get bit() {return this._.bit}
    validate(v) {return AllInteger.validate(v ?? this.value, this._.unsafed, this._.unsigned, this._.bit, this._.min, this._.max);}
}
class Integer extends AllInteger {
    static validate(value, unsigned=false, bit=0, min=undefined, max=undefined) {
        if (!Number.isSafeInteger(value)) {throw new TypeError(`valueはNumber.isSafeInteger()で真を返す値のみ有効です。:${value}`)}
        return {...Quantity.validate(value, false, false, false, unsigned, min, max), ...this.validateMinMax(unsigned, bit, min, max)};
    }
    static validateMinMax(unsigned, bit, min, max) {return AllInteger.validateMinMax(false, unsigned, bit, min, max);}
    constructor(value, bit=0, min=undefined, max=undefined) {
        super(value, false, false, bit, min, max);
        if (!Number.isSafeInteger(this.value)) {throw new TypeError(`valueはNumber.isSafeInteger()で真を返す値のみ有効です。:${this.value}`)}
    }
    validate(v) {return Integer.validate(v ?? this.value, this._.unsigned, this._.bit, this._.min, this._.max);}
}
class UnsignedInteger extends AllInteger {
    constructor(value, bit=0, min=undefined, max=undefined) {
        super(value, false, true, bit, min, max);
        if (!Number.isSafeInteger(this.value)) {throw new TypeError(`valueはNumber.isSafeInteger()で真を返す値のみ有効です。:${this.value}`)}
    }
}
//class RangedBigInteger extends BigInt {// プリミティブ型は継承できない
class RangedBigInteger {// プリミティブ型BigIntは継承できない
    constructor(value=0n, unsigned=false, bit=64n, min=undefined, max=undefined, fmt=undefined) {
        if ('boolean'!==typeof unsigned) {throw new TypeError(`unsignedはBoolean型リテラル値であるべきです。:${unsigned}`)}
        if ('number'===typeof bit) {
            if (!(Number.isSafeInteger(bit) && 53<bit && bit<Number.MAX_SAFE_INTEGER)) {throw new TypeError(`bitがNumber型なら53より大きくNumber.isSafeInteger()な値であるべきです。53以下ならNumber継承整数型Integerを使用してください。${bit}`)}
            bit = BigInt(bit);
        } else if ('bigint'===typeof bit && bit<54n) {throw new TypeError(`bitがBitInt型なら53nより大きい数であるべきです。53以下ならNumber継承整数型Integerを使用してください。:${bit}`)}
        console.log('min:', min, 'max:', max, 'bit:', bit);
        if (!(undefined===min || 'bigint'===typeof min)) {throw new TypeError(`minはundefinedかBitInt型リテラル値であるべきです。:${min}`)}
        if (!(undefined===max || 'bigint'===typeof max)) {throw new TypeError(`maxはundefinedかBitInt型リテラル値であるべきです。:${max}`)}
        const MIN = unsigned ? 0n : ((2n**bit) / 2n)*-1n;
        const MAX = ((2n**bit) / (unsigned ? 1n : 2n))-1n;
        if (undefined!==min && min < MIN) {throw new RangeError(`minがunsigned,bitで指定した範囲外です。min:${min},unsigned:${unsigned},bit:${bit} = ${MIN}`)}
        if (undefined!==max && MAX < max) {throw new RangeError(`maxがunsigned,bitで指定した範囲外です。max:${max},unsigned:${unsigned},bit:${bit} = ${MAX}`)}
        if (undefined===min) { min = MIN; }
        if (undefined===max) { max = MAX; }
        console.log('min:', min, 'max:', max, 'bit:', bit);
        if (max <= min) {throw new RangeError(`minとmaxが不正です。両者は異なる値にしつつ大小関係を名前と一致させてください。:${min},${max}`)}
        if ('bigint'!==typeof value) {throw new TypeError(`valueはBigInt型リテラル値であるべきです。:${value}`)}
        if (value < min || max < value) {throw new RangeError(`valueはmin〜maxの範囲外です。:value:${value}, min:${min}, max:${max}`)}
        if (!(undefined===fmt || fmt instanceof Intl.NumberFormat)) {throw new TypeError(`fmtはundefinedかIntl.NumberFormat型インスタンスであるべきです。:${fmt}`)}
        this._ = {value:value, unsigned:unsigned, bit:bit, min:min, max:max};
    }
    valueOf() {return this._.value}
    get value() {return this._.value}
    set value(v) {
        if ('bigint'!==typeof v) {throw new TypeError(`valueはBigInt型リテラル値であるべきです。`)}
        if (v < this._.min || this._.max < v) {throw new RangeError(`valueはmin〜maxの範囲外です。:value:${v}, min:${this._.min}, max:${this._.max}`)}
        this._.value = v;
    }
    get unsigned() {return this._.unsigned}
    get bit() {return this._.bit}
    get min() {return this._.min}
    get max() {return this._.max}
}
class FixedObject {// 定数専用
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
            if (!isObj(options[k])) { // {value:'', type:String}ではなく直接value値をセットした場合
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
            }
            if (options[k].hasOwnProperty('value') && [ObservedObject, FixedObject].some(t=>options[k].value instanceof t)) {continue}
            if (!options[k].hasOwnProperty('value') && !options[k].hasOwnProperty('type')) {throw TypeError('valueとtypeは少なくともいずれか一つ必要です。')}
            else if (options[k].hasOwnProperty('value') && !options[k].hasOwnProperty('type')) {
                options[k].type = Typed.getTypeFromValue(options[k].value);
            }
            else if (!options[k].hasOwnProperty('value') && options[k].hasOwnProperty('type')) {
                options[k].value = Typed.defaultValue(options[k].type);
            }
            // プリミティブ型インスタンスだった場合
            if (isPrimIns(v.value)) {this._.primIns[k] = v.value; options[k].value = v.value.valueOf();}
        }
        this._.opt = options;
    }
    #makeDescriptor(k, v) {
        this._.prop[k] = undefined;
        const isObs = ([ObservedObject, FixedObject].some(t=>v instanceof t));
        const desc = {
            configurable: false,
            enumerable: true,
            get: ()=>this._.prop[k],
            set: (V)=>{throw new SyntaxError(`定数に代入はできません。`)},
        };
        if (!isObs) {Typed.valid(this._.opt[k].type, v.value);}// ToDo: 型、妥当性チェックする
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
class ObservedObject {
    constructor(iOpt, oOpt, update) {
        this._ = {opt:{}, prop:{}, primIns:{}, onSet:{}, onChange:{}, update:(i,o)=>{}};
        this.#checkArgs(iOpt, oOpt, update);
        this.#checkKeys(iOpt)
        this.#setDefaultOptions(iOpt);
        for (let [k, v] of Object.entries(this._.opt)) { this.#makeDescriptor(k, v); }
        this._.oProp = ([undefined,null].some(v=>v===oOpt)) ? ({}) : ([ObservedObject, FixedObject].some(t=>oOpt instanceof t)) ? oOpt : new ObservedObject(oOpt);
        if ('function'===typeof update) {this._.update = update;}
        this.#update();
        return this.#makeProxy();
    }
    #checkArgs(iOpt, oOpt, update) {
        const isObj = (v)=>null!==v && 'object'===typeof v && '[object Object]'===Object.prototype.toString.call(v);
        if (!isObj(iOpt)) {throw new TypeError(`第一引数iOptはプロパティ名とその型などの情報を持つオブジェクトであるべきです。例:{name:{value:''}, age:{value:0, valid:Obs.valid.range(0,100)}}`)}
        if (undefined!==oOpt && null!==oOpt && !isObj(oOpt) && !([ObservedObject, FixedObject].some(t=>oOpt instanceof t))) {throw new TypeError(`第二引数oOptはObsインスタンスまたはプロパティ名とその型などの情報を持つオブジェクトであるべきです。例:{name:{value:''}, age:{value:0, valid:Obs.valid.range(0,100)}}`)}
        if (undefined!==update && 'function'!==typeof update) {throw new TypeError(`第三引数updateはプロパティに値を代入したら実行されるコールバック関数であるべきです。例: (i,o)=>o.msg = '名:' + i.name + ' 年:' + i.age;`)}
    }
    #checkKeys(iOpt) {
        const reserveds = ['setup', '_', '$', '_isProxy'];
        const keys = [...Object.keys(iOpt)];
        for (let key of Object.keys(iOpt)) {if (reserveds.some(r=>r===key)) {throw new TypeError(`'${key}' は予約済みキー名です。他の名前にしてください。予約済み名一覧:${reserveds.join(',')}`)}}
    }
    #setDefaultOptions(iOpt) {
        for (let [k, v] of Object.entries(iOpt)) {
            if (!isObj(iOpt[k])) { // {value:'', type:String}ではなく直接value値をセットした場合
                if ('number'===typeof v) {
                    if (Number.isSafeInteger(v)) {
                        this._.primIns[k] = new Integer(v);
                        this._.primIns[k].validate();
                        const V = this._.primIns[k].valueOf();
                        iOpt[k] = {value:V}; v = {value:V};
                    } else {
                        throw new TypeError(`Number型リテラル値を直接指定した時は{value:Integer(999)}等の省略形と見做します。しかし指定された値は非Integer値でした。:${v}\nNumber.isSafeInteger()が真を返す範囲内か、少数値でないか等を確認してください。\n少数を使用するなら{weight:Float(62.1)}のように書いてください。`);
                    }
                } else { iOpt[k] = {value:v}; v = {value:v}; }// null, undefined, Symbol, Boolean(true/false), BigInt(1n), String('a'), {k:'v'}, ['v'], new Map([['k','v']]), 等
            }
            if (([ObservedObject, FixedObject].some(t=>v instanceof t))) {continue}
            if (!v.hasOwnProperty('value') && !v.hasOwnProperty('type')) {throw TypeError('valueとtypeは少なくともいずれか一つ必要です。')}
            else if (v.hasOwnProperty('value') && !v.hasOwnProperty('type')) {
                iOpt[k].type = Typed.getTypeFromValue(v.value);
            }
            else if (!v.hasOwnProperty('value') && v.hasOwnProperty('type')) {
                iOpt[k].value = Typed.defaultValue(v.type);
            }
            // プリミティブ型インスタンスだった場合
            if (isPrimIns(v.value)) {this._.primIns[k] = v.value; iOpt[k].value = v.value.valueOf();}
        }
        this._.opt = iOpt;
    }
    #makeDescriptor(k, v) {
        this._.prop[k] = undefined;
        const isObs = ([ObservedObject, FixedObject].some(t=>v instanceof t));
        const desc = {
            configurable: false,
            enumerable: true,
            get: ()=>this._.prop[k],
            set: (V)=>{
                // ToDo: 型、妥当性チェックする
                Typed.valid(this._.opt[k].type, V);
                // 独自プリミティブ型インスタンスだった場合(Int,Float)
                if (k in this._.primIns) {this._.primIns[k].validate(v)}
                const oldValue = this._.prop[k];
                this._.prop[k] = V;
                if (k in this._.onSet) {this._.onSet[k](V, oldValue);}
                if (k in this._.onChange && V!==oldValue) {this._.onChange[k](V, oldValue);}
                this._.update();
            },
        };
        if (!isObs) {Typed.valid(this._.opt[k].type, v.value);}// ToDo: 型、妥当性チェックする
        this._.prop[k] = ([ObservedObject, FixedObject].some(t=>v instanceof t)) ? v : v.value;
        Object.defineProperty(this, k, desc);
    }
    #makeProxy() { return new Proxy(this, {
        get: (target, prop, receiver)=>{
            if ('_isProxy'===prop) {return true}
            else if ('_'===prop) {return structuredClone(this._.primIns)}
            else if ('$'===prop) {return this._.oProp;}
            else if ('setup'===prop) {return this.setup.bind(this);}
            else {
                if ('symbol'===typeof prop) {return Reflect.get(target, prop)}
                else {
                    if (target._isProxy) {}
                    if (!(prop in this._.prop)) {throw new SyntaxError(`未定義のプロパティを参照しました。:${prop}`)}
                    return Reflect.get(target, prop);
                }
            }
        },
        set: (target, prop, value, receiver)=>{
            if ('symbol'===typeof prop) {return Reflect.set(target, prop, value)}
            else {
                if (!(prop in target._.prop)) {throw new SyntaxError(`未定義のプロパティに代入しました。:${prop}`)}
                // ToDo: 型、妥当性チェック
                // 独自プリミティブ型インスタンスだった場合(Int,Float)
                if (prop in this._.primIns) {this._.primIns[prop].validate(value)}
                else {Typed.valid(target._.opt[prop].type, value);}
                const oldValue = target._.prop[prop];
                target._.prop[prop] = value;
                if (prop in target._.onSet) {target._.onSet[prop](value, oldValue);}
                if (prop in target._.onChange && value!==oldValue) {target._.onChange[prop](value, oldValue);}
                target._.update();
            }
        },
        apply: (target, thisArg, argumentsLis)=> {
            if (new.target) {} // Clone
            else {return Reflect.apply('setup', thisArg, argumentsLis);}// ObservedObject.setup(...) 呼出
        },
    });}
    setup(values) {// values:{name:value, name:value, ...}
        for (let [k, v] of Object.entries(values)) {
            if (!(k in this._.prop)) {throw new SyntaxError(`未定義のプロパティに代入しました。:${prop}`)}
            // ToDo: 型、妥当性チェックする
            Typed.valid(this._.opt[k].type, v);
            // 独自プリミティブ型インスタンスだった場合(Int,Float)
            if (k in this._.primIns) {this._.primIns[k].validate(v)}
            const oldValue = this._.prop[k];
            this._.prop[k] = v;
            if (k in this._.onSet) {this._.onSet[k](v, oldValue);}
            if (k in this._.onChange && value!==oldValue) {this._.onChange[k](v, oldValue);}
            if (k in this._.primIns) {this._.primIns[k].value = v}
        }
        return this.#update();
    }
    #update() {
        // ObservedObjectをネストしたら以下エラーが出た
        // DOMException: Proxy object could not be cloned.
        //if ('function'===typeof this._.update) {return this._.update(structuredClone(this._.prop), this._.oOpt);}
        // 結局、従来のJSON変換でクローンするしかなかった。structuredClone使えない子……
//        console.log(this._.prop);
//        console.log(JSON.stringify(this._.prop));
//        if ('function'===typeof this._.update) {return this._.update(JSON.parse(JSON.stringify(this._.prop)), this._.oOpt);}
//        if ('function'===typeof this._.update) {return this._.update(this._.prop);}
        if ('function'===typeof this._.update) {return this._.update(this._.prop, this._.oProp);}
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
        this.#validType(type, value);
        if (!nullable && null===value) {throw new TypeError(`許容していないのにnullです。`)}
        if (!undefinedable && undefined===value) {throw new TypeError(`許容していないのにundefinedです。`)}
    }
    static #validType(type, value) {
        if ((Boolean===type && 'boolean'!==typeof value)
        || (Number===type && 'number'!==typeof value)
        || (BigInt===type && 'bigint'!==typeof value)
        || (String===type && 'string'!==typeof value)
        || (Symbol===type && 'symbol'!==typeof value)) { throw new TypeError(`'${value}'は期待する${type.name}型ではありません。`) } // プリミティブ型
        else if ('object'===typeof value) {// オブジェクト型
            if (Object===type && '[object Object]'!==value.prototype.toString()) { throw new TypeError(`'${value}'は期待する${type.name}型ではありません。`) } // {k:'v'}
            if ('constructor' in type && !(value instanceof type)) {throw new TypeError(`'${value}'は期待する${type.constructor.name}型ではありません。`)} // クラスやオブジェクトのインスタンス
        }
    }
}
class BaseChars {
    static NUMBER = '0123456789';
    static ALPHABET_L = 'abcdefghijklmnopqrstuvwxyz';
    static ALPHABET_U = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    static SYMBOL = {
        HEX: '+/',       // 16進数と同じ順序にする（使用する記号は基本形と同じだが、0-9A-Za-z+/の順である）
        BASE: '+/',      // 基本形
        URL: '-_',
        FILE: '+-',      // ファイル名
        XML_TOKEN: '.-', // XMLトークン
        XML_ID: '_:',    // XML識別子
        SRC_ID_1: '_-',  // プログラム識別子
        SRC_ID_2: '._',  // プログラム識別子
        SRC_ID_3: '_$',  // プログラム識別子（JavaScriptで使用可能）
        REGEXP: '!-',    // 正規表現
        ASCII_SORT_1: '{}',// ASCII文字コードにおいて文字をソートした時に大小関係が保たれること（Base文字はASCIIコードポイントの大小関係順であること）ファイル名に最適？
        ASCII_SORT_2: '|~',// ASCII文字コードにおいて文字をソートした時に大小関係が保たれること（Base文字はASCIIコードポイントの大小関係順であること）ファイル名に最適？
    };
    static SYMBOL_NAMES = [...Object.keys(this.SYMBOL)];
    static isSymbols(v) {return ((Array.isArray(v) && 2===v.length && v.every(s=>'string'===typeof s && 1===s.length)) || this.SYMBOL_NAMES.some(n=>n===v))}
    static PADDING = '=';
    static BASE256CHAR = (
        '⠀⢀⠠⢠⠐⢐⠰⢰⠈⢈⠨⢨⠘⢘⠸⢸' +
        '⡀⣀⡠⣠⡐⣐⡰⣰⡈⣈⡨⣨⡘⣘⡸⣸' +
        '⠄⢄⠤⢤⠔⢔⠴⢴⠌⢌⠬⢬⠜⢜⠼⢼' +
        '⡄⣄⡤⣤⡔⣔⡴⣴⡌⣌⡬⣬⡜⣜⡼⣼' +
        '⠂⢂⠢⢢⠒⢒⠲⢲⠊⢊⠪⢪⠚⢚⠺⢺' +
        '⡂⣂⡢⣢⡒⣒⡲⣲⡊⣊⡪⣪⡚⣚⡺⣺' +
        '⠆⢆⠦⢦⠖⢖⠶⢶⠎⢎⠮⢮⠞⢞⠾⢾' +
        '⡆⣆⡦⣦⡖⣖⡶⣶⡎⣎⡮⣮⡞⣞⡾⣾' +
        '⠁⢁⠡⢡⠑⢑⠱⢱⠉⢉⠩⢩⠙⢙⠹⢹' +
        '⡁⣁⡡⣡⡑⣑⡱⣱⡉⣉⡩⣩⡙⣙⡹⣹' +
        '⠅⢅⠥⢥⠕⢕⠵⢵⠍⢍⠭⢭⠝⢝⠽⢽' +
        '⡅⣅⡥⣥⡕⣕⡵⣵⡍⣍⡭⣭⡝⣝⡽⣽' +
        '⠃⢃⠣⢣⠓⢓⠳⢳⠋⢋⠫⢫⠛⢛⠻⢻' +
        '⡃⣃⡣⣣⡓⣓⡳⣳⡋⣋⡫⣫⡛⣛⡻⣻' +
        '⠇⢇⠧⢧⠗⢗⠷⢷⠏⢏⠯⢯⠟⢟⠿⢿' +
        '⡇⣇⡧⣧⡗⣗⡷⣷⡏⣏⡯⣯⡟⣟⡿⣿').split('');
    static SPEC = {
        base16: this.NUMBER + this.ALPHABET_U,
        base32: this.ALPHABET_U + this.NUMBER.slice(2, 8),
        base32hex: this.NUMBER + this.ALPHABET_U.slice(0, 22),
        base64: this.ALPHABET_U + this.ALPHABET_L + this.NUMBER + this.SYMBOL.HEX,
        base64url: this.ALPHABET_U + this.ALPHABET_L + this.NUMBER + this.SYMBOL.URL,
        base64hex: this.NUMBER + this.ALPHABET_U + this.ALPHABET_L + this.SYMBOL.ASCII_SORT_1,
        base256: this.BASE256CHAR,
    }
    static SPEC_NAMES = [...Object.keys(this.SPEC)];
}
class BaseCharBuilder {// 2〜64, 256
    constructor(base=64, sortable=false, symbols=['+','/']) {
        this.#checkArgs(base, sortable, symbols);
        this._ = {base:base, sortable:sortable, symbols:'string'===typeof symbols ? BaseChars.SYMBOL[symbols] : symbols, chars:{en:null, de:null}};
        this.#makeChars();
    }
    #checkArgs(base, sortable, symbols) {
        if ('string'===typeof base && BaseChars.SPEC_NAME.some(n=>n===base)) {
            base = BaseChars.SPEC_NAME[base];
            sortable = 'base16'===base || base.endsWith('hex');
        }
        if (!('number'===typeof base && ((2<=base && base<=64) || 256===base))) {throw new TypeError(`baseは2〜64か256の整数か次のいずれかの文字列であるべきです。${BaseChars.SPEC_NAME}`)}
        if ('boolean'!==sortable) {throw new TypeError(`sortableは真偽値であるべきです。`)}
        if (!BaseChars.isSymbols(symbols)) {throw new TypeError(`symbolsはbase=64時に使用する記号2字の配列か、それを指名する次の名前を渡してください。`)}
    }
    #makeChars() {
        this._.chars.en = (256===this._.base) ? BaseChars.BASE256CHAR : (sortable
            ? (BaseChars.NUMBER + BaseChars.ALPHABET_U + BaseChars.ALPHABET_L + this._.symbols).slice(0, this._.base)
            : ((this._.base <= 36)
                ? BaseChars.ALPHABET_U + BaseChars.NUMBER 
                : BaseChars.ALPHABET_U + BaseChars.ALPHABET_L + BaseChars.NUMBER + this._.symbols
                ).slice(0, this._.base)
            );
        this._.chars.de = Object.fromEntries(Object.entries(this._.chars.en).map(([i,c])=>[c,i]));
    }
    get base() {return this._.base}
    get sortable() {return this._.sortable}
    get chars() {return this._.chars}
}
class BaseFactory {
    static get names() {return 'b16 b32 b32h b64 b64u b64h b256'.split(' ')}
    static get(name='b64u') {
        switch (name) {
            case 'b16': return new Base16();
            case 'b32': return new Base32('ABCDEFGHIJKLMNOPQRSTUVWXYZ234567');
            case 'b32h': return new Base32('0123456789ABCDEFGHIJKLMNOPQRSTUV');
            case 'b64': return new Base64();
            case 'b64u': return new Base64URL();
            case 'b64h': return new Base64Hex();
            case 'b256': return new Base256();
            default: throw new TypeError(`nameが不正値です。次のいずれかのみ有効です。:${this.names}`);
        }
    }
}
class Compresser {
    async compress(data, format='deflate-raw') { // format:gzip/deflate/deflate-raw
        const is = new Blob([data]).stream();
        const os = is.pipeThrough(new CompressionStream(format));
        return await new Response(os).arrayBuffer();
    }
    async decompress(data, format='deflate-raw') {
        const is = new Blob([data]).stream();
        const os = is.pipeThrough(new DecompressionStream(format));
        return await new Response(os).arrayBuffer();
    }
}
/*
class BaseN {
    constructor(radix=64, enChars='ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/', ignoreCase=false, hasPad=true, sortable=false, deflateNum=0) {
        this._ = {chars:{en:Array.from(enChars), de:null}, radix:radix, ignoreCase:ignoreCase, hasPad:hasPad, sortable:sortable, deflateNum:deflateNum};
    }
    get radix() {return this._.radix}
    get ignoreCase() {return this._.ignoreCase}
    get hasPad() {return this._.hasPad}
    get sortable() {return this._.sortable}
    fromBin(b) {}
    fromStr(s) {}
    fromInt(i) {}
    fromNum(n) {}
    toBin() {}
    toStr() {}
    toInt() {}
    toNum() {}
}
*/
class BaseX {
    encodeStr(str) {return this.encode((new TextEncoder()).encode(str))}
    decodeStr(str) {return (new TextDecoder()).decode(this.decode(str));}
    async compress(data, format='deflate-raw') { // format:gzip/deflate/deflate-raw
        const is = new Blob([data]).stream();
        const os = is.pipeThrough(new CompressionStream(format));
        return await new Response(os).arrayBuffer();
    }
    async decompress(data, format='deflate-raw') {
        const is = new Blob([data]).stream();
        const os = is.pipeThrough(new DecompressionStream(format));
        return await new Response(os).arrayBuffer();
    }
    async encodeAsync(u8a,format='deflate-raw') {return this.encode(await this.compress(u8a,format))}
    async decodeAsync(str,format='deflate-raw') {return await this.decompress(this.decode(str),format)}
    async encodeStrAsync(str,format='deflate-raw') {return this.encodeStr(await this.compress((new TextEncoder()).encode(str),format))}
    async decodeStrAsync(str,format='deflate-raw') {return await this.decompress((new TextDecoder()).decode(str),format)}
}
class Base16 extends BaseX {
    encode(u8a) {
        if (!(u8a instanceof Uint8Array)) {throw new TypeError(`引数はUint8Array型インスタンスであるべきです。`)}
        let str = '';
        for (let byte of u8a) {str += byte.toString(16).padStart(2, '0')}
        return str;
    }
    decode(str) {
        if (!('string'===typeof str && 0 === str.length % 2)) {throw new TypeError('引数Base16の文字数は偶数であるべきです。')}
        const u8a = new Uint8Array(str.length / 2);
        this.#valid(str); // gなど不正文字が入っていたら例外発生する
        //for (let i = 0; i<str.length; i+=2) {u8a[i/2] = parseInt(str.substring(i, i+2), 16)}// 2文字を16進数として解析し、バイト値を取得
        for (let i = 0; i<str.length; i+=2) {// 2文字を16進数として解析し、バイト値を取得
            u8a[i/2] = parseInt(str.substring(i, i+2), 16); // /^[0-9a-z]$/ig でないと NaN を返す。Uint8ArrayはNaNを0と解釈してしまう。
        }
        return u8a;
    }
    #valid(str) {
        const s = new Set(Array.from(str));
        console.log(s);
        console.log([...s].toString());
        console.log([...s].toString().match(/^[0-9a-f]+$/ig));
        if (![...s].toString().match(/^[0-9a-f]+$/ig)) {throw new TypeError(`不正なBase16文字です。:${str}`)}
    }
    toNum(s) {return parseInt(s, 16)}
    fromNum(n) {return n.toString(16)}
    toInt(s) {return BigInt('0x 0X'.some(p=>s.startsWith(p)) ? s : `0x${s}`)}
    fromInt(i) {return i.toString(16)}
}
class Base32Base extends BaseX {// https://qiita.com/kerupani129/items/4f3b44b2e00d32731ca4
    constructor(enChars) {
        if (!('string'===typeof enChars && 32===enChars.length)){throw new TypeError(`enCharsは32字の文字列であるべきです。`)}
        this._ = {
            chars:{
                en:enChars,
                de:(new Map([
                    ...Array.from(enChars, (encoding, value) => [encoding, value])])),
            }
        };
    }
    encode(u8a) {
        const byteLength = uint8Array.byteLength;
        let dataBuffer = 0;
        let dataBufferBitLength = 0;
        let byteOffset = 0;
        let result = '';
        // バッファにデータが残っているか、またはバッファに読み込めるデータが残っていたら継続
        while (0 < dataBufferBitLength || byteOffset < byteLength) {
            // バッファのデータが少なければデータを追加する
            if ( dataBufferBitLength < 5 ) {
                if ( byteOffset < byteLength ) {
                    // 読み込めるデータが残っていたら読み込む
                    dataBuffer <<= 8;
                    dataBuffer |= uint8Array[byteOffset++];
                    dataBufferBitLength += 8;
                } else {
                    // 読み込めるデータがなければ値が 0 のパディングビットを追加して長さを 5 ビットにする
                    dataBuffer <<= 5 - dataBufferBitLength;
                    dataBufferBitLength = 5;
                }
            }
            // バッファのデータの左の長さ 5 ビットの値を取得する
            dataBufferBitLength -= 5;
            const value = dataBuffer >>> dataBufferBitLength & 0x1f;
            result += this._.chars.en[value];// 値を Base32 文字に変換
        }
        // パディング文字 '=' を追加
        const targetLength = Math.ceil(result.length / 8) * 8;
        const resultPadded = result.padEnd(targetLength, '=');
        return resultPadded;
    }
    decode(str) {
        // メモ: 正しく Base32 エンコードされてパディングされていれば長さが 8 の倍数のはず
        //       長さが 8 の倍数でない場合はパディングされていないかまたは正しく Base32 エンコードされていない
        if ( (string.length & 0x7) !== 0 ) throw new Error(`不正なBase32文字列です。長さが不正です。パディング不足か正しくエンコードされていません。`);
        const stringTrimmed = string.replace(/=*$/, '');// 末尾のパディング文字 '=' を除去する
        const result = new Uint8Array(stringTrimmed.length * 5 >>> 3);// メモ: デコード後のサイズは切り捨てで計算する
        let dataBuffer = 0;
        let dataBufferBitLength = 0;
        let byteOffset = 0;
        for (const encoding of stringTrimmed) {
            const value = this._.chars.de.get(encoding);
            if ( typeof value === 'undefined' ) throw new Error(`不正なBase32文字列です。不正な文字が含まていました。:${encoding}`);
            // バッファに長さ 5 ビットの値を読み込む
            dataBuffer <<= 5;
            dataBuffer |= value;
            dataBufferBitLength += 5;
            // バッファのデータが少なければデータを取得する
            if ( dataBufferBitLength >= 8 ) {
                dataBufferBitLength -= 8;
                result[byteOffset++] = dataBuffer >>> dataBufferBitLength;
            }
        }
        // 正しく Base32 エンコードされたデータであれば残る長さは 5 ビット未満のはず
        // 5 ビット以上残った場合は正しく Base32 エンコードされていない
        if ( dataBufferBitLength >= 5 ) throw new Error(`不正なBase32文字列です。長さが不正です。`);
        // 正しく Base32 エンコードされたデータであれば残る値は 0 のはず
        // 0 以外のデータが残った場合は正しく Base32 エンコードされていない
        if ( (dataBuffer << (4 - dataBufferBitLength) & 0xf) !== 0 ) throw new Error(`不正なBase32文字列です。長さが不正です。`);
        return result;
    }
}
class Base32 extends Base32Base {constructor() {super('ABCDEFGHIJKLMNOPQRSTUVWXYZ234567')}}
class Base32Hex extends Base32Base {constructor() {super('0123456789ABCDEFGHIJKLMNOPQRSTUV')}}
class Base64Base extends BaseX {
    static #NUMBER = '0123456789';
    static #ALPHABET_U = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    static #ALPHABET_L = 'abcdefghijklmnopqrstuvwxyz';
    constructor(hasPad, sortable, symbols=['+','/']) {
        if ('boolean'!==typeof hasPad) {throw new TypeError(`hasPadはBoolean型プリミティブ値であるべきです。`)}
        if ('boolean'!==typeof sortable) {throw new TypeError(`sortableはBoolean型プリミティブ値であるべきです。`)}
        if (Array.isArray(symbols) && 2===symbols.length && symbols.every(v=>'string'===typeof v && 1===v.length)) {throw new TypeError(`symbolsは1字を2個含む配列であるべきです。`)}
        this._ = {chars:{en:null, de:null}, hasPad:hasPad, sortable:sortable, symbols:symbols};
        this._.chars.en = sortable
            ? Base64Base.#NUMBER + Base64Base.#ALPHABET_U + Base64Base.#ALPHABET_L + symbols.join('')
            : Base64Base.#ALPHABET_U + Base64Base.#ALPHABET_L + Base64Base.#NUMBER + symbols.join('');
        this._.chars.de = Object.fromEntries(Object.entries(this._.chars.en).map(([i,c]) => [c,i]));
    }
    encode(u8a) {
        const s = btoa(String.fromCharCode.apply(null, u8a));
        const t = this.#fromBasic(s);
        return this._.hasPad ? t : this.#delPad(t);
    }
    decode(str) {
        str = this.#toBasic(str);
        if (!this._.hasPad) {str = this.#addPad(str)}
        const decodedString = atob(str);
        const u8a = new Uint8Array(decodedString.length);
        for (let i=0; i<decodedString.length; i++) {
            u8a[i] = decodedString.charCodeAt(i);
        }
        return u8a;
    }
    get #isBasic() {return '+'===this._.symbols[0] && '/'===this._.symbols[1]}
    #toBasic(str) {return this.#isBasic ? str.replaceAll(this._.symbols[0], '+').replaceAll(this._.symbols[1], '/') : s;}// 基本形に変換する
    #fromBasic(str) {return this.#isBasic ? s : s.replaceAll('+', this._.symbols[0]).replaceAll('/', this._.symbols[1]);}// 基本形から自身の形に変換する
    #addPad(str) {
        if (str.endsWith('=')) {return base64str}
        const paddingNeeded = (4 - (str.length % 4)) % 4;
        return str + '='.repeat(paddingNeeded);
    }
    #delPad(str) {return str.replaceAll('=','')}
}
class Base64 extends Base64Base {
    static #CHARS = {
        B: Array.from('ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'),
        H: Array.from('0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz{}'),
    };
    constructor(){super(true, false, ['+','/'])}
    toURL(data) {
        if ('string'===typeof data) {return this.#toURL(data)}
        else if (data instanceof Uint8Array) {return this.#toURL(this.encode(data))}
        else {this.#throw()}
    }
    #toURL(s) {return data.replaceAll('+','-').replaceAll('/','_')}
    toHex(data) {
        if ('string'===typeof data) {return this.#toHex(data)}
        else if (data instanceof Uint8Array) {return this.#toHex(this.encode(data))}
        else {this.#throw()}
    }
    #toHex(s) {return Array.from(data).rduce((s,v,i)=>s+Base64.CHARS.H[Base64.CHARS.B.indexOf(v)], '')}
    async toURLAsync(data) {
        if ('string'===typeof data) {return this.#toURL(data)}
        else if (data instanceof Uint8Array) {return this.#toURL(await this.encodeAsync(data))}
        else {this.#throw()}
    }
    async toHexAsync(data) {
        if ('string'===typeof data) {return this.#toHex(data)}
        else if (data instanceof Uint8Array) {return this.#toHex(await this.encodeAsync(data))}
        else {this.#throw()}
    }
    #throw() {throw new TypeError(`引数はstring型プリミティブ値かUint8Array型インスタンスであるべきです。`)}
}
class SameBaseChanger {// 基数が同一のBaseNパターンを変換する
    static symbol(s, from=['+','/'], to=['-','_']) {return s.replaceAll(from[0],to[0]).replaceAll(from[1],to[1])}
    static all(s, from='ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'.split(''), to='0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz{}'.split('')) {return Array.from(s).rduce((s,v,i)=>s+to[from.indexOf(v)], '')}
}
// 後ろ二つだけ違うパターン: SameBaseChanger.symbol(s, from, to)
// 順序入替パターン: SameBaseChanger.all(s, from, to)
class Base64URL extends Base64Base {
    constructor(){super(false, false, ['-','_'])}
    toBase(data) {
        if ('string'===typeof data) {return this.#toBase(data)}
        else if (data instanceof Uint8Array) {return this.#toBase(this.encode(data))}
        else {this.#throw()}
    }
    #toBase(s) {return data.replaceAll('-','+').replaceAll('_','/')}
    toHex(data) {
        if ('string'===typeof data) {return this.#toHex(data)}
        else if (data instanceof Uint8Array) {return this.#toHex(this.encode(data))}
        else {this.#throw()}
    }
    #toHex(s) {return Array.from(data).rduce((s,v,i)=>s+Base64.CHARS.H[Base64.CHARS.B.indexOf(v)], '')}
    async toBaseAsync(data) {
        if ('string'===typeof data) {return this.#toBase(data)}
        else if (data instanceof Uint8Array) {return this.#toBase(await this.encodeAsync(data))}
        else {this.#throw()}
    }
    async toHexAsync(data) {
        if ('string'===typeof data) {return this.#toHex(data)}
        else if (data instanceof Uint8Array) {return this.#toHex(await this.encodeAsync(data))}
        else {this.#throw()}
    }
    #throw() {throw new TypeError(`引数はstring型プリミティブ値かUint8Array型インスタンスであるべきです。`)}

}
class Base64Hex extends Base64Base {constructor(){super(false, true, ['{','}'])}}
class Base256 extends BaseX {
    static #CHAR = (
        '⠀⢀⠠⢠⠐⢐⠰⢰⠈⢈⠨⢨⠘⢘⠸⢸' +
        '⡀⣀⡠⣠⡐⣐⡰⣰⡈⣈⡨⣨⡘⣘⡸⣸' +
        '⠄⢄⠤⢤⠔⢔⠴⢴⠌⢌⠬⢬⠜⢜⠼⢼' +
        '⡄⣄⡤⣤⡔⣔⡴⣴⡌⣌⡬⣬⡜⣜⡼⣼' +
        '⠂⢂⠢⢢⠒⢒⠲⢲⠊⢊⠪⢪⠚⢚⠺⢺' +
        '⡂⣂⡢⣢⡒⣒⡲⣲⡊⣊⡪⣪⡚⣚⡺⣺' +
        '⠆⢆⠦⢦⠖⢖⠶⢶⠎⢎⠮⢮⠞⢞⠾⢾' +
        '⡆⣆⡦⣦⡖⣖⡶⣶⡎⣎⡮⣮⡞⣞⡾⣾' +
        '⠁⢁⠡⢡⠑⢑⠱⢱⠉⢉⠩⢩⠙⢙⠹⢹' +
        '⡁⣁⡡⣡⡑⣑⡱⣱⡉⣉⡩⣩⡙⣙⡹⣹' +
        '⠅⢅⠥⢥⠕⢕⠵⢵⠍⢍⠭⢭⠝⢝⠽⢽' +
        '⡅⣅⡥⣥⡕⣕⡵⣵⡍⣍⡭⣭⡝⣝⡽⣽' +
        '⠃⢃⠣⢣⠓⢓⠳⢳⠋⢋⠫⢫⠛⢛⠻⢻' +
        '⡃⣃⡣⣣⡓⣓⡳⣳⡋⣋⡫⣫⡛⣛⡻⣻' +
        '⠇⢇⠧⢧⠗⢗⠷⢷⠏⢏⠯⢯⠟⢟⠿⢿' +
        '⡇⣇⡧⣧⡗⣗⡷⣷⡏⣏⡯⣯⡟⣟⡿⣿').split('');
    static #DECORD_CHAR = Object.fromEntries(Object.entries(this.#CHAR).map(([i, ch]) => [ch, i]));
    static encode(u8a) {
        if (!(u8a instanceof Uint8Array)) {throw new TypeError(`引数はUint8Array型インスタンスであるべきです。`)}
        return u8a.reduce((acc, b) => acc + this.#CHAR[b], '');
    }
    static decode(str) {
        if ('string'!==typeof str) {throw new TypeError(`引数はString型プリミティブ値であるべきです。`)}
        return Uint8Array.from(
            str.split('').map(c=>{
                if (!(c in this.#DECORD_CHAR)) {throw Error("Cannot decode character '" + c.charCodeAt(0) + "', not Braille.")}
                return this.#DECORD_CHAR[c];
            })
        );
    }
}
class SortableBaseN {// 出力されるASCII文字を辞書順にソート可。最大64字。記号は{}だと使用できない文脈があるが、-_ならURLでも使用可能。但し順序が分かり難い。
    //constructor(radix=64, urlSafed=false, numSafed=false) {
    constructor(radix=64, urlSafed=undefined, numSafed=undefined) {
        urlSafed = urlSafed ?? (62 < radix);
        numSafed = numSafed ?? false;
        if (!(Number.isSafeInteger(radix) && 2<=radix && radix<=64)) {throw new TypeError(`radixは2〜64のNumber型整数値であるべきです。`)}
        if ('boolean'!==typeof urlSafed) {throw new TypeError(`urlSafedは真偽値であるべきです。radix=64時、真なら-_偽なら{}の記号を使用します。`)}
        if ('boolean'!==typeof numSafed) {throw new TypeError(`numSafedは真偽値であるべきです。真なら0〜Number.MAX_SAFE_INTEGERの範囲外値を代入時常に例外発生します。偽ならnumに範囲外値を代入しない限り許可します。`)}
        this._ = {radix:{num:radix, int:BigInt(radix)}, chars:{en:null, de:null}, v:{bin:null, str:null, num:null, int:null}, regexp:null, urlSafed:urlSafed, numSafed:numSafed}
        const C = urlSafed ? '-0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ_abcdefghijklmnopqrstuvwxyz' : '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz{}';
        this._.chars.en = C.slice(0, this._.radix.num);
        this._.chars.de = Object.fromEntries(Object.entries(this._.chars.en).map(([i,c])=>[c,i]));
        const R = 62 < this._.radix.num ? C.replace('{','\\{').replace('}','\\}') : C.slice(0,this._.radix.num);
        this._.regexp = new RegExp(`^[${R}]$`);
    }
    get #enChars() {return this._.chars.en}
    #getPaddingNum(I, radix) {// 値Iが基数radixの時、必要なパディング数を返す（I,radixはBigInt型。戻り値はNumber型）
        if (0n===I) {return 1;} // 0または1を扱う特殊なケース
        // BigIntを使い対数計算
        let padding = 0n;
        let power = 1n;
        while (power <= I) {
            power *= radix; //power *= BigInt(radix);
            padding++;
        }
        return Number(padding); // パディング数はNumber型で返しても一般的に問題ない
    }
    encode(bytes) {
        const I = this.#binToInt(bytes);

//        const M = I % 256n; // 余り
//        const M = I % this._.radix.int; // 余り
//        const S = this.#addZeroStr(bytes, this.#intToStr(I));
        const S = this.#addZeroStr(bytes, this.#intToStr(I), this.#getPaddingNum(I, this._.radix.int));
        return S || this.#enChars[0];
    }
    decode(str) {
        const I = this.#strToInt(str);
        const B = this.#addZeroByte(str, this.#intToBin(I));
        return new Uint8Array(B);
    }
    fromBin(b) {
        if (!this.#isBin(b)) {throw new TypeError(`引数は1バイト以上あるUint8Array型インスタンスであるべきです。`)}
        this._.v.bin = b;
        this._.v.str = this.encode(b);
        this._.v.int = this.#binToInt(b);
        this._.v.num = this.#binToNum(b);
        this.#throwUnsafed();
    }
    #throwUnsafed() {if (this._.numSafed && !this.#isNum(this._.v.num)) {throw new RangeError(`numが0〜Number.MAX_SAFE_INTEGERの範囲外です。numSafed=falseにすると範囲外も許容します。`)}}
    fromStr(s) {
        if (!this.#isStr(b)) {throw new TypeError(`引数は1字以上のString型プリミティブ値であるべきです。radix:${this._.radix.num}につき次の文字のみ使用可能です:${this._.chars.en}`)}
        this._.v.str = s;
        this._.v.bin = this.decode(s);
        this._.v.int = this.#binToInt(this._.v.bin);
        this._.v.num = this.#binToNum(this._.v.bin);
        this.#throwUnsafed();
    }
    fromInt(i) {
        if (!this.#isInt(i)) {throw new TypeError(`引数は0以上かつBigInt型プリミティブ値であるべきです。`)}
        this._.v.int = i;
        this._.v.bin = new Uint8Array(this.#intToBin(I));
        this._.v.str = this.#binToStr(this._.v.bin);
        this._.v.num = this.#binToNum(this._.v.bin);
        this.#throwUnsafed();
    }
    fromNum(n) {
        if (!this.#isNum(n)) {throw new TypeError(`引数は0以上かつNumber.isSafeInteger()を返すNumber型プリミティブ値であるべきです。`)}
        this._.v.num = n;
        this._.v.bin = new Uint8Array(this.#numToBin(n));
        this._.v.str = this.#binToStr(this._.v.bin);
        this._.v.int = this.#binToInt(this._.v.bin);
        this.#throwUnsafed();
    }
    #isBin(v) {return v instanceof Uint8Array && 0 < v.length}
    #isStr(v) {return 'string'===typeof v && 0 < v.length && ([...new Set(Array.from(v))].toString().match(this._.regexp))}
    #isNum(v) {return Number.isSafeInteger(v) && 0 <= v}
    #isInt(v) {return 'bigint'===typeof v && 0n <= v}
    #binToInt(b) {// バイト配列を一つの大きな整数に変換
        let I = 0n; // 64ビット整数を扱えるBigIntを使用
        for (let i=0; i<b.length; i++) {I = (I << 8n) | BigInt(b[i])}
        return I;
    }
    #binToNum(b) {return Number(this.#binToInt(b))}
    #binToStr(b) {return this.#intToStr(this.#binToInt(b))}
    #intToStr(i) {// 大きな整数をBase62に変換
        if (0n===i) {return this._.chars.en[0]}
        let str = '';
        while (i > 0n) {
            str = this.#enChars[Number(i % this._.radix.int)] + str;
            i = i / this._.radix.int;
        }
        return str;
    }
    #strToInt(s) {// Base62文字列を一つの大きな整数に変換
        let I = 0n;
        for (let i=0; i<s.length; i++) {
            const char = s[i];
            const index = this.#enChars.indexOf(char);
            if (index === -1) {throw new TypeError(`不正なBase62文字が含まれています:${char}`);}
            I = (I * this._.radix.int) + BigInt(index);
        }
        return I;
    }
    #intToBin(i) {// 大きな整数をバイト配列に変換
        if (0n===i) {return [0]}
        const bytes = [];
        while (i > 0n) {
            bytes.unshift(Number(i & 0xFFn));
            i = i >> 8n;
        }
        return bytes;
    }
    #numToBin(n) {return this.#intToBin(BigInt(n))}
    #addZeroStr(bytes, str) {// 元のバイト配列の先頭のゼロバイトを考慮して、結果の長さを調整
        let S = str;
        for (let i=0; i<bytes.length && bytes[i]===0; i++) {S = this.#enChars[0] + S}
        return S;
    }
    #addZeroByte(str, bytes) {// 元の文字列の先頭の "0" の数を考慮して、先頭にゼロバイトを追加
        for (let i=0; i<str.length && str[i]===this.#enChars[0]; i++) {bytes.unshift(0);}
        return bytes;
    }
    get radix() {return this._.radix.num}
//    get value() {return this._.v}
    set value(v) {
        if (this.#isBin(v)) {return this.fromBin(v)}
        else if (this.#isStr(v)) {return this.fromStr(v)}
        else if (this.#isInt(v)) {return this.fromInt(v)}
        else if (this.#isNum(v)) {return this.fromNum(v)}
        else {throw new TypeError(`型が不正です。Uint8Arrayインスタンスか、String,BigInt,Number型のプリミティブ値であるべきです。BigIntとNumberは0以上の整数、Number型ならNumber.isSafeInteger()が真を返す値のみ有効です。Stringは1字以上必要です。Uint8Arrayは1バイト以上必要です。`)}
    }
    get bin() {return this._.v.bin}
    get str() {return this._.v.str}
    get int() {return this._.v.int}
    get num() {return this._.v.num}
    set bin(v) {return this.fromBin(v)}
    set str(v) {return this.fromStr(v)}
    set int(v) {return this.fromInt(v)}
    set num(v) {return this.fromNum(v)}
    get urlSafed() {return this._.urlSafed}
    get numSafed() {return this._.numSafed}
}
class BaseCharsMaker {
    static #isSymbol(v) {return (undefined===v || null===v) || ('string'===v && 2===v.length && v.length!==(new Set(Array.from(v))).size)}
    static make(radix, sortable, urlSafed, paded, numSafed, symbols) {
        if (!(Number.isSafeInteger(radix) && ((2<=radix && radix<=64) || radix===256))) {throw new TypeError(`radixは2〜64か256のNumber型整数値であるべきです。`)}
        if ('boolean'!==typeof sortable) {throw new TypeError(`sortableはBoolean値であるべきです。`)}
        if ('boolean'!==typeof urlSafed) {throw new TypeError(`urlSafedはBoolean値であるべきです。`)}
        if ('boolean'!==typeof paded) {throw new TypeError(`padedはBoolean値であるべきです。`)}
        if ('boolean'!==typeof numSafed) {throw new TypeError(`numSafedはBoolean値であるべきです。`)}
        //if (64===radix && !((undefined===symbols || null===symbols) || ('string'===symbols && 2===symbols.length))) {throw new TypeError(`symbolsはradix=64時、undefined/null/長さ2の文字列のいずれかであるべきです。`)}
        if ([63,64].some(v=>v===radix) && !this.#isSymbol(symbols)) {throw new TypeError(`symbolsはradix=63,64時undefined/null/重複しない長さ1の2字を持つString値のいずれかであるべきです。`)}
        if (sortable && this.#isSymbol(symbols)) {throw new TypeError(`sortable=trueの場合、symbolsの指定はできません。`)}
        const N = '0123456789';
        const A = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        const a = 'abcdefghijklmnopqrstuvwxyz';
        const C = 256===radix
            ? '⠀⢀⠠⢠⠐⢐⠰⢰⠈⢈⠨⢨⠘⢘⠸⢸⡀⣀⡠⣠⡐⣐⡰⣰⡈⣈⡨⣨⡘⣘⡸⣸⠄⢄⠤⢤⠔⢔⠴⢴⠌⢌⠬⢬⠜⢜⠼⢼⡄⣄⡤⣤⡔⣔⡴⣴⡌⣌⡬⣬⡜⣜⡼⣼⠂⢂⠢⢢⠒⢒⠲⢲⠊⢊⠪⢪⠚⢚⠺⢺⡂⣂⡢⣢⡒⣒⡲⣲⡊⣊⡪⣪⡚⣚⡺⣺⠆⢆⠦⢦⠖⢖⠶⢶⠎⢎⠮⢮⠞⢞⠾⢾⡆⣆⡦⣦⡖⣖⡶⣶⡎⣎⡮⣮⡞⣞⡾⣾⠁⢁⠡⢡⠑⢑⠱⢱⠉⢉⠩⢩⠙⢙⠹⢹⡁⣁⡡⣡⡑⣑⡱⣱⡉⣉⡩⣩⡙⣙⡹⣹⠅⢅⠥⢥⠕⢕⠵⢵⠍⢍⠭⢭⠝⢝⠽⢽⡅⣅⡥⣥⡕⣕⡵⣵⡍⣍⡭⣭⡝⣝⡽⣽⠃⢃⠣⢣⠓⢓⠳⢳⠋⢋⠫⢫⠛⢛⠻⢻⡃⣃⡣⣣⡓⣓⡳⣳⡋⣋⡫⣫⡛⣛⡻⣻⠇⢇⠧⢧⠗⢗⠷⢷⠏⢏⠯⢯⠟⢟⠿⢿⡇⣇⡧⣧⡗⣗⡷⣷⡏⣏⡯⣯⡟⣟⡿⣿'
            : Array.from((sortable
                //? (urlSafed ? `-${N}${A}_${a}` : `${N}${A}${a}{}`)
                //? (urlSafed ? `-${N}${A}_${a}` : `${N}${A}${a}{}`)
                ? ((62 < radix) ? (urlSafed ? `-${N}${A}_${a}` : `${N}${A}${a}{}`) : `${N}${A}${a}`)
                : (urlSafed ? `${A}${a}${N}-_` : `${A}${a}${N}+/`)
                ).slice(0, radix));
        if (!sortable && this.#isSymbol(symbols) && [63,64].some(v=>v===radix)) {// 後ろ二字を任意の記号に変更する
            for (let i=0; 0<64-radix; i++) {C[63+i]=symbols[i]}
        }
//        if (radix!==(new Set(C)).size) {throw new TypeError(`使用文字に重複があります。:${C.join('')}`)};
        if (this.#isSymbol(symbols) && symbols.length!==(new Set(Array.from(symbols))).size) {throw new TypeError(`symbolsに重複があります。:${symbols}`)};
        return ({
            typeName: `b${radix}${(256===radix ? '' : ((sortable ? 's' : '')+(urlSafed ? 'u' : '')+(paded ? 'p' : '')+(numSafed ? 'n' : '')+(symbols ?? '')))}`,
            chars: C,
            radix: radix,
            sortable: sortable,
            urlSafed: urlSafed,
            paded: paded,
            numSafed: numSafed,
            symbols: symbols,
        });
    }
    static fromTypeName(typeName, value) {
        // ^(?<year>\d{4})(?:-(?<month>\d{2}))?(?:-(?<day>\d{2}))?$
        //typeName.mach(/^b(?<radix>\d{1,})s?u?p?n?$/);
        //typeName.mach(/^b(?<radix>\d{1,})(?<sortable>s?)(?<urlSafed>u?)(?<paded>p?)(?<numSafed>n?)(?<symbols>.{1,2})$/);
        if ('string'!==typeName) {throw new TypeError(`typeNameはString値であるべきです。`)}
        const m = typeName.mach(/^b(?<radix>\d{1,})(?:-(?<sortable>s))?(?:-(?<urlSafed>u))(?:-(?<paded>p))?(?:-(?<numSafed>n))?(?:-(?<texted>t))?(?:-(?<symbols>.{1,2}))?$/);
        if (!m) {throw new TypeError(`typeNameは不正な文字列です。:${typeName}`)}
        console.log(m);
        const b = new BaseN(parseInt(m.radix), !!m.sortable, !!m.urlSafed, !!m.paded, !!m.numSafed, !!m.texted, !!m.symbols ? m.symbols : undefined);
        if (value) { b.value = value; }
        return b;
    }
}
class BaseN {
    static get #PAD() {return '='} // base32,base64で使用する長さ調整用パディング文字
    static fromTypeName(typeName, value) {return BaseCharsMaker.fromTypeName(typeName, value)}
    static fromFull(full) {
        if ('string'!==typeof full) {throw new TypeError(`fullはString値であるべきです。`)}
        const i = full.indexOf(':');
        if (-1===i) {throw new TypeError(`引数fullには:があるはずです。`)}
        return BaseCharsMaker.fromTypeName(full.slice(0,i), full.slice(i+1));
    }
    constructor(radix=64, sortable=false, urlSafed=true, paded=false, numSafed=false, texted=false, symbols=undefined) {
        const o = BaseCharsMaker.make(radix, sortable, urlSafed, paded, numSafed, symbols);
        this._ = {radix:{num:o.radix, int:BigInt(o.radix)}, chars:{en:o.chars, de:null}, v:{bin:null, str:null, num:null, int:null, txt:null}, regexp:null, urlSafed:urlSafed, numSafed:numSafed, texted:texted}
        this._.chars.de = Object.fromEntries(Object.entries(this._.chars.en).map(([i,c])=>[c,i]));
//        const R = 62 < this._.radix.num ? C.replace('{','\\{').replace('}','\\}') : C.slice(0,this._.radix.num);
//        '.,<>=-+*!?|[](){}^$\\'
        const needEscapeChars = '.^$|\\[](){}+*?-'; // 正規表現文字クラス[]内でエスケープ必須な文字一覧
        const R = this._.chars.en.map(c=>needEscapeChars.some(e=>e===c) ? '\\'+c : c)
        this._.regexp = new RegExp(`^[${R}]$`);
    }
    /*
    constructor(radix=64, urlSafed=undefined, numSafed=undefined) {
        urlSafed = urlSafed ?? (62 < radix);
        numSafed = numSafed ?? false;
        if (!(Number.isSafeInteger(radix) && 2<=radix && radix<=64)) {throw new TypeError(`radixは2〜64のNumber型整数値であるべきです。`)}
        if ('boolean'!==typeof urlSafed) {throw new TypeError(`urlSafedは真偽値であるべきです。radix=64時、真なら-_偽なら{}の記号を使用します。`)}
        if ('boolean'!==typeof numSafed) {throw new TypeError(`numSafedは真偽値であるべきです。真なら0〜Number.MAX_SAFE_INTEGERの範囲外値を代入時常に例外発生します。偽ならnumに範囲外値を代入しない限り許可します。`)}
        this._ = {radix:{num:radix, int:BigInt(radix)}, chars:{en:null, de:null}, v:{bin:null, str:null, num:null, int:null}, regexp:null, urlSafed:urlSafed, numSafed:numSafed}
        const C = urlSafed ? '-0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ_abcdefghijklmnopqrstuvwxyz' : '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz{}';
        this._.chars.en = C.slice(0, this._.radix.num);
        this._.chars.de = Object.fromEntries(Object.entries(this._.chars.en).map(([i,c])=>[c,i]));
        const R = 62 < this._.radix.num ? C.replace('{','\\{').replace('}','\\}') : C.slice(0,this._.radix.num);
        this._.regexp = new RegExp(`^[${R}]$`);
    }
    */
    get #enChars() {return this._.chars.en}
    encode(bytes) {
        const I = this.#binToInt(bytes);
        const S = this.#addZeroStr(bytes, this.#intToStr(I));
        return S || this.#enChars[0];
    }
    decode(str) {
        const I = this.#strToInt(str);
        const B = this.#addZeroByte(str, this.#intToBin(I));
        return new Uint8Array(B);
    }
    fromBin(b) {
        if (!this.#isBin(b)) {throw new TypeError(`引数は1バイト以上あるUint8Array型インスタンスであるべきです。`)}
        this._.v.bin = b;
        this._.v.str = this.encode(b);
        this._.v.int = this.#binToInt(b);
        this._.v.num = this.#binToNum(b);
        if (this._.texted) {this._.v.txt = this.#binToTxt(b)}
        this.#throwUnsafed();
    }
    #throwUnsafed() {if (this._.numSafed && !this.#isNum(this._.v.num)) {throw new RangeError(`numが0〜Number.MAX_SAFE_INTEGERの範囲外です。numSafed=falseにすると範囲外も許容します。`)}}
    fromTxt(t) {
        if (!this.#isStr(b)) {throw new TypeError(`引数は1字以上のString型プリミティブ値であるべきです。`)}
        return this.fromBin((new TextEncoder()).encode(t));
    }
    fromStr(s) {
        if (!this.#isStr(b)) {throw new TypeError(`引数は1字以上のString型プリミティブ値であるべきです。radix:${this._.radix.num}につき次の文字のみ使用可能です:${this._.chars.en}`)}
        this._.v.str = s;
        this._.v.bin = this.decode(s);
        this._.v.int = this.#binToInt(this._.v.bin);
        this._.v.num = this.#binToNum(this._.v.bin);
        if (this._.texted) {this._.v.txt = this.#binToTxt(b)}
        this.#throwUnsafed();
    }
    fromInt(i) {
        if (!this.#isInt(i)) {throw new TypeError(`引数は0以上かつBigInt型プリミティブ値であるべきです。`)}
        this._.v.int = i;
        this._.v.bin = new Uint8Array(this.#intToBin(I));
        this._.v.str = this.#binToStr(this._.v.bin);
        this._.v.num = this.#binToNum(this._.v.bin);
        if (this._.texted) {this._.v.txt = this.#binToTxt(b)}
        this.#throwUnsafed();
    }
    fromNum(n) {
        if (!this.#isNum(n)) {throw new TypeError(`引数は0以上かつNumber.isSafeInteger()を返すNumber型プリミティブ値であるべきです。`)}
        this._.v.num = n;
        this._.v.bin = new Uint8Array(this.#numToBin(n));
        this._.v.str = this.#binToStr(this._.v.bin);
        this._.v.int = this.#binToInt(this._.v.bin);
        if (this._.texted) {this._.v.txt = this.#binToTxt(b)}
        this.#throwUnsafed();
    }
    #isBin(v) {return v instanceof Uint8Array && 0 < v.length}
    #isStr(v) {return 'string'===typeof v && 0 < v.length && ([...new Set(Array.from(v))].toString().match(this._.regexp))}
    #isNum(v) {return Number.isSafeInteger(v) && 0 <= v}
    #isInt(v) {return 'bigint'===typeof v && 0n <= v}
    #binToInt(b) {// バイト配列を一つの大きな整数に変換
        let I = 0n; // 64ビット整数を扱えるBigIntを使用
        for (let i=0; i<b.length; i++) {I = (I << 8n) | BigInt(b[i])}
        return I;
    }
    #binToNum(b) {return Number(this.#binToInt(b))}
    #binToStr(b) {return this.#intToStr(this.#binToInt(b))}
    #binToTxt(b) {return (new TextDecorder()).decode(b)}
    #txtToBin(t) {return (new TextEncorder()).encode(t)}
    #intToStr(i) {// 大きな整数をBase62に変換
        if (0n===i) {return this._.chars.en[0]}
        let str = '';
        while (i > 0n) {
            str = this.#enChars[Number(i % this._.radix.int)] + str;
            i = i / this._.radix.int;
        }
        return str;
    }
    #strToInt(s) {// Base62文字列を一つの大きな整数に変換
        let I = 0n;
        for (let i=0; i<s.length; i++) {
            const char = s[i];
            const index = this.#enChars.indexOf(char);
            if (index === -1) {throw new TypeError(`不正なBase62文字が含まれています:${char}`);}
            I = (I * this._.radix.int) + BigInt(index);
        }
        return I;
    }
    #intToBin(i) {// 大きな整数をバイト配列に変換
        if (0n===i) {return [0]}
        const bytes = [];
        while (i > 0n) {
            bytes.unshift(Number(i & 0xFFn));
            i = i >> 8n;
        }
        return bytes;
    }
    #numToBin(n) {return this.#intToBin(BigInt(n))}
    /*
    #addZeroStr(bytes, str) {// 元のバイト配列の先頭のゼロバイトを考慮して、結果の長さを調整
        let S = str;
        for (let i=0; i<bytes.length && bytes[i]===0; i++) {S = this.#enChars[0] + S}
        return S;
    }
    #addZeroByte(str, bytes) {// 元の文字列の先頭の "0" の数を考慮して、先頭にゼロバイトを追加
        for (let i=0; i<str.length && str[i]===this.#enChars[0]; i++) {bytes.unshift(0);}
        return bytes;
    }
    */
    // 元のバイト配列の先頭のゼロバイトを考慮して、結果の長さを調整
//    #addZeroStr(bytes, str, padNum) {return this._.sortable ? this.#enChars[0].repeat(padNum) + str : str + this.#PAD.repeat(padNum)};
    #addZeroStr(bytes, str, padNum) {// 元のバイト配列の先頭のゼロバイトを考慮して、結果の長さを調整
        if (this._.sortable) {
            return this.#enChars[0].repeat(padNum) + str;
//            let S = str;
//            for (let i=0; i<bytes.length && bytes[i]===0; i++) {S = this.#enChars[0] + S}
//            return S;
        } else {
            return str + BaseN.#PAD.repeat(padNum);
        }
    }
    #addZeroByte(str, bytes) {// 元の文字列の先頭の "0" の数を考慮して、先頭にゼロバイトを追加
        if (this._.sortable) {
            for (let i=0; i<str.length && str[i]===this.#enChars[0]; i++) {bytes.unshift(0);}
            return bytes;
        } else {

        }
    }
    get radix() {return this._.radix.num}
//    get value() {return this._.v}
    set value(v) {
        if (this.#isBin(v)) {return this.fromBin(v)}
        else if (this.#isStr(v)) {return this.fromStr(v)}
        else if (this.#isInt(v)) {return this.fromInt(v)}
        else if (this.#isNum(v)) {return this.fromNum(v)}
        else {throw new TypeError(`型が不正です。Uint8Arrayインスタンスか、String,BigInt,Number型のプリミティブ値であるべきです。BigIntとNumberは0以上の整数、Number型ならNumber.isSafeInteger()が真を返す値のみ有効です。Stringは1字以上必要です。Uint8Arrayは1バイト以上必要です。`)}
    }
    get bin() {return this._.v.bin}
    get str() {return this._.v.str}
    get txt() {return this._.v.txt}
    get int() {return this._.v.int}
    get num() {return this._.v.num}
    set bin(v) {return this.fromBin(v)}
    set str(v) {return this.fromStr(v)}
    set txt(v) {return this.fromTxt(v)}
    set int(v) {return this.fromInt(v)}
    set num(v) {return this.fromNum(v)}
    get urlSafed() {return this._.urlSafed}
    get numSafed() {return this._.numSafed}
    get typeName() {return this._.typeName}
    get full() {return `${this.typeName}:${this.str}`}
    to(typeName, value) {return BaseCharsMaker.fromTypeName(typeName, value ?? this._.v.bin)}
}

window.Integer = Integer;
window.Float = Float;
window.Obs = new Proxy({
    _: {
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
// MATH.PI = 3.14159; // SyntaxError`,
    },
    var: (...args)=>new ObservedObject(...args),
    fix: (...args)=>new FixedObject(...args),
    ObservedObject: ObservedObject,
    FixedObject: FixedObject,
    C: {// C=Class
        Quantity: Quantity,
        Quant: Quantity,
        Q: Quantity,
        AllFinite: AllFinite,
        UnsafedFinite: UnsafedFinite,
        Finite: Finite,
        AllFloat: AllFloat,
        UnsignedFloat: UnsignedFloat,
        UFloat: UnsignedFloat,
        Float: Float,
        Flt: Float,
        F: Float,
        RoundableFloat: RoundableFloat,
        RounderFloat: RounderFloat,
        RoundFloat: RoundFloat,
        HalfEvenFloat: HalfEvenFloat,
        FloorFloat: FloorFloat,
        TruncFloat: TruncFloat,
        CeilFloat: CeilFloat,
        AllInteger: AllInteger,
        AInt: AllInteger,
        UnsignedInteger: UnsignedInteger,
        UInt: UnsignedInteger,
        UI: UnsignedInteger,
        Integer: Integer,
        Int: Integer,
        I: Integer,
        RangedBigInteger: RangedBigInteger,
        RngBigInt: RangedBigInteger,
    },
    T: {// T=Type
        quantity:(...args)=>new Quantity(...args), // Number型を最も自由に制限できる型(naned,infinited,unsafed,unsigned,bit,min,max)
        quant:(...args)=>new Quantity(...args),
        q:(...args)=>new Quantity(...args),
        allFinite:(...args)=>new AllFinite(...args),
        aFin:(...args)=>new AllFinite(...args),
        unsafedFinite:(...args)=>new UnsafedFinite(...args),
        unFin:(...args)=>new UnsafedFinite(...args),
        finite:(...args)=>new Finite(...args),
        fin:(...args)=>new Finite(...args),
        allFloat:(...args)=>new AllFloat(...args), // AllFloatはunsignedフラグを指定できる
        aFlt:(...args)=>new AllFloat(...args),
        af:(...args)=>new AllFloat(...args),
        float:(value, min, max)=>new Float(value, min, max),
        flt:(value, min, max)=>new Float(value, min, max),
        f:(value, min, max)=>new Float(value, min, max),
        unsignedFloat:(value, min, max)=>new UnsignedFloat(value, min, max),
        unFlt:(value, min, max)=>new UnsignedFloat(value, min, max),
        uFlt:(value, min, max)=>new UnsignedFloat(value, min, max),
        ufloat:(value, min, max)=>new UnsignedFloat(value, min, max),
        uflt:(value, min, max)=>new UnsignedFloat(value, min, max),
        uf:(value, min, max)=>new UnsignedFloat(value, min, max),
        roundableFloat:(...args)=>new RoundableFloat(...args),
        roundable:(...args)=>new RoundableFloat(...args),
        rounderFloat:(...args)=>new RounderFloat(...args),
        rounder:(...args)=>new RounderFloat(...args),
        roundFloat:(...args)=>new RoundFloat(...args),
        round:(...args)=>new RoundFloat(...args),
        halfEvenFloat:(...args)=>new HalfEvenFloat(...args),
        halfEven:(...args)=>new HalfEvenFloat(...args),
        floorFloat:(...args)=>new FloorFloat(...args),
        floor:(...args)=>new FloorFloat(...args),
        truncFloat:(...args)=>new TruncFloat(...args),
        trunc:(...args)=>new TruncFloat(...args),
        ceilFloat:(...args)=>new CeilFloat(...args),
        ceil:(...args)=>new CeilFloat(...args),
        allInteger:(...args)=>new AllInteger(...args),
        allInt:(...args)=>new AllInteger(...args),
        aInt:(...args)=>new AllInteger(...args),
        aint:(...args)=>new AllInteger(...args),
        ai:(...args)=>new AllInteger(...args),
        unsignedInteger:(...args)=>new UnsignedInteger(...args),
        uInt:(...args)=>new UnsignedInteger(...args),
        uint:(...args)=>new UnsignedInteger(...args),
        ui:(...args)=>new UnsignedInteger(...args),
        integer:(...args)=>new Integer(...args),
        int:(...args)=>new Integer(...args),
        i:(...args)=>new Integer(...args),
        rangedBigInteger:(...args)=>new RangedBigInteger(...args),
        rngBigInt:(...args)=>new RangedBigInteger(...args),
        rbInt:(...args)=>new RangedBigInteger(...args),
        i8:(value, min, max)=>new Integer(value, 8, min, max),
        i16:(value, min, max)=>new Integer(value, 16, min, max),
        i32:(value, min, max)=>new Integer(value, 32, min, max),
        i53:(value, min, max)=>new Integer(value, 53, min, max),
        u8:(value, min, max)=>new UnsignedInteger(value, 8, min, max),
        u16:(value, min, max)=>new UnsignedInteger(value, 16, min, max),
        u32:(value, min, max)=>new UnsignedInteger(value, 32, min, max),
        u53:(value, min, max)=>new UnsignedInteger(value, 53, min, max),
        // 64bit整数が欲しい。BigInt型を使うしかないが計算速度が100倍遅い
        i64:(value, min, max)=>new RangedBigInteger(value, false, 64n, min, max),
        i128:(value, min, max)=>new RangedBigInteger(value, false, 128n, min, max),
        i256:(value, min, max)=>new RangedBigInteger(value, false, 256n, min, max),
        i512:(value, min, max)=>new RangedBigInteger(value, false, 512n, min, max),
        i1024:(value, min, max)=>new RangedBigInteger(value, false, 1024n, min, max),
        i2048:(value, min, max)=>new RangedBigInteger(value, false, 2048n, min, max),
        i4096:(value, min, max)=>new RangedBigInteger(value, false, 4096n, min, max),
        i8192:(value, min, max)=>new RangedBigInteger(value, false, 8192n, min, max),
        u64:(value, min, max)=>new RangedBigInteger(value, true, 64n, min, max),
        u128:(value, min, max)=>new RangedBigInteger(value, true, 128n, min, max),
        u256:(value, min, max)=>new RangedBigInteger(value, true, 256n, min, max),
        u512:(value, min, max)=>new RangedBigInteger(value, true, 512n, min, max),
        u1024:(value, min, max)=>new RangedBigInteger(value, true, 1024n, min, max),
        u2048:(value, min, max)=>new RangedBigInteger(value, true, 2048n, min, max),
        u4096:(value, min, max)=>new RangedBigInteger(value, true, 4096n, min, max),
        u8192:(value, min, max)=>new RangedBigInteger(value, true, 8192n, min, max),
        rangedBigInt:(...args)=>new RangedBigInt(...args),
        rngInt:(...args)=>new RangedBigInt(...args),
    },
    U: {// Utility
        NumberRounder: NumberRounder,
        Base: BaseFactory,
        SortBase: SortableBaseN,
    }
}, {
    get:(target, prop, receiver)=>{
        if (!(prop in target)) {throw SyntaxError(`未定義のプロパティを参照しました。version,summary,example,var,fixのみ有効です。`)}
        return target[prop];
    },
    set:(target, prop, value, receiver)=>{throw new SyntaxError(`名前空間には代入できません。`)}
});
})();
