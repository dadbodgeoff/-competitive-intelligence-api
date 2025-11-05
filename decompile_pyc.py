import marshal
import dis
import sys

pyc_file = sys.argv[1]

with open(pyc_file, 'rb') as f:
    # Skip the header (16 bytes in Python 3.7+)
    f.read(16)
    code = marshal.load(f)
    
print(f"\n=== Disassembly of {pyc_file} ===\n")
dis.dis(code)
