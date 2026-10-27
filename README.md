# Mente Despierta

App de juegos mentales para celulares. Cada juego suma experiencia a un **rango general** y da **monedas** para pedir ayudas.

## Juegos

| Juego | Estado | Descripción |
|---|---|---|
| Cadena | Jugable | Los números aparecen de a uno con su operación. Al terminar, tenés 10 segundos para dar el resultado. |
| Palabra escondida | Jugable | Hay que encontrar una palabra secreta. Cada palabra que probás recibe un número según qué tan cerca está. |
| Secuencia | Jugable | Luces de colores con sonido: hay que repetir la secuencia en el mismo orden. Cada acierto suma una luz. |
| Bloques deslizantes | Jugable | Tablero de 6×6 con bloques que se deslizan en su dirección: hay que sacar el bloque rojo por la salida. |
| Mayor o menor | Jugable | Una pregunta con respuesta numérica (años, metros, cantidades). Probás números y el juego te dice si el dato es mayor o menor. |

## Mapa de niveles

En cada juego los niveles se muestran como un **camino en zigzag**:

- Cada etapa de 20 niveles empieza con un **cartel de color** que muestra el nombre de la etapa, de qué se trata, cuántos niveles completaste y cuántas estrellas juntaste.
- Los niveles **completados** se ven como círculos del color de la etapa, con sus estrellas abajo, y el tramo de camino recorrido queda pintado.
- El **próximo nivel** es más grande, late y tiene un cartel "JUGAR". Al abrir la pantalla, el camino se desplaza solo hasta él.
- Los niveles **bloqueados** muestran un candado, y el camino hacia ellos es punteado.
- Al final hay un aviso de que los niveles no se terminan nunca.

## Cómo se juega

Cada juego tiene un botón **?** que abre su explicación: en la portada (sobre cada tarjeta), en la pantalla de niveles y, en Palabra escondida y Mayor o menor, también durante la partida. La explicación aparece sola la primera vez que el jugador entra a cada juego. Los textos están en `src/ayuda.js`.

## Palabra del día

Es un extra de Palabra escondida: el juego es el mismo, pero **la palabra es la misma para todos los jugadores en la misma fecha**, y cambia cada día. Se elige con una lista mezclada con una semilla fija, según el número de día.

- **En la portada**, la tarjeta "Desafío del día" lleva a su sección.
- **Calendario mensual.** Cada día se marca en **verde** con la cantidad de intentos, en **rojo** si te rendiste, con **borde punteado** si no lo jugaste (todavía se puede jugar) o apagado si es un día futuro. Hoy aparece resaltado.
- **Racha** de días seguidos encontrando la palabra, mejor racha, palabras encontradas e intentos promedio. Los días anteriores se pueden recuperar desde el calendario, pero no suman a la racha y dan menos premio.
- **Premio:** 15 monedas más 2 por cada día de racha (hasta 7), y XP.
- Cada día se juega una sola vez. Después se ve el resultado y se puede **compartir** ("Palabra del día 26/10: la encontré en 12 intentos. Racha: 3 días. ¿Y vos?").

### Aviso diario

En la sección hay un botón **Recordatorio diario → Activar**, que pide permiso para mandar notificaciones y registra `sw.js` (el service worker).

- En **Chrome para Android, con la app instalada**, el aviso llega con `periodicSync`. El sistema decide la hora exacta, aproximadamente una vez por día.
- Al tocar el aviso se abre la app en la Palabra del día (`#hoy`).
- `sw.js` ya maneja el evento `push`. Para un aviso a hora fija y en iPhone hace falta un servidor que lo mande (por ejemplo, Firebase Cloud Messaging), o empaquetar la app como nativa con notificaciones locales (por ejemplo, con Capacitor).

## Mayor o menor

El juego hace una pregunta cuya respuesta es un número y muestra entre qué valores está, por ejemplo: "¿En qué año se declaró la independencia argentina? Entre 1500 y 2025".

