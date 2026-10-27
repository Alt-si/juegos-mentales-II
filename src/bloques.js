/* ---------- Bloques deslizantes: juego ---------- */
const BK_BANK = String(window.__bloques||"").split(";").filter(Boolean).map(x=>{ const [b, m] = x.split(":"); return {b, m:+m}; });
S.games.bloques = S.games.bloques || {};
const BK_BY = {};
BK_BANK.forEach((p,i)=>(BK_BY[p.m] = BK_BY[p.m] || []).push(i));
const BK_MS = Object.keys(BK_BY).map(Number).sort((a,b)=>a-b);
const BK_MAXM = BK_MS.length ? BK_MS[BK_MS.length-1] : 2;
// cada jugador recibe los puzzles en otro orden
BK_MS.forEach(m=>{ const a = BK_BY[m], r = mulberry32((S.wseed||1) + m*7919); for(let i=a.length-1;i>0;i--){ const j = Math.floor(r()*(i+1)); [a[i],a[j]] = [a[j],a[i]]; } });
// dificultad buscada (mínimo de movimientos) para cada nivel: sube rápido al principio y después más despacio
function bkTarget(L){
  const top = Math.max(4, Math.min(BK_MAXM, 34) - 2);
  const base = 2 + (top - 2) * (1 - Math.exp(-L/110));
  const j = Math.floor(mulberry32((S.wseed||1)*13 + L)()*3) - 1;
  return Math.max(2, Math.round(base) + (L > 5 ? j : 0));
}
const BK_ASSIGN = [], BK_USED = new Set(), BK_REP = {};
const BK_WALLS_FROM = 40;      // antes del nivel 40, solo tableros sin paredes
function bkPickFrom(m, walls){ const a = BK_BY[m]; if(!a) return -1; for(const i of a) if(!BK_USED.has(i) && (walls || !BK_BANK[i].b.includes("x"))) return i; return -1; }
function bkIdxFor(L){
  while(BK_ASSIGN.length < L){
    const l = BK_ASSIGN.length + 1, d = bkTarget(l), walls = l >= BK_WALLS_FROM;
    let pick = -1;
    // primero, un puzzle sin usar de dificultad parecida (±4 movimientos)
    for(let off=0; off<=4 && pick<0; off++) for(const m of [d-off, d+off]){ const i = bkPickFrom(m, walls); if(i >= 0){ pick = i; break; } }
    // si ya se usaron todos los de esa dificultad, se repite uno de esa dificultad (nunca baja a uno fácil)
    if(pick < 0){
      const m = BK_MS.reduce((a,x)=>Math.abs(x-d) < Math.abs(a-d) ? x : a, BK_MS[0]);
      const a = BK_BY[m]; BK_REP[m] = ((BK_REP[m]||0) + 1) % a.length; pick = a[BK_REP[m]];
    }
    BK_USED.add(pick); BK_ASSIGN.push(pick);
  }
  return BK_ASSIGN[L-1];
}
const bkStars = (moves, min, hints) => { let s = moves <= min ? 3 : moves <= min + Math.max(2, Math.ceil(min*.5)) ? 2 : 1; return hints ? Math.min(s, 2) : s; };
const BK_HINT = [30, 50, 80];
const BK_COLORS = ["var(--c2)","var(--c3)","var(--c6)","var(--c5)","var(--c1b)","var(--c4)","var(--c3b)","var(--c2b)","var(--c1)"];
const BK_STAGES = ["Primeros movimientos","Destrabando","Calles cortadas","Embotellamiento","Hora pico","Laberinto","Sin salida a la vista","Paciencia","Maestro del bloque","Imposible… o no"];

function blevels(){
  levelMap({title:"Bloques deslizantes", desc:"Deslizá los bloques hasta sacar el bloque rojo por la salida. Cada bloque se mueve solo en su dirección.",
    store:S.games.bloques, total:Infinity, names:BK_STAGES, attr:"blv", how:"bloques",
    label:s=>{ let lo = 99, hi = 0; for(let l=s*20+1; l<=s*20+20; l++){ const m = BK_BANK[bkIdxFor(l)].m; lo = Math.min(lo, m); hi = Math.max(hi, m); } return `se resuelven en ${lo}–${hi} movimientos`; }});
}

