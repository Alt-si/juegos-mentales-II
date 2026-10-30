# Cómo subir Mente Despierta a una prueba cerrada de Google Play

La app de Android es una **Trusted Web Activity**: abre el juego publicado en GitHub Pages a pantalla completa, usando Chrome por detrás. Eso tiene dos ventajas:

- Funcionan el micrófono y los avisos diarios, igual que en el navegador.
- **Los cambios en el juego llegan solos** a los testers, sin subir una versión nueva a Play. Solo hace falta una versión nueva si cambia algo de la parte Android (nombre, ícono, permisos).

Datos fijos de la app:

- Paquete: `io.github.altsi.mentedespierta`
- Apunta a Android 16 (API 36), que es lo que Google exige desde el 31/08/2026.
- Dirección que abre: https://alt-si.github.io/juegos-mentales-II/

---

## Paso 1 · Activar la compilación automática en GitHub (una sola vez)

Desde acá no tengo permiso para crear archivos de automatización en GitHub, así que este archivo lo creás vos:

1. Entrá a https://github.com/Alt-si/juegos-mentales-II
2. Tocá **Add file → Create new file**.
3. En el nombre escribí exactamente: `.github/workflows/android.yml`
4. Copiá y pegá todo el contenido de [`play/android-workflow.yml`](android-workflow.yml).
5. Tocá **Commit changes…** y después **Commit changes** (a la rama `main`).

GitHub compila la app en unos 5 minutos. Lo podés seguir en la pestaña **Actions** ("App Android (Google Play)"). Cuando termina, los archivos quedan en la rama `android-build`:

- `mente-despierta-sin-firmar.aab`: hay que firmarlo (paso 2) para subirlo a Play.
- `mente-despierta-prueba.apk`: se instala directo en un celular Android para probar antes de subir nada.

## Paso 2 · Firmar el AAB

Avisame cuando termine la compilación. Yo firmo el AAB con la **clave de subida** y te mando:

- `mente-despierta-1.0.0.aab`: el archivo para subir a Play.
- `mente-despierta-subida.jks` y su contraseña: la clave de subida.

> **Guardá la clave de subida y su contraseña en un lugar seguro** (por ejemplo, Google Drive y un gestor de contraseñas). Se necesita para cada versión nueva de la app. Si se pierde, se puede pedir a Google que la cambie, pero lleva unos días.

## Paso 3 · Crear la app en Play Console

1. Entrá a https://play.google.com/console → **Crear app**.
2. Completá:
   - Nombre: **Mente Despierta**
   - Idioma predeterminado: **Español (Latinoamérica) – es-419**
   - App o juego: **Juego**
   - Gratis o pagada: **Gratis**
3. Aceptá las declaraciones y tocá **Crear app**.

## Paso 4 · Completar la ficha y el contenido

Todos los textos y respuestas están en [`play/ficha-google-play.md`](ficha-google-play.md).

1. **Crecimiento → Presencia en Store → Ficha principal de Play Store**:
   - Pegá la descripción breve y la completa.
   - Subí el ícono, el gráfico destacado y las capturas de la carpeta `play/`.
2. **Política → Contenido de la app**: completá cada ítem con las respuestas de la ficha:
   - Política de privacidad (https://alt-si.github.io/juegos-mentales-II/privacidad.html)
   - Anuncios
   - Acceso a la app
   - Clasificación de contenido
   - Público objetivo
   - Seguridad de los datos
3. **Configuración de la tienda**: elegí la categoría **Educativos** y completá el correo de contacto.

## Paso 5 · Crear la prueba cerrada

1. **Probar y publicar → Pruebas → Prueba cerrada** → usá el segmento que viene creado (por ejemplo "Alpha") → **Administrar segmento**.
2. **Países/regiones:** agregá Argentina y los países de tus testers.
3. **Verificadores (testers):**
   - Creá una lista de correo con las cuentas de Google (Gmail) de tus testers.
   - Necesitás **al menos 12**. Conviene sumar 15 o más, por si alguno se da de baja.
4. **Crear versión nueva**:
   - Si te lo pregunta, aceptá **Firma de apps de Google Play** (la opción recomendada, con clave generada por Google).
   - Subí `mente-despierta-1.0.0.aab`.
   - Nombre de la versión: `1.0.0`.
   - Notas: "Primera versión de prueba".
5. **Revisar versión → Iniciar lanzamiento**. La primera revisión de Google puede tardar desde unas horas hasta unos días.
6. Cuando esté aprobada, copiá el **enlace para unirse a la prueba** y mandáselo a los testers. Cada uno lo abre con su cuenta de Google, toca **Unirse** y la instala desde Play.

> Las cuentas personales nuevas también tienen que verificar un celular Android con la app **Play Console**, antes de publicar.

## Paso 6 · Pantalla completa, sin barra del navegador

Hasta que Google confirme que el sitio y la app son tuyos, la app muestra arriba una barrita con la dirección del sitio. Funciona igual, pero se ve menos prolijo. Para sacarla:

1. En GitHub, creá un repositorio **público** nuevo llamado exactamente **`alt-si.github.io`**, vacío.
2. En Play Console entrá a **Probar y publicar → Configuración → Integridad de la app → Firma de apps**. Copiá la **huella digital del certificado SHA-256** de la "Clave de firma de apps".
3. Pasame esa huella. Yo subo al repositorio nuevo el archivo [`play/sitio-usuario/.well-known/assetlinks.json`](sitio-usuario/.well-known/assetlinks.json), que ya tiene la huella de tu clave de subida.
4. En ese repositorio activá **Settings → Pages → Deploy from a branch → main**.

Unos minutos después, la barra desaparece. Puede hacer falta cerrar la app y volverla a abrir.

## Paso 7 · Los 14 días de prueba

- Para pedir acceso a producción, Google exige que **al menos 12 testers** estén anotados en la prueba cerrada durante **14 días seguidos**.
- Pediles que jueguen y que dejen comentarios con el botón de opiniones privadas de Play.
- Pasados los 14 días aparece en el **Panel** el botón **Solicitar acceso a producción**. El formulario pregunta cómo fue la prueba, qué cambiaste con los comentarios y si la app está lista. Google suele responder en 7 días o menos.

## Versiones nuevas de la app de Android

Solo hacen falta si cambia algo de la parte Android: nombre, ícono, colores de la barra, permisos o dirección. En ese caso:

1. En `android/app/build.gradle`, subí `versionCode` (por ejemplo, de 1 a 2) y `versionName` (por ejemplo, a `1.0.1`).
2. La compilación corre sola, se firma el AAB nuevo con la misma clave de subida y se sube en una versión nueva de la prueba cerrada.

Los cambios en los juegos **no** necesitan versión nueva: alcanza con publicar en GitHub Pages, como hasta ahora.