- Probás un número (escrito o con el micrófono) y el juego responde **"Es MAYOR ↑"** o **"Es MENOR ↓"**, en verde si estás muy cerca (a menos del 3 % del rango), amarillo si estás cerca (a menos del 15 %) o rojo si estás lejos.
- Una **barra** muestra cuánto se fue achicando el rango donde puede estar la respuesta, con una marca por cada número que probaste.
- Para los datos aproximados (distancias, alturas) se acepta un **margen**, que se avisa en la pregunta.
- **Puntos:** cada pregunta arranca con **1000 puntos**. Cada número que no es la respuesta descuenta puntos (1000 ÷ (2 × ideal + 2), así las preguntas con rangos grandes no castigan de más), y una pista descuenta el doble. Si encontrás la respuesta, nunca bajás de 50 puntos; si te rendís, sumás 0. Se guarda tu mejor puntaje de cada nivel, y la suma es tu **puntaje total**. Las monedas y la XP dependen de los puntos.
- **Estrellas:** el juego calcula cuántos intentos hacen falta yendo siempre a la mitad del rango (el "ideal"). 3 estrellas si lo lográs en esa cantidad, 2 con hasta 3 intentos más y 1 con más.
- **Pista** (30, 50 y 80 monedas): achica el rango a la mitad, sin centrarlo en la respuesta. Con pistas, el máximo es 2 estrellas.
- **Rendirse** muestra la respuesta y deja pasar a la pregunta siguiente.
- Al terminar se ve la respuesta, un dato curioso y los números que probaste.
- Primero vienen las **128 preguntas** escritas a mano en `data/mayor.js`, en tres dificultades (cantidades conocidas, fechas y datos, y datos difíciles). Cada jugador las recibe en un orden distinto dentro de cada dificultad.
- **Después, los niveles no se terminan:** `src/mayor-gen.js` arma una pregunta nueva para cada nivel. Pueden ser años entre dos hechos conocidos, la edad de alguien nacido en una fecha, multiplicaciones, porcentajes, conversiones de tiempo, días entre dos fechas, ahorro semanal o sumas del 1 al N. La respuesta siempre se calcula, así que siempre es correcta. Los números crecen a medida que avanzás.

## Secuencia

Es un juego de memoria al estilo Simón. Los botones son porciones de un círculo, cada uno con su color y su nota musical.

- El juego enciende una secuencia de luces con sonido y el jugador la repite tocando los botones en el mismo orden (también con las teclas 1 a 8).
- **Cada ronda que acertás agrega una luz más** al final de la secuencia. Si te equivocás o pasan 6 segundos sin tocar, termina la partida y se muestra cuál era el botón correcto.
- **Botones:** se arranca con 4. Cuando la partida llega a **1.500 puntos** aparece el 5.º botón (alrededor de la ronda 17), a los **4.000** el 6.º, a los **8.000** el 7.º y a los **14.000** el 8.º. El botón nuevo entra directamente en la secuencia.
- **Puntos por ronda:** largo de la secuencia × 10 × (botones − 3). Así, las rondas largas y con más botones valen mucho más.
- **Rondas especiales:** desde la ronda 10, cada 5 rondas hay que repetir la secuencia **al revés**, y la ronda vale el doble.
- **Velocidad:** cada luz dura 560 ms al principio y baja hasta 220 ms.
- **Ayudas:** «Ver de nuevo» repite la secuencia (20 monedas, una vez por ronda; esa ronda vale la mitad). Después de un error se puede **seguir jugando** una vez por partida por 50 monedas.
- Se guardan el récord de puntos, la mejor ronda, la mayor cantidad de botones alcanzada y las partidas jugadas. Las monedas y la XP dependen del puntaje.

## Bloques deslizantes

Es un juego al estilo Rush Hour o "Unblock Me". El tablero es de 6×6 y tiene la salida a la derecha de la tercera fila.

- **Cómo se juega:** los bloques se arrastran con el dedo. Los horizontales se mueven solo a los costados y los verticales solo hacia arriba y hacia abajo. Hay que abrir camino para sacar el **bloque rojo** por la salida. También se puede jugar con teclado: Tab para elegir un bloque y flechas para moverlo.
- **Movimientos:** deslizar un bloque cualquier distancia cuenta como **un** movimiento. Cada nivel muestra el **mínimo** posible.
- **Estrellas:** 3 si se resuelve con el mínimo, 2 con hasta el mínimo + la mitad (al menos +2) y 1 con más. Con pistas, el máximo es 2.
- **Deshacer** es gratis y resta el movimiento. **Reiniciar** vuelve el tablero al principio.
- **Pista** (30, 50 y 80 monedas): el solucionador calcula la mejor jugada desde el tablero actual, marca el bloque que hay que mover y muestra con una silueta punteada hasta dónde.
- **Paredes:** desde el nivel 21 aparecen tableros con cuadrados rayados fijos.
- **Niveles sin fin:** el nivel 1 ya pide unos 7 movimientos. Cada nivel busca una dificultad (mínimo de movimientos) que sube rápido al principio y después más despacio, hasta unos 30 movimientos. Cada jugador recibe los puzzles en otro orden. Cuando se usaron todos, empieza otra vuelta.

