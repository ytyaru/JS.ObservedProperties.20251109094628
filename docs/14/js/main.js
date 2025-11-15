window.addEventListener('DOMContentLoaded', (event) => {
    console.log('DOMContentLoaded!!');
    const author = 'ytyaru';
    van.add(document.querySelector('main'), 
        van.tags.h1(van.tags.a({href:`https://github.com/${author}/JS.ObservedProperties.20251109094628/`}, 'ObservedProperties')),
        van.tags.p('値を代入したら任意の処理を実行する。'),
//        van.tags.p('After assigning a value, perform any processing.'),
    );
    van.add(document.querySelector('footer'),  new Footer('ytyaru', '../').make());

    const o0 = Obs.var({age:0});
    o0.age = 1;
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

    // NumberDecimal
    Obs.T.n10(2); // 桁数を設定する。初期値は0。
    Obs.T.n10(2,[123,45]); // 桁数を設定する。初期値は0。

    a.t('isOdd' in Math);
    a.t('isEven' in Math);
    a.t('roundToEven' in Math);
    a.t(()=>Math.isEven(0));
    a.f(()=>Math.isEven(1));
    a.f(()=>Math.isEven(-1));
    a.f(()=>Math.isEven(Number.MIN_SAFE_INTEGER));   // -9007199254740991 
    a.t(()=>Math.isEven(Number.MIN_SAFE_INTEGER+1)); // -9007199254740990 
    a.f(()=>Math.isEven(Number.MAX_SAFE_INTEGER));   //  9007199254740991 
    a.t(()=>Math.isEven(Number.MAX_SAFE_INTEGER-1)); //  9007199254740990 
    a.f(()=>Math.isOdd(0));
    a.t(()=>Math.isOdd(1));
    a.t(()=>Math.isOdd(-1));
    a.t(()=>Math.isOdd(Number.MIN_SAFE_INTEGER));   // -9007199254740991 
    a.f(()=>Math.isOdd(Number.MIN_SAFE_INTEGER+1)); // -9007199254740990 
    a.t(()=>Math.isOdd(Number.MAX_SAFE_INTEGER));   //  9007199254740991 
    a.f(()=>Math.isOdd(Number.MAX_SAFE_INTEGER-1)); //  9007199254740990 
    a.t(1===Math.round(0.5)); // 四捨五入
    a.t(2===Math.round(1.5)); // 四捨五入
    a.t(0===Math.roundToEven(0.5)); // 最近接偶数丸め（独自実装した。5の時は偶数になるほうへ丸める）
    a.t(2===Math.roundToEven(1.5)); // 最近接偶数丸め（独自実装した。5の時は偶数になるほうへ丸める）

    // 負数の時はプラス方向に丸める仕様（四捨五入じゃない……）
//    a.t(-1===Math.round(-0.5)); // 四捨五入 こっちが望ましいのに、JSの仕様じゃマイナス値でもプラス方向に丸められるせいで 0 が返る…
//    a.t(-2===Math.round(-1.5)); // 四捨五入 こっちが望ましいのに、JSの仕様じゃマイナス値でもプラス方向に丸められるせいで 0 が返る…
    a.t( 0===Math.round(-0.5)); // 四捨五入 JSの仕様じゃ正しいが、四捨五入から見ると間違っている…
    a.t(-1===Math.round(-1.5)); // 四捨五入 JSの仕様じゃ正しいが、四捨五入から見ると間違っている…
//    a.t( 0===Math.roundToEven(-0.5)); // 最近接偶数丸め
//    a.t(-2===Math.roundToEven(-1.5)); // 最近接偶数丸め
    a.t( 0===Math.roundToEven(-0.5)); // 最近接偶数丸め
    a.t(-1===Math.roundToEven(-1.5)); // 最近接偶数丸め（偶数になってない……）

    // 上記丸め間違いを正すために実装したのがNumberRounder。
    console.log(Obs.U.NumberRounder.round(0.5, 0));
    a.t(1===Obs.U.NumberRounder.round(0.5, 0));   //  0.5 を 小数点0桁で丸めて四捨五入すると  1
    a.t(2===Obs.U.NumberRounder.round(1.5, 0));   //  1.5 を 小数点0桁で丸めて四捨五入すると  2
    a.t(-1===Obs.U.NumberRounder.round(-0.5, 0)); // -0.5 を 小数点0桁で丸めて四捨五入すると -1
    a.t(-2===Obs.U.NumberRounder.round(-1.5, 0)); // -1.5 を 小数点0桁で丸めて四捨五入すると -2

    a.t( 0===Obs.U.NumberRounder.roundToEven(0.5, 0));  //  0.5 を 小数点0桁で丸めて最近接偶数丸めすると  0
    a.t( 2===Obs.U.NumberRounder.roundToEven(1.5, 0));  //  1.5 を 小数点0桁で丸めて最近接偶数丸めすると  2
    a.t( 0===Obs.U.NumberRounder.roundToEven(-0.5, 0)); // -0.5 を 小数点0桁で丸めて最近接偶数丸めすると  0
    a.t(-2===Obs.U.NumberRounder.roundToEven(-1.5, 0)); // -1.5 を 小数点0桁で丸めて最近接偶数丸めすると -2

    // 5 でないなら通常通り切り捨て／切り上げのいずれか
    a.t( 0===Obs.U.NumberRounder.round( 0.4, 0)); //  0.4 を 小数点0桁で丸めて四捨五入すると  0
    a.t( 1===Obs.U.NumberRounder.round( 1.4, 0)); //  1.4 を 小数点0桁で丸めて四捨五入すると  1
    a.t( 0===Obs.U.NumberRounder.round(-0.4, 0)); // -0.4 を 小数点0桁で丸めて四捨五入すると  0
    a.t(-1===Obs.U.NumberRounder.round(-1.4, 0)); // -1.4 を 小数点0桁で丸めて四捨五入すると -1

    a.t( 0===Obs.U.NumberRounder.roundToEven( 0.4, 0)); //  0.4 を 小数点0桁で丸めて四捨五入すると  0
    a.t( 1===Obs.U.NumberRounder.roundToEven( 1.4, 0)); //  1.4 を 小数点0桁で丸めて四捨五入すると  1
    a.t( 0===Obs.U.NumberRounder.roundToEven(-0.4, 0)); // -0.4 を 小数点0桁で丸めて四捨五入すると  0
    a.t(-1===Obs.U.NumberRounder.roundToEven(-1.4, 0)); // -1.4 を 小数点0桁で丸めて四捨五入すると -1

    a.t( 1===Obs.U.NumberRounder.round( 0.6, 0)); //  0.6 を 小数点0桁で丸めて四捨五入すると  1
    a.t( 2===Obs.U.NumberRounder.round( 1.6, 0)); //  1.6 を 小数点0桁で丸めて四捨五入すると  2
    a.t(-1===Obs.U.NumberRounder.round(-0.6, 0)); // -0.6 を 小数点0桁で丸めて四捨五入すると -1
    a.t(-2===Obs.U.NumberRounder.round(-1.6, 0)); // -1.6 を 小数点0桁で丸めて四捨五入すると -2

    a.t( 1===Obs.U.NumberRounder.roundToEven( 0.6, 0)); //  0.6 を 小数点0桁で丸めて四捨五入すると  1
    a.t( 2===Obs.U.NumberRounder.roundToEven( 1.6, 0)); //  1.6 を 小数点0桁で丸めて四捨五入すると  2
    a.t(-1===Obs.U.NumberRounder.roundToEven(-0.6, 0)); // -0.6 を 小数点0桁で丸めて四捨五入すると -1
    a.t(-2===Obs.U.NumberRounder.roundToEven(-1.6, 0)); // -1.6 を 小数点0桁で丸めて四捨五入すると -2

    console.log(Math.round(-0.5), Math.round(-1.5)); // 0, -1

//    Math.roundToEven
    a.t(()=>{
        /*
        const dec = Obs.T.ndec([123,45]); // 少数部が0のとき桁を指定できない！(整数部と少数部を数で指定する)
        const dec = Obs.T.ndec([123,00]); // 少数部が0のとき桁を指定できない！
        const dec = Obs.T.ndec('123.00'); // 文字列で初期値と少数桁数を指定する（整数部と小数部の桁数決めが優先だが、他にもゼロ埋め表示用桁数も指定したい）
        const dec = Obs.T.ndec([123,0,2]); // 数の配列で整数部と少数部の初期値と少数桁数を指定する（初期値ゼロの時面倒`[0,0,2]`）
        const dec = Obs.T.ndec(2, 0); // 桁数, 初期値の順に設定する
        const dec = Obs.T.ndec(2, [0,45]); // 桁数, 初期値の順に設定する。小数部を整数で指定する。
        const dec = Obs.T.ndec(2); // 桁数を設定する。初期値は0。
        // でも少数でなく整数の場合、毎回0を指定するのは面倒
        const dec = Obs.T.nidec(0); // 桁数=0固定, 初期値をセットする

        const dec = Obs.T.dec(2); // 桁数を設定する。初期値は0。
        const dec = Obs.T.idec(); // 桁数=0固定(整数限定), 初期値をセットする
        // 実数と整数を区別するとき、Real/Intとするなら
        // r10(), i10()でもいい。但しこの10が十進数のことでなく10bitのことのようにも見える。かといってrdec, idecは冗長か？　少なくともrdecはdecにすべき。
        // Number10でもいいか。num10, n10等で略す。
        */
        const dec = Obs.T.n10(2,[123,45]); // 桁数を設定する。初期値は0。
        const R0 = dec instanceof Obs.C.NumberDecimal;
        const R1 = 123===dec.partI;
        const R2 = 45===dec.partF;
        const R3 = 2===dec.fig;
        console.log(R0, R1, R2, R3);
        console.log(dec.partI, dec.partF, dec.fig);
        return R0 && R1 && R2 && R3;
    });
    a.e(TypeError, `valueとtypeは少なくともいずれか一つ必要です。`, ()=>{Obs.var({some:{}})});
    const VAR_RESERVED = 'setup,_,$,_isProxy';
    a.e(TypeError, `'setup' は予約済みキー名です。他の名前にしてください。予約済み名一覧:${VAR_RESERVED}`, ()=>{Obs.var({setup:{value:0}})});
    a.e(TypeError, `'_' は予約済みキー名です。他の名前にしてください。予約済み名一覧:${VAR_RESERVED}`, ()=>{Obs.var({_:{value:0}})});
    a.e(TypeError, `'$' は予約済みキー名です。他の名前にしてください。予約済み名一覧:${VAR_RESERVED}`, ()=>{Obs.var({$:{value:0}})});
    a.e(TypeError, `'_isProxy' は予約済みキー名です。他の名前にしてください。予約済み名一覧:${VAR_RESERVED}`, ()=>{Obs.var({_isProxy:{value:0}})});
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
        const o = Obs.var({age:0});// {age:new Integer(0)}の省略形
        const R0 = 0===o.age;
        o.age = 1;
        const R1 = 1===o.age;
        o.age = 1.0; // .0があるが無視されるため整数として判断される
        const R2 = 1===o.age;
        return R0 && R1 && R2;
    });

    a.e(TypeError, `valueはNumber.isSafeInteger()で真を返す値のみ有効です。:${1.2}`, ()=>{
        const o = Obs.var({age:0});// {age:new Integer(0)}の省略形
        const R0 = 0===o.age;
        o.age = 1;
        const R1 = 1===o.age;
        o.age = 1.2; // 少数値を代入するとエラーになる
        const R2 = 1.2===o.age;
        return R0 && R1 && R2;
    });
    a.e(TypeError, `Number型リテラル値を直接指定した時は{value:Integer(999)}等の省略形と見做します。しかし指定された値は非Integer値でした。:${1.2}
Number.isSafeInteger()が真を返す範囲内か、少数値でないか等を確認してください。
少数を使用するなら{weight:Float(62.1)}のように書いてください。`, ()=>Obs.var({age:1.2}));
    a.e(TypeError, `Number型リテラル値を直接指定した時は{value:Integer(999)}等の省略形と見做します。しかし指定された値は非Integer値でした。:${Number.MAX_SAFE_INTEGER+1}
Number.isSafeInteger()が真を返す範囲内か、少数値でないか等を確認してください。
少数を使用するなら{weight:Float(62.1)}のように書いてください。`, ()=>Obs.var({age:Number.MAX_SAFE_INTEGER+1}));
    a.e(TypeError, `Number型リテラル値を直接指定した時は{value:Integer(999)}等の省略形と見做します。しかし指定された値は非Integer値でした。:${Number.MIN_SAFE_INTEGER-1}
Number.isSafeInteger()が真を返す範囲内か、少数値でないか等を確認してください。
少数を使用するなら{weight:Float(62.1)}のように書いてください。`, ()=>Obs.var({age:Number.MIN_SAFE_INTEGER-1}));
    a.t(()=>{
        const o = Obs.var({age:Number.MAX_SAFE_INTEGER});
        return o.age===Number.MAX_SAFE_INTEGER;
    });
    a.t(()=>{
        const o = Obs.var({age:Number.MIN_SAFE_INTEGER})
        return o.age===Number.MIN_SAFE_INTEGER;
    });
    // ネスト
    a.t(()=>{
        const o = Obs.var({
            name: Obs.var({first:'太郎', last:'山田'}),
        });
        return o.name instanceof Obs.ObservedObject
            && '太郎'===o.name.first
            && '山田'===o.name.last;
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

