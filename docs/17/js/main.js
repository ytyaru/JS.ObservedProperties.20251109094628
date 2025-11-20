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
    const o = Obs.var({some:{value:123}});
    o.some = 234;
    o.setup({some:345});

    const O = Obs.var({some:{value:123}},{msg:{value:'MSG'}});
    O.$.msg;

    const a = new Assertion();
    a.t('Obs' in window);

    a.t('isOdd' in Math);
    a.t('isEven' in Math);
    a.t('halfEven' in Math);
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
    a.t(0===Math.halfEven(0.5)); // 最近接偶数丸め（独自実装した。5の時は偶数になるほうへ丸める）
    a.t(2===Math.halfEven(1.5)); // 最近接偶数丸め（独自実装した。5の時は偶数になるほうへ丸める）

    // 負数の時はプラス方向に丸める仕様（四捨五入じゃない……）
//    a.t(-1===Math.round(-0.5)); // 四捨五入 こっちが望ましいのに、JSの仕様じゃマイナス値でもプラス方向に丸められるせいで 0 が返る…
//    a.t(-2===Math.round(-1.5)); // 四捨五入 こっちが望ましいのに、JSの仕様じゃマイナス値でもプラス方向に丸められるせいで 0 が返る…
    a.t( 0===Math.round(-0.5)); // 四捨五入 JSの仕様じゃ正しいが、四捨五入から見ると間違っている…
    a.t(-1===Math.round(-1.5)); // 四捨五入 JSの仕様じゃ正しいが、四捨五入から見ると間違っている…
//    a.t( 0===Math.halfEven(-0.5)); // 最近接偶数丸め
//    a.t(-2===Math.halfEven(-1.5)); // 最近接偶数丸め
    a.t( 0===Math.halfEven(-0.5)); // 最近接偶数丸め
    a.t(-2===Math.halfEven(-1.5)); // 最近接偶数丸め

    a.t('Quantity UnsafedFinite Finite Float RoundableFloat RounderFloat RoundFloat HalfEvenFloat FloorFloat TruncFloat CeilFloat Integer NumberDecimal'.split(' ').every(n=>Type.isCls(Obs.C[n])));
    a.t('quantity unsafedFinite finite float roundableFloat rounderFloat roundFloat halfEvenFloat floorFloat truncFloat ceilFloat integer numberDecimal'.split(' ').every(n=>'function'===typeof Obs.T[n]))
    a.t('quant unFin fin flt roundable rounder round halfEven floor trunc ceil int numDec'.split(' ').every(n=>'function'===typeof Obs.T[n]))
    a.t('q f i'.split(' ').every(n=>'function'===typeof Obs.T[n]))
    //a.t('8 16 32 53 64 128 256 512 1024 2048 4096 8192'.split(' ').every(n=>'function'===typeof Obs.T[`i${n}`]))
    a.t('8 16 32 53 64 128 256 512 1024 2048 4096 8192'.split(' ').every(b=>['','u'].every(p=>'function'===typeof Obs.T[`${p}i${b}`])));

    // 上記丸め間違いを正すために実装したのがNumberRounder。
    console.log(Obs.U.NumberRounder.round(0.5, 0));
    a.t(1===Obs.U.NumberRounder.round(0.5, 0));   //  0.5 を 小数点0桁で丸めて四捨五入すると  1
    a.t(2===Obs.U.NumberRounder.round(1.5, 0));   //  1.5 を 小数点0桁で丸めて四捨五入すると  2
    a.t(-1===Obs.U.NumberRounder.round(-0.5, 0)); // -0.5 を 小数点0桁で丸めて四捨五入すると -1
    a.t(-2===Obs.U.NumberRounder.round(-1.5, 0)); // -1.5 を 小数点0桁で丸めて四捨五入すると -2

    a.t( 0===Obs.U.NumberRounder.halfEven(0.5, 0));  //  0.5 を 小数点0桁で最近接偶数丸めすると  0
    a.t( 2===Obs.U.NumberRounder.halfEven(1.5, 0));  //  1.5 を 小数点0桁で最近接偶数丸めすると  2
    a.t( 0===Obs.U.NumberRounder.halfEven(-0.5, 0)); // -0.5 を 小数点0桁で最近接偶数丸めすると  0
    a.t(-2===Obs.U.NumberRounder.halfEven(-1.5, 0)); // -1.5 を 小数点0桁で最近接偶数丸めすると -2

    // 5 でないなら通常通り切り捨て／切り上げのいずれか
    a.t( 0===Obs.U.NumberRounder.round( 0.4, 0)); //  0.4 を 小数点0桁で丸めて四捨五入すると  0
    a.t( 1===Obs.U.NumberRounder.round( 1.4, 0)); //  1.4 を 小数点0桁で丸めて四捨五入すると  1
    a.t( 0===Obs.U.NumberRounder.round(-0.4, 0)); // -0.4 を 小数点0桁で丸めて四捨五入すると  0
    a.t(-1===Obs.U.NumberRounder.round(-1.4, 0)); // -1.4 を 小数点0桁で丸めて四捨五入すると -1

    a.t( 0===Obs.U.NumberRounder.halfEven( 0.4, 0)); //  0.4 を 小数点0桁で最近接偶数丸めすると  0
    a.t( 1===Obs.U.NumberRounder.halfEven( 1.4, 0)); //  1.4 を 小数点0桁で最近接偶数丸めすると  1
    a.t( 0===Obs.U.NumberRounder.halfEven(-0.4, 0)); // -0.4 を 小数点0桁で最近接偶数丸めすると  0
    a.t(-1===Obs.U.NumberRounder.halfEven(-1.4, 0)); // -1.4 を 小数点0桁で最近接偶数丸めすると -1

    a.t( 1===Obs.U.NumberRounder.round( 0.6, 0)); //  0.6 を 小数点0桁で丸めて四捨五入すると  1
    a.t( 2===Obs.U.NumberRounder.round( 1.6, 0)); //  1.6 を 小数点0桁で丸めて四捨五入すると  2
    a.t(-1===Obs.U.NumberRounder.round(-0.6, 0)); // -0.6 を 小数点0桁で丸めて四捨五入すると -1
    a.t(-2===Obs.U.NumberRounder.round(-1.6, 0)); // -1.6 を 小数点0桁で丸めて四捨五入すると -2

    a.t( 1===Obs.U.NumberRounder.halfEven( 0.6, 0)); //  0.6 を 小数点0桁で最近接偶数丸めすると  1
    a.t( 2===Obs.U.NumberRounder.halfEven( 1.6, 0)); //  1.6 を 小数点0桁で最近接偶数丸めすると  2
    a.t(-1===Obs.U.NumberRounder.halfEven(-0.6, 0)); // -0.6 を 小数点0桁で最近接偶数丸めすると -1
    a.t(-2===Obs.U.NumberRounder.halfEven(-1.6, 0)); // -1.6 を 小数点0桁で最近接偶数丸めすると -2

    console.log(Math.round(-0.5), Math.round(-1.5)); // 0, -1

    // NumberDecimal
