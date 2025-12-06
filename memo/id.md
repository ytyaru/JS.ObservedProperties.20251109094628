# ID

　乱数で一意となる識別子を自動生成する。

* TRNG:   真性乱数生成器(True Random Number Generator)
* PRNG:   疑似乱数生成器(Pseudo Random Number Generator)
* CSPRNG: 暗号論的疑似乱数生成器 暗号学的に安全な疑似乱数(Cryptographically Secure Pseudo Random Number Generator)

　既存のGID(Global ID)は以下。

* UUID(v1,v4,v7。v4:固定長:6bit+乱数:122bit)
* ULID(タイムスタンプ+乱数)
* CUID(固定値+タイムスタンプ+カウンター+ランダム)
* NanoID(固定:2bit+乱数:126bit)

　固定長ビットでタイムスタンプを永遠に使用できるようにする方法は？

* YYYY-MM-DD HH:MM:SS.MMM (4+2+2=8, 2+2+2+3=9, +6)を 年月日にする。年=Base64,月=Base12,日=Base32。  2025は2字に圧縮可   時分秒(Base24,60,60)
    * 年のビット数は増えていく。そこで固定長にしてオーバーフローする前提にする
        * 2025年を0とし一秒／一分／一時間／一日のいずれかの単位でインクリメントする（同日に作成された乱数を重複すれば完璧）



# 

```javascript
function calcLength(bit, radix) {// 入力ビット数と基数に基づいて、エンコード後の文字数を計算する（パディング含む）。
    if (radix < 2 || radix > 256) {throw new TypeError(`radixは2〜256のNumber型整数値であるべきです。`)}
    const bitsPerChar = Math.log2(radix); // 1文字あたりのビット数を計算
    return Math.ceil(bit / bitsPerChar); // 総ビット数を1文字あたりのビット数で割り、小数点以下を切り上げ。パディングを考慮するためMath.ceilを使用
}
```

2025年をBase64にすると2文字になる。
```javascript
calcLength(Math.ceil(Math.log2(2025)), 64); // 2
```
calcLength(Math.ceil(Math.log2(999)), 64); // 2


項|範囲|Base|最小桁数|最長桁数
--|----|----|--------|--------
年|0〜N|64|2|N
月|1〜12|16|1|1
日|1〜31|32|1|1
時|0〜23|24|1|1
分|0〜60|64|1|1
秒|0〜60|64|1|1
ms|0〜999|64|1|2
TZ|Z/±時分秒ms|[Z+-][時分秒ms]

項|範囲|Base|最小桁数|最長桁数
--|----|----|--------|--------
年|0〜N|64|2|N
月|1〜12|16|1|1
日|1〜31|32|1|1
時|0〜23|24|1|1
分|0〜60|64|1|1
秒|0〜60|64|1|1
ms|0〜999|64|1|2

8桁で表現可能。

項|範囲|Base|最小桁数|最長桁数
--|----|----|--------|--------
年|0〜N|64|2|N
月|1〜12|16|1|1
日|1〜31|32|1|1
時|0〜23|24|1|1
分|0〜60|64|1|1
秒|0〜60|64|1|1

項|範囲|Base|最小桁数|最長桁数
--|----|----|--------|--------
年|0〜N|64|2|N
月|1〜12|16|1|1
日|1〜31|32|1|1



YYYY-MM-DD HH:MM:SS.MMM  23文字
YYYY-MM-DD HH:MM:SS      19文字
YYYY-MM-DD               10文字
YYYYMMDD                  8文字(10進数)
YYMDHMSM                  8文字(64,12,32,24,60,60進数)
YYMDHMS                   7文字(64,12,32,24,60進数)


24時間
1時間=60分
24時間=24*60=1440
calcLength(Math.ceil(Math.log2(1440)), 64)
2文字

24時間
1時間=60分
1分=60秒
24時間=24*60*60=86400
calcLength(Math.ceil(Math.log2(86400)), 64)
3文字

1秒=1000ms
24時間=24*60*60*1000=86400000
calcLength(Math.ceil(Math.log2(86400000)), 64)
5字

calcLength(48, 64)










モジュロバイアス
は、乱数生成において剰余（モジュロ）演算を使用する際に発生する偏り（バイアス）を指します。そして、リジェクションサンプリングは、このモジュロバイアスを回避し、均一な乱数を生成するための一般的な手法の一つです。 
モジュロバイアス (Modulo Bias)
モジュロバイアスは、生成したい乱数の範囲のサイズが、元の乱数生成器（疑似乱数生成器など）が出力できる値の総数（範囲）を割り切れない場合に発生します。 
具体例:
0から5までの均一な乱数（サイコロの出目）を、0から7までの8種類の値（3ビットの乱数）を生成する乱数源から得たい場合を考えます。 

    元の値: {0, 1, 2, 3, 4, 5, 6, 7}
    目標範囲: {0, 1, 2, 3, 4, 5} (サイズ6)

