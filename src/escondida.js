/* ---------- Palabra escondida ---------- */
const W_STAGES = ["Cosas de todos los días","Lugares y objetos","Ideas y emociones","Más difícil"];
const STOP = new Set("de del la las el los y o u e en a al un una unos unas con por para que se su sus lo le les mi tu".split(" "));
const norm = s => String(s).toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g,"").replace(/[^a-z]/g,"");
function wAddTo(map, t, r){
  const n = norm(t);
  if(n.length<2 || STOP.has(n) || map.has(n)) return false;
  // singular y plural cuentan como la misma palabra
  if(map.has(n.replace(/es$/,"")) && n.endsWith("es") || map.has(n.replace(/s$/,"")) && n.endsWith("s") || map.has(n+"s") || map.has(n+"es")) return false;
  map.set(n, {w:t, r}); return true;
}
const WDATA = (window.__escondida||[]).map(([w,a,b])=>{
  const map = new Map(); map.set(norm(w), {w, r:1});
  const top = []; let r = 2;
  for(const t of a.split(/\s+/)) if(wAddTo(map, t, r)){ top.push({w:t,r}); r++; }
  let rb = Math.max(150, r+40);
  for(const t of b.split(/\s+/)) if(wAddTo(map, t, rb)) rb += 3;
  return {w, map, top};
});
// índice global: en qué listas aparece cada palabra
const WGLOBAL = new Map();
WDATA.forEach((lv,i)=>{ for(const [n,v] of lv.map){ if(!WGLOBAL.has(n)) WGLOBAL.set(n,[]); WGLOBAL.get(n).push({i, r:v.r, w:v.w}); } });
function wForms(g){
  const n = norm(g); if(!n) return [];
  const c = [n];
  if(n.endsWith("es")) c.push(n.slice(0,-2));
  if(n.endsWith("s")) c.push(n.slice(0,-1));
  c.push(n+"s", n+"es");
  return c;
}
function wLookup(lv, g){
  const forms = wForms(g);
  for(const k of forms) if(lv.map.has(k)) return lv.map.get(k);
  // no está en la lista: estimar la distancia pasando por otra palabra escondida que sí esté
  let best = null;
  for(const k of forms){
    for(const ref of (WGLOBAL.get(k)||[])){
      const via = lv.map.get(norm(WDATA[ref.i].w));
      if(!via) continue;
      const est = Math.min(999, 300 + via.r + ref.r);
      if(!best || est < best.r) best = {w:ref.w, r:est};
    }
  }
  return best;
}
const tierOf = r => r===null ? "bad" : r<=50 ? "good" : r<=300 ? "warn" : "bad";

function wlevels(){
  levelMap({title:"Palabra escondida", desc:"Escribí palabras. Cuanto más chico el número, más cerca estás. La escondida es la número 1.",
    store:S.games.escondida, total:WDATA.length, names:W_STAGES, attr:"wlv",
    label:s=>`${Math.min(20, WDATA.length-s*20)} palabras · ${s===0?"fáciles":s===1?"intermedias":"difíciles"}`});
}

