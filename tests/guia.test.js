/* Guia SQL: todo exemplo roda, cada verbete aparece só depois do treinamento certo, e nada entrega resposta de BO. */
const test = require('node:test');
const assert = require('node:assert');
const { carregarJogo } = require('./carregar');

// O que os BOs perguntam (e as pistas guardadas para depois). Nada disso pode aparecer em texto ou SQL de exemplo.
const PROIBIDO_TEXTO = /prata|Virtus|Hilux|Castelo|Raposo|Dom Aguirre|Piedade|\bItu\b|Salto|FTR|KZX|22:45|23:15|2026-10-13|13\/10|conta_origem|conta_destino|Denise|Valdemar|Marina|Lucas|laranja|9000|9999/i;

test('Guia: verbetes completos, ids únicos, ligados a treinamentos que existem', async () => {
  const { T } = await carregarJogo();
  const ids = T.VERBETES.map(v => v.id);
  assert.ok(ids.length >= 20);
  assert.strictEqual(new Set(ids).size, ids.length, 'ids únicos');
  for (const v of T.VERBETES) {
    assert.ok(T.TREINOS[v.treino], `${v.id}: treinamento ${v.treino} não existe`);
    assert.ok(v.titulo && v.resumo && v.formato && v.exemplos.length && v.erros.length, `${v.id}: verbete incompleto`);
    for (const r of v.ver || []) assert.ok(ids.includes(r), `${v.id}: "ver também" aponta para ${r}, que não existe`);
  }
});

test('Guia: todo exemplo roda no banco do jogo', async () => {
  const { T, db } = await carregarJogo();
  for (const v of T.VERBETES) for (const e of v.exemplos) assert.doesNotThrow(() => db.exec(e.sql), `${v.id}: ${e.sql}`);
});

test('Guia: nada que entregue resposta de BO', async () => {
  const { T, db } = await carregarJogo();
  const F = T.F;
  // respostas e pistas calculadas do banco (placas, nomes, contas)
  const respostas = ['FTR7A93', 'KZX9B21', 'Denise Albuquerque Prado', 'Valdemar Silveira', F.cpfDenise].concat(F.laranjas || []).filter(Boolean);
  for (const v of T.VERBETES) {
    const texto = [v.titulo, v.resumo, v.formato, v.mercado || '', ...v.erros, ...v.exemplos.map(e => e.sql + ' ' + e.explica)].join(' ');
    assert.doesNotMatch(texto, PROIBIDO_TEXTO, v.id);
    for (const e of v.exemplos) {
      // listagem grande (a tabela inteira) é o mesmo que o jogador já vê no Módulo 1; o perigo é o resultado curto,
      // que aponta para alguém. Esse não pode ter nenhuma resposta.
      const r = db.exec(e.sql)[0], linhas = r ? r.values : [];
      if (linhas.length <= 10) {
        const tudo = JSON.stringify(linhas);
        for (const a of respostas) assert.ok(!tudo.includes(a), `${v.id}: o exemplo "${e.sql}" mostra ${a}`);
      }
    }
  }
});

test('Guia: só aparece o que já foi ensinado; a busca acha por nome e por palavra', async () => {
  const { T } = await carregarJogo();
  const so = feitos => Array.from(T.verbetesLiberados(t => feitos.includes(t)).map(v => v.id));
  assert.deepStrictEqual(so([]), []);
  assert.ok(so(['m1']).includes('select') && !so(['m1']).includes('where'));
  assert.ok(so(['m1', 'm2-filtros']).includes('like') && !so(['m1', 'm2-filtros']).includes('groupby'));
  const todos = T.verbetesLiberados(() => true);
  assert.strictEqual(T.buscarVerbetes(todos, 'having')[0].id, 'having');
  assert.ok(T.buscarVerbetes(todos, 'vazio').some(v => v.id === 'null'), 'acha por palavra do dia a dia');
  assert.ok(T.buscarVerbetes(todos, 'MÉDIA').some(v => v.id === 'sumavg'), 'sem ligar para acento e maiúscula');
});