//    Obs.T.nDec(2); // 桁数を設定する。初期値は0。
//    Obs.T.nDec(2,[123,45]); // 桁数を設定する。初期値は0。

    a.t(()=>{
        const q = Obs.T.q();
        console.log(q);
        console.log(q instanceof Obs.C.Quantity , 0===q.value , !q.naned , !q.infinited , !q.unsafed , !q.unsigned , undefined===q.min , undefined===q.max, q.min, q.max);
        return q instanceof Obs.C.Quantity && 0===q.value && !q.naned && !q.infinited && !q.unsafed && !q.unsigned && Number.MIN_SAFE_INTEGER===q.min && Number.MAX_SAFE_INTEGER===q.max;
    });
    a.t(()=>{
        const q = Obs.T.q(123);
        return q instanceof Obs.C.Quantity && 123===q.value && !q.naned && !q.infinited && !q.unsafed && !q.unsigned && Number.MIN_SAFE_INTEGER===q.min && Number.MAX_SAFE_INTEGER===q.max;
    });
    a.t(()=>{
        const q = Obs.T.q(123, true);
        return q instanceof Obs.C.Quantity && 123===q.value &&  q.naned && !q.infinited && !q.unsafed && !q.unsigned && Number.MIN_SAFE_INTEGER===q.min && Number.MAX_SAFE_INTEGER===q.max;
    });
    //a.e(TypeError, `論理矛盾です。infinited=trueなのにunsafed=falseです。infinitedとunsafedはそれ以外の組合せT/F,F/T,F/Fのいずれかにすべきです。`, ()=>Obs.T.q(123, true, true));
    a.t(()=>{
        const q = Obs.T.q(123, true, true);// 論理矛盾です。infinited=trueなのにunsafed=falseです。unsafed=trueに強制します。
        console.log(q.min, q.max);
        return q instanceof Obs.C.Quantity && 123===q.value &&  q.naned &&  q.infinited &&  q.unsafed && !q.unsigned && -Infinity===q.min && Infinity===q.max;
    });
    a.t(()=>{
        const q = Obs.T.q(123, true, false, true);
        console.log(q.min, q.max)
        return q instanceof Obs.C.Quantity && 123===q.value &&  q.naned && !q.infinited &&  q.unsafed && !q.unsigned && -Number.MAX_VALUE===q.min && Number.MAX_VALUE===q.max;
    });
    a.t(()=>{
        const q = Obs.T.q(123, true, true, true);
        return q instanceof Obs.C.Quantity && 123===q.value &&  q.naned &&  q.infinited &&  q.unsafed && !q.unsigned && -Infinity===q.min && Infinity===q.max;
    });
    a.t(()=>{
        const q = Obs.T.q(123, true, false, true, true);
        return q instanceof Obs.C.Quantity && 123===q.value &&  q.naned && !q.infinited &&  q.unsafed &&  q.unsigned && 0===q.min && Number.MAX_VALUE===q.max;
    });
    a.t(()=>{
        const q = Obs.T.q(123, true, true, true, true);
        return q instanceof Obs.C.Quantity && 123===q.value &&  q.naned &&  q.infinited &&  q.unsafed &&  q.unsigned && 0===q.min && Infinity===q.max;
    });
    a.e(RangeError, `valueがmin〜maxの範囲を超過しています。:value:1, min:2, max:8`, ()=>Obs.T.q(1, true, true, true, true, 2, 8));
    a.e(RangeError, `valueがmin〜maxの範囲を超過しています。:value:9, min:2, max:8`, ()=>Obs.T.q(9, true, true, true, true, 2, 8));
    a.t(()=>{
        const q = Obs.T.q(123, true, true, true, true, 123, 124);
        return q instanceof Obs.C.Quantity && 123===q.value &&  q.naned &&  q.infinited &&  q.unsafed &&  q.unsigned && 123===q.min && 124===q.max;
    });
    a.t(()=>{
        const q = Obs.T.q(123, true, true, true, true, 2);
        return q instanceof Obs.C.Quantity && 123===q.value &&  q.naned &&  q.infinited &&  q.unsafed &&  q.unsigned && 2===q.min && Infinity===q.max;
    });
    // min が取りうる論理値による各種上限値パターン
    a.e(RangeError, `valueがmin〜maxの範囲を超過しています。:value:123, min:0, max:8`, ()=>Obs.T.q(123, true, true, true, true, undefined, 8));
    /*
    a.t(()=>{
        const q = Obs.T.q(123, true, true, true, true, undefined, 8);
        return q instanceof Obs.C.Quantity && 123===q.value &&  q.naned &&  q.infinited &&  q.unsafed &&  q.unsigned && 0===q.min && 8===q.max;
    });
    */
    a.t(()=>{
        const q = Obs.T.q(123, true, true, true, true, 123, 124);
        return q instanceof Obs.C.Quantity && 123===q.value &&  q.naned &&  q.infinited &&  q.unsafed &&  q.unsigned && 123===q.min && 124===q.max;
    });
    a.t(()=>{
        const q = Obs.T.q(123, true, true, true, false, undefined, 124);
        return q instanceof Obs.C.Quantity && 123===q.value &&  q.naned &&  q.infinited &&  q.unsafed && !q.unsigned && -Infinity===q.min && 124===q.max;
    });
    a.e(TypeError, `論理矛盾です。infinited=trueなのにunsafed=falseです。infinitedとunsafedはそれ以外の組合せT/F,F/T,F/Fのいずれかにすべきです。`, ()=>Obs.T.q(123, true, true, false, false, undefined, 8));
    /*
    a.t(()=>{
        const q = Obs.T.q(123, true, true, false, false, undefined, 8);
        return q instanceof Obs.C.Quantity && 123===q.value &&  q.naned &&  q.infinited &&  q.unsafed && !q.unsigned && -Infinity===q.min && 8===q.max;
    });
    */
    a.t(()=>{
        const q = Obs.T.q(123, true, false, false, false, undefined, 124);
        return q instanceof Obs.C.Quantity && 123===q.value &&  q.naned && !q.infinited && !q.unsafed && !q.unsigned && Number.MIN_SAFE_INTEGER===q.min && 124===q.max;
    });
    a.t(()=>{//
        const q = Obs.T.q(123, true, false, true, false, undefined, 124);
        return q instanceof Obs.C.Quantity && 123===q.value &&  q.naned && !q.infinited &&  q.unsafed && !q.unsigned && -Number.MAX_VALUE===q.min && 124===q.max;
    });
    // max が取りうる論理値による各種上限値パターン
    a.t(()=>{
        const q = Obs.T.q(123, true, true, true, true, 2, undefined);
        return q instanceof Obs.C.Quantity && 123===q.value &&  q.naned &&  q.infinited &&  q.unsafed &&  q.unsigned && 2===q.min && Infinity===q.max;
    });
    a.t(()=>{
        const q = Obs.T.q(123, true, true, true, false, 2, undefined);
        return q instanceof Obs.C.Quantity && 123===q.value &&  q.naned &&  q.infinited &&  q.unsafed && !q.unsigned && 2===q.min && Infinity===q.max;
    });
    a.e(TypeError, `論理矛盾です。infinited=trueなのにunsafed=falseです。infinitedとunsafedはそれ以外の組合せT/F,F/T,F/Fのいずれかにすべきです。`, ()=>Obs.T.q(123, true, true, false, false, 2, undefined));
    /*
    a.t(()=>{
        const q = Obs.T.q(123, true, true, false, false, 2, undefined);
        return q instanceof Obs.C.Quantity && 123===q.value &&  q.naned &&  q.infinited &&  q.unsafed && !q.unsigned && 2===q.min && Infinity===q.max;
    });
    */
    a.t(()=>{
        const q = Obs.T.q(123, true, false, false, false, 2, undefined);
        return q instanceof Obs.C.Quantity && 123===q.value &&  q.naned && !q.infinited && !q.unsafed && !q.unsigned && 2===q.min && Number.MAX_SAFE_INTEGER===q.max;
    });
    a.t(()=>{//
        const q = Obs.T.q(123, true, false, true, false, 2, undefined);
        return q instanceof Obs.C.Quantity && 123===q.value &&  q.naned && !q.infinited &&  q.unsafed && !q.unsigned && 2===q.min && Number.MAX_VALUE===q.max;
    });
    // 論理矛盾時エラーが出ること
    a.e(RangeError, `minとmaxが不正です。両者は異なる値にしつつ大小関係を名前と一致させてください。:8,2`, ()=>Obs.T.q(123, true, true, true, true, 8, 2));
    a.e(RangeError, `maxはunsigned,bitで設定した範囲より大きいです。範囲内に指定してください。:expected:9007199254740991, actual:9007199254740992`, ()=>Obs.T.q({max:Number.MAX_SAFE_INTEGER+1}));
    a.e(RangeError, `minはunsigned,bitで設定した範囲より小さいです。範囲内に指定してください。:expected:-9007199254740991, actual:-9007199254740992`, ()=>Obs.T.q({min:Number.MIN_SAFE_INTEGER-1}));
    a.e(RangeError, `minはunsigned,bitで設定した範囲より小さいです。範囲内に指定してください。:expected:0, actual:-1`, ()=>Obs.T.q({unsigned:true, min:-1}));
    // 本当はエラーに成って欲しいが出ない。JSの仕様上仕方ない。
