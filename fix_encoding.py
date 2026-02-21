# -*- coding: utf-8 -*-
"""
fix_encoding.py
Corrige los caracteres U+FFFD (reemplazo) en app.js causados por
múltiples conversiones de encoding en PowerShell Add-Content.
"""

import re

FFFD = '\ufffd'

# Lee el archivo con errors='replace' para no fallar
with open('app.js', 'r', encoding='utf-8', errors='replace') as f:
    txt = f.read()

print(f"Reemplazos U+FFFD encontrados: {txt.count(FFFD)}")

# ---------------------------------------------------------------
# Mapa de corrección: (patron_roto, texto_correcto)
# El patrón usa \x00 como marcador de FFFD para legibilidad
# ---------------------------------------------------------------
def fix(t, broken, correct):
    return t.replace(broken, correct)

# Nivel Bloom chips
txt = fix(txt, f'Comprensi{FFFD}n',  'Comprensión')
txt = fix(txt, f'Aplicaci{FFFD}n',   'Aplicación')
txt = fix(txt, f'Actitudinal',        'Actitudinal')   # sin acento, solo verificar

# Secuencia didáctica
txt = fix(txt, f'Anticipaci{FFFD}n', 'Anticipación')
txt = fix(txt, f'Construcci{FFFD}n', 'Construcción')
txt = fix(txt, f'Consolidaci{FFFD}n','Consolidación')
txt = fix(txt, f'Did{FFFD}ctica',    'Didáctica')
txt = fix(txt, f'did{FFFD}ctica',    'didáctica')

# Palabras comunes con tilde
txt = fix(txt, f'tambi{FFFD}n',      'también')
txt = fix(txt, f'Tambi{FFFD}n',      'También')
txt = fix(txt, f'M{FFFD}dulo',       'Módulo')
txt = fix(txt, f'm{FFFD}dulo',       'módulo')
txt = fix(txt, f'n{FFFD}mero',       'número')
txt = fix(txt, f'N{FFFD}mero',       'Número')
txt = fix(txt, f'c{FFFD}digo',       'código')
txt = fix(txt, f'C{FFFD}digo',       'Código')
txt = fix(txt, f'descripci{FFFD}n',  'descripción')
txt = fix(txt, f'Descripci{FFFD}n',  'Descripción')
txt = fix(txt, f'evaluaci{FFFD}n',   'evaluación')
txt = fix(txt, f'Evaluaci{FFFD}n',   'Evaluación')
txt = fix(txt, f'informaci{FFFD}n',  'información')
txt = fix(txt, f'Informaci{FFFD}n',  'Información')
txt = fix(txt, f'generaci{FFFD}n',   'generación')
txt = fix(txt, f'Generaci{FFFD}n',   'Generación')
txt = fix(txt, f'secci{FFFD}n',      'sección')
txt = fix(txt, f'Secci{FFFD}n',      'Sección')
txt = fix(txt, f'distribuci{FFFD}n', 'distribución')
txt = fix(txt, f'Distribuci{FFFD}n', 'Distribución')
txt = fix(txt, f'funci{FFFD}n',      'función')
txt = fix(txt, f'Funci{FFFD}n',      'Función')
txt = fix(txt, f'exportaci{FFFD}n',  'exportación')
txt = fix(txt, f'Exportaci{FFFD}n',  'Exportación')
txt = fix(txt, f'navegaci{FFFD}n',   'navegación')
txt = fix(txt, f'Navegaci{FFFD}n',   'Navegación')
txt = fix(txt, f'planificaci{FFFD}n','planificación')
txt = fix(txt, f'Planificaci{FFFD}n','Planificación')
txt = fix(txt, f'validaci{FFFD}n',   'validación')
txt = fix(txt, f'Validaci{FFFD}n',   'Validación')
txt = fix(txt, f'detecci{FFFD}n',    'detección')
txt = fix(txt, f'Detecci{FFFD}n',    'Detección')
txt = fix(txt, f'creaci{FFFD}n',     'creación')
txt = fix(txt, f'Creaci{FFFD}n',     'Creación')
txt = fix(txt, f'animaci{FFFD}n',    'animación')
txt = fix(txt, f'actualizaci{FFFD}n','actualización')
txt = fix(txt, f'restauraci{FFFD}n', 'restauración')
txt = fix(txt, f'Restauraci{FFFD}n', 'Restauración')
txt = fix(txt, f'soluci{FFFD}n',     'solución')
txt = fix(txt, f'opci{FFFD}n',       'opción')
txt = fix(txt, f'versi{FFFD}n',      'versión')

