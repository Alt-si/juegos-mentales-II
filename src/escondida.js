/* ---------- Palabra escondida ---------- */
const W_STAGES = ["Cosas de todos los días","Lugares y objetos","Ideas y emociones","Animales y comida","Casa y ciudad","Más específicas","Naturaleza y cultura","Sentimientos","Grandes ideas","Expertos"];
const STOP = new Set("de del la las el los y o u e en a al un una unos unas con por para que se su sus lo le les mi tu".split(" "));
const norm = s => String(s).toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g,"").replace(/[^a-z]/g,"");
const plurals = n => [n+"s", n+"es"];
const singulars = n => { const c=[]; if(n.endsWith("es")) c.push(n.slice(0,-2)); if(n.endsWith("s")) c.push(n.slice(0,-1)); return c; };

/* vocabulario: cada palabra con sus subcategorías (dominio/categoría/sub + posición) y etiquetas */
const VOCAB = []; const VIDX = new Map();
function vFind(n){
  if(VIDX.has(n)) return VIDX.get(n);
  for(const k of singulars(n)) if(VIDX.has(k)) return VIDX.get(k);
  for(const k of plurals(n)) if(VIDX.has(k)) return VIDX.get(k);
  return -1;
}
function vAdd(w, mem, tags){
  const n = norm(w); if(n.length<2 || STOP.has(n)) return -1;
  let i = vFind(n);
  if(i<0){ i = VOCAB.length; VOCAB.push({w, n, mem:[], tags:new Set()}); VIDX.set(n, i); }
  const e = VOCAB[i];
  if(mem && !e.mem.some(m=>m.s===mem.s)) e.mem.push(mem);
  if(tags) tags.forEach(t=>e.tags.add(t));
  return i;
}
(window.__vocab||[]).forEach(text=>{
  for(const line of text.split("\n")){
    const m = line.match(/^\s*([^|#]+)\|([^:]+):\s*(.+)$/); if(!m) continue;
    const path = m[1].trim().split("/"), tags = m[2].split(",").map(t=>t.trim()).filter(Boolean);
    const sKey = path.join("/"), cKey = path.slice(0,2).join("/"), dKey = path[0];
    m[3].trim().split(/\s+/).forEach((w,pos)=>vAdd(w, {d:dKey, c:cKey, s:sKey, pos}, tags));
  }
});

/* niveles con listas a mano (cercanas y relacionadas) */
function listIdx(text){ const out=[]; const seen=new Set();
  for(const t of text.split(/\s+/)){ const i = vAdd(t); if(i<0 || seen.has(i)) continue; seen.add(i); out.push(i); } return out; }
const WDATA = (window.__escondida||[]).map(([w,a,b])=>{
  const si = vAdd(w); const A = listIdx(a).filter(i=>i!==si), B = listIdx(b).filter(i=>i!==si&&!A.includes(i));
  return {w:VOCAB[si].w, si, A, B};
});
String(window.__escondidaExtra||"").trim().split(/\s+/).forEach(w=>{
  const i = vFind(norm(w)); if(i<0 || WDATA.some(l=>l.si===i)) return;
  WDATA.push({w:VOCAB[i].w, si:i, A:[], B:[]});
});
const CURATED = new Map(); WDATA.forEach(l=>{ if(l.A.length) CURATED.set(l.si, l); });

// palabras sueltas de las listas a mano: heredan la categoría (no la subcategoría) de la palabra escondida donde aparecen
CURATED.forEach(T=>{ const sec = VOCAB[T.si];
  [...T.A, ...T.B].forEach(i=>{ const x = VOCAB[i]; if(x.inferred===undefined) x.inferred = !x.mem.length;
    if(!x.inferred) return;
    sec.mem.forEach(m=>{ if(!x.mem.some(q=>q.s===m.s+"~")) x.mem.push({d:m.d, c:m.c, s:m.s+"~", pos:999}); });
    sec.tags.forEach(t=>x.tags.add(t));
  }); });
// dominios que tienen que ver entre sí
const AFIN = {animales:"plantas naturaleza lugares comida", plantas:"animales naturaleza comida", comida:"plantas hogar cuerpo salud",
  cuerpo:"salud acciones ropa deporte", salud:"cuerpo personas", personas:"sociedad mente hogar", hogar:"construcción comida ropa personas",
  construcción:"hogar lugares", ropa:"cuerpo hogar", lugares:"naturaleza transporte sociedad", transporte:"lugares tecnología",
  naturaleza:"lugares animales plantas tiempo colores", tiempo:"naturaleza mente", tecnología:"comunicación ciencia transporte",
  cultura:"deporte mente educación sociedad", deporte:"cultura cuerpo", educación:"ciencia cultura comunicación", ciencia:"educación matemática tecnología naturaleza",
  matemática:"ciencia educación medidas", colores:"cultura naturaleza", medidas:"matemática ciencia", sociedad:"personas mente cultura",
  mente:"sociedad comunicación personas", comunicación:"mente tecnología sociedad", acciones:"cuerpo personas"};
const near = (a,b) => (AFIN[a]||"").split(" ").includes(b) || (AFIN[b]||"").split(" ").includes(a);
// palabras que nombran la categoría o una etiqueta de la escondida ("animal", "ave", "fruta", "selva"…)
function namesOf(sec){ const set = new Map();
  const add = (w, v) => { const i = vFind(norm(w)); if(i>=0 && (set.get(i)||0) < v) set.set(i, v); };
  sec.mem.forEach(m=>{ const p = m.s.replace("~","").split("/"); add(p[0], 110); add(p[1], 140); add(p[2], 160); });
  sec.tags.forEach(t=>add(t, 110));
  return set; }
function hash(str){ let h=2166136261; for(let i=0;i<str.length;i++){ h^=str.charCodeAt(i); h=Math.imul(h,16777619); } return (h>>>0); }
function wScore(sec, x, salt, nameBonus){
  let s = 0, same = false;
  for(const a of sec.mem) for(const b of x.mem){
    let v = 0;
    if(a.s===b.s){ v = 300 + Math.max(0, 60 - Math.abs(a.pos-b.pos)*3); same = true; }
    else if(a.c===b.c) v = 180; else if(a.d===b.d) v = 90; else if(near(a.d,b.d)) v = 40;
    if(v>s) s=v;
  }
  for(const t of x.tags) if(sec.tags.has(t)) s += 45;
  if(x.tags.has(sec.n)) s += 120;
  if(!same) s += nameBonus||0;   // "animal", "ave"… suman solo si no están ya en la misma subcategoría
  return s + (hash(salt + x.n) % 25);
}
/* calcula el puesto de TODAS las palabras del vocabulario para un nivel */
function wRanking(lv){
  const sec = VOCAB[lv.si], salt = sec.n + "|";
  const posA = new Map(lv.A.map((i,k)=>[i,k])), posB = new Map(lv.B.map((i,k)=>[i,k]));
  // vía otras palabras escondidas con lista: si X está cerca de T y T está cerca de la escondida
  const names = namesOf(sec);
  const via = new Map();
  for(const [ti, T] of CURATED){
    const rt = posA.has(ti) ? posA.get(ti) : posB.has(ti) ? 60 + posB.get(ti) : null;
    if(rt===null) continue;
    T.A.forEach((xi,k)=>{ const v = 260 - (rt + k)*2; if(v>(via.get(xi)||0)) via.set(xi, v); });
  }
  const keyed = [];
  VOCAB.forEach((x,i)=>{
    if(i===lv.si) return;
    let k;
    if(posA.has(i)) k = 1e6 - posA.get(i);
    else if(posB.has(i)) k = 5e5 - posB.get(i);
    else k = wScore(sec, x, salt, names.get(i)) + (via.get(i)||0);
    keyed.push([k, i]);
  });
  keyed.sort((a,b)=>b[0]-a[0]);
  const rank = new Map([[lv.si, 1]]); const order = [lv.si];
  keyed.forEach(([,i],j)=>{ rank.set(i, j+2); order.push(i); });
  return {rank, order};
}
const tierOf = r => r<=50 ? "good" : r<=300 ? "warn" : "bad";
const wDiff = L => L<=60 ? {s3:12, s2:30, name:"fácil"} : L<=120 ? {s3:18, s2:40, name:"intermedio"} : L<=160 ? {s3:24, s2:50, name:"difícil"} : {s3:30, s2:60, name:"experto"};

function wlevels(){
  levelMap({title:"Palabra escondida", desc:`Escribí palabras. Cada una tiene su puesto entre las ${VOCAB.length.toLocaleString("es-AR")} del juego. La escondida es la número 1.`,
    store:S.games.escondida, total:Infinity, names:W_STAGES, attr:"wlv", how:"palabra",
    label:s=>{ const d = wDiff(s*20+1); return `${s*20+1 > WDATA.length ? "todo el vocabulario · " : ""}nivel ${d.name} · 3 estrellas con hasta ${d.s3} intentos`; }});
}

/* orden de las palabras: distinto para cada jugador, mezclado dentro de cada tramo de dificultad */
const W_TIERS = [[1,20],[21,40],[41,60],[61,100],[101,150],[151,WDATA.length]];
if(!S.wseed){ S.wseed = 1 + Math.floor(Math.random()*2147483646); save(); }
const W_ORDER = [];
W_TIERS.forEach(([a,b],k)=>{
  const idx = []; for(let i=a-1; i<Math.min(b, WDATA.length); i++) idx.push(i);
  const r = mulberry32(S.wseed + k*7919);
  for(let i=idx.length-1;i>0;i--){ const j = Math.floor(r()*(i+1)); [idx[i],idx[j]] = [idx[j],idx[i]]; }
  idx.forEach((v,j)=>{ W_ORDER[a-1+j] = v; });
});
const wTier = L => W_TIERS.find(([a,b])=>L>=a && L<=b) || W_TIERS[0];
/* niveles sin fin: después de los 200 niveles armados, cualquier sustantivo del vocabulario puede ser la escondida */
const WPOOL = (()=>{
  const used = new Set(WDATA.map(l=>l.si));
  const skipDom = new Set(["acciones"]);
  return VOCAB.map((v,i)=>i).filter(i=>{
    const v = VOCAB[i];
    if(used.has(i) || v.n.length < 4 || v.inferred) return false;
    if(!v.mem.length || v.mem.some(m=>skipDom.has(m.d) || /acciones|cualidades|sabores|medidas|números/.test(m.s))) return false;
    if(/(ar|er|ir)$/.test(v.n) && !/(lugar|mar|altar|collar|azúcar|azucar|mujer|placer|taller|alfiler|cráter|crater|bar|hogar|dólar|dolar|militar|nivel)$/.test(v.n)) return false;
    return true;
  });
})();
const W_CYCLES = {};
function wIdxFor(L){
  if(L <= WDATA.length) return W_ORDER[L-1];
  const n = L - WDATA.length - 1, P = WPOOL.length, c = Math.floor(n / P);
  if(!W_CYCLES[c]){ const idx = [...Array(P).keys()]; const r = mulberry32(S.wseed + 50000 + c*7919);
    for(let i=idx.length-1;i>0;i--){ const j = Math.floor(r()*(i+1)); [idx[i],idx[j]] = [idx[j],idx[i]]; } W_CYCLES[c] = idx; }
  return WDATA.length + W_CYCLES[c][n % P];
}
const W_EXTRA = {};
function wLv(idx){
  if(idx < WDATA.length) return WDATA[idx];
  const vi = WPOOL[idx - WDATA.length]; if(vi===undefined) return null;
  return W_EXTRA[idx] || (W_EXTRA[idx] = {w:VOCAB[vi].w, si:vi, A:[], B:[]});
}
function wPractice(L){
  if(L > WDATA.length){ const cur = W && W.idx; let i; do{ i = WDATA.length + Math.floor(Math.random()*WPOOL.length); }while(i===cur); return wplay(L, null, i); }
  // otra palabra al azar del mismo tramo de dificultad
  const [a,b] = wTier(L); const cur = W && W.idx;
  let i; do{ i = a-1 + Math.floor(Math.random()*(Math.min(b,WDATA.length)-a+1)); }while(i===cur && b>a);
  wplay(L, null, i);
}

let W = null;
const MIC_SVG = `<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="9" y="2.5" width="6" height="12" rx="3" fill="currentColor"/><path d="M5 11a7 7 0 0 0 14 0"/><path d="M12 18v3.5"/><path d="M8.5 21.5h7"/></svg>`;
function wplay(L, duel, forceIdx, opts){
  clearTimers(); G = null;
  if(!actx){ try{ actx = new (window.AudioContext||window.webkitAudioContext)(); }catch(e){} }
  const idx = forceIdx!=null ? forceIdx : wIdxFor(L);
  const lv = wLv(idx);
  W = Object.assign({L, idx, lv, guesses:[], last:null, hints:0, done:false, duel:duel||null, daily:(opts&&opts.daily)||null}, wRanking(lv));
  $app.innerHTML = `${topBar(W.daily ? "daily" : "wlevels")}
  <div class="wplay">
    <div class="hud">${W.daily ? `<span><b>Palabra del día</b> · ${prettyDay(W.daily)}</span>` : duel ? `<span><b>Duelo</b>${duel.role==="b"?` contra ${esc(duel.p.a.n)} · su marca: <b>${duel.p.a.ok?duel.p.a.t:"✕"}</b>`:" · palabra al azar"}</span>` : `<span>Nivel <b>${L}</b></span>`}<span class="hudr"><span>Intentos: <b id="wcount">0</b> · ${VOCAB.length.toLocaleString("es-AR")} palabras</span>${howBtn(W.daily?"dia":"palabra")}</span></div>
    <form class="wform" id="wform" autocomplete="off">
      <input id="wguess" type="text" inputmode="text" autocapitalize="off" autocorrect="off" spellcheck="false" maxlength="24" placeholder="Escribí una palabra" aria-label="Tu palabra">
      <button type="button" class="wmic" data-wmic aria-label="Decir una palabra">${MIC_SVG}</button>
      <button type="submit" class="wsend">Probar</button>
    </form>
    <p class="hint" id="micst">Escribí una palabra o tocá el micrófono</p>
    <div class="legend"><span class="t-good"><i></i>1–50 muy cerca</span><span class="t-warn"><i></i>51–300 cerca</span><span class="t-bad"><i></i>más de 300 lejos</span></div>
    <div id="wlast"></div>
    <div class="whelps">
      <button class="help" data-whelp id="whelpbtn">Pista<small><span class="coin"></span><span id="whcost">${HINT_COST[0]}</span></small></button>
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
  const pct = Math.max(3, (1 - Math.log(g.r)/Math.log(VOCAB.length))*100);
  return `<li class="wrow t-${t} ${last?"last":""}"><span class="wbar" style="width:${pct}%"></span>
    <span class="wword">${esc(g.word)}</span>${g.hint?`<span class="wtag">pista</span>`:""}
    <span class="wrank num">${g.r}</span></li>`;
}
function wRender(){
  document.getElementById("wcount").textContent = W.guesses.length;
  const last = document.getElementById("wlast");
  last.innerHTML = W.last ? `<ol class="wlist">${wRow(W.last,true)}</ol>`
    : `<div class="wempty">Probá con cualquier palabra para empezar. Por ejemplo: <b>casa</b>, <b>animal</b> o <b>comida</b>.</div>`;
  const sorted = [...W.guesses].sort((a,b)=>a.r-b.r);
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
  const clear = () => { if(inp){ inp.value=""; inp.focus(); } };
  if(n.length < 2){ toast("Escribí una palabra de al menos 2 letras."); return; }
  const i = vFind(n);
  if(i<0){ toast(`No conozco "${raw}". Probá con otra palabra; este intento no cuenta.`); clear(); return; }
  const dup = W.guesses.find(g=>g.i===i);
  if(dup){ toast(`Ya probaste "${dup.word}": está en el puesto ${dup.r}.`); clear(); return; }
  wAdd({word: VOCAB[i].w, r: W.rank.get(i), i, hint:false});
  clear();
}
const HINT_COST = [30, 50, 80, 120];
function wHint(){
  if(!W || W.done) return;
  const cost = HINT_COST[Math.min(W.hints, HINT_COST.length-1)];
  if(S.coins < cost){ toast(`Necesitás ${cost} monedas para esta pista.`); return; }
  const best = Math.min(...W.guesses.map(g=>g.r), Infinity);
  if(best <= 10){ toast("Ya estás muy cerca: esta vez no hay pista. ¡Vos podés!"); return; }
  // la pista te acerca un poco, nunca demasiado
  const target = best===Infinity ? 250 : best > 300 ? Math.round(best*0.6) : best > 50 ? Math.round(best*0.75) : best - Math.max(2, Math.round(best*0.25));
  const floor = Math.max(8, Math.min(target, best-1));
  const used = new Set(W.guesses.map(g=>g.i));
  let pick = -1;
  for(let r = Math.max(target, 8); r < Math.min(best, W.order.length+1); r++){ const i = W.order[r-1]; if(!used.has(i)){ pick = i; break; } }
  if(pick<0) for(let r = Math.max(target, 8)-1; r >= floor; r--){ const i = W.order[r-1]; if(!used.has(i)){ pick = i; break; } }
  if(pick<0){ toast("No hay más pistas para esta palabra."); return; }
  S.coins -= cost; W.hints++; save();
  document.querySelector(".coins .num").textContent = S.coins;
  const hc = document.getElementById("whcost"); if(hc) hc.textContent = HINT_COST[Math.min(W.hints, HINT_COST.length-1)];
  wAdd({word:VOCAB[pick].w, r:W.rank.get(pick), i:pick, hint:true});
}
function wGiveUp(btn){
  if(!W || W.done) return;
  if(!btn.dataset.sure){ btn.dataset.sure="1"; btn.innerHTML = `¿Seguro?<small>tocá de nuevo</small>`;
    timers.push(setTimeout(()=>{ if(document.body.contains(btn)){ delete btn.dataset.sure; btn.innerHTML=`Rendirse<small>ver la palabra</small>`; } }, 3000)); return; }
  wEnd(false);
}
function wEnd(ok){
  W.done = true; clearTimers();
  if(W.duel) return duelEnd(ok);
  if(W.daily) return dailyEnd(ok);
  const n = W.guesses.length;
  let stars=0, coins=0, xp=0;
  if(ok){
    const d = wDiff(W.L); stars = n<=d.s3 ? 3 : n<=d.s2 ? 2 : 1;
    if(W.hints) stars = Math.min(stars, 2);
    const prev = S.games.escondida[W.L]||0;
    coins = stars*4 + (prev?0:6) + Math.floor(W.L/10);
    xp = (15 + W.L*2) * stars + (prev?0:20);
    if(stars>prev) S.games.escondida[W.L] = stars;
    S.coins += coins; S.xp += xp; save();
    beep(880,.12); setTimeout(()=>beep(1175,.15),130);
  } else beep(220,.25);
  const chips = W.order.slice(1,11).map((vi,i)=>`<span class="wchip" style="--i:${i}"><b>${i+2}</b>${esc(VOCAB[vi].w)}</span>`).join("");
  $app.innerHTML = `${topBar("wlevels")}
  <div class="result mood-${ok?"good":"bad"}">
    <div class="verdict">
      <h1>${ok?"¡La encontraste!":"Te rendiste"}</h1>
      <p>${ok?`En <b class="num">${n}</b> ${n===1?"intento":"intentos"}${W.hints?` y ${W.hints} ${W.hints===1?"pista":"pistas"}`:""}`:"La palabra escondida era"}</p>
      <div class="wordball">${esc(W.lv.w)}</div>
      ${ok?`<div class="stars" aria-label="${stars} de 3 estrellas">${"★".repeat(stars)}<span class="off">${"★".repeat(3-stars)}</span></div>`:""}
    </div>
    ${ok?`<div class="gains"><span><span class="coin"></span>+<span class="num">${coins}</span></span><span>+<span class="num">${xp}</span> XP</span></div>`:""}
    ${ok?`<p class="hint">Nivel ${wDiff(W.L).name}: 3 estrellas con hasta ${wDiff(W.L).s3} intentos, 2 con hasta ${wDiff(W.L).s2}. Con pistas, máximo 2.</p>`:""}
    <div class="chainbox"><h2>Las más cercanas</h2><div class="wchips">${chips}</div></div>
    <div class="actions">
      ${ok?`<button class="btn primary" data-wlv="${W.L+1}">Nivel ${W.L+1}</button>`:""}
      ${!ok && S.games.escondida[W.L]?`<button class="btn primary" data-wlv="${W.L+1}">Nivel ${W.L+1}</button>`:""}
      ${ok?`<button class="btn" data-wpractice="${W.L}">Jugar otra palabra de este nivel</button>`:`<button class="btn primary" data-wpractice="${W.L}">Probar con otra palabra</button>`}
      <button class="btn" data-go="wlevels">Ver niveles</button>
    </div>
  </div>`;
  if(ok) confetti();
}

/* ---------- Duelo: desafiar a un rival con la misma palabra ---------- */
// El desafío viaja en un código (o link) que incluye la palabra (como número de nivel) y la marca de cada jugador.
const DUEL_KEY = "mentecuenta-duelo";
S.duel = Object.assign({w:0, e:0, l:0, seen:[]}, S.duel);
function duelEncode(p){
  const bytes = new TextEncoder().encode(JSON.stringify(p));
  let bin = ""; bytes.forEach((b,i)=>{ bin += String.fromCharCode(b ^ DUEL_KEY.charCodeAt(i % DUEL_KEY.length)); });
  return "duelo-" + btoa(bin).replace(/\+/g,"-").replace(/\//g,"_").replace(/=+$/,"");
}
function duelDecode(text){
  const m = String(text||"").match(/duelo-([A-Za-z0-9_-]+)/); if(!m) return null;
  try{
    const bin = atob(m[1].replace(/-/g,"+").replace(/_/g,"/"));
    const bytes = Uint8Array.from(bin, (c,i)=>c.charCodeAt(0) ^ DUEL_KEY.charCodeAt(i % DUEL_KEY.length));
    const p = JSON.parse(new TextDecoder().decode(bytes));
    if(p.v!==1 || !p.a) return null;
    if(p.g==="c"){ if(!(p.L>=1 && p.L<=TOTAL_LEVELS) || !p.seed) return null; }
    else if(!wLv(p.w)) return null;
    return p;
  }catch(e){ return null; }
}
const canLink = (()=>{ try{ return window.top === window && /^https?:$/.test(location.protocol); }catch(e){ return false; } })();
function duelLink(token){ return canLink ? location.origin + location.pathname + "#" + token : ""; }
// gana quien la encontró; entre dos que la encontraron, menos intentos; si empatan, menos pistas
function duelCompare(a, b){
  if(a.ok && !b.ok) return 1; if(!a.ok && b.ok) return -1; if(!a.ok && !b.ok) return 0;
  if(a.t !== b.t) return a.t < b.t ? 1 : -1;
  if(a.h !== b.h) return a.h < b.h ? 1 : -1;
  return 0;
}
const markTxt = x => x.ok ? `${x.t} ${x.t===1?"intento":"intentos"}${x.h?` y ${x.h} ${x.h===1?"pista":"pistas"}`:""}` : "no la encontró";

function duelCard(){
  const d = S.duel;
  return `<div class="duelcard">
    <div class="duelhead"><h2>Duelo</h2><span class="hint">Ganados <b class="num">${d.w}</b> · Empates <b class="num">${d.e}</b> · Perdidos <b class="num">${d.l}</b></span></div>
    <p>Jugá una palabra al azar y desafiá a un rival con la misma palabra. Gana quien la adivine en menos intentos.</p>
    <button class="btn primary" data-duel="new">Desafiar a un rival</button>
    <form class="wform" id="duelopen" autocomplete="off">
      <input id="duelcode" type="text" autocapitalize="off" autocorrect="off" spellcheck="false" placeholder="Pegá el código que te mandaron" aria-label="Código de desafío">
      <button type="submit" class="wsend">Abrir</button>
    </form>
  </div>`;
}
function addDuelCard(action, desc){
  const h = $app.querySelector(".hello"); if(!h) return;
  h.insertAdjacentHTML("afterend", duelCard().replace('data-duel="new"', `data-duel="${action}"`)
    .replace(/<p>Jugá una palabra[^<]*<\/p>/, `<p>${desc}</p>`));
  const f = document.getElementById("duelopen");
  if(f) f.addEventListener("submit", e=>{ e.preventDefault(); duelOpen(document.getElementById("duelcode").value); });
}
const _wlevels = wlevels;
wlevels = function(){
  _wlevels();
  addDuelCard("new", "Jugá una palabra al azar y desafiá a un rival con la misma palabra. Gana quien la adivine en menos intentos.");
};

function duelAskName(next, back){
  clearTimers();
  $app.innerHTML = `${topBar(back||"wlevels")}
  <div class="hello"><h1>¿Cómo te llamás?</h1><p>Tu rival va a ver este nombre en el desafío.</p></div>
  <form class="wform" id="nameform" autocomplete="off">
    <input id="pname" type="text" maxlength="16" placeholder="Tu nombre" aria-label="Tu nombre" value="${esc(S.name||"")}">
    <button type="submit" class="wsend">Seguir</button>
  </form>`;
  const inp = document.getElementById("pname"); inp.focus();
  document.getElementById("nameform").addEventListener("submit", e=>{
    e.preventDefault(); const n = inp.value.trim().replace(/\s+/g," ").slice(0,16);
    if(!n){ toast("Escribí tu nombre."); return; }
    S.name = n; save(); next();
  });
}
function duelNew(){
  if(!S.name) return duelAskName(duelNew);
  const i = Math.floor(Math.random()*WDATA.length);
  wplay(0, {role:"a", id: Math.random().toString(36).slice(2,8)}, i);
}
function duelOpen(text){
  const p = duelDecode(text);
  if(!p){ toast("Ese código no es válido. Revisá que esté completo."); return; }
  if(p.g==="c"){ if(p.b) return cShowResult(p); if(!S.name) return duelAskName(()=>cInvite(p), "levels"); return cInvite(p); }
  if(p.b) return duelShowResult(p);
  if(!S.name) return duelAskName(()=>duelInvite(p));
  duelInvite(p);
}
function duelInvite(p){
  clearTimers();
  $app.innerHTML = `${topBar("wlevels")}
  <div class="result mood-warn">
    <div class="verdict">
      <h1>${esc(p.a.n)} te desafía</h1>
      <p>${p.a.ok?`Encontró la palabra escondida en <b>${markTxt(p.a)}</b>.`:"No pudo encontrar la palabra escondida."} ¿Podés hacerlo mejor?</p>
      <div class="ball hero">${p.a.ok?p.a.t:"✕"}</div>
    </div>
    <p class="hint">Es la misma palabra que jugó ${esc(p.a.n)}. Gana quien la encuentre en menos intentos; si empatan, gana quien usó menos pistas.</p>
    <div class="actions">
      <button class="btn primary" data-duel="accept">Aceptar el desafío</button>
      <button class="btn" data-go="wlevels">Ahora no</button>
    </div>
  </div>`;
  duelPending = p;
}
let duelPending = null;

function shareBox(text, title){
  return `<div class="share">
    <h2>${title}</h2>
    <textarea id="sharetxt" readonly aria-label="Mensaje para compartir">${esc(text)}</textarea>
    <div class="sharebtns">
      <button class="btn primary" data-duel="copy">Copiar mensaje</button>
      ${navigator.share?`<button class="btn" data-duel="share">Compartir</button>`:""}
    </div>
    <p class="hint">${canLink?"Tu rival abre el link y juega la misma palabra.":"Tu rival pega el código en Palabra escondida → Duelo → Abrir."}</p>
  </div>`;
}
function duelEnd(ok){
  const me = {n:S.name, t:W.guesses.length, h:W.hints, ok};
  const word = esc(W.lv.w);
  if(W.duel.role==="a"){
    const p = {v:1, g:"w", id:W.duel.id, w:W.idx, a:me};
    const token = duelEncode(p), link = duelLink(token);
    const text = `${S.name} te desafía en Palabra escondida (Mente Despierta): ${ok?`encontré la palabra en ${markTxt(me)}`:"no pude encontrar la palabra"}. ¿Podés con menos?\n${link?link+"\n":""}Código: ${token}`;
    if(ok){ S.coins += 5; save(); }
    $app.innerHTML = `${topBar("wlevels")}
    <div class="result mood-${ok?"good":"bad"}">
      <div class="verdict">
        <h1>${ok?"¡La encontraste!":"Te rendiste"}</h1>
        <p>${ok?`Tu marca: <b>${markTxt(me)}</b>`:"La palabra era"}</p>
        <div class="wordball">${word}</div>
      </div>
      ${shareBox(text, "Ahora desafiá a tu rival")}
      <div class="actions"><button class="btn" data-duel="new">Otro duelo</button><button class="btn" data-go="wlevels">Volver</button></div>
    </div>`;
    if(ok) confetti();
    return;
  }
  // respuesta al desafío
  const p = Object.assign({}, W.duel.p, {b:me});
  const res = duelCompare(me, p.a);
  if(!S.duel.seen.includes(p.id+"b")){
    S.duel.seen.push(p.id+"b"); S.duel.seen = S.duel.seen.slice(-200);
    if(res>0){ S.duel.w++; S.coins += 20; } else if(res<0){ S.duel.l++; if(ok) S.coins += 3; } else { S.duel.e++; S.coins += 8; }
    save();
  }
  const token = duelEncode(p), link = duelLink(token);
  const verdict = res>0 ? "¡Ganaste el duelo!" : res<0 ? `Ganó ${esc(p.a.n)}` : "¡Empate!";
  const text = `Duelo de Palabra escondida: ${S.name} ${ok?`la encontró en ${markTxt(me)}`:"no la encontró"} y ${p.a.n} ${p.a.ok?`en ${markTxt(p.a)}`:"no la encontró"}. ${res>0?`Ganó ${S.name}.`:res<0?`Ganó ${p.a.n}.`:"Empate."}\n${link?link+"\n":""}Código: ${token}`;
  $app.innerHTML = `${topBar("wlevels")}
  <div class="result mood-${res>0?"good":res<0?"bad":"warn"}">
    <div class="verdict">
      <h1>${verdict}</h1>
      <p>La palabra era <b>${word}</b></p>
      ${duelVs(me, p.a, res)}
    </div>
    ${shareBox(text, `Mandale el resultado a ${esc(p.a.n)}`)}
    <div class="actions"><button class="btn primary" data-duel="new">Revancha con otra palabra</button><button class="btn" data-go="wlevels">Volver</button></div>
  </div>`;
  if(res>0) confetti();
}
function duelVs(me, rival, res, ballTxt, markFn){
  ballTxt = ballTxt || (x => x.ok ? x.t : "✕"); markFn = markFn || markTxt;
  const col = r => r>0 ? "var(--good)" : r<0 ? "var(--bad)" : "var(--warn)";
  const on = r => r===0 ? "var(--on-warn)" : "var(--on-mood)";
  const ball = (x, r) => `<div class="ball hero" style="--m:${col(r)};--on-m:${on(r)}">${ballTxt(x)}</div>`;
  return `<div class="duel">
    <div class="who">${ball(me,res)}${esc(me.n)}<small class="mark">${markFn(me)}</small></div>
    <div class="who">${ball(rival,-res)}${esc(rival.n)}<small class="mark">${markFn(rival)}</small></div>
  </div>`;
}
function duelShowResult(p){
  clearTimers();
  const iAmA = S.name && p.a.n === S.name;
  const me = iAmA ? p.a : p.b, rival = iAmA ? p.b : p.a;
  const res = duelCompare(me, rival);
  if(iAmA && !S.duel.seen.includes(p.id+"a")){
    S.duel.seen.push(p.id+"a"); S.duel.seen = S.duel.seen.slice(-200);
    if(res>0){ S.duel.w++; S.coins += 20; } else if(res<0) S.duel.l++; else { S.duel.e++; S.coins += 8; }
    save();
  }
  const verdict = res>0 ? (iAmA?"¡Ganaste el duelo!":`Ganó ${esc(me.n)}`) : res<0 ? `Ganó ${esc(rival.n)}` : "¡Empate!";
  $app.innerHTML = `${topBar("wlevels")}
  <div class="result mood-${res>0?"good":res<0?"bad":"warn"}">
    <div class="verdict">
      <h1>${verdict}</h1>
      <p>La palabra era <b>${esc(wLv(p.w).w)}</b></p>
      ${duelVs(me, rival, res)}
    </div>
    <div class="actions"><button class="btn primary" data-duel="new">Revancha con otra palabra</button><button class="btn" data-go="wlevels">Volver</button></div>
  </div>`;
  if(res>0 && iAmA) confetti();
}
function duelAction(a, btn){
  if(a==="new") return duelNew();
  if(a==="accept" && duelPending){ const p = duelPending; duelPending = null; return wplay(0, {role:"b", p}, p.w); }
  if(a==="cnew") return cDuelNew();
  if(a==="cnext") return cDuelNext();
  if(a==="caccept" && cPending){ const p = cPending; cPending = null; return play(p.L, {role:"b", id:p.id, L:p.L, seed:p.seed, round:0, res:[], p}); }
  if(a==="copy"){
    const ta = document.getElementById("sharetxt"); if(!ta) return;
    const fallback = () => { ta.focus(); ta.select(); toast("Seleccioné el mensaje: copialo con el menú del teclado."); };
    try{ navigator.clipboard.writeText(ta.value).then(()=>toast("Mensaje copiado. Pegalo en WhatsApp o donde quieras."), fallback); }catch(e){ fallback(); }
    return;
  }
  if(a==="share"){
    const ta = document.getElementById("sharetxt");
    try{ navigator.share({text: ta.value}).catch(()=>{}); }catch(e){ toast("No se pudo abrir el menú de compartir. Usá Copiar."); }
  }
}
function duelFromHash(){
  let h = ""; try{ h = location.hash; }catch(e){}
  if(!/duelo-/.test(h)) return false;
  try{ history.replaceState(null, "", location.pathname + location.search); }catch(e){}
  duelOpen(h); return true;
}
window.addEventListener("hashchange", duelFromHash);