//    a.e(RangeError, `maxはunsigned,bitで設定した範囲より大きいです。範囲内に指定してください。:expected:9007199254740991, actual:9007199254740992`, ()=>Obs.T.q({unsafed:true, max:Number.MAX_VALUE+1}));
//    a.e(RangeError, `maxはunsigned,bitで設定した範囲より大きいです。範囲内に指定してください。:expected:9007199254740991, actual:9007199254740992`, ()=>Obs.T.q({unsafed:true, min:-Number.MAX_VALUE-1}));

    //a.e(RangeError, `maxはunsigned,bitで設定した範囲より大きいです。範囲内に指定してください。:expected:9007199254740991, actual:9007199254740992`, ()=>Obs.T.q({unsafed:true, max:Infinity}));
    a.e(TypeError, `infinited=falseなのにvalue=Infinityです。`, ()=>Obs.T.q({unsafed:true, max:Infinity}));
    a.e(TypeError, `infinited=falseなのにvalue=-Infinityです。`, ()=>Obs.T.q({unsafed:true, min:-Infinity}));
    a.e(TypeError, `infinited=falseなのにvalue=Infinityです。`, ()=>Obs.T.q({unsafed:true, value:Infinity}));
    a.e(TypeError, `infinited=falseなのにvalue=-Infinityです。`, ()=>Obs.T.q({unsafed:true, value:-Infinity}));
    //a.e(TypeError, `論理矛盾です。infinited=trueなのにunsafed=falseです。infinitedとunsafedはそれ以外の組合せT/F,F/T,F/Fのいずれかにすべきです。`, ()=>Obs.T.q(123, true, true, false, false, 2, undefined));
