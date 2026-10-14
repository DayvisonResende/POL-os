const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');
const { carregarJogo, scriptsDoIndex, RAIZ } = require('./carregar');

let J;
test.before(async () => { J = await carregarJogo(); });

test('todo script referenciado no index.html existe', () => {
  for (const s of scriptsDoIndex()) assert.ok(fs.existsSync(path.join(RAIZ, s)), s);
});

test('registro: casos em ordem, arquivos e provas apontam para casos existentes', () => {
  const { T } = J;
  assert.deepStrictEqual([...T.CASES.map(c => c.id)], ['1001', '1002', '1003']);
  for (const f of T.FILES) assert.ok(T.indiceCaso(f.caso) >= 0, f.name);
  for (const m in T.PROVAS) {
    assert.ok(T.indiceCaso(T.PROVAS[m].requer) >= 0, 'prova ' + m);
    assert.ok(T.RANKS[T.PROVAS[m].para], 'patente da prova ' + m);
  }
});

test('banco gerado é determinístico e os fatos batem', () => {
  const { T } = J;
  assert.strictEqual(T.F.nVeic, 48);
  assert.ok(T.F.cores.length >= 6);
  assert.strictEqual(J.run("SELECT nome FROM pessoas WHERE cpf='318.442.907-15'").rows[0][0], 'Valdemar Silveira');
});

test('BO 1002: solução passa, SELECT * não passa, falsos positivos explicados', () => {
  const c = J.T.CASES[J.T.indiceCaso('1002')];
  assert.ok(c.steps[2].ok(J.run("SELECT * FROM veiculos WHERE cor='prata' AND placa LIKE 'FTR%'")));
  assert.ok(!c.steps[2].ok(J.run('SELECT * FROM veiculos')));
  assert.ok(c.final.check({ placa: 'FTR-7A93' }).ok);
  const r = c.final.check({ placa: 'FTR2C41' });
  assert.ok(!r.ok && /branco/.test(r.msg));
});

test('BO 1003: as três consultas passam e o mandado exige placa e nome', () => {
  const c = J.T.CASES[J.T.indiceCaso('1003')];
  assert.ok(c.steps[0].ok(J.run("SELECT * FROM leituras_radar WHERE local_radar LIKE '%Km 18%' AND data_hora BETWEEN '2026-10-12 22:45:00' AND '2026-10-12 23:15:00' AND velocidade_kmh > 120")));
  assert.ok(c.steps[1].ok(J.run("SELECT placa, modelo, cor, cpf_proprietario FROM veiculos WHERE placa IN ('KZX9B21','JKL4A12','RTA8K02')")));
  assert.ok(c.steps[2].ok(J.run("SELECT nome, cidade FROM pessoas WHERE cpf = '318.442.907-15'")));
  assert.ok(c.final.check({ placa: 'KZX9B21', nome: 'Valdemar Silveira' }).ok);
  assert.ok(!c.final.check({ placa: 'KZX9B21', nome: 'Fulano' }).ok);
  assert.match(c.final.check({ placa: 'JKL4A12', nome: 'x' }).msg, /sedã/);
});

test('BO 1001: relatório aceita o número de cores', () => {
  const c = J.T.CASES[J.T.indiceCaso('1001')];
  assert.ok(c.final.check({ resp: String(J.T.F.cores.length) }).ok);
  assert.ok(!c.final.check({ resp: '99' }).ok);
});

test('treinamento: as consultas prontas passam no próprio passo', () => {
  for (const st of J.T.TUT) if (st.sql && st.ok) assert.ok(st.ok(J.run(st.sql)), st.sql);
});

test('ACADEPOL: toda resposta-modelo passa no próprio check', () => {
  for (const m in J.T.PROVAS) for (const q of J.T.PROVAS[m].write) assert.ok(q.check(J.run(q.model)), q.id);
});

test('SQL: somente leitura, tradução de erro e explicador', () => {
  const { T } = J;
  assert.ok(T.isReadOnly('SELECT * FROM veiculos;'));
  assert.ok(!T.isReadOnly("UPDATE catraca_acessos SET horario_saida='18:00:00'"));
  const schema = { tables: ['veiculos', 'pessoas'], cols: ['placa', 'cor'] };
  assert.match(T.translateError('near "FORM": syntax error', 'SELECT * FORM veiculos', schema), /FROM/);
  assert.ok(T.explainSQL("SELECT placa FROM veiculos WHERE cor = 'prata' LIMIT 5;").rows.length >= 4);
});
