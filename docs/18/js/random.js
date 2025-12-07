(function(){
// 乱数生成
// * 均等分布／偏り
// * 型(TypedArray/Number/BigInt/String(Base2〜64))
const _seq = (num)=>[...Array(num)].map((_,i)=>i); // n=5: 0,1,2,3,4
const _deq = (num)=>[...Array(num)].map((_,i)=>num-i-1); // n=5: 4,3,2,1,0
const _feq = (num,fn)=>[...Array(num)].map((_,i)=>fn(num,i));
//const seq = (n)=>Number.isSafeInteger(n) ? (n < 0 ? _deq(n*-1) : _seq(n)) : ((()=>{throw new TypeError(`nは安全な整数値であるべきです。`)})());
const seq = (n,f)=>Number.isSafeInteger(n) ? 'function'===typeof f && 0<n ? _feq(n,f) ? : (n<0 ? _deq(n*-1) : _seq(n)) : ((()=>{throw new TypeError(`nは安全な整数値であるべきです。第二引数に関数を指定した場合nは1以上の整数値であるべきです。`)})());
const seq2p = (num)=>seq(num,(n,i)=>2**i);
const isSafeInt = (n)=>Number.isSafeInteger(n);
const throwSafeInt = (n,N)=>{if (!isSafeInt(n)) {throw new TypeError(`${N ? N+'は' : ''}安全な整数値であるべきです。`)}};
const isPowerOfTwo = (n)=>Number.isSafeInteger(n) && 0 < n && 0===(n & (n - 1));
Array.prototype.shuffle = function() {// 配列要素の順番をランダムに入れ替える
    const R = [...this];
    for (let i=R.length-1; i>0; i--) {
        const rand = window.crypto.getRandomValues(new Uint32Array(1));
        const j = rand[0] % (i + 1);
        [R[i], R[j]] = [R[j], R[i]];
    }
    return R;
}
class CSPRBGT {// Cryptographically Secure Pseudo Random Binary Generator Type
    static bits(bits) {return this.#random(Math.ceil(bits/8))}
    static bytes(bytes) {return this.#random(bytes)}
    static bits2p(bits) {
        if (!(this.#isPowerOfTwo(bits) && 8<=bits)) {throw new TypeError(`bitsは8以上かつ2の冪乗値であるべきです。(8,16,32,64,128,256,512,1024等)`)}
        return this.bits(bits);
    }
    static bytes2p(bytes) {
        if (!this.#isPowerOfTwo(bytes)) {throw new TypeError(`bytesは2の冪乗値であるべきです。(1,2,4,8,16,32,64,128,256,512,1024等)`)}
        return this.bytes(bytes)
    }
    static #random(bytes) {return crypto.getRandomValues(new Uint8Array(Math.ceil(bytes)))}
    static #randomB(buffer) {return crypto.getRandomValues(buffer)}
    static i8(len=1) {return this.#randomB(new Int8Array(len))}
    static i16(len=1) {return this.#randomB(new Int8Array(len))}
    static i32(len=1) {return this.#randomB(new Int8Array(len))}
    static i64(len=1) {return this.#randomB(new BigInt8Array(len))}
    static u8(len=1) {return this.#randomB(new Uint8Array(len))}
    static u16(len=1) {return this.#randomB(new Uint16Array(len))}
    static u32(len=1) {return this.#randomB(new Uint32Array(len))}
    static u64(len=1) {return this.#randomB(new BigUint8Array(len))}
    static f32(len=1) {return this.#randomB(new Float32Array(len))}
    static f64(len=1) {return this.#randomB(new Float64Array(len))}
    static typed(len, isFloat=false, bits=8, signed=false) {return this.#randomB(new (this.typedT(isFloat, bits, signed))(len))}
    static typedT(isFloat=false, bits=8, signed=false) {
        return 8===bits
            ? (signed ? Int8Array : Uint8Array)
            : (16===bit
                ? (signed ? Int16Array : Uint16Array)
                : (32===bit
                    ? (isFloat
                        ? Float32Array
                        : signed ? Int32Array : Uint32Array)
                    : (64===bit
                        ? (isFloat
                            ? Float64Array
                            : signed ? BigInt64Array : BigUint64Array)
                        : (()=>{throw new TypeError(`指定されたTypedArrayは存在しないか未サポートです。`)})())));
    }
}
class CSPRBG {// Cryptographically Secure Pseudo Random Binary Generator
//    static bits(bits) {return isSafeInt ? new CSRBG(Math.ceil(bits/8), false, 8, false) : this.#TE('bitsは安全な整数値であるべきです。')}
//    static bytes(bytes) {return isSafeInt ? new CSRBG(bytes, false, 8, false) : this.#TE('bytesは安全な整数値であるべきです。')}
    static bits(bits) {throwSafeInt(bits,'bits'); return CSRBG(Math.ceil(bits/8), false, 8, false);}
    static bytes(bytes) {throwSafeInt(bytes,'bytes'); return new CSRBG(bytes, false, 8, false)}
    static bits2p(bits) {return (isPowerOfTwo(bits) && 8<=bits) ? this.bits(bits) : this.#TE(this.#MSG_BIT);}
    static bytes2p(bytes) {return isPowerOfTwo(bytes) ? this.bytes(bytes) : this.#TE(this.#MSG_BYTES)}
    static #MSG_BIT = `bitsは8以上かつ2の冪乗値であるべきです。(${seq2p(11).filter(v=>8<=v)}等)`; // 8,16,32,64,128,256,512,1024
    static #MSG_BYTE = `bytesは2の冪乗値であるべきです。(${seq2p(11)}等)`; // 1,2,4,8,16,32,64,128,256,512,1024
    static #TE(m) {throw new TypeError(m)}
    static i8(len=1) {return new CSRBG(len, false, 8, true)}
    static i16(len=1) {return new CSRBG(len, false, 16, true)}
    static i32(len=1) {return new CSRBG(len, false, 32, true)}
    static i64(len=1) {return new CSRBG(len, false, 64, true)}
    static u8(len=1) {return new CSRBG(len, false, 8, false)}
    static u16(len=1) {return new CSRBG(len, false, 16, false)}
    static u32(len=1) {return new CSRBG(len, false, 32, false)}
    static u64(len=1) {return new CSRBG(len, false, 64, false)}
    static f32(len=1) {return new CSRBG(len, true, 32, true)}
    static f64(len=1) {return new CSRBG(len, true, 64, true)}
    constructor(len=1, isFloat=false, bits=8, signed=false) {
        this._ = {T:CSPRBG.typedT(isFloat, bits, signed), len:len}
    }
    get v() {return this.#randomB(new T(this._.len))}
    get() {return this.v}
    gets(num=1) {return seq(num).map(n=>this.#randomB(new T(this._.len)))}
    *gen(num=1) {
        if (!(Number.isSafeInteger(num) && 0<num)) {throw new TypeError(`numは1以上の整数値であるべきです。`)}
        for (let i=0; i<num; i++) {yield this.#randomB(new T(this._.len)}
    }
    *[Symbol.iterator]() {while (true) {yield this.#randomB(new T(this._.len))}} // 無限ループになるので注意！
}
/*
// length/min,max/bits/bytes/typed
class CSRNGT {// Cryptographically Secure Pseudo Random Number Generator
    static bits(bits) {}
    static bytes(bytes) {}
    static get() i8 {}
    static get() i16 {}
    static get() i32 {}
    static get() i64 {}
    static get() u8 {}
    static get() u16 {}
    static get() u32 {}
    static get() u64 {}
    static get() f32 {}
    static get() f64 {}
}
*/
class CSPRNG {// Cryptographically Secure Pseudo Random Number Generator
    static length(len) {return this.range(0, len-1)}
    static #range(min, range, mask, bytesNeeded) {
        const b = crypto.getRandomValues(min < 0 ? new Int8Array(bytesNeeded) : new Uint8Array(bytesNeeded));
        let r = 0;
        for (let i=0; i<bytesNeeded; i++) {r |= r[i] << 8 * i;}
        r = r & mask;
        return r <= range ? min+r : this.#range(min, range, mask, bytesNeeded); // リジェクトサンプリングでモジュロバイアスの発生を抑制する
    }
    static #calcMask(range) {
        if (range < -9007199254740991 || range > 9007199254740991) {throw new rangeError(`minとmaxの差は±9007199254740991以内であるべきです。`)}
        let [bitsNeeded,bytesNeeded,mask] = [0,0,1];
        while (range > 0) {
            if (bitsNeeded % 8 === 0) {bytesNeeded += 1;}
            bitsNeeded += 1;
            mask = mask << 1 | 1;
            range = range >>> 1;
        }
        return {bitsNeeded:bitsNeeded, bytesNeeded:bytesNeeded, mask:mask};
    };
    static range(min,max) {// Number型範囲内なら正数負数問わず乱数を返す(Number.SAFE_MIN_INTEGER〜Number.SAFE_MAX_INTEGER)
        if (![min,max].every(v=>Number.isSafeInteger(v))) {throw new TypeError(`min,maxはNumber.isSafeInteger()が真を返す値であるべきです。`)}
        if (max <= min) {throw new RangeError(`min < maxであるべきです。`)}
        const range = max - min;
        const {bitsNeeded, bytesNeeded, mask} = this.#calcMask(range);
        return this.#range(min, range, mask, bytesNeeded);
    }
}
class RandomT { // 均等分布乱数
    get half() {return 0===CSPRBGT.u8(1)[0] % 2} // true/false
    get real() {return CSPRBGT.u32(1)[0] / 0x100000000} // 0〜1未満の実数
    get num() {return CSPRNG.range(0, Number.MAX_SAFE_INTEGER)} // 0〜2**53-1
    get i8() {return CSPRBGT.i8(1)[0]}
    get i16() {return CSPRBGT.i16(1)[0]}
    get i32() {return CSPRBGT.i32(1)[0]}
    get i64() {return CSPRBGT.i64(1)[0]} // BigInt
    get u8() {return CSPRBGT.u8(1)[0]}
    get u16() {return CSPRBGT.u16(1)[0]}
    get u32() {return CSPRBGT.u32(1)[0]}
    get u64() {return CSPRBGT.u64(1)[0]} // BigInt
    get f32() {return CSPRBGT.f32(1)[0]}
    get f64() {return CSPRBGT.f64(1)[0]}
    range(min,max) {return CSPRNG.range(min,max)}
    length(len) {return this.range(0,len-1)}
}
const RandomNum = new RandomT();
class RandomBigIntT extends RandomT {
    length(len) {return isSafeInt(len) ? super.length(len) : ('bigint'===typeof len ? this.range(0n, len-1n) : (()=>{throw new TypeError(`lenはNumberかBigIntであるべきです。`)})()}
    /**
     * min (含む) から max (含む) までの暗号論的に安全なBigInt乱数を生成する。
     * モジュロバイアスを避けるため、棄却サンプリングを使用する。
     * @param {bigint} min - 範囲の最小値
     * @param {bigint} max - 範囲の最大値
     * @returns {bigint} 指定範囲内のランダムなBigInt
     */
    range(min, max) {
        if ([min,max].every(v=>isSafeInt(v))) {return super.range(min,max)}
        if (![min,max].every(v=>'bigint'===typeof v)) {throw new TypeError(`min,maxはNumberかBigIntであるべきです。`)}
        if (max <= min) {throw new RangeError(`min < max であるべきです。`)}
        const range = max - min;
        if (range === 0n) {return min}
        const bitLength = range.toString(2).length;
        const byteLength = Math.ceil(bitLength / 8);
        const maxRandom = 2n ** BigInt(byteLength * 8);
        const rejectionThreshold = maxRandom - (maxRandom % (range + 1n)); // 棄却閾値を計算し、モジュロバイアスを避ける
        let randomBigInt;
        const randomBytes = new Uint8Array(byteLength);
        do { // 棄却サンプリングループ（乱数が閾値以上の場合、バイアスを避けるために再生成する）
            window.crypto.getRandomValues(randomBytes);
            randomBigInt = BigInt('0x' + Array.from(randomBytes).map(b => b.toString(16).padStart(2, '0')).join(''));
        } while (randomBigInt >= rejectionThreshold);
        return min + (randomBigInt % (range + 1n));
    }
}
const RandomInt = new RandomBigIntT();
class BiasRandomT { // 偏り乱数
    bool(probability=0.5) {// 指定した確率でtrueを返す
        if (!(Number.isFinite(probability) && 0<=probability && probability<=1)) {throw new TypeError(`probabilityは0〜1の実数であるべきです。`)}
        return 0===probability ? false : (1===probability ? true : Random.real < probability)
    }
    weight(items) {// 重み付けに応じて一つ返す。items:[{value:'A', waight:1},{value:'B', waight:4},{value:'C', waight:5}]
        const W = items.reduce((W,item)=>W+item.weight, 0);
        const R = CSPRNG.length(W);
        return this.#weight(items, R);
    }
    #weight(items, R) {
        for (let item of items) {
            R -= item.weight;
            if (R < 0) {return item.value}
        }
    }
}
const BiasRandom = new BiasRandom();
class Lottery {
    constructor(items, isLoop=false, banReload=false) {// items:[{value:'A', waight:1},{value:'B', waight:4},{value:'C', waight:5}]  weightは札の枚数
        if (isLoop && banReload) {throw new TypeError(`isLoopとbanReloadの両方がtrueは禁止です。`)}
        this._ = {items:this.#deepCopy(items), isLoop:isLoop, banReload:banReload, r:new BiasRandom(), dels:[]};
        this._.now = this.#deepCopy();
//        this._.now.shuffle();
    }
    #deepCopy(v) {return 'structuredClone' in window ? structuredClone(v ?? this._.items) : JSON.parse(JSON.stringify(v ?? this._.items)}
    get items() {return this.#deepCopy()}
    get deck() {return this._.now}
    shuffle() {this._.now.shuffle()}
    reload() {// 消費した分も元に戻る
        if (this._.banReload) {throw new TypeError(`reloadは禁止されています。`)}
        this._.now = this.#deepCopy();
//        this._.now.shuffle();
        dels.length = 0;
    }
    draw() {// 重み付けに応じて一つ返す。items:[{value:'A', waight:1},{value:'B', waight:4},{value:'C', waight:5}]
        if (0===this._.items.length) {
            if (isLoop) { this.reload(); }
            else {throw new TypeError(`すべての要素を消費しました。続けるにはreload()してください。`)}
        }
        const W = items.reduce((W,item)=>W+item.weight, 0);
        const R = CSPRNG.length(W);
        const [v,i] = this.#weight(items, R);
        if (this._.now[i].weight<=0) {this._.dels.push(this._.now[i].value); this._.now.splice(i, i);} // weight=0なら要素ごと削除する
        return v;
    }
    #weight(items, R) {
        let i=0;
        for (let item of items) {
            R -= item.weight;
            if (R < 0) {--item.weight; return [item.value, i]}
            i++;
        }
    }
}

window.CSRBGT = CSRBGT;
window.CSRBG = CSRBG; 
window.RandomInt = RandomInt;
window.BiasRandom = BiasRandom;
window.Lottery = Lottery;
window.Lottery = Lottery;
/*
function is2To256(v,n='range') {if (!(Number.isSafeInteger(v) && 2<=v && v<=256)) {throw new TypeError(`${n}は2〜256のNumber型整数値であるべきです。`)}}
function hasBias(range) {// range=2〜256。戻り値:false/true
    is2To256(range);
    return 0===(range & (range - 1)); // 2,4,8,16,32,64,128,256ならtrue,他はfalseを返す
}
function getBitMask(range) {// ビットマスクを返す。range=2〜256。戻り値:1,3,7,15,31,63,127,255
    is2To256(range);
    return (2 << Math.log2(range - 1)) - 1;
}
function randomBit(bits) {// 暗号論的乱数を返す（均等分布（モジュロバイアス無し）） bits=1〜8(2,4,8,16,32,64,128,256)
    if (!(Number.isSafeInteger(bits) && 0<bit && bit<9)) {throw new TypeError(`bitsは1〜8のNumber型整数値であるべきです。`)}
    const b = crypto.getRandomValues(new Uint8Array(1))[0]; // 0〜255
    return b & getBitMask(2**bits); // 0〜(1, 3, 7, 15, 31, 63, 127, 255)
}
function randomU32() {return crypto.getRandomValues(new Uint32Array(1))[0]}
function randomS32() {return crypto.getRandomValues(new Int32Array(1))[0]}
function randomF32() {return randomU32() / 0x100000000}// 0〜1未満

class CSRNG {// 暗号論的乱数を返す（均等分布。モジュロバイアス無し） 
    get u32() {return crypto.getRandomValues(new Uint32Array(1))[0]} // 符号なし32bit(4Byte) 0xFFFFFFFF(0〜4294967296)
    get s32() {return crypto.getRandomValues(new Int32Array(1))[0]} // 符号あり32bit(4Byte) 0xFFFFFFFF(-2147483648〜2147483647)
    get f32() {return this.u32 / 0x100000000}// 0〜1未満の実数
    #is2To256(v,n='range') {if (!(Number.isSafeInteger(v) && 2<=v && v<=256)) {throw new TypeError(`${n}は2〜256のNumber型整数値であるべきです。`)}}
    #is2To4294967296(v,n='range') {if (!(Number.isSafeInteger(v) && 2<=v && v<=2**32)) {throw new TypeError(`${n}は2〜4294967296のNumber型整数値であるべきです。`)}}
    #hasBias(range) {// range=2〜256。戻り値:false/true
        this.#is2To256(range);
        return 0===(range & (range - 1)); // 2,4,8,16,32,64,128,256ならtrue,他はfalseを返す
    }
    #getBitMask(range) {// ビットマスクを返す。range=2〜256。戻り値:1,3,7,15,31,63,127,255
        this.#is2To256(range);
        return (2 << Math.log2(range - 1)) - 1;
    }
    #isBits(bits){if (!(Number.isSafeInteger(bits) && 0<bit && bit<9)) {throw new TypeError(`bitsは1〜8のNumber型整数値であるべきです。`)}}
    bit(bits) {// bits=1〜8(2,4,8,16,32,64,128,256)
        this.#isBits(bits);
        const b = crypto.getRandomValues(new Uint8Array(1))[0]; // 0〜255
        return b & this.#getBitMask(2**bits); // 0〜(1, 3, 7, 15, 31, 63, 127, 255)
    }
    *bits(bits, num) {
        this.#isBits(bits);
        if (!(Number.isSafeInteger(num) && 0<bit)) {throw new TypeError(`numは1以上のNumber型整数値であるべきです。`)}
        const mask = this.#getBitMask(2**bits);
        const b = crypto.getRandomValues(new Uint8Array(num))[0]; // 0〜255
        for (let i=0; i<b.length; i++) {yield b[i] & mask} // 0〜(1, 3, 7, 15, 31, 63, 127, 255)
    }
    #isRangeN(min,max) {
        if (![min,max].every(v=>Number.isSafeInteger(v))) {throw new TypeError(`min,maxはNumber.isSafeInteger()が真を返す値であるべきです。`)}
        if (max <= min) {throw new RangeError(`min,maxは min < max であるべきです。`)}
        return max - min;
    }
    #isRangeI(min,max) {
        if (![min,max].every(v=>'bigint'===typeof v)) {throw new TypeError(`min,maxはBigInt値であるべきです。`)}
        if (max <= min) {throw new RangeError(`min,maxは min < max であるべきです。`)}
        return max - min;
    }
    // Number
    n(max,min=0) {
    }
    u(max,min=0) {
        const range = this.#isRangeN(min,max);
        if (!this.#hasBias(range)) {return }
    }
    s(max,min=0) {
        const range = this.#isRangeN(min,max);

    }
    us(num,max,min=0) {
        const range = this.#isRangeN(min,max);

    }
    ss(num,max,min=0) {
        const range = this.#isRangeN(min,max);

    }
    // BigInt
    I(max,min=0) {
    }
    U(max,min=0n) {
        const range = this.#isRangeI(min,max);

    }
    S(max,min=0n) {
        const range = this.#isRangeI(min,max);

    }
    Us(max,min=0n) {
        const range = this.#isRangeI(min,max);

    }
    Ss(max,min=0n) {
        const range = this.#isRangeI(min,max);

    }
}

class RandomNumber {// Number型の乱数を返す（モジュロバイアスを失くす。制限:max-minがisSafeInteger以内であるべき(0〜2**53-1))）
    static get(min, max) {// 指定範囲の乱数を返す
        if (![min,max].every(v=>Number.isSafeInteger(v))) {throw new TypeError(`min,maxはNumber.isSafeInteger()が真を返す値であるべきです。`)}
        if (max <= min) {throw new RangeError(`min,maxは min < max であるべきです。`)}
        const range = max- min;
        if (Number.isSafeInteger(range)) {throw new RangeError(`min,maxの差はNumber.isSafeInteger()が真を返す値であるべきです。`)}
        let {bitsNeeded, bytesNeeded, mask} = this.#calcParam(range);
        return this.#get(min, range, mask, bytesNeeded);
    }
    static #calcParam(range) {// サンプリング個数に応じてマスクや必要Byte数を返す（range:サンプリング個数）
        let [bitsNeeded,bytesNeeded,mask] = [0,0,1];
        while (range > 0) {
            if (bitsNeeded % 8 === 0) {bytesNeeded += 1;}
            bitsNeeded += 1;
            mask = mask << 1 | 1;
            range = range >>> 1;
        }
        return {bitsNeeded, bytesNeeded, mask};
    }
    static #get(min, range, mask, bytesNeeded) { // 暗号論的乱数を返す（リジェクションサンプリングでモジュロバイアスを回避する。マスクでリジェクト数を減らす）
        const randomBytes = crypto.getRandomValues(new Uint8Array(bytesNeeded));
        let r = 0;
        for (let i = 0; i < bytesNeeded; i++) { r |= (randomBytes[i] << (8 * i)) }
        r = r & mask;
        return (r <= range) ? min + r : this.#get(min, range, mask, bytesNeeded);
    }
}
class RandomBigInt {
    get(u32num) {return BigInt('0x' + [...Array(u32num)].map((_, i)=>crypto.getRandomValues(new Uint32Array(1)).toString('hex')).join(''))}
    fromU32(num) {return BigInt('0x' + [...Array(u32num)].map((_, i)=>crypto.getRandomValues(new Uint32Array(1)).toString('hex')).join(''))}
    fromBit(bit) {
        const range = 2**bit;
        const isTwoPow = 0<range && 0===(range & (range - 1)); // 2の冪乗か
        if (!(0<range && 0===(range & (range - 1)))) {throw new RangeError(`bitは2の冪乗であるべきです。`)}
        return this.fromU32(Math.ceil(bit/32));
    }

    get(u32num) {return BigInt('0x' + crypto.randomBytes(byteCount).toString('hex')).toString(radix)}
BigInt('0x'+crypto.getRandomValues(new Uint32Array(1)).toString('hex'))
crypto.getRandomValues(new Uint32Array(u32num))
    get(bytes) {return BigInt('0x' + crypto.randomBytes(byteCount).toString('hex')).toString(radix)}
}
function genRandomNumber(byteCount, radix) {
  return BigInt('0x' + crypto.randomBytes(byteCount).toString('hex')).toString(radix)
}
*/
});
