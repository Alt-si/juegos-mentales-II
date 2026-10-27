/* ---------- Secuencia: luces de colores y sonidos ---------- */
// El juego enciende una secuencia de botones, cada uno con su nota. Hay que repetirla en el mismo orden.
// Con cada acierto se agrega una luz. Arranca con 4 botones; con muchos puntos en una partida se suman más, hasta 8.
const SQ_COLORS = ["#22C55E","#EF4444","#FACC15","#3B82F6","#A855F7","#FB923C","#EC4899","#14B8A6"];
const SQ_NAMES  = ["verde","rojo","amarillo","azul","violeta","naranja","rosa","turquesa"];
const SQ_NOTES  = [329.63, 392.00, 440.00, 523.25, 587.33, 659.25, 783.99, 880.00];
const SQ_UNLOCK = [1500, 4000, 8000, 14000];          // puntos para el 5.º, 6.º, 7.º y 8.º botón
const SQ_TIMEOUT = 6000;                              // tiempo máximo entre toque y toque
const SQ_REPLAY = 20, SQ_REVIVE = 50;                 // costos en monedas
S.simon = Object.assign({best:0, round:0, games:0, pads:4}, S.simon);
let Q = null;

function sqTone(i, ms){
  try{
    if(!actx) return;
    const t = actx.currentTime, o = actx.createOscillator(), g = actx.createGain();
    o.type = "triangle"; o.frequency.value = SQ_NOTES[i];
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.22, t + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, t + ms/1000);
    o.connect(g).connect(actx.destination); o.start(t); o.stop(t + ms/1000 + 0.05);
  }catch(e){}
}
function sqBuzz(){
  try{
    if(!actx) return;
    const t = actx.currentTime, o = actx.createOscillator(), g = actx.createGain();
    o.type = "sawtooth"; o.frequency.setValueAtTime(140, t); o.frequency.exponentialRampToValueAtTime(70, t + .45);
    g.gain.setValueAtTime(0.12, t); g.gain.exponentialRampToValueAtTime(0.0001, t + .5);
    o.connect(g).connect(actx.destination); o.start(t); o.stop(t + .55);
  }catch(e){}
}
function sqBoardHtml(n, center){
  const R = 96, r = 40, rad = a => a*Math.PI/180;
  let paths = "";
  for(let i=0;i<n;i++){
    const a0 = -90 + i*360/n, a1 = -90 + (i+1)*360/n, large = (a1-a0) > 180 ? 1 : 0;
    const P = (rr, a) => `${(rr*Math.cos(rad(a))).toFixed(2)} ${(rr*Math.sin(rad(a))).toFixed(2)}`;
    paths += `<path class="sqpad" data-sq="${i}" role="button" tabindex="0" aria-label="Botón ${SQ_NAMES[i]}, tecla ${i+1}" style="--pc:${SQ_COLORS[i]}"
      d="M${P(R,a0)} A${R} ${R} 0 ${large} 1 ${P(R,a1)} L${P(r,a1)} A${r} ${r} 0 ${large} 0 ${P(r,a0)} Z"/>`;
  }
  return `<svg viewBox="-100 -100 200 200" aria-label="Tablero de ${n} botones">${paths}</svg>
    <div class="sqcenter"><b id="sqc" class="num">${center||""}</b><span id="sqcs"></span></div>`;
}
function sqNextGoal(score){
  const k = SQ_UNLOCK.findIndex(t => score < t);
  return k < 0 ? null : {pad: 5 + k, at: SQ_UNLOCK[k], from: k ? SQ_UNLOCK[k-1] : 0};
}

