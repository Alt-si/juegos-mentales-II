# MenteCuenta

App de juegos de cálculo mental para celulares. Cada juego suma experiencia a un **rango general** y da **monedas** para pedir ayudas.

## Juegos

| Juego | Estado | Descripción |
|---|---|---|
| Cadena | Jugable | Los números aparecen de a uno con su operación. Al terminar, tenés 10 segundos para dar el resultado. |
| Palabra escondida | Jugable | Hay que encontrar una palabra secreta. Cada palabra que probás recibe un número según qué tan cerca está. |
| Tablas relámpago | Pendiente | Multiplicaciones contra reloj durante 60 segundos. |
| Mayor o menor | Pendiente | Elegir qué cuenta da más. |

## Cadena: progresión de niveles

Durante la secuencia, cada número aparece dentro de un círculo y el signo de la operación se muestra solo, entre un número y el siguiente (1, +, 2, −, 1…).

Son 300 niveles, agrupados en etapas de 20. La cuenta se resuelve en orden, como en una calculadora (5 + 6 × 2 = 22).

| Niveles | Operaciones | Rango de números |
|---|---|---|
| 1–5 | + | 1–9 |
| 6–40 | + − | hasta 15 / 25 |
| 41–90 | + − × | hasta 25 / 50 |
| 91–300 | + − × ÷ | hasta 50 → 999 |

- Cantidad de números: arranca en 3 y suma 1 cada 7 niveles, hasta un máximo de 20.
- Tiempo por número: unos 1,6 s al principio y 0,52 s como mínimo.
- Los resultados negativos aparecen a partir del nivel 71. Las divisiones siempre son exactas.

## Recompensas y ayudas

- **Estrellas:** 3 si respondés usando hasta el 40 % del tiempo, 2 si usás hasta el 70 % y 1 si usás más. Con cualquier ayuda, el máximo es 2.
- **Monedas:** 3 por estrella, más 5 la primera vez que superás el nivel, más 1 por cada 10 niveles.
- **XP:** (8 + nivel) × estrellas, más 20 la primera vez. La XP sube el rango general (10 rangos, de Novato a Mente Infinita).
- **Ayudas:** volver a ver la secuencia (30 monedas), 5 segundos más (20) o elegir entre 3 opciones (40).

## Pantalla de resultado

Después de tocar **Listo**, la respuesta aparece dentro de un círculo con un color según el resultado:

- **Verde:** la respuesta es correcta. Además hay confeti.
- **Amarillo:** estuviste cerca, a una diferencia de 2 o del 10 % del resultado, la que sea mayor. No supera el nivel.
- **Rojo:** la respuesta está mal o se acabó el tiempo.

Abajo se muestra la cuenta completa: cada número en su círculo y el signo de la operación entre número y número.

## Palabra escondida

Escribís (o decís) una palabra y el juego le asigna un **puesto**: la palabra escondida es la número 1, y cuanto más chico es el número, más cerca estás. Todas tus palabras quedan ordenadas de la más cercana a la más lejana.

- **Colores:** verde para los puestos 1 a 50 (muy cerca), amarillo para 51 a 300 (cerca) y rojo para más de 300 (lejos).
- **Singular y plural** cuentan como la misma palabra, y no importan los acentos ni las mayúsculas.
- **Pista (30 monedas):** agrega una palabra que está a mitad de camino entre tu mejor intento y la escondida.
- **Rendirse:** muestra la palabra (hay que tocar dos veces).
- **Estrellas:** 3 con hasta 10 intentos, 2 con hasta 25 y 1 con más. Con pistas, el máximo es 2.
- Al terminar se muestran las 10 palabras más cercanas.

### Cómo se calcula la cercanía

Hay 60 niveles en `data/escondida-*.js`. Cada nivel tiene dos listas escritas a mano:

1. **Cercanas**, en orden: reciben los puestos 2, 3, 4…
2. **Relacionadas**, en orden: reciben los puestos 150, 153, 156…

Si una palabra no está en ninguna de las dos listas pero sí aparece en la lista de otra palabra escondida que está relacionada, el juego **estima** su puesto (entre 300 y 999). Si no hay ninguna relación, se muestra "+1000".

**Próximo paso recomendado:** generar los puestos con un modelo de vectores de palabras en español (por ejemplo fastText o spaCy `es_core_news_lg`), ordenando todo un vocabulario por similitud con cada palabra escondida. Así cada palabra recibe un número exacto, como en Contexto. Las listas a mano sirven para el prototipo.

## Estructura del proyecto

- `src/app.html`: la app (pantallas, Cadena, estilos).
- `src/escondida.js`: la lógica de Palabra escondida.
- `data/escondida-*.js`: las palabras de cada nivel.
- `tools/build.py`: arma `index.html` juntando todo. Correlo después de cada cambio con `python3 tools/build.py`.

## Cómo probarlo

Abrí `index.html` en el navegador, o publicalo con GitHub Pages (Settings → Pages → rama `main`). En el celular se puede agregar a la pantalla de inicio.

La respuesta por voz usa la Web Speech API (`es-AR`) y funciona en Chrome para Android. El progreso se guarda en `localStorage`.
