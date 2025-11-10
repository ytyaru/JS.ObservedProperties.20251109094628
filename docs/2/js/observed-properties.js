(function(){
class ObservedProperties {
    constructor(iOpt, oOpt, update) {
        //this._ = {opt:{open:{},close:{}}, prop:{open:{},close:{}}, obj:{open:{},close:{}}, onSet:{open:{},close:{}}, onChange:{open:{},close:{}}, update:(i,o)=>{}};
        //this._ = {opt:{}, prop:{}, obj:{}, onSet:{}, onChange:{}, update:(i,o)=>{}};
        this._ = {opt:{}, prop:{}, onSet:{}, onChange:{}, update:(i,o)=>{}};
        this.#checkArgs(iOpt, oOpt, update);
        this.#checkKeys(iOpt)
        this.#setDefaultOptions(iOpt);
        //for (let [k, v] of Object.entries(this._.opt)) { this.#makeDescriptor(k, v); }
        for (let [k, v] of Object.entries(this._.opt)) { this.#makeDescriptor(k, v); }
        this._.oOpt = ([undefined,null].some(v=>v===oOpt)) ? ({}) : (oOpt instanceof ObservedProperties) ? oOpt : new ObservedProperties(oOpt);
        if ('function'===typeof update) {this._.update = update;}
        this.#update();
        console.log(this);
        return this.#makeProxy();

        /*
        if ('function'===typeof update) {this._.update = update;}
        if (iOpt.hasOwnProperty('_')) {this._.opt.close = iOpt._}
        for (let [k, v] of Object.entries(iOpt)) { if ('_'!==k) {this._.opt.open[k] = v;} }
        for (let [k, v] of Object.entries(this._.opt.open)) {
            this.#makeDescriptor('open', k, v);
        }
        for (let [k, v] of Object.entries(this._.opt.close)) {
            this.#makeDescriptor('close', k, v);
        }
        this._.output = 0 < [...Object.keys(this._.opt.close)].length ? new ObservedProperties(this._.opt.close) : ({}); // 出力用（iOptで設定したプロパティの組合せで計算しupdateでセットした結果のプロパティ）
        console.log(this);
        return this.#makeProxy();
        */
    }
    #checkArgs(iOpt, oOpt, update) {
        console.log(iOpt, oOpt, update);
        console.log(iOpt.toString());
        console.log(Object.prototype.toString.call(iOpt));
//        console.log(null!==v , 'object'!==typeof v , '[object Object]'!==Object.prototype.toString.call(iOpt));
        //const isObj = (v)=>null!==v && 'object'!==typeof v || '[object Object]'!==v.toString();
        const isObj = (v)=>null!==v && 'object'===typeof v && '[object Object]'===Object.prototype.toString.call(v);
        if (!isObj(iOpt)) {throw new TypeError(`第一引数iOptはプロパティ名とその型などの情報を持つオブジェクトであるべきです。例:{name:{value:''}, age:{value:0, valid:Obs.valid.range(0,100)}}`)}
        if (undefined!==oOpt && null!==oOpt && !isObj(oOpt) && !(oOpt instanceof ObservedProperties)) {throw new TypeError(`第二引数oOptはObsインスタンスまたはプロパティ名とその型などの情報を持つオブジェクトであるべきです。例:{name:{value:''}, age:{value:0, valid:Obs.valid.range(0,100)}}`)}
        if (undefined!==update && 'function'!==typeof update) {throw new TypeError(`第三引数updateはプロパティに値を代入したら実行されるコールバック関数であるべきです。例: (i,o)=>o.msg = '名:' + i.name + ' 年:' + i.age;`)}
    }
    #checkKeys(iOpt) {
//        console.log([...Object.keys(this)]);
//        console.log([...Object.getOwnPropertyNames(this)]);
        console.log([...Object.getOwnPropertyNames(ObservedProperties.prototype)]);
        const reserveds = [...Object.getOwnPropertyNames(ObservedProperties.prototype)];
        const keys = [...Object.keys(iOpt)];
        for (let key of Object.keys(iOpt)) {if (reserveds.some(r=>r===key)) {throw new TypeError(`'${key}' は予約済みキー名です。他の名前にしてください。予約済み名一覧:${reserveds.join(',')}`)}}
    }
    #setDefaultOptions(iOpt) {
        for (let [k, v] of Object.entries(iOpt)) {
//            if ('_'===k) {continue}
            if (iOpt.hasOwnProperty('value') && iOpt.value instanceof ObservedProperties) {continue}
            console.log(k, v);
            if (!v.hasOwnProperty('value') && !v.hasOwnProperty('type')) {throw TypeError('valueとtypeは少なくともいずれか一つ必要です。')}
            else if (v.hasOwnProperty('value') && !v.hasOwnProperty('type')) {
                iOpt[k].type = Typed.getTypeFromValue(v.value);
            }
            else if (!v.hasOwnProperty('value') && v.hasOwnProperty('type')) {
                iOpt[k].value = Typed.defaultValue(v.type);
            }
        }
//        if (iOpt.hasOwnProperty('_')) {this.#setDefaultOptions(iOpt._)}
        this._.opt = iOpt;
    }
    setup(values) {// values:{name:value, name:value, ...}
        for (let [k, v] of Object.entries(values)) {
            console.log(this._.prop);
            if (!(k in this._.prop)) {throw new SyntaxError(`未定義のプロパティに代入しました。:${prop}`)}
            // ToDo: 型、妥当性チェックする
            //Typed.valid(this._.opt[oc][k].type, v);
            Typed.valid(this._.opt[k].type, v);
            const oldValue = this._.prop[k];
            this._.prop[k] = v;
            //this._.obj.open[k] = v; // update()が毎回発火してしまうので使わぬようにする
            if (k in this._.onSet) {this._.onSet[k](v, oldValue);}
            if (k in this._.onChange && value!==oldValue) {this._.onChange[k](v, oldValue);}
            /*
            if (!(k in this._.prop.open)) {throw new SyntaxError(`未定義のプロパティに代入しました。:${prop}`)}
            // ToDo: 型、妥当性チェックする
            //Typed.valid(this._.opt[oc][k].type, v);
            Typed.valid(this._.opt.open[k].type, v);
            const oldValue = this._.prop.open[k];
            this._.prop.open[k] = v;
            //this._.obj.open[k] = v; // update()が毎回発火してしまうので使わぬようにする
            if (k in this._.onSet.open) {this._.onSet.open[k](v, oldValue);}
            if (k in this._.onChange.open&& value!==oldValue) {this._.onChange.open[k](v, oldValue);}
            */
        }
        return this.#update();
    }
    #update() {
        //if ('function'===typeof this._.update) {return this._.update(structuredClone(this._.prop.open, this._.output));}
        if ('function'===typeof this._.update) {return this._.update(structuredClone(this._.prop), this._.oOpt);}
    }
    #makeProxy() { return new Proxy(this, {
        get: (target, prop, receiver)=>{
            if ('_isProxy'===prop) {return true}

            else if ('$'===prop) {console.log(this._.oOpt);return this._.oOpt;}
//            else if ('$'===prop) {console.log(this.$, target.$);return target.$;}
//            else if ('$'===prop) {console.log(this.$, target.$);return this.$;}
//            else if ('$'===prop) {console.log(this.setup);return this['$'].bind(this);}
//            else if ('$'===prop) {console.log(this.setup);return Reflect.get(this, '$');}
//            else if ('$'===prop) {console.log(this.setup);return Reflect.getOwnPropertyDescriptor(this, '$');}
            else if ('setup'===prop) {console.log(this.setup);return this.setup.bind(this);}
            else {
                if (!(prop in this._.prop)) {throw new SyntaxError(`未定義のプロパティを参照しました。:${prop}`)}
                return this._.prop[prop];
            }
            /*
            else {
                const oc = '_'===prop ? 'close' : 'open';
                //if (!(prop in this._.prop[oc])) {throw new SyntaxError(`存在しないプロパティ名'${prop}'を参照しました。`)}
                if (!(prop in this._.prop[oc])) {throw new SyntaxError(`未定義のプロパティを参照しました。:${prop}`)}

                return this._.prop[oc][prop];
            }
            */
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
            console.log(target._.prop, this._.prop, target, this);
            if (!(prop in target._.prop)) {throw new SyntaxError(`未定義のプロパティに代入しました。:${prop}`)}
            Typed.valid(target._.opt[prop].type, value);
            const oldValue = target._.prop[prop];
            target._.prop[prop] = value;
            if (prop in target._.onSet) {target._.onSet[prop](value, oldValue);}
            if (prop in target._.onChange && value!==oldValue) {target._.onChange[prop](value, oldValue);}
            target._.update();

            /*
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
            */
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
                const oldValue = this._.prop[k];
                this._.prop[k] = V;
                if (k in this._.onSet) {this._.onSet[k](V, oldValue);}
                if (k in this._.onChange && V!==oldValue) {this._.onChange[k](V, oldValue);}
                this._.update();
            },
        };
//        Object.defineProperty(this._.obj, k, desc);
        if (!isObs) {// ToDo: 型、妥当性チェックする
            Typed.valid(this._.opt[k].type, v.value);
        }
        this._.prop[k] = v.value;

        // this._.objとthisだけでなく、thisにも同じディスクリプタを追加する
//        Object.defineProperty(this._.obj, k, desc);
        Object.defineProperty(this, k, desc);
    }
    /*
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
    */
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