let W = null;
const MIC_SVG = `<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="9" y="2.5" width="6" height="12" rx="3" fill="currentColor"/><path d="M5 11a7 7 0 0 0 14 0"/><path d="M12 18v3.5"/><path d="M8.5 21.5h7"/></svg>`;
function wplay(L){
  clearTimers(); G = null;
  if(!actx){ try{ actx = new (window.AudioContext||window.webkitAudioContext)(); }catch(e){} }
  W = {L, lv:WDATA[L-1], guesses:[], last:null, hints:0, done:false};
  $app.innerHTML = `${topBar("wlevels")}
  <div class="wplay">
    <div class="hud"><span>Nivel <b>${L}</b></span><span>Intentos: <b id="wcount">0</b></span></div>
    <form class="wform" id="wform" autocomplete="off">
      <input id="wguess" type="text" inputmode="text" autocapitalize="off" autocorrect="off" spellcheck="false" maxlength="24" placeholder="Escribí una palabra" aria-label="Tu palabra">
      <button type="button" class="wmic" data-wmic aria-label="Decir una palabra">${MIC_SVG}</button>
      <button type="submit" class="wsend">Probar</button>
    </form>
    <p class="hint" id="micst">Escribí una palabra o tocá el micrófono</p>
    <div class="legend"><span class="t-good"><i></i>1–50 muy cerca</span><span class="t-warn"><i></i>51–300 cerca</span><span class="t-bad"><i></i>más de 300 lejos</span></div>
    <div id="wlast"></div>
    <div class="whelps">
      <button class="help" data-whelp>Pista<small><span class="coin"></span>30</small></button>
      <button class="help" data-wgive>Rendirse<small>ver la palabra</small></button>
    </div>
    <div class="wsec" id="wsec" hidden>Tus palabras, de la más cercana a la más lejana</div>
    <ol class="wlist" id="wlist"></ol>
  </div>`;
  document.getElementById("wform").addEventListener("submit", e => {
    e.preventDefault(); const inp = document.getElementById("wguess"); wGuess(inp.value);
  });
  wRender();
}
function wRow(g, last){
  const t = tierOf(g.r);
  const pct = g.r===null ? 3 : Math.max(4, (1 - Math.log(g.r)/Math.log(1000))*100);
  return `<li class="wrow t-${t} ${last?"last":""}"><span class="wbar" style="width:${pct}%"></span>
    <span class="wword">${esc(g.word)}</span>${g.hint?`<span class="wtag">pista</span>`:""}
    <span class="wrank num">${g.r===null?"+1000":g.r}</span></li>`;
}
function wRender(){
  document.getElementById("wcount").textContent = W.guesses.length;
  const last = document.getElementById("wlast");
  last.innerHTML = W.last ? `<ol class="wlist">${wRow(W.last,true)}</ol>`
    : `<div class="wempty">Probá con cualquier palabra para empezar. Por ejemplo: <b>casa</b>, <b>animal</b> o <b>comida</b>.</div>`;
  const sorted = [...W.guesses].sort((a,b)=>(a.r??1e9)-(b.r??1e9));
  document.getElementById("wlist").innerHTML = sorted.map(g=>wRow(g,false)).join("");
  document.getElementById("wsec").hidden = W.guesses.length < 2;
}
function wAdd(g){
  W.guesses.push(g); W.last = g; wRender();
  const t = tierOf(g.r); beep(t==="good"?880:t==="warn"?620:300, .07);
  if(g.r===1) timers.push(setTimeout(()=>wEnd(true), 450));
}
function wGuess(text){
  if(!W || W.done) return;
  const raw = String(text).trim().split(/\s+/)[0] || "";
  const n = norm(raw);
  const inp = document.getElementById("wguess");
  if(n.length < 2){ toast("Escribí una palabra de al menos 2 letras."); return; }
  const hit = wLookup(W.lv, raw);
  const key = hit ? norm(hit.w) : n;
  const dup = W.guesses.find(g=>g.key===key);
  if(dup){ toast(`Ya probaste "${dup.word}": está en el puesto ${dup.r===null?"+1000":dup.r}.`); if(inp){inp.value=""; inp.focus();} return; }
  wAdd({word: hit ? hit.w : raw.toLowerCase(), r: hit ? hit.r : null, key, hint:false});
  if(inp){ inp.value=""; inp.focus(); }
}
function wHint(){
  if(!W || W.done) return;
  if(S.coins < 30){ toast("Necesitás 30 monedas para una pista."); return; }
  const best = Math.min(...W.guesses.map(g=>g.r??Infinity), Infinity);
  if(best <= 2){ toast("Ya estás a un paso. ¡Vos podés!"); return; }
  const target = best > 120 ? 60 : Math.max(2, Math.floor(best/2));
  const used = new Set(W.guesses.map(g=>g.key));
  let pick = null;
  for(const v of W.lv.map.values()){
    if(v.r<=1 || v.r>=best || used.has(norm(v.w))) continue;
    if(!pick || Math.abs(v.r-target) < Math.abs(pick.r-target)) pick = v;
  }
  if(!pick){ toast("No hay más pistas para esta palabra."); return; }
  S.coins -= 30; W.hints++; save();
  document.querySelector(".coins .num").textContent = S.coins;
  wAdd({word:pick.w, r:pick.r, key:norm(pick.w), hint:true});
}
function wGiveUp(btn){
  if(!W || W.done) return;
  if(!btn.dataset.sure){ btn.dataset.sure="1"; btn.innerHTML = `¿Seguro?<small>tocá de nuevo</small>`;
    timers.push(setTimeout(()=>{ if(document.body.contains(btn)){ delete btn.dataset.sure; btn.innerHTML=`Rendirse<small>ver la palabra</small>`; } }, 3000)); return; }
  wEnd(false);
}
function wEnd(ok){
  W.done = true; clearTimers();
  const n = W.guesses.length;
  let stars=0, coins=0, xp=0;
  if(ok){
    stars = n<=10 ? 3 : n<=25 ? 2 : 1;
    if(W.hints) stars = Math.min(stars, 2);
    const prev = S.games.escondida[W.L]||0;
    coins = stars*4 + (prev?0:6) + Math.floor(W.L/10);
    xp = (15 + W.L*2) * stars + (prev?0:20);
    if(stars>prev) S.games.escondida[W.L] = stars;
    S.coins += coins; S.xp += xp; save();
    beep(880,.12); setTimeout(()=>beep(1175,.15),130);
  } else beep(220,.25);
  const chips = W.lv.top.slice(0,10).map((t,i)=>`<span class="wchip" style="--i:${i}"><b>${t.r}</b>${esc(t.w)}</span>`).join("");
  $app.innerHTML = `${topBar("wlevels")}
  <div class="result mood-${ok?"good":"bad"}">
    <div class="verdict">
      <h1>${ok?"¡La encontraste!":"Te rendiste"}</h1>
      <p>${ok?`En <b class="num">${n}</b> ${n===1?"intento":"intentos"}${W.hints?` y ${W.hints} ${W.hints===1?"pista":"pistas"}`:""}`:"La palabra escondida era"}</p>
      <div class="wordball">${esc(W.lv.w)}</div>
      ${ok?`<div class="stars" aria-label="${stars} de 3 estrellas">${"★".repeat(stars)}<span class="off">${"★".repeat(3-stars)}</span></div>`:""}
    </div>
    ${ok?`<div class="gains"><span><span class="coin"></span>+<span class="num">${coins}</span></span><span>+<span class="num">${xp}</span> XP</span></div>`:""}
    ${ok?`<p class="hint">3 estrellas: hasta 10 intentos · 2: hasta 25 · con pistas, máximo 2</p>`:""}
    <div class="chainbox"><h2>Las más cercanas</h2><div class="wchips">${chips}</div></div>
    <div class="actions">
      ${ok && W.L<WDATA.length?`<button class="btn primary" data-wlv="${W.L+1}">Nivel ${W.L+1}</button>`:""}
      ${!ok && W.L<WDATA.length && S.games.escondida[W.L]?`<button class="btn primary" data-wlv="${W.L+1}">Nivel ${W.L+1}</button>`:""}
      <button class="btn ${ok?"":"primary"}" data-wlv="${W.L}">${ok?"Jugar de nuevo":"Volver a intentar"}</button>
      <button class="btn" data-go="wlevels">Ver niveles</button>
    </div>
  </div>`;
  if(ok) confetti();
}

