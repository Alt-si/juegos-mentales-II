/* ---------- Duelo de Mayor o menor ---------- */
// Los dos jugadores responden las mismas 3 preguntas (una fácil, una media y una difícil), sin pistas.
// Gana quien junta más puntos; si empatan, quien usó menos intentos.
const MD_ROUNDS = 3;
let mdPending = null, mdRound = null;
const mdMark = x => `${mFmt(x.pts)} puntos · ${x.ok} de ${MD_ROUNDS} · ${x.t} ${x.t===1?"intento":"intentos"}`;
const mdBall = x => String(x.pts);
function mdCompare(a, b){
  if(a.pts !== b.pts) return a.pts > b.pts ? 1 : -1;
  if(a.t !== b.t) return a.t < b.t ? 1 : -1;
  return 0;
}
function mdSummary(d){ return {n:S.name, pts:d.res.reduce((s,r)=>s+r.pts,0), ok:d.res.filter(r=>r.ok).length, t:d.res.reduce((s,r)=>s+r.n,0)}; }
function mdPick(){
  const qs = [];
  [1,2,3].forEach(dif => { const pool = MDATA.map((x,i)=>x.d===dif?i:-1).filter(i=>i>=0); qs.push(pool[Math.floor(Math.random()*pool.length)]); });
  return qs;
}
function mdNew(){
  if(!S.name) return duelAskName(mdNew, "mlevels");
  mplay(0, {role:"a", id:Math.random().toString(36).slice(2,8), qs:mdPick(), round:0, res:[]});
}
function mdInvite(p){
  clearTimers();
  $app.innerHTML = `${topBar("mlevels")}
  <div class="result mood-warn">
    <div class="verdict">
      <h1>${esc(p.a.n)} te desafía en Mayor o menor</h1>
      <p>Hizo <b>${mdMark(p.a)}</b>. ¿Podés superarlo?</p>
      <div class="ball hero">${mdBall(p.a)}</div>
    </div>
    <p class="hint">Vas a responder las mismas ${MD_ROUNDS} preguntas que ${esc(p.a.n)}, sin pistas. Gana quien junte más puntos; si empatan, quien usó menos intentos.</p>
    <div class="actions">
      <button class="btn primary" data-duel="maccept">Aceptar el desafío</button>
      <button class="btn" data-go="mlevels">Ahora no</button>
    </div>
  </div>`;
  mdPending = p;
}
// fin de cada pregunta del duelo
function mdEnd(ok){
  const d = M.duel, n = M.guesses.filter(g=>!g.hint).length, x = M.x;
  d.res.push({ok, pts: ok ? M.pts : 0, n});
  if(ok){ beep(880,.12); } else beep(220,.25);
  if(d.res.length >= MD_ROUNDS) return mdFinal(d);
  mdRound = d;
  $app.innerHTML = `${topBar("mlevels")}
  <div class="result mood-${ok?"good":"bad"}">
    <div class="verdict">
      <h1>Pregunta ${d.res.length} de ${MD_ROUNDS}: ${ok?"¡la encontraste!":"te rendiste"}</h1>
      <p>${esc(x.q)}</p>
      <div class="wordball num">${mFmt(x.a)}${x.u?` <small>${esc(x.u)}</small>`:""}</div>
      <div class="mscore"><b class="num">${mFmt(ok ? M.pts : 0)}</b><span>puntos en esta pregunta · llevás ${mFmt(d.res.reduce((s,r)=>s+r.pts,0))}</span></div>
    </div>
    ${x.n?`<p class="mfact">${esc(x.n)}</p>`:""}
    <div class="actions"><button class="btn primary" data-duel="mnext">Pregunta ${d.res.length+1}</button></div>
  </div>`;
}
function mdNext(){ if(!mdRound) return; const d = mdRound; mdRound = null; d.round = d.res.length; mplay(0, d); }
function mdFinal(d){
  const me = mdSummary(d);
  if(d.role === "a"){
    const p = {v:1, g:"m", id:d.id, qs:d.qs, a:me};
    const token = duelEncode(p), link = duelLink(token);
    S.coins += me.ok*2; save();
    const text = `${S.name} te desafía en Mayor o menor (Mente Despierta): hice ${mFmt(me.pts)} puntos en ${MD_ROUNDS} preguntas. ¿Podés superarlo?\n${link?link+"\n":""}Código: ${token}`;
    $app.innerHTML = `${topBar("mlevels")}
    <div class="result mood-${me.ok===MD_ROUNDS?"good":me.ok>0?"warn":"bad"}">
      <div class="verdict">
        <h1>Tu marca</h1>
        <p><b>${mdMark(me)}</b></p>
        <div class="ball hero">${mdBall(me)}</div>
      </div>
      ${shareBox(text, "Ahora desafiá a tu rival")}
      <div class="actions"><button class="btn" data-duel="mnew">Otro duelo</button><button class="btn" data-go="mlevels">Volver</button></div>
    </div>`;
    if(me.ok === MD_ROUNDS) confetti();
    return;
  }
  const p = Object.assign({}, d.p, {b:me});
  const res = mdCompare(me, p.a);
  if(!S.duel.seen.includes(p.id+"b")){
    S.duel.seen.push(p.id+"b"); S.duel.seen = S.duel.seen.slice(-200);
    if(res>0){ S.duel.w++; S.coins += 20; } else if(res<0){ S.duel.l++; S.coins += me.ok*2; } else { S.duel.e++; S.coins += 8; }
    save();
  }
  const token = duelEncode(p), link = duelLink(token);
  const text = `Duelo de Mayor o menor: ${S.name} hizo ${mFmt(me.pts)} puntos y ${p.a.n} ${mFmt(p.a.pts)}. ${res>0?`Ganó ${S.name}.`:res<0?`Ganó ${p.a.n}.`:"Empate."}\n${link?link+"\n":""}Código: ${token}`;
  $app.innerHTML = `${topBar("mlevels")}
  <div class="result mood-${res>0?"good":res<0?"bad":"warn"}">
    <div class="verdict">
      <h1>${res>0?"¡Ganaste el duelo!":res<0?`Ganó ${esc(p.a.n)}`:"¡Empate!"}</h1>
      <p>Mayor o menor · ${MD_ROUNDS} preguntas</p>
      ${duelVs(me, p.a, res, mdBall, mdMark)}
    </div>
    ${shareBox(text, `Mandale el resultado a ${esc(p.a.n)}`)}
    <div class="actions"><button class="btn primary" data-duel="mnew">Revancha</button><button class="btn" data-go="mlevels">Volver</button></div>
  </div>`;
  if(res>0) confetti();
}
function mdShowResult(p){
  clearTimers();
  const iAmA = S.name && p.a.n === S.name;
  const me = iAmA ? p.a : p.b, rival = iAmA ? p.b : p.a;
  const res = mdCompare(me, rival);
  if(iAmA && !S.duel.seen.includes(p.id+"a")){
    S.duel.seen.push(p.id+"a"); S.duel.seen = S.duel.seen.slice(-200);
    if(res>0){ S.duel.w++; S.coins += 20; } else if(res<0) S.duel.l++; else { S.duel.e++; S.coins += 8; }
    save();
  }
  $app.innerHTML = `${topBar("mlevels")}
  <div class="result mood-${res>0?"good":res<0?"bad":"warn"}">
    <div class="verdict">
      <h1>${res>0?(iAmA?"¡Ganaste el duelo!":`Ganó ${esc(me.n)}`):res<0?`Ganó ${esc(rival.n)}`:"¡Empate!"}</h1>
      <p>Mayor o menor · ${MD_ROUNDS} preguntas</p>
      ${duelVs(me, rival, res, mdBall, mdMark)}
    </div>
    <div class="actions"><button class="btn primary" data-duel="mnew">Revancha</button><button class="btn" data-go="mlevels">Volver</button></div>
  </div>`;
  if(res>0 && iAmA) confetti();
}