### Cómo se arma el banco de puzzles

- `tools/gen-bloques.js` arma tableros al azar. Para cada uno recorre **todos** los estados a los que se puede llegar y elige el que está más lejos de la solución, que es la versión más difícil de ese tablero.
- `tools/pack-bloques.js` junta los resultados y vuelve a resolver cada puzzle con el mismo solucionador de la app, para confirmar que tiene solución y que el mínimo es correcto. Después escribe `data/bloques.js`.
- Para sumar más puzzles: `node tools/gen-bloques.js 600 <semilla> banco.json` (600 segundos) y después `node tools/pack-bloques.js banco*.json`.

## Cadena: progresión de niveles

Durante la secuencia, cada número aparece dentro de un círculo y el signo de la operación se muestra solo, entre un número y el siguiente (1, +, 2, −, 1…).

**Los niveles no se terminan nunca**, agrupados en etapas de 20. Hasta el 300 la dificultad sube como muestra la tabla; después las cuentas siguen creciendo hasta 30 números de hasta 9.999, a 0,38 s cada uno. La cuenta se resuelve en orden, como en una calculadora (5 + 6 × 2 = 22).

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

**Las palabras escondidas son al azar.** Cada jugador recibe su propio orden: la primera vez que abre la app se genera una semilla, y con ella se mezclan las palabras dentro de cada tramo de dificultad (1–20, 21–40, 41–60, 61–100, 101–150 y 151–200). Así nadie sabe de antemano cuál es la palabra de un nivel, y la dificultad igual va subiendo. Si repetís un nivel, te toca otra palabra al azar del mismo tramo.

**Los niveles no se terminan nunca.** Los primeros 200 son los armados (tabla de abajo). Después, cualquier sustantivo del vocabulario (casi 1.900) puede ser la palabra escondida, en un orden distinto para cada jugador. Cuando se terminan, se vuelven a mezclar.

Los primeros 200, en 10 etapas de 20:

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

## Duelo de Cadena

En la pantalla de niveles de Cadena también hay un recuadro **Duelo**.

- Se juegan **3 cuentas** del nivel en el que estás. En el duelo no hay ayudas.
- El código lleva el nivel y una **semilla**, así que tu rival recibe **exactamente las mismas cuentas**.
- **Gana quien acierte más.** Si empatan, gana quien tardó menos en total en responder; y si siguen empatados, quien quedó más cerca del resultado.
- El resultado se devuelve con otro código, igual que en Palabra escondida. Los códigos de los dos juegos se pueden pegar en cualquiera de los dos recuadros de Duelo.

## Estructura del proyecto

- `src/app.html`: la app (pantallas, Cadena, estilos).
- `src/escondida.js`: la lógica de Palabra escondida y de los duelos.
- `src/cadena-duelo.js`: el duelo de Cadena.
- `src/secuencia.js`: el juego Secuencia.
- `src/bloques-core.js`, `src/bloques.js`: el juego Bloques deslizantes (motor y pantalla).
- `data/bloques.js`: el banco de puzzles verificados.
- `tools/gen-bloques.js`, `tools/pack-bloques.js`: generan y verifican el banco.
- `src/ayuda.js`: las explicaciones de cómo se juega.
- `src/mayor.js`: el juego Mayor o menor.
- `src/mayor-gen.js`: las preguntas generadas de Mayor o menor (niveles sin fin).
- `data/mayor.js`: las preguntas de Mayor o menor.
- `src/diaria.js`: la Palabra del día, el calendario y el aviso diario.
- `sw.js`: el service worker de los avisos.
- `icon.svg`, `manifest.webmanifest`: el ícono y los datos para instalar la app.
- `data/vocab-*.js`: el vocabulario con categorías.
- `data/escondida-*.js`: las listas a mano de los niveles 1 a 60.
- `data/niveles-extra.js`: las palabras de los niveles 61 a 200.
- `tools/build.py`: arma `index.html` juntando todo. Correlo después de cada cambio con `python3 tools/build.py`.

## Cómo probarlo

Abrí `index.html` en el navegador, o publicalo con GitHub Pages (Settings → Pages → rama `main`). En el celular se puede agregar a la pantalla de inicio.

La respuesta por voz usa la Web Speech API (`es-AR`) y funciona en Chrome para Android. El progreso se guarda en `localStorage`.
