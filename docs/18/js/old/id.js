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
//    static from(d) {return this.#validBin(d) ? this.fromBin(d) : this.#validStr(d) ? this.fromStr(d)) : this.#throwType();}
    static convert(v) {return this.#validBin(v) ? this.fromBin(v) : this.#validStr(v) ? this.fromStr(v)) : this.#throwType();}
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
        if (1===R) {this.#TE(`base64URLは無効な長さです。`)}
        return 0===R ? 0 : (2===R ? 2 : 1);
    }
    static #base64ToBytes(base64) {
        const binStr = atob(base64);
        const bytes = new Uint8Array(binStr.length);
        for (let i=0; i<binStr.length; i++) {bytes[i] = binStr.charCodeAt(i)}
        return bytes;
    }
}
class RID128B64U {// 他のBaseと相互変換不能だが簡易実装。get()で取得。from(s)でバイトへ変換。
    static #B = (128/8); // データ長(バイト数)
    static get bin() {return this.#random}
    static get str() {return this.#bytesToBase64URL(this.#random)}
    static get() {return this.str}
    static get #random() {return crypto.getRandomValues(new Uint8Array(this.#B))}
    static #bytesToBase64(bytes) {return window.btoa(bytes.reduce((b,v)=>b+String.fromCharCode(v),''))}
    static #bytesToBase64URL(bytes) {return ['+-','_/','= '].reduce((s,v)=>s.replaceAll(v[0],v[1]), this.#bytesToBase64(bytes));}
    static from(s) {return this.#base64ToBytes(this.#base64URLToBase64(s));}
    static #base64URLToBase64(base64URL) {return base64URL.replace(/-/g, '+').replace(/_/g, '/') + '='.repeat(this.#calcBase64Padding(base64URL))}
    static #calcBase64Padding(base64URL) {
        const L = base64URL.length; // Base64URL文字列の長さ (パディングなし)
        const R = length % 4; // 長さを4で割った余りを計算
        if (1===R) {this.#TE(`base64URLは無効な長さです。`)}
        return 0===R ? 0 : (2===R ? 2 : 1);
    }
    static #base64ToBytes(base64) {
        const binStr = atob(base64);
        const bytes = new Uint8Array(binStr.length);
        for (let i=0; i<binStr.length; i++) {bytes[i] = binStr.charCodeAt(i)}
        return bytes;
    }
}
class RID128B64U {// 128bit長のバイナリをBase64URLで表現する（モジュロバイアス無し。Base64URLとバイナリを相互変換可。必ず22字）
    static #B = (128/8); // データ長(バイト数)
    static get bin() {return this.#random}
    static get str() {return this.#byteToBase64URL(this.#random)}
    static get() {return this.str}
    static get #random() {return crypto.getRandomValues(new Uint8Array(this.#B))}
    static #byteToBase64(bytes) {return window.btoa(bytes.reduce((b,v)=>b+String.fromCharCode(v),''))}
    static #byteToBase64URL(bytes) {return ['+-','_/','= '].reduce((s,v)=>s.replaceAll(v[0],v[1]), this.#byteToBase64(bytes));}
    static #validBin(v) {return d instanceof Uint8Array && this.#B===d.length}
    static #validStr(v) {return 'string'===typeof v && 22===v.length && v.match(/^[A-Za-z0-9\-_]+$/)}
    static #TE(m) {throw new TypeError(m)}
    static #throwBin() {this.#TE(`引数は128bit(16Byte)長のUint8Arrayであるべきです。`)}
    static #throwStr() {this.#TE(`引数は22字のBase64URL文字列であるべきです。`)}
    static #throwType() {this.#TE(`引数はUint8ArrayかBase64URL文字列であるべきです。`)}
    static from(d) {return this.#validBin(d) ? this.fromBin(d) : this.#validStr(d) ? this.fromStr(d)) : this.#throwType();}
    static fromBin(bin) {return this.#validBin(bin) ? this.#byteToBase64URL(bin) : this.#throwBin()}
    static fromStr(str) {return this.#validStr(str) ? this.#base64ToBytes(this.#base64URLToBase64(str)) : this.#throwStr()}
    static #base64URLToBase64(base64URL) {return base64URL.replace(/-/g, '+').replace(/_/g, '/') + '='.repeat(this.#calcBase64Padding(base64URL))}
    static #calcBase64Padding(base64URL) {
        const L = base64URL.length; // Base64URL文字列の長さ (パディングなし)
        const R = length % 4; // 長さを4で割った余りを計算
        if (1===R) {this.#TE(`base64URLは無効な長さです。`)}
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
    static #32  = this.#A + this.#N.slice(2,7);
    static #32H = (this.#N + this.#A).slice(0,32);
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
    //static get(radix=64, sortable, urlSafed, paded, visibled) {
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
//        return this.#getChars(radix, sortable, urlSafed, paded, visibled);
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
    //static from(chars, arrowMultiBytePerChar=false, onlyTwoPowLen=false) {// onlyTwoPowLen:trueならモジュロバイアスを失くせる
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
}
class RID128T {// RID128の値を持たない版。RID128.to()の引数に渡す時、値は不要なのでこちらで渡すと良い。
    constructor(...args) { // (radixOrChars, sortable, urlSafed, paded, visibled) / (chars, arrowMultiBytePerChar, onlyTwoPowLen, paded)
        this._ = BaseChar.from(...args); // [0]:値生成是非, (radixOrChars, sortable, urlSafed, paded, visibled) / (chars, arrowMultiBytePerChar, onlyTwoPowLen, paded)
        this._.chars.de = Object.fromEntries(Object.entries(this._.chars.en).map(([i,c])=>[c,i]));
        this._.regexp = new RegExp(`^[${RID128.#getEscCharsOnRegExp(this._.chars.en)}]$`);
    }
    #getEscCharsOnRegExp(v) {return Array.from(`.^$|\\[](){}+*?`).reduce((s,e)=>s.replace(e,`\\${v}`), v)} // 正規表現でｴｽｹｰﾌﾟが必要な文字にｴｽｹｰﾌﾟする
    get bin() {return this._.v.bin;}
    get str() {return this._.v.str;}
    get chars() {return this._.chars.en}
    get radix() {return this._.radix.num}
    get sortable() {return this._.sortable}
    get urlSafed() {return this._.urlSafed}
    get paded() {return this._.paded}
    get visibled() {return this._.visibled}
}
class RID128 extends RID128T {// 128bit長のバイナリをBase64URLで表現する(モジュロバイアス無し。但しto(),from()でradix=2,8,16,32,64,128,256以外を入力するとバイアスが出る)
    constructor(...args) { // (radixOrChars, sortable, urlSafed, paded, visibled) / (chars, arrowMultiBytePerChar, onlyTwoPowLen, paded)
        super(...args)
        this._.v = {bin:this.#random, str:null}
        this._.v.str = this.#bytesToBase64URL(this._.v.bin);
    }
    get() {return this.#bytesToBase64URL(this.#random)}
    get #random() {return crypto.getRandomValues(new Uint8Array(128/8))}
    #bytesToBase64(bytes) {return window.btoa(bytes.reduce((b,v)=>b+String.fromCharCode(v),''))}
    #bytesToBase64URL(bytes) {return this.#bytesToBase64(bytes).replaceAll('+','-').replaceAll('/','_').replaceAll('=','');}
    to(rid128t) {
        if (!(rid128t instanceof RID128T)) {throw new TypeError(`引数はRID128かRID128T型インスタンスであるべきです。`)}
        const I = this.#binToInt(this.bin);
        return this.#intToStr(I, rid128t.chars) + rid128t.paded ? '='.repeat(this.#getPaddingNum(I, rid128t._.radix.int)) : '';
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
class RID128 {// 128bit長のバイナリをBase64URLで表現する（モジュロバイアス無し。但しto(),from()でradix=2,8,16,32,64,128,256以外を入力するとバイアスが出る）
    constructor(...args) { // (radixOrChars, sortable, urlSafed, paded, visibled) / (chars, arrowMultiBytePerChar, onlyTwoPowLen, paded)
        this._ = BaseChar.from(...args); // [0]:値生成是非, (radixOrChars, sortable, urlSafed, paded, visibled) / (chars, arrowMultiBytePerChar, onlyTwoPowLen, paded)
        this._.chars.de = Object.fromEntries(Object.entries(this._.chars.en).map(([i,c])=>[c,i]));
        this._.regexp = new RegExp(`^[${RID128.#getEscCharsOnRegExp(this._.chars.en)}]$`);
        this._.v = {bin:this.#random, str:null}
        this._.v.str = this.#bytesToBase64URL(this._.v.bin);
    }
    #getEscCharsOnRegExp(v) {return Array.from(`.^$|\\[](){}+*?`).reduce((s,e)=>s.replace(e,`\\${v}`), v)} // 正規表現でｴｽｹｰﾌﾟが必要な文字にｴｽｹｰﾌﾟする
    get() {return this.#bytesToBase64URL(this.#random)}
    get bin() {return this._.v.bin;}
    get str() {return this._.v.str;}
    get chars() {return this._.chars.en}
    get radix() {return this._.radix.num}
    get sortable() {return this._.sortable}
    get urlSafed() {return this._.urlSafed}
    get paded() {return this._.paded}
    get visibled() {return this._.visibled}
    get #random() {return crypto.getRandomValues(new Uint8Array(128/8))}
    #bytesToBase64(bytes) {return window.btoa(bytes.reduce((b,v)=>b+String.fromCharCode(v),''))}
    #bytesToBase64URL(bytes) {return this.#bytesToBase64(bytes).replaceAll('+','-').replaceAll('/','_').replaceAll('=','');}
    to(rid128) {
        if (!(rid128 instanceof RID128)) {throw new TypeError(`引数はRID128型インスタンスであるべきです。`)}
        const I = this.#binToInt(this.bin);
        return this.#intToStr(I, rid128.chars) + rid128.paded ? this.#getPaddingNum(I, rid128._.radix.int) : '';
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
        let padding = 0n;
        let power = 1n;
        if ('bigint'!==radix) {radix = BigInt(radix)}
        while (power <= I) {
            power *= radix; //power *= BigInt(radix);
            padding++;
        }
        return Number(padding); // パディング数はNumber型で返しても一般的に問題ない
    }



    from(bin, chars) {
        #bytesToBase64(bytes)
    }
    to(base64URL, radixOrChars=62) {
        if (Number.isSafeInteger(radixOrChars)) {
            const radix = radixOrChars;
            if (!(2<=radix && radix<=64) {throw new RangeError(`radixは2〜64の整数値であるべきです。`)}
            return (new SortableBaseN(radix)).encode(this.#base64ToBytes(this.#base64URLToBase64(base64URL)));
        } else if ('string'===typeof radixOrChars) {
            const chars = radixOrChars;
            if ((new Set(Array.from(chars))).size!==chars.length) {thow new TypeError(`charsは重複しない文字列であるべきです。`)};
            const radix = chars.length;
            if (radix < 2 || 256 < radix) {thow new TypeError(`charsは2〜256字であるべきです。`)};
            const B = new SortableBaseN(radix);
            B.bin = this.#base64ToBytes(this.#base64URLToBase64(base64URL));
            return B.str;
        } else {throw new TypeError(`radixOrCharsは2〜256の整数か2〜256字以内の重複しない文字列であるべきです。`)}
    }
    from(baseN, radixOrChars=62) {

    }

    static #from(value) {
        if ('string'===typeof value) {} // Base64URL
        else if (value instanceof Uint8Array) {} // バイナリ
        else if ('bigint'===typeof value) {} 
    }
    static #toU8a(str) {
        
    }
    static #base64URLToBase64(base64URL) {return base64URL.replace(/-/g, '+').replace(/_/g, '/') + '='.repeat(this.#calcBase64Padding(base64URL))}
    static #calcBase64Padding(base64URL) {
        const L = base64URL.length; // Base64URL文字列の長さ (パディングなし)
        const R = length % 4; // 長さを4で割った余りを計算
        if (1===R) {throw new TypeError(`base64URLは無効な長さです。`)}
        return 0===R ? 0 : (2===R ? 2 : 1);
    }
    static #base64ToBytes(base64) {
        const binStr = atob(base64);
        const bytes = new Uint8Array(binStr.length);
        for (let i=0; i<binStr.length; i++) {bytes[i] = binStr.charCodeAt(i)}
        return bytes;
    }
    constructor(value) {
        this._ = {v:{bin:null, str:null}}
        ID128.get()
    }
    set value(v) {

    }
}
class SortableBaseN {// 出力されるASCII文字を辞書順にソート可。最大64字。記号は{}だと使用できない文脈があるが、-_ならURLでも使用可能。但し順序が分かり難い。
    static fromChars(chars, numSafed=undefined) {
        if ('string'!==typeof chars) {throw new TypeError(`charsは文字列であるべきです。`)}
        if ((new Set(Array.from(chars))).size!==chars.length) {thow new TypeError(`charsは重複しない文字列であるべきです。`)};
        const radix = chars.length;
        if (radix < 2 || 256 < radix) {thow new TypeError(`charsは2〜256字であるべきです。`)};
        const B = new SortableBaseN(radix, !!chars.match(/^[0-9A-Za-z\-_]+$/), numSafed);
        B._.chars.en = chars;
        return B;
    }
    /*
    static confuse(radix=62) {// 0-9A-Za-zの内紛らわしい文字を列挙する
             if (radix <=55) {return '0O1Il8B'}
        else if (56===radix) {return '0O1Il8'}
        //else if (57===radix) {return '0O1Il'}
        else if (57===radix) {return '01Il8'} // OB残存
        else if (58===radix) {return '0OIl'} // Base58規格のため固定
        else if (59===radix) {return '0O1'}
        else if (60===radix) {return 'Il'}
        else if (61===radix) {return 'l'}
        else                 {return ''}
    }
    */
    //constructor(radix=64, urlSafed=undefined, numSafed=undefined) {
//        if ('string'===typeof chars) {return SortableBaseN.fromChars(radix, urlSafed)}
    constructor(...args) {
        if (0===args.length) {throw new TypeError(`引数は最低でも一つ必要です。`)}
        if ('string'===typeof args[0]) {return SortableBaseN.fromChars(...args)}
        const radix = args[0];
        const urlSafed = 1<args ? args[1] : (62 < radix);
        const numSafed = 2<args ? args[2] : false;
        if (!(Number.isSafeInteger(radix) && 2<=radix && radix<=64)) {throw new TypeError(`radixは2〜64のNumber型整数値であるべきです。`)}
        if ('boolean'!==typeof urlSafed) {throw new TypeError(`urlSafedは真偽値であるべきです。radix=64時、真なら-_偽なら{}の記号を使用します。`)}
        if ('boolean'!==typeof numSafed) {throw new TypeError(`numSafedは真偽値であるべきです。真なら0〜Number.MAX_SAFE_INTEGERの範囲外値を代入時常に例外発生します。偽ならnumに範囲外値を代入しない限り許可します。`)}
        this._ = {radix:{num:radix, int:BigInt(radix)}, chars:{en:null, de:null}, v:{bin:null, str:null, num:null, int:null}, regexp:null, urlSafed:urlSafed, numSafed:numSafed}
//        const C = urlSafed ? '-0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ_abcdefghijklmnopqrstuvwxyz' : '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz{}';
        const N = '0123456789';
        const A = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        const a = 'abcdefghijklmnopqrstuvwxyz';
//        32===radix ? '23456789' + A : 58===radix ? `${N}${A}${a}`.replace('0','').replace('O','').replace('I','').replace('l','') : `${N}${A}${a}`
        //const C = (62 < radix) ? (urlSafed ? `-${N}${A}_${a}` : `${N}${A}${a}{}`) : `${N}${A}${a}`).slice(0, radix);
//        const C = (62 < radix) ? (urlSafed ? `-${N}${A}_${a}` : `${N}${A}${a}{}`) : (32===radix ? '234567' + A : 58===radix ? `${N}${A}${a}`.replace('0','').replace('O','').replace('I','').replace('l','') : `${N}${A}${a}`)).slice(0, radix);
        ;
        //const C = (62 < radix) ? (urlSafed ? `-${N}${A}_${a}` : `${N}${A}${a}{}`) : (32===radix ? '234567' + A : (58===radix ? [...'0OIl'].reduce((s,v)=>s.replace(v,''), `${N}${A}${a}`) : `${N}${A}${a}`)).slice(0, radix);
        //const C = (62 < radix) ? (urlSafed ? `-${N}${A}_${a}` : `${N}${A}${a}{}`) : (58===radix ? [...'0OIl'].reduce((s,v)=>s.replace(v,''), `${N}${A}${a}`) : `${N}${A}${a}`).slice(0, radix);
        const C = (62 < radix)
            ? (urlSafed ? `-${N}${A}_${a}` : `${N}${A}${a}{}`)
            : ((58===radix
                ? [...'0OIl'].reduce((s,v)=>s.replace(v,''), `${N}${A}${a}`)
                : (55===radix
                    ? [...'0O1Il8B'].reduce((s,v)=>s.replace(v,''), `${N}${A}${a}`
                    : `${N}${A}${a}`)))).slice(0, radix);
        /*
        const C = 256===radix
            ? '⠀⢀⠠⢠⠐⢐⠰⢰⠈⢈⠨⢨⠘⢘⠸⢸⡀⣀⡠⣠⡐⣐⡰⣰⡈⣈⡨⣨⡘⣘⡸⣸⠄⢄⠤⢤⠔⢔⠴⢴⠌⢌⠬⢬⠜⢜⠼⢼⡄⣄⡤⣤⡔⣔⡴⣴⡌⣌⡬⣬⡜⣜⡼⣼⠂⢂⠢⢢⠒⢒⠲⢲⠊⢊⠪⢪⠚⢚⠺⢺⡂⣂⡢⣢⡒⣒⡲⣲⡊⣊⡪⣪⡚⣚⡺⣺⠆⢆⠦⢦⠖⢖⠶⢶⠎⢎⠮⢮⠞⢞⠾⢾⡆⣆⡦⣦⡖⣖⡶⣶⡎⣎⡮⣮⡞⣞⡾⣾⠁⢁⠡⢡⠑⢑⠱⢱⠉⢉⠩⢩⠙⢙⠹⢹⡁⣁⡡⣡⡑⣑⡱⣱⡉⣉⡩⣩⡙⣙⡹⣹⠅⢅⠥⢥⠕⢕⠵⢵⠍⢍⠭⢭⠝⢝⠽⢽⡅⣅⡥⣥⡕⣕⡵⣵⡍⣍⡭⣭⡝⣝⡽⣽⠃⢃⠣⢣⠓⢓⠳⢳⠋⢋⠫⢫⠛⢛⠻⢻⡃⣃⡣⣣⡓⣓⡳⣳⡋⣋⡫⣫⡛⣛⡻⣻⠇⢇⠧⢧⠗⢗⠷⢷⠏⢏⠯⢯⠟⢟⠿⢿⡇⣇⡧⣧⡗⣗⡷⣷⡏⣏⡯⣯⡟⣟⡿⣿'
            : Array.from((sortable
                ? ((62 < radix) ? (urlSafed ? `-${N}${A}_${a}` : `${N}${A}${a}{}`) : `${N}${A}${a}`)
                : (urlSafed ? `${A}${a}${N}-_` : `${A}${a}${N}+/`)
                ).slice(0, radix));
        */
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

class BiasID {// base36,58,62等2の冪乗でない字数

}
})();
