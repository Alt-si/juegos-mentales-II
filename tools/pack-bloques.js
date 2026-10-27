#!/usr/bin/env node
// Junta los bancos generados por gen-bloques.js, verifica cada puzzle con el mismo solucionador de la app
// y escribe data/bloques.js. Uso: node tools/pack-bloques.js banco1.json banco2.json ...
const fs = require("fs"), path = require("path");
const ROOT = path.dirname(__dirname);
function mulberry32(a){ return function(){ a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
eval(fs.readFileSync(path.join(ROOT, "src/bloques-core.js"), "utf8").replace(/^const /gm, "var "));
const CAP = m => m <= 3 ? 40 : m <= 8 ? 70 : m <= 14 ? 90 : 1000;   // cuántos guardar por dificultad
const all = new Map();
for(const f of process.argv.slice(2)) for(const {b, m} of JSON.parse(fs.readFileSync(f, "utf8"))) if(!all.has(b)) all.set(b, m);
const by = {};
for(const [b, m] of all) (by[m] = by[m] || []).push(b);
const r = mulberry32(42), out = [];
for(const m of Object.keys(by).map(Number).sort((a,b)=>a-b)){
  const a = by[m]; for(let i=a.length-1;i>0;i--){ const j = Math.floor(r()*(i+1)); [a[i],a[j]] = [a[j],a[i]]; }
  for(const b of a.slice(0, CAP(m))){
    const {blocks, walls} = bkParse(b);
    if(blocks[0].r !== BK_EXIT || !blocks[0].h || blocks[0].len !== 2) throw new Error("bloque rojo mal ubicado: " + b);
    const s = bkSolve(blocks, blocks.map(bkPos), walls);
    if(!s || s.moves !== m) throw new Error(`no coincide el mínimo (${m} vs ${s && s.moves}): ${b}`);
    out.push(`${b}:${m}`);
  }
}
const hist = {}; out.forEach(x => { const m = x.split(":")[1]; hist[m] = (hist[m]||0) + 1; });
fs.writeFileSync(path.join(ROOT, "data/bloques.js"),
  "// Bloques deslizantes: banco de puzzles verificados (tablero de 36 caracteres : mínimo de movimientos).\n" +
  "// Generado con tools/gen-bloques.js y tools/pack-bloques.js.\n" +
  `window.__bloques = "${out.join(";")}";\n`);
console.log("puzzles:", out.length, "| por mínimo de movimientos:", JSON.stringify(hist));