let B = null;
function bplay(L){
  clearTimers(); G = null; W = null; M = null; Q = null;
  if(!actx){ try{ actx = new (window.AudioContext||window.webkitAudioContext)(); }catch(e){} }
  const p = BK_BANK[bkIdxFor(L)], {blocks, walls} = bkParse(p.b);
  const start = blocks.map(bkPos);
  B = {L, blocks, walls, start, pos:start.slice(), min:p.m, moves:0, hist:[], hints:0, done:false, drag:null};
  $app.innerHTML = `${topBar("blevels")}
  <div class="bkplay">
    <div class="hud"><span>Nivel <b>${L}</b></span><span class="hudr"><span>Movimientos: <b id="bkmoves">0</b> · mínimo: <b>${B.min}</b></span>${howBtn("bloques")}</span></div>
    <div class="bkframe" id="bkframe">
      <div class="bkboard" id="bkboard">
        ${walls.map(c=>`<span class="bkwall" style="left:${c%BK_N/BK_N*100}%;top:${Math.floor(c/BK_N)/BK_N*100}%"></span>`).join("")}
        ${blocks.map((b,i)=>`<button class="bkblk ${b.h?"h":"v"} ${b.red?"red":""}" data-bk="${i}" aria-label="${b.red?"Bloque rojo":`Bloque ${b.h?"horizontal":"vertical"} de ${b.len}`}"
          style="${b.red?"":`--bc:${BK_COLORS[(i-1+BK_COLORS.length)%BK_COLORS.length]};`}width:${(b.h?b.len:1)/BK_N*100}%;height:${(b.h?1:b.len)/BK_N*100}%">${b.red?"<span>➜</span>":""}</button>`).join("")}
        <span class="bkghost" id="bkghost" hidden></span>
      </div>
      <span class="bkexit" aria-hidden="true"></span>
    </div>
    <p class="hint" id="bkmsg">Arrastrá los bloques con el dedo. Sacá el bloque rojo por la salida.</p>
    <div class="bkctl">
      <button class="help" data-bka="undo">Deshacer<small>gratis</small></button>
      <button class="help" data-bka="reset">Reiniciar<small>volver al inicio</small></button>
      <button class="help" data-bka="hint">Pista<small><span class="coin"></span><span id="bkhcost">${BK_HINT[0]}</span></small></button>
    </div>
  </div>`;
  bkRender(false);
  const board = document.getElementById("bkboard");
  board.addEventListener("pointerdown", bkDown);
  board.addEventListener("pointermove", bkMove);
  board.addEventListener("pointerup", bkUp);
  board.addEventListener("pointercancel", bkUp);
  board.addEventListener("keydown", bkKey2);
}
function bkPlace(el, b, p){
  el.style.left = `${(b.h ? p : b.c)/BK_N*100}%`;
  el.style.top = `${(b.h ? b.r : p)/BK_N*100}%`;
}
function bkRender(){
  const els = document.querySelectorAll(".bkblk");
  els.forEach(el=>{ const i = +el.dataset.bk; bkPlace(el, B.blocks[i], B.pos[i]); });
  const m = document.getElementById("bkmoves"); if(m) m.textContent = B.moves;
}
// mueve un bloque con animación (desde donde se ve ahora hasta su casilla)
function bkAnimate(el, b, fromPx){
  el.classList.add("drag");
  el.style.transform = fromPx ? (b.h ? `translateX(${fromPx}px)` : `translateY(${fromPx}px)`) : "";
  void el.offsetWidth;
  el.classList.remove("drag");
  el.style.transform = "";
}
function bkSet(i, np, fromPx){
  const el = document.querySelector(`.bkblk[data-bk="${i}"]`), b = B.blocks[i];
  if(np !== B.pos[i]){
    B.hist.push(B.pos.slice()); B.pos[i] = np; B.moves++;
    beep(520 + (i%6)*40, .04);
    bkHintOff();
  }
  if(el){ bkPlace(el, b, B.pos[i]); bkAnimate(el, b, fromPx); }
  const m = document.getElementById("bkmoves"); if(m) m.textContent = B.moves;
  if(bkGoal(B.pos)) bkWin();
}
function bkDown(e){
  const el = e.target.closest && e.target.closest(".bkblk"); if(!el || !B || B.done) return;
  e.preventDefault();
  const i = +el.dataset.bk, [lo, hi] = bkRange(B.blocks, B.pos, B.walls, i);
  const board = document.getElementById("bkboard");
  B.drag = {i, el, x:e.clientX, y:e.clientY, lo, hi, cell: board.clientWidth/BK_N, p:B.pos[i], cur:B.pos[i], id:e.pointerId};
  try{ el.setPointerCapture(e.pointerId); }catch(_){}
  el.classList.add("drag");
}
function bkMove(e){
  const d = B && B.drag; if(!d || e.pointerId !== d.id) return;
  const b = B.blocks[d.i], delta = (b.h ? e.clientX - d.x : e.clientY - d.y) / d.cell;
  d.cur = Math.max(d.lo, Math.min(d.hi, d.p + delta));
  d.el.style.transform = b.h ? `translateX(${(d.cur-d.p)*d.cell}px)` : `translateY(${(d.cur-d.p)*d.cell}px)`;
}
function bkUp(e){
  const d = B && B.drag; if(!d || e.pointerId !== d.id) return;
  B.drag = null;
  const np = Math.round(d.cur);
  bkSet(d.i, np, (d.cur - np) * d.cell);
}
function bkKey2(e){
  const el = e.target.closest && e.target.closest(".bkblk"); if(!el || !B || B.done) return;
  const i = +el.dataset.bk, b = B.blocks[i];
  const dir = {ArrowLeft:-1, ArrowRight:1, ArrowUp:-1, ArrowDown:1}[e.key];
  if(dir === undefined || (b.h !== (e.key==="ArrowLeft"||e.key==="ArrowRight"))) return;
  e.preventDefault();
  const [lo, hi] = bkRange(B.blocks, B.pos, B.walls, i), np = Math.max(lo, Math.min(hi, B.pos[i] + dir));
  bkSet(i, np, 0); el.focus();
}
function bkHintOff(){ document.querySelectorAll(".bkblk.hint").forEach(x=>x.classList.remove("hint")); const g = document.getElementById("bkghost"); if(g) g.hidden = true; }
function bkAction(a){
  if(!B || B.done) return;
  if(a === "undo"){
    if(!B.hist.length){ toast("No hay movimientos para deshacer."); return; }
    const prev = B.hist.pop(), i = prev.findIndex((p,k)=>p !== B.pos[k]);
    const cell = document.getElementById("bkboard").clientWidth/BK_N;
    const from = (B.pos[i] - prev[i]) * cell;
    B.pos = prev; B.moves = Math.max(0, B.moves - 1); bkHintOff();
    const el = document.querySelector(`.bkblk[data-bk="${i}"]`); if(el){ bkPlace(el, B.blocks[i], B.pos[i]); bkAnimate(el, B.blocks[i], from); }
    const m = document.getElementById("bkmoves"); if(m) m.textContent = B.moves;
    return;
  }
  if(a === "reset"){ B.pos = B.start.slice(); B.moves = 0; B.hist = []; bkHintOff(); bkRender(); return; }
  if(a === "hint"){
    const cost = BK_HINT[Math.min(B.hints, BK_HINT.length-1)];
    if(S.coins < cost){ toast(`Necesitás ${cost} monedas para una pista.`); return; }
    const sol = bkSolve(B.blocks, B.pos, B.walls);
    if(!sol || !sol.path.length){ toast("No encontré una pista desde acá. Probá reiniciar."); return; }
    S.coins -= cost; B.hints++; save();
    const c = document.querySelector(".coins .num"); if(c) c.textContent = S.coins;
    const hc = document.getElementById("bkhcost"); if(hc) hc.textContent = BK_HINT[Math.min(B.hints, BK_HINT.length-1)];
    const [bi, bp] = sol.path[0], b = B.blocks[bi];
    bkHintOff();
    const el = document.querySelector(`.bkblk[data-bk="${bi}"]`); if(el) el.classList.add("hint");
    const g = document.getElementById("bkghost");
    if(g){ g.hidden = false; g.style.width = el.style.width; g.style.height = el.style.height; bkPlace(g, b, bp); }
    const msg = document.getElementById("bkmsg");
    if(msg) msg.innerHTML = `Pista: mové el bloque marcado hasta la silueta punteada. Desde acá se resuelve en <b>${sol.moves}</b> ${sol.moves===1?"movimiento":"movimientos"}.`;
  }
}
function bkWin(){
  B.done = true;
  const red = document.querySelector(".bkblk.red");
  const cell = document.getElementById("bkboard").clientWidth/BK_N;
  if(red){ red.classList.add("out"); red.style.transform = `translateX(${cell*2.6}px)`; }
  beep(880,.12); setTimeout(()=>beep(1175,.15),130);
  timers.push(setTimeout(bkEnd, 650));
}
function bkEnd(){
  clearTimers();
  const stars = bkStars(B.moves, B.min, B.hints), prev = S.games.bloques[B.L]||0;
  const coins = stars*3 + (prev?0:5) + Math.floor(B.L/10), xp = (10 + B.min*3)*stars + (prev?0:20);
  if(stars > prev) S.games.bloques[B.L] = stars;
  S.coins += coins; S.xp += xp; save();
  $app.innerHTML = `${topBar("blevels")}
  <div class="result mood-good">
    <div class="verdict">
      <h1>¡Bloque liberado!</h1>
      <p>En <b class="num">${B.moves}</b> ${B.moves===1?"movimiento":"movimientos"}${B.hints?` y ${B.hints} ${B.hints===1?"pista":"pistas"}`:""}. El mínimo era <b class="num">${B.min}</b>.</p>
      <div class="stars" aria-label="${stars} de 3 estrellas">${"★".repeat(stars)}<span class="off">${"★".repeat(3-stars)}</span></div>
      ${B.moves === B.min ? `<p><b>¡Perfecto! Lo resolviste con la menor cantidad de movimientos posible.</b></p>` : ""}
    </div>
    <div class="gains"><span><span class="coin"></span>+<span class="num">${coins}</span></span><span>+<span class="num">${xp}</span> XP</span></div>
    <p class="hint">3 estrellas con ${B.min} movimientos, 2 con hasta ${B.min + Math.max(2, Math.ceil(B.min*.5))}. Con pistas, máximo 2.</p>
    <div class="actions">
      <button class="btn primary" data-blv="${B.L+1}">Nivel ${B.L+1}</button>
      <button class="btn" data-blv="${B.L}">Jugar de nuevo</button>
      <button class="btn" data-go="blevels">Ver niveles</button>
    </div>
  </div>`;
  confetti();
}

