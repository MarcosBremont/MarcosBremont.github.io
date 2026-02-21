# -*- coding: utf-8 -*-
"""inspect_fffd.py - Finds exact raw bytes around each FFFD occurrence"""

with open('app.js', 'rb') as f:
    data = f.read()

FFFD = b'\xef\xbf\xbd'
out_lines = []

i = 0
while True:
    pos = data.find(FFFD, i)
    if pos < 0:
        break
    before = data[max(0, pos-4):pos]
    after  = data[pos+3:pos+7]
    line = f"pos={pos:6d} before={before.hex()} FFFD after={after.hex()} | ascii: {before.decode('ascii','replace')}[F?]{after.decode('ascii','replace')}\n"
    out_lines.append(line)
    i = pos + 1

with open('inspect_out.txt', 'w', encoding='utf-8') as f:
    f.write(f"Total FFFD: {len(out_lines)}\n")
    f.writelines(out_lines[:50])  # first 50

print(f"Total FFFD: {len(out_lines)}, first 50 written to inspect_out.txt")
