/* ---------- Cómo se juega ---------- */
// Cada juego tiene un botón "?" que abre su explicación. La primera vez que entrás a un juego se abre sola.
const HOWTO = {
  cadena: {
    title: "Cadena", color: "var(--c1)",
    intro: "Una cuenta que se arma de a un número por vez. Tenés que ir haciéndola de cabeza.",
    steps: [
      "Aparecen los números de a uno, cada uno en un círculo, y entre número y número el signo de la operación (+, −, ×, ÷).",
      "La cuenta se resuelve en orden, como en una calculadora: 5 + 6 × 2 da 22.",
      "Cuando termina el último número tenés 10 segundos para escribir el resultado o decirlo con el micrófono.",
      "Tocá Listo para ver si acertaste: verde si está bien, amarillo si estuviste cerca, rojo si está mal.",
    ],
    tips: [
      "Más estrellas cuanto más rápido respondas: 3 si usás menos del 40 % del tiempo.",
      "Ayudas con monedas: volver a ver la secuencia, 5 segundos más o elegir entre 3 opciones. Con ayudas, máximo 2 estrellas.",
      "Los niveles no se terminan nunca: con cada uno hay más números, más grandes, más rápidos y aparecen nuevas operaciones.",
      "Duelo: tu rival recibe las mismas 3 cuentas. Gana quien acierte más; si empatan, quien respondió más rápido.",
    ],
  },
  palabra: {
    title: "Palabra escondida", color: "var(--c2)",
    intro: "Hay una palabra secreta. Encontrala probando palabras que se le parezcan.",
    steps: [
      "Escribí cualquier palabra, o decila con el micrófono.",
      "El juego le pone un número según qué tan cerca está de la escondida. La escondida es la número 1.",
      "Cuanto más chico el número, más cerca estás: verde del 1 al 50, amarillo del 51 al 300, rojo más lejos.",
      "Usá las palabras que te dieron números chicos para ir acercándote, hasta llegar al 1.",
    ],
    tips: [
      "Pensá en el tema: si \"gato\" te da 8, la palabra puede ser otro animal o algo de mascotas.",
      "Los niveles no se terminan nunca: después de los primeros 200, cualquier palabra del juego puede ser la escondida.",
      "Singular y plural cuentan como la misma palabra, y no importan los acentos.",
      "Si el juego no conoce una palabra, te avisa y ese intento no cuenta.",
      "La pista cuesta monedas y te acerca solo un poco. Con pistas, máximo 2 estrellas.",
      "Duelo: tu rival juega la misma palabra. Gana quien la encuentre en menos intentos.",
    ],
  },
  dia: {
    title: "Palabra del día", color: "var(--c3)",
    intro: "Todos los días hay una palabra escondida nueva, la misma para todos los jugadores.",
    steps: [
      "Se juega igual que Palabra escondida: probás palabras y cada una recibe un número según qué tan cerca está.",
      "Encontrá la palabra en la menor cantidad de intentos. Cada día se juega una sola vez.",
      "Al terminar, compartí tu resultado y compará con tus amigos.",
    ],
    tips: [
      "Si la encontrás varios días seguidos, armás una racha y ganás más monedas.",
      "En el calendario ves los días que jugaste. Los que te perdiste se pueden jugar después, pero no suman a la racha.",
      "Activá el recordatorio para que te avise cuando hay palabra nueva.",
    ],
  },
  secuencia: {
    title: "Secuencia", color: "var(--c6)",
    intro: "El juego enciende luces de colores, cada una con su sonido. Repetí la secuencia tocando los botones en el mismo orden.",
    steps: [
      "Mirá y escuchá: los botones se encienden uno por uno, cada uno con su nota.",
      "Cuando aparece «Tu turno», tocá los botones en el mismo orden.",
      "Si acertás, la secuencia se repite con una luz más al final. Si te equivocás, termina la partida.",
      "Arrancás con 4 botones. Cuando juntás muchos puntos en una partida se suma otro botón, hasta llegar a 8.",
    ],
    tips: [
      "Cada ronda da más puntos cuanto más larga es la secuencia y cuantos más botones hay en juego.",
      "Nuevos botones: el 5.º a los 1.500 puntos, el 6.º a los 4.000, el 7.º a los 8.000 y el 8.º a los 14.000.",
      "Desde la ronda 10, cada 5 rondas hay una ronda especial: hay que repetir la secuencia al revés, y vale el doble.",
      "Las luces pasan cada vez más rápido. Tenés 6 segundos para cada toque.",
      "Ayudas: «Ver de nuevo» repite la secuencia (20 monedas; esa ronda vale la mitad). Si te equivocás, podés seguir una vez por 50 monedas.",
      "Con teclado también se juega: las teclas 1 a 8 son los botones.",
    ],
  },
  mayor: {
    title: "Mayor o menor", color: "var(--c4)",
    intro: "Una pregunta con respuesta numérica: un año, una altura, una cantidad. Adiviná el dato.",
    steps: [
      "Leé la pregunta y fijate entre qué números está la respuesta.",
      "Probá un número. El juego te dice si el dato es MAYOR ↑ o MENOR ↓ que lo que pusiste.",
      "El color te dice qué tan cerca estás: verde muy cerca, amarillo cerca, rojo lejos.",
      "Seguí achicando el rango hasta dar con el número justo.",
    ],
    tips: [
      "El truco: probá siempre el número del medio del rango que te queda. Así llegás en la menor cantidad de intentos.",
      "Arrancás con 1000 puntos y cada número que no es la respuesta te descuenta puntos: cuantos menos intentos, más puntos. La pista también descuenta.",
      "3 estrellas si lo encontrás en la cantidad de intentos \"ideal\" que muestra el juego.",
      "Los niveles no se terminan nunca: después de las preguntas de datos aparecen preguntas nuevas con fechas, cuentas y tiempo.",
      "En los datos aproximados, como distancias o alturas, se acepta un margen que se avisa en la pregunta.",
      "La pista achica el rango a la mitad. Si te rendís, ves la respuesta y pasás a la siguiente.",
    ],
  },
};
S.seenHow = S.seenHow || {};
function howBtn(key, label){ return `<button class="howbtn" data-howto="${key}" aria-label="Cómo se juega ${esc(label||HOWTO[key].title)}">?</button>`; }
function howTo(key){
  const h = HOWTO[key]; if(!h) return;
  S.seenHow[key] = true; save();
  let el = document.getElementById("howsheet");
  if(!el){
    el = document.createElement("div"); el.id = "howsheet"; el.className = "howwrap";
    document.body.appendChild(el);
    el.addEventListener("click", e => { if(e.target === el || e.target.closest("[data-howclose]")) howClose(); });
    document.addEventListener("keydown", e => { if(e.key === "Escape") howClose(); });
  }
  el.innerHTML = `<div class="howsheet" role="dialog" aria-modal="true" aria-labelledby="howtitle" style="--hc:${h.color}">
    <div class="howhead"><span class="howkicker">Cómo se juega</span><h2 id="howtitle">${esc(h.title)}</h2><p>${esc(h.intro)}</p></div>
    <ol class="howsteps">${h.steps.map(t=>`<li>${esc(t)}</li>`).join("")}</ol>
    <h3>Para tener en cuenta</h3>
    <ul class="howtips">${h.tips.map(t=>`<li>${esc(t)}</li>`).join("")}</ul>
    <button class="btn primary howok" data-howclose>¡Entendido!</button>
  </div>`;
  el.hidden = false;
  const ok = el.querySelector(".howok"); if(ok) ok.focus();
}
function howClose(){ const el = document.getElementById("howsheet"); if(el) el.hidden = true; }
function howFirst(key){ if(!S.seenHow[key]) setTimeout(()=>howTo(key), 250); }

