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

Escribís (o decís) una palabra y el juego te muestra su **puesto real** entre las ~3.300 palabras del vocabulario: la escondida es la número 1, y cuanto más chico es el número, más cerca estás. Todas tus palabras quedan ordenadas de la más cercana a la más lejana.

- **Colores:** verde para los puestos 1 a 50, amarillo para 51 a 300 y rojo para más de 300.
- **Singular y plural** cuentan como la misma palabra, y no importan los acentos ni las mayúsculas.
- Si escribís una palabra que el juego no conoce, te avisa y **ese intento no cuenta**.
- **Pistas con costo creciente** (30, 50, 80 y 120 monedas). Cada pista te acerca solo un poco: si estás lejos, te lleva al 60 % de tu mejor puesto; si estás cerca, avanza unos pocos puestos. Con tu mejor intento entre los 10 primeros ya no hay pistas.
- **Rendirse:** muestra la palabra (hay que tocar dos veces).
- Al terminar se muestran las 10 palabras más cercanas.

### Niveles y dificultad

Son 200 niveles, en 10 etapas de 20:

| Niveles | Dificultad | 3 estrellas | 2 estrellas |
|---|---|---|---|
| 1–60 | Fácil: palabras concretas, con listas de cercanía escritas a mano | hasta 12 intentos | hasta 30 |
| 61–120 | Intermedio: animales, objetos y lugares más específicos | hasta 18 | hasta 40 |
| 121–160 | Difícil: palabras poco comunes y de cultura | hasta 24 | hasta 50 |
| 161–200 | Experto: emociones, valores e ideas abstractas | hasta 30 | hasta 60 |

Con pistas, el máximo es 2 estrellas.

### Cómo se calcula el puesto

- `data/vocab-*.js` tiene el vocabulario, organizado en **dominio / categoría / subcategoría** (por ejemplo `animales/mamíferos/felinos`) y con etiquetas temáticas (`campo`, `frío`, `fiesta`…). Dentro de cada subcategoría, las palabras vecinas se consideran más parecidas.
- Para cada palabra escondida se ordena **todo** el vocabulario según un puntaje. Suma puntos compartir subcategoría (y estar cerca dentro de ella), compartir categoría o dominio, que los dominios estén relacionados (por ejemplo comida y plantas), compartir etiquetas y ser el nombre de la categoría (como "ave" para colibrí).
- En los niveles 1 a 60, las listas a mano de `data/escondida-*.js` fijan los primeros puestos.

**Próximo paso recomendado:** reemplazar este puntaje por la similitud de un modelo de vectores de palabras en español (por ejemplo fastText o spaCy `es_core_news_lg`). Hoy, más allá de los primeros ~300 puestos, el orden se vuelve bastante parejo.

### Duelo contra un rival

Desde la pantalla de Palabra escondida se puede **desafiar a un rival**. No hace falta servidor: el desafío viaja en un mensaje.

1. Tocás **Desafiar a un rival** (la primera vez te pide tu nombre). Jugás una palabra al azar.
2. Al terminar, el juego arma un mensaje con tu marca, un **link** y un **código**. Lo copiás o lo compartís (por ejemplo, por WhatsApp). La palabra no se ve en el mensaje.
3. Tu rival abre el link, o pega el código en **Duelo → Abrir**, y juega **la misma palabra**.
4. **Gana quien la encuentre en menos intentos.** Si empatan en intentos, gana quien usó menos pistas. Si alguien se rinde, pierde contra quien la encontró.
5. Tu rival te devuelve el resultado con otro código, y los dos ven quién ganó. Se puede pedir revancha con otra palabra.

Premios: 20 monedas por ganar, 8 por empatar y 3 por encontrar la palabra aunque pierdas. La app lleva la cuenta de duelos ganados, empatados y perdidos.

**Limitaciones:** el código está ofuscado pero no firmado, así que alguien con conocimientos técnicos podría modificarlo. Para duelos en tiempo real, rankings y resultados verificados hace falta un servidor (por ejemplo, Firebase o Supabase).

## Estructura del proyecto

- `src/app.html`: la app (pantallas, Cadena, estilos).
- `src/escondida.js`: la lógica de Palabra escondida.
- `data/vocab-*.js`: el vocabulario con categorías.
- `data/escondida-*.js`: las listas a mano de los niveles 1 a 60.
- `data/niveles-extra.js`: las palabras de los niveles 61 a 200.
- `tools/build.py`: arma `index.html` juntando todo. Correlo después de cada cambio con `python3 tools/build.py`.

## Cómo probarlo

Abrí `index.html` en el navegador, o publicalo con GitHub Pages (Settings → Pages → rama `main`). En el celular se puede agregar a la pantalla de inicio.

La respuesta por voz usa la Web Speech API (`es-AR`) y funciona en Chrome para Android. El progreso se guarda en `localStorage`.