//    a.e(RangeError, `maxはunsigned,bitで設定した範囲より大きいです。範囲内に指定してください。:expected:9007199254740991, actual:Infinity`, ()=>Obs.T.q({infinited:true, max:Infinity}));
//    a.e(RangeError, `minはunsigned,bitで設定した範囲より小さいです。範囲内に指定してください。:expected:-9007199254740991, actual:-Infinity`, ()=>Obs.T.q({infinited:true, min:-Infinity}));
//    a.e(RangeError, `valueはunsigned,bitで設定した範囲より大きいです。範囲内に指定してください。:expected:9007199254740991, actual:Infinity`, ()=>Obs.T.q({infinited:true, value:Infinity}));
//    a.e(RangeError, `valueはunsigned,bitで設定した範囲より小さいです。範囲内に指定してください。:expected:-9007199254740991, actual:-Infinity`, ()=>Obs.T.q({infinited:true, value:-Infinity}));

//    a.e(RangeError, `maxはunsigned,bitで設定した範囲より大きいです。範囲内に指定してください。:expected:9007199254740991, actual:Infinity`, ()=>Obs.T.q({infinited:true, max:Infinity+1}));
//    a.e(RangeError, `minはunsigned,bitで設定した範囲より小さいです。範囲内に指定してください。:expected:-9007199254740991, actual:-Infinity`, ()=>Obs.T.q({infinited:true, min:-Infinity-1}));
//    a.e(RangeError, `valueはunsigned,bitで設定した範囲より大きいです。範囲内に指定してください。:expected:9007199254740991, actual:Infinity`, ()=>Obs.T.q({infinited:true, value:Infinity+1}));
//    a.e(RangeError, `valueはunsigned,bitで設定した範囲より小さいです。範囲内に指定してください。:expected:-9007199254740991, actual:-Infinity`, ()=>Obs.T.q({infinited:true, value:-Infinity-1}));

    /*
    a.t(()=>{
        // Infinity は 範囲 Number.MAX_SAFE_INTEGER を超過しているため論理エラーにすべき
        const q = Obj.var({infinited:true, value:Infinity});
        return q instanceof Obs.C.Quantity && Infinity===q.value && !q.naned && !q.infinited && !q.unsafed && !q.unsigned && Number.MIN_SAFE_INTEGER===q.min && Number.MAX_SAFE_INTEGER===q.max;
    });
    */

    a.e(TypeError, `非安全な整数値は許可されておらず代入できません。unsafed=trueにしてください。`, ()=>Obs.T.q({unsafed:false, value:Number.MAX_SAFE_INTEGER+1}));