単純に (元の値) % 6 を計算すると、以下のようになります。

    0, 6 は 0 % 6 = 0 となり、出力 0 に対応する入力値は2つあります。
    1, 7 は 1 % 6 = 1 となり、出力 1 に対応する入力値は2つあります。
    2, 3, 4, 5 はそれぞれ入力値が1つしかありません。

結果として、0と1は他の数値よりもわずかに生成される確率が高くなり、均一な分布ではなくなります。これがモジュロバイアスです。暗号システムなど、厳密な均一性が要求される場面では問題となります。 
リジェクションサンプリング (Rejection Sampling / 棄却サンプリング)
リジェクションサンプリングは、この偏りをなくすための効果的な手法です。目標の範囲に均一にマッピングできない入力値を単純に**破棄（棄却）**し、範囲内の値が得られるまで乱数生成を繰り返します。 
モジュロバイアス回避のためのリジェクションサンプリングの手順:

    元の乱数生成器を使って乱数 R を生成します（例: 0〜7の乱数）。
    R が目標範囲（例: 0〜5）に均等に割り当てられない「余分な」範囲外の値（例: 6または7）であれば、その値を棄却します。
    棄却された場合は、範囲内の値が得られるまでステップ1と2を繰り返します。 

この手法により、最終的に選択される値はすべて等しい確率で出現するため、バイアスのない均一な乱数を得ることができます。 
プログラミングでの具体的な実装例については、Zennの記事なども参考になります。 
















js nanoIDのうち次のURLで示すコード部分ではリジェクションサンプリングしていないように見えますが、モジュロバイアスはないと言います。その理由を教えてください。　https://github.com/ai/nanoid/blob/main/index.browser.js#L61C4-L61C46

NanoIDブラウザ実装コード（
bytes[i] & mask）は、棄却サンプリングを行わない単純なマスキングを使用しているように見えますが、NanoIDは安全性が保証されるカスタムアルファベット長のみをサポートしているため、モジュロバイアスは回避されています。詳細についてはGitHubをご覧ください。

6bit/1字＝URLセーフ文字[0-9A-Za-z\-_]
126bit/21字=128bit近似(2のn乗かつUUID122bitより多い)

128bitをBase64化すると末尾が2bit分の4字のうちいずれかしか出現しないため偏りが出てしまう。
それを防ぐためにはBase64で使用する文字6bit単位のデータ長にする必要がある。
UUIDv4で使用する122bitより長く、かつBase64URL文字を使うなら126bit分のデータ長が最適。
普通データは8bit(1Byte)単位で取得するため、128bitが近似になるが、2bit余剰にある。
余剰2bitを0で埋めて128bitとし、それを各Base文字列に変換できるようにしたい。
Base[2,8,10,12,16,24,32,36,58,60,62,64]
このうち2の冪乗はマスク計算で簡単に取得できる。

```javascript
function hasBias(range) {// range=2〜256。戻り値:false/true
    if (!(Number.isSafeInteger(range) && 2<=range && range<=256)) {throw new TypeError(`rangeは2〜256のNumber型整数値であるべきです。`)}
    return 0===(range & (range - 1)); // 2,4,8,16,32,64,128,256ならtrue,他はfalseを返す
}
```
```javascript
function getBitMask(range) {// ビットマスクを返す。range=2〜256。戻り値:1,3,7,15,31,63,127,255
    if (!(Number.isSafeInteger(range) && 2<=range && range<=256)) {throw new TypeError(`rangeは2〜256のNumber型整数値であるべきです。`)}
    return (2 << Math.log2(range - 1)) - 1;
}
```
```javascript
function randomBit(bits) {// 暗号論的乱数（均等分布（モジュロバイアス無し）） bits=1〜8(2,4,8,16,32,64,128,256)
    if (!(Number.isSafeInteger(bits) && 0<bit && bit<9)) {throw new TypeError(`bitsは1〜8のNumber型整数値であるべきです。`)}
    const b = crypto.getRandomValues(new Uint8Array(1))[0]; // 0〜255
    return b & getBitMask(2**bits);
}
```

```javascript
function randomBit(bits) {// 暗号論的乱数（均等分布（モジュロバイアス無し）） bits=1〜8(2,4,8,16,32,64,128,256)
    if (!(Number.isSafeInteger(bits) && 0<bit && bit<9)) {throw new TypeError(`bitsは1〜8のNumber型整数値であるべきです。`)}
    const b = crypto.getRandomValues(new Uint8Array(1))[0]; // 0〜255
    return b & ((2**bits)-1);
}
```
```javascript
function random256(range) {// 暗号論的乱数（均等分布（モジュロバイアス無し）） range=2〜256
    if (!(Number.isSafeInteger(range) && 2<=range && range<=256)) {throw new TypeError(`rangeは2〜256のNumber型整数値であるべきです。`)}
    let mask = (2 << Math.log2(range - 1)) - 1;
    const b = crypto.getRandomValues(new Uint8Array(1))[0]; // 0〜255
    return b & mask;
}
```

