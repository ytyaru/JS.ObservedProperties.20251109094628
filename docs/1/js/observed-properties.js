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
        console.log(this);
        return this.#makeProxy();
    }
    #checkKeys(options) {
//        console.log([...Object.keys(this)]);
//        console.log([...Object.getOwnPropertyNames(this)]);
        console.log([...Object.getOwnPropertyNames(ObservedProperties.prototype)]);
        const reserveds = [...Object.getOwnPropertyNames(ObservedProperties.prototype)];
        const keys = [...Object.keys(options)];
        for (let key of Object.keys(options)) {if (reserveds.some(r=>r===key)) {throw new TypeError(`'${key}' は予約済みキー名です。他の名前にしてください。予約済み名一覧:${reserveds.join(',')}`)}}
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
        }
        if (options.hasOwnProperty('_')) {this.#setDefaultOptions(options._)}
    }
    setup(values) {// values:{name:value, name:value, ...}
        for (let [k, v] of Object.entries(values)) {
            // ToDo: 型、妥当性チェックする
            Typed.valid(this._.opt[oc][k].type, v);
            this._.prop.open[k] = v;
            //this._.obj.open[k] = v; // update()が毎回発火してしまうので使わぬようにする
        }
        this._.update(structuredClone(this._.prop.open), this._.prop.close);
    }
    #update() {
        if ('function'===typeof this._.update) {this._.update();}
    }
    #makeProxy() { return new Proxy(this, {
            get: (target, prop, receiver)=>{
                if ('_isProxy'===prop) {return true}
                const oc = '_'===prop ? 'close' : 'open';
                //if (!(prop in this._.prop[oc])) {throw new SyntaxError(`存在しないプロパティ名'${prop}'を参照しました。`)}
                if (!(prop in this._.prop[oc])) {throw new SyntaxError(`未定義のプロパティを参照しました。:${prop}`)}

                return this._.prop[oc][prop];
                /*
                if ('_'===prop) {
                    if (!(prop in this._.prop.close)) {throw new SyntaxError(`存在しないプロパティ名'${prop}'を参照しました。`)}
                    return this._.prop.close[prop];
                } else {
                    if (!(prop in target._.prop.open)) {throw new SyntaxError(`存在しないプロパティ名'${prop}'を参照しました。`)}
                    return target._.prop.open[prop];
                }
                //return this._.prop.open[prop];
                //return this[prop];
                */
            },
            set: (target, prop, value, receiver)=>{
                const oc = '_'===prop ? 'close' : 'open';
                if (!(prop in target._.prop[oc])) {throw new SyntaxError(`未定義のプロパティに代入しました。:${'close'===oc ? '_.' : ''}${prop}`)}
                Typed.valid(target._.opt[oc][prop].type, value);
//                if ('valid' in target._.opt[oc][prop] && 'function'===typeof target._.opt[oc][prop].valid) { target._.opt[oc][prop].valid(value); }
                //  && prop in target._.opt[oc].valid
                const oldValue = target._.prop[oc][prop];
                target._.prop[oc][prop] = value;
                if (prop in target._.onSet[oc]) {target._.onSet[oc][prop](value, oldValue);}
                if (prop in target._.onChange[oc]&& value!==oldValue) {target._.onChange[oc][prop](value, oldValue);}
                target._.update();
                /*
                if ('_'===prop) {
                    if (!(prop in target._.prop.close)) {throw new SyntaxError(`存在しないプロパティ名'${prop}'に代入しました。`)}
                    Typed.valid(target._.opt.close[prop].type, value);
                    const oldValue = target._.prop.close[prop];
                    target._.prop.close[prop] = value;
                    if (prop in target._.onSet.close) {target._.onSet.close[prop](value, oldValue);}
                    if (prop in target._.onChange.close&& value!==oldValue) {target._.onChange.close[prop](value, oldValue);}
                    target._.update();
                }
//                console.log(this, this._.opt[oc][k].type);
                if (!(prop in target._.prop.open)) {throw new SyntaxError(`存在しないプロパティ名'${prop}'に代入しました。`)}
                // ToDo: 型、妥当性チェックする
                //Typed.valid(this._.opt[oc][k].type, value);
                //Typed.valid(this._.opt.open[prop].type, value);
                Typed.valid(target._.opt.open[prop].type, value);
                //const oldValue = this._.prop[oc][k];
                //const oldValue = this._.prop.open[prop];
                const oldValue = target._.prop.open[prop];
                //this._.prop[oc][k] = V;
                //this._.prop.open[prop] = value;
                target._.prop.open[prop] = value;
//                if (k in this._.onSet[oc]) {this._.onSet[oc][k](V, oldValue);}
//                if (k in this._.onChange[oc] && V!==oldValue) {this._.onChange[oc][k](V, oldValue);}
//                if (prop in this._.onSet.open) {this._.onSet.open[prop](value, oldValue);}
//                if (prop in this._.onChange.open && value!==oldValue) {this._.onChange.open[prop](value, oldValue);}
//                this._.update();
                if (prop in target._.onSet.open) {target._.onSet.open[prop](value, oldValue);}
                if (prop in target._.onChange.open && value!==oldValue) {target._.onChange.open[prop](value, oldValue);}
                target._.update();
                */
            },
        });
        /*
        const target = {}
        for (let k of Object.keys(this._.opt.open)) {
            target[k] = this._.prop.open.[k];
        }
        for (let k of Object.keys(this._.opt.close)) {
            target._.[k] = this._.prop.close.[k];
        }
        const target = {
            ...this._.
        }
        */
    }
    #makeDescriptor(oc, k, v) {
        this._.prop[oc][k] = undefined;
        const isObs = (v instanceof ObservedProperties);
        const desc = {
            configurable: false,
            enumerable: true,
            get: ()=>this._.prop[oc][k],
            set: (V)=>{
                console.log(this, this._.opt[oc][k].type);
                // ToDo: 型、妥当性チェックする
                Typed.valid(this._.opt[oc][k].type, V);
                const oldValue = this._.prop[oc][k];
                this._.prop[oc][k] = V;
                if (k in this._.onSet[oc]) {this._.onSet[oc][k](V, oldValue);}
                if (k in this._.onChange[oc] && V!==oldValue) {this._.onChange[oc][k](V, oldValue);}
                this._.update();
            },
        };
        Object.defineProperty(this._.obj[oc], k, desc);
        if (!isObs) {// ToDo: 型、妥当性チェックする
            Typed.valid(this._.opt[oc][k].type, v.value);
        }
        this._.prop[oc][k] = v.value;
        // this._.obj[oc]だけでなく、thisにも同じディスクリプタを追加する
        if ('open'===oc) {Object.defineProperty(this, k, desc);}
//        if ('close'===oc && !('_' in this)) {Object.defineProperty(this, '_', desc);}
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
window.Obs = ObservedProperties;
})();
