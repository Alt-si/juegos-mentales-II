/* ---------- Palabra del día ---------- */
// La misma palabra para todos en la misma fecha. Se juega igual que Palabra escondida.
const DAY0 = Date.UTC(2026, 0, 1);
const DAILY_START = "2026-10-01";              // primer día del calendario
const MESES = ["enero","febrero","marzo","abril","mayo","junio","julio","agosto","septiembre","octubre","noviembre","diciembre"];
const DIAS = ["domingo","lunes","martes","miércoles","jueves","viernes","sábado"];
S.daily = S.daily || {};
S.dailyBest = S.dailyBest || 0;
const pad2 = n => String(n).padStart(2,"0");
const dayKey = d => `${d.getFullYear()}-${pad2(d.getMonth()+1)}-${pad2(d.getDate())}`;
const keyDate = k => { const [y,m,d] = k.split("-").map(Number); return new Date(y, m-1, d); };
const dayNum = k => { const [y,m,d] = k.split("-").map(Number); return Math.round((Date.UTC(y,m-1,d) - DAY0) / 864e5); };
const todayKey = () => dayKey(new Date());
const prettyDay = k => { const d = keyDate(k); return `${DIAS[d.getDay()]} ${d.getDate()} de ${MESES[d.getMonth()]}`; };
const DAILY_POOL = (()=>{ const idx = [...Array(WDATA.length).keys()]; const r = mulberry32(20261001);
  for(let i=idx.length-1;i>0;i--){ const j = Math.floor(r()*(i+1)); [idx[i],idx[j]] = [idx[j],idx[i]]; } return idx; })();
const dailyIdx = k => { const n = dayNum(k), L = DAILY_POOL.length; return DAILY_POOL[((n % L) + L) % L]; };

function dailyStreak(){
  let k = todayKey(), n = 0;
  if(!(S.daily[k] && S.daily[k].ok && !S.daily[k].late)){ const d = keyDate(k); d.setDate(d.getDate()-1); k = dayKey(d); }
  // solo cuentan los días jugados en su fecha (no los recuperados del calendario)
  while(S.daily[k] && S.daily[k].ok && !S.daily[k].late){ n++; const d = keyDate(k); d.setDate(d.getDate()-1); k = dayKey(d); }
  return n;
}
function dailyStatus(){
  const k = todayKey(), r = S.daily[k];
  return {k, r, streak: dailyStreak()};
}