//    a.e(TypeError, `非安全な整数値は許可されておらず代入できません。unsafed=trueにしてください。`, ()=>Obs.T.q({infinited:true, value:Number.MAX_SAFE_INTEGER+1}));
    a.e(TypeError, `非安全な整数値は許可されておらず代入できません。unsafed=trueにしてください。`, ()=>Obs.T.q({unsafed:false, value:Number.MIN_SAFE_INTEGER-1}));
//    a.e(TypeError, `非安全な整数値は許可されておらず代入できません。unsafed=trueにしてください。`, ()=>Obs.T.q({infinited:true, value:Number.MIN_SAFE_INTEGER-1}));
    a.t(()=>{
        const q = Obs.T.q({infinited:true, value:Number.MAX_SAFE_INTEGER+1});
        return q instanceof Obs.C.Quantity && Number.MAX_SAFE_INTEGER+1===q.value && !q.naned &&  q.infinited &&  q.unsafed && !q.unsigned && -Infinity===q.min && Infinity===q.max;
    });
    a.t(()=>{
        const q = Obs.T.q({infinited:true, value:Number.MIN_SAFE_INTEGER-1});
        return q instanceof Obs.C.Quantity && Number.MIN_SAFE_INTEGER-1===q.value && !q.naned &&  q.infinited &&  q.unsafed && !q.unsigned && -Infinity===q.min && Infinity===q.max;
    });
    a.e(TypeError, `論理矛盾です。infinited=trueなのにunsafed=falseです。infinitedとunsafedはそれ以外の組合せT/F,F/T,F/Fのいずれかにすべきです。`, ()=>Obs.T.q({infinited:true, unsafed:false, value:Number.MAX_SAFE_INTEGER+1}));
    a.e(TypeError, `論理矛盾です。infinited=trueなのにunsafed=falseです。infinitedとunsafedはそれ以外の組合せT/F,F/T,F/Fのいずれかにすべきです。`, ()=>Obs.T.q({infinited:true, unsafed:false, value:Number.MAX_SAFE_INTEGER+1}));
    a.e(TypeError, `論理矛盾です。infinited=trueなのにunsafed=falseです。infinitedとunsafedはそれ以外の組合せT/F,F/T,F/Fのいずれかにすべきです。`, ()=>Obs.T.q({infinited:true, unsafed:false, value:Number.MIN_SAFE_INTEGER-1}));
    a.e(TypeError, `論理矛盾です。infinited=trueなのにunsafed=falseです。infinitedとunsafedはそれ以外の組合せT/F,F/T,F/Fのいずれかにすべきです。`, ()=>Obs.T.q({infinited:true, unsafed:false, value:Number.MIN_SAFE_INTEGER-1}));

    a.e(TypeError, `naned=falseなのにvalue=NaNです。`, ()=>Obs.T.q(NaN));
    a.t(()=>{
        const q = Obs.T.q(NaN, true);
        return q instanceof Obs.C.Quantity && Number.isNaN(q.value) &&  q.naned && !q.infinited && !q.unsafed && !q.unsigned && Number.MIN_SAFE_INTEGER===q.min && Number.MAX_SAFE_INTEGER===q.max;
    });
