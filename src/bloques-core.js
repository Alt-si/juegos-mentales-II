/* ---------- Bloques deslizantes: motor ---------- */
// Tablero de 6×6. La salida está a la derecha de la fila 3 (índice 2). El bloque 0 es el rojo (horizontal, largo 2).
// Un bloque: {r, c, len, h} (h = horizontal). La posición variable de cada bloque es c si es horizontal y r si es vertical.
// Los puzzles vienen de data/bloques.js (generados con tools/gen-bloques.js): 36 caracteres por filas,
// "." vacío, "x" pared fija, "A" bloque rojo, "B".."Z" otros bloques.
const BK_N = 6, BK_EXIT = 2;
function bkParse(str){
  const cells = {}; const walls = [];
  [...str].forEach((ch, i) => { if(ch === "x") walls.push(i); else if(ch !== ".") (cells[ch] = cells[ch] || []).push(i); });
  const blocks = Object.keys(cells).sort().map(ch => {
    const a = cells[ch], r0 = Math.floor(a[0]/BK_N), c0 = a[0] % BK_N;
    const h = a.length > 1 && Math.floor(a[1]/BK_N) === r0;
    return {r:r0, c:c0, len:a.length, h, red: ch === "A"};
  });
  return {blocks, walls};
}
const bkPos = b => b.h ? b.c : b.r;
function bkGrid(blocks, pos, walls){
  const g = new Int8Array(BK_N*BK_N).fill(-1);
  (walls||[]).forEach(c => g[c] = 99);
  blocks.forEach((b,i)=>{ const p = pos[i]; for(let k=0;k<b.len;k++) g[b.h ? b.r*BK_N+p+k : (p+k)*BK_N+b.c] = i; });
  return g;
}
// hasta dónde puede ir un bloque: [mínimo, máximo] de su posición
function bkRange(blocks, pos, walls, i, grid){
  const b = blocks[i], p = pos[i], g = grid || bkGrid(blocks, pos, walls);
  let lo = p, hi = p;
  while(lo > 0 && g[b.h ? b.r*BK_N+lo-1 : (lo-1)*BK_N+b.c] === -1) lo--;
  while(hi + b.len < BK_N && g[b.h ? b.r*BK_N+hi+b.len : (hi+b.len)*BK_N+b.c] === -1) hi++;
  return [lo, hi];
}
const bkGoal = pos => pos[0] === BK_N - 2;
const bkKey = pos => pos.join("");
// mínimo de movimientos desde pos hasta sacar el rojo (deslizar un bloque cualquier distancia = 1 movimiento)
function bkSolve(blocks, pos, walls){
  if(bkGoal(pos)) return {moves:0, path:[]};
  const prev = new Map([[bkKey(pos), null]]); let frontier = [pos];
  while(frontier.length){
    const nf = [];
    for(const s of frontier){
      const g = bkGrid(blocks, s, walls);
      for(let i=0;i<blocks.length;i++){
        const [lo, hi] = bkRange(blocks, s, walls, i, g);
        for(let p=lo;p<=hi;p++){
          if(p === s[i]) continue;
          const n = s.slice(); n[i] = p; const k = bkKey(n);
          if(prev.has(k)) continue;
          prev.set(k, [bkKey(s), i, p]);
          if(bkGoal(n)){
            const path = []; let cur = k;
            while(prev.get(cur)){ const [pk, bi, bp] = prev.get(cur); path.push([bi, bp]); cur = pk; }
            return {moves: path.length, path: path.reverse()};
          }
          nf.push(n);
        }
      }
    }
    frontier = nf;
    if(prev.size > 120000) return null;
  }
  return null;
}

