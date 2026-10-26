# MenteCuenta

App de juegos de cálculo mental para celulares. Cada juego suma experiencia a un **rango general** y da **monedas** para pedir ayudas.

## Juegos

| Juego | Estado | Descripción |
|---|---|---|
| Cadena | Jugable | Los números aparecen de a uno con su operación. Al terminar, tenés 10 segundos para dar el resultado. |
| Dígitos | Pendiente | Recordar una serie de dígitos cada vez más larga. |
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

## Cómo probarlo

Abrí `index.html` en el navegador, o publicalo con GitHub Pages (Settings → Pages → rama `main`). En el celular se puede agregar a la pantalla de inicio.

La respuesta por voz usa la Web Speech API (`es-AR`) y funciona en Chrome para Android. El progreso se guarda en `localStorage`.