```javascript
function randomRange(range) {// 指定個数ある数を暗号論的乱数で返す（均等分布。モジュロバイアス無し）。リジェクションサンプリング。0〜range-1。
    if (!Number.isSafeInteger(range)) {throw new TypeError(`rangeはNumber.isSafeInteger()が真を返す値であるべきです。`)}
    if (0 < range && range < 257 && 0===(range & (range - 1))) {randomBits(Math.log2(range))}
    
}
```
```javascript
function randomNumber(min, max) {
    if (![min,max].every(v=>Number.isSafeInteger(v))) {throw new TypeError(`min,maxはNumber.isSafeInteger()が真を返す値であるべきです。`)}
    if (max <= min) {throw new RangeError(`min,maxは min < max であるべきです。`)}
    return randomRange(max - min);
}
```



# 区別しづらい文字

* '0O1Il8B'

　Base32やBase58は区別しづらい文字を除外している。

* Base32: 234567ABCDEFGHIJKLMNOPQRSTUVWXYZ (0189を除外。但し8Bは残る。大文字小文字の区別をしないから大文字Bと8が区別しづらい)
* Base58: 123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz(0OIlを除外。但し8Bが残る。)

　紛らわしい7字'0O1Il8B'すべてを除外すると以下Base55になる。

* Base55: 2345679ACDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz(0O1Il8Bを除外。但し8Bが残る。)

　Base55より大きい時は紛らわしい字を使用せねばならない。このとき、どの字を除外すべきか。

　視認しづらさによって決定すべき。視認しづらさはフォントの字形によって変わるため不定だが人間が手書きすることも想定すると、以下であると仮定する。

* 0,O（ゼロの場合空洞に点を入れることでオーと区別できるが、そのように手書きするようなルールを常に課して書かねば区別できない）
* 1,l（イチの場合上下の特徴を二画で明記せねばならない。単なる縦棒だと区別不能。パイプとも区別不能）
* 1,I（アイの場合上下の特徴を三画で明記せねばならない。）
* l,I（エルの場合上下の特徴が弱いためイチとアイの特徴を強調すべき。但しエルの特徴も明記せねばパイプと区別不能になる）
* 8,B（ハチは一画、ビーは二画。左が直線か否かで区別する。小さいと区別しづらい）

　このとき、数字と英字、どちらを先に削除すべきか。使用文字数と一致させるためには次のパターンのいずれかを選択すべき。

* 英数字の両方を削除する（視認しづらさを解消するためには最も効果的。一方でも残っていたらどちらか判断しづらくなるため）
* 数字を削除する（1l,1IのほうがlIより視認性が低いと仮定したため。また数字は1字削除するだけでIlの2字と比較する必要がなくなるため。尚0と8はOとBしかないためどちらでも良い）
* 英字を削除する（26種あるため削除されたか否か判断しづらくなるので避けたい）
    * 小文字を削除する（lのみ対象。1lのほうが1Iより視認性が低いため優先して削除すべき）
    * 大文字を削除する

　つまり優先順は次の通り。

基数|削除すべき字数|削除すべき文字|使用可能な紛らわしい文字|補足
----|--------------|--------------|------------------------|---
62|0|''|'0O1Il8B'|
61|1|'0'|'O1Il8B'|
60|2|'01'|'1Il8B'|'0O'でない理由は'1'のほうが類似字形が多い為。削除時も数字で統一でき覚えやすい。
59|3|'1Il'|'0O8B'|'018'でない理由は'1'の類似字形が多い為。
58|4|'0OIl'|'18B'|'0O8B'('1Il')でない理由はBase58規格に合わせたから。
57|5|'0O1Il'|'8B'|'01Il8'('OB')でない理由は'O'が'0'に見えかねないから。'8B'のほうが視認しやすいと判断したから。
56|6|'0O1Il8'|'B'|
55|7|'0O1Il8B'|''|

　上記ルールから、基数に応じて除外文字列を返す関数を作る。

```javascript
confusingChars = '0O1Il8B';
function confusingChars(radix=64) {
    return 62 <=radix ? '' : (
           61===radix ? '0' : (
           60===radix ? '01' : (
           59===radix ? '1Il' : (
           58===radix ? '0OIl' : (
           57===radix ? '0O1Il' : (
           56===radix ? '0O1Il8' : '0O1Il8B'))))));
}




    return radix<=55 ? '0O1Il8B' : (
        radix===56 ? '0O1Il8B' : (
        radix===57 ? '0O1Il8B' : (
        radix===58 ? '0O1Il8B' : (
        radix===59 ? '0O1Il8B' : (
        radix===60 ? '0O1Il8B' : (
        radix===61 ? '0O1Il8B' : ''))))));
}

function confusingChars(radix=64) {
    return radix<=55 ? '0O1Il8B' : (
        radix===56 ? '0O1Il8B' : (
        radix===57 ? '0O1Il8B' : (
        radix===58 ? '18B' : (
        radix===59 ? '0O8B' : (
        radix===60 ? 'OIl8B' : (
        radix===61 ? 'O1Il8B' : '0O1Il8B'))))));
    );
    if (radix <= 55) {return }
}

```

