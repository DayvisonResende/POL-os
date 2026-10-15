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

// A resposta esperada de cada passo: consulta pronta, peça certa no molde, blocos na ordem ou `solucao`.
function respostaDoPasso(T, st) {
  if (st.type === 'slot') return st.template.replace('___', st.chips.find(c => c.certo).t);
  if (st.type === 'blocks') return T.joinToks(st.answer);
  return st.solucao || st.sql;
}

test('treinamentos: todo passo que executa aceita a resposta esperada', () => {
  const { T } = J;
  assert.deepStrictEqual(Object.keys(T.TREINOS).sort(), ['m1', 'm2-filtros', 'm2-intervalos']);
  for (const id in T.TREINOS) for (const [k, st] of T.TREINOS[id].passos.entries()) {
    if (!st.ok) continue;
    if (st.type === 'slot') assert.strictEqual(st.chips.filter(c => c.certo).length, 1, `${id} passo ${k + 1}: marque a peça certa com certo:true`);
    const q = respostaDoPasso(T, st);
    assert.ok(q, `${id} passo ${k + 1} (${st.type}) sem resposta esperada`);
    assert.ok(st.ok(J.run(q)), `${id} passo ${k + 1}: ${q}`);
    if (st.type === 'mold') {   // o molde sem preencher não pode passar (dar erro também conta como não passar)
      let passou = false; try { passou = st.ok(J.run(st.template)); } catch (e) { /* erro de sintaxe */ }
      assert.ok(!passou, `${id} passo ${k + 1}: o molde sem preencher não pode passar`);
    }
  }
});

test('treinamentos: casos apontam para treinos que existem; os do Módulo 2 não entregam respostas', () => {
  const { T } = J;
  for (const c of T.CASES) if (c.treino) assert.ok(T.TREINOS[c.treino], c.id + ' → ' + c.treino);
  // respostas dos BOs 1002/1003 e da prova do Módulo 2
  const proibido = [/FTR/, /'prata'/, /Km 18/, /KZX/, /Valdemar/, /Hilux/, /22:45/, /23:15/, /Dom Aguirre/, /'Itu'/, /'Salto'/, /BETWEEN 2018 AND 2020/];
  for (const id of ['m2-filtros', 'm2-intervalos']) {
    const texto = JSON.stringify(T.TREINOS[id].passos) + T.TREINOS[id].passos.map(p => String(p.ok) + String(p.miss || '')).join('');
    for (const re of proibido) assert.doesNotMatch(texto, re, `${id} contém ${re}`);
  }
});

test('ACADEPOL: toda resposta-modelo passa no próprio check', () => {
  for (const m in J.T.PROVAS) for (const q of J.T.PROVAS[m].write) assert.ok(q.check(J.run(q.model)), q.id);
});

