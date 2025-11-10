window.addEventListener('DOMContentLoaded', (event) => {
    console.log('DOMContentLoaded!!');
    const author = 'ytyaru';
    van.add(document.querySelector('main'), 
        van.tags.h1(van.tags.a({href:`https://github.com/${author}/JS.ObservedProperties.20251109094628/`}, 'ObservedProperties')),
        van.tags.p('値を代入したら任意の処理を実行する。'),
//        van.tags.p('After assigning a value, perform any processing.'),
    );
    van.add(document.querySelector('footer'),  new Footer('ytyaru', '../').make());

    console.log(Obs)
//    console.log(Obs.var)
//    console.log(Obs.var())
    const o = Obs.var({some:{value:123}});
    /*
    console.log(o._);
    console.log(o._.opt);
    console.log(o._.opt.open);
    console.log(o._.opt.open.some);
    console.log(o._.opt.open.some.value);
    console.log(o._.opt.open.some.type);
    */
    o.some = 234;
    o.setup({some:345});

    const O = Obs.var({some:{value:123}},{msg:{value:'MSG'}});
    O.$.msg;

    const a = new Assertion();
    a.t('Obs' in window);
    a.e(TypeError, `valueとtypeは少なくともいずれか一つ必要です。`, ()=>{Obs.var({some:{}})});
    const RESERVED = 'setup,$,_isProxy';
    a.e(TypeError, `'setup' は予約済みキー名です。他の名前にしてください。予約済み名一覧:${RESERVED}`, ()=>{Obs.var({setup:{value:0}})});
    a.e(TypeError, `'$' は予約済みキー名です。他の名前にしてください。予約済み名一覧:${RESERVED}`, ()=>{Obs.var({'$':{value:0}})});
    a.e(TypeError, `'_isProxy' は予約済みキー名です。他の名前にしてください。予約済み名一覧:${RESERVED}`, ()=>{Obs.var({_isProxy:{value:0}})});
    a.t(()=>{
        const o = Obs.var({constructor:{value:0}}); // 予約済み名でなく例外も出ないこと
        return 0===o.constructor;
    });
    a.t(()=>{
        const o = Obs.var({toString:{value:0}}); // 予約済み名でなく例外も出ないこと
        return 0===o.toString;
    });
    a.t(()=>{
        const o = Obs.var({some:{value:123}});
        //return 123===o.some && 'some' in o._.opt.open && 123===o._.opt.open.some.value && 123===o._.prop.open.some && Number===o._.opt.open.some.type;
        return 123===o.some;
    });
    a.t(()=>{
        const o = Obs.var({age:{type:Number}});
        //return 0===o.age && 'age' in o._.opt.open && 0===o._.opt.open.age.value && 0===o._.prop.open.age && Number===o._.opt.open.age.type;
        return 0===o.age;
    });
    a.t(()=>{
        const o = Obs.var({size:{type:Number, value:234}});
        //return 234===o.size && 'size' in o._.opt.open && 234===o._.opt.open.size.value && 234===o._.prop.open.size && Number===o._.opt.open.size.type;
        return 234===o.size;
    });
    a.e(TypeError, `'str'は期待するNumber型ではありません。`, ()=>{Obs.var({size:{type:Number, value:'str'}});});
    a.t(()=>{
        const o = Obs.var({some:{value:123}});
        o.some = 234;
        //return 234===o.some && 'some' in o._.opt.open && 123===o._.opt.open.some.value && 234===o._.prop.open.some && Number===o._.opt.open.some.type;
        return 234===o.some;
    });
    a.e(TypeError, `'abc'は期待するNumber型ではありません。`, ()=>{
        const o = Obs.var({some:{value:123}});
        o.some = 'abc';
    });
    a.e(SyntaxError, `未定義のプロパティを参照しました。:notHas`, ()=>{
        const o = Obs.var({some:{value:123}});
        o.notHas;
    });
    a.e(SyntaxError, `未定義のプロパティに代入しました。:notHas`, ()=>{
        const o = Obs.var({some:{value:123}});
        o.notHas = 234;
    });
    a.t(()=>{
        const o = Obs.var({name:{value:'山田'}, age:{value:24}});
        const R = '山田'===o.name && 24===o.age;
        o.setup({name:'鈴木', age:36})
        //return 234===o.some && 'some' in o._.opt.open && 123===o._.opt.open.some.value && 234===o._.prop.open.some && Number===o._.opt.open.some.type;
        return R && '鈴木'===o.name && 36===o.age;
    });
    a.t(()=>{
        const o = Obs.var({name:{value:'山田'}, age:{value:24}}, {message:{value:''}}, (i,o)=>{
            console.log(i, o);
            o.message = `私の名は「${i.name}」、${i.age}歳です。`;
            console.log(i, o.message);
        });
        const R = '山田'===o.name && 24===o.age && `私の名は「${o.name}」、${o.age}歳です。`===o.$.message;
        o.setup({name:'鈴木', age:36})
        //return 234===o.some && 'some' in o._.opt.open && 123===o._.opt.open.some.value && 234===o._.prop.open.some && Number===o._.opt.open.some.type;
        return R && '鈴木'===o.name && 36===o.age && `私の名は「${o.name}」、${o.age}歳です。`===o.$.message;
    });

    a.t(()=>{
        const o = Obs.var({age:0});
        const R0 = 0===o.age;
        o.age = 1;
        const R1 = 1===o.age;
        o.age = 1.2;
        const R2 = 1.2===o.age;
        return R0 && R1 && R2;
    });
    // Fix
    //const MATH = Obs.fix({PI:3.14});
    //const MATH = Obs.fix({PI:Float(3.14)});
    const MATH = Obs.fix({PI:Obs.T.float(3.14)});
    a.t(()=>{
        //const MATH = Obs.fix({PI:Float(3.14)});
        const MATH = Obs.fix({PI:Obs.T.float(3.14)});
        console.log(MATH.PI);
        return 3.14===MATH.PI;
        
    });




    a.fin();
});
window.addEventListener('beforeunload', (event) => {
    console.log('beforeunload!!');
});

