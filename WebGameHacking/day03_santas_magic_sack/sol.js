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

const secret = 'S4NT4_S3CR3T_K3Y_T0_ENCRYPT_DATA'

//const cryptoHelper = new CryptoHelper;
//const encryptedText = 'U2FsdGVkX19RoJygxYSRB7Shf92UIAjuvmwayiaUKWSrczXF0+bYgUSsGABLizRY/MDBHvPYZdxXLKBGirI3zUymvF+m/aniWQXgUMEAUOtmoFSnobSDS3fIF2hZiVfcKF/+fzIF1OZDK/huHcmMdpNH4KL1kdYYqYas+tzuHiwUBH4a8xTIPVsoKAAGQbGy'
//const decryptedText = cryptoHelper.decryptAES(encryptedText, secret);
//console.log('decrypted', decryptedText);

//decrypted {"playerName":"XX","score":150,"checksum":"c59ff614e9ef288c9c6f2adb130410dacb1f0d638a68516bd029a7dbb19448d4","salt":1}

const e = "Thésée"
const s = 1333337
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

// {"data":"U2FsdGVkX19ftoZEzxLKR7hOPNp+UoVb+Vz7oUr54erDSDsNlow5Y1/Cc5euvzWo705a1AdX1lou6o2Jb2O8BXKACChVCl1vBuOVVkolLC+ctGF1sqlz6FaUICNMaYUgZGySXffE/YNTydjPDY4YE/4OsmsTCQ9AVqbQudRUIsinvbPv19Frrco915uFFmZA"}
