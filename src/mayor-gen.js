/* ---------- Mayor o menor: preguntas generadas (niveles sin fin) ---------- */
// Después de las preguntas escritas a mano, cada nivel arma una pregunta nueva a partir de datos firmes
// (años de hechos conocidos) o de cuentas. La respuesta siempre se calcula, así que siempre es correcta.
const M_EVENTS = [
  ["la caída del Imperio romano de Occidente",476],["la llegada de Colón a América",1492],["la primera fundación de Buenos Aires",1536],
  ["la segunda fundación de Buenos Aires",1580],["la publicación de la primera parte del Quijote",1605],["la independencia de Estados Unidos",1776],
  ["la toma de la Bastilla",1789],["la Revolución de Mayo",1810],["la Declaración de la Independencia argentina",1816],
  ["la muerte de San Martín",1850],["la sanción de la Constitución argentina",1853],["el nacimiento de Borges",1899],
  ["el primer vuelo de los hermanos Wright",1903],["la inauguración del Teatro Colón",1908],["el hundimiento del Titanic",1912],
  ["la inauguración del subte de Buenos Aires",1913],["el comienzo de la Primera Guerra Mundial",1914],["el descubrimiento de la penicilina",1928],
  ["el primer Mundial de fútbol",1930],["la muerte de Carlos Gardel",1935],["la inauguración del Obelisco",1936],
  ["el fin de la Segunda Guerra Mundial",1945],["la ley del voto femenino en la Argentina",1947],["la muerte de Eva Perón",1952],
  ["la primera Copa Libertadores",1960],["la primera aparición de Mafalda",1964],["la llegada del ser humano a la Luna",1969],
  ["el primer Mundial que ganó la Argentina",1978],["la guerra de Malvinas",1982],["la vuelta de la democracia en la Argentina",1983],
  ["el Mundial de México 86",1986],["el nacimiento de Messi",1987],["la caída del Muro de Berlín",1989],
  ["la fundación de Google",1998],["la presentación del primer iPhone",2007],["la elección del papa Francisco",2013],["el Mundial de Qatar",2022],
];
const M_MESES_DIAS = [31,28,31,30,31,30,31,31,30,31,30,31];
function mNiceCeil(v){ if(v<=10) return 10; const p = Math.pow(10, Math.floor(Math.log10(v))); for(const m of [1,1.5,2,2.5,3,4,5,6,8,10]) if(m*p >= v) return Math.round(m*p); return 10*p; }
function mGen(L){
  const k = Math.max(0, L - MDATA.length);                     // cuánto pasamos de las preguntas a mano
  const r = mulberry32((S.wseed||1)*31 + L*7919);
  const ri = (a,b) => a + Math.floor(r()*(b-a+1));
  const pick = arr => arr[Math.floor(r()*arr.length)];
  const range = (a, spread) => { const hi = mNiceCeil(Math.max(a+1, a*(1.3 + r()*spread))); return {lo:0, hi}; };
  const types = ["años","años","edad","multi","porcentaje","tiempo","fechas","ahorro","suma"];
  const t = pick(types);
  let q, a, u = "", n = "";
  if(t==="años"){
    let e1 = pick(M_EVENTS), e2 = pick(M_EVENTS); while(e2[1]===e1[1]) e2 = pick(M_EVENTS);
    if(e1[1] > e2[1]) [e1,e2] = [e2,e1];
    a = e2[1]-e1[1]; q = `¿Cuántos años pasaron entre ${e1[0]} y ${e2[0]}?`; u = "años";
    n = `${e1[0][0].toUpperCase()+e1[0].slice(1)} fue en ${e1[1]} y ${e2[0]}, en ${e2[1]}.`;
  } else if(t==="edad"){
    const e = pick(M_EVENTS.filter(x=>x[1]>=1900 && x[1]<=2015)); const y = ri(e[1]+5, 2025);
    a = y - e[1]; q = `Alguien nació el año de ${e[0]}. ¿Cuántos años cumplió en ${y}?`; u = "años";
    n = `${e[0][0].toUpperCase()+e[0].slice(1)} fue en ${e[1]}: ${y} − ${e[1]} = ${a}.`;
  } else if(t==="multi"){
    const A = ri(11, Math.min(999, 25 + k*2)), B = ri(3, Math.min(99, 9 + Math.floor(k/4)));
    a = A*B; q = `¿Cuánto es ${A} × ${B}?`; n = `${A} × ${B} = ${a}.`;
  } else if(t==="porcentaje"){
    const P = pick([5,10,15,20,25,30,40,50,60,75]); const N = 20*ri(2, Math.min(500, 10 + k));
    a = N*P/100; q = `¿Cuánto es el ${P} % de ${N}?`; n = `El ${P} % de ${N} es ${N} × ${P} ÷ 100 = ${a}.`;
  } else if(t==="tiempo"){
    const v = pick(["hd","mh","sm","dw","hw"]);
    if(v==="hd"){ const D = ri(2, 20 + k); a = D*24; q = `¿Cuántas horas hay en ${D} días?`; u = "horas"; n = `${D} × 24 = ${a}.`; }
    if(v==="mh"){ const H = ri(2, 12 + Math.floor(k/2)), M = ri(1, 59); a = H*60+M; q = `¿Cuántos minutos son ${H} horas y ${M} minutos?`; u = "minutos"; n = `${H} × 60 + ${M} = ${a}.`; }
    if(v==="sm"){ const M = ri(2, 30 + k); a = M*60; q = `¿Cuántos segundos hay en ${M} minutos?`; u = "segundos"; n = `${M} × 60 = ${a}.`; }
    if(v==="dw"){ const W = ri(3, 30 + k); a = W*7; q = `¿Cuántos días son ${W} semanas?`; u = "días"; n = `${W} × 7 = ${a}.`; }
    if(v==="hw"){ const W = ri(2, 10 + Math.floor(k/3)); a = W*168; q = `¿Cuántas horas hay en ${W} semanas?`; u = "horas"; n = `Una semana tiene 168 horas: ${W} × 168 = ${a}.`; }
  } else if(t==="fechas"){
    const m1 = ri(0, 9), m2 = ri(m1+1, 11), d1 = ri(1, M_MESES_DIAS[m1]), d2 = ri(1, M_MESES_DIAS[m2]);
    const doy = (m,d) => M_MESES_DIAS.slice(0,m).reduce((s,x)=>s+x,0) + d;
    a = doy(m2,d2) - doy(m1,d1);
    q = `En un año que no es bisiesto, ¿cuántos días hay desde el ${d1} de ${MESES[m1]} hasta el ${d2} de ${MESES[m2]}?`; u = "días";
    n = `El ${d1} de ${MESES[m1]} es el día ${doy(m1,d1)} del año y el ${d2} de ${MESES[m2]}, el día ${doy(m2,d2)}.`;
  } else if(t==="ahorro"){
    const X = 50*ri(2, 20 + Math.floor(k/2)), Wk = ri(4, 30 + Math.floor(k/2));
    a = X*Wk; q = `Si ahorrás $${mFmt(X)} por semana, ¿cuánta plata juntás en ${Wk} semanas?`; u = "pesos"; n = `${mFmt(X)} × ${Wk} = ${mFmt(a)}.`;
  } else {
    const N = ri(10, Math.min(1000, 30 + k*2)); a = N*(N+1)/2;
    q = `¿Cuánto da sumar todos los números del 1 al ${N}?`; n = `La fórmula es N × (N + 1) ÷ 2: ${N} × ${N+1} ÷ 2 = ${mFmt(a)}.`;
  }
  return Object.assign({q, a, u, n, tol:0, d:3, gen:true}, range(a, 1.6));
}
function mQuestion(L){ return L <= MDATA.length ? MDATA[M_ORDER[L-1]] : mGen(L); }