test('diagnóstico: aponta erros de estrutura sem entregar a resposta', () => {
  const { T } = J;
  const schema = { tables: ['veiculos', 'pessoas'], cols: ['placa', 'modelo', 'cor', 'ano', 'nome', 'cidade'] };
  // jogada real do playtest (BO 1002): três problemas de uma vez
  const p = T.diagnosticarSQL('SELECT cor WHERE "prata" FROM veiculos;', schema);
  assert.strictEqual(p.length, 3);
  assert.match(p[0], /WHERE<\/b> veio antes do <b>FROM/);
  assert.match(p[1], /comparação completa/);
  assert.match(p[2], /aspas <b>simples/);
  assert.throws(() => J.db.exec('SELECT cor WHERE "prata" FROM veiculos;'));
  assert.match(T.translateError('near "FROM": syntax error', 'SELECT cor WHERE "prata" FROM veiculos;', schema), /3 problemas/);
  // corrigida só a ordem, a consulta roda e volta vazia: a dica explica o porquê
  assert.strictEqual(J.db.exec('SELECT cor FROM veiculos WHERE "prata"').length, 0);
  assert.match(T.zeroRowHint('SELECT cor FROM veiculos WHERE "prata"', schema), /comparação completa/);
  assert.match(T.diagnosticarSQL("SELECT * FROM veiculos LIMIT 3 ORDER BY ano", schema)[0], /LIMIT<\/b> veio antes do <b>ORDER BY/);
  // jogada real do playtest: LIKE no lugar do WHERE, com =, sem % (e FRT no lugar de FTR)
  const q2 = "SELECT * FROM veiculos LIKE placa = 'FRT';";
  assert.throws(() => J.db.exec(q2));
  const p2 = T.diagnosticarSQL(q2, schema);
  assert.strictEqual(p2.length, 3, p2.join('\n'));
  assert.match(p2[0], /Falta o <code>WHERE/);
  assert.match(p2[1], /no lugar<\/b> do <code>=/);
  assert.match(p2[2], /'FRT%'/);
  assert.match(T.zeroRowHint("SELECT * FROM veiculos WHERE placa LIKE 'ABC'", schema), /'ABC%'/);
  assert.doesNotMatch(T.zeroRowHint("SELECT * FROM veiculos WHERE placa LIKE 'ABC'", schema), /FTR/, 'não entrega a resposta do BO 1002');
  // estrutura certa, letras trocadas (FRT em vez de FTR): manda conferir com a pista, sem dar a resposta
  assert.strictEqual(J.db.exec("SELECT * FROM veiculos WHERE placa LIKE 'FRT%'").length, 0);
  const h = T.zeroRowHint("SELECT * FROM veiculos WHERE placa LIKE 'FRT%'", schema);
  assert.match(h, /letra por letra/);
  assert.doesNotMatch(h, /FTR/);
  // "funcionou por sorte": aspas duplas em valor; aspas duplas em nome de coluna são corretas
  assert.match(T.avisoSQL('SELECT * FROM veiculos WHERE cor = "prata"', schema), /por sorte/);
  assert.strictEqual(T.avisoSQL('SELECT "cor" FROM veiculos', schema), null);
  // consultas certas não geram falso alarme
  for (const q of ["SELECT * FROM veiculos WHERE cor = 'prata' AND placa LIKE 'FTR%';",
                   "SELECT * FROM leituras_radar WHERE local_radar LIKE '%Km 18%' AND data_hora BETWEEN '2026-10-12 22:45:00' AND '2026-10-12 23:15:00' AND velocidade_kmh > 120;",
                   "SELECT * FROM pessoas WHERE cidade IN ('Itu', 'Salto') ORDER BY nome LIMIT 5;",
                   "SELECT * FROM veiculos WHERE cor IS NOT NULL;"])
    assert.deepStrictEqual([...T.diagnosticarSQL(q, schema)], [], q);
});

test('BOs: o "quase" explica a consulta que chegou perto, e não dispara na certa', () => {
  const c2 = J.T.CASES[J.T.indiceCaso('1002')], c3 = J.T.CASES[J.T.indiceCaso('1003')];
  // jogada real do playtest: filtro certo, só a coluna cor
  const R = J.run("SELECT cor FROM veiculos WHERE cor = 'prata';");
  assert.ok(!c2.steps[0].ok(R));
  assert.match(c2.steps[0].quase(R), /filtro está certo/);
  assert.ok(!c2.steps[0].quase(J.run("SELECT * FROM veiculos WHERE cor = 'prata'")));
  assert.match(c2.steps[1].quase(J.run("SELECT cor FROM veiculos WHERE placa LIKE 'FTR%'")), /placa/);
  assert.match(c2.steps[2].quase(J.run("SELECT modelo FROM veiculos WHERE cor = 'prata' AND placa LIKE 'FTR%'")), /placa/);
  assert.match(c3.steps[0].quase(J.run("SELECT velocidade_kmh FROM leituras_radar WHERE local_radar LIKE '%Km 18%' AND data_hora BETWEEN '2026-10-12 22:45:00' AND '2026-10-12 23:15:00' AND velocidade_kmh > 120")), /placa/);
  assert.match(c3.steps[1].quase(J.run("SELECT placa, cor FROM veiculos WHERE placa IN ('KZX9B21','JKL4A12','RTA8K02')")), /modelo/);
  assert.match(c3.steps[2].quase(J.run("SELECT cpf, cidade FROM pessoas WHERE cpf = '318.442.907-15'")), /nome/);
  // não dispara por coincidência de número de linhas
  assert.ok(!c2.steps[0].quase(J.run('SELECT modelo FROM veiculos LIMIT ' + J.T.F.prata.length)));
  assert.ok(!c2.steps[0].quase(J.run("SELECT cor FROM veiculos WHERE cor = 'preto' LIMIT " + J.T.F.prata.length)));
  // a dica do formato manda manter o *
  assert.match(c2.steps[0].h[1], /Mantenha o <code>\*<\/code>/);
});

