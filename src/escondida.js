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
    store:S.games.escondida, total:WDATA.length, names:W_STAGES, attr:"wlv",
    label:s=>{ const d = wDiff(s*20+1); return `nivel ${d.name} · 3 estrellas con hasta ${d.s3} intentos`; }});
}

let W = null;
const MIC_SVG = `<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="9" y="2.5" width="6" height="12" rx="3" fill="currentColor"/><path d="M5 11a7 7 0 0 0 14 0"/><path d="M12 18v3.5"/><path d="M8.5 21.5h7"/></svg>`;
function wplay(L){
  clearTimers(); G = null;
  if(!actx){ try{ actx = new (window.AudioContext||window.webkitAudioContext)(); }catch(e){} }
  const lv = WDATA[L-1];
  W = Object.assign({L, lv, guesses:[], last:null, hints:0, done:false}, wRanking(lv));
  $app.innerHTML = `${topBar("wlevels")}
  <div class="wplay">
    <div class="hud"><span>Nivel <b>${L}</b></span><span>Intentos: <b id="wcount">0</b> · ${VOCAB.length.toLocaleString("es-AR")} palabras</span></div>
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
      ${ok && W.L<WDATA.length?`<button class="btn primary" data-wlv="${W.L+1}">Nivel ${W.L+1}</button>`:""}
      ${!ok && W.L<WDATA.length && S.games.escondida[W.L]?`<button class="btn primary" data-wlv="${W.L+1}">Nivel ${W.L+1}</button>`:""}
      <button class="btn ${ok?"":"primary"}" data-wlv="${W.L}">${ok?"Jugar de nuevo":"Volver a intentar"}</button>
      <button class="btn" data-go="wlevels">Ver niveles</button>
    </div>
  </div>`;
  if(ok) confetti();
}

