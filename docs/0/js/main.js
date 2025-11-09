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
    const a = new Assertion();
    a.t('Obs' in window);
    a.t(()=>{
        const o = new Obs({some:{value:123}});
//        o.value
        console.log(o._.prop.open);
        console.log(o._.obj.open);
        console.log(o._.obj.open.some);
        console.log(o.some);
//        Obs.setup(o, {name:value, name:value});
//        o.setup({name:value, name:value})
        return 123===o.some;
    });
    a.e(TypeError, `msg`, ()=>{throw new TypeError(`msg`)});
    a.fin();
});
window.addEventListener('beforeunload', (event) => {
    console.log('beforeunload!!');
});

