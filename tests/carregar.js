/* Carrega o núcleo e o conteúdo do jogo no Node, na mesma ordem do index.html.
   Só entram os scripts de js/core/ e js/conteudo/ (nada que mexa no DOM). */
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const RAIZ = path.join(__dirname, '..');

function scriptsDoIndex() {
  const html = fs.readFileSync(path.join(RAIZ, 'index.html'), 'utf8');
  return [...html.matchAll(/<script src="(js\/[^"]+)"><\/script>/g)].map(m => m[1]);
}

async function carregarJogo() {
  const ctx = vm.createContext({ console });
  for (const arq of scriptsDoIndex().filter(s => /^js\/(core|conteudo|i18n)\//.test(s))) {
    vm.runInContext(fs.readFileSync(path.join(RAIZ, arq), 'utf8'), ctx, { filename: arq });
  }
  const initSqlJs = require('sql.js/dist/sql-asm.js');
  const SQL = await initSqlJs();
  const db = new SQL.Database();
  db.run(ctx.buildSeedSQL());
  ctx.computeFacts(db);
  const run = q => { const r = db.exec(q); return ctx.toR(r.length ? r[r.length - 1] : null); };
  return { T: ctx, db, run };
}

module.exports = { carregarJogo, scriptsDoIndex, RAIZ };