/*
    a.t(()=>{
        const q = Obs.T.q({infinited:true, unsafed:false, value:Number.MAX_SAFE_INTEGER+1});
        return q instanceof Obs.C.Quantity && 0===q.value && !q.naned && !q.infinited && !q.unsafed && !q.unsigned && Number.MIN_SAFE_INTEGER===q.min && Number.MAX_SAFE_INTEGER===q.max;
    });
*/
    // AllFinite
    a.t(()=>{
        const f = Obs.T.aFin();
        return f instanceof Obs.C.AllFinite && 0===f.value && !f.naned && !f.infinited && !f.unsafed && !f.unsigned && Number.MIN_SAFE_INTEGER===f.min && Number.MAX_SAFE_INTEGER===f.max;
    });
    a.t(()=>{
        const f = Obs.T.aFin(123);
        return f instanceof Obs.C.AllFinite && 123===f.value && !f.naned && !f.infinited && !f.unsafed && !f.unsigned && Number.MIN_SAFE_INTEGER===f.min && Number.MAX_SAFE_INTEGER===f.max;
    });
    a.t(()=>{
        const f = Obs.T.aFin(123, {value:234});
        console.log(f.value)
        return f instanceof Obs.C.AllFinite && 234===f.value && !f.naned && !f.infinited && !f.unsafed && !f.unsigned && Number.MIN_SAFE_INTEGER===f.min && Number.MAX_SAFE_INTEGER===f.max;
    });
    a.t(()=>{
        const f = Obs.T.aFin({value:234});
        console.log(f instanceof Obs.C.AllFinite, 234===f.value, !f.naned, !f.infinited, !f.unsafed, !f.unsigned, Number.MIN_SAFE_INTEGER===f.min, Number.MAX_SAFE_INTEGER===f.max);
        console.log(f.value);
        return f instanceof Obs.C.AllFinite && 234===f.value && !f.naned && !f.infinited && !f.unsafed && !f.unsigned && Number.MIN_SAFE_INTEGER===f.min && Number.MAX_SAFE_INTEGER===f.max;
    });
    a.e(TypeError, `naned=falseなのにvalue=NaNです。`, ()=>Obs.T.aFin(NaN, true)); // trueはunsigned
    a.e(TypeError, `nanedはtrueにできません。Quantity型で再試行してください。`, ()=>Obs.T.aFin(NaN, {naned:true}));
    a.e(TypeError, `infinitedはtrueにできません。Quantity型で再試行してください。`, ()=>Obs.T.aFin(Infinity, {infinited:true}));
