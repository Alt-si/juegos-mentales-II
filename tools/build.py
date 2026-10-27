#!/usr/bin/env python3
"""Arma index.html a partir de src/ y data/.

Uso:  python3 tools/build.py [ruta_extra_sin_envoltorio.html]

- src/app.html      página (sin <html>/<head>/<body>)
- src/escondida.js  lógica de Palabra escondida (se inserta en @@WGAME@@)
- data/*.js  vocabulario, listas de cercanía y niveles (se insertan en <!--ESCONDIDA_DATA-->)
"""
import glob, os, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
rd = lambda p: open(os.path.join(ROOT, p), encoding="utf-8").read()

body = rd("src/app.html")
body = body.replace("@@WGAME@@", rd("src/escondida.js") + rd("src/cadena-duelo.js") + rd("src/diaria.js") + rd("src/mayor.js"))
data = "".join(
    "<script>\n" + open(f, encoding="utf-8").read() + "\n</script>\n"
    for f in sorted(glob.glob(os.path.join(ROOT, "data", "*.js")))
)
body = body.replace("<!--ESCONDIDA_DATA-->", data)

page = (
    '<!doctype html>\n<html lang="es">\n<head>\n<meta charset="utf-8">\n'
    '<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">\n'
    '<meta name="theme-color" content="#7B3FF2">\n'
    '<link rel="manifest" href="manifest.webmanifest">\n<link rel="icon" href="icon.svg" type="image/svg+xml">\n'
    "<style>:root{padding-top:env(safe-area-inset-top,0px);padding-bottom:env(safe-area-inset-bottom,0px)}"
    "body{margin:0}[hidden]{display:none!important}</style>\n"
    "</head>\n<body>\n" + body + "\n</body>\n</html>\n"
)
open(os.path.join(ROOT, "index.html"), "w", encoding="utf-8").write(page)
if len(sys.argv) > 1:
    open(sys.argv[1], "w", encoding="utf-8").write(body)
print("index.html listo:", len(page) // 1024, "KB")