let calMonth = null;     // {y, m} que se está mirando
function dailyScreen(){
  clearTimers();
  const t = new Date(); if(!calMonth) calMonth = {y:t.getFullYear(), m:t.getMonth()};
  const st = dailyStatus();
  const played = Object.values(S.daily), found = played.filter(r=>r.ok);
  const avg = found.length ? Math.round(found.reduce((s,r)=>s+r.t,0)/found.length) : 0;
  $app.innerHTML = `${topBar("home")}
  <div class="dhero">
    <span class="kicker">Desafío del día</span>
    <div class="titlerow"><h1>Palabra del día</h1>${howBtn("dia")}</div>
    <p>Todos los días hay una palabra nueva, la misma para todos los jugadores. ¿La descubrís?</p>
    <div class="dtoday">
      <div><b>${prettyDay(st.k)}</b><br>${st.r ? (st.r.ok ? `La encontraste en ${st.r.t} ${st.r.t===1?"intento":"intentos"}` : "Hoy te rendiste") : "Todavía no la jugaste"}</div>
      <button class="btn ${st.r?"":"primary"} dplay" data-daily="day:${st.k}">${st.r ? "Ver resultado" : "Jugar la de hoy"}</button>
    </div>
  </div>
  <div class="dstats">
    <div><b class="num">${st.streak}</b><span>racha actual</span></div>
    <div><b class="num">${S.dailyBest}</b><span>mejor racha</span></div>
    <div><b class="num">${found.length}</b><span>encontradas</span></div>
    <div><b class="num">${avg||"–"}</b><span>intentos promedio</span></div>
  </div>
  ${calendarHtml()}
  <div class="dnotif">
    <div><b>Recordatorio diario</b><br><span>${S.notif ? "Activado: te avisamos cuando hay palabra nueva." : "Recibí un aviso cada día con la palabra nueva."}</span></div>
    <button class="btn ${S.notif?"":"primary"}" data-daily="notif">${S.notif ? "Probar aviso" : "Activar"}</button>
  </div>
  ${unknownCard()}`;
  howFirst("dia");
}
function calendarHtml(){
  const {y, m} = calMonth;
  const first = new Date(y, m, 1), days = new Date(y, m+1, 0).getDate();
  const lead = (first.getDay() + 6) % 7;     // la semana empieza el lunes
  const tk = todayKey();
  const startM = keyDate(DAILY_START), now = new Date();
  const canPrev = y > startM.getFullYear() || (y === startM.getFullYear() && m > startM.getMonth());
  const canNext = y < now.getFullYear() || (y === now.getFullYear() && m < now.getMonth());
  let cells = ["L","M","M","J","V","S","D"].map(d=>`<span class="cdow">${d}</span>`).join("");
  cells += `<span></span>`.repeat(lead);
  for(let d=1; d<=days; d++){
    const k = `${y}-${pad2(m+1)}-${pad2(d)}`, r = S.daily[k];
    const future = k > tk, before = k < DAILY_START;
    let cls = "cday", label = `${d} de ${MESES[m]}`, sub = "";
    if(future || before){ cls += " off"; label += before ? ", antes del lanzamiento" : ", todavía no disponible"; }
    else if(r && r.ok){ cls += " won"; sub = `${r.t}`; label += `, encontrada en ${r.t} intentos`; }
    else if(r){ cls += " lost"; sub = "✕"; label += ", te rendiste"; }
    else if(k === tk){ cls += " today"; label += ", hoy, sin jugar"; }
    else { cls += " miss"; label += ", sin jugar"; }
    if(k === tk) cls += " is-today";
    cells += (future || before) ? `<span class="${cls}" aria-label="${label}">${d}</span>`
      : `<button class="${cls}" data-daily="day:${k}" aria-label="${label}">${d}${sub?`<small>${sub}</small>`:""}</button>`;
  }
  return `<div class="cal">
    <div class="calhead">
      <button class="calnav" data-daily="prev" ${canPrev?"":"disabled"} aria-label="Mes anterior">‹</button>
      <h2>${MESES[m][0].toUpperCase()+MESES[m].slice(1)} ${y}</h2>
      <button class="calnav" data-daily="next" ${canNext?"":"disabled"} aria-label="Mes siguiente">›</button>
    </div>
    <div class="calgrid">${cells}</div>
    <div class="legend"><span class="t-good"><i></i>encontrada (intentos)</span><span class="t-bad"><i></i>rendido</span><span class="cl-miss"><i></i>sin jugar: todavía podés</span></div>
  </div>`;
}
function dailyOpen(k){
  if(k > todayKey() || k < DAILY_START) return;
  const r = S.daily[k];
  if(r) return dailySummary(k, r);
  wplay(0, null, dailyIdx(k), {daily:k});
}
function dailyEnd(ok){
  const k = W.daily, me = {ok, t:W.guesses.length, h:W.hints, late: k !== todayKey()};
  let coins = 0, xp = 0;
  if(!S.daily[k]){
    S.daily[k] = me;
    const streak = dailyStreak();
    if(streak > S.dailyBest) S.dailyBest = streak;
    if(ok && !me.late){ coins = 15 + Math.min(streak, 7)*2; xp = 60 + Math.min(streak, 7)*10; }
    else if(ok){ coins = 5; xp = 30; }   // días anteriores: premio menor y no suman a la racha
    S.coins += coins; S.xp += xp;
    save();
  }
  if(ok){ beep(880,.12); setTimeout(()=>beep(1175,.15),130); } else beep(220,.25);
  dailySummary(k, S.daily[k], {coins, xp, fresh:true});
  if(ok) confetti();
}
function dailyShareText(k, r){
  const d = keyDate(k), streak = dailyStreak();
  const link = canLink ? location.origin + location.pathname + "#hoy" : "";
  return `Palabra del día ${d.getDate()}/${d.getMonth()+1} en Mente Despierta: ${r.ok ? `la encontré en ${r.t} ${r.t===1?"intento":"intentos"}${r.h?` (con ${r.h} ${r.h===1?"pista":"pistas"})`:""}` : "esta vez no la encontré"}.${streak>1?` Racha: ${streak} días.`:""} ¿Y vos?${link?"\n"+link:""}`;
}
function dailySummary(k, r, g){
  clearTimers();
  const word = esc(WDATA[dailyIdx(k)].w), streak = dailyStreak();
  $app.innerHTML = `${topBar("daily")}
  <div class="result mood-${r.ok?"good":"bad"}">
    <div class="verdict">
      <h1>${r.ok ? "¡Palabra del día encontrada!" : "Te rendiste"}</h1>
      <p>${prettyDay(k)} · ${r.ok ? `<b class="num">${r.t}</b> ${r.t===1?"intento":"intentos"}${r.h?` y ${r.h} ${r.h===1?"pista":"pistas"}`:""}` : "La palabra era"}</p>
      <div class="wordball">${word}</div>
      ${streak ? `<p>Racha: <b class="num">${streak}</b> ${streak===1?"día":"días"} seguidos</p>` : ""}
    </div>
    ${g && g.coins ? `<div class="gains"><span><span class="coin"></span>+<span class="num">${g.coins}</span></span><span>+<span class="num">${g.xp}</span> XP</span></div>` : ""}
    ${shareBox(dailyShareText(k, r), "Contale a tus amigos", "")}
    <p class="hint">Mañana hay una palabra nueva.</p>
    <div class="actions">
      <button class="btn primary" data-go="daily">Ver el calendario</button>
      <button class="btn" data-go="home">Inicio</button>
    </div>
  </div>`;
}

