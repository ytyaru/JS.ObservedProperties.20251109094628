(function(){
class FixObservedProperties {// 定数専用
    constructor(options) {
        this._ = {opt:{}, prop:{}};
        this.#checkArgs(iOpt, oOpt, update);
        this.#checkKeys(iOpt)
        this.#setDefaultOptions(iOpt);
        for (let [k, v] of Object.entries(this._.opt)) { this.#makeDescriptor(k, v); }
        this._.oOpt = ([undefined,null].some(v=>v===oOpt)) ? ({}) : (oOpt instanceof ObservedProperties) ? oOpt : new ObservedProperties(oOpt);
        if ('function'===typeof update) {this._.update = update;}
        return this.#makeProxy();
    }
    #checkArgs(options, oOpt, update) {
        const isObj = (v)=>null!==v && 'object'===typeof v && '[object Object]'===Object.prototype.toString.call(v);
        if (!isObj(options)) {throw new TypeError(`第一引数optionsはプロパティ名とその型などの情報を持つオブジェクトであるべきです。例:{name:{value:''}, age:{value:0, valid:Obs.valid.range(0,100)}}`)}
    }
    #checkKeys(options) {
        const reserveds = ['_isProxy'];
        const keys = [...Object.keys(options)];
        for (let key of Object.keys(options)) {if (reserveds.some(r=>r===key)) {throw new TypeError(`'${key}' は予約済みキー名です。他の名前にしてください。予約済み名一覧:${reserveds.join(',')}`)}}
    }
    #setDefaultOptions(options) {
        for (let [k, v] of Object.entries(options)) {
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
//            else if ('$'===prop) {console.log(this._.oOpt);return this._.oOpt;}
//            else if ('setup'===prop) {console.log(this.setup);return this.setup.bind(this);}
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
        this._ = {opt:{}, prop:{}, onSet:{}, onChange:{}, update:(i,o)=>{}};
        this.#checkArgs(iOpt, oOpt, update);
        this.#checkKeys(iOpt)
        this.#setDefaultOptions(iOpt);
        for (let [k, v] of Object.entries(this._.opt)) { this.#makeDescriptor(k, v); }
        this._.oOpt = ([undefined,null].some(v=>v===oOpt)) ? ({}) : (oOpt instanceof ObservedProperties) ? oOpt : new ObservedProperties(oOpt);
        if ('function'===typeof update) {this._.update = update;}
        this.#update();
        console.log(this);
        return this.#makeProxy();
    }
    #checkArgs(iOpt, oOpt, update) {
        const isObj = (v)=>null!==v && 'object'===typeof v && '[object Object]'===Object.prototype.toString.call(v);
        if (!isObj(iOpt)) {throw new TypeError(`第一引数iOptはプロパティ名とその型などの情報を持つオブジェクトであるべきです。例:{name:{value:''}, age:{value:0, valid:Obs.valid.range(0,100)}}`)}
        if (undefined!==oOpt && null!==oOpt && !isObj(oOpt) && !(oOpt instanceof ObservedProperties)) {throw new TypeError(`第二引数oOptはObsインスタンスまたはプロパティ名とその型などの情報を持つオブジェクトであるべきです。例:{name:{value:''}, age:{value:0, valid:Obs.valid.range(0,100)}}`)}
        if (undefined!==update && 'function'!==typeof update) {throw new TypeError(`第三引数updateはプロパティに値を代入したら実行されるコールバック関数であるべきです。例: (i,o)=>o.msg = '名:' + i.name + ' 年:' + i.age;`)}
    }
    #checkKeys(iOpt) {
        //const reserveds = [...Object.getOwnPropertyNames(ObservedProperties.prototype)];
        //const reserveds = [...Object.getOwnPropertyNames(ObservedProperties.prototype), '$', '_isProxy'];
        const reserveds = ['setup', '$', '_isProxy'];
        const keys = [...Object.keys(iOpt)];
        for (let key of Object.keys(iOpt)) {if (reserveds.some(r=>r===key)) {throw new TypeError(`'${key}' は予約済みキー名です。他の名前にしてください。予約済み名一覧:${reserveds.join(',')}`)}}
    }
    #setDefaultOptions(iOpt) {
        for (let [k, v] of Object.entries(iOpt)) {
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
        this._.opt = iOpt;
    }
    setup(values) {// values:{name:value, name:value, ...}
        for (let [k, v] of Object.entries(values)) {
            console.log(this._.prop);
            if (!(k in this._.prop)) {throw new SyntaxError(`未定義のプロパティに代入しました。:${prop}`)}
            // ToDo: 型、妥当性チェックする
            Typed.valid(this._.opt[k].type, v);
            const oldValue = this._.prop[k];
            this._.prop[k] = v;
            //this._.obj.open[k] = v; // update()が毎回発火してしまうので使わぬようにする
            if (k in this._.onSet) {this._.onSet[k](v, oldValue);}
            if (k in this._.onChange && value!==oldValue) {this._.onChange[k](v, oldValue);}
        }
        return this.#update();
    }
    #update() {
        if ('function'===typeof this._.update) {return this._.update(structuredClone(this._.prop), this._.oOpt);}
    }
    #makeProxy() { return new Proxy(this, {
        get: (target, prop, receiver)=>{
            if ('_isProxy'===prop) {return true}
            else if ('$'===prop) {console.log(this._.oOpt);return this._.oOpt;}
            else if ('setup'===prop) {console.log(this.setup);return this.setup.bind(this);}
            else {
                if (!(prop in this._.prop)) {throw new SyntaxError(`未定義のプロパティを参照しました。:${prop}`)}
                return this._.prop[prop];
            }
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
        },
    });
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
        if (!isObs) {// ToDo: 型、妥当性チェックする
            Typed.valid(this._.opt[k].type, v.value);
        }
        this._.prop[k] = v.value;
        Object.defineProperty(this, k, desc);
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

window.Obs = new Proxy({
    version: '0.0.1',
    summary: 'Observerオブジェクトを生成します。リアクティブ・プログラミングに最適です。',
    example: `
const o = Obs.var({name:{value:'Bob'}, age:{value:12}}, {msg:{value:''}}, (i,o)=>o.msg=\`My name is \${i.name}, \${i.age} years old.\`);
console.assert('My name is Bob, 12 years old.'===o.$.msg);
o.name = 'John';
o.age = 24;
console.assert('My name is John, 24 years old.'===o.$.msg);
// o.name = 3; // TypeError
// o.notHas; // SyntaxError

const MATH = Obs.fix({PI:{value:3.14}});
console.assert(3.14===MATH.PI);
MATH.PI; // 3.14
MATH.PI = 3.14159; // SyntaxError
`,
    var: (...args)=>new ObservedProperties(...args),
    fix: (...args)=>new FixObservedProperties(...args),
}, {
    get:(target, prop, receiver)=>{
        console.log([...Object.keys(target)]);
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