# Palabras con é
txt = fix(txt, f'correcci{FFFD}n',   'corrección')
txt = fix(txt, f'secci{FFFD}n',      'sección')
txt = fix(txt, f'interacci{FFFD}n',  'interacción')
txt = fix(txt, f'instrucci{FFFD}n',  'instrucción')
txt = fix(txt, f'Instrucci{FFFD}n',  'Instrucción')
txt = fix(txt, f'colecci{FFFD}n',    'colección')
txt = fix(txt, f'elecci{FFFD}n',     'elección')
txt = fix(txt, f'selecci{FFFD}n',    'selección')
txt = fix(txt, f'Selecci{FFFD}n',    'Selección')
txt = fix(txt, f'producci{FFFD}n',   'producción')
txt = fix(txt, f'conexi{FFFD}n',     'conexión')

# Otras palabras
txt = fix(txt, f't{FFFD}cnico',      'técnico')
txt = fix(txt, f'T{FFFD}cnico',      'Técnico')
txt = fix(txt, f'pr{FFFD}ctica',     'práctica')
txt = fix(txt, f'Pr{FFFD}ctica',     'Práctica')
txt = fix(txt, f'pr{FFFD}cticas',    'prácticas')
txt = fix(txt, f'b{FFFD}sico',       'básico')
txt = fix(txt, f'B{FFFD}sico',       'Básico')
txt = fix(txt, f'an{FFFD}lisis',     'análisis')
txt = fix(txt, f'An{FFFD}lisis',     'Análisis')
txt = fix(txt, f'm{FFFD}ximo',       'máximo')
txt = fix(txt, f'M{FFFD}ximo',       'Máximo')
txt = fix(txt, f'm{FFFD}nimo',       'mínimo')
txt = fix(txt, f'M{FFFD}nimo',       'Mínimo')
txt = fix(txt, f'p{FFFD}gina',       'página')
txt = fix(txt, f'P{FFFD}gina',       'Página')
txt = fix(txt, f'per{FFFD}odo',      'período')
txt = fix(txt, f'Per{FFFD}odo',      'Período')
txt = fix(txt, f't{FFFD}tulo',       'título')
txt = fix(txt, f'T{FFFD}tulo',       'Título')
txt = fix(txt, f'{FFFD}ndice',       'índice')
txt = fix(txt, f'ind{FFFD}cador',    'indicador')
txt = fix(txt, f'Ind{FFFD}cador',    'Indicador')
txt = fix(txt, f'ind{FFFD}cadores',  'indicadores')
txt = fix(txt, f'Ind{FFFD}cadores',  'Indicadores')
txt = fix(txt, f'criterio',          'criterio')   # sin acento
txt = fix(txt, f'prop{FFFD}sito',    'propósito')
txt = fix(txt, f'cat{FFFD}logo',     'catálogo')
txt = fix(txt, f'peri{FFFD}do',      'período')

# Verbos y frases comunes
txt = fix(txt, f'demostr{FFFD}',     'demostró')
txt = fix(txt, f'est{FFFD}',         'está')
txt = fix(txt, f'Est{FFFD}',         'Está')
txt = fix(txt, f'aqu{FFFD}',         'aquí')
txt = fix(txt, f'Aqu{FFFD}',         'Aquí')
txt = fix(txt, f'as{FFFD}',          'así')
txt = fix(txt, f'dem{FFFD}s',        'demás')
txt = fix(txt, f'adem{FFFD}s',       'además')
txt = fix(txt, f'Adem{FFFD}s',       'Además')

