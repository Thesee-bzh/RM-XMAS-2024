# Day 03 - Santa's Magic Sack

## Challenge
Santa has developed a web game where you have to catch presents, and as luck would have it, he's come out on top of the scoreboard. Can you beat him?

> - Author: Elweth
> - https://day3.challenges.xmas.root-me.org/

## Analysis
At the end of the game, the score is sent over http in a `POST request` to `/api/scores`. We can see it using the network tab of the browser's web dev tools:

```
{"data":"U2FsdGVkX19RoJygxYSRB7Shf92UIAjuvmwayiaUKWSrczXF0+bYgUSsGABLizRY/MDBHvPYZdxXLKBGirI3zUymvF+m/aniWQXgUMEAUOtmoFSnobSDS3fIF2hZiVfcKF/+fzIF1OZDK/huHcmMdpNH4KL1kdYYqYas+tzuHiwUBH4a8xTIPVsoKAAGQbGy"}
```

To understand how this is encoded, we need to look at the the javascript code, but first we shall `beautify` it to make it readable:

```console
$ js-beautify index-DHkGdvNB.js.js > out.js
```

Here's the part of the code that is interesting to us:

```javascript
var Md = hf.exports;
const gf = Rf(Md),
    Ud = "S4NT4_S3CR3T_K3Y_T0_ENCRYPT_DATA";

function Wd(e) {
    const t = JSON.stringify(e);
    return gf.AES.encrypt(t, Ud).toString()
}

function $d(e, t) {
    const r = Math.floor(Math.random() * 9) + 1,
        n = `${e}-${t}-${r}`;
    return {
        checksum: gf.SHA256(n).toString(),
        salt: r
    }
}
async function Vd(e, t) {
    const {
        checksum: r,
        salt: n
    } = $d(e, t), l = Wd({
        playerName: e,
        score: t,
        checksum: r,
        salt: n
    });
    try {
        return await (await fetch("/api/scores", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                data: l
            })
        })).json()
    } catch (i) {
        return console.error("Error submitting score:", i), {
            success: !1
        }
    }
}
```

So encoding is done as follows:
- randomly select a `salt` value with: `r = Math.floor(Math.random() * 9) + 1`
- build string `n = ${e}-${t}-${r}`, with the playername, score and salt
- compute hash `checksum = gf.SHA256(n).toString()`
- build json data: `j = { playerName: e, score: t, checksum: r, salt: n }` and `stringify` it
- aes encode that json data using the secret key: `l = gf.AES.encrypt(t, "S4NT4_S3CR3T_K3Y_T0_ENCRYPT_DATA").toString()`

Then a POST request is sent to `/api/scores` with json data `{ data: l }`

## Solution
Here some javascript class implementing the AES encryption/decryption:

```javascript
const crypto = require('crypto');

class CryptoHelper {
  decryptAES(encryptedText, secret) {
    // From https://gist.github.com/schakko/2628689?permalink_comment_id=3321113#gistcomment-3321113
    // From https://gist.github.com/chengen/450129cb95c7159cb05001cc6bdbf6a1
    const cypher = Buffer.from(encryptedText, 'base64');
    const salt = cypher.slice(8, 16);
    const password = Buffer.concat([Buffer.from(secret, 'binary'), salt]);
    const md5Hashes = [];
    let digest = password;
    for (let i = 0; i < 3; i++) {
      md5Hashes[i] = crypto.createHash('md5').update(digest).digest();
      digest = Buffer.concat([md5Hashes[i], password]);
    }
    const key = Buffer.concat([md5Hashes[0], md5Hashes[1]]);
    const iv = md5Hashes[2];
    const contents = cypher.slice(16);
    const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);

    return decipher.update(contents) + decipher.final();
  }
  encryptAES(plainText, secret) {
    const salt = crypto.randomBytes(8);
    const password = Buffer.concat([Buffer.from(secret, 'binary'), salt]);
    const hash = [];
    let digest = password;
    for (let i = 0; i < 3; i++) {
      hash[i] = crypto.createHash('md5').update(digest).digest();
      digest = Buffer.concat([hash[i], password]);
    }
    const keyDerivation = Buffer.concat(hash);
    const key = keyDerivation.subarray(0, 32);
    const iv = keyDerivation.subarray(32);
    const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
    return Buffer.concat([
      Buffer.from('Salted__', 'utf8'),
      salt,
      cipher.update(plainText),
      cipher.final()
    ]).toString('base64');
  }
}
```

We can use it to encode our own payload, with a arbitrarily high score:

```javascript
const secret = 'S4NT4_S3CR3T_K3Y_T0_ENCRYPT_DATA'

const e = "Thésée"
const s = 133337
const r = Math.floor(Math.random() * 9) + 1
const n = `${e}-${s}-${r}`
const c = crypto.createHash('sha256').update(n).digest('hex').toString()
const j = { playerName: e, score: s, checksum: c, salt: r }
const t = JSON.stringify(j)
//console.log('plaintext', t);

const cryptoHelper = new CryptoHelper;
const enc = cryptoHelper.encryptAES(t, secret);
const encText = enc.toString();
const body = JSON.stringify({ data: encText })
console.log(body);
```

Running that code with score `133337` and sending the output payload as a `POST request` to `/api/scores` doesn't grant us immediately with the flag: we need to increase the submitted score:

```console
$ node sol.js
{"data":"U2FsdGVkX19ftoZEzxLKR7hOPNp+UoVb+Vz7oUr54erDSDsNlow5Y1/Cc5euvzWo705a1AdX1lou6o2Jb2O8BXKACChVCl1vBuOVVkolLC+ctGF1sqlz6FaUICNMaYUgZGySXffE/YNTydjPDY4YE/4OsmsTCQ9AVqbQudRUIsinvbPv19Frrco915uFFmZA"}
$
$ curl --request POST --url 'https://day3.challenges.xmas.root-me.org/api/scores' --header 'Content-Type: application/json' --data '{"data":"U2FsdGVkX19ftoZEzxLKR7hOPNp+UoVb+Vz7oUr54erDSDsNlow5Y1/Cc5euvzWo705a1AdX1lou6o2Jb2O8BXKACChVCl1vBuOVVkolLC+ctGF1sqlz6FaUICNMaYUgZGySXffE/YNTydjPDY4YE/4OsmsTCQ9AVqbQudRUIsinvbPv19Frrco915uFFmZA"}' -k
{"success":true,"isNewRecord":false,"message":"Congratz, but not enough .."}
```

We get the flag with higher score 1333337:

```console
$ curl --request POST --url 'https://day3.challenges.xmas.root-me.org/api/scores' --header 'Content-Type: application/json' --data '{"data":"U2FsdGVkX1/9lcEKilPxTCbWwbp7VtP4NSpUB06fneYD6t3Hy1K2hbY+6Fc2oJbQIjBmCTGRmCf2FhRoxX3s2ih4tkSyLyJQJkz04zLK7DJq6aGg9Scqm+6J+s7dTiuVf/jBaBWeyySnyvqzVZxTqnO9H4VOeHFY+eYJWfKrIYTbj+waAvRTc6Mtz1qu/XjqXhKWyYjGwFsPMiJjuKJiSQ=="}' -k
{"success":true,"isNewRecord":true,"flag":"RM{S4NT4_H0PE_Y0U_D1DN'T_CHEAT}","message":"For reasons of maximum integer size, to not disturb other users your score will not be saved, but well done!"}
```

## Javascript code
Complete solution in [sol.js](./sol.js)

## Flag
> RM{S4NT4_H0PE_Y0U_D1DN'T_CHEAT}
