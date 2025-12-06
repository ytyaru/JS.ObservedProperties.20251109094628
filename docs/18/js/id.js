(function(){
// Global-ID: GID
// CSPRNG-ID-128bit-Base64URL: ID128B64
class RID128B64UG {// 128bit長のバイナリをBase64URLで表現する（モジュロバイアス無し。但しto(),from()でradix=2,8,16,32,64,128,256以外を入力するとバイアスが出る）
    static _b = 128;         // データ長(ビット数)
    static _B = (this._b/8); // データ長(バイト数)
    static get bin() {return crypto.getRandomValues(new Uint8Array(this._B))}
    static get str() {return this.#bytesToBase64URL(this.bin)}
    static #bytesToBase64(bytes) {return window.btoa(bytes.reduce((b,v)=>b+String.fromCharCode(v),''))}
    static #bytesToBase64URL(bytes) {return this.#bytesToBase64(bytes).replaceAll('+','-').replaceAll('/','_').replaceAll('=','');}
}
class RID128B64U extends RID128B64UG {
    static _L = 22; // 128bitをBase64化した時の文字数
    static from(v) {return this.#validBin(v) ? this.fromBin(v) : this.#validStr(v) ? this.fromStr(v)) : this.#throwType();}
    static #validBin(v) {return v instanceof Uint8Array && this._B===v.length}
    static #validStr(v) {return 'string'===typeof v && this._L===v.length && v.match(/^[A-Za-z0-9\-_]+$/)}
    static #TE(m) {throw new TypeError(m)}
    static #throwBin() {this.#TE(`引数は${this._b}bit(${this._B}Byte)長のUint8Arrayであるべきです。`)}
    static #throwStr() {this.#TE(`引数は${this._L}字のBase64URL文字列であるべきです。`)}
    static #throwType() {this.#TE(`引数はUint8ArrayかBase64URL文字列であるべきです。`)}
    static fromBin(bin) {return this.#validBin(bin) ? this.#byteToBase64URL(bin) : this.#throwBin()}
    static fromStr(str) {return this.#validStr(str) ? this.#base64ToBytes(this.#base64URLToBase64(str)) : this.#throwStr()}
    static #base64URLToBase64(base64URL) {return base64URL.replace(/-/g, '+').replace(/_/g, '/') + '='.repeat(this.#calcBase64Padding(base64URL))}
    static #calcBase64Padding(base64URL) {
        const L = base64URL.length; // Base64URL文字列の長さ (パディングなし)
        const R = length % 4; // 長さを4で割った余りを計算
        if (1===R) {this.#TE(`Base64URLは無効な長さです。`)}
        return 0===R ? 0 : (2===R ? 2 : 1);
    }
    static #base64ToBytes(base64) {
        const binStr = atob(base64);
        const bytes = new Uint8Array(binStr.length);
        for (let i=0; i<binStr.length; i++) {bytes[i] = binStr.charCodeAt(i)}
        return bytes;
    }
}
class BaseChar {
    static #N = '0123456789';
    static #A = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    static #a = 'abcdefghijklmnopqrstuvwxyz';
    static #B = this.#A + this.#a;
    static #C = [this.#B, this.#N];
    static #RH(radix, isHex=false) {return (isHex ? this.#C.reverse() : this.#C).join('').slice(0, radix)}
    static #S = '-_'; // Base64URL
    static #s = '+/'; // Base64
    static #P = '=';  // Base64パティング
    static #64  = this.#RH(62) + this.#s;
    static #64U = this.#RH(62) + this.#S;
    static #64H = this.#RH(62,true) + this.#S;
    static #36H = this.#N + this.#A;
    static #32  = this.#A + this.#N.slice(2,7);
    static #32H = this.#36H.slice(0,32);
    static #getConfusingChars(radix=55) {
        return 62 <=radix ? '' : (
               61===radix ? '0' : (
               60===radix ? '01' : (
               59===radix ? '1Il' : (
               58===radix ? '0OIl' : (
               57===radix ? '0O1Il' : (
               56===radix ? '0O1Il8' :
               56===radix ? '0O1Il8' : '0O1Il8B'))))));
    }
    static #getChars(radix, sortable, urlSafed, paded, visibled) {
        if      (64===radix) {return sortable ? this.#64H : (urlSafed ? this.#64U : this.#64)}
        else if (63===radix) {return this.#get(64, sortable, urlSafed, paded, visibled).slice(0, radix)}
        else if (32===radix) {return sortable ? this.#32H : this.#32}
        else {
            const S = this.#RH(radix, sortable); // 62字以下の使用文字を取得する
            return visibled ? ([...this.#getConfusingChars(radix)].reduce((s,v)=>s.replace(v,''), S)).slice(0,radix) : S.slice(0,radix);
        }
    }
    static #fromRadix(radix=64, sortable, urlSafed, paded, visibled) {
        if (!(Number.isSafeInteger(radix) && 2<=radix && radix<=64)) {throw new TypeError(`radixは2〜64の整数値であるべきです。`)}
        sortable = sortable ?? ![32,64].some(v=>v===radix);
        urlSafed = urlSafed ?? true;
        if (64===radix && urlSafed && true===paded) {throw new TypeError(`radix=64, urlSafed=trueの時、padedはfalseであるべきです。`)}
        paded = paded ?? false;
        visibled = visibled ?? [32,58].some(v=>v===radix);
        if ('boolean'!==typeof sortabale) {throw new TypeError(`sortableは真偽値であるべきです。`)}
        if ('boolean'!==typeof urlSafed) {throw new TypeError(`urlSafedは真偽値であるべきです。`)}
        if ('boolean'!==typeof paded) {throw new TypeError(`padedは真偽値であるべきです。`)}
        if ('boolean'!==typeof visibled) {throw new TypeError(`padedは真偽値であるべきです。`)}
        return {
            radix: {num:radix, int:BigInt(radix)},
            sortable: sortable,
            urlSafed: urlSafed,
            paded: paded,
            visibled: visibled,
            chars: {en:this.#getChars(radix, sortable, urlSafed, paded, visibled), de:null},
        }
    }
    static #isPowerOfTwo(n) {return n > 0 && 0===(n & (n - 1))}
    static #fromChars(chars, arrowMultiBytePerChar=false, onlyTwoPowLen=false, paded=false) {// onlyTwoPowLen:trueならモジュロバイアスを失くせる
        if ('string'!==typeof chars) {throw new TypeError(`charsは文字列であるべきです。`)}
        const C = Array.from(chars);
        const radix = C.length;
        if (radix < 2 || 256 < radix) {throw new TypeError(`charsの字数は2〜256であるべきです。`)}
        if ((new Set(C)).size!==radix) {throw new TypeError(`charsに重複文字があります。`)}
        if (!arrowMultiBytePerChar && !C.every(c=>1===c.length)) {throw new TypeError(`charsに1Byte文字以外の字が混入しています。`)}
        if (onlyTwoPowLen && this.#isPowerOfTwo(C.length)) {throw new TypeError(`charsの字数は2〜256かつ2の冪乗であるべきです。(2,4,8,16,32,64,128,256)`)}
        return {
            radix: {num:radix, int:BigInt(radix)},
            sortable: Array.from(chars).sort().join('')===C.join(''),
            urlSafed: chars.match(/^[A-Za-z0-9\-_]+$/),
            paded: paded,
            visibled: Array.from(this.#getConfusingChars()).every(c=>-1<chars.indexOf(c)),
            chars: {en:chars, de:null},
        }
    }
    static from(...args) {
        Number.isSafeInteger(radixOrChars)
        ? this.#fromRadix(...args)
        : ('string'===typeof radixOrChars
            ? this.#fromChars(...args)
            : (()=>{throw new TypeError(`第一引数radixOrCharsはNumberかString型プリミティブ値であるべきです。`)})();
    }
    //get B64Ary() {return Array.from(this.#B64)}
    static B64Ary = Array.from(this.#B64);
    isBase64(chars) {return this.#64===chars}     // AaN+/
    isBase64URL(chars) {return this.#64U===chars} // AaN-_
    isBase64Hex(chars) {return this.#64H===chars} // -NA_a（ASCIIコードでソート可能な順序かつURLセーフな文字） 他にも NAa{} N<>Aa NA[]a +/NAa ()NAa 等がある。
    isBase64SD(chars) {return 64===chars.length && chars.startsWith(this.#RH(62))} // Base64と比較して末尾の記号部分2字だけが違う SymbolDifferent 
    isBase58(chars) {return this.#getChars(58, false, true, false, true)===chars}
    isBase58Hex(chars) {return this.#getChars(58, true, true, false, true)===chars}
    isBase2To36Hex(chars, radix) {return this.#36H.slice(0,radix)===chars}
    isBase32Hex(chars) {return this.#32H===chars}
    isBase32(chars) {return this.#32===chars}
}
class RID128T {// RID128の値を持たない版。RID128.to()の引数に渡す時、値は不要なのでこちらで渡すと良い。
    constructor(...args) { // (radixOrChars, sortable, urlSafed, paded, visibled) / (chars, arrowMultiBytePerChar, onlyTwoPowLen, paded)
        this._ = BaseChar.from(...args); // [0]:値生成是非, (radixOrChars, sortable, urlSafed, paded, visibled) / (chars, arrowMultiBytePerChar, onlyTwoPowLen, paded)
        this._.chars.de = Object.fromEntries(Object.entries(this._.chars.en).map(([i,c])=>[c,i]));
        this._.regexp = new RegExp(`^[${RID128.#getEscCharsOnRegExp(this._.chars.en)}]$`);
        // radixで生成した場合のみnameを生成する（例:rid128b64supv 最大13字）
        this._.name = Number.isSafeInteger(args[0]) ? `rid128b${radix}${sortable ? 's' : ''}${urlSafed ? 'u' : ''}${paded ? 'p' : ''}${visibled ? 'v' : ''}` : '';
    }
    #getEscCharsOnRegExp(v) {return Array.from(`.^$|\\[](){}+*?`).reduce((s,e)=>s.replace(e,`\\${v}`), v)} // 正規表現でｴｽｹｰﾌﾟが必要な文字にｴｽｹｰﾌﾟする
    get radix() {return this._.radix.num}
    get sortable() {return this._.sortable}
    get urlSafed() {return this._.urlSafed}
    get paded() {return this._.paded}
    get visibled() {return this._.visibled}
    get chars() {return this._.chars.en}
    get name() {return this._.name}
    static fromName(name) {
        if ('string'!==name) {throw new TypeError(`nameは文字列であるべきです。`)}
        const R = /^rid(?:-(?<radix>\d+))(?:-(?<sortable>s))?(?:-(?<urlSafed>u))?(?:-(?<paded>p))?(?:-(?<visibled>v))?$/;
        const m = name.match(R);
        if (!m) {throw new TypeError(`nameが不正値です。次の正規表現に従ってください。: ${R}`)};
        return new RID128T(...[parseInt(m.radix), !!m.sortable, !!m.urlSafed, !!m.paded, !!m.visibled]);
    }
}
class RID128 extends RID128T {// 128bit長のバイナリをBase64URLで表現する(モジュロバイアス無し。但しto(),from()でradix=2,8,16,32,64,128,256以外を入力するとバイアスが出る)
    static fromName(name) {
        const T = RID128T.fromName(name);
        return new RID128(T.radix, T.sortable, T.urlSafed, T.paded, T.visibled);
    }
    constructor(...args) { // (radixOrChars, sortable, urlSafed, paded, visibled) / (chars, arrowMultiBytePerChar, onlyTwoPowLen, paded)
        super(...args)
        this._.v = {bin:this.#random, str:null}
        const base64 = 64===this._.radix.num
            ? ('toBase64' in this._.v.bin
                ? this._.v.bin.toBase64()
                : this.#bytesToBase64(this._.v.bin))
            : null;
        this._.v.str = BaseChar.isBase64(this._.chars.en)
            ? base64
            : (BaseChar.isBase64URL(this._.chars.en)
                ? ['+-','_/','= '].reduce((s,v)=>s.replaceAll(v[0],v[1]), base64)
                : (BaseChar.isBase64SD(this._.chars.en)
                    ? [...BaseChar.B64Ary.slice(-2)].reduce((s,c,i)=>base64.replaceAll(c,this._.chars.en[62+i]))
                    : (base64 || BaseChar.isBase64Hex(this._.chars.en)
                        ? [...base64].map((c,i)=>this._.chars.en[BaseChar.B64Ary.indexOf(c)]).join('')
                        : (BaseChar.isBase2To36Hex(this._.chars.en) && 'toHex' in this._.v.bin
                            ? BigInt('0x'+this._.v.bin.toHex()).toString(this.radix)
                            : this.#intToStr(this.#binToInt(this._.v.bin)), this._.chars.en))));
        /*
        this._.v.str = BaseChar.isBase64(this._.chars.en)
            ? base64
            : (BaseChar.isBase64URL(this._.chars.en)
                ? ['+-','_/','= '].reduce((s,v)=>s.replaceAll(v[0],v[1]), base64)
                : (base64 || BaseChar.isBase64Hex(this._.chars.en)
                    ? [...base64].map((c,i)=>this._.chars.en[BaseChar.B64Ary.indexOf(c)]).join('')
                    : (BaseChar.isBase2To36Hex(this._.chars.en) && 'toHex' in this._.v.bin
                        ? BigInt('0x'+this._.v.bin.toHex()).toString(this.radix)
                        : this.#intToStr(this.#binToInt(this._.v.bin)), this._.chars.en)));
        */
        /*
        this._.v.str = BaseChar.isBase64(this._.chars.en)
            ? base64
            : (BaseChar.isBase64URL(this._.chars.en)
                ? ['+-','_/','= '].reduce((s,v)=>s.replaceAll(v[0],v[1]), base64)
                : (BaseChar.isBase64Hex(this._.chars.en) && base64
                    ? [...base64].map((c,i)=>this._.chars.en[i]).join('')
                    : this.#intToStr((BaseChar.isBase2To36Hex(this._.chars.en)
                        ? BigInt('0x'+this._.v.bin.toHex())
                        : this.#binToInt(this._.v.bin)), this._.chars.en)));
        */

        /*
        this._.v.str = BaseChar.isBase64(this._.chars.en)
            ? ('toBase64' in this._.v.bin
                ? this._.v.bin.toBase64()
                : this.#bytesToBase64(this._.v.bin))
            : (BaseChar.isBase64URL(this._.chars.en)
                ? ['+-','_/','= '].reduce((s,v)=>s.replaceAll(v[0],v[1]), this.#bytesToBase64(this._.v.bin))
                : (BaseChar.isBase64Hex(this._.chars.en)
                    ? this.#bytesToBase64(this._.v.bin).map((c,i)=>this._.chars.en[i])
                    : this.#intToStr((BaseChar.isBase2To36Hex(this._.chars.en)
                        ? BigInt('0x'+this._.v.bin.toHex())
                        : this.#binToInt(this._.v.bin)), this._.chars.en)));
                    //: this.#intToStr(BaseChar.isBase2To36Hex(this._.chars.en) ? BigInt('0x'+this._.v.bin.toHex()) : this.#binToInt(this._.v.bin), this._.chars.en)));
        */
        /*
        this._.v.str = BaseChar.isBase64(this._.chars.en)
            ? ('toBase64' in this._.v.bin
                ? this._.v.bin.toBase64()
                : this.#bytesToBase64(this._.v.bin))
            : (BaseChar.isBase64URL(this._.chars.en)
                ? ['+-','_/','= '].reduce((s,v)=>s.replaceAll(v[0],v[1]), this.#bytesToBase64(this._.v.bin))
                : (BaseChar.isBase64Hex(this._.chars.en)
                    ? this.#bytesToBase64(this._.v.bin).map((c,i)=>this._.chars.en[i])
                    : (BaseChar.isBase2To36Hex(this._.chars.en) && 'toHex' in this._.v.bin
                        ? this.#intToStr(BigInt('0x'+this._.v.bin.toHex()), this._.chars.en)
                        : this.#intToStr(this.#binToInt(this._.v.bin), this._.chars.en))));
        */
        /*
        this._.v.str = this.#isB64
            ? ('toBase64' in this._.v.bin
                ? this._.v.bin.toBase64()
                : this.#bytesToBase64(this._.v.bin))
            : (this.#isB64U
                ? ['+-','_/','= '].reduce((s,v)=>s.replaceAll(v[0],v[1]), this.#bytesToBase64(this._.v.bin))
                : (this.#isB64H
                    ? this.#bytesToBase64(this._.v.bin).map((c,i)=>this._.chars.en[i])
                    : (this.#is2To36H && 'toHex' in this._.v.bin
                        ? this.#intToStr(BigInt('0x'+this._.v.bin.toHex()), this._.chars.en)
                        : this.#intToStr(this.#binToInt(this._.v.bin), this._.chars.en))));
        */
        /*
        this._.v.str = this.#isB64
            ? this.#bytesToBase64(this._.v.bin)
            : (this.#isB64U
                ? ['+-','_/','= '].reduce((s,v)=>s.replaceAll(v[0],v[1]), this.#bytesToBase64(this._.v.bin))
                : (this.#isB64H
                    ? this.#bytesToBase64(this._.v.bin).map((c,i)=>this._.chars.en[i])
                    : (this.#is2To36H && 'toHex' in this._.v.bin
                        ? this.#intToStr(BigInt('0x'+this._.v.bin.toHex()), this._.chars.en)
                        : this.#intToStr(this.#binToInt(this._.v.bin), this._.chars.en));
        */
        /*
        this._.v.str = this.#isB64
            ? this.#bytesToBase64(this._.v.bin)
            : (this.#isB64U
                ? ['+-','_/','= '].reduce((s,v)=>s.replaceAll(v[0],v[1]), this.#bytesToBase64(this._.v.bin))
                : (this.#isB64H
                    ? this.#bytesToBase64(this._.v.bin).map((c,i)=>this._.chars.en[i])
                    : this.#intToStr(this.#binToInt(this._.v.bin), this._.chars.en));
                */
        /*
        this._.v.str = this.#isB64
            ? this.#bytesToBase64(this._.v.bin)
            : (this.#isB64U
                ? this.#bytesToBase64(bytes).replaceAll('+','-').replaceAll('/','_').replaceAll('=','')
                : this.#intToStr(this.#binToInt(this._.v.bin), this._.chars.en));
//        this._.v.str = this.#bytesToBase64URL(this._.v.bin);
        */
    }
    get #isB64() {return 64===this.radix && false===sortable && false===urlSafed && true===paded && false===visibled}
    get #isB64U() {return 64===this.radix && false===sortable && true===urlSafed && false===paded && false===visibled}
    get #isB64H() {return 64===this.radix && true===sortable && true===urlSafed && false===paded && false===visibled}
    get #is2To36H() {return 2<=this.radix && this.radix<=36 && true===sortable && true===urlSafed && false===paded && false===visibled}
    get bin() {return this._.v.bin;}
    get str() {return this._.v.str;}
    get #random() {return crypto.getRandomValues(new Uint8Array(128/8))}
    #bytesToBase64(bytes) {return window.btoa(bytes.reduce((b,v)=>b+String.fromCharCode(v),''))}
    #bytesToBase64URL(bytes) {return this.#bytesToBase64(bytes).replaceAll('+','-').replaceAll('/','_').replaceAll('=','');}
    to(rid128t) {
        if (!(rid128t instanceof RID128T)) {throw new TypeError(`引数はRID128かRID128T型インスタンスであるべきです。`)}
        const I = this.#binToInt(this.bin);
        return this.#intToStr(I, rid128t.chars) + rid128t.paded ? '='.repeat(this.#getPaddingNum(I, rid128t._.radix.int)) : '';
    }
    #binToInt(b) {// バイト配列を一つの大きな整数に変換
        let I = 0n; // 64ビット整数を扱えるBigIntを使用
        for (let i=0; i<b.length; i++) {I = (I << 8n) | BigInt(b[i])}
        return I;
    }
    #intToStr(int, chars) {
        if ('bigint'!==typeof int) {throw new TypeError(`intはBigIntであるべきです。`)}
        if ('string'!==typeof chars) {throw new TypeError(`charsは文字列であるべきです。`)}
        const BASE = BigInt(chars.length);
        if (BASE < 2n || BASE > 64n) {throw new TypeError(`charsは2〜64字以内であるべきです。`)}
        let result = '';
        if (0n===int) {return chars[0]}
        while (0n < int) {
            const R = int % BASE;
            result = chars[Number(R)] + result;
            int /= BASE;
        }
        return result;
    }
    #getPaddingNum(I, radix) {// 値Iが基数radixの時、必要なパディング数を返す（I,radixはBigInt型。戻り値はNumber型）
        if (0n===I) {return 1;} // 0または1を扱う特殊なケース
        let [padding,power] = [0n,1n];
        if ('bigint'!==radix) {radix = BigInt(radix)}
        while (power <= I) {power *= radix; padding++;}
        return Number(padding); // パディング数はNumber型で返しても一般的に問題ない
    }
}
class RBID {// RandomByteID 2,4,8,16,32,64,128,256bit(1〜16(128bit)〜Byte)等2の冪乗のみ有効
    static get bin() {return crypto.getRandomValues(new Uint8Array(this._B))}
    fromBits(bits) {return crypto.getRandomValues(new Uint8Array(Math.ceil(bits/8)))}
    fromBytes(bytes) {return crypto.getRandomValues(new Uint8Array(Math.ceil(bytes)))}
    constructor() {}
}
class NIID { // Number型のIncrementID。内部IDにのみ使用するLocalID。Number型で0<=V<=Number.MAX_SAFE_INTEGER内の2**53-1個のみ生成可能。
    constructor(n=0) {// n:これまで生成した数
        if (!Number.isSafeInteger(n)) {throw new TypeError(`nはNumber.isSafeInteger(n)が真を返す値であるべきです。`)}
        this._ = {n:n};
    }
    //get id() {const v = this._.n; if (!Number.isSafeInteger(v)) {throw new TypeError(`idはNumber.isSafeInteger(n)の範囲外になりました。これ以上IDを生成できません。BIIDに変更してください。`)}; this._.n++; return v;}
    get id() {if (!Number.isSafeInteger(this._.n)) {throw new TypeError(`idはNumber.isSafeInteger()の範囲外になりました。これ以上IDを生成できません。BIIDに変更してください。`)}; return this._.n++;}
}
class BIID { // BigInt型のIncrementID。内部IDにのみ使用するLocalID。BigInt型で0n<=V<=メモリが許す限り生成可能。
    constructor(n=0n) {// n:これまで生成した数
        if ('bigint'!==typeof n) {throw new TypeError(`nはBigInt値であるべきです。`)}
        this._ = {n:n};
    }
    //get id() {return ++this._.n}
    get id() {return this._.n++}
}
})();
