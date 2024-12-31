from binascii import unhexlify

data = ''
with open("packets.txt", "r") as f:
    for line in f:
        a = unhexlify(line.strip()[16:].replace('00', ''))[0:16]
        b = unhexlify(a).decode()
        data += b

print(data)
