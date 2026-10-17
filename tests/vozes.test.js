/* Vozes: identificação estável das falas, versão falada e roteiro de gravação (npm run vozes). Guia: docs/vozes.md */
const test = require('node:test');
const assert = require('node:assert');
const { carregarJogo } = require('./carregar');
const { coletarFalas } = require('../scripts/vozes');

test('id da fala: depende do texto que aparece, não da formatação', async () => {
  const { T } = await carregarJogo();
  const a = T.idFala('celia', '<p>Mais um recruta. O último durou três semanas.</p>');
  assert.strictEqual(a, T.idFala('celia', '<b>Mais um recruta.</b>   O último durou três semanas.'));
  assert.notStrictEqual(a, T.idFala('celia', 'Mais um recruta. O último durou quatro semanas.'), 'mudou o texto, muda o id');
  assert.notStrictEqual(a, T.idFala('beto', 'Mais um recruta. O último durou três semanas.'), 'outro personagem, outro id');
  assert.match(a, /^celia-[0-9a-f]{8}$/);
});

test('versão falada: símbolos de SQL viram palavras', async () => {
  const { T } = await carregarJogo();
  assert.strictEqual(T.textoFalado("<code>SELECT * FROM veiculos;</code>", 'pt-BR'), 'SELECT asterisco FROM veiculos.');
  assert.match(T.textoFalado("Troca por <code>LIKE 'BJ%'</code> e <code>ano >= 2022</code>", 'pt-BR'), /LIKE BJ porcento e ano maior ou igual a 2022/);
  assert.match(T.textoFalado('Clica nos tracinhos <code>___</code>', 'pt-BR'), /tracinhos tracinhos|tracinhos$/);
});

test('roteiro: todas as falas, sem repetição, com o mesmo id que o jogo calcula', async () => {
  const falas = await coletarFalas('pt-BR');
  const ids = falas.map(f => f.id);
  assert.strictEqual(new Set(ids).size, ids.length, 'ids únicos');
  assert.ok(falas.length > 200);
  for (const p of ['celia', 'beto', 'jairo', 'marina']) assert.ok(falas.some(f => f.personagem === p), 'falas de ' + p);
  assert.ok(falas.some(f => f.texto.startsWith('Mais um recruta. O último durou três semanas.')));
  // texto do treinamento com {n}: o jogo mostra o número preenchido, e o id tem que bater com o da tela
  const { T } = await carregarJogo();
  const after = T.TREINOS.m1.passos.find(p => /\{n\}/.test(p.after || '')).after;
  const daTela = T.idFala('celia', T.fill(after));
  assert.ok(ids.includes(daTela), 'id do texto preenchido, como aparece na tela');
  assert.ok(!falas.find(f => f.id === daTela).dinamica);
  // fala com valor calculado na hora não dá para gravar
  assert.ok(falas.some(f => f.dinamica && f.personagem === 'jairo'));
  assert.ok(falas.every(f => f.falado && !/<|&lt;/.test(f.falado)), 'texto para a voz sem HTML');
});