/* pantalla de inicio del juego */
function sqScreen(){
  clearTimers(); G = null; W = null; M = null; Q = null;
  const s = S.simon, goal = sqNextGoal(s.best);
  $app.innerHTML = `${topBar("home")}
  <div class="hello"><div class="titlerow"><h1>Secuencia</h1>${howBtn("secuencia")}</div>
  <p>Mirá y escuchá la secuencia de luces, y repetila en el mismo orden. Cada vez que acertás se suma una luz más.</p></div>
  <div class="dstats sqstats">
    <div><b class="num">${mFmt(s.best)}</b><span>récord de puntos</span></div>
    <div><b class="num">${s.round}</b><span>mejor ronda</span></div>
    <div><b class="num">${s.pads}</b><span>botones alcanzados</span></div>
    <div><b class="num">${s.games}</b><span>partidas</span></div>
  </div>
  <div class="sqboard idle">${sqBoardHtml(4, "▶")}</div>
  <p class="hint sqgoal">${goal ? `Llegá a <b>${mFmt(goal.at)}</b> puntos en una partida para sumar el ${goal.pad}.º botón.` : "¡Ya llegaste a los 8 botones!"}</p>
  <div class="actions"><button class="btn primary" data-sqa="start">Empezar</button></div>`;
  const b = $app.querySelector(".sqboard"); if(b) b.addEventListener("click", ()=>sqStart());
  howFirst("secuencia");
}

