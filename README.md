# create-https-localhost-with-letsencrypt

ローカルででHTTPSを利用するためドメイン（サブドメイン）にAレコードに`127.0.0.1`を割り振り、LetsencryptでDNS Challengeで証明書を発行する手順

## 手順

証明書発行用のdocker(ubuntu)コンテナの起動

```
docker run --name ubuntu-create-https -it ubuntu:18.04
```

注意：バージョンを`latest`にした場合次の`必要なパッケージのupdateとinstall`で以下のようなエラーとなるため`18.04`を指定する

```
Err:6 http://ppa.launchpad.net/certbot/certbot/ubuntu focal Release
  404  Not Found [IP: ]
Reading package lists... Done
E: The repository 'http://ppa.launchpad.net/certbot/certbot/ubuntu focal Release' does not have a Release file.
N: Updating from such a repository can't be done securely, and is therefore disabled by default.
N: See apt-secure(8) manpage for repository creation and user configuration details.
```

必要なパッケージのupdateとinstall

```
apt update \
&& apt-get install -y software-properties-common \
&& add-apt-repository -y universe \
&& add-apt-repository -y ppa:certbot/certbot \
&& apt-get update \
&& apt-get install -y python-certbot-apache
```

以下の質問をされた場合`6`を選択

```
Please select the geographic area in which you live. Subsequent configuration questions will narrow this down by presenting a list of cities, representing the time zones in which
they are located.

  1. Africa  2. America  3. Antarctica  4. Australia  5. Arctic  6. Asia  7. Atlantic  8. Europe  9. Indian  10. Pacific  11. SystemV  12. US  13. Etc
```

以下の質問をされた場合`79`を選択

```
Please select the city or region corresponding to your time zone.

  1. Aden      10. Bahrain     19. Chongqing  28. Harbin       37. Jerusalem    46. Kuala_Lumpur  55. Novokuznetsk  64. Qyzylorda      73. Taipei         82. Ulaanbaatar
  2. Almaty    11. Baku        20. Colombo    29. Hebron       38. Kabul        47. Kuching       56. Novosibirsk   65. Rangoon        74. Tashkent       83. Urumqi
  3. Amman     12. Bangkok     21. Damascus   30. Ho_Chi_Minh  39. Kamchatka    48. Kuwait        57. Omsk          66. Riyadh         75. Tbilisi        84. Ust-Nera
  4. Anadyr    13. Barnaul     22. Dhaka      31. Hong_Kong    40. Karachi      49. Macau         58. Oral          67. Sakhalin       76. Tehran         85. Vientiane
  5. Aqtau     14. Beirut      23. Dili       32. Hovd         41. Kashgar      50. Magadan       59. Phnom_Penh    68. Samarkand      77. Tel_Aviv       86. Vladivostok
  6. Aqtobe    15. Bishkek     24. Dubai      33. Irkutsk      42. Kathmandu    51. Makassar      60. Pontianak     69. Seoul          78. Thimphu        87. Yakutsk
  7. Ashgabat  16. Brunei      25. Dushanbe   34. Istanbul     43. Khandyga     52. Manila        61. Pyongyang     70. Shanghai       79. Tokyo          88. Yangon
  8. Atyrau    17. Chita       26. Famagusta  35. Jakarta      44. Kolkata      53. Muscat        62. Qatar         71. Singapore      80. Tomsk          89. Yekaterinburg
  9. Baghdad   18. Choibalsan  27. Gaza       36. Jayapura     45. Krasnoyarsk  54. Nicosia       63. Qostanay      72. Srednekolymsk  81. Ujung_Pandang  90. Yerevan
Time zone: 
```

証明書の発行

注意：`hoge.fuga.piyo`は今回証明書を発行したいドメイン（もしくはサブドメイン）を記述する
注意：コマンド実行後`(A)gree/(C)ancel:`もしくは`(Y)es/(N)o: Y`の質問後`Please deploy a DNS TXT record under the name`が出たところで進むのを止めること

```
certbot --manual --preferred-challenges dns certonly -d hoge.fuga.piyo

Enter email address (used for urgent renewal and security notices) (Enter 'c' to
cancel): ☆☆Email 入力☆☆
```

上記コマンドを進めるとDNSに対してTXTレコードの設定を要求されるので設定をする。`key`は`_acme-challenge`で始まるものを`value`には次行のもの(ここでは`agOHfGQHjK4QS48x0UbZCRB9PfpsK4ld3oUa6YaXPE0`)。TXTレコードが伝搬するまで待つ（30分ほどで伝搬したが適時確認すること）

```
- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
Please deploy a DNS TXT record under the name
_acme-challenge.hoge.fuga.piyo with the following value:

agOHfGQHjK4QS48x0UbZCRB9PfpsK4ld3oUa6YaXPE0

Before continuing, verify the record is deployed.
- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
```

確認コマンド(`_acme-challenge.hoge.fuga.piyo`は適時書き換えること)でTXTレコードが確認できれば上を進めることができる

```
dig -t TXT _acme-challenge.hoge.fuga.piyo

出力結果抜粋

;; QUESTION SECTION:
;_acme-challenge.hoge.fuga.piyo. IN TXT

;; ANSWER SECTION:

;; AUTHORITY SECTION:

;; ADDITIONAL SECTION:

```

成功した場合`fullchain.pem`,`privkey.pem`のPATHが表示されるのでcatなどで表示し適時保存し利用する

```
IMPORTANT NOTES:
 - Congratulations! Your certificate and chain have been saved at:
   /etc/letsencrypt/live/localhost.hoge.fuga.piyo/fullchain.pem
   Your key file has been saved at:
   /etc/letsencrypt/live/localhost.hoge.fuga.piyo/privkey.pem
   Your cert will expire on 2022-05-01. To obtain a new or tweaked
   version of this certificate in the future, simply run certbot
   again. To non-interactively renew *all* of your certificates, run
   "certbot renew"
 - If you like Certbot, please consider supporting our work by:

   Donating to ISRG / Let's Encrypt:   https://letsencrypt.org/donate
   Donating to EFF:                    https://eff.org/donate-le
```

失敗（TXTレコードが認識されていない）した場合、`certbot --manual --preferred-challenges dns certonly -d hoge.fuga.piyo`をやりなおす。TXTレコードのvalueは都度変わるため注意

```
IMPORTANT NOTES:
 - The following errors were reported by the server:

   Domain: localhost.hoge.fuga.piyo
   Type:   None
   Detail: DNS problem: NXDOMAIN looking up TXT for
   _acme-challenge.localhost.hoeg.huga.piyo - check that a DNS record
   exists for this domain
 - Your account credentials have been saved in your Certbot
   configuration directory at /etc/letsencrypt. You should make a
   secure backup of this folder now. This configuration directory will
   also contain certificates and private keys obtained by Certbot so
   making regular backups of this folder is ideal.
```

## 動作確認

[`index.js`](./example/index.js)を作成し同じディレクトリに保存した`privkey.pem`,`fullchain.pem`を配置し`node index.js`で起動する。起動後ブラウザで`https://作成したドメイン:8443`にアクセスし`Listening HTTPS Server!!`が出力されれば成功

```
const https = require('https')
const fs = require('fs')
const privKeyPath = './privkey.pem'
const fullChainPath = './fullchain.pem'
const httpsPort = 8443

https
  .createServer(
    {
      key: fs.readFileSync(privKeyPath),
      cert: fs.readFileSync(fullChainPath),
    },
    (_, res) => res.end('Listening HTTPS Server!!')
  )
  .listen(httpsPort, () => {
    console.log(`Listening HTTPS on :${httpsPort}`)
  })
```