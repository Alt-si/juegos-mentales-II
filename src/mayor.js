/* ---------- Mayor o menor ---------- */
// Una pregunta con respuesta numérica. Cada número que probás te dice si el dato es mayor o menor.
const MDATA = (window.__mayor||[]).map(x=>Object.assign({tol:0, u:"", n:""}, x));
S.games.mayor = S.games.mayor || {};
// orden distinto para cada jugador, mezclado dentro de cada dificultad
const M_ORDER = [];
const M_TIERS = [];
[1,2,3].forEach(d=>{
  const idx = MDATA.map((x,i)=>x.d===d?i:-1).filter(i=>i>=0);
  const r = mulberry32((S.wseed||1) + d*104729);
  for(let i=idx.length-1;i>0;i--){ const j = Math.floor(r()*(i+1)); [idx[i],idx[j]] = [idx[j],idx[i]]; }
  M_TIERS.push([M_ORDER.length+1, M_ORDER.length+idx.length]);
  M_ORDER.push(...idx);
});
const M_STAGES = ["Para entrar en calor","Números de todos los días","Fechas y cantidades","Historia y deporte","Datos curiosos","Para expertos","Solo para cracks"];
const mFmt = n => Number(n).toLocaleString("es-AR").replace("-", "−");
// cuántos intentos haría falta yendo siempre a la mitad
const mPar = x => Math.max(1, Math.ceil(Math.log2((x.hi - x.lo) / (2*x.tol + 1) + 1)));
const M_HINT_COST = [30, 50, 80];
// puntaje: arrancás con 1000 y cada número que no es la respuesta descuenta puntos (más en las preguntas de rango chico)
const M_START = 1000, M_MIN = 50;
const mPenalty = par => Math.max(25, Math.round(M_START / (2*par + 2)));
S.mbest = S.mbest || {};
const mTotal = () => Object.values(S.mbest).reduce((s,v)=>s+v, 0);

function mlevels(){
  levelMap({title:"Mayor o menor", desc:"Te hacemos una pregunta con respuesta numérica. Probá números: te decimos si el dato es mayor o menor hasta que lo encuentres.",
    store:S.games.mayor, total:Infinity, names:M_STAGES, attr:"mlv", how:"mayor",
    label:s=>{ const L = s*20+1; if(L > MDATA.length) return "preguntas nuevas: fechas, cuentas y tiempo"; const t = M_TIERS.findIndex(([a,b])=>L>=a && L<=b); return ["preguntas fáciles","fechas y datos","datos difíciles"][Math.max(0,t)] + " · 3 estrellas yendo a la mitad"; }});
  const h = $app.querySelector(".hello"); if(h) h.insertAdjacentHTML("beforeend", `<p class="mtotal">Tu puntaje total: <b class="num">${mFmt(mTotal())}</b> puntos</p>`);
  addDuelCard("mnew", `Los dos responden las mismas ${MD_ROUNDS} preguntas, sin pistas. Gana quien junte más puntos; si empatan, quien usó menos intentos.`);
}

let M = null;
function mplay(L, duel){
  clearTimers(); G = null; W = null;
  if(!actx){ try{ actx = new (window.AudioContext||window.webkitAudioContext)(); }catch(e){} }
  const x = duel ? MDATA[duel.qs[duel.round]] : mQuestion(L);
  M = {L, x, lo:x.lo, hi:x.hi, guesses:[], hints:0, done:false, par:mPar(x), pts:M_START, duel:duel||null};
  M.pen = mPenalty(M.par);
  $app.innerHTML = `${topBar("mlevels")}
  <div class="mplay">
    <div class="mpts" id="mpts"><span>Puntos</span><b class="num" id="mptsv">${mFmt(M.pts)}</b><small>cada número que no es la respuesta resta ${M.pen}</small></div>
    <div class="hud">${duel ? `<span><b>Duelo</b> · pregunta <b>${duel.round+1}</b> de ${MD_ROUNDS}${duel.p?` · contra ${esc(duel.p.a.n)}`:""}</span>` : `<span>Nivel <b>${L}</b></span>`}<span class="hudr"><span>Intentos: <b id="mcount">0</b> · ideal: <b>${M.par}</b></span>${howBtn("mayor")}</span></div>
    <div class="mq">
      <span class="kicker">Pregunta</span>
      <h2>${esc(x.q)}</h2>
      <p>La respuesta está entre <b class="num">${mFmt(x.lo)}</b> y <b class="num">${mFmt(x.hi)}</b>${x.u?` ${esc(x.u)}`:""}.${x.tol?` Se acepta un margen de ±${mFmt(x.tol)}.`:""}</p>
    </div>
    <div class="mrange" id="mrange"></div>
    <div id="mfeed" class="mfeed"><span class="arrow">?</span><div><b>Probá un número</b><span>Empezar por la mitad del rango suele ser la mejor idea.</span></div></div>
    <form class="wform" id="mform" autocomplete="off">
      <input id="mguess" type="text" inputmode="numeric" autocomplete="off" maxlength="12" placeholder="Tu número" aria-label="Tu número">
      <button type="button" class="wmic" data-mmic aria-label="Decir un número">${MIC_SVG}</button>
      <button type="submit" class="wsend">Probar</button>
    </form>
    <p class="hint" id="micst">Escribí un número o tocá el micrófono</p>
    <div class="whelps">
      ${duel ? "" : `<button class="help" data-mhelp>Pista<small><span class="coin"></span><span id="mhcost">${M_HINT_COST[0]}</span></small></button>`}
      <button class="help" data-mgive>Rendirse<small>ver la respuesta</small></button>
    </div>
    <ol class="mlist" id="mlist"></ol>
  </div>`;
  document.getElementById("mform").addEventListener("submit", e=>{ e.preventDefault(); mGuess(document.getElementById("mguess").value); });
  mRender();
}
function mRender(){
  document.getElementById("mcount").textContent = M.guesses.filter(g=>!g.hint).length;
  const x = M.x, span = x.hi - x.lo || 1;
  const pos = v => Math.max(0, Math.min(100, (v - x.lo) / span * 100));
  const marks = M.guesses.map(g=>`<i class="mk ${g.hint?"hint":""}" style="left:${pos(g.v)}%"></i>`).join("");
  document.getElementById("mrange").innerHTML = `
    <div class="mtrack"><span class="mzone" style="left:${pos(M.lo)}%;width:${pos(M.hi)-pos(M.lo)}%"></span>${marks}</div>
    <div class="mends"><span class="num">${mFmt(M.lo)}</span><span>la respuesta está acá</span><span class="num">${mFmt(M.hi)}</span></div>`;
  const list = [...M.guesses].reverse();
  document.getElementById("mlist").innerHTML = list.map(g=>`<li class="mrow t-${g.tier}">
    <span class="num">${mFmt(g.v)}</span>${g.hint?`<span class="wtag">pista</span>`:""}
    <span class="mdir">${g.dir>0?"Es mayor ↑":g.dir<0?"Es menor ↓":"¡Justo!"}</span></li>`).join("");
}
function mTier(v){
  const x = M.x, rel = Math.abs(v - x.a) / ((x.hi - x.lo) || 1);
  return rel <= .03 ? "good" : rel <= .15 ? "warn" : "bad";
}
function mParse(text){
  let t = String(text).toLowerCase().trim();
  const neg = /^-|^−|menos/.test(t);
  t = t.replace(/[.\s]/g,"").replace(",", ".");
  const m = t.match(/\d+(\.\d+)?/); if(!m) return null;
  const v = Math.round(parseFloat(m[0]));
  return neg ? -v : v;
}
function mGuess(text){
  if(!M || M.done) return;
  const inp = document.getElementById("mguess");
  const v = mParse(text);
  if(v === null){ toast("Escribí un número."); return; }
  if(M.guesses.some(g=>g.v===v && !g.hint)){ toast(`Ya probaste ${mFmt(v)}.`); if(inp) inp.value=""; return; }
  const x = M.x, hit = Math.abs(v - x.a) <= x.tol;
  const dir = hit ? 0 : (x.a > v ? 1 : -1);
  if(!hit){ if(dir>0) M.lo = Math.max(M.lo, v+1); else M.hi = Math.min(M.hi, v-1); }
  const g = {v, dir, tier: hit ? "good" : mTier(v), hint:false};
  M.guesses.push(g);
  if(!hit) mLose(M.pen);
  if(inp){ inp.value=""; refocus(inp); }
  const f = document.getElementById("mfeed");
  f.className = `mfeed t-${g.tier} ${hit?"win":dir>0?"up":"down"}`;
  f.innerHTML = hit ? `<span class="arrow">✓</span><div><b>¡Es ${mFmt(v)}!</b><span>Encontraste el dato.</span></div>`
    : `<span class="arrow">${dir>0?"↑":"↓"}</span><div><b>Es ${dir>0?"MAYOR":"MENOR"} que ${mFmt(v)}</b><span>${g.tier==="good"?"¡Estás muy cerca!":g.tier==="warn"?"Estás cerca.":"Todavía estás lejos."}</span></div>`;
  f.classList.remove("pop"); void f.offsetWidth; f.classList.add("pop");
  beep(hit?880:g.tier==="good"?760:g.tier==="warn"?560:330, .07);
  mRender();
  if(hit) timers.push(setTimeout(()=>mEnd(true), 600));
}
function mHint(){
  if(!M || M.done) return;
  const cost = M_HINT_COST[Math.min(M.hints, M_HINT_COST.length-1)];
  if(S.coins < cost){ toast(`Necesitás ${cost} monedas para esta pista.`); return; }
  const x = M.x, width = M.hi - M.lo;
  if(width <= Math.max(4, x.tol*4)){ toast("El rango ya es chico: esta vez no hay pista."); return; }
  // achica el rango a la mitad, sin centrarlo en la respuesta
  const nw = Math.ceil(width/2);
  const minLo = Math.max(M.lo, x.a - nw + 1), maxLo = Math.min(x.a, M.hi - nw);
  const nlo = minLo <= maxLo ? minLo + Math.floor(Math.random()*(maxLo-minLo+1)) : M.lo;
  const nhi = nlo + nw;
  S.coins -= cost; M.hints++; save(); mLose(M.pen*2);
  document.querySelector(".coins .num").textContent = S.coins;
  const mc = document.getElementById("mhcost"); if(mc) mc.textContent = M_HINT_COST[Math.min(M.hints, M_HINT_COST.length-1)];
  if(nlo > M.lo){ M.guesses.push({v:nlo-1, dir:1, tier:mTier(nlo-1), hint:true}); M.lo = nlo; }
  if(nhi < M.hi){ M.guesses.push({v:nhi+1, dir:-1, tier:mTier(nhi+1), hint:true}); M.hi = nhi; }
  toast(`Pista: la respuesta está entre ${mFmt(M.lo)} y ${mFmt(M.hi)}.`);
  mRender();
}
function mGiveUp(btn){
  if(!M || M.done) return;
  if(!btn.dataset.sure){ btn.dataset.sure="1"; btn.innerHTML = `¿Seguro?<small>tocá de nuevo</small>`;
    timers.push(setTimeout(()=>{ if(document.body.contains(btn)){ delete btn.dataset.sure; btn.innerHTML=`Rendirse<small>ver la respuesta</small>`; } }, 3000)); return; }
  mEnd(false);
}
function mLose(p){
  const before = M.pts; M.pts = Math.max(M_MIN, M.pts - p);
  const box = document.getElementById("mpts"), v = document.getElementById("mptsv");
  if(v) v.textContent = mFmt(M.pts);
  if(box && before > M.pts){
    box.insertAdjacentHTML("beforeend", `<span class="mminus">−${before - M.pts}</span>`);
    const m = box.lastElementChild; timers.push(setTimeout(()=>m && m.remove(), 900));
    box.classList.toggle("low", M.pts < 400);
  }
}
function mEnd(ok){
  M.done = true; clearTimers();
  if(M.duel) return mdEnd(ok);
  const x = M.x, n = M.guesses.filter(g=>!g.hint).length;
  let stars=0, coins=0, xp=0;
  if(ok){
    stars = n <= M.par ? 3 : n <= M.par+3 ? 2 : 1;
    if(M.hints) stars = Math.min(stars, 2);
    const prev = S.games.mayor[M.L]||0;
    coins = Math.round(M.pts/80) + (prev?0:5);
    xp = Math.round(M.pts/8) + (prev?0:20);
    M.newBest = M.pts > (S.mbest[M.L]||0); if(M.newBest) S.mbest[M.L] = M.pts;
    if(stars>prev) S.games.mayor[M.L] = stars;
    S.coins += coins; S.xp += xp; save();
    beep(880,.12); setTimeout(()=>beep(1175,.15),130);
  } else { beep(220,.25); if(S.games.mayor[M.L]===undefined){ S.games.mayor[M.L] = 0; save(); } }   // rendirse igual deja pasar a la siguiente
  const chips = M.guesses.filter(g=>!g.hint).map((g,i)=>`<span class="wchip mchip t-${g.tier}" style="--i:${i}"><b>${g.dir>0?"↑":g.dir<0?"↓":"✓"}</b>${mFmt(g.v)}</span>`).join("");
  $app.innerHTML = `${topBar("mlevels")}
  <div class="result mood-${ok?"good":"bad"}">
    <div class="verdict">
      <h1>${ok?"¡Lo encontraste!":"Te rendiste"}</h1>
      <p>${esc(x.q)}</p>
      <div class="wordball num">${mFmt(x.a)}${x.u?` <small>${esc(x.u)}</small>`:""}</div>
      ${ok?`<div class="stars" aria-label="${stars} de 3 estrellas">${"★".repeat(stars)}<span class="off">${"★".repeat(3-stars)}</span></div>`:""}
      ${ok?`<div class="mscore"><b class="num">${mFmt(M.pts)}</b><span>puntos${M.newBest && (n>1||M.hints) ? " · ¡tu mejor marca en este nivel!" : ""}</span></div>`:`<div class="mscore"><b class="num">0</b><span>puntos</span></div>`}
      ${ok?`<p>En <b class="num">${n}</b> ${n===1?"intento":"intentos"}. Yendo siempre a la mitad se puede en ${M.par}.</p>`:""}
    </div>
    ${x.n?`<p class="mfact">${esc(x.n)}</p>`:""}
    ${ok?`<div class="gains"><span><span class="coin"></span>+<span class="num">${coins}</span></span><span>+<span class="num">${xp}</span> XP</span></div>`:""}
    ${chips?`<div class="chainbox"><h2>Tus números</h2><div class="wchips">${chips}</div></div>`:""}
    <div class="actions">
      <button class="btn primary" data-mlv="${M.L+1}">${ok?`Nivel ${M.L+1}`:"Siguiente pregunta"}</button>
      <button class="btn" data-go="mlevels">Ver niveles</button>
    </div>
  </div>`;
  if(ok) confetti();
}
function mAction(t){
  if(t.dataset.mhelp!==undefined) return mHint();
  if(t.dataset.mgive!==undefined) return mGiveUp(t);
  if(t.dataset.mmic!==undefined){
    return rec ? stopMic() : startMic(t, alts=>{
      for(const a of alts){ const v = mParse(a) ?? parseSpoken(a); if(v!==null && v!==undefined){ const inp=document.getElementById("mguess"); if(inp) inp.value=v; return mGuess(String(v)); } }
      toast("No entendí el número. Probá de nuevo.");
    }, "Escribí un número o tocá el micrófono", "Escuchando… decí un número");
  }
}

