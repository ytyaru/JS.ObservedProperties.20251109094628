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

    //a.t('Quantity UnsafedFinite Finite Float RoundableFloat RounderFloat RoundFloat HalfEvenFloat FloorFloat TruncFloat CeilFloat Integer NumberDecimal'.split(' ').every(n=>Type.isCls(Obs.C[n])));
    a.t('Quantity UnsafedFinite Finite Float UnsignedFloat RoundableFloat RounderFloat RoundFloat HalfEvenFloat FloorFloat TruncFloat CeilFloat Integer UnsignedInteger'.split(' ').every(n=>Type.isCls(Obs.C[n])));
    a.t('quantity unsafedFinite finite float unsignedFloat roundableFloat rounderFloat roundFloat halfEvenFloat floorFloat truncFloat ceilFloat integer unsignedInteger'.split(' ').every(n=>'function'===typeof Obs.T[n]))
    a.t('quant unFin fin flt ufloat roundable rounder round halfEven floor trunc ceil int uint'.split(' ').every(n=>'function'===typeof Obs.T[n]))
    a.t('q f i'.split(' ').every(n=>'function'===typeof Obs.T[n]))
    //a.t('8 16 32 53 64 128 256 512 1024 2048 4096 8192'.split(' ').every(n=>'function'===typeof Obs.T[`i${n}`]))
    a.t('8 16 32 53 64 128 256 512 1024 2048 4096 8192'.split(' ').every(b=>['i','u'].every(p=>'function'===typeof Obs.T[`${p}${b}`])));

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
    a.t(()=>{
        const q = Obs.T.q(123, true, true, true, true, 123, 124);
        return q instanceof Obs.C.Quantity && 123===q.value &&  q.naned &&  q.infinited &&  q.unsafed &&  q.unsigned && 123===q.min && 124===q.max;
    });
    a.t(()=>{
        const q = Obs.T.q(123, true, true, true, false, undefined, 124);
        return q instanceof Obs.C.Quantity && 123===q.value &&  q.naned &&  q.infinited &&  q.unsafed && !q.unsigned && -Infinity===q.min && 124===q.max;
    });
    a.e(TypeError, `論理矛盾です。infinited=trueなのにunsafed=falseです。infinitedとunsafedはそれ以外の組合せT/F,F/T,F/Fのいずれかにすべきです。`, ()=>Obs.T.q(123, true, true, false, false, undefined, 8));
    a.t(()=>{
        const q = Obs.T.q(123, true, false, false, false, undefined, 124);
        return q instanceof Obs.C.Quantity && 123===q.value &&  q.naned && !q.infinited && !q.unsafed && !q.unsigned && Number.MIN_SAFE_INTEGER===q.min && 124===q.max;
    });
    a.t(()=>{
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
    // 本当はエラーに成って欲しいが出ない。JSの仕様(IEEE754)上仕方ない。
//    a.e(RangeError, `maxはunsigned,bitで設定した範囲より大きいです。範囲内に指定してください。:expected:9007199254740991, actual:9007199254740992`, ()=>Obs.T.q({unsafed:true, max:Number.MAX_VALUE+1}));
//    a.e(RangeError, `maxはunsigned,bitで設定した範囲より大きいです。範囲内に指定してください。:expected:9007199254740991, actual:9007199254740992`, ()=>Obs.T.q({unsafed:true, min:-Number.MAX_VALUE-1}));

    a.e(TypeError, `infinited=falseなのにvalue=Infinityです。`, ()=>Obs.T.q({unsafed:true, max:Infinity}));
    a.e(TypeError, `infinited=falseなのにvalue=-Infinityです。`, ()=>Obs.T.q({unsafed:true, min:-Infinity}));
    a.e(TypeError, `infinited=falseなのにvalue=Infinityです。`, ()=>Obs.T.q({unsafed:true, value:Infinity}));
    a.e(TypeError, `infinited=falseなのにvalue=-Infinityです。`, ()=>Obs.T.q({unsafed:true, value:-Infinity}));
    a.e(TypeError, `論理矛盾です。infinited=trueなのにunsafed=falseです。infinitedとunsafedはそれ以外の組合せT/F,F/T,F/Fのいずれかにすべきです。`, ()=>Obs.T.q(123, true, true, false, false, 2, undefined));
    a.t(()=>{
        const q = Obs.T.q({infinited:true, max:Infinity});
        return q instanceof Obs.C.Quantity && 0===q.value && !q.naned &&  q.infinited &&  q.unsafed && !q.unsigned && -Infinity===q.min && Infinity===q.max;
    });
    a.t(()=>{
        const q = Obs.T.q({infinited:true, min:-Infinity});
        return q instanceof Obs.C.Quantity && 0===q.value && !q.naned &&  q.infinited &&  q.unsafed && !q.unsigned && -Infinity===q.min && Infinity===q.max;
    });
    a.t(()=>{
        const q = Obs.T.q({infinited:true, value:Infinity});
        return q instanceof Obs.C.Quantity && Infinity===q.value && !q.naned &&  q.infinited &&  q.unsafed && !q.unsigned && -Infinity===q.min && Infinity===q.max;
    });
    a.t(()=>{
        const q = Obs.T.q({infinited:true, value:-Infinity});
        return q instanceof Obs.C.Quantity && -Infinity===q.value && !q.naned &&  q.infinited &&  q.unsafed && !q.unsigned && -Infinity===q.min && Infinity===q.max;
    });

    // 本当はエラーに成って欲しいが出ない。JSの仕様(IEEE754)上仕方ない。
//    a.e(RangeError, `maxはunsigned,bitで設定した範囲より大きいです。範囲内に指定してください。:expected:9007199254740991, actual:Infinity`, ()=>Obs.T.q({infinited:true, max:Infinity+1}));
//    a.e(RangeError, `minはunsigned,bitで設定した範囲より小さいです。範囲内に指定してください。:expected:-9007199254740991, actual:-Infinity`, ()=>Obs.T.q({infinited:true, min:-Infinity-1}));
//    a.e(RangeError, `valueはunsigned,bitで設定した範囲より大きいです。範囲内に指定してください。:expected:9007199254740991, actual:Infinity`, ()=>Obs.T.q({infinited:true, value:Infinity+1}));
//    a.e(RangeError, `valueはunsigned,bitで設定した範囲より小さいです。範囲内に指定してください。:expected:-9007199254740991, actual:-Infinity`, ()=>Obs.T.q({infinited:true, value:-Infinity-1}));

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
    a.t(()=>{
        const f = Obs.T.aFin(-123, {unsafed:true});
        return f instanceof Obs.C.AllFinite && -123===f.value && !f.naned && !f.infinited &&  f.unsafed && !f.unsigned && -Number.MAX_VALUE===f.min && Number.MAX_VALUE===f.max;
    });
    a.t(()=>{
        const f = Obs.T.aFin(123, {unsigned:true});
        return f instanceof Obs.C.AllFinite && 123===f.value && !f.naned && !f.infinited && !f.unsafed &&  f.unsigned && 0===f.min && Number.MAX_SAFE_INTEGER===f.max;
    });
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
    a.t(()=>{
        const f = Obs.T.unFin(-123, {unsafed:true});
        return f instanceof Obs.C.UnsafedFinite && -123===f.value && !f.naned && !f.infinited &&  f.unsafed && !f.unsigned && -Number.MAX_VALUE===f.min && Number.MAX_VALUE===f.max;
    });
    a.t(()=>{
        const f = Obs.T.unFin(123, {unsigned:true});
        return f instanceof Obs.C.UnsafedFinite && 123===f.value && !f.naned && !f.infinited &&  f.unsafed &&  f.unsigned && 0===f.min && Number.MAX_VALUE===f.max;
    });
    a.e(RangeError, `valueがmin〜maxの範囲を超過しています。:value:-1, min:0, max:1.7976931348623157e+308`, ()=>Obs.T.unFin(-1, {unsigned:true}));
    
    // Finite
    a.t(()=>{
        const f = Obs.T.fin();
        return f instanceof Obs.C.Finite && 0===f.value && !f.naned && !f.infinited && !f.unsafed && !f.unsigned && Number.MIN_SAFE_INTEGER===f.min && Number.MAX_SAFE_INTEGER===f.max;
    });
    a.t(()=>{
        const f = Obs.T.fin(123);
        return f instanceof Obs.C.Finite && 123===f.value && !f.naned && !f.infinited && !f.unsafed && !f.unsigned && Number.MIN_SAFE_INTEGER===f.min && Number.MAX_SAFE_INTEGER===f.max;
    });
    a.t(()=>{
        const f = Obs.T.fin(123, {value:234});
        return f instanceof Obs.C.Finite && 234===f.value && !f.naned && !f.infinited && !f.unsafed && !f.unsigned && Number.MIN_SAFE_INTEGER===f.min && Number.MAX_SAFE_INTEGER===f.max;
    });
    a.t(()=>{
        const f = Obs.T.fin({value:234});
        return f instanceof Obs.C.Finite && 234===f.value && !f.naned && !f.infinited && !f.unsafed && !f.unsigned && Number.MIN_SAFE_INTEGER===f.min && Number.MAX_SAFE_INTEGER===f.max;
    });
    a.e(TypeError, `naned=falseなのにvalue=NaNです。`, ()=>Obs.T.fin(NaN, true)); // trueはunsigned
    a.e(TypeError, `nanedはtrueにできません。Quantity型で再試行してください。`, ()=>Obs.T.fin(NaN, {naned:true}));
    a.e(TypeError, `infinitedはtrueにできません。Quantity型で再試行してください。`, ()=>Obs.T.fin(Infinity, {infinited:true}));
    a.e(TypeError, `unsafedはtrueにできません。Quantity/AllFinite/UnsafedFinite型で再試行してください。`, ()=>Obs.T.fin(-123, {unsafed:true}));
    a.t(()=>{
        const f = Obs.T.fin(123, {unsigned:true});
        return f instanceof Obs.C.Finite && 123===f.value && !f.naned && !f.infinited && !f.unsafed &&  f.unsigned && 0===f.min && Number.MAX_SAFE_INTEGER===f.max;
    });
    a.e(RangeError, `valueがmin〜maxの範囲を超過しています。:value:-1, min:0, max:9007199254740991`, ()=>Obs.T.fin(-1, {unsigned:true}));
    a.e(TypeError, `非安全な整数値は許可されておらず代入できません。unsafed=trueにしてください。`, ()=>Obs.T.fin(Number.MIN_SAFE_INTEGER-1));
    a.e(TypeError, `非安全な整数値は許可されておらず代入できません。unsafed=trueにしてください。`, ()=>Obs.T.fin(Number.MAX_SAFE_INTEGER+1));

    // AllFloat
    a.t(()=>{
        const f = Obs.T.allFloat();
        return f instanceof Obs.C.AllFloat && 0===f.value && !f.naned && !f.infinited && !f.unsafed && !f.unsigned && Number.MIN_SAFE_INTEGER===f.min && Number.MAX_SAFE_INTEGER===f.max;
    });
    a.t(()=>{
        const f = Obs.T.allFloat(123);
        return f instanceof Obs.C.AllFloat && 123===f.value && !f.naned && !f.infinited && !f.unsafed && !f.unsigned && Number.MIN_SAFE_INTEGER===f.min && Number.MAX_SAFE_INTEGER===f.max;
    });
    a.t(()=>{
        const f = Obs.T.allFloat(123, {value:234});
        return f instanceof Obs.C.AllFloat && 234===f.value && !f.naned && !f.infinited && !f.unsafed && !f.unsigned && Number.MIN_SAFE_INTEGER===f.min && Number.MAX_SAFE_INTEGER===f.max;
    });
    a.t(()=>{
        const f = Obs.T.allFloat({value:234});
        return f instanceof Obs.C.AllFloat && 234===f.value && !f.naned && !f.infinited && !f.unsafed && !f.unsigned && Number.MIN_SAFE_INTEGER===f.min && Number.MAX_SAFE_INTEGER===f.max;
    });
    a.t(()=>{
        const f = Obs.T.allFloat(123, false, 2, 200);
        return f instanceof Obs.C.AllFloat && 123===f.value && !f.naned && !f.infinited && !f.unsafed && !f.unsigned && 2===f.min && 200===f.max;
    });
    a.t(()=>{
        const f = Obs.T.allFloat(123, true, 2, 200);
        return f instanceof Obs.C.AllFloat && 123===f.value && !f.naned && !f.infinited && !f.unsafed &&  f.unsigned && 2===f.min && 200===f.max;
    });
    a.e(TypeError, `naned=falseなのにvalue=NaNです。`, ()=>Obs.T.allFloat(NaN, true)); // trueはunsigned
    a.e(TypeError, `nanedはtrueにできません。Quantity型で再試行してください。`, ()=>Obs.T.allFloat(NaN, {naned:true}));
    a.e(TypeError, `infinitedはtrueにできません。Quantity型で再試行してください。`, ()=>Obs.T.allFloat(Infinity, {infinited:true}));
    a.e(TypeError, `unsafedはtrueにできません。Quantity/AllFinite/UnsafedFinite型で再試行してください。`, ()=>Obs.T.allFloat(-123, {unsafed:true}));
    a.e(RangeError, `valueがmin〜maxの範囲を超過しています。:value:-1, min:0, max:9007199254740991`, ()=>Obs.T.allFloat(-1, {unsigned:true}));
    a.t(()=>{
        const f = Obs.T.allFloat(0, {unsigned:true});
        return f instanceof Obs.C.AllFloat && 0===f.value && !f.naned && !f.infinited && !f.unsafed &&  f.unsigned && 0===f.min && Number.MAX_SAFE_INTEGER===f.max;
    });
    a.e(TypeError, `非安全な整数値は許可されておらず代入できません。unsafed=trueにしてください。`, ()=>Obs.T.allFloat(Number.MIN_SAFE_INTEGER-1));
    a.e(TypeError, `非安全な整数値は許可されておらず代入できません。unsafed=trueにしてください。`, ()=>Obs.T.allFloat(Number.MAX_SAFE_INTEGER+1));
    
    // Float
    a.t(()=>{
        const f = Obs.T.float();
        return f instanceof Obs.C.Float && 0===f.value && !f.naned && !f.infinited && !f.unsafed && !f.unsigned && Number.MIN_SAFE_INTEGER===f.min && Number.MAX_SAFE_INTEGER===f.max;
    });
    a.t(()=>{
        const f = Obs.T.float(123);
        return f instanceof Obs.C.Float && 123===f.value && !f.naned && !f.infinited && !f.unsafed && !f.unsigned && Number.MIN_SAFE_INTEGER===f.min && Number.MAX_SAFE_INTEGER===f.max;
    });
    a.t(()=>{
        const f = Obs.T.float(123, {value:234});
        return f instanceof Obs.C.Float && 234===f.value && !f.naned && !f.infinited && !f.unsafed && !f.unsigned && Number.MIN_SAFE_INTEGER===f.min && Number.MAX_SAFE_INTEGER===f.max;
    });
    a.t(()=>{
        const f = Obs.T.float({value:234});
        return f instanceof Obs.C.Float && 234===f.value && !f.naned && !f.infinited && !f.unsafed && !f.unsigned && Number.MIN_SAFE_INTEGER===f.min && Number.MAX_SAFE_INTEGER===f.max;
    });
    a.t(()=>{
        const f = Obs.T.float(123, 2, 200);
        return f instanceof Obs.C.Float && 123===f.value && !f.naned && !f.infinited && !f.unsafed && !f.unsigned && 2===f.min && 200===f.max;
    });
    a.e(TypeError, `naned=falseなのにvalue=NaNです。`, ()=>Obs.T.float(NaN, true)); // trueはunsigned
    a.e(TypeError, `nanedはtrueにできません。Quantity型で再試行してください。`, ()=>Obs.T.float(NaN, {naned:true}));
    a.e(TypeError, `infinitedはtrueにできません。Quantity型で再試行してください。`, ()=>Obs.T.float(Infinity, {infinited:true}));
    a.e(TypeError, `unsafedはtrueにできません。Quantity/AllFinite/UnsafedFinite型で再試行してください。`, ()=>Obs.T.float(-123, {unsafed:true}));
    a.e(TypeError, `unsignedはtrueにできません。Quantity/AllFinite/Finite/UnsafedFinite/AllFloat/UnsignedFloat型で再試行してください。`, ()=>Obs.T.float(-1, {unsigned:true}));
    a.e(TypeError, `非安全な整数値は許可されておらず代入できません。unsafed=trueにしてください。`, ()=>Obs.T.float(Number.MIN_SAFE_INTEGER-1));
    a.e(TypeError, `非安全な整数値は許可されておらず代入できません。unsafed=trueにしてください。`, ()=>Obs.T.float(Number.MAX_SAFE_INTEGER+1));

    // UnsignedFloat
    a.t(()=>{
        const f = Obs.T.ufloat();
        return f instanceof Obs.C.UnsignedFloat && 0===f.value && !f.naned && !f.infinited && !f.unsafed &&  f.unsigned && 0===f.min && Number.MAX_SAFE_INTEGER===f.max;
    });
    a.t(()=>{
        const f = Obs.T.ufloat(123);
        return f instanceof Obs.C.UnsignedFloat && 123===f.value && !f.naned && !f.infinited && !f.unsafed &&  f.unsigned && 0===f.min && Number.MAX_SAFE_INTEGER===f.max;
    });
    a.t(()=>{
        const f = Obs.T.ufloat(123, {value:234});
        return f instanceof Obs.C.UnsignedFloat && 234===f.value && !f.naned && !f.infinited && !f.unsafed &&  f.unsigned && 0===f.min && Number.MAX_SAFE_INTEGER===f.max;
    });
    a.t(()=>{
        const f = Obs.T.ufloat({value:234});
        return f instanceof Obs.C.UnsignedFloat && 234===f.value && !f.naned && !f.infinited && !f.unsafed &&  f.unsigned && 0===f.min && Number.MAX_SAFE_INTEGER===f.max;
    });
    a.t(()=>{
        const f = Obs.T.ufloat(123, 2, 200);
        return f instanceof Obs.C.UnsignedFloat && 123===f.value && !f.naned && !f.infinited && !f.unsafed &&  f.unsigned && 2===f.min && 200===f.max;
    });
    a.e(TypeError, `naned=falseなのにvalue=NaNです。`, ()=>Obs.T.ufloat(NaN, true)); // trueはunsigned
    a.e(TypeError, `nanedはtrueにできません。Quantity型で再試行してください。`, ()=>Obs.T.ufloat(NaN, {naned:true}));
    a.e(TypeError, `infinitedはtrueにできません。Quantity型で再試行してください。`, ()=>Obs.T.ufloat(Infinity, {infinited:true}));
    a.e(TypeError, `unsafedはtrueにできません。Quantity/AllFinite/UnsafedFinite型で再試行してください。`, ()=>Obs.T.ufloat(-123, {unsafed:true}));
    a.e(RangeError, `valueがmin〜maxの範囲を超過しています。:value:-1, min:0, max:9007199254740991`, ()=>Obs.T.ufloat(-1, {unsigned:true}));
    a.e(TypeError, `unsignedはfalseにできません。Quantity/AllFinite/Finite/UnsafedFinite/AllFloat/Float型で再試行してください。`, ()=>Obs.T.ufloat(0, {unsigned:false}));
    a.e(TypeError, `非安全な整数値は許可されておらず代入できません。unsafed=trueにしてください。`, ()=>Obs.T.ufloat(Number.MIN_SAFE_INTEGER-1));
    a.e(TypeError, `非安全な整数値は許可されておらず代入できません。unsafed=trueにしてください。`, ()=>Obs.T.ufloat(Number.MAX_SAFE_INTEGER+1));

    a.f(0.3===(0.1+0.2)); // 0.300000000000000004
    a.f(0.8===(0.1+0.7)); // 0.799999999999999999
    // 誤差でイコールにならない所をイコール判定する
    a.t(Float.eq(0.3, 0.1+0.2));
    a.t(Float.eq(0.8, 0.1+0.7));

    // RoundFloat
    a.t(()=>{
        const v = Obs.T.round();
        return v instanceof Obs.C.RoundFloat && 0===v.value && !v.naned && !v.infinited && !v.unsafed && !v.unsigned && Number.MIN_SAFE_INTEGER===v.min && Number.MAX_SAFE_INTEGER===v.max && 0===v.fig && 'round'===v.roundMethodName && '0'===`${v}`;
    });
    a.t(()=>{
        const v = Obs.T.round([123, 0]);
        return v instanceof Obs.C.RoundFloat && 123===v.value && !v.naned && !v.infinited && !v.unsafed && !v.unsigned && Number.MIN_SAFE_INTEGER===v.min && Number.MAX_SAFE_INTEGER===v.max && 0===v.fig && 'round'===v.roundMethodName && '123'===`${v}`;
    });
    a.t(()=>{
        const v = Obs.T.round([123, 1]);
        return v instanceof Obs.C.RoundFloat && 123===v.value && !v.naned && !v.infinited && !v.unsafed && !v.unsigned && Number.MIN_SAFE_INTEGER===v.min && Number.MAX_SAFE_INTEGER===v.max && 1===v.fig && 'round'===v.roundMethodName && '123.0'===`${v}`;
    });
    a.t(()=>{
        const v = Obs.T.round([123, 2]);
        return v instanceof Obs.C.RoundFloat && 123===v.value && !v.naned && !v.infinited && !v.unsafed && !v.unsigned && Number.MIN_SAFE_INTEGER===v.min && Number.MAX_SAFE_INTEGER===v.max && 2===v.fig && 'round'===v.roundMethodName && '123.00'===`${v}`;
    });
    a.t(()=>{
        const v = Obs.T.round([123.4, 2]);
        return v instanceof Obs.C.RoundFloat && 123.4===v.value && !v.naned && !v.infinited && !v.unsafed && !v.unsigned && Number.MIN_SAFE_INTEGER===v.min && Number.MAX_SAFE_INTEGER===v.max && 2===v.fig && 'round'===v.roundMethodName && '123.40'===`${v}`;
    });
    a.t(()=>{
        const v = Obs.T.round([123.45, 2]);
        return v instanceof Obs.C.RoundFloat && 123.45===v.value && !v.naned && !v.infinited && !v.unsafed && !v.unsigned && Number.MIN_SAFE_INTEGER===v.min && Number.MAX_SAFE_INTEGER===v.max && 2===v.fig && 'round'===v.roundMethodName && '123.45'===`${v}`;
    });
    a.t(()=>{
        const v = Obs.T.round([123.456, 2]);
        return v instanceof Obs.C.RoundFloat && 123.456===v.value && !v.naned && !v.infinited && !v.unsafed && !v.unsigned && Number.MIN_SAFE_INTEGER===v.min && Number.MAX_SAFE_INTEGER===v.max && 2===v.fig && 'round'===v.roundMethodName && '123.46'===`${v}`;
    });
    a.t(()=>{
        const v = Obs.T.round([123.455, 2]);
        return v instanceof Obs.C.RoundFloat && 123.455===v.value && !v.naned && !v.infinited && !v.unsafed && !v.unsigned && Number.MIN_SAFE_INTEGER===v.min && Number.MAX_SAFE_INTEGER===v.max && 2===v.fig && 'round'===v.roundMethodName && '123.46'===`${v}`;
    });
    a.t(()=>{
        const v = Obs.T.round([123.465, 2]);
        console.log(`v:${v}`); // 123.47 になる。もしhalfEvenなら 123.46 。
        return v instanceof Obs.C.RoundFloat && 123.465===v.value && !v.naned && !v.infinited && !v.unsafed && !v.unsigned && Number.MIN_SAFE_INTEGER===v.min && Number.MAX_SAFE_INTEGER===v.max && 2===v.fig && 'round'===v.roundMethodName && '123.47'===`${v}`;
    });
    a.t(()=>{
        const v = Obs.T.round([123.475, 2]);
        return v instanceof Obs.C.RoundFloat && 123.475===v.value && !v.naned && !v.infinited && !v.unsafed && !v.unsigned && Number.MIN_SAFE_INTEGER===v.min && Number.MAX_SAFE_INTEGER===v.max && 2===v.fig && 'round'===v.roundMethodName && '123.48'===`${v}`;
    });
    a.t(()=>{
        const v = Obs.T.round([123.454, 2]);
        return v instanceof Obs.C.RoundFloat && 123.454===v.value && !v.naned && !v.infinited && !v.unsafed && !v.unsigned && Number.MIN_SAFE_INTEGER===v.min && Number.MAX_SAFE_INTEGER===v.max && 2===v.fig && 'round'===v.roundMethodName && '123.45'===`${v}`;
    });

    // HalfEvenFloat
    a.t(()=>{
        const v = Obs.T.halfEven();
        return v instanceof Obs.C.HalfEvenFloat && 0===v.value && !v.naned && !v.infinited && !v.unsafed && !v.unsigned && Number.MIN_SAFE_INTEGER===v.min && Number.MAX_SAFE_INTEGER===v.max && 0===v.fig && 'halfEven'===v.roundMethodName && '0'===`${v}`;
    });
    a.t(()=>{
        const v = Obs.T.halfEven([123, 0]);
        return v instanceof Obs.C.HalfEvenFloat && 123===v.value && !v.naned && !v.infinited && !v.unsafed && !v.unsigned && Number.MIN_SAFE_INTEGER===v.min && Number.MAX_SAFE_INTEGER===v.max && 0===v.fig && 'halfEven'===v.roundMethodName && '123'===`${v}`;
    });
    a.t(()=>{
        const v = Obs.T.halfEven([123, 1]);
        return v instanceof Obs.C.HalfEvenFloat && 123===v.value && !v.naned && !v.infinited && !v.unsafed && !v.unsigned && Number.MIN_SAFE_INTEGER===v.min && Number.MAX_SAFE_INTEGER===v.max && 1===v.fig && 'halfEven'===v.roundMethodName && '123.0'===`${v}`;
    });
    a.t(()=>{
        const v = Obs.T.halfEven([123, 2]);
        return v instanceof Obs.C.HalfEvenFloat && 123===v.value && !v.naned && !v.infinited && !v.unsafed && !v.unsigned && Number.MIN_SAFE_INTEGER===v.min && Number.MAX_SAFE_INTEGER===v.max && 2===v.fig && 'halfEven'===v.roundMethodName && '123.00'===`${v}`;
    });
    a.t(()=>{
        const v = Obs.T.halfEven([123.4, 2]);
        return v instanceof Obs.C.HalfEvenFloat && 123.4===v.value && !v.naned && !v.infinited && !v.unsafed && !v.unsigned && Number.MIN_SAFE_INTEGER===v.min && Number.MAX_SAFE_INTEGER===v.max && 2===v.fig && 'halfEven'===v.roundMethodName && '123.40'===`${v}`;
    });
    a.t(()=>{
        const v = Obs.T.halfEven([123.45, 2]);
        return v instanceof Obs.C.HalfEvenFloat && 123.45===v.value && !v.naned && !v.infinited && !v.unsafed && !v.unsigned && Number.MIN_SAFE_INTEGER===v.min && Number.MAX_SAFE_INTEGER===v.max && 2===v.fig && 'halfEven'===v.roundMethodName && '123.45'===`${v}`;
    });
    a.t(()=>{
        const v = Obs.T.halfEven([123.456, 2]);
        return v instanceof Obs.C.HalfEvenFloat && 123.456===v.value && !v.naned && !v.infinited && !v.unsafed && !v.unsigned && Number.MIN_SAFE_INTEGER===v.min && Number.MAX_SAFE_INTEGER===v.max && 2===v.fig && 'halfEven'===v.roundMethodName && '123.46'===`${v}`;
    });
    a.t(()=>{
        const v = Obs.T.halfEven([123.455, 2]);
        return v instanceof Obs.C.HalfEvenFloat && 123.455===v.value && !v.naned && !v.infinited && !v.unsafed && !v.unsigned && Number.MIN_SAFE_INTEGER===v.min && Number.MAX_SAFE_INTEGER===v.max && 2===v.fig && 'halfEven'===v.roundMethodName && '123.46'===`${v}`;
    });
    a.t(()=>{
        const v = Obs.T.halfEven([123.465, 2]);
        return v instanceof Obs.C.HalfEvenFloat && 123.465===v.value && !v.naned && !v.infinited && !v.unsafed && !v.unsigned && Number.MIN_SAFE_INTEGER===v.min && Number.MAX_SAFE_INTEGER===v.max && 2===v.fig && 'halfEven'===v.roundMethodName && '123.46'===`${v}`;
    });
    a.t(()=>{
        const v = Obs.T.halfEven([123.475, 2]);
        return v instanceof Obs.C.HalfEvenFloat && 123.475===v.value && !v.naned && !v.infinited && !v.unsafed && !v.unsigned && Number.MIN_SAFE_INTEGER===v.min && Number.MAX_SAFE_INTEGER===v.max && 2===v.fig && 'halfEven'===v.roundMethodName && '123.48'===`${v}`;
    });
    a.t(()=>{
        const v = Obs.T.halfEven([123.454, 2]);
        return v instanceof Obs.C.HalfEvenFloat && 123.454===v.value && !v.naned && !v.infinited && !v.unsafed && !v.unsigned && Number.MIN_SAFE_INTEGER===v.min && Number.MAX_SAFE_INTEGER===v.max && 2===v.fig && 'halfEven'===v.roundMethodName && '123.45'===`${v}`;
    });

    // CeilFloat
    a.t(()=>{
        const v = Obs.T.ceil();
        return v instanceof Obs.C.CeilFloat && 0===v.value && !v.naned && !v.infinited && !v.unsafed && !v.unsigned && Number.MIN_SAFE_INTEGER===v.min && Number.MAX_SAFE_INTEGER===v.max && 0===v.fig && 'ceil'===v.roundMethodName && '0'===`${v}`;
    });
    a.t(()=>{
        const v = Obs.T.ceil([123, 0]);
        return v instanceof Obs.C.CeilFloat && 123===v.value && !v.naned && !v.infinited && !v.unsafed && !v.unsigned && Number.MIN_SAFE_INTEGER===v.min && Number.MAX_SAFE_INTEGER===v.max && 0===v.fig && 'ceil'===v.roundMethodName && '123'===`${v}`;
    });
    a.t(()=>{
        const v = Obs.T.ceil([123, 1]);
        return v instanceof Obs.C.CeilFloat && 123===v.value && !v.naned && !v.infinited && !v.unsafed && !v.unsigned && Number.MIN_SAFE_INTEGER===v.min && Number.MAX_SAFE_INTEGER===v.max && 1===v.fig && 'ceil'===v.roundMethodName && '123.0'===`${v}`;
    });
    a.t(()=>{
        const v = Obs.T.ceil([123, 2]);
        return v instanceof Obs.C.CeilFloat && 123===v.value && !v.naned && !v.infinited && !v.unsafed && !v.unsigned && Number.MIN_SAFE_INTEGER===v.min && Number.MAX_SAFE_INTEGER===v.max && 2===v.fig && 'ceil'===v.roundMethodName && '123.00'===`${v}`;
    });
    a.t(()=>{
        const v = Obs.T.ceil([123.4, 2]);
        console.log(`v:${v}`); // 123.41 記入していない部分はゼロにして欲しいが、IEEE754仕様による誤差が生じるため、こうなってしまう。
        return v instanceof Obs.C.CeilFloat && 123.4===v.value && !v.naned && !v.infinited && !v.unsafed && !v.unsigned && Number.MIN_SAFE_INTEGER===v.min && Number.MAX_SAFE_INTEGER===v.max && 2===v.fig && 'ceil'===v.roundMethodName && '123.40'===`${v}`;
    });
    a.t(()=>{
        const v = Obs.T.ceil([123.45, 2]);
        console.log(`v:${v}`); // 123.46 記入していない部分はゼロにして欲しいが、IEEE754仕様による誤差が生じるため、こうなってしまう。
        return v instanceof Obs.C.CeilFloat && 123.45===v.value && !v.naned && !v.infinited && !v.unsafed && !v.unsigned && Number.MIN_SAFE_INTEGER===v.min && Number.MAX_SAFE_INTEGER===v.max && 2===v.fig && 'ceil'===v.roundMethodName && '123.45'===`${v}`;
    });
    a.t(()=>{
        const v = Obs.T.ceil([123.456, 2]);
        return v instanceof Obs.C.CeilFloat && 123.456===v.value && !v.naned && !v.infinited && !v.unsafed && !v.unsigned && Number.MIN_SAFE_INTEGER===v.min && Number.MAX_SAFE_INTEGER===v.max && 2===v.fig && 'ceil'===v.roundMethodName && '123.46'===`${v}`;
    });
    a.t(()=>{
        const v = Obs.T.ceil([123.455, 2]);
        return v instanceof Obs.C.CeilFloat && 123.455===v.value && !v.naned && !v.infinited && !v.unsafed && !v.unsigned && Number.MIN_SAFE_INTEGER===v.min && Number.MAX_SAFE_INTEGER===v.max && 2===v.fig && 'ceil'===v.roundMethodName && '123.46'===`${v}`;
    });
    a.t(()=>{
        const v = Obs.T.ceil([123.465, 2]);
        return v instanceof Obs.C.CeilFloat && 123.465===v.value && !v.naned && !v.infinited && !v.unsafed && !v.unsigned && Number.MIN_SAFE_INTEGER===v.min && Number.MAX_SAFE_INTEGER===v.max && 2===v.fig && 'ceil'===v.roundMethodName && '123.47'===`${v}`;
    });
    a.t(()=>{
        const v = Obs.T.ceil([123.475, 2]);
        return v instanceof Obs.C.CeilFloat && 123.475===v.value && !v.naned && !v.infinited && !v.unsafed && !v.unsigned && Number.MIN_SAFE_INTEGER===v.min && Number.MAX_SAFE_INTEGER===v.max && 2===v.fig && 'ceil'===v.roundMethodName && '123.48'===`${v}`;
    });
    a.t(()=>{
        const v = Obs.T.ceil([123.454, 2]);
        console.log(`v:${v}`);
        return v instanceof Obs.C.CeilFloat && 123.454===v.value && !v.naned && !v.infinited && !v.unsafed && !v.unsigned && Number.MIN_SAFE_INTEGER===v.min && Number.MAX_SAFE_INTEGER===v.max && 2===v.fig && 'ceil'===v.roundMethodName && '123.46'===`${v}`;
    });

    // FloorFloat
    a.t(()=>{
        const v = Obs.T.floor();
        return v instanceof Obs.C.FloorFloat && 0===v.value && !v.naned && !v.infinited && !v.unsafed && !v.unsigned && Number.MIN_SAFE_INTEGER===v.min && Number.MAX_SAFE_INTEGER===v.max && 0===v.fig && 'floor'===v.roundMethodName && '0'===`${v}`;
    });
    a.t(()=>{
        const v = Obs.T.floor([123, 0]);
        return v instanceof Obs.C.FloorFloat && 123===v.value && !v.naned && !v.infinited && !v.unsafed && !v.unsigned && Number.MIN_SAFE_INTEGER===v.min && Number.MAX_SAFE_INTEGER===v.max && 0===v.fig && 'floor'===v.roundMethodName && '123'===`${v}`;
    });
    a.t(()=>{
        const v = Obs.T.floor([123, 1]);
        return v instanceof Obs.C.FloorFloat && 123===v.value && !v.naned && !v.infinited && !v.unsafed && !v.unsigned && Number.MIN_SAFE_INTEGER===v.min && Number.MAX_SAFE_INTEGER===v.max && 1===v.fig && 'floor'===v.roundMethodName && '123.0'===`${v}`;
    });
    a.t(()=>{
        const v = Obs.T.floor([123, 2]);
        return v instanceof Obs.C.FloorFloat && 123===v.value && !v.naned && !v.infinited && !v.unsafed && !v.unsigned && Number.MIN_SAFE_INTEGER===v.min && Number.MAX_SAFE_INTEGER===v.max && 2===v.fig && 'floor'===v.roundMethodName && '123.00'===`${v}`;
    });
    a.t(()=>{
        const v = Obs.T.floor([123.4, 2]);
        console.log(`v:${v}`); // 123.41 記入していない部分はゼロにして欲しいが、IEEE754仕様による誤差が生じるため、こうなってしまう。
        return v instanceof Obs.C.FloorFloat && 123.4===v.value && !v.naned && !v.infinited && !v.unsafed && !v.unsigned && Number.MIN_SAFE_INTEGER===v.min && Number.MAX_SAFE_INTEGER===v.max && 2===v.fig && 'floor'===v.roundMethodName && '123.40'===`${v}`;
    });
    a.t(()=>{
        const v = Obs.T.floor([123.45, 2]);
        console.log(`v:${v}`); // 123.46 記入していない部分はゼロにして欲しいが、IEEE754仕様による誤差が生じるため、こうなってしまう。
        return v instanceof Obs.C.FloorFloat && 123.45===v.value && !v.naned && !v.infinited && !v.unsafed && !v.unsigned && Number.MIN_SAFE_INTEGER===v.min && Number.MAX_SAFE_INTEGER===v.max && 2===v.fig && 'floor'===v.roundMethodName && '123.45'===`${v}`;
    });
    a.t(()=>{
        const v = Obs.T.floor([123.456, 2]);
        return v instanceof Obs.C.FloorFloat && 123.456===v.value && !v.naned && !v.infinited && !v.unsafed && !v.unsigned && Number.MIN_SAFE_INTEGER===v.min && Number.MAX_SAFE_INTEGER===v.max && 2===v.fig && 'floor'===v.roundMethodName && '123.45'===`${v}`;
    });
    a.t(()=>{
        const v = Obs.T.floor([123.455, 2]);
        return v instanceof Obs.C.FloorFloat && 123.455===v.value && !v.naned && !v.infinited && !v.unsafed && !v.unsigned && Number.MIN_SAFE_INTEGER===v.min && Number.MAX_SAFE_INTEGER===v.max && 2===v.fig && 'floor'===v.roundMethodName && '123.45'===`${v}`;
    });
    a.t(()=>{
        const v = Obs.T.floor([123.465, 2]);
        return v instanceof Obs.C.FloorFloat && 123.465===v.value && !v.naned && !v.infinited && !v.unsafed && !v.unsigned && Number.MIN_SAFE_INTEGER===v.min && Number.MAX_SAFE_INTEGER===v.max && 2===v.fig && 'floor'===v.roundMethodName && '123.46'===`${v}`;
    });
    a.t(()=>{
        const v = Obs.T.floor([123.475, 2]);
        return v instanceof Obs.C.FloorFloat && 123.475===v.value && !v.naned && !v.infinited && !v.unsafed && !v.unsigned && Number.MIN_SAFE_INTEGER===v.min && Number.MAX_SAFE_INTEGER===v.max && 2===v.fig && 'floor'===v.roundMethodName && '123.47'===`${v}`;
    });
    a.t(()=>{
        const v = Obs.T.floor([123.454, 2]);
        return v instanceof Obs.C.FloorFloat && 123.454===v.value && !v.naned && !v.infinited && !v.unsafed && !v.unsigned && Number.MIN_SAFE_INTEGER===v.min && Number.MAX_SAFE_INTEGER===v.max && 2===v.fig && 'floor'===v.roundMethodName && '123.45'===`${v}`;
    });

    // TruncFloat
    a.t(()=>{
        const v = Obs.T.trunc();
        return v instanceof Obs.C.TruncFloat && 0===v.value && !v.naned && !v.infinited && !v.unsafed && !v.unsigned && Number.MIN_SAFE_INTEGER===v.min && Number.MAX_SAFE_INTEGER===v.max && 0===v.fig && 'trunc'===v.roundMethodName && '0'===`${v}`;
    });
    a.t(()=>{
        const v = Obs.T.trunc([123, 0]);
        return v instanceof Obs.C.TruncFloat && 123===v.value && !v.naned && !v.infinited && !v.unsafed && !v.unsigned && Number.MIN_SAFE_INTEGER===v.min && Number.MAX_SAFE_INTEGER===v.max && 0===v.fig && 'trunc'===v.roundMethodName && '123'===`${v}`;
    });
    a.t(()=>{
        const v = Obs.T.trunc([123, 1]);
        return v instanceof Obs.C.TruncFloat && 123===v.value && !v.naned && !v.infinited && !v.unsafed && !v.unsigned && Number.MIN_SAFE_INTEGER===v.min && Number.MAX_SAFE_INTEGER===v.max && 1===v.fig && 'trunc'===v.roundMethodName && '123.0'===`${v}`;
    });
    a.t(()=>{
        const v = Obs.T.trunc([123, 2]);
        return v instanceof Obs.C.TruncFloat && 123===v.value && !v.naned && !v.infinited && !v.unsafed && !v.unsigned && Number.MIN_SAFE_INTEGER===v.min && Number.MAX_SAFE_INTEGER===v.max && 2===v.fig && 'trunc'===v.roundMethodName && '123.00'===`${v}`;
    });
    a.t(()=>{
        const v = Obs.T.trunc([123.4, 2]);
        console.log(`v:${v}`); // 123.41 記入していない部分はゼロにして欲しいが、IEEE754仕様による誤差が生じるため、こうなってしまう。
        return v instanceof Obs.C.TruncFloat && 123.4===v.value && !v.naned && !v.infinited && !v.unsafed && !v.unsigned && Number.MIN_SAFE_INTEGER===v.min && Number.MAX_SAFE_INTEGER===v.max && 2===v.fig && 'trunc'===v.roundMethodName && '123.40'===`${v}`;
    });
    a.t(()=>{
        const v = Obs.T.trunc([123.45, 2]);
        console.log(`v:${v}`); // 123.46 記入していない部分はゼロにして欲しいが、IEEE754仕様による誤差が生じるため、こうなってしまう。
        return v instanceof Obs.C.TruncFloat && 123.45===v.value && !v.naned && !v.infinited && !v.unsafed && !v.unsigned && Number.MIN_SAFE_INTEGER===v.min && Number.MAX_SAFE_INTEGER===v.max && 2===v.fig && 'trunc'===v.roundMethodName && '123.45'===`${v}`;
    });
    a.t(()=>{
        const v = Obs.T.trunc([123.456, 2]);
        return v instanceof Obs.C.TruncFloat && 123.456===v.value && !v.naned && !v.infinited && !v.unsafed && !v.unsigned && Number.MIN_SAFE_INTEGER===v.min && Number.MAX_SAFE_INTEGER===v.max && 2===v.fig && 'trunc'===v.roundMethodName && '123.45'===`${v}`;
    });
    a.t(()=>{
        const v = Obs.T.trunc([123.455, 2]);
        return v instanceof Obs.C.TruncFloat && 123.455===v.value && !v.naned && !v.infinited && !v.unsafed && !v.unsigned && Number.MIN_SAFE_INTEGER===v.min && Number.MAX_SAFE_INTEGER===v.max && 2===v.fig && 'trunc'===v.roundMethodName && '123.45'===`${v}`;
    });
    a.t(()=>{
        const v = Obs.T.trunc([123.465, 2]);
        return v instanceof Obs.C.TruncFloat && 123.465===v.value && !v.naned && !v.infinited && !v.unsafed && !v.unsigned && Number.MIN_SAFE_INTEGER===v.min && Number.MAX_SAFE_INTEGER===v.max && 2===v.fig && 'trunc'===v.roundMethodName && '123.46'===`${v}`;
    });
    a.t(()=>{
        const v = Obs.T.trunc([123.475, 2]);
        return v instanceof Obs.C.TruncFloat && 123.475===v.value && !v.naned && !v.infinited && !v.unsafed && !v.unsigned && Number.MIN_SAFE_INTEGER===v.min && Number.MAX_SAFE_INTEGER===v.max && 2===v.fig && 'trunc'===v.roundMethodName && '123.47'===`${v}`;
    });
    a.t(()=>{
        const v = Obs.T.trunc([123.454, 2]);
        return v instanceof Obs.C.TruncFloat && 123.454===v.value && !v.naned && !v.infinited && !v.unsafed && !v.unsigned && Number.MIN_SAFE_INTEGER===v.min && Number.MAX_SAFE_INTEGER===v.max && 2===v.fig && 'trunc'===v.roundMethodName && '123.45'===`${v}`;
    });

    // 負数
    // RoundFloat
    a.t(()=>{
        const v = Obs.T.round();
        return v instanceof Obs.C.RoundFloat && 0===v.value && !v.naned && !v.infinited && !v.unsafed && !v.unsigned && Number.MIN_SAFE_INTEGER===v.min && Number.MAX_SAFE_INTEGER===v.max && 0===v.fig && 'round'===v.roundMethodName && '0'===`${v}`;
    });
    a.t(()=>{
        const v = Obs.T.round([-123, 0]);
        return v instanceof Obs.C.RoundFloat && -123===v.value && !v.naned && !v.infinited && !v.unsafed && !v.unsigned && Number.MIN_SAFE_INTEGER===v.min && Number.MAX_SAFE_INTEGER===v.max && 0===v.fig && 'round'===v.roundMethodName && '-123'===`${v}`;
    });
    a.t(()=>{
        const v = Obs.T.round([-123, 1]);
        return v instanceof Obs.C.RoundFloat && -123===v.value && !v.naned && !v.infinited && !v.unsafed && !v.unsigned && Number.MIN_SAFE_INTEGER===v.min && Number.MAX_SAFE_INTEGER===v.max && 1===v.fig && 'round'===v.roundMethodName && '-123.0'===`${v}`;
    });
    a.t(()=>{
        const v = Obs.T.round([-123, 2]);
        return v instanceof Obs.C.RoundFloat && -123===v.value && !v.naned && !v.infinited && !v.unsafed && !v.unsigned && Number.MIN_SAFE_INTEGER===v.min && Number.MAX_SAFE_INTEGER===v.max && 2===v.fig && 'round'===v.roundMethodName && '-123.00'===`${v}`;
    });
    a.t(()=>{
        const v = Obs.T.round([-123.4, 2]);
        return v instanceof Obs.C.RoundFloat && -123.4===v.value && !v.naned && !v.infinited && !v.unsafed && !v.unsigned && Number.MIN_SAFE_INTEGER===v.min && Number.MAX_SAFE_INTEGER===v.max && 2===v.fig && 'round'===v.roundMethodName && '-123.40'===`${v}`;
    });
    a.t(()=>{
        const v = Obs.T.round([-123.45, 2]);
        return v instanceof Obs.C.RoundFloat && -123.45===v.value && !v.naned && !v.infinited && !v.unsafed && !v.unsigned && Number.MIN_SAFE_INTEGER===v.min && Number.MAX_SAFE_INTEGER===v.max && 2===v.fig && 'round'===v.roundMethodName && '-123.45'===`${v}`;
    });
    a.t(()=>{
        const v = Obs.T.round([-123.456, 2]);
        return v instanceof Obs.C.RoundFloat && -123.456===v.value && !v.naned && !v.infinited && !v.unsafed && !v.unsigned && Number.MIN_SAFE_INTEGER===v.min && Number.MAX_SAFE_INTEGER===v.max && 2===v.fig && 'round'===v.roundMethodName && '-123.46'===`${v}`;
    });
    a.t(()=>{
        const v = Obs.T.round([-123.455, 2]);
        return v instanceof Obs.C.RoundFloat && -123.455===v.value && !v.naned && !v.infinited && !v.unsafed && !v.unsigned && Number.MIN_SAFE_INTEGER===v.min && Number.MAX_SAFE_INTEGER===v.max && 2===v.fig && 'round'===v.roundMethodName && '-123.46'===`${v}`;
    });
    a.t(()=>{
        const v = Obs.T.round([-123.465, 2]);
        console.log(`v:${v}`); // -123.47 になる。もしhalfEvenなら -123.46 。
        return v instanceof Obs.C.RoundFloat && -123.465===v.value && !v.naned && !v.infinited && !v.unsafed && !v.unsigned && Number.MIN_SAFE_INTEGER===v.min && Number.MAX_SAFE_INTEGER===v.max && 2===v.fig && 'round'===v.roundMethodName && '-123.47'===`${v}`;
    });
    a.t(()=>{
        const v = Obs.T.round([-123.475, 2]);
        return v instanceof Obs.C.RoundFloat && -123.475===v.value && !v.naned && !v.infinited && !v.unsafed && !v.unsigned && Number.MIN_SAFE_INTEGER===v.min && Number.MAX_SAFE_INTEGER===v.max && 2===v.fig && 'round'===v.roundMethodName && '-123.48'===`${v}`;
    });
    a.t(()=>{
        const v = Obs.T.round([-123.454, 2]);
        return v instanceof Obs.C.RoundFloat && -123.454===v.value && !v.naned && !v.infinited && !v.unsafed && !v.unsigned && Number.MIN_SAFE_INTEGER===v.min && Number.MAX_SAFE_INTEGER===v.max && 2===v.fig && 'round'===v.roundMethodName && '-123.45'===`${v}`;
    });

    // HalfEvenFloat
    a.t(()=>{
        const v = Obs.T.halfEven();
        return v instanceof Obs.C.HalfEvenFloat && 0===v.value && !v.naned && !v.infinited && !v.unsafed && !v.unsigned && Number.MIN_SAFE_INTEGER===v.min && Number.MAX_SAFE_INTEGER===v.max && 0===v.fig && 'halfEven'===v.roundMethodName && '0'===`${v}`;
    });
    a.t(()=>{
        const v = Obs.T.halfEven([-123, 0]);
        return v instanceof Obs.C.HalfEvenFloat && -123===v.value && !v.naned && !v.infinited && !v.unsafed && !v.unsigned && Number.MIN_SAFE_INTEGER===v.min && Number.MAX_SAFE_INTEGER===v.max && 0===v.fig && 'halfEven'===v.roundMethodName && '-123'===`${v}`;
    });
    a.t(()=>{
        const v = Obs.T.halfEven([-123, 1]);
        return v instanceof Obs.C.HalfEvenFloat && -123===v.value && !v.naned && !v.infinited && !v.unsafed && !v.unsigned && Number.MIN_SAFE_INTEGER===v.min && Number.MAX_SAFE_INTEGER===v.max && 1===v.fig && 'halfEven'===v.roundMethodName && '-123.0'===`${v}`;
    });
    a.t(()=>{
        const v = Obs.T.halfEven([-123, 2]);
        return v instanceof Obs.C.HalfEvenFloat && -123===v.value && !v.naned && !v.infinited && !v.unsafed && !v.unsigned && Number.MIN_SAFE_INTEGER===v.min && Number.MAX_SAFE_INTEGER===v.max && 2===v.fig && 'halfEven'===v.roundMethodName && '-123.00'===`${v}`;
    });
    a.t(()=>{
        const v = Obs.T.halfEven([-123.4, 2]);
        return v instanceof Obs.C.HalfEvenFloat && -123.4===v.value && !v.naned && !v.infinited && !v.unsafed && !v.unsigned && Number.MIN_SAFE_INTEGER===v.min && Number.MAX_SAFE_INTEGER===v.max && 2===v.fig && 'halfEven'===v.roundMethodName && '-123.40'===`${v}`;
    });
    a.t(()=>{
        const v = Obs.T.halfEven([-123.45, 2]);
        return v instanceof Obs.C.HalfEvenFloat && -123.45===v.value && !v.naned && !v.infinited && !v.unsafed && !v.unsigned && Number.MIN_SAFE_INTEGER===v.min && Number.MAX_SAFE_INTEGER===v.max && 2===v.fig && 'halfEven'===v.roundMethodName && '-123.45'===`${v}`;
    });
    a.t(()=>{
        const v = Obs.T.halfEven([-123.456, 2]);
        return v instanceof Obs.C.HalfEvenFloat && -123.456===v.value && !v.naned && !v.infinited && !v.unsafed && !v.unsigned && Number.MIN_SAFE_INTEGER===v.min && Number.MAX_SAFE_INTEGER===v.max && 2===v.fig && 'halfEven'===v.roundMethodName && '-123.46'===`${v}`;
    });
    a.t(()=>{
        const v = Obs.T.halfEven([-123.455, 2]);
        return v instanceof Obs.C.HalfEvenFloat && -123.455===v.value && !v.naned && !v.infinited && !v.unsafed && !v.unsigned && Number.MIN_SAFE_INTEGER===v.min && Number.MAX_SAFE_INTEGER===v.max && 2===v.fig && 'halfEven'===v.roundMethodName && '-123.46'===`${v}`;
    });
    a.t(()=>{
        const v = Obs.T.halfEven([-123.465, 2]);
        return v instanceof Obs.C.HalfEvenFloat && -123.465===v.value && !v.naned && !v.infinited && !v.unsafed && !v.unsigned && Number.MIN_SAFE_INTEGER===v.min && Number.MAX_SAFE_INTEGER===v.max && 2===v.fig && 'halfEven'===v.roundMethodName && '-123.46'===`${v}`;
    });
    a.t(()=>{
        const v = Obs.T.halfEven([-123.475, 2]);
        return v instanceof Obs.C.HalfEvenFloat && -123.475===v.value && !v.naned && !v.infinited && !v.unsafed && !v.unsigned && Number.MIN_SAFE_INTEGER===v.min && Number.MAX_SAFE_INTEGER===v.max && 2===v.fig && 'halfEven'===v.roundMethodName && '-123.48'===`${v}`;
    });
    a.t(()=>{
        const v = Obs.T.halfEven([-123.454, 2]);
        return v instanceof Obs.C.HalfEvenFloat && -123.454===v.value && !v.naned && !v.infinited && !v.unsafed && !v.unsigned && Number.MIN_SAFE_INTEGER===v.min && Number.MAX_SAFE_INTEGER===v.max && 2===v.fig && 'halfEven'===v.roundMethodName && '-123.45'===`${v}`;
    });

    // CeilFloat
    a.t(()=>{
        const v = Obs.T.ceil();
        return v instanceof Obs.C.CeilFloat && 0===v.value && !v.naned && !v.infinited && !v.unsafed && !v.unsigned && Number.MIN_SAFE_INTEGER===v.min && Number.MAX_SAFE_INTEGER===v.max && 0===v.fig && 'ceil'===v.roundMethodName && '0'===`${v}`;
    });
    a.t(()=>{
        const v = Obs.T.ceil([-123, 0]);
        return v instanceof Obs.C.CeilFloat && -123===v.value && !v.naned && !v.infinited && !v.unsafed && !v.unsigned && Number.MIN_SAFE_INTEGER===v.min && Number.MAX_SAFE_INTEGER===v.max && 0===v.fig && 'ceil'===v.roundMethodName && '-123'===`${v}`;
    });
    a.t(()=>{
        const v = Obs.T.ceil([-123, 1]);
        return v instanceof Obs.C.CeilFloat && -123===v.value && !v.naned && !v.infinited && !v.unsafed && !v.unsigned && Number.MIN_SAFE_INTEGER===v.min && Number.MAX_SAFE_INTEGER===v.max && 1===v.fig && 'ceil'===v.roundMethodName && '-123.0'===`${v}`;
    });
    a.t(()=>{
        const v = Obs.T.ceil([-123, 2]);
        return v instanceof Obs.C.CeilFloat && -123===v.value && !v.naned && !v.infinited && !v.unsafed && !v.unsigned && Number.MIN_SAFE_INTEGER===v.min && Number.MAX_SAFE_INTEGER===v.max && 2===v.fig && 'ceil'===v.roundMethodName && '-123.00'===`${v}`;
    });
    a.t(()=>{
        const v = Obs.T.ceil([-123.4, 2]);
        console.log(`v:${v}`); // -123.41 記入していない部分はゼロにして欲しいが、IEEE754仕様による誤差が生じるため、こうなってしまう。
        return v instanceof Obs.C.CeilFloat && -123.4===v.value && !v.naned && !v.infinited && !v.unsafed && !v.unsigned && Number.MIN_SAFE_INTEGER===v.min && Number.MAX_SAFE_INTEGER===v.max && 2===v.fig && 'ceil'===v.roundMethodName && '-123.40'===`${v}`;
    });
    a.t(()=>{
        const v = Obs.T.ceil([-123.45, 2]);
        console.log(`v:${v}`); // -123.46 記入していない部分はゼロにして欲しいが、IEEE754仕様による誤差が生じるため、こうなってしまう。
        return v instanceof Obs.C.CeilFloat && -123.45===v.value && !v.naned && !v.infinited && !v.unsafed && !v.unsigned && Number.MIN_SAFE_INTEGER===v.min && Number.MAX_SAFE_INTEGER===v.max && 2===v.fig && 'ceil'===v.roundMethodName && '-123.45'===`${v}`;
    });
    a.t(()=>{
        const v = Obs.T.ceil([-123.456, 2]);
        return v instanceof Obs.C.CeilFloat && -123.456===v.value && !v.naned && !v.infinited && !v.unsafed && !v.unsigned && Number.MIN_SAFE_INTEGER===v.min && Number.MAX_SAFE_INTEGER===v.max && 2===v.fig && 'ceil'===v.roundMethodName && '-123.46'===`${v}`;
    });
    a.t(()=>{
        const v = Obs.T.ceil([-123.455, 2]);
        return v instanceof Obs.C.CeilFloat && -123.455===v.value && !v.naned && !v.infinited && !v.unsafed && !v.unsigned && Number.MIN_SAFE_INTEGER===v.min && Number.MAX_SAFE_INTEGER===v.max && 2===v.fig && 'ceil'===v.roundMethodName && '-123.46'===`${v}`;
    });
    a.t(()=>{
        const v = Obs.T.ceil([-123.465, 2]);
        return v instanceof Obs.C.CeilFloat && -123.465===v.value && !v.naned && !v.infinited && !v.unsafed && !v.unsigned && Number.MIN_SAFE_INTEGER===v.min && Number.MAX_SAFE_INTEGER===v.max && 2===v.fig && 'ceil'===v.roundMethodName && '-123.47'===`${v}`;
    });
    a.t(()=>{
        const v = Obs.T.ceil([-123.475, 2]);
        return v instanceof Obs.C.CeilFloat && -123.475===v.value && !v.naned && !v.infinited && !v.unsafed && !v.unsigned && Number.MIN_SAFE_INTEGER===v.min && Number.MAX_SAFE_INTEGER===v.max && 2===v.fig && 'ceil'===v.roundMethodName && '-123.48'===`${v}`;
    });
    a.t(()=>{
        const v = Obs.T.ceil([-123.454, 2]);
        return v instanceof Obs.C.CeilFloat && -123.454===v.value && !v.naned && !v.infinited && !v.unsafed && !v.unsigned && Number.MIN_SAFE_INTEGER===v.min && Number.MAX_SAFE_INTEGER===v.max && 2===v.fig && 'ceil'===v.roundMethodName && '-123.46'===`${v}`;
    });

    // FloorFloat
    a.t(()=>{
        const v = Obs.T.floor();
        return v instanceof Obs.C.FloorFloat && 0===v.value && !v.naned && !v.infinited && !v.unsafed && !v.unsigned && Number.MIN_SAFE_INTEGER===v.min && Number.MAX_SAFE_INTEGER===v.max && 0===v.fig && 'floor'===v.roundMethodName && '0'===`${v}`;
    });
    a.t(()=>{
        const v = Obs.T.floor([-123, 0]);
        return v instanceof Obs.C.FloorFloat && -123===v.value && !v.naned && !v.infinited && !v.unsafed && !v.unsigned && Number.MIN_SAFE_INTEGER===v.min && Number.MAX_SAFE_INTEGER===v.max && 0===v.fig && 'floor'===v.roundMethodName && '-123'===`${v}`;
    });
    a.t(()=>{
        const v = Obs.T.floor([-123, 1]);
        return v instanceof Obs.C.FloorFloat && -123===v.value && !v.naned && !v.infinited && !v.unsafed && !v.unsigned && Number.MIN_SAFE_INTEGER===v.min && Number.MAX_SAFE_INTEGER===v.max && 1===v.fig && 'floor'===v.roundMethodName && '-123.0'===`${v}`;
    });
    a.t(()=>{
        const v = Obs.T.floor([-123, 2]);
        return v instanceof Obs.C.FloorFloat && -123===v.value && !v.naned && !v.infinited && !v.unsafed && !v.unsigned && Number.MIN_SAFE_INTEGER===v.min && Number.MAX_SAFE_INTEGER===v.max && 2===v.fig && 'floor'===v.roundMethodName && '-123.00'===`${v}`;
    });
    a.t(()=>{
        const v = Obs.T.floor([-123.4, 2]);
        console.log(`v:${v}`); // -123.41 記入していない部分はゼロにして欲しいが、IEEE754仕様による誤差が生じるため、こうなってしまう。
        return v instanceof Obs.C.FloorFloat && -123.4===v.value && !v.naned && !v.infinited && !v.unsafed && !v.unsigned && Number.MIN_SAFE_INTEGER===v.min && Number.MAX_SAFE_INTEGER===v.max && 2===v.fig && 'floor'===v.roundMethodName && '-123.40'===`${v}`;
    });
    a.t(()=>{
        const v = Obs.T.floor([-123.45, 2]);
        console.log(`v:${v}`); // -123.46 記入していない部分はゼロにして欲しいが、IEEE754仕様による誤差が生じるため、こうなってしまう。
        return v instanceof Obs.C.FloorFloat && -123.45===v.value && !v.naned && !v.infinited && !v.unsafed && !v.unsigned && Number.MIN_SAFE_INTEGER===v.min && Number.MAX_SAFE_INTEGER===v.max && 2===v.fig && 'floor'===v.roundMethodName && '-123.45'===`${v}`;
    });
    a.t(()=>{
        const v = Obs.T.floor([-123.456, 2]);
        return v instanceof Obs.C.FloorFloat && -123.456===v.value && !v.naned && !v.infinited && !v.unsafed && !v.unsigned && Number.MIN_SAFE_INTEGER===v.min && Number.MAX_SAFE_INTEGER===v.max && 2===v.fig && 'floor'===v.roundMethodName && '-123.45'===`${v}`;
    });
    a.t(()=>{
        const v = Obs.T.floor([-123.455, 2]);
        return v instanceof Obs.C.FloorFloat && -123.455===v.value && !v.naned && !v.infinited && !v.unsafed && !v.unsigned && Number.MIN_SAFE_INTEGER===v.min && Number.MAX_SAFE_INTEGER===v.max && 2===v.fig && 'floor'===v.roundMethodName && '-123.45'===`${v}`;
    });
    a.t(()=>{
        const v = Obs.T.floor([-123.465, 2]);
        return v instanceof Obs.C.FloorFloat && -123.465===v.value && !v.naned && !v.infinited && !v.unsafed && !v.unsigned && Number.MIN_SAFE_INTEGER===v.min && Number.MAX_SAFE_INTEGER===v.max && 2===v.fig && 'floor'===v.roundMethodName && '-123.46'===`${v}`;
    });
    a.t(()=>{
        const v = Obs.T.floor([-123.475, 2]);
        return v instanceof Obs.C.FloorFloat && -123.475===v.value && !v.naned && !v.infinited && !v.unsafed && !v.unsigned && Number.MIN_SAFE_INTEGER===v.min && Number.MAX_SAFE_INTEGER===v.max && 2===v.fig && 'floor'===v.roundMethodName && '-123.47'===`${v}`;
    });
    a.t(()=>{
        const v = Obs.T.floor([-123.454, 2]);
        return v instanceof Obs.C.FloorFloat && -123.454===v.value && !v.naned && !v.infinited && !v.unsafed && !v.unsigned && Number.MIN_SAFE_INTEGER===v.min && Number.MAX_SAFE_INTEGER===v.max && 2===v.fig && 'floor'===v.roundMethodName && '-123.45'===`${v}`;
    });

    // TruncFloat
    a.t(()=>{
        const v = Obs.T.trunc();
        return v instanceof Obs.C.TruncFloat && 0===v.value && !v.naned && !v.infinited && !v.unsafed && !v.unsigned && Number.MIN_SAFE_INTEGER===v.min && Number.MAX_SAFE_INTEGER===v.max && 0===v.fig && 'trunc'===v.roundMethodName && '0'===`${v}`;
    });
    a.t(()=>{
        const v = Obs.T.trunc([-123, 0]);
        return v instanceof Obs.C.TruncFloat && -123===v.value && !v.naned && !v.infinited && !v.unsafed && !v.unsigned && Number.MIN_SAFE_INTEGER===v.min && Number.MAX_SAFE_INTEGER===v.max && 0===v.fig && 'trunc'===v.roundMethodName && '-123'===`${v}`;
    });
    a.t(()=>{
        const v = Obs.T.trunc([-123, 1]);
        return v instanceof Obs.C.TruncFloat && -123===v.value && !v.naned && !v.infinited && !v.unsafed && !v.unsigned && Number.MIN_SAFE_INTEGER===v.min && Number.MAX_SAFE_INTEGER===v.max && 1===v.fig && 'trunc'===v.roundMethodName && '-123.0'===`${v}`;
    });
    a.t(()=>{
        const v = Obs.T.trunc([-123, 2]);
        return v instanceof Obs.C.TruncFloat && -123===v.value && !v.naned && !v.infinited && !v.unsafed && !v.unsigned && Number.MIN_SAFE_INTEGER===v.min && Number.MAX_SAFE_INTEGER===v.max && 2===v.fig && 'trunc'===v.roundMethodName && '-123.00'===`${v}`;
    });
    a.t(()=>{
        const v = Obs.T.trunc([-123.4, 2]);
        console.log(`v:${v}`); // -123.41 記入していない部分はゼロにして欲しいが、IEEE754仕様による誤差が生じるため、こうなってしまう。
        return v instanceof Obs.C.TruncFloat && -123.4===v.value && !v.naned && !v.infinited && !v.unsafed && !v.unsigned && Number.MIN_SAFE_INTEGER===v.min && Number.MAX_SAFE_INTEGER===v.max && 2===v.fig && 'trunc'===v.roundMethodName && '-123.40'===`${v}`;
    });
    a.t(()=>{
        const v = Obs.T.trunc([-123.45, 2]);
        console.log(`v:${v}`); // -123.46 記入していない部分はゼロにして欲しいが、IEEE754仕様による誤差が生じるため、こうなってしまう。
        return v instanceof Obs.C.TruncFloat && -123.45===v.value && !v.naned && !v.infinited && !v.unsafed && !v.unsigned && Number.MIN_SAFE_INTEGER===v.min && Number.MAX_SAFE_INTEGER===v.max && 2===v.fig && 'trunc'===v.roundMethodName && '-123.45'===`${v}`;
    });
    a.t(()=>{
        const v = Obs.T.trunc([-123.456, 2]);
        return v instanceof Obs.C.TruncFloat && -123.456===v.value && !v.naned && !v.infinited && !v.unsafed && !v.unsigned && Number.MIN_SAFE_INTEGER===v.min && Number.MAX_SAFE_INTEGER===v.max && 2===v.fig && 'trunc'===v.roundMethodName && '-123.45'===`${v}`;
    });
    a.t(()=>{
        const v = Obs.T.trunc([-123.455, 2]);
        return v instanceof Obs.C.TruncFloat && -123.455===v.value && !v.naned && !v.infinited && !v.unsafed && !v.unsigned && Number.MIN_SAFE_INTEGER===v.min && Number.MAX_SAFE_INTEGER===v.max && 2===v.fig && 'trunc'===v.roundMethodName && '-123.45'===`${v}`;
    });
    a.t(()=>{
        const v = Obs.T.trunc([-123.465, 2]);
        return v instanceof Obs.C.TruncFloat && -123.465===v.value && !v.naned && !v.infinited && !v.unsafed && !v.unsigned && Number.MIN_SAFE_INTEGER===v.min && Number.MAX_SAFE_INTEGER===v.max && 2===v.fig && 'trunc'===v.roundMethodName && '-123.46'===`${v}`;
    });
    a.t(()=>{
        const v = Obs.T.trunc([-123.475, 2]);
        return v instanceof Obs.C.TruncFloat && -123.475===v.value && !v.naned && !v.infinited && !v.unsafed && !v.unsigned && Number.MIN_SAFE_INTEGER===v.min && Number.MAX_SAFE_INTEGER===v.max && 2===v.fig && 'trunc'===v.roundMethodName && '-123.47'===`${v}`;
    });
    a.t(()=>{
        const v = Obs.T.trunc([-123.454, 2]);
        return v instanceof Obs.C.TruncFloat && -123.454===v.value && !v.naned && !v.infinited && !v.unsafed && !v.unsigned && Number.MIN_SAFE_INTEGER===v.min && Number.MAX_SAFE_INTEGER===v.max && 2===v.fig && 'trunc'===v.roundMethodName && '-123.45'===`${v}`;
    });

    // TruncFloat
    a.t(()=>{
        const v = Obs.T.trunc();
        return v instanceof Obs.C.TruncFloat && 0===v.value && !v.naned && !v.infinited && !v.unsafed && !v.unsigned && Number.MIN_SAFE_INTEGER===v.min && Number.MAX_SAFE_INTEGER===v.max && 0===v.fig && 'trunc'===v.roundMethodName && '0'===`${v}`;
    });
    a.t(()=>{
        const v = Obs.T.trunc([-123, 0]);
        return v instanceof Obs.C.TruncFloat && -123===v.value && !v.naned && !v.infinited && !v.unsafed && !v.unsigned && Number.MIN_SAFE_INTEGER===v.min && Number.MAX_SAFE_INTEGER===v.max && 0===v.fig && 'trunc'===v.roundMethodName && '-123'===`${v}`;
    });
    a.t(()=>{
        const v = Obs.T.trunc([-123, 1]);
        return v instanceof Obs.C.TruncFloat && -123===v.value && !v.naned && !v.infinited && !v.unsafed && !v.unsigned && Number.MIN_SAFE_INTEGER===v.min && Number.MAX_SAFE_INTEGER===v.max && 1===v.fig && 'trunc'===v.roundMethodName && '-123.0'===`${v}`;
    });
    a.t(()=>{
        const v = Obs.T.trunc([-123, 2]);
        return v instanceof Obs.C.TruncFloat && -123===v.value && !v.naned && !v.infinited && !v.unsafed && !v.unsigned && Number.MIN_SAFE_INTEGER===v.min && Number.MAX_SAFE_INTEGER===v.max && 2===v.fig && 'trunc'===v.roundMethodName && '-123.00'===`${v}`;
    });
    a.t(()=>{
        const v = Obs.T.trunc([-123.4, 2]);
        console.log(`v:${v}`); // -123.41 記入していない部分はゼロにして欲しいが、IEEE754仕様による誤差が生じるため、こうなってしまう。
        return v instanceof Obs.C.TruncFloat && -123.4===v.value && !v.naned && !v.infinited && !v.unsafed && !v.unsigned && Number.MIN_SAFE_INTEGER===v.min && Number.MAX_SAFE_INTEGER===v.max && 2===v.fig && 'trunc'===v.roundMethodName && '-123.40'===`${v}`;
    });
    a.t(()=>{
        const v = Obs.T.trunc([-123.45, 2]);
        console.log(`v:${v}`); // -123.46 記入していない部分はゼロにして欲しいが、IEEE754仕様による誤差が生じるため、こうなってしまう。
        return v instanceof Obs.C.TruncFloat && -123.45===v.value && !v.naned && !v.infinited && !v.unsafed && !v.unsigned && Number.MIN_SAFE_INTEGER===v.min && Number.MAX_SAFE_INTEGER===v.max && 2===v.fig && 'trunc'===v.roundMethodName && '-123.45'===`${v}`;
    });
    a.t(()=>{
        const v = Obs.T.trunc([-123.456, 2]);
        return v instanceof Obs.C.TruncFloat && -123.456===v.value && !v.naned && !v.infinited && !v.unsafed && !v.unsigned && Number.MIN_SAFE_INTEGER===v.min && Number.MAX_SAFE_INTEGER===v.max && 2===v.fig && 'trunc'===v.roundMethodName && '-123.45'===`${v}`;
    });
    a.t(()=>{
        const v = Obs.T.trunc([-123.455, 2]);
        return v instanceof Obs.C.TruncFloat && -123.455===v.value && !v.naned && !v.infinited && !v.unsafed && !v.unsigned && Number.MIN_SAFE_INTEGER===v.min && Number.MAX_SAFE_INTEGER===v.max && 2===v.fig && 'trunc'===v.roundMethodName && '-123.45'===`${v}`;
    });
    a.t(()=>{
        const v = Obs.T.trunc([-123.465, 2]);
        return v instanceof Obs.C.TruncFloat && -123.465===v.value && !v.naned && !v.infinited && !v.unsafed && !v.unsigned && Number.MIN_SAFE_INTEGER===v.min && Number.MAX_SAFE_INTEGER===v.max && 2===v.fig && 'trunc'===v.roundMethodName && '-123.46'===`${v}`;
    });
    a.t(()=>{
        const v = Obs.T.trunc([-123.475, 2]);
        return v instanceof Obs.C.TruncFloat && -123.475===v.value && !v.naned && !v.infinited && !v.unsafed && !v.unsigned && Number.MIN_SAFE_INTEGER===v.min && Number.MAX_SAFE_INTEGER===v.max && 2===v.fig && 'trunc'===v.roundMethodName && '-123.47'===`${v}`;
    });
    a.t(()=>{
        const v = Obs.T.trunc([-123.454, 2]);
        return v instanceof Obs.C.TruncFloat && -123.454===v.value && !v.naned && !v.infinited && !v.unsafed && !v.unsigned && Number.MIN_SAFE_INTEGER===v.min && Number.MAX_SAFE_INTEGER===v.max && 2===v.fig && 'trunc'===v.roundMethodName && '-123.45'===`${v}`;
    });

    // AllInt
    a.t(()=>{
        const v = Obs.T.aint();
        return v instanceof Obs.C.AllInteger && 0===v.value && !v.naned && !v.infinited && !v.unsafed && !v.unsigned && Number.MIN_SAFE_INTEGER===v.min && Number.MAX_SAFE_INTEGER===v.max && 0===v.bit;
    });
    a.t(()=>{
        const v = Obs.T.aint(123);
        return v instanceof Obs.C.AllInteger && 123===v.value && !v.naned && !v.infinited && !v.unsafed && !v.unsigned && Number.MIN_SAFE_INTEGER===v.min && Number.MAX_SAFE_INTEGER===v.max && 0===v.bit;
    });
    a.e(TypeError, `非安全な整数値は許可されておらず代入できません。unsafed=trueにしてください。`, ()=>Obs.T.aint(Number.MAX_SAFE_INTEGER+1));
    a.t(()=>{
        const v = Obs.T.aint(Number.MAX_SAFE_INTEGER+1, true);
        return v instanceof Obs.C.AllInteger && Number.MAX_SAFE_INTEGER+1===v.value && !v.naned && !v.infinited &&  v.unsafed && !v.unsigned && -Number.MAX_VALUE===v.min && Number.MAX_VALUE===v.max && 0===v.bit;
    });
    a.t(()=>{
        const v = Obs.T.aint(Number.MAX_SAFE_INTEGER+1, true, true);
        return v instanceof Obs.C.AllInteger && Number.MAX_SAFE_INTEGER+1===v.value && !v.naned && !v.infinited &&  v.unsafed &&  v.unsigned && 0===v.min && Number.MAX_VALUE===v.max && 0===v.bit;
    });
    a.e(RangeError, `valueがmin〜maxの範囲を超過しています。:value:-1, min:0, max:1.7976931348623157e+308`, ()=>Obs.T.aint(-1, true, true));
    a.e(RangeError, `valueがmin〜maxの範囲を超過しています。:value:1, min:-1, max:0`, ()=>Obs.T.aint(1, false, false, 1));
    a.t(()=>{
        const v = Obs.T.aint(0, false, false, 1);
        return v instanceof Obs.C.AllInteger && 0===v.value && !v.naned && !v.infinited && !v.unsafed && !v.unsigned && -1===v.min && 0===v.max && 1===v.bit;
    });
    a.t(()=>{
        const v = Obs.T.aint(-1, false, false, 1);
        return v instanceof Obs.C.AllInteger && -1===v.value && !v.naned && !v.infinited && !v.unsafed && !v.unsigned && -1===v.min && 0===v.max && 1===v.bit;
    });
    a.t(()=>{
        const v = Obs.T.aint(0, false, true, 1);
        return v instanceof Obs.C.AllInteger && 0===v.value && !v.naned && !v.infinited && !v.unsafed &&  v.unsigned && 0===v.min && 1===v.max && 1===v.bit;
    });
    a.t(()=>{
        const v = Obs.T.aint(1, false, true, 1);
        return v instanceof Obs.C.AllInteger && 1===v.value && !v.naned && !v.infinited && !v.unsafed &&  v.unsigned && 0===v.min && 1===v.max && 1===v.bit;
    });
    a.e(RangeError, `valueがmin〜maxの範囲を超過しています。:value:-1, min:0, max:1`, ()=>Obs.T.aint(-1, false, true, 1));
    a.e(RangeError, `valueがmin〜maxの範囲を超過しています。:value:2, min:0, max:1`, ()=>Obs.T.aint(2, false, true, 1));
    a.t(()=>{
        const v = Obs.T.aint(0, false, true, 2);
        return v instanceof Obs.C.AllInteger && 0===v.value && !v.naned && !v.infinited && !v.unsafed &&  v.unsigned && 0===v.min && 3===v.max && 2===v.bit;
    });
    a.t(()=>{
        const v = Obs.T.aint(0, false, true, 3);
        return v instanceof Obs.C.AllInteger && 0===v.value && !v.naned && !v.infinited && !v.unsafed &&  v.unsigned && 0===v.min && (2**3-1)===v.max && 3===v.bit;
    });
    a.t(()=>{
        const bit = 4;
        const v = Obs.T.aint(0, false, true, bit);
        return v instanceof Obs.C.AllInteger && 0===v.value && !v.naned && !v.infinited && !v.unsafed &&  v.unsigned && 0===v.min && (2**bit-1)===v.max && bit===v.bit;
    });
    a.t(()=>{
        const bit = 8;
        const v = Obs.T.aint(0, false, true, bit);
        return v instanceof Obs.C.AllInteger && 0===v.value && !v.naned && !v.infinited && !v.unsafed &&  v.unsigned && 0===v.min && (2**bit-1)===v.max && bit===v.bit;
    });
    a.t(()=>{
        const bit = 16;
        const v = Obs.T.aint(0, false, true, bit);
        return v instanceof Obs.C.AllInteger && 0===v.value && !v.naned && !v.infinited && !v.unsafed &&  v.unsigned && 0===v.min && (2**bit-1)===v.max && bit===v.bit;
    });
    a.t(()=>{
        const bit = 32;
        const v = Obs.T.aint(0, false, true, bit);
        return v instanceof Obs.C.AllInteger && 0===v.value && !v.naned && !v.infinited && !v.unsafed &&  v.unsigned && 0===v.min && (2**bit-1)===v.max && bit===v.bit;
    });
    a.t(()=>{
        const bit = 53;
        const v = Obs.T.aint(0, false, true, bit);
        return v instanceof Obs.C.AllInteger && 0===v.value && !v.naned && !v.infinited && !v.unsafed &&  v.unsigned && 0===v.min && (2**bit-1)===v.max && bit===v.bit;
    });
    a.e(TypeError, `bitは0〜53までのNumber型整数値であるべきです。:bit:54`, ()=>Obs.T.aint(0, false, true, 54));
    a.e(TypeError, `bitは0〜53までのNumber型整数値であるべきです。:bit:0.1`, ()=>Obs.T.aint(0, false, true, 0.1));
    a.t(()=>{
        const v = Obs.T.aint(3, false, true, 0, 2, 8);
        return v instanceof Obs.C.AllInteger && 3===v.value && !v.naned && !v.infinited && !v.unsafed &&  v.unsigned && 2===v.min && 8===v.max && 0===v.bit;
    });
    a.e(RangeError, `maxがunsafed,unsigned,bitで指定した範囲外です。max:8,unsafed:false,unsigned:true,bit:1 = 1`, ()=>Obs.T.aint(3, false, true, 1, 2, 8));
    a.e(RangeError, `maxがunsafed,unsigned,bitで指定した範囲外です。max:8,unsafed:false,unsigned:true,bit:1 = 1`, ()=>Obs.T.aint(3, false, true, 1, 1, 8));
    a.e(RangeError, `maxがunsafed,unsigned,bitで指定した範囲外です。max:8,unsafed:false,unsigned:true,bit:1 = 1`, ()=>Obs.T.aint(3, false, true, 1, 0, 8));
    a.e(RangeError, `maxがunsafed,unsigned,bitで指定した範囲外です。max:2,unsafed:false,unsigned:true,bit:1 = 1`, ()=>Obs.T.aint(3, false, true, 1, 0, 2));

    a.e(RangeError, `minとmaxが不正です。両者は異なる値にしつつ大小関係を名前と一致させてください。:2,1`, ()=>Obs.T.aint(3, false, true, 1, 2, 1));
    a.e(RangeError, `minとmaxが不正です。両者は異なる値にしつつ大小関係を名前と一致させてください。:1,1`, ()=>Obs.T.aint(3, false, true, 1, 1, 1));
    a.e(RangeError, `valueがmin〜maxの範囲を超過しています。:value:3, min:0, max:1`, ()=>Obs.T.aint(3, false, true, 1, 0, 1));
    a.e(RangeError, `minがunsafed,unsigned,bitで指定した範囲外です。min:-1,unsafed:false,unsigned:true,bit:1 = 0`, ()=>Obs.T.aint(3, false, true, 1, -1, 1));

    a.e(RangeError, `valueがmin〜maxの範囲を超過しています。:value:2, min:0, max:1`, ()=>Obs.T.aint(2, false, true, 1, 0, 1));
    a.t(()=>{
        const v = Obs.T.aint(0, false, true, 1, 0, 1);
        return v instanceof Obs.C.AllInteger && 0===v.value && !v.naned && !v.infinited && !v.unsafed &&  v.unsigned && 0===v.min && 1===v.max && 1===v.bit;
    });
    // Int系は引数が少ないため{}options引数を使わないこととする。AllIntでなく省略形ui8等の使用を推奨する。
    /*
    a.t(()=>{
        const v = Obs.T.aint({value:123});
        return v instanceof Obs.C.AllInteger && 123===v.value && !v.naned && !v.infinited && !v.unsafed && !v.unsigned && Number.MIN_SAFE_INTEGER===v.min && Number.MAX_SAFE_INTEGER===v.max && 0===v.bit;
    });
    */
    // Integer
    a.t(()=>{
        const v = Obs.T.int();
        return v instanceof Obs.C.Integer && 0===v.value && !v.naned && !v.infinited && !v.unsafed && !v.unsigned && Number.MIN_SAFE_INTEGER===v.min && Number.MAX_SAFE_INTEGER===v.max && 0===v.bit;
    });
    a.t(()=>{
        const v = Obs.T.int(123);
        return v instanceof Obs.C.Integer && 123===v.value && !v.naned && !v.infinited && !v.unsafed && !v.unsigned && Number.MIN_SAFE_INTEGER===v.min && Number.MAX_SAFE_INTEGER===v.max && 0===v.bit;
    });
    a.e(TypeError, `非安全な整数値は許可されておらず代入できません。unsafed=trueにしてください。`, ()=>Obs.T.int(Number.MIN_SAFE_INTEGER-1));
    a.e(TypeError, `非安全な整数値は許可されておらず代入できません。unsafed=trueにしてください。`, ()=>Obs.T.int(Number.MAX_SAFE_INTEGER+1));
    a.t(()=>{
        const v = Obs.T.int(Number.MIN_SAFE_INTEGER);
        return v instanceof Obs.C.Integer && Number.MIN_SAFE_INTEGER===v.value && !v.naned && !v.infinited && !v.unsafed && !v.unsigned && Number.MIN_SAFE_INTEGER===v.min && Number.MAX_SAFE_INTEGER===v.max && 0===v.bit;
    });
    a.t(()=>{
        const v = Obs.T.int(Number.MAX_SAFE_INTEGER);
        return v instanceof Obs.C.Integer && Number.MAX_SAFE_INTEGER===v.value && !v.naned && !v.infinited && !v.unsafed && !v.unsigned && Number.MIN_SAFE_INTEGER===v.min && Number.MAX_SAFE_INTEGER===v.max && 0===v.bit;
    });
    a.e(TypeError, `bitは0〜53までのNumber型整数値であるべきです。:bit:-1`, ()=>Obs.T.int(0, -1));
    a.e(TypeError, `bitは0〜53までのNumber型整数値であるべきです。:bit:54`, ()=>Obs.T.int(0, 54));
    a.t(()=>{
        const v = Obs.T.int(0, 0);
        return v instanceof Obs.C.Integer && 0===v.value && !v.naned && !v.infinited && !v.unsafed && !v.unsigned && Number.MIN_SAFE_INTEGER===v.min && Number.MAX_SAFE_INTEGER===v.max && 0===v.bit;
    });
    a.t(()=>{
        const v = Obs.T.int(0, 1);
        return v instanceof Obs.C.Integer && 0===v.value && !v.naned && !v.infinited && !v.unsafed && !v.unsigned && -1===v.min && 0===v.max && 1===v.bit;
    });
    a.t(()=>{
        const v = Obs.T.int(0, 53);
        return v instanceof Obs.C.Integer && 0===v.value && !v.naned && !v.infinited && !v.unsafed && !v.unsigned && -4503599627370496===v.min && 4503599627370495===v.max && 53===v.bit;
    });
    a.e(RangeError, `valueがmin〜maxの範囲を超過しています。:value:1, min:2, max:8`, ()=>Obs.T.int(1, 53, 2, 8));
    a.e(RangeError, `valueがmin〜maxの範囲を超過しています。:value:9, min:2, max:8`, ()=>Obs.T.int(9, 53, 2, 8));
    a.t(()=>{
        const v = Obs.T.int(3, 53, 2, 8);
        return v instanceof Obs.C.Integer && 3===v.value && !v.naned && !v.infinited && !v.unsafed && !v.unsigned && 2===v.min && 8===v.max && 53===v.bit;
    });

    // UnsignedInteger
    a.t(()=>{
        const v = Obs.T.uint();
        return v instanceof Obs.C.UnsignedInteger && 0===v.value && !v.naned && !v.infinited && !v.unsafed &&  v.unsigned && 0===v.min && Number.MAX_SAFE_INTEGER===v.max && 0===v.bit;
    });
    a.t(()=>{
        const v = Obs.T.uint(123);
        return v instanceof Obs.C.UnsignedInteger && 123===v.value && !v.naned && !v.infinited && !v.unsafed &&  v.unsigned && 0===v.min && Number.MAX_SAFE_INTEGER===v.max && 0===v.bit;
    });
    a.e(TypeError, `非安全な整数値は許可されておらず代入できません。unsafed=trueにしてください。`, ()=>Obs.T.uint(Number.MIN_SAFE_INTEGER-1));
    a.e(TypeError, `非安全な整数値は許可されておらず代入できません。unsafed=trueにしてください。`, ()=>Obs.T.uint(Number.MAX_SAFE_INTEGER+1));
    a.e(RangeError, `valueがmin〜maxの範囲を超過しています。:value:-9007199254740991, min:0, max:9007199254740991`, ()=>Obs.T.uint(Number.MIN_SAFE_INTEGER));
    a.e(RangeError, `valueがmin〜maxの範囲を超過しています。:value:-1, min:0, max:9007199254740991`, ()=>Obs.T.uint(-1));
    a.t(()=>{
        const v = Obs.T.uint(0);
        return v instanceof Obs.C.UnsignedInteger && 0===v.value && !v.naned && !v.infinited && !v.unsafed &&  v.unsigned && 0===v.min && Number.MAX_SAFE_INTEGER===v.max && 0===v.bit;
    });
    a.t(()=>{
        const v = Obs.T.uint(Number.MAX_SAFE_INTEGER);
        return v instanceof Obs.C.UnsignedInteger && Number.MAX_SAFE_INTEGER===v.value && !v.naned && !v.infinited && !v.unsafed &&  v.unsigned && 0===v.min && Number.MAX_SAFE_INTEGER===v.max && 0===v.bit;
    });
    a.e(TypeError, `bitは0〜53までのNumber型整数値であるべきです。:bit:-1`, ()=>Obs.T.uint(0, -1));
    a.e(TypeError, `bitは0〜53までのNumber型整数値であるべきです。:bit:54`, ()=>Obs.T.uint(0, 54));
    a.t(()=>{
        const v = Obs.T.uint(0, 0);
        return v instanceof Obs.C.UnsignedInteger && 0===v.value && !v.naned && !v.infinited && !v.unsafed &&  v.unsigned && 0===v.min && Number.MAX_SAFE_INTEGER===v.max && 0===v.bit;
    });
    a.t(()=>{
        const v = Obs.T.uint(0, 1);
        return v instanceof Obs.C.UnsignedInteger && 0===v.value && !v.naned && !v.infinited && !v.unsafed &&  v.unsigned && 0===v.min && 1===v.max && 1===v.bit;
    });
    a.t(()=>{
        const v = Obs.T.uint(0, 53);
        return v instanceof Obs.C.UnsignedInteger && 0===v.value && !v.naned && !v.infinited && !v.unsafed &&  v.unsigned && 0===v.min && Number.MAX_SAFE_INTEGER===v.max && 53===v.bit;
    });
    a.e(RangeError, `valueがmin〜maxの範囲を超過しています。:value:1, min:2, max:8`, ()=>Obs.T.uint(1, 53, 2, 8));
    a.e(RangeError, `valueがmin〜maxの範囲を超過しています。:value:9, min:2, max:8`, ()=>Obs.T.uint(9, 53, 2, 8));
    a.t(()=>{
        const v = Obs.T.uint(3, 53, 2, 8);
        return v instanceof Obs.C.UnsignedInteger && 3===v.value && !v.naned && !v.infinited && !v.unsafed &&  v.unsigned && 2===v.min && 8===v.max && 53===v.bit;
    });

    // RangedBigInteger
    a.t(()=>{
        const v = Obs.T.rbInt();
        return v instanceof Obs.C.RangedBigInteger && 0n===v.value && !v.unsigned && 64n===v.bit && -9223372036854775808n===v.min && 9223372036854775807n===v.max;
    });
    a.e(TypeError, `valueはBigInt型リテラル値であるべきです。:1`, ()=>Obs.T.rbInt(1));
    a.t(()=>{
        const v = Obs.T.rbInt(1n);
        return v instanceof Obs.C.RangedBigInteger && 1n===v.value && !v.unsigned && 64n===v.bit && -9223372036854775808n===v.min && 9223372036854775807n===v.max;
    });
    a.t(()=>{
        const v = Obs.T.rbInt(-1n);
        return v instanceof Obs.C.RangedBigInteger && -1n===v.value && !v.unsigned && 64n===v.bit && -9223372036854775808n===v.min && 9223372036854775807n===v.max;
    });
    a.t(()=>{
        const v = Obs.T.rbInt(-1n, false);
        return v instanceof Obs.C.RangedBigInteger && -1n===v.value && !v.unsigned && 64n===v.bit && -9223372036854775808n===v.min && 9223372036854775807n===v.max;
    });
    a.e(RangeError, `valueはmin〜maxの範囲外です。:value:9223372036854775808, min:-9223372036854775808, max:9223372036854775807`, ()=>Obs.T.rbInt(9223372036854775808n));
    a.e(RangeError, `valueはmin〜maxの範囲外です。:value:-9223372036854775809, min:-9223372036854775808, max:9223372036854775807`, ()=>Obs.T.rbInt(-9223372036854775809n));
    a.e(RangeError, `valueはmin〜maxの範囲外です。:value:-1, min:0, max:18446744073709551615`, ()=>Obs.T.rbInt(-1n, true));
    a.e(RangeError, `valueはmin〜maxの範囲外です。:value:18446744073709551616, min:0, max:18446744073709551615`, ()=>Obs.T.rbInt(18446744073709551616n, true));
    a.t(()=>{
        const v = Obs.T.rbInt(0n, true);
        return v instanceof Obs.C.RangedBigInteger && 0n===v.value &&  v.unsigned && 64n===v.bit && 0n===v.min && 18446744073709551615n===v.max;
    });
    a.e(TypeError, `unsignedはBoolean型リテラル値であるべきです。:53`, ()=>Obs.T.rbInt(1n, 53));
    a.e(TypeError, `bitがNumber型なら53より大きくNumber.isSafeInteger()な値であるべきです。53以下ならNumber継承整数型Integerを使用してください。53`, ()=>Obs.T.rbInt(1n, false, 53));
    a.e(TypeError, `bitがNumber型なら53より大きくNumber.isSafeInteger()な値であるべきです。53以下ならNumber継承整数型Integerを使用してください。53`, ()=>Obs.T.rbInt(1n, true, 53));
    a.t(()=>{
        const v = Obs.T.rbInt(-1n, false, 64, -10n, 10n);
        return v instanceof Obs.C.RangedBigInteger && -1n===v.value && !v.unsigned && 64n===v.bit && -10n===v.min && 10n===v.max;
    });
    a.t(()=>{
        const v = Obs.T.rbInt(-1n, false, 128);
        return v instanceof Obs.C.RangedBigInteger && -1n===v.value && !v.unsigned && 128n===v.bit && -170141183460469231731687303715884105728n===v.min && 170141183460469231731687303715884105727n===v.max;
    });

    // ui8等のInt省略形
    a.t(()=>{
        const v = Obs.T.i8();
        return v instanceof Obs.C.Integer && 0===v.value && !v.naned && !v.infinited && !v.unsafed && !v.unsigned && -128===v.min && 127===v.max && 8===v.bit;
    });
    a.t(()=>{
        const v = Obs.T.i8(-128);
        return v instanceof Obs.C.Integer && -128===v.value && !v.naned && !v.infinited && !v.unsafed && !v.unsigned && -128===v.min && 127===v.max && 8===v.bit;
    });
    a.t(()=>{
        const v = Obs.T.i8(127);
        return v instanceof Obs.C.Integer && 127===v.value && !v.naned && !v.infinited && !v.unsafed && !v.unsigned && -128===v.min && 127===v.max && 8===v.bit;
    });
    a.e(RangeError, `valueがmin〜maxの範囲を超過しています。:value:-129, min:-128, max:127`, ()=>Obs.T.i8(-129));
    a.e(RangeError, `valueがmin〜maxの範囲を超過しています。:value:128, min:-128, max:127`, ()=>Obs.T.i8(128));
    a.e(RangeError, `minがunsafed,unsigned,bitで指定した範囲外です。min:-129,unsafed:false,unsigned:false,bit:8 = -128`, ()=>Obs.T.i8(0, -129));
    a.e(RangeError, `minとmaxが不正です。両者は異なる値にしつつ大小関係を名前と一致させてください。:128,127`, ()=>Obs.T.i8(0, 128));
    a.e(RangeError, `maxがunsafed,unsigned,bitで指定した範囲外です。max:128,unsafed:false,unsigned:false,bit:8 = 127`, ()=>Obs.T.i8(0, -128, 128));
    a.t(()=>{
        const v = Obs.T.i8(0, 0, 1);
        return v instanceof Obs.C.Integer && 0===v.value && !v.naned && !v.infinited && !v.unsafed && !v.unsigned && 0===v.min && 1===v.max && 8===v.bit;
    });
    a.e(RangeError, `valueがmin〜maxの範囲を超過しています。:value:2, min:0, max:1`, ()=>{
        const v = Obs.T.i8(0, 0, 1);
        v.value = 2;
    });
    a.t(()=>{
        const v = Obs.T.i8(0, 0, 1);
        v.value = 1;
        return v instanceof Obs.C.Integer && 1===v.value && !v.naned && !v.infinited && !v.unsafed && !v.unsigned && 0===v.min && 1===v.max && 8===v.bit;
    });
    a.t(()=>{
        const v = Obs.T.i16();
        return v instanceof Obs.C.Integer && 0===v.value && !v.naned && !v.infinited && !v.unsafed && !v.unsigned && -32768===v.min && 32767===v.max && 16===v.bit;
    });
    a.t(()=>{
        const v = Obs.T.i32();
        return v instanceof Obs.C.Integer && 0===v.value && !v.naned && !v.infinited && !v.unsafed && !v.unsigned && -2147483648===v.min && 2147483647===v.max && 32===v.bit;
    });
    a.t(()=>{
        const v = Obs.T.i53();
        return v instanceof Obs.C.Integer && 0===v.value && !v.naned && !v.infinited && !v.unsafed && !v.unsigned && -4503599627370496===v.min && 4503599627370495===v.max && 53===v.bit;
    });

    // unsigned系int
    a.t(()=>{
        const v = Obs.T.u8();
        return v instanceof Obs.C.UnsignedInteger && 0===v.value && !v.naned && !v.infinited && !v.unsafed &&  v.unsigned && 0===v.min && 255===v.max && 8===v.bit;
    });
    a.t(()=>{
        const v = Obs.T.u8(0);
        return v instanceof Obs.C.UnsignedInteger && 0===v.value && !v.naned && !v.infinited && !v.unsafed &&  v.unsigned && 0===v.min && 255===v.max && 8===v.bit;
    });
    a.t(()=>{
        const v = Obs.T.u8(255);
        return v instanceof Obs.C.UnsignedInteger && 255===v.value && !v.naned && !v.infinited && !v.unsafed &&  v.unsigned && 0===v.min && 255===v.max && 8===v.bit;
    });
    a.e(RangeError, `valueがmin〜maxの範囲を超過しています。:value:-1, min:0, max:255`, ()=>Obs.T.u8(-1));
    a.e(RangeError, `valueがmin〜maxの範囲を超過しています。:value:256, min:0, max:255`, ()=>Obs.T.u8(256));
    a.e(RangeError, `minがunsafed,unsigned,bitで指定した範囲外です。min:-1,unsafed:false,unsigned:true,bit:8 = 0`, ()=>Obs.T.u8(0, -1));
    a.e(RangeError, `minとmaxが不正です。両者は異なる値にしつつ大小関係を名前と一致させてください。:256,255`, ()=>Obs.T.u8(0, 256));
    a.e(RangeError, `minがunsafed,unsigned,bitで指定した範囲外です。min:-1,unsafed:false,unsigned:true,bit:8 = 0`, ()=>Obs.T.u8(0, -1, 256));
    a.e(RangeError, `maxがunsafed,unsigned,bitで指定した範囲外です。max:256,unsafed:false,unsigned:true,bit:8 = 255`, ()=>Obs.T.u8(0, 0, 256));
    a.t(()=>{
        const v = Obs.T.u8(0, 0, 1);
        return v instanceof Obs.C.UnsignedInteger && 0===v.value && !v.naned && !v.infinited && !v.unsafed &&  v.unsigned && 0===v.min && 1===v.max && 8===v.bit;
    });
    a.e(RangeError, `valueがmin〜maxの範囲を超過しています。:value:2, min:0, max:1`, ()=>{
        const v = Obs.T.u8(0, 0, 1);
        v.value = 2;
    });
    a.t(()=>{
        const v = Obs.T.u8(0, 0, 1);
        v.value = 1;
        return v instanceof Obs.C.UnsignedInteger && 1===v.value && !v.naned && !v.infinited && !v.unsafed &&  v.unsigned && 0===v.min && 1===v.max && 8===v.bit;
    });
    a.t(()=>{
        const v = Obs.T.u16();
        return v instanceof Obs.C.UnsignedInteger && 0===v.value && !v.naned && !v.infinited && !v.unsafed &&  v.unsigned && 0===v.min && 65535===v.max && 16===v.bit;
    });
    a.t(()=>{
        const v = Obs.T.u32();
        return v instanceof Obs.C.UnsignedInteger && 0===v.value && !v.naned && !v.infinited && !v.unsafed &&  v.unsigned && 0===v.min && 4294967295===v.max && 32===v.bit;
    });
    a.t(()=>{
        const v = Obs.T.u53();
        return v instanceof Obs.C.UnsignedInteger && 0===v.value && !v.naned && !v.infinited && !v.unsafed &&  v.unsigned && 0===v.min && 9007199254740991===v.max && 53===v.bit;
    });

    // RangedBigInteger省略形
    a.t(()=>{
        const v = Obs.T.i64();
        return v instanceof Obs.C.RangedBigInteger && 0n===v.value && !v.unsigned && -9223372036854775808n===v.min && 9223372036854775807n===v.max && 64n===v.bit;
    });
    a.t(()=>{
        const v = Obs.T.i64(0n);
        return v instanceof Obs.C.RangedBigInteger && 0n===v.value && !v.unsigned && -9223372036854775808n===v.min && 9223372036854775807n===v.max && 64n===v.bit;
    });
    a.t(()=>{
        const v = Obs.T.i64(1n);
        return v instanceof Obs.C.RangedBigInteger && 1n===v.value && !v.unsigned && -9223372036854775808n===v.min && 9223372036854775807n===v.max && 64n===v.bit;
    });
    a.t(()=>{
        const v = Obs.T.i64(-1n);
        return v instanceof Obs.C.RangedBigInteger && -1n===v.value && !v.unsigned && -9223372036854775808n===v.min && 9223372036854775807n===v.max && 64n===v.bit;
    });
    a.t(()=>{
        const v = Obs.T.i64(-9223372036854775808n);
        return v instanceof Obs.C.RangedBigInteger && -9223372036854775808n===v.value && !v.unsigned && -9223372036854775808n===v.min && 9223372036854775807n===v.max && 64n===v.bit;
    });
    a.t(()=>{
        const v = Obs.T.i64(9223372036854775807n);
        return v instanceof Obs.C.RangedBigInteger && 9223372036854775807n===v.value && !v.unsigned && -9223372036854775808n===v.min && 9223372036854775807n===v.max && 64n===v.bit;
    });
    a.e(TypeError, `valueはBigInt型リテラル値であるべきです。:0`, ()=>Obs.T.i64(0));
    a.e(RangeError, `valueはmin〜maxの範囲外です。:value:-9223372036854775809, min:-9223372036854775808, max:9223372036854775807`, ()=>Obs.T.i64(-9223372036854775809n));
    a.e(RangeError, `valueはmin〜maxの範囲外です。:value:9223372036854775808, min:-9223372036854775808, max:9223372036854775807`, ()=>Obs.T.i64(9223372036854775808n));
    a.e(RangeError, `minがunsigned,bitで指定した範囲外です。min:-9223372036854775809,unsigned:false,bit:64 = -9223372036854775808`, ()=>Obs.T.i64(0n, -9223372036854775809n));
    a.e(RangeError, `valueはmin〜maxの範囲外です。:value:0, min:256, max:9223372036854775807`, ()=>Obs.T.i64(0n, 256n));
    a.e(RangeError, `minがunsigned,bitで指定した範囲外です。min:-9223372036854775809,unsigned:false,bit:64 = -9223372036854775808`, ()=>Obs.T.i64(0n, -9223372036854775809n, 256n));
    a.e(RangeError, `maxがunsigned,bitで指定した範囲外です。max:9223372036854775808,unsigned:false,bit:64 = 9223372036854775807`, ()=>Obs.T.i64(0n, -9223372036854775808n, 9223372036854775808n));
    a.t(()=>{
        const v = Obs.T.i64(-1n, -10n, 10n);
        return v instanceof Obs.C.RangedBigInteger && -1n===v.value && !v.unsigned && -10n===v.min && 10n===v.max && 64n===v.bit;
    });
    a.e(RangeError, `valueはmin〜maxの範囲外です。:value:-11, min:-10, max:10`, ()=>{
        const v = Obs.T.i64(-1n, -10n, 10n);
        v.value = -11n;
    });
    a.t(()=>{
        const v = Obs.T.i64(-1n, -10n, 10n);
        v.value = -9n;
        return v instanceof Obs.C.RangedBigInteger && -9n===v.value && !v.unsigned && -10n===v.min && 10n===v.max && 64n===v.bit;
    });

    // u64
    a.t(()=>{
        const v = Obs.T.u64();
        return v instanceof Obs.C.RangedBigInteger && 0n===v.value &&  v.unsigned && 0n===v.min && 18446744073709551615n===v.max && 64n===v.bit;
    });
    a.t(()=>{
        const v = Obs.T.u64(0n);
        return v instanceof Obs.C.RangedBigInteger && 0n===v.value &&  v.unsigned && 0n===v.min && 18446744073709551615n===v.max && 64n===v.bit;
    });
    a.t(()=>{
        const v = Obs.T.u64(1n);
        return v instanceof Obs.C.RangedBigInteger && 1n===v.value &&  v.unsigned && 0n===v.min && 18446744073709551615n===v.max && 64n===v.bit;
    });
    a.t(()=>{
        const v = Obs.T.u64(18446744073709551615n);
        console.log(v);
        return v instanceof Obs.C.RangedBigInteger && 18446744073709551615n===v.value &&  v.unsigned && 0n===v.min && 18446744073709551615n===v.max && 64n===v.bit;
    });
    a.e(TypeError, `valueはBigInt型リテラル値であるべきです。:0`, ()=>Obs.T.u64(0));
    a.e(RangeError, `valueはmin〜maxの範囲外です。:value:-1, min:0, max:18446744073709551615`, ()=>Obs.T.u64(-1n));
    a.e(RangeError, `valueはmin〜maxの範囲外です。:value:18446744073709551616, min:0, max:18446744073709551615`, ()=>Obs.T.u64(18446744073709551616n));
    a.e(RangeError, `minがunsigned,bitで指定した範囲外です。min:-1,unsigned:true,bit:64 = 0`, ()=>Obs.T.u64(0n, -1n));
    a.e(RangeError, `minとmaxが不正です。両者は異なる値にしつつ大小関係を名前と一致させてください。:18446744073709551615,18446744073709551615`, ()=>Obs.T.u64(0n, 18446744073709551615n));
    a.e(RangeError, `minとmaxが不正です。両者は異なる値にしつつ大小関係を名前と一致させてください。:18446744073709551616,18446744073709551615`, ()=>Obs.T.u64(0n, 18446744073709551616n));
    a.e(RangeError, `minがunsigned,bitで指定した範囲外です。min:-9223372036854775809,unsigned:true,bit:64 = 0`, ()=>Obs.T.u64(0n, -9223372036854775809n, 256n));
    a.e(RangeError, `maxがunsigned,bitで指定した範囲外です。max:18446744073709551616,unsigned:true,bit:64 = 18446744073709551615`, ()=>Obs.T.u64(0n, 0n, 18446744073709551616n));
    a.e(RangeError, `minがunsigned,bitで指定した範囲外です。min:-10,unsigned:true,bit:64 = 0`, ()=>Obs.T.u64(-1n, -10n, 10n));
    a.t(()=>{
        const v = Obs.T.u64(6n, 5n, 10n);
        console.log(v);
        return v instanceof Obs.C.RangedBigInteger && 6n===v.value &&  v.unsigned && 5n===v.min && 10n===v.max && 64n===v.bit;
    });
    a.e(RangeError, `valueはmin〜maxの範囲外です。:value:4, min:5, max:10`, ()=>{
        const v = Obs.T.u64(5n, 5n, 10n);
        v.value = 4n;
    });
    a.t(()=>{
        const v = Obs.T.u64(5n, 5n, 10n);
        v.value = 6n;
        console.log(v);
        return v instanceof Obs.C.RangedBigInteger && 6n===v.value &&  v.unsigned && 5n===v.min && 10n===v.max && 64n===v.bit;
    });

    // Base64系
    a.t(()=>{
        const b = Obs.U.Base.get('b16');
        const buffer = b.decode('ff');
        const base16 = b.encode(buffer);
        return 'ff'===base16;
    });
    a.t(()=>{
        const b = Obs.U.Base.get('b16');
        const base16 = b.encode(new Uint8Array([0xff]));
        const buffer = b.decode(base16);
        return 1===buffer.length && 0xff===buffer[0];
    });














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

