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