//    a.e(TypeError, `naned=falseなのにvalue=NaNです。`, ()=>Obs.T.aFin(NaN, {naned:true}));
    a.t(()=>{
        const f = Obs.T.aFin(-123, {unsafed:true});
        return f instanceof Obs.C.AllFinite && -123===f.value && !f.naned && !f.infinited &&  f.unsafed && !f.unsigned && -Number.MAX_VALUE===f.min && Number.MAX_VALUE===f.max;
    });
    a.t(()=>{
        const f = Obs.T.aFin(123, {unsigned:true});
        return f instanceof Obs.C.AllFinite && 123===f.value && !f.naned && !f.infinited && !f.unsafed &&  f.unsigned && 0===f.min && Number.MAX_SAFE_INTEGER===f.max;
    });
    //a.e(RangeError, `valueはunsigned,bitで設定した範囲より小さいです。範囲内に指定してください。:expected:0, actual:-1`, ()=>Obs.T.aFin(-1, {unsigned:true}));
    a.e(RangeError, `valueがmin〜maxの範囲を超過しています。:value:-1, min:0, max:9007199254740991`, ()=>Obs.T.aFin(-1, {unsigned:true}));
    
    // UnsafedFinite
    a.t(()=>{
        const f = Obs.T.unFin();
        return f instanceof Obs.C.UnsafedFinite && 0===f.value && !f.naned && !f.infinited &&  f.unsafed && !f.unsigned && -Number.MAX_VALUE===f.min && Number.MAX_VALUE===f.max;
    });
    a.t(()=>{
        const f = Obs.T.unFin(123);
        return f instanceof Obs.C.UnsafedFinite && 123===f.value && !f.naned && !f.infinited &&  f.unsafed && !f.unsigned && -Number.MAX_VALUE===f.min && Number.MAX_VALUE===f.max;
    });
    a.t(()=>{
        const f = Obs.T.unFin(123, {value:234});
        return f instanceof Obs.C.UnsafedFinite && 234===f.value && !f.naned && !f.infinited &&  f.unsafed && !f.unsigned && -Number.MAX_VALUE===f.min && Number.MAX_VALUE===f.max;
    });
    a.t(()=>{
        const f = Obs.T.unFin({value:234});
        return f instanceof Obs.C.UnsafedFinite && 234===f.value && !f.naned && !f.infinited &&  f.unsafed && !f.unsigned && -Number.MAX_VALUE===f.min && Number.MAX_VALUE===f.max;
    });
    a.e(TypeError, `naned=falseなのにvalue=NaNです。`, ()=>Obs.T.unFin(NaN, true)); // trueはunsigned
    a.e(TypeError, `nanedはtrueにできません。Quantity型で再試行してください。`, ()=>Obs.T.unFin(NaN, {naned:true}));
    a.e(TypeError, `infinitedはtrueにできません。Quantity型で再試行してください。`, ()=>Obs.T.unFin(Infinity, {infinited:true}));
