# -*- coding: utf-8 -*-
"""
fix_bytes.py
Lee app.js como bytes raw y aplica reemplazos directos
de secuencias de bytes Win-1252-as-UTF8 a UTF-8 correcto.
"""

with open('app.js', 'rb') as f:
    data = f.read()

print(f"Tamaño original: {len(data)} bytes")

# Mapa de bytes corruptos -> bytes correctos UTF-8
# La corrupción: cada char acentuado UTF-8 (2 bytes Cx Bx) fue leído como
# 2 caracteres Win-1252 y luego re-codificado como UTF-8, creando 4 bytes.
# Ejemplo ó (UTF-8: C3 B3) → Win-1252 chars Ã(C3->C3 83) + ó(B3->C2 B3) → 4 bytes: C3 83 C2 B3
# Ahora están como FFFD porque fallaron varias re-codificaciones.
# 
# Vamos a reemplazar las secuencias Win-1252-doble-codificadas directamente.
# UTF-8 de "Ã³" (Win1252 repr de ó) = C3 83 C2 B3
# Pero también puede ser EF BF BD (FFFD) si ya se corrompió una vez.
# 
# Estrategia: buscar los patrones FFFD (EF BF BD) en contexto de bytes ASCII
# y mapear al carácter correcto usando el contexto de 2 bytes antes/después.

FFFD_BYTES = b'\xef\xbf\xbd'

# Primero intentamos el reemplazo directo de secuencias Win1252-en-UTF8
# Estas son las secuencias tal como aparecen cuando UTF-8 se interpreta como Win-1252
# y luego se re-guarda como UTF-8

replacements = [
    # acento. Byte UTF-8 original -> secuencia corrupta de 4 bytes en Win1252-como-UTF8
    # á  C3 A1 -> C3 83 C2 A1
    (b'\xc3\x83\xc2\xa1', 'á'.encode('utf-8')),
    # é  C3 A9 -> C3 83 C2 A9
    (b'\xc3\x83\xc2\xa9', 'é'.encode('utf-8')),
    # í  C3 AD -> C3 83 C2 AD
    (b'\xc3\x83\xc2\xad', 'í'.encode('utf-8')),
    # ó  C3 B3 -> C3 83 C2 B3
    (b'\xc3\x83\xc2\xb3', 'ó'.encode('utf-8')),
    # ú  C3 BA -> C3 83 C2 BA
    (b'\xc3\x83\xc2\xba', 'ú'.encode('utf-8')),
    # ñ  C3 B1 -> C3 83 C2 B1
    (b'\xc3\x83\xc2\xb1', 'ñ'.encode('utf-8')),
    # Á  C3 81 -> C3 83 C2 81  (pero C2 81 no es imprimible... puede ser diferente)
    (b'\xc3\x83\xc2\x81', 'Á'.encode('utf-8')),
    # É  C3 89 -> C3 83 C2 89
    (b'\xc3\x83\xc2\x89', 'É'.encode('utf-8')),
    # Í  C3 8D -> C3 83 C2 8D
    (b'\xc3\x83\xc2\x8d', 'Í'.encode('utf-8')),
    # Ó  C3 93 -> C3 83 C2 93  -> pero C2 93 = right double quotation in Win1252
    (b'\xc3\x83\xc2\x93', 'Ó'.encode('utf-8')),
    # Ú  C3 9A -> C3 83 C2 9A
    (b'\xc3\x83\xc2\x9a', 'Ú'.encode('utf-8')),
    # Ñ  C3 91 -> C3 83 C2 91
    (b'\xc3\x83\xc2\x91', 'Ñ'.encode('utf-8')),
    # ü  C3 BC -> C3 83 C2 BC
    (b'\xc3\x83\xc2\xbc', 'ü'.encode('utf-8')),
]

fixed = data
for bad, good in replacements:
    count = fixed.count(bad)
    if count > 0:
        fixed = fixed.replace(bad, good)
        print(f"  Reemplazadas {count} ocurrencias de {bad.hex()} -> {good.decode('utf-8')!r}")

# También reemplazar secuencias con FFFD + bytes Win1252 extra
# Cuando el archivo pasó por múltiples conversiones, algunos bytes quedaron como EF BF BD
# seguidos de bytes de contexto. Necesitamos también esos.
extra = [
    (FFFD_BYTES + b'\xc2\xa1', 'á'.encode('utf-8')),  # si hay solapamiento
    (FFFD_BYTES + b'f?',       b''),  # limpieza de asci residual "f?"
]

# Verificar cuántos FFFD quedan
remaining_fffd = fixed.count(FFFD_BYTES)
print(f"\nFFRD restantes tras reemplazos de bytes: {remaining_fffd}")

if remaining_fffd > 0:
    # Decodificar para ver contextos
    txt = fixed.decode('utf-8', errors='replace')
    import re
    FFFD = '\ufffd'
    ctxs = set()
    for m in re.finditer(r'\ufffd+', txt):
        ctx = txt[max(0,m.start()-15):m.end()+15]
        ctx_safe = ctx.encode('ascii','replace').decode()
        ctxs.add(ctx_safe)
    print("Contextos únicos restantes:")
    for c in list(ctxs)[:20]:
        print(f"  {c!r}")

# Guardar resultado
with open('app.js', 'wb') as f:
    f.write(fixed)
print(f"\napp.js guardado: {len(fixed)} bytes")

# Verificar que es UTF-8 válido
try:
    decoded = fixed.decode('utf-8')
    acc = [c for c in decoded if ord(c) > 127 and ord(c) != 0xFFFD]
    print(f"UTF-8 válido. Caracteres acentuados correctos: {len(acc)}")
    print("Muestra:", ''.join(acc[:60]))
except Exception as e:
    print(f"Error UTF-8: {e}")
