/* ---------- Duelo de Cadena ---------- */
// Los dos jugadores reciben las mismas cuentas: el código lleva el nivel y la semilla del generador.
const C_ROUNDS = 3;
let cPending = null, cRound = null;
const cMark = x => `${x.ok} de ${C_ROUNDS} bien · ${(x.t/10).toFixed(1).replace(".",",")} s`;
// gana quien acierta más; si empatan, quien tardó menos en total; después, quien quedó más cerca
function cCompare(a, b){
  if(a.ok !== b.ok) return a.ok > b.ok ? 1 : -1;
  if(a.t !== b.t) return a.t < b.t ? 1 : -1;
  if(a.d !== b.d) return a.d < b.d ? 1 : -1;
  return 0;
}
function cSummary(d){
  return {n:S.name, ok:d.res.filter(r=>r.ok).length, t:d.res.reduce((s,r)=>s+r.t,0), d:d.res.reduce((s,r)=>s+r.d,0)};
}
function cDuelNew(){
  if(!S.name) return duelAskName(cDuelNew, "levels");
  const L = Math.max(1, Math.min(TOTAL_LEVELS, highest(S.games.cadena)+1));
  play(L, {role:"a", id:Math.random().toString(36).slice(2,8), L, seed:1+Math.floor(Math.random()*2147483646), round:0, res:[]});
}
function cDuelRound(ok, val, used){
  const d = G.duel;
  d.res.push({ok, t:Math.round(Math.min(used, ANSWER_TIME)*10), d: val===null ? 999 : Math.min(999, Math.abs(val-G.answer))});
  if(ok){ beep(880,.12); } else beep(220,.25);
  if(d.res.length >= C_ROUNDS) return cDuelEnd(d);
  cRound = d;
  const seq = G.items.map(it=>(it.op?(it.op==="-"?"−":it.op)+" ":"")+it.n).join(" ") + " = " + fmt(G.answer);
  $app.innerHTML = `${topBar("levels")}
  <div class="result mood-${ok?"good":"bad"}">
    <div class="verdict">
      <h1>Ronda ${d.res.length} de ${C_ROUNDS}: ${ok?"¡bien!":val===null?"sin tiempo":"incorrecto"}</h1>
      <p>${ok?`Respondiste en <b class="num">${used.toFixed(1).replace(".",",")}</b> s`:`Era <b class="num">${fmt(G.answer)}</b>`}</p>
      <div class="dots">${d.res.map(r=>`<i class="${r.ok?"on":""}" style="width:14px;height:14px;background:${r.ok?"var(--good)":"var(--bad)"}"></i>`).join("")}${"<i style=\"width:14px;height:14px\"></i>".repeat(C_ROUNDS-d.res.length)}</div>
    </div>
    <div class="seq">${esc(seq)}</div>
    <div class="actions"><button class="btn primary" data-duel="cnext">Ronda ${d.res.length+1}</button></div>
  </div>`;
}
function cDuelNext(){
  if(!cRound) return;
  const d = cRound; cRound = null; d.round = d.res.length;
  play(d.L, d);
}
function cInvite(p){
  clearTimers();
  $app.innerHTML = `${topBar("levels")}
  <div class="result mood-warn">
    <div class="verdict">
      <h1>${esc(p.a.n)} te desafía en Cadena</h1>
      <p>Hizo <b>${cMark(p.a)}</b> en el nivel ${p.L}. ¿Podés superarlo?</p>
      <div class="ball hero">${p.a.ok}/${C_ROUNDS}</div>
    </div>
    <p class="hint">Vas a recibir las mismas ${C_ROUNDS} cuentas que ${esc(p.a.n)}. En el duelo no hay ayudas. Gana quien acierte más; si empatan, quien respondió más rápido.</p>
    <div class="actions">
      <button class="btn primary" data-duel="caccept">Aceptar el desafío</button>
      <button class="btn" data-go="levels">Ahora no</button>
    </div>
  </div>`;
  cPending = p;
}
const cBall = x => `${x.ok}/${C_ROUNDS}`;
function cDuelEnd(d){
  const me = cSummary(d);
  if(d.role==="a"){
    const p = {v:1, g:"c", id:d.id, L:d.L, seed:d.seed, a:me};
    const token = duelEncode(p), link = duelLink(token);
    S.coins += me.ok*2; save();
    const text = `${S.name} te desafía en Cadena (Mente Despierta): hice ${cMark(me)} en el nivel ${d.L}. ¿Podés superarlo?\n${link?link+"\n":""}Código: ${token}`;
    $app.innerHTML = `${topBar("levels")}
    <div class="result mood-${me.ok===C_ROUNDS?"good":me.ok>0?"warn":"bad"}">
      <div class="verdict">
        <h1>Tu marca</h1>
        <p><b>${cMark(me)}</b></p>
        <div class="ball hero">${cBall(me)}</div>
      </div>
      ${shareBox(text, "Ahora desafiá a tu rival")}
      <div class="actions"><button class="btn" data-duel="cnew">Otro duelo</button><button class="btn" data-go="levels">Volver</button></div>
    </div>`;
    if(me.ok===C_ROUNDS) confetti();
    return;
  }
  const p = Object.assign({}, d.p, {b:me});
  const res = cCompare(me, p.a);
  if(!S.duel.seen.includes(p.id+"b")){
    S.duel.seen.push(p.id+"b"); S.duel.seen = S.duel.seen.slice(-200);
    if(res>0){ S.duel.w++; S.coins += 20; } else if(res<0){ S.duel.l++; S.coins += me.ok; } else { S.duel.e++; S.coins += 8; }
    save();
  }
  const token = duelEncode(p), link = duelLink(token);
  const text = `Duelo de Cadena: ${S.name} hizo ${cMark(me)} y ${p.a.n} ${cMark(p.a)}. ${res>0?`Ganó ${S.name}.`:res<0?`Ganó ${p.a.n}.`:"Empate."}\n${link?link+"\n":""}Código: ${token}`;
  $app.innerHTML = `${topBar("levels")}
  <div class="result mood-${res>0?"good":res<0?"bad":"warn"}">
    <div class="verdict">
      <h1>${res>0?"¡Ganaste el duelo!":res<0?`Ganó ${esc(p.a.n)}`:"¡Empate!"}</h1>
      <p>Nivel ${p.L} · ${C_ROUNDS} cuentas</p>
      ${duelVs(me, p.a, res, cBall, cMark)}
    </div>
    ${shareBox(text, `Mandale el resultado a ${esc(p.a.n)}`)}
    <div class="actions"><button class="btn primary" data-duel="cnew">Revancha</button><button class="btn" data-go="levels">Volver</button></div>
  </div>`;
  if(res>0) confetti();
}
function cShowResult(p){
  clearTimers();
  const iAmA = S.name && p.a.n === S.name;
  const me = iAmA ? p.a : p.b, rival = iAmA ? p.b : p.a;
  const res = cCompare(me, rival);
  if(iAmA && !S.duel.seen.includes(p.id+"a")){
    S.duel.seen.push(p.id+"a"); S.duel.seen = S.duel.seen.slice(-200);
    if(res>0){ S.duel.w++; S.coins += 20; } else if(res<0) S.duel.l++; else { S.duel.e++; S.coins += 8; }
    save();
  }
  $app.innerHTML = `${topBar("levels")}
  <div class="result mood-${res>0?"good":res<0?"bad":"warn"}">
    <div class="verdict">
      <h1>${res>0?(iAmA?"¡Ganaste el duelo!":`Ganó ${esc(me.n)}`):res<0?`Ganó ${esc(rival.n)}`:"¡Empate!"}</h1>
      <p>Cadena · nivel ${p.L}</p>
      ${duelVs(me, rival, res, cBall, cMark)}
    </div>
    <div class="actions"><button class="btn primary" data-duel="cnew">Revancha</button><button class="btn" data-go="levels">Volver</button></div>
  </div>`;
  if(res>0 && iAmA) confetti();
}

