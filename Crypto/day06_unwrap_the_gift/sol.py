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

# RM{D0NT_WR4P_YOUR_GIFTS_W1TH_W3AK_CRYPTOGRAPHY:(}\x0f\x0f\x0f\x0f\x0f\x0f\x0f\x0f\x0f\x0f\x0f\x0f\x0f\x0f\x0fRM{D0NT_WR4P_YOUR_GIFTS_W1TH_W3AK_CRY
