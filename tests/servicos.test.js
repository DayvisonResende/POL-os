/* Serviços do Beto ("Tem serviço?"): conteúdo confere no banco, sorteio respeita o que foi aprendido e o domínio. */
const test = require('node:test');
const assert = require('node:assert');
const { carregarJogo } = require('./carregar');

test('serviços: toda variação tem resposta, a resposta certa passa e a errada não', async () => {
  const { T } = await carregarJogo();
  assert.ok(T.SERVICOS.length >= 15);
  for (const s of T.SERVICOS) {
    for (const c of s.conceitos) assert.ok(T.CONCEITOS[c], `${s.id}: conceito ${c} não registrado`);
    const vs = s.variar ? s.variar() : [{}];
    assert.ok(vs.length > 0, `${s.id} sem variação`);
    for (const p of vs) {
      const r = T.respostaServico(s, p);
      assert.ok(r !== null && r !== undefined, `${s.id} ${JSON.stringify(p)}: sem resposta`);
      const certo = typeof r === 'number' ? String(Math.round(r * 100) / 100).replace('.', ',') : String(r);
      assert.ok(T.conferirServico(s, p, certo), `${s.id} ${JSON.stringify(p)}: "${certo}" deveria passar`);
      assert.ok(!T.conferirServico(s, p, typeof r === 'number' ? String(r + 7) : 'Xyzzy 999'), `${s.id}: resposta errada passou`);
      assert.ok((s.mostrar || s.sql)(p) && T.linhasDe((s.mostrar || s.sql)(p).replace(/;$/, '')) , `${s.id}: consulta mostrada roda`);
      assert.doesNotMatch(s.texto(p), /\{\w+\}/, `${s.id}: variável sem preencher`);
    }
  }
});

test('serviços: nada que entregue pista da história', async () => {
  const { T } = await carregarJogo();
  const proibido = /prata|Virtus|Hilux|Castelo|Raposo|FTR|KZX|Piedade|\bItu\b|Denise|Valdemar|Lucas|Marina|laranja/i;
  for (const s of T.SERVICOS) for (const p of (s.variar ? s.variar() : [{}])) {
    assert.doesNotMatch(s.texto(p), proibido, s.id);
    const r = String(T.respostaServico(s, p));
    assert.doesNotMatch(r, proibido, `${s.id}: resposta ${r}`);
  }
});

test('serviços: texto aceita a resposta do jeito que a pessoa escreve', async () => {
  const { T } = await carregarJogo();
  const s = { sql: () => "SELECT 'Av. São Paulo'" };
  assert.ok(T.conferirServico(s, {}, 'são paulo'));
  assert.ok(T.conferirServico(s, {}, 'Av Sao Paulo'));
  assert.ok(!T.conferirServico(s, {}, 'Dom Aguirre'));
  const placa = { sql: () => "SELECT 'HBD2D44'" };
  assert.ok(T.conferirServico(placa, {}, 'hbd-2d44'));
  const media = { sql: () => 'SELECT 67.43', tolerancia: () => 0.5 };
  assert.ok(T.conferirServico(media, {}, '67,4 km/h'));
  assert.ok(T.conferirServico(media, {}, '67'));
  assert.ok(!T.conferirServico(media, {}, '66'));
});

test('treino livre: só o que já foi aprendido; mistura só depois de dominar as partes', async () => {
  const { T } = await carregarJogo();
  const E = T.novoTreinoLivre(), m2 = c => ['distinct', 'where', 'like', 'and', 'comparacao', 'datahora', 'in', 'orderby'].includes(c);
  for (let i = 0; i < 200; i++) {
    const s = T.sortearServico(E, m2, null, Math.random);
    assert.ok(s.conceitos.every(m2), 'sorteou conceito não aprendido: ' + s.id);
    assert.strictEqual(s.conceitos.length, 1, 'mistura antes de dominar: ' + s.id);
  }
  // domina WHERE e ORDER BY: a mistura deles passa a sair
  const sWhere = T.SERVICOS.find(s => s.id === 'where-cor'), sOrder = T.SERVICOS.find(s => s.id === 'orderby-velocidade');
  assert.strictEqual(JSON.stringify(T.registrarResultado(E, sWhere, true)), '[]');
  T.registrarResultado(E, sWhere, false);                      // errou: zera a sequência
  for (let i = 0; i < 2; i++) T.registrarResultado(E, sWhere, true);
  assert.ok(!T.dominado(E, 'where'));
  assert.strictEqual(JSON.stringify(T.registrarResultado(E, sWhere, true)), '["where"]');
  for (let i = 0; i < 3; i++) T.registrarResultado(E, sOrder, true);
  const ids = new Set(); for (let i = 0; i < 400; i++) ids.add(T.sortearServico(E, m2, null, Math.random).id);
  assert.ok(ids.has('mix-radar-mais-rapido'), 'mistura where+orderby liberada');
  assert.ok(!ids.has('mix-cor-ano'), 'mistura and+comparacao ainda não');
  T.registrarResultado(E, sWhere, false);
  assert.ok(T.dominado(E, 'where'), 'o selo de dominado não cai');
});
