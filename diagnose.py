# -*- coding: utf-8 -*-
"""
diagnose.py - Muestra el contexto exacto de cada U+FFFD en app.js
"""
import sys

# Redirect output to a file to avoid cp1252 console issues
with open('app.js', 'r', encoding='utf-8', errors='replace') as f:
    txt = f.read()

FFFD = '\ufffd'
count = txt.count(FFFD)

out = []
out.append(f"Total FFFD: {count}\n")

i = 0
seen = set()
while True:
    pos = txt.find(FFFD, i)
    if pos < 0:
        break
    ctx = txt[max(0, pos-25):pos+25]
    # Replace FFFD with [?] for ASCII display
    ctx_safe = ctx.replace(FFFD, '[?]').encode('ascii','replace').decode()
    if ctx_safe not in seen:
        seen.add(ctx_safe)
        out.append(f"pos {pos:6}: {ctx_safe}\n")
    i = pos + 1

with open('diagnose_output.txt', 'w', encoding='utf-8') as f:
    f.writelines(out)

print(f"Done. {len(seen)} unique contexts written to diagnose_output.txt")