/* partida */
function sqStart(){
  clearTimers(); G = null; W = null; M = null;
  if(!actx){ try{ actx = new (window.AudioContext||window.webkitAudioContext)(); }catch(e){} }
  try{ actx && actx.state === "suspended" && actx.resume(); }catch(e){}
  Q = {seq:[], pads:4, round:0, score:0, idx:0, phase:"show", revived:false, replayed:false, rev:false, t:[]};
  $app.innerHTML = `${topBar("secuencia")}
  <div class="sqplay">
    <div class="hud"><span>Ronda <b id="sqround">0</b></span><span class="hudr"><span><b id="sqscore" class="num">0</b> puntos</span>${howBtn("secuencia")}</span></div>
    <div class="sqbanner" id="sqbanner" hidden></div>
    <div class="sqboard wait" id="sqboard"></div>
    <p class="hint sqmsg" id="sqmsg">Mirá y escuchá…</p>
    <div class="sqgoalbar" id="sqgoal"></div>
    <div class="sqctl" id="sqctl"></div>
  </div>`;
  sqRenderBoard();
  sqNext();
}
function sqT(fn, ms){ const id = setTimeout(fn, ms); Q.t.push(id); timers.push(id); return id; }
function sqClearT(){ if(!Q) return; Q.t.forEach(clearTimeout); Q.t = []; }
function sqRenderBoard(){
  const b = document.getElementById("sqboard"); if(!b) return;
  b.innerHTML = sqBoardHtml(Q.pads, Q.round || "");
  b.classList.toggle("p8", Q.pads >= 7);
  const svg = b.querySelector("svg");
  svg.addEventListener("pointerdown", e => { const p = e.target.closest && e.target.closest("[data-sq]"); if(p){ e.preventDefault(); sqPress(+p.dataset.sq); } });
  svg.addEventListener("keydown", e => { if((e.key==="Enter"||e.key===" ") && e.target.dataset && e.target.dataset.sq!==undefined){ e.preventDefault(); sqPress(+e.target.dataset.sq); } });
}
function sqCenter(big, small){
  const c = document.getElementById("sqc"), s = document.getElementById("sqcs");
  if(c && big!==undefined) c.textContent = big;
  if(s) s.textContent = small || "";
}
function sqMsg(t){ const m = document.getElementById("sqmsg"); if(m) m.innerHTML = t; }
function sqHud(){
  const r = document.getElementById("sqround"), s = document.getElementById("sqscore");
  if(r) r.textContent = Q.round; if(s) s.textContent = mFmt(Q.score);
  const g = document.getElementById("sqgoal"), goal = sqNextGoal(Q.score);
  if(g) g.innerHTML = goal
    ? `<div class="sqgtxt"><span>Próximo botón (${goal.pad}.º)</span><span class="num">${mFmt(Q.score)} / ${mFmt(goal.at)}</span></div><div class="bar"><i style="width:${Math.min(100,(Q.score-goal.from)/(goal.at-goal.from)*100)}%"></i></div>`
    : `<div class="sqgtxt"><span>¡Los 8 botones en juego!</span></div>`;
  const ctl = document.getElementById("sqctl");
  if(ctl && Q.phase !== "over") ctl.innerHTML = `<button class="help" data-sqa="replay" ${Q.phase!=="input"||Q.replayed||S.coins<SQ_REPLAY?"disabled":""}>Ver de nuevo<small><span class="coin"></span>${SQ_REPLAY}</small></button>`;
}
function sqLight(i, ms, sound=true){
  const p = document.querySelector(`.sqpad[data-sq="${i}"]`); if(!p) return;
  p.classList.add("on"); if(sound) sqTone(i, ms);
  const id = setTimeout(()=>p.classList.remove("on"), ms); timers.push(id);
}
function sqNext(){
  Q.round++; Q.idx = 0; Q.replayed = false;
  const want = 4 + SQ_UNLOCK.filter(t => Q.score >= t).length;
  let added = false;
  if(want > Q.pads){ Q.pads = want; added = true; sqRenderBoard(); }
  Q.seq.push(added ? Q.pads - 1 : Math.floor(Math.random()*Q.pads));     // un botón nuevo entra en la secuencia
  Q.rev = Q.round >= 10 && Q.round % 5 === 0;
  const ban = document.getElementById("sqbanner");
  if(ban){
    if(added){ ban.hidden = false; ban.className = "sqbanner new"; ban.innerHTML = `<b>¡Nuevo botón!</b> Ahora juegan ${Q.pads} colores y cada ronda vale más.`; beep(988,.1); setTimeout(()=>beep(1319,.12),110); }
    else if(Q.rev){ ban.hidden = false; ban.className = "sqbanner rev"; ban.innerHTML = `<b>Ronda especial:</b> repetí la secuencia <b>AL REVÉS</b>. Vale el doble.`; }
    else ban.hidden = true;
  }
  sqHud();
  sqPlay(added || Q.rev ? 1500 : 650);
}
function sqSpeed(){ return {on: Math.max(220, 560 - Q.round*12), gap: Math.max(80, 200 - Q.round*4)}; }
function sqPlay(delay){
  sqClearT();
  Q.phase = "show"; Q.idx = 0;
  const b = document.getElementById("sqboard"); if(b) b.classList.add("wait");
  sqCenter(Q.round, "mirá"); sqMsg("Mirá y escuchá…"); sqHud();
  const {on, gap} = sqSpeed();
  Q.seq.forEach((k, j) => sqT(()=>sqLight(k, on), delay + j*(on+gap)));
  sqT(()=>{
    Q.phase = "input";
    if(b) b.classList.remove("wait");
    sqCenter(Q.round, Q.rev ? "¡al revés!" : "tu turno");
    sqMsg(Q.rev ? "Tocá los botones <b>al revés</b>: del último al primero." : "Tu turno: tocá los botones en el mismo orden.");
    sqHud(); sqArmTimeout();
  }, delay + Q.seq.length*(on+gap));
}
function sqArmTimeout(){
  if(Q.to) clearTimeout(Q.to);
  Q.to = sqT(function check(){
    if(!Q || Q.phase !== "input") return;
    const how = document.getElementById("howsheet");
    if(how && !how.hidden){ Q.to = sqT(check, 1000); return; }      // con la ayuda abierta, no corre el reloj
    sqFail(true);
  }, SQ_TIMEOUT);
}
function sqPress(i){
  if(!Q || Q.phase !== "input" || i >= Q.pads) return;
  sqLight(i, 220);
  const n = Q.seq.length, want = Q.rev ? Q.seq[n-1-Q.idx] : Q.seq[Q.idx];
  if(i !== want) return sqFail(false, want);
  Q.idx++;
  if(Q.idx < n){ sqArmTimeout(); return; }
  // ronda completa
  sqClearT();
  Q.phase = "ok";
  let pts = n * 10 * (Q.pads - 3) * (Q.rev ? 2 : 1);
  if(Q.replayed) pts = Math.round(pts/2);
  Q.score += pts;
  sqCenter("+" + pts, "¡bien!"); sqMsg(`¡Bien! La secuencia tiene ahora ${n+1} luces.`);
  sqHud();
  sqT(()=>sqNext(), 700);
}
function sqFail(timeout, want){
  sqClearT();
  Q.phase = "fail";
  sqBuzz();
  if(want !== undefined) sqT(()=>sqLight(want, 650, false), 250);
  const b = document.getElementById("sqboard"); if(b){ b.classList.add("wait","shake"); sqT(()=>b.classList.remove("shake"), 500); }
  sqCenter("✕", timeout ? "sin tiempo" : "¡uy!");
  sqMsg(timeout ? "Se acabó el tiempo para tocar." : `Era el <b>${SQ_NAMES[want]}</b>.`);
  const ctl = document.getElementById("sqctl");
  if(!Q.revived && S.coins >= SQ_REVIVE && ctl){
    Q.phase = "over";
    ctl.innerHTML = `<div class="sqrevive">
      <button class="btn primary" data-sqa="revive">Seguir jugando<small><span class="coin"></span>${SQ_REVIVE}</small></button>
      <button class="btn" data-sqa="end">Terminar</button></div>`;
    return;
  }
  sqT(()=>sqEnd(), 1300);
}
function sqEnd(){
  sqClearT(); clearTimers();
  const s = S.simon, rounds = Q.round - 1, score = Q.score;
  const record = score > s.best;
  s.games++; if(record) s.best = score; if(rounds > s.round) s.round = rounds; if(Q.pads > s.pads) s.pads = Q.pads;
  const coins = Math.round(score/120) + rounds, xp = Math.round(score/15);
  S.coins += coins; S.xp += xp; save();
  Q.phase = "end";
  if(record && score > 0){ beep(880,.12); setTimeout(()=>beep(1175,.15),130); }
  $app.innerHTML = `${topBar("secuencia")}
  <div class="result mood-${record && score>0 ? "good" : "warn"}">
    <div class="verdict">
      <h1>${record && score>0 ? "¡Nuevo récord!" : "Fin de la partida"}</h1>
      <p>Llegaste a la ronda <b class="num">${Q.round}</b> con <b>${Q.pads}</b> botones</p>
      <div class="mscore"><b class="num">${mFmt(score)}</b><span>puntos${record ? "" : ` · récord: ${mFmt(s.best)}`}</span></div>
      <div class="sqdots">${Q.seq.map((k,j)=>`<i style="background:${SQ_COLORS[k]};--i:${j}" title="${SQ_NAMES[k]}"></i>`).join("")}</div>
    </div>
    <div class="gains"><span><span class="coin"></span>+<span class="num">${coins}</span></span><span>+<span class="num">${xp}</span> XP</span></div>
    ${sqNextGoal(s.best) ? `<p class="hint">Llegá a ${mFmt(sqNextGoal(s.best).at)} puntos en una partida para jugar con ${sqNextGoal(s.best).pad} botones.</p>` : ""}
    <div class="actions">
      <button class="btn primary" data-sqa="start">Jugar de nuevo</button>
      <button class="btn" data-go="home">Inicio</button>
    </div>
  </div>`;
  if(record && score>0) confetti();
}
function sqAction(a){
  if(a === "start") return sqStart();
  if(!Q) return;
  if(a === "replay"){
    if(Q.phase !== "input" || Q.replayed || S.coins < SQ_REPLAY) return;
    S.coins -= SQ_REPLAY; Q.replayed = true; save();
    const c = document.querySelector(".coins .num"); if(c) c.textContent = S.coins;
    toast("Te mostramos la secuencia otra vez. Esta ronda vale la mitad.");
    return sqPlay(500);
  }
  if(a === "revive"){
    if(Q.revived || S.coins < SQ_REVIVE) return;
    S.coins -= SQ_REVIVE; Q.revived = true; save();
    const c = document.querySelector(".coins .num"); if(c) c.textContent = S.coins;
    const ctl = document.getElementById("sqctl"); if(ctl) ctl.innerHTML = "";
    return sqPlay(700);
  }
  if(a === "end") return sqEnd();
}
document.addEventListener("keydown", e => {
  if(!Q || Q.phase !== "input" || !/^[1-8]$/.test(e.key)) return;
  const how = document.getElementById("howsheet"); if(how && !how.hidden) return;
  sqPress(+e.key - 1);
});

