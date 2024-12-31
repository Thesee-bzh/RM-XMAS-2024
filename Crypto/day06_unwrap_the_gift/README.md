# Day 06 - Unwrap The Gift

## Challenge
Root-Me's Santa is being very generous this year, giving everyone who comes to see him a little present, but he's made sure you can't open it until the 25th...

>    - Author : Mika
>    - nc 163.172.68.42 10006

## Playing around

```console
$ nc 163.172.68.42 10006
--------------------------------------------------
  .-""-.
 /,..___\
() {_____}
  (/-@-@-\)
  {`-=^=-'}
  {  `-'  } Oh Oh Oh! Merry Root-Xmas to you!
   {     }
    `---'
--------------------------------------------------
[SANTA]: Hello player, welcome! Here is your gift for this christmas: 2888df1a54c3ad8ce194f85da29841c55ddc1bcccbad23e3fa777ec5b87de377f44a2bab2a513c064d33a9d88ecba1cd172635e0d8cb7bd3efe72bb92d064d3c
[SANTA]: Oh, I forgot to tell you, you will only be able to unwrap it on the 25th, come back to me on that date to get the key!
--------------------------------------------------
[SANTA]: While I'm at it, do you wish to wrap a present for someone? (Y/N)
Y
[SANTA]: Enter the message you wish to wrap:
aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa
[SANTA]: Here is your wrapped present: 1ba4c53f05ec98b2d7a7ad6c9ca06ff16ee23de4ec9811ddcc274bec864bb157de740998126009286b0089e9a7f3fa840b485b8eb6a515bd818945d743682352c9e1a2631bad5ecb21378fa4c06ec4559bf27374f4d919b2736096e6bcb3fe05b8b0ec9dc3da90ffbe9d585c4b80cba2
[SANTA]: Merry Christmas!

```

## Code analysis
The code is provided, so we can look at how the crypto is done:

```python
    def wrap(self, data):
        """
        Wrap the data with strong AES encryption
        """
        cipher = AES.new(self.key, 6, nonce=self.iv)
        data = data.encode()
        return hexlify(cipher.encrypt(pad(data, 16))).decode()

    def unwrap(self, data):
        """
        Unwrap the data
        """
        cipher = AES.new(self.key, 6, nonce=self.iv)
        return cipher.decrypt(bytes.fromhex(data)).decode()
```

AES mode 6 is `CTR` (Counter mode). See details at https://pycryptodome.readthedocs.io/en/latest/src/cipher/classic.html#ctr-mode

So it's essentially a `XOR` of the plaintext with the keystream. There's an additional `nonce` value, but it is reused...

## Solution

Heres some python code to:
- recover the keystream by `xoring` both encrypted message
- recover the plaintext by `xoring` the encrypted gift with the keystream

```python
from pwn import xor
from binascii import unhexlify

# AES-128 CTR
# key = 128bits / 16bytes
# block-size = 16 bytes (always in AES)
# nonce = 8bytes, counter = 8bytes
BLOCK_SIZE = 16

msg1 = unhexlify('2888df1a54c3ad8ce194f85da29841c55ddc1bcccbad23e3fa777ec5b87de377f44a2bab2a513c064d33a9d88ecba1cd172635e0d8cb7bd3efe72bb92d064d3c')

pt2 = 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa'.encode()

msg2 = unhexlify('1ba4c53f05ec98b2d7a7ad6c9ca06ff16ee23de4ec9811ddcc274bec864bb157de740998126009286b0089e9a7f3fa840b485b8eb6a515bd818945d743682352c9e1a2631bad5ecb21378fa4c06ec4559bf27374f4d919b2736096e6bcb3fe05b8b0ec9dc3da90ffbe9d585c4b80cba2')

# Extract Keystream
keystream = xor(msg1, msg2[:len(msg1)])

# Decode msg1
pt1 = xor(keystream, pt2)
print(pt1.decode())
```

```console
$ python3 sol.py
# RM{D0NT_WR4P_YOUR_GIFTS_W1TH_W3AK_CRYPTOGRAPHY:(}\x0f\x0f\x0f\x0f\x0f\x0f\x0f\x0f\x0f\x0f\x0f\x0f\x0f\x0f\x0fRM{D0NT_WR4P_YOUR_GIFTS_W1TH_W3AK_CRY
```

## Python code
Complete solution at [sol.py](./sol.py)

## Flag
> RM{D0NT_WR4P_YOUR_GIFTS_W1TH_W3AK_CRYPTOGRAPHY:(}
