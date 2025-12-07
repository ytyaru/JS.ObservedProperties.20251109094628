(function(){
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
});
