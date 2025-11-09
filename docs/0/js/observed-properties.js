(function(){
class ObservedProperties {
    constructor(options, update) {
        this._ = {opt:{open:{},close:{}}, prop:{open:{},close:{}}, obj:{open:{},close:{}}, onSet:{open:{},close:{}}, onChange:{open:{},close:{}}, update:(o,c)=>{}};
        this.#checkKeys(options)
        this.#setDefaultOptions(options);
        if ('function'===typeof update) {this._.update = update;}
        if (options.hasOwnProperty('_')) {this._.opt.close = options._}
        for (let [k, v] of Object.entries(options)) { if ('_'!==k) {this._.opt.open[k] = v;} }
        for (let [k, v] of Object.entries(this._.opt.open)) {
            this.#makeDescriptor('open', k, v);
        }
        for (let [k, v] of Object.entries(this._.opt.close)) {
            this.#makeDescriptor('close', k, v);
        }
    }
    #checkKeys(options) {
//        console.log([...Object.keys(this)]);
//        console.log([...Object.getOwnPropertyNames(this)]);
        console.log([...Object.getOwnPropertyNames(ObservedProperties.prototype)]);
        const reserveds = [...Object.getOwnPropertyNames(ObservedProperties.prototype)];
        const keys = [...Object.keys(options)];
        for (let key of Object.keys(options)) {if (reserveds.some(r=>r===key)) {throw new TypeError(`'${key}' は予約済みキー名です。他の名前にしてください。予約済み名一覧:${reserveds}`)}}
    }
    #setDefaultOptions(options) {
        for (let [k, v] of Object.entries(options)) {
            if ('_'===k) {continue}
            if (options.hasOwnProperty('value') && options.value instanceof ObservedProperties) {continue}
            console.log(k, v);
            if (!v.hasOwnProperty('value') && !v.hasOwnProperty('type')) {throw TypeError('valueとtypeは少なくともいずれか一つ必要です。')}
            else if (v.hasOwnProperty('value') && !v.hasOwnProperty('type')) {
                options[k].type = Typed.getTypeFromValue(v.value);
            }
            else if (!v.hasOwnProperty('value') && v.hasOwnProperty('type')) {
                options[k].value = Typed.defaultValue(v.type);
            }
//            if ()
//            if ('_'!==k) {this._.opt.open[k] = v;}
        }
        if (options.hasOwnProperty('_')) {this.#setDefaultOptions(options._)}
        /*
        console.log(options, options.hasOwnProperty('value') , !options.hasOwnProperty('type'));
        if (options.has('value') && !options.has('type')) {
            console.log('valueはあるがtypeがない。:', options.value.name, options.value.constructor.name);
        }
        */
        /*
        if ('value' in options && !('type' in options)) {
            console.log('valueはあるがtypeがない。:', options.value.name, options.value.constructor.name);
//            options.
        }
        */
    }
    setup(values) {// values:{name:value, name:value, ...}
        for (let [k, v] of Object.entries(values)) {
            // ToDo: 型、妥当性チェックする
            this._.obj[k] = v;
        }
        this._.update();
    }
    #update() {
        if ('function'===typeof this._.update) {this._.update();}
    }
    #makeDescriptor(oc, k, v) {
        this._.prop[oc][k] = undefined;
        const isObs = (v instanceof ObservedProperties);
        const desc = {
            configurable: false,
            enumerable: true,
            get: ()=>this._.prop[oc][k],
            set: (V)=>{
                console.log(this);
                // ToDo: 型、妥当性チェックする
                Typed.valid(this._.opt[oc].type, v);
                const oldValue = this._.prop[oc][k];
                this._.prop[oc][k] = V;
                if (k in this._.onSet[oc]) {this._.onSet[oc][k](V, oldValue);}
                if (k in this._.onChange[oc] && V!==oldValue) {this._.onChange[oc][k](V, oldValue);}
                this._.update();
            },
            /*
            get() {return this._.prop[oc][k];},
            ...(isObs
            ? ({
                set(V) {throw new SyntaxError('代入禁止です。');}
            })
            : ({
                set(V) {
                    console.log(this);
                    // ToDo: 型、妥当性チェックする
                    Typed.valid(this._.opt[oc].type, v);
                    this._.prop[oc][k] = V;
                    this._.update();
                },
            })),
            */
        };
        Object.defineProperty(this._.obj[oc], k, desc);
        if (!isObs) {
            // ToDo: 型、妥当性チェックする
            Typed.valid(this._.opt[oc][k].type, v.value);
        }
        this._.prop[oc][k] = v.value;

        // this._.obj[oc]だけでなく、thisにも同じディスクリプタを追加する
        if ('open'===oc) {
            Object.defineProperty(this, k, desc);
        }
        //this._.prop[oc][k].value = v.value;
        //this._.opt[oc][k].value = v.value;
        /*
        //if (isObs) {this._.obj[oc][k] = v;}
        if (isObs) {this._.opt[oc][k].value = v.value;}
        else {
            if (!v.hasOwnProperty('type')) {this._.opt[oc].type = String}
//            this._.obj[oc][k].value = v.hasOwnProperty('value') ? v.value : Typed.defaultValue(this._.opt[oc].type, this._.opt[oc].value);
            // ToDo: 型、妥当性チェックする
            //Typed.valid(this._.opt[oc][k].type, v);
            Typed.valid(this._.opt[oc][k].type, v.value);
            this._.opt[oc][k].value = v.value;
        }
        */
        /*
        if (v instanceof ObservedProperties) {
            Object.defineProperty(this._.obj[oc], k, {
                configurable: false,
                enumerable: true,
                writable: false,
//                value: v,
                get() {return this._.prop[oc][k];},
                set(V) {throw new SyntaxError('代入禁止です。');}
            });
            this._.obj[oc][k] = v;
        } else {
            Object.defineProperty(this._.obj[oc], k, {
                configurable: false,
                enumerable: true,
                writable: false,
    //            value: "static",
                get() {return this._.prop[oc][k];},
                set(V) {
                    // ToDo: 型、妥当性チェックする
                    Typed.valid(this._.opt[oc].type, v);
                    this._.prop[oc][k] = V;
                    this._.update();
                },
            });
            if (!v.hasOwnProperty('type')) {this._.opt[oc].type = String}
            this._.obj[oc][k] = v.hasOwnProperty('value') ? v.value : Typed.defaultValue(this._.opt[oc].type, this._.opt[oc].value);
            // ToDo: 型、妥当性チェックする
            Typed.valid(this._.opt[oc].type, v);
        }
        */
    }
    #makeDesc(n, o) {
        const D = Object.create(null);
        D.configurable = false; // プロパティの削除ができないようにする。