/* ---------- aviso diario ---------- */
async function dailyNotif(){
  const fail = () => toast("No se pudo activar el aviso acá. Funciona en la app instalada desde GitHub Pages.");
  if(!("Notification" in window)) return fail();
  let perm = "denied";
  try{ perm = Notification.permission === "default" ? await Notification.requestPermission() : Notification.permission; }catch(e){}
  if(perm !== "granted"){ if(perm === "denied") toast("Las notificaciones están bloqueadas. Activalas en los ajustes del navegador para esta app."); else fail(); return; }
  const first = !S.notif;
  S.notif = true; save();
  const body = first ? "Listo: cada día te avisamos cuando hay una palabra nueva." : "Así se ve el aviso de la palabra del día.";
  try{
    const reg = await dailyRegisterSW();
    if(reg) await reg.showNotification("Palabra del día", {body, icon:"icon.svg", tag:"palabra-del-dia"});
    else new Notification("Palabra del día", {body});
  }catch(e){ try{ new Notification("Palabra del día", {body}); }catch(_){} }
  dailyScreen();
}
async function dailyRegisterSW(){
  if(!canLink || !("serviceWorker" in navigator)) return null;
  try{
    const reg = await navigator.serviceWorker.register("sw.js");
    await navigator.serviceWorker.ready;
    if(reg.periodicSync){ try{ await reg.periodicSync.register("palabra-del-dia", {minInterval: 12*60*60*1000}); }catch(e){} }
    return reg;
  }catch(e){ return null; }
}
if(S.notif) dailyRegisterSW();

function dailyAction(a){
  if(a === "notif") return dailyNotif();
  if(a === "prev" || a === "next"){
    let {y, m} = calMonth; m += a === "next" ? 1 : -1;
    if(m < 0){ m = 11; y--; } if(m > 11){ m = 0; y++; }
    calMonth = {y, m}; return dailyScreen();
  }
  if(a.startsWith("day:")) return dailyOpen(a.slice(4));
}
function dailyFromHash(){
  let h = ""; try{ h = location.hash; }catch(e){}
  if(h !== "#hoy") return false;
  try{ history.replaceState(null, "", location.pathname + location.search); }catch(e){}
  dailyScreen(); return true;
}
window.addEventListener("hashchange", dailyFromHash);

