/* Idiomas: a convenção L('texto em português') e a cobertura de cada tradução. Guia: docs/idiomas.md */
const test = require('node:test');
const assert = require('node:assert');
const { extrairTextos, carregarIdiomas, cobertura } = require('../scripts/i18n');
const { carregarJogo } = require('./carregar');

test('todo L() usa texto literal (a ferramenta precisa enxergar o texto para traduzir)', () => {
  assert.deepStrictEqual(extrairTextos().problemas, []);
});

test('traduções: sem órfãos, mesmos {marcadores}; idioma "pronto" precisa estar 100% traduzido', () => {
  const idiomas = carregarIdiomas();
  for (const cod of Object.keys(idiomas)) {
    if (cod === 'pt-BR') continue;
    const c = cobertura(cod);
    assert.deepStrictEqual(c.orfaos, [], `${cod}: tradução de texto que não existe mais no código`);
    assert.deepStrictEqual(c.marcadoresDiferentes, [], `${cod}: {marcadores} diferentes do original`);
    if (c.pronto) assert.deepStrictEqual(c.faltando, [], `${cod} está marcado como pronto, mas falta traduzir`);
  }
});

test('o texto fixo do index.html entra na tradução', () => {
  const t = extrairTextos().textos;
  for (const s of ['Iniciar expediente', 'Usuário', 'Senha', 'Metas', 'Auditoria da Corregedoria']) assert.ok(t.has(s), s);
});

test('L(): tradução, volta para o português, marcadores e plural', async () => {
  const { T } = await carregarJogo();
  T.definirIdioma('pt-BR');
  assert.strictEqual(T.L('Executar'), 'Executar');
  assert.strictEqual(T.L('Base carregada: {n} veículos no cadastro.', { n: 48 }), 'Base carregada: 48 veículos no cadastro.');
  assert.strictEqual(T.Lp(1, '1 linha', '{n} linhas'), '1 linha');
  assert.strictEqual(T.Lp(3, '1 linha', '{n} linhas'), '3 linhas');
  T.definirIdioma('en');
  assert.strictEqual(T.L('Executar'), 'Run');
  assert.strictEqual(T.Lp(3, '1 linha', '{n} linhas'), '3 rows');
  assert.strictEqual(T.L('Texto que ninguém traduziu ainda.'), 'Texto que ninguém traduziu ainda.', 'sem tradução, aparece o português');
  assert.strictEqual(T.L('Corregedoria +{n}%', { n: 5 }), 'Internal Affairs +5%');
  T.definirIdioma('pt-BR');
});
