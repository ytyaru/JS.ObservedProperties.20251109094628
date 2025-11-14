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

// JavaScriptは数をNumber型で扱うが、これは64bitメモリであり、かつIEEE754の倍精度浮動小数点数で実装されている。このため十進数表示において、整数は15桁まで、少数は17桁までは正確に表現できるが、それ以上の桁になると正確に表現できず、比較式も不正確な結果を返してしまう。しかもそれを正常とし、エラーを発生させない。
class Quantity extends Number {// NaN,Infinityを制限できるし許容もできるがNumberのように同居はしない
    static validate(value, naned=false, infinited=false, unsafed=false, unsigned=false, min=undefined, max=undefined) {
        isFloat(value, 'value');
        isBool(naned, 'naned');
        isBool(infinited, 'infinited');
        isBool(unsafed, 'unsafed');
        isBool(unsigned, 'unsigned');
        if (!isNu(min)) {isFloat(min, 'min')}
        if (!isNu(max)) {isFloat(max, 'max')}
        // 整合性(!Number.isSafeInteger(value)だと整数でなく少数が入った時に必ずエラーに成ってしまう。IsSafe()関数があれば良かったのに存在しない……)
        if(!unsafed && (value < Number.MIN_SAFE_INTEGER || Number.MAX_SAFE_INTEGER < value)) {throw new TypeError(`非安全な整数値は許可されておらず代入できません。unsafed=trueにしてください。`)}
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
        };
    }
    constructor(value, naned=false, infinited=false, unsafed=false, unsigned=false, min=undefined, max=undefined) {
        super(value);
        this._ = Quantity.validate(value, naned, infinited, unsafed, unsigned, min, max);
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
class Float extends Quantity {// NaN,Infinityを制限した有限数
    static validate(value, unsafed=false, unsigned=false, min=undefined, max=undefined) {
        return Quantity.validate(value, false, false, unsafed, unsigned, min, max);
    }
    constructor(value, unsafed=false, unsigned=false, min=undefined, max=undefined) {
        super(value, false, false, unsafed, unsigned, min, max);
    }
    validate(v) {return Float.validate(v ?? this.value, this._.unsafed, this._.unsigned, this._.min, this._.max);}
    nearlyEqual(x, y) {// 等号===の代替。JSのNumber型は64bit浮動少数点数であり比較等号===では完全一致確認できない（console.assert(0.3===0.1+0.2）でエラーになる）これをいくらか解決する。但し15桁の少数まで。console.assert(nearlyEqual(0.3, 0.1+0.2))でエラーにならない。
        if (parseInt(x) !== parseInt(y)) {return false}
        const T = parseInt(Math.abs(x + y));
        const tolerance = T < 1 ? Number.EPSILON : Number.EPSILON * T;
        return Math.abs(x - y) < tolerance;
    }
    // get/setは二つで一つなのでsetしか変更せずともgetも再定義する必要がある。じつに不便かつ分かり難い言語仕様。
    get value() {return super.value}
    set value(v) {
        super.value = v;
        // min, maxと同じ値の時だけは等号===比較できるよう同一値をセットして誤差による比較失敗を避ける。nearlyEqualの使用をせずとも成功させる。
        if (this._.min) { this.#setNearlyValue(this._.min); }
        if (this._.max) { this.#setNearlyValue(this._.max); }
        this.validate(v);
    }
    #setNearlyValue(t) {if (this.nearlyEqual(t, super.value)) {super.value = t}} // ほぼ同じ値ならピッタリの値をセットする。等号===比較できるように。
}
class Rate extends Float { constructor(value) {super(value, false, true, 0, 1)} }// 比率(0〜1の実数)
class Percent extends Float { constructor(value) {super(value, false, true, 0, 100)} }// 百分率(0〜100の実数)

// 最近接遇数丸め（銀行家丸め。四捨五入時に5の時偶数になるほうへ丸める）
// roundToNearestEven()
// roundToEven()
console.log(Math)
console.log(Math.prototype)
Math.isOdd = function(v) {return 0!==(v % 2)} // 1===だと -1 が渡された時バグった
Math.isEven = function(v) {return 0===(v % 2)}
Math.roundToEven = function(v) {
    const I = Math.trunc(v);
    const F = v - I;
    const G = Math.trunc(F * 10); // 少数第一位の整数値(0〜9)
    const [C, T] = [Math.ceil(v), Math.trunc(v)];
    return 5 < G ? C : (G < 5) ? T : this.isEven(C) ? C : T; // 少数第一位の整数値が5なら偶数に丸める。他は四捨五入と同じ
//    const [C, T] = [Math.ceil(v), Math.trunc(v)];
//    return this.isEven(C) ? C : T;
}
/*
Math.prototype.isOdd = function(v) {return 1===(v % 2)}
Math.prototype.isEven = function(v) {return 0===(v % 2)}
Math.prototype.roundToEven = function(v) {
    const [C, T] = [Math.ceil(v), Math.trunc(v)];
    return this.isEven(C) ? C : T;
}
*/

// 負数時の丸める方向をマイナスにする（標準Math.round()等はプラス方向）
// https://qiita.com/y-some/items/27ddb39222d528aef7ac
// JS:プラス方向, Excel:マイナス方向
class SignedNumberRounder {
    static round() {

    }
    static #round(method, value, fractionDigits=1) { // precision 精度

    }
}

// 丸め
// https://qiita.com/k8o/items/fec737cdcc290776a9ac
class NumberRounder {
    //const round = (radix: number, fractionDigits = 1) {
        /*
    round(radix, fractionDigits=1) {
        const [mantissa, exponent] = `${radix}e`.split('e');
        const value = Math.round(
            Number(`${mantissa}e${Number(exponent ?? '') + fractionDigits}`)
        );
        const [calcedMantissa, calcedExponent] = `${value}e`.split('e');
        return Number(`${calcedMantissa}e${
            Number(calcedExponent ?? '') - fractionDigits
        }`);
    };
    */
    static round(radix, fractionDigits=1) {return this.#round('round', radix, fractionDigits);} // 四捨五入
    static roundToEven(radix, fractionDigits=1) {return this.#round('roundToEven', radix, fractionDigits);} // 最近接偶数丸め（四捨五入の対象が5の時偶数になるようにする）
    static ceil(radix, fractionDigits=1) {return this.#round('ceil', radix, fractionDigits);} // 切り上げ
    static floor(radix, fractionDigits=1) {return this.#round('floor', radix, fractionDigits);} // 切り捨て（負数はより大きい負数になってしまうことがあり単純な切り捨てでない）
    static trunc(radix, fractionDigits=1) {return this.#round('trunc', radix, fractionDigits);} // 切り捨て（負数も単純な切り捨てになる）
    static #round(method, radix, fractionDigits=1) {// 指定した少数桁で丸める（標準APIは少数第一位固定）
        const [mantissa, exponent] = `${radix}e`.split('e');

        const S = (radix < 0) ? -1 : 1;
        const P = Math.pow(10, fractionDigits);
        const N = Number(`${mantissa}e${Number(exponent ?? '') + fractionDigits}`);
        const value = Math[method]((N * S) * P) / P * S;

        /*
        const value = Math[method](
            Number(`${mantissa}e${Number(exponent ?? '') + fractionDigits}`)
        );
        */
        const [calcedMantissa, calcedExponent] = `${value}e`.split('e');
        return Number(`${calcedMantissa}e${
            Number(calcedExponent ?? '') - fractionDigits
        }`);
        /*
        */
        /*
        return Number(`${calcedMantissa}e${
            Number(calcedExponent ?? '') - fractionDigits
        }`) * ((radix < 0) ? -1 : 1); // https://qiita.com/y-some/items/27ddb39222d528aef7ac
        */
    };
}
/*
function round(radix, fractionDigits=1) {
    const [mantissa, exponent] = `${radix}e`.split('e');
    const value = Math.round(
        Number(`${mantissa}e${Number(exponent ?? '') + fractionDigits}`)
    );
    const [calcedMantissa, calcedExponent] = `${value}e`.split('e');
    return Number(`${calcedMantissa}e${
        Number(calcedExponent ?? '') - fractionDigits
    }`);
}
console.log(round(1.5, 0));
console.log(round(2.5, 0));
console.log(round(1.54, 1));
console.log(round(1.55, 1));
*/

//class DecimalFloat extends Float {// IEEE754による倍精度浮動小数点数であり誤差はあるが、文字列化した時だけはその誤差を修正する（少数部を整数化して四捨五入する）
//class FixedFloat extends Float {// IEEE754による倍精度浮動小数点数であり誤差はあるが、文字列化した時だけはその誤差を修正する（少数部を整数化して四捨五入する）
//class RoundedFloat extends Float {// IEEE754による倍精度浮動小数点数であり誤差はあるが、文字列化した時だけはその誤差を丸める（少数部を整数化して切り捨てた文字を返す）
class TruncFloat extends Float {// IEEE754による倍精度浮動小数点数であり誤差はあるが、文字列化した時だけはその誤差を修正する（少数部を整数化して切り捨てた文字を返す）
    static get MIN_FIG() {return 0}
    static get MAX_FIG() {return 15}
    static validValueFig(valueFig) {
        // Number 1個: [value, fig=0]
        // [N, N]:     [value, fig]
        // '0.1200':   [parseFloat('0.1200'), '0.1200'.split('.').length]
        const V = ((v)=>{
            if (Number.isSafeInteger(v)) { return [v, 0] }// 123（少数部桁数は0とする（小数点は表示せず小数点以下で四捨五入した文字列を返す））
            else if (Array.isArray(v) && 2===v.length && v.every(x=>'number'===x)) {return v}
            else if ('string'===typeof v && v.match(/^\d+\.\d$/)) {return [parseFloat(v), v.split('.')[1].length]}
            else {throw new TypeError(`valueFigは[初期値, 少数部桁数]で指定してください。またはNumber型値一個で[任意値,0]、String型値一個(例:'2.3400')で[parsefloat('2.3400'), 少数部桁数(この場合4)])のように短縮指定できます。:${v}`)};
            /*
            else if ('string'===typeof v && v.match(/^\d+\.\d/$)) {// '123.45' 初期値から桁数も指定する。十進数表記のみ有効。0b001, 0o777, 0xFFなどは無効
                const [I,F] = v.split('.');
                return [parseFloat(v), F.length];
            }
            else {throw new TypeError(`valueFigは[初期値, 少数部桁数]で指定してください。またはNumber型値で[任意値,0]、String型値'2.3400'で[parsefloat('2.3400'), 少数部桁数(この場合4)])で指定してください。:${v}`)})();
            */
        })(valueFig);
        if (V[1] < FixedFloat.MIN_FIG || FixedFloat.MAX_FIG < V[1]) {throw new TypeError(`figは0〜15の整数値であるべきです。`)}
        return ({value:V[0], fig:V[1]});
    }
    constructor(valueFig, unsafed=false, unsigned=false, min=undefined, max=undefined) {
        const o = DecimalFloat.validValueFig(valueFig);
        super(0, unsafed, unsigned, min, max);
        this._ = {...this._, ...o};
    }
    toFixed(fig) {return Number.toFixed(fig ?? this._.fig)} // 123.456789, fig:2 => 123.46
    toTrunc(fig) {
        if (Number.isSafeInteger(fig) && (V[1] < FixedFloat.MIN_FIG || FixedFloat.MAX_FIG < V[1])) {throw new TypeError(`figは0〜15の整数値であるべきです。`)}
        const D = 10**this._.fig; // 0:1, 1:10, 2:100, ... figが15までであるべき理由はNumber型の整数が十進数の15桁までしか安全に計測できないから。
        const I = Math.trunc(this.value);
        const F = this.value - I;
        const G = Math.trunc(F * D); // 123.456789 * 1000 = 123.456 => '123.456'
        return `${I}.${G}`; // FixedFloat([123.45678, 2]).toTrunc(): 123.45
    }
    toString(radix=10) {return 10===radix ? this.toTrunc(this._.fig) : super.toString(radix);}
}
class NumberDecimal extends Float {// 十進数における整数と少数を合わせて15桁までの有限数(IEEE754において整数部は15桁までが正確に表現できる上限)
    //static validate(value, fig, unsigned=false, min=undefined, max=undefined) {
    static validate(fig, value=0, unsigned=false, min=undefined, max=undefined) {
        this.validFig(fig);
        const o = Float.validate(value, false, unsigned, min, max);
        const p = this.validValue(value);
        const i = Math.trunc(p.value);
        return {...o, ...p, fig:fig, part:{i:i, f:p.value-i}};
    }
    static validFig(fig) {if(!(Number.isSafeInteger(fig) && this.MIN_FIG<=fig && fig<=this.MAX_FIG)){throw new TypeError(`figは0〜15の整数値であるべきです。:${fig}`)}}
    static get MIN_FIG() {return 0}
    static get MAX_FIG() {return 15}
    static validValue(v) {
        console.log(v);
        const V = (()=>{
            if (Number.isSafeInteger(v)) { return ({i:v, f:0, fig:-1}) }// 123（少数部の初期値は省略し0とする。但し桁数は別途指定する）
            else if ('string'===typeof v && -1 < v.indexOf('.')) {// '123.45' 初期値から桁数も指定する
                const s = v.split('.');
                const [i, f] = s.map(x=>parseInt(x));
                return ({i:i, f:f, fig:s[1].length});
            }
            // [整数部, 少数部] 両方共Number型整数値で示す。初期値から桁数も指定する。
            //else if (Array.isArray(v) && 2===v.length && v.every(x=>Number.isSafeInteger(x))) { return ({i:v[0], f:v[1], fig:Math.log10(v[1])}) }
            else if (Array.isArray(v) && 2===v.length && v.every(x=>Number.isSafeInteger(x))) {
                const [i, f] = [...v];
                console.log('fig:', `${Math.abs(f)}`.length, `${Math.abs(f)}`, f);
                //return ({i:i, f:f, fig:`${0 < f ? f*-1 : f}`.length});
                return ({i:i, f:f, fig:`${Math.abs(f)}`.length});
            }
            else {throw new TypeError(`valueはNumber.isSafeInteger()値、'123.45'等の文字列、[整数部,少数部]の配列(両方共Number型整数値)であるべきです。:${v}`)}
        })();
        console.log(V);
        if (!'i f'.split(' ').every(n=>Number.isSafeInteger(V[n]))) {throw new TypeError(`valueは整数部、少数部共にNumber.isSafeInteger()が真を返す値であるべきです。`)}
        return V;
     }
    validValue(v) {
        if (Number.isSafeInteger(v)) {// 123（少数部の初期値は省略し0とする。但し桁数は別途指定する）
            const i = v;
            const f = 0;
        } else if ('string'===typeof v && -1 < v.indexOf('.')) {// '123.45' 初期値から桁数も指定する
            const s = v.split('.');
            const [i, f] = s.map(x=>parseInt(x));
            const fig = s[1].length;
        } else if (Array.isArray(v) && 2===v.length && v.every(x=>Number.isSafeInteger(x))) { // [整数部, 少数部] 両方共Number型整数値で示す。初期値から桁数も指定する。
            const [i, f] = [...v];
            const fig = Math.log10(f);
        } else {throw new TypeError(`valueはNumber.isSafeInteger()値、'123.45'等の文字列、[整数部,少数部]の配列(両方共Number型整数値)であるべきです。`)}
        
    }
    //constructor(value, fig, unsigned=false, min=undefined, max=undefined) {
    constructor(fig, value=0, unsigned=false, min=undefined, max=undefined) {
//        const o = NumberDecimal.validValue(value);
//        fig = fig ?? o.fig;
//        value = o.i + (o.f / this.#figP);
//        let F = o.i + (o.f / ((10)**fig));
        //super(value, fig, false, unsigned, min, max);
        //constructor(value, unsafed=false, unsigned=false, min=undefined, max=undefined) {
        //super(value, false, unsigned, min, max);
        super(0, false, unsigned, min, max);
        //this._ = NumberDecimal.validate(value, fig, unsigned, min, max);
//        this._ = NumberDecimal.validate(fig, value, unsigned, min, max);

        const p = NumberDecimal.validValue(value);
        const i = Math.trunc(p.value);
        //this._ = {...this._, ...p, fig:fig, part:{i:i, f:p.value-i}};
        this._ = {...this._, fig:p.fig, part:{i:p.i, f:p.f}};
        console.log(this._, p);
//        this.validFig(fig);
//        this._.fig = fig;
//        this._.part = {i:Math.trunc(this._.value), f:this._.value - Math.trunc(this._.value)};
    }
    validate(v) {return NumberDecimal.validate(v ?? this.value, this._.fig, this._.unsigned, this._.min, this._.max)}
    get value() {return super.value}
    set value(v) {
        /*
        if (v instanceof NumberDecimal) { this.partI = v.partI; this.partF = v.partF; }
//        else if ('number'===typeof v && Number.MIN_SAFE_INTEGER<=v && v<=Number.MAX_SAFE_INTEGER) {  } // IEEE754倍精度浮動小数点数だと誤差が生じるため禁止
        else if (Array.isArray(v) && 2===v.length && (v.every(x=>('number'===typeof v && Number.MIN_SAFE_INTEGER<=v && v<=Number.MAX_SAFE_INTEGER)))) { this.partI = v[0]; this.partF = v[1]; }
        else if (null!==v && 'object'===typeof v && '[object Object]'===v.prototype.toString() && ['i','f'].every(n=>v.hasOwnProperty(n) && ('number'===typeof v && Number.MIN_SAFE_INTEGER<=v && v<=Number.MAX_SAFE_INTEGER))) { this.partI = v.i; this.partF = v.f; }
        else {throw new TypeError(`代入値の型が不正です。NumberDecimal型インスタンスか[整数部,少数部]の整数値2個入配列であるべきです。`)}
//        this._.value = this.partI + (this.partF / ((10)**this._.fig));
//        super.value = v;
        */
        /*
        if (v instanceof NumberDecimal) { this.set(v.partI, v.partF); }
//        else if ('number'===typeof v && Number.MIN_SAFE_INTEGER<=v && v<=Number.MAX_SAFE_INTEGER) {  } // IEEE754倍精度浮動小数点数だと誤差が生じるため禁止
        else if (Array.isArray(v) && 2===v.length && (v.every(x=>('number'===typeof v && Number.MIN_SAFE_INTEGER<=v && v<=Number.MAX_SAFE_INTEGER)))) { this.set(...v); }
        else if (null!==v && 'object'===typeof v && '[object Object]'===v.prototype.toString() && ['i','f'].every(n=>v.hasOwnProperty(n) && ('number'===typeof v && Number.MIN_SAFE_INTEGER<=v && v<=Number.MAX_SAFE_INTEGER))) { this.set(v.i, v.f); }
        else {throw new TypeError(`代入値の型が不正です。NumberDecimal型インスタンスか[整数部,少数部]の整数値2個入配列であるべきです。`)}
        */
        if (v instanceof NumberDecimal) { this.set(v.partI, v.partF); }
//        else if ('number'===typeof v && Number.MIN_SAFE_INTEGER<=v && v<=Number.MAX_SAFE_INTEGER) {  } // IEEE754倍精度浮動小数点数だと誤差が生じるため禁止
        else if (Array.isArray(v) && 2===v.length) { this.set(...v); }
        else if (null!==v && 'object'===typeof v && '[object Object]'===v.prototype.toString() && ['i','f'].every(n=>v.hasOwnProperty(n))) { this.set(v.i, v.f); }
        else {throw new TypeError(`代入値の型が不正です。NumberDecimal型インスタンスか[整数部,少数部]の整数値2個入配列であるべきです。`)}
    }
    set(i, f) {
        if (![i,f].every(v=>Number.isSafeInteger(v))) {throw new TypeError(`代入値の値が不正です。Number.isSafeInteger()が真を返す値であるべきです。`)}
        this.#withinI(i, true);
        this._.part.i = v;
        const P = this.#figP;
        if (0 < this._.fig) {
            this.#withinF(f, true);
            const g = this.partF + f;
            const I = Math.trunc(g / P); // 繰り上がった整数部
            const F = (g % P);           // 余った少数部
            this._.part.i += I;
            this._.part.f = F;
        }
        this.#withinI(this._.part.i);
        this.#withinF(this._.part.f);
        this._.value = this._.part.i + (this._.part.f / P); // Number型倍精度浮動小数点数。それとも文字列で扱うべきか。誤差のない完全一致をさせるためには文字列。
        //if (![i,f].every(n=>v.hasOwnProperty(n) && ('number'===typeof v && Number.MIN_SAFE_INTEGER<=v && v<=Number.MAX_SAFE_INTEGER))) {throw new TypeError(`代入値の値が不正です。Number.isSafeInteger()が真を返す値であるべきです。`)}
        /*
        const [i, f] = (v instanceof NumberDecimal) ? [v.partI, v.partF]
            : ((Array.isArray(v) && 2===v.length) ? (...v)
            : [null, null]);
        this.set(i, f);
        if (![i,f].every(x=>Number.isSafeInteger(x)) {throw new TypeError(`代入値はNumber.isSafeInteger()が真を返す値であるべきです。`)}
        this.partI = i;
        this.partF = i;

        if (![i,f].every(x=>'number'===typeof x && Number.MIN_SAFE_INTEGER<=x && x<=Number.MAX_SAFE_INTEGER)) {throw new TypeError(`代入値はNumber.isSafeInteger()が真を返す値であるべきです。`)}
        if (v instanceof NumberDecimal) { this.partI = v.partI; this.partF = v.partF; }
//        else if ('number'===typeof v && Number.MIN_SAFE_INTEGER<=v && v<=Number.MAX_SAFE_INTEGER) {  } // IEEE754倍精度浮動小数点数だと誤差が生じるため禁止
        else if (Array.isArray(v) && 2===v.length && (v.every(x=>('number'===typeof v && Number.MIN_SAFE_INTEGER<=v && v<=Number.MAX_SAFE_INTEGER)))) { this.partI = v[0]; this.partF = v[1]; }
        else if (null!==v && 'object'===typeof v && '[object Object]'===v.prototype.toString() && ['i','f'].every(n=>v.hasOwnProperty(n) && ('number'===typeof v && Number.MIN_SAFE_INTEGER<=v && v<=Number.MAX_SAFE_INTEGER))) { this.partI = v.i; this.partF = v.f; }
        else {throw new TypeError(`代入値の型が不正です。NumberDecimal型インスタンスか[整数部,少数部]の整数値2個入配列であるべきです。`)}
        */
        /*
        if (0===this._.fig) {return} // 少数部が0桁なのに値をセットしようとした時は無視する
        //if (v < this.minFI || this.maxFI < v) {throw new RangeError(`代入値が範囲外です。代入値:${v} 範囲:${this.minFI}〜${this.maxFI}`)}
//        if (!Number.isSafeInteger(v) || (v < this.minFI || this.maxFI < v)) {throw new RangeError(`代入値が範囲外です。代入値:${v} 範囲:${this.minFI}〜${this.maxFI}`)}
//        if (!(Number.isSafeInteger(v) && this.minFI <= v && v <= this.maxFI)) {throw new RangeError(`代入値が範囲外です。代入値:${v} 範囲:${this.minFI}〜${this.maxFI}`)}
        this.#withinF(v, true);
//        const P = ((10)**this._.fig);
        const P = this.#figP;
        const f = this.partF + v;
        const I = Math.trunc(f / P);
        const F = (f % P);
        this._.part.i += I;
        this.#withinI(this._.part.i);
        this._.part.f = F;
        this.#withinF(this._.part.f);
        this.value = this._.part.i + (this._.part.f / P);
        */
    }
    get fig() {return this._.fig} // 少数部の桁数
    get intFig() {return NumberDecimal.MAX_FIG - this._.fig} // 整数部の桁数
    #decStr(isN) {return `${isN ? '-' : ''}`+'9'.repeat(this.intFig)}// 十進数最大値用文字列 99999 等
    #decInt(isN) {return parseInt(this.#decStr(isN))}// 十進数最大値用文字列 99999 等
    get minI() {return this._.unsigned ? 0 : this.#decInt(true)} // 整数部の最小値
    get maxI() {return this.#decInt()} // 整数部の最大値

//    get partI() {return Math.trunc(this.value)} // 整数部を返す
//    get partF() {return this.value - Math.trunc(this.value)} // 少数部を返す
    get partI() {return this._.part.i} // 整数部を返す
    get partF() {return this._.part.f} // 少数部を返す
    get #figP() {return (10)**this._.fig} // 0:1, 1:10, 2:100, ...
    #withinI(v,isP) {if (!(Number.isSafeInteger(v) && this.minI <= v && v <= this.maxI)) {throw new RangeError(`${isP ? '引数の' : ''}整数部が範囲外です。代入値:${v} 範囲:${this.minI}〜${this.maxI}`)}}
    #withinF(v,isP) {if (!(Number.isSafeInteger(v) && this.minFI <= v && v <= this.maxFI)) {throw new RangeError(`${isP ? '引数の' : ''}少数部が範囲外です。代入値:${v} 範囲:${this.minFI}〜${this.maxFI}`)}}
    set partI(v) {// 整数部に代入する
        //if (v < this.minI || this.maxI < v) {throw new RangeError(`代入値が範囲外です。代入値:${v} 範囲:${this.minI}〜${this.maxI}`)}
//        if (!(Number.isSafeInteger(v) && this.minI <= v && v <= this.maxI)) {throw new RangeError(`代入値が範囲外です。代入値:${v} 範囲:${this.minI}〜${this.maxI}`)}
        this.#withinI(v, true);
        this._.part.i += v;
        this.#withinI(this._.part.i);
//        this._.value = this._.part.i + (this._.part.f / ((10)**this._.fig));
//        this._.value = this._.part.i + ((0===this._.fig) ? 0 : (this._.part.f / this.#figP));
        this._.value = this._.part.i + (this._.part.f / this.#figP);
    }
    set partF(v) {// 少数部に代入する（値はNumber型の整数）少数で代入したい場合はvalueで整数部を含めてする。少数部だけで代入する時は正確に指定できる整数で代入する。
        if (0===this._.fig) {return} // 少数部が0桁なのに値をセットしようとした時は無視する
        //if (v < this.minFI || this.maxFI < v) {throw new RangeError(`代入値が範囲外です。代入値:${v} 範囲:${this.minFI}〜${this.maxFI}`)}
//        if (!Number.isSafeInteger(v) || (v < this.minFI || this.maxFI < v)) {throw new RangeError(`代入値が範囲外です。代入値:${v} 範囲:${this.minFI}〜${this.maxFI}`)}
//        if (!(Number.isSafeInteger(v) && this.minFI <= v && v <= this.maxFI)) {throw new RangeError(`代入値が範囲外です。代入値:${v} 範囲:${this.minFI}〜${this.maxFI}`)}
        this.#withinF(v, true);
//        const P = ((10)**this._.fig);
        const P = this.#figP;
        const f = this.partF + v;
        const I = Math.trunc(f / P);
        const F = (f % P);
        this._.part.i += I;
        this.#withinI(this._.part.i);
        this._.part.f = F;
        this.#withinF(this._.part.f);
        this.value = this._.part.i + (this._.part.f / P);
    }

    get minF() {return 0===this._.fig ? 0 : (0.1)**this._.fig} // 少数部の最小値を少数で返す
    get maxF() {return 0===this._.fig ? 0 : this.maxFI / ((10)**this._.fig)} // 少数部の最小値を少数で返す
    get minFI() {return 0===this._.fig ? 0 : 1} // 少数部の最小値を整数で返す
    get maxFI() {return 0===this._.fig ? 0 : ((10)**this._.fig)-1} // 少数部の最大値を整数で返す
    toFixed(FIG) {
        const fig = FIG ?? this._.fig;
//        if (!(Number.isSafeInteger(fig) && 0<=fig && fig<=100)) {throw new TypeError(`figは0〜100までの整数であるべきです。`)}
//        if (this._.fig < FIG) {return throw new RangeError(`figが範囲外です。${NumberDecimal.MIN_FIG}〜${this._.fig} までの整数値であるべきです。`)}
        if (!(Number.isSafeInteger(fig) && 0<=fig && fig<=this._.fig)) {throw new TypeError(`figは ${NumberDecimal.MIN_FIG}〜${this._.fig} の整数であるべきです。`)}
        const I = Math.trunc(v);
        const D = Math.pow(10, fig);
        const d = Math.trunc(v * D);
        // 「figが範囲外です」エラーが出るため、このエラーは出ないはず。だが、念の為に実装しておく。
        if (!Number.isSafeInteger(d)) {throw new TypeError(`安全に変換できる範囲を超過しました。整数部の値、少数部の桁数fig、または両方を減らしてください。`)}
        const F = parseInt(d.toString().slice(I.toString().length));
        return `${this._.I}.${this._.F}`; // 整数部, 少数部それぞれに対してのゼロ埋めやスペース埋めをどうするか
        /*
        this._.I = I;
        this._.F = parseInt(d.toString().slice(I.toString().length));
        this._.S = `${this._.I}.${this._.F}`; // 整数部, 少数部それぞれに対してのゼロ埋めやスペース埋めをどうするか
        this._.N = parseFloat(this._.S); // d / D
        */
    }
    // 加算、減算、乗算、除算、剰余、冪乗
    // 変更対象：自身の変数／新しいNumberDecimal／引数に渡されたNumberDecimalインスタンス
    #isT(x) {if (!(x instanceof NumberDecimal)) {throw new TypeError(`xはNumberDecimalであるべきです。`)}}
    add(x) {
        this.#isT(x);
        this.partI += x.partI;
        this.partF += x.partF;
        return this;
    }
//    add(x) {}
    sub(x) {}
    mul(x) {}
    div(x) {}
    sur(x) {}
    pow(x) {}
    
    toAdd(x) {}
    toSub(x) {}
    toMul(x) {}
    toDiv(x) {}
    toSur(x) {}
    toPow(x) {}

    addTo(x) {}
    subTo(x) {}
    mulTo(x) {}
    divTo(x) {}
    surTo(x) {}
    powTo(x) {}
}
/*
class IntegerNumberDecimal extends NumberDecimal {// 十進数における整数と少数を合わせて15桁までの有限数(IEEE754において整数部は15桁までが正確に表現できる上限)
    constructor(value=0, unsigned=false, min=undefined, max=undefined) { super(0, value, unsigned, min, max) }
}
*/
class IntegerDecimal {// 十進数における整数と少数をBigIntで管理する
    constructor() {

    }
}
class StringDecimal {// 十進数における整数と少数をStringで管理する

}
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
            if (options[k].hasOwnProperty('value') && options[k].value instanceof ObservedObject) {continue}
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
        const isObs = (v instanceof ObservedObject);
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
class ObservedObject {
    constructor(iOpt, oOpt, update) {
        this._ = {opt:{}, prop:{}, primIns:{}, onSet:{}, onChange:{}, update:(i,o)=>{}};
        this.#checkArgs(iOpt, oOpt, update);
        this.#checkKeys(iOpt)
        this.#setDefaultOptions(iOpt);
        for (let [k, v] of Object.entries(this._.opt)) { this.#makeDescriptor(k, v); }
        this._.oOpt = ([undefined,null].some(v=>v===oOpt)) ? ({}) : (oOpt instanceof ObservedObject) ? oOpt : new ObservedObject(oOpt);
        if ('function'===typeof update) {this._.update = update;}
        this.#update();
//        console.log(this);
        return this.#makeProxy();
    }
    #checkArgs(iOpt, oOpt, update) {
        const isObj = (v)=>null!==v && 'object'===typeof v && '[object Object]'===Object.prototype.toString.call(v);
        if (!isObj(iOpt)) {throw new TypeError(`第一引数iOptはプロパティ名とその型などの情報を持つオブジェクトであるべきです。例:{name:{value:''}, age:{value:0, valid:Obs.valid.range(0,100)}}`)}
        if (undefined!==oOpt && null!==oOpt && !isObj(oOpt) && !(oOpt instanceof ObservedObject)) {throw new TypeError(`第二引数oOptはObsインスタンスまたはプロパティ名とその型などの情報を持つオブジェクトであるべきです。例:{name:{value:''}, age:{value:0, valid:Obs.valid.range(0,100)}}`)}
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
            if (iOpt.hasOwnProperty('value') && iOpt.value instanceof ObservedObject) {continue}
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
        const isObs = (v instanceof ObservedObject);
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
        Q: Quantity,
        Quant: Quantity,
        Quantity: Quantity,
        F: Float,
        Flt: Float,
        Float: Float,
        I: Integer,
        Int: Integer,
        Integer: Integer,
        NumberDecimal: NumberDecimal,
        NumDec: NumberDecimal,
        IntegerDecimal: IntegerDecimal,
        IntDec: IntegerDecimal,
    },
    T: {// T=Type
        i:(...args)=>new Integer(...args),
        int:(...args)=>new Integer(...args),
        integer:(...args)=>new Integer(...args),
        f:(...args)=>new Float(...args),
        flt:(...args)=>new Float(...args),
        float:(...args)=>new Float(...args),
        number10:(...args)=>new NumberDecimal(...args),
        num10:(...args)=>new NumberDecimal(...args),
        n10:(...args)=>new NumberDecimal(...args),
//        numdec:(...args)=>new NumberDecimal(...args),
//        ndec:(...args)=>new NumberDecimal(...args),
//        intdec:(...args)=>new IntegerDecimal(...args),
//        idec:(...args)=>new IntegerDecimal(...args),
    },
    U: {// Utility
        NumberRounder: NumberRounder,
    }
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
//window.Obs = ObservedObject;
window.Obs = new Proxy({}, {
    get:(target, prop, receiver)=>{
        console.log(target, prop, receiver);
        if ('version'===prop) {return '0.0.1'}
        else if ('summary'===prop) {return 'Observerオブジェクトを生成します。リアクティブ・プログラミングに最適です。'}
        else if ('example'===prop) {return "const o = Obs.var({name:{value:'Bob'}, age:{value:12}}, {msg:{value:''}}, (i,o)=>o.msg=`My name is ${i.name}, ${i.age} years old.`);\nconsole.assert('My name is Bob, 12 years old.'===o.$.msg);\no.name = 'John';\no.age = 24;\nconsole.assert('My name is John, 24 years old.'===o.$.msg);"}
        else if ('var'===prop) {return ObservedObject.constructor}
        else if ('fix'===prop) {return FixedObject.constructor}
        else {throw new SyntaxError(`未定義のプロパティを参照しました。var,fix,version,summaryのいずれかのみ有効です。`);}
    },
    set:()=>{throw new SyntaxError(`名前空間には代入できません。`)}
});
*/
})();