# Palabras del contexto educativo dominicano
txt = fix(txt, f'calificaci{FFFD}n', 'calificación')
txt = fix(txt, f'Calificaci{FFFD}n', 'Calificación')
txt = fix(txt, f'observaci{FFFD}n',  'observación')
txt = fix(txt, f'Observaci{FFFD}n',  'Observación')
txt = fix(txt, f'elaboraci{FFFD}n',  'elaboración')
txt = fix(txt, f'Elaboraci{FFFD}n',  'Elaboración')
txt = fix(txt, f'participaci{FFFD}n','participación')
txt = fix(txt, f'Participaci{FFFD}n','Participación')
txt = fix(txt, f'presentaci{FFFD}n', 'presentación')
txt = fix(txt, f'Presentaci{FFFD}n', 'Presentación')
txt = fix(txt, f'introducci{FFFD}n', 'introducción')
txt = fix(txt, f'Introducci{FFFD}n', 'Introducción')
txt = fix(txt, f'resoluci{FFFD}n',   'resolución')
txt = fix(txt, f'Resoluci{FFFD}n',   'Resolución')
txt = fix(txt, f'incorporaci{FFFD}n','incorporación')
txt = fix(txt, f'relaci{FFFD}n',     'relación')
txt = fix(txt, f'Relaci{FFFD}n',     'Relación')
txt = fix(txt, f'acci{FFFD}n',       'acción')
txt = fix(txt, f'Acci{FFFD}n',       'Acción')
txt = fix(txt, f'aplicaci{FFFD}n',   'aplicación')
txt = fix(txt, f'Aplicaci{FFFD}n',   'Aplicación')
txt = fix(txt, f'educaci{FFFD}n',    'educación')
txt = fix(txt, f'Educaci{FFFD}n',    'Educación')
txt = fix(txt, f'programaci{FFFD}n', 'programación')
txt = fix(txt, f'Programaci{FFFD}n', 'Programación')
txt = fix(txt, f'comunicaci{FFFD}n', 'comunicación')
txt = fix(txt, f'Comunicaci{FFFD}n', 'Comunicación')
txt = fix(txt, f'definici{FFFD}n',   'definición')
txt = fix(txt, f'Definici{FFFD}n',   'Definición')
txt = fix(txt, f'obtenci{FFFD}n',    'obtención')
txt = fix(txt, f'demostraci{FFFD}n', 'demostración')
txt = fix(txt, f'Demostraci{FFFD}n', 'Demostración')
txt = fix(txt, f'elaboraci{FFFD}n',  'elaboración')
txt = fix(txt, f'situaci{FFFD}n',    'situación')
txt = fix(txt, f'Situaci{FFFD}n',    'Situación')
txt = fix(txt, f'realizaci{FFFD}n',  'realización')
txt = fix(txt, f'Realizaci{FFFD}n',  'Realización')

# Palabras con ñ
txt = fix(txt, f'a{FFFD}o',          'año')
txt = fix(txt, f'ense{FFFD}anza',    'enseñanza')
txt = fix(txt, f'compa{FFFD}ero',    'compañero')
txt = fix(txt, f'compa{FFFD}eros',   'compañeros')
txt = fix(txt, f'se{FFFD}al',        'señal')
txt = fix(txt, f'dise{FFFD}o',       'diseño')
txt = fix(txt, f'Dise{FFFD}o',       'Diseño')

# Frases con tilde en verbos
txt = fix(txt, f'podr{FFFD}',        'podrá')
txt = fix(txt, f'har{FFFD}',         'hará')
txt = fix(txt, f'ser{FFFD}',         'será')
txt = fix(txt, f'tendr{FFFD}',       'tendrá')
txt = fix(txt, f'deber{FFFD}',       'deberá')
txt = fix(txt, f'necesitar{FFFD}',   'necesitará')
txt = fix(txt, f'generar{FFFD}',     'generará')

# ---------------------------------------------------------------
# Limpieza genérica final: FFFD solo entre letras (heurística)
# Para los que quedaron sin mapear, intentar inferir por contexto
# ---------------------------------------------------------------
remaining = txt.count(FFFD)
print(f"Restantes tras reemplazos conocidos: {remaining}")

# Si quedan, mostrar contextos para diagnóstico
if remaining > 0:
    for m in re.finditer(r'\ufffd', txt):
        ctx = txt[max(0, m.start()-20):m.end()+20]
        print(f"  Aún sin fix en: ...{ctx!r}...")

# Guardar el resultado
with open('app.js', 'w', encoding='utf-8') as f:
    f.write(txt)

print("✅ app.js guardado con encoding UTF-8 correcto.")
