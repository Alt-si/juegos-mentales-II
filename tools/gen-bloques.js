#!/usr/bin/env node
// Genera el banco de puzzles de Bloques deslizantes (Rush Hour de 6×6).
// Uso: node tools/gen-bloques.js <segundos> <semilla> <salida.json>
// Cada puzzle se guarda como 36 caracteres por filas: "." vacío, "x" pared fija, "A" bloque rojo, "B".."Z" otros bloques.
// Método: arma tableros al azar, recorre todos los estados alcanzables y se queda con el más lejano a la solución.
const fs = require("fs");
const N = 6, EXIT = 2;
const secs = +(process.argv[2] || 60), seed0 = +(process.argv[3] || 1), out = process.argv[4] || "bank.json";
function mulberry32(a){ return function(){ a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
const rnd = mulberry32(seed0); const ri = (a,b) => a + Math.floor(rnd()*(b-a+1));

function solveComponent(blocks, walls){
  const B = blocks.length;
  const enc = pos => { let k = 0; for(let i=0;i<B;i++) k = k*6 + pos[i]; return k; };
  const dec = k => { const p = new Array(B); for(let i=B-1;i>=0;i--){ p[i] = k % 6; k = Math.floor(k/6); } return p; };
  const fixedCells = new Uint8Array(36); walls.forEach(c=>fixedCells[c]=1);
  function neighbors(pos, cb){
    const g = fixedCells.slice();
    for(let i=0;i<B;i++){ const b = blocks[i], p = pos[i]; for(let k=0;k<b.len;k++) g[b.h ? b.r*N+p+k : (p+k)*N+b.c] = 1; }
    for(let i=0;i<B;i++){
      const b = blocks[i], p = pos[i];
      for(let q=p-1; q>=0; q--){ const cell = b.h ? b.r*N+q : q*N+b.c; if(g[cell]) break; const n = pos.slice(); n[i] = q; cb(n); }
      for(let q=p+1; q+b.len<=N; q++){ const cell = b.h ? b.r*N+q+b.len-1 : (q+b.len-1)*N+b.c; if(g[cell]) break; const n = pos.slice(); n[i] = q; cb(n); }
    }
  }
  const start = blocks.map(b=>b.h?b.c:b.r);
  const seen = new Set([enc(start)]); let fr = [start]; const all = [start];
  while(fr.length){ const nf = []; for(const s of fr) neighbors(s, n=>{ const k = enc(n); if(!seen.has(k)){ seen.add(k); nf.push(n); all.push(n); } }); fr = nf; if(seen.size > 60000) return null; }
  const dist = new Map(); let q = [];
  for(const s of all) if(s[0] === N-2){ dist.set(enc(s), 0); q.push(s); }
  if(!q.length) return null;
  let d = 0;
  while(q.length){ d++; const nq = []; for(const s of q) neighbors(s, n=>{ const k = enc(n); if(!dist.has(k)){ dist.set(k, d); nq.push(n); } }); q = nq; }
  let bestK = null, bd = -1;
  for(const [k, dd] of dist) if(dd > bd){ bd = dd; bestK = k; }
  return {pos: dec(bestK), moves: bd, states: seen.size};
}
function randomBoard(){
  const nb = ri(7, 14), nw = rnd() < .25 ? ri(1,2) : 0;
  const g = new Uint8Array(36), blocks = [], walls = [];
  const red = {r:EXIT, c:ri(0,3), len:2, h:true};
  const cells = b => { const a = []; for(let k=0;k<b.len;k++) a.push(b.h ? b.r*N+b.c+k : (b.r+k)*N+b.c); return a; };
  const put = b => { cells(b).forEach(c=>g[c]=1); blocks.push(b); };
  put(red);
  for(let w=0; w<nw; w++){ for(let t=0;t<20;t++){ const c = ri(0,35); if(Math.floor(c/N)===EXIT || g[c]) continue; g[c]=1; walls.push(c); break; } }
  let tries = 0;
  while(blocks.length < nb && tries++ < 400){
    const h = rnd() < .5, len = rnd() < .3 ? 3 : 2;
    const b = h ? {r:ri(0,5), c:ri(0,N-len), len, h} : {r:ri(0,N-len), c:ri(0,5), len, h};
    if(h && b.r === EXIT) continue;
    if(cells(b).some(c=>g[c])) continue;
    put(b);
  }
  return {blocks, walls};
}
function encodeBoard(blocks, pos, walls){
  const s = new Array(36).fill(".");
  walls.forEach(c=>s[c]="x");
  blocks.forEach((b,i)=>{ const p = pos[i]; for(let k=0;k<b.len;k++) s[b.h ? b.r*N+p+k : (p+k)*N+b.c] = String.fromCharCode(65+i); });
  return s.join("");
}
const bank = new Map();   // tablero -> movimientos
const t0 = Date.now(); let tries = 0;
while(Date.now() - t0 < secs*1000){
  tries++;
  const {blocks, walls} = randomBoard();
  const res = solveComponent(blocks, walls);
  if(!res || res.moves < 2) continue;
  const key = encodeBoard(blocks, res.pos, walls);
  if(!bank.has(key)) bank.set(key, res.moves);
}
const arr = [...bank].map(([b,m])=>({b, m}));
fs.writeFileSync(out, JSON.stringify(arr));
const hist = {}; arr.forEach(x=>hist[x.m]=(hist[x.m]||0)+1);
console.log(`intentos ${tries}, puzzles ${arr.length}`); console.log(JSON.stringify(hist));