test('telemetria do playtest: várias consultas no editor e resultados vazios explicados', () => {
  const { T } = J;
  // jogada real: duas consultas, a segunda vazia. Antes, o jogo mostrava a primeira como se fosse o resultado.
  const r = T.executarSQL(J.db, "SELECT * FROM veiculos Where cor = 'prata';  SELECT * FROM veiculos Where cor = 'Preto';");
  assert.strictEqual(r.length, 2);
  assert.strictEqual(r[0].values.length, T.F.prata.length);
  assert.strictEqual(r[1].values.length, 0);
  assert.deepStrictEqual([...r[1].columns], ['placa', 'modelo', 'cor', 'ano', 'cpf_proprietario']);
  assert.match(T.zeroRowHint(r[1].sql), /'Preto'.*diferente de.*'preto'/);
  // placa = 'FRT': o = exige o valor inteiro
  assert.match(T.zeroRowHint("SELECT * FROM veiculos WHERE placa = 'FRT';"), /inteiro e idêntico/);
  assert.throws(() => T.executarSQL(J.db, 'SELECT * FORM veiculos'), /syntax error/);
});

test('dicas dos BOs: a última é a consulta, as anteriores não entregam o valor do caso', () => {
  for (const c of J.T.CASES) for (const s of c.steps) {
    assert.ok(s.h.length >= 2, c.id);
    if (c.id === '1002') for (const d of s.h.slice(0, -1)) assert.doesNotMatch(d, /'prata'|FTR%/, 'dica intermediária entrega a resposta');
  }
});

test('SQL: somente leitura, tradução de erro e explicador', () => {
  const { T } = J;
  assert.ok(T.isReadOnly('SELECT * FROM veiculos;'));
  assert.ok(!T.isReadOnly("UPDATE catraca_acessos SET horario_saida='18:00:00'"));
  assert.ok(!T.isReadOnly('SELECT 1; DELETE FROM veiculos'));
  assert.ok(!T.isReadOnly('BEGIN'));
  assert.ok(!T.isReadOnly('PRAGMA writable_schema = 1'));
  assert.ok(T.isReadOnly("SELECT * FROM veiculos WHERE modelo = 'update'"), 'palavra dentro de texto não conta');
  // erro de digitação não é tentativa de escrita: vai para o SQLite e vira dica
  assert.ok(T.isReadOnly('SELEC modelo FROM veiculos'));
  assert.throws(() => J.db.exec('SELEC modelo FROM veiculos'), /syntax error/);
  const schema = { tables: ['veiculos', 'pessoas'], cols: ['placa', 'cor'] };
  assert.match(T.translateError('near "FORM": syntax error', 'SELECT * FORM veiculos', schema), /FROM/);
  assert.ok(T.explainSQL("SELECT placa FROM veiculos WHERE cor = 'prata' LIMIT 5;").rows.length >= 4);
});
