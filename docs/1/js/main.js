window.addEventListener('DOMContentLoaded', (event) => {
    console.log('DOMContentLoaded!!');
    const author = 'ytyaru';
    van.add(document.querySelector('main'), 
        van.tags.h1(van.tags.a({href:`https://github.com/${author}/JS.ObservedProperties.20251109094628/`}, 'ObservedProperties')),
        van.tags.p('値を代入したら任意の処理を実行する。'),
//        van.tags.p('After assigning a value, perform any processing.'),
    );
    van.add(document.querySelector('footer'),  new Footer('ytyaru', '../').make());

    const o = new Obs({some:{value:123}});
    console.log(o._);
    console.log(o._.opt);
    console.log(o._.opt.open);
    console.log(o._.opt.open.some);
    console.log(o._.opt.open.some.value);
    console.log(o._.opt.open.some.type);
    o.some = 234;
    const a = new Assertion();
    a.t('Obs' in window);
    a.e(TypeError, `valueとtypeは少なくともいずれか一つ必要です。`, ()=>{new Obs({some:{}})});
    a.e(TypeError, `'constructor' は予約済みキー名です。他の名前にしてください。予約済み名一覧:constructor,setup`, ()=>{new Obs({constructor:{}})});
    a.e(TypeError, `'setup' は予約済みキー名です。他の名前にしてください。予約済み名一覧:constructor,setup`, ()=>{new Obs({setup:{}})});
    a.t(()=>{
        const o = new Obs({some:{value:123}});
        return 123===o.some && 'some' in o._.opt.open && 123===o._.opt.open.some.value && 123===o._.prop.open.some && Number===o._.opt.open.some.type;
    });
    a.t(()=>{
        const o = new Obs({age:{type:Number}});
        return 0===o.age && 'age' in o._.opt.open && 0===o._.opt.open.age.value && 0===o._.prop.open.age && Number===o._.opt.open.age.type;
    });
    a.t(()=>{
        const o = new Obs({size:{type:Number, value:234}});
        return 234===o.size && 'size' in o._.opt.open && 234===o._.opt.open.size.value && 234===o._.prop.open.size && Number===o._.opt.open.size.type;
    });
    a.e(TypeError, `'str'は期待するNumber型ではありません。`, ()=>{new Obs({size:{type:Number, value:'str'}});});
    a.t(()=>{
        const o = new Obs({some:{value:123}});
        o.some = 234;
        return 234===o.some && 'some' in o._.opt.open && 123===o._.opt.open.some.value && 234===o._.prop.open.some && Number===o._.opt.open.some.type;
    });
    a.e(TypeError, `'abc'は期待するNumber型ではありません。`, ()=>{
        const o = new Obs({some:{value:123}});
        o.some = 'abc';
    });
    a.e(TypeError, `未定義のプロパティを参照しました。`, ()=>{
        const o = new Obs({some:{value:123}});
        o.notHas;
    });



    a.fin();
});
window.addEventListener('beforeunload', (event) => {
    console.log('beforeunload!!');
});