//    a.e(TypeError, `naned=falseなのにvalue=NaNです。`, ()=>Obs.T.unFin(NaN, {naned:true}));
    a.t(()=>{
        const f = Obs.T.unFin(-123, {unsafed:true});
        return f instanceof Obs.C.UnsafedFinite && -123===f.value && !f.naned && !f.infinited &&  f.unsafed && !f.unsigned && -Number.MAX_VALUE===f.min && Number.MAX_VALUE===f.max;
    });
    a.t(()=>{
        const f = Obs.T.unFin(123, {unsigned:true});
        return f instanceof Obs.C.UnsafedFinite && 123===f.value && !f.naned && !f.infinited &&  f.unsafed &&  f.unsigned && 0===f.min && Number.MAX_VALUE===f.max;
    });
    a.e(RangeError, `valueがmin〜maxの範囲を超過しています。:value:-1, min:0, max:1.7976931348623157e+308`, ()=>Obs.T.unFin(-1, {unsigned:true}));

    // options引数
    a.t(()=>{
        const q = Obs.T.q({});
        return q instanceof Obs.C.Quantity && 0===q.value && !q.naned && !q.infinited && !q.unsafed && !q.unsigned && Number.MIN_SAFE_INTEGER===q.min && Number.MAX_SAFE_INTEGER===q.max;
    });
    a.t(()=>{
        const q = Obs.T.q({value:123});
        return q instanceof Obs.C.Quantity && 123===q.value && !q.naned && !q.infinited && !q.unsafed && !q.unsigned && Number.MIN_SAFE_INTEGER===q.min && Number.MAX_SAFE_INTEGER===q.max;
    });
    a.t(()=>{
        const q = Obs.T.q({naned:true});
        return q instanceof Obs.C.Quantity && 0===q.value &&  q.naned && !q.infinited && !q.unsafed && !q.unsigned && Number.MIN_SAFE_INTEGER===q.min && Number.MAX_SAFE_INTEGER===q.max;
    });
    a.t(()=>{
        const q = Obs.T.q({infinited:true});// infinited=trueでunsafed=undefinedのためunsafed=trueに強制します。
        return q instanceof Obs.C.Quantity && 0===q.value && !q.naned &&  q.infinited &&  q.unsafed && !q.unsigned && -Infinity===q.min && Infinity===q.max;
    });
    a.t(()=>{
        const q = Obs.T.q({unsafed:true});
        return q instanceof Obs.C.Quantity && 0===q.value && !q.naned && !q.infinited &&  q.unsafed && !q.unsigned && -Number.MAX_VALUE===q.min && Number.MAX_VALUE===q.max;
    });
    a.t(()=>{
        const q = Obs.T.q({unsigned:true});
        return q instanceof Obs.C.Quantity && 0===q.value && !q.naned && !q.infinited && !q.unsafed &&  q.unsigned && 0===q.min && Number.MAX_SAFE_INTEGER===q.max;
    });
    a.e(RangeError, `valueがmin〜maxの範囲を超過しています。:value:0, min:123, max:9007199254740991`, ()=>Obs.T.q({min:123}));
    a.e(RangeError, `valueがmin〜maxの範囲を超過しています。:value:0, min:-9007199254740991, max:-1`, ()=>Obs.T.q({max:-1}));
    a.t(()=>{
        const q = Obs.T.q(123, {min:123});
        return q instanceof Obs.C.Quantity && 123===q.value && !q.naned && !q.infinited && !q.unsafed && !q.unsigned && 123===q.min && Number.MAX_SAFE_INTEGER===q.max;
    });
    a.t(()=>{
        const q = Obs.T.q({max:123});
        return q instanceof Obs.C.Quantity && 0===q.value && !q.naned && !q.infinited && !q.unsafed && !q.unsigned && Number.MIN_SAFE_INTEGER===q.min && 123===q.max;
    });
    // (value,options)引数
    a.t(()=>{
        const q = Obs.T.q(123, {});
        return q instanceof Obs.C.Quantity && 123===q.value && !q.naned && !q.infinited && !q.unsafed && !q.unsigned && Number.MIN_SAFE_INTEGER===q.min && Number.MAX_SAFE_INTEGER===q.max;
    });
    a.t(()=>{
        const q = Obs.T.q(123, {naned:true});
        return q instanceof Obs.C.Quantity && 123===q.value &&  q.naned && !q.infinited && !q.unsafed && !q.unsigned && Number.MIN_SAFE_INTEGER===q.min && Number.MAX_SAFE_INTEGER===q.max;
    });
    a.t(()=>{
        const q = Obs.T.q(123, {infinited:true});
        console.log(q.value, q.infinited, q.unsafed)
        return q instanceof Obs.C.Quantity && 123===q.value && !q.naned &&  q.infinited &&  q.unsafed && !q.unsigned && -Infinity===q.min && Infinity===q.max;
    });
    a.t(()=>{
        const q = Obs.T.q(123, {unsafed:true});
        return q instanceof Obs.C.Quantity && 123===q.value && !q.naned && !q.infinited &&  q.unsafed && !q.unsigned && -Number.MAX_VALUE===q.min && Number.MAX_VALUE===q.max;
    });
    a.t(()=>{
        const q = Obs.T.q(123, {unsigned:true});
        return q instanceof Obs.C.Quantity && 123===q.value && !q.naned && !q.infinited && !q.unsafed &&  q.unsigned && 0===q.min && Number.MAX_SAFE_INTEGER===q.max;
    });
    a.t(()=>{
        const q = Obs.T.q(123, {min:2});
        return q instanceof Obs.C.Quantity && 123===q.value && !q.naned && !q.infinited && !q.unsafed && !q.unsigned && 2===q.min && Number.MAX_SAFE_INTEGER===q.max;
    });
    a.e(RangeError, `minはunsigned,bitで設定した範囲より小さいです。範囲内に指定してください。:expected:0, actual:-1`, ()=>Obs.T.q(123, {unsigned:true, min:-1}));

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
        const dec = Obs.T.nDec(2,[123,45]); // 桁数を設定する。初期値は0。
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