//        D.enumerable = '_' !== n; // _以外はプロパティ名を表示するようにする。Object.keys()
        D.enumerable = true; // プロパティ名を表示するようにする。Object.keys()
        D.writable = true; // falseにしても代入自体はできるが、値の変更がされないだけ。正常終了してしまう。よってmutable:falseの時は例外発生させる。
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
        if (Number===type && !nanable && Number.isNaN(value)) {throw new TypeError(`許容していないのにNaNです。`)}
        if (Number===type && !infinitable && (Infinity===value || -Infinity===value)) {throw new TypeError(`許容していないのに無限数です。`)}
        if (Number===type && !unsafable && (!Number.isSafeInteger(value))) {throw new TypeError(`許容していないのに非安全な整数値です。`)}
    }
    static #validType(type, value) {
        console.log(type, value, Number===type, 'number'!==typeof value, typeof value);
        if ((Boolean===type && 'boolean'!==typeof value)
        || (Number===type && 'number'!==typeof value)
        || (BigInt===type && 'bigint'!==typeof value)
        || (String===type && 'string'!==typeof value)
        || (Symbol===type && 'symbol'!==typeof value)) { throw new TypeError(`${value}は期待する${type}型ではありません。`) } // プリミティブ型
        //else {// オブジェクト型
        else if ('object'===typeof value) {// オブジェクト型
            if (Object===type && '[object Object]'!==value.prototype.toString()) { throw new TypeError(`${value}は期待する${type}型ではありません。`) } // {k:'v'}
            if (!(value instanceof type)) {throw new TypeError(`${value}は期待する${type}型ではありません。`)} // クラスやオブジェクトのインスタンス
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
window.Obs = ObservedProperties;
})();
