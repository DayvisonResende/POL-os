/* Manual do Recruta (manual/index.html): a folha-resumo de SQL para imprimir e divulgar.
   Todo exemplo roda no banco do jogo e traz resultado; nenhum entrega resposta de caso; o PDF cabe em uma página. */
const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { carregarJogo, RAIZ } = require('./carregar');

const HTML = fs.readFileSync(path.join(RAIZ, 'manual', 'index.html'), 'utf8');
const desfazer = s => s.replace(/<[^>]+>/g, '').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&#39;/g, "'").replace(/&quot;/g, '"').replace(/&amp;/g, '&');
const EXEMPLOS = [...HTML.matchAll(/<code class="ex">([\s\S]*?)<\/code>/g)].map(m => desfazer(m[1]));

test('manual: todo exemplo roda no banco do jogo e traz resultado', async () => {
  const J = await carregarJogo();
  assert.ok(EXEMPLOS.length >= 20, 'exemplos: ' + EXEMPLOS.length);
  for (const sql of EXEMPLOS) {
    let r; try { r = J.db.exec(sql); } catch (e) { assert.fail(`${sql}\n→ ${e.message}`); }
    assert.ok(r.length && r[0].values.length > 0, `${sql}: não trouxe nenhuma linha`);
    assert.ok(J.T.isReadOnly(sql), `${sql}: só leitura`);
  }
});

test('manual: nenhum exemplo entrega resposta de caso', async () => {
  const J = await carregarJogo(), F = J.T.F;
  // pistas e respostas dos BOs 1001 a 1007: placas, nomes, contas, cor do furto, empresa e galpão
  const proibidos = ['FTR', 'KZX9B21', 'Hilux', 'Valdemar', 'Denise', "'prata'", 'Km 18', 'Km 92', 'Km 93', 'Raposo', 'Castelo', 'Transportadora', 'VS Armaz', '9000', '9999',
    F.galpao, F.fachada].filter(Boolean);
  const texto = desfazer(HTML);
  for (const p of proibidos) assert.ok(!texto.includes(p), `o manual cita "${p}", que é pista ou resposta de caso`);
  for (const sql of EXEMPLOS) {
    assert.doesNotMatch(sql, /cpf\s*=\s*'\d|placa\s*=\s*'[A-Z]{3}\d/i, `${sql}: nada de CPF ou placa específica`);
    assert.ok(!new RegExp('\\b' + F.contaDenise + '\\b').test(sql), `${sql}: cita a conta da Denise`);
  }
});

test('manual: cabe em uma folha A4 e gera a imagem', { skip: !require('../scripts/manual').CHROME && 'Chrome não encontrado (defina CHROME)', timeout: 60000 }, async () => {
  const { gerarManual } = require('../scripts/manual');
  const pasta = fs.mkdtempSync(path.join(os.tmpdir(), 'manual-'));
  const r = await gerarManual(pasta);
  assert.strictEqual(r.paginas, 1, 'o PDF passou de uma página');
  assert.ok(fs.statSync(r.png).size > 50000, 'imagem gerada');
});
