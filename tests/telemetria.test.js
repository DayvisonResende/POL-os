/* Telemetria remota: a análise do relatório e o comando "npm run telemetria" contra um Supabase falso. */
const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const os = require('os');
const path = require('path');
const http = require('http');
const { execFile } = require('child_process');
const { analisar, relatorioMarkdown } = require('../scripts/telemetria-analise');

// Duas pessoas: A termina o jogo; B trava no BO 1002 e para.
function linhas() {
  let id = 0, t = Date.UTC(2026, 9, 20, 12);
  const ev = (jogador, sessao, tipo, onde, dados = {}, passo = 20000) => ({ id: ++id, jogador, sessao, versao: '2026-10-17', t: (t += passo), tipo, onde, dados });
  const A = (...x) => ev('jogador-aaaa', 'sessao-aaaa', ...x), B = (...x) => ev('jogador-bbbb', 'sessao-bbbb', ...x);
  return [
    A('sessao', 'Treino 01 · msg', { faixa: 'desktop', navegador: 'Chrome', sistema: 'Linux', msBanco: 800 }),
    A('treino_fim', 'BO 1001', { treino: 'm1' }), A('desfecho', 'BO 1001', { caso: '1001', ok: true }),
    A('prova', 'Prova Módulo 1', { onde: 'Prova Módulo 1', nota: 5 }), A('treino_fim', 'BO 1002', { treino: 'm2-filtros' }),
    A('desfecho', 'BO 1002', { caso: '1002', ok: true }), A('treino_fim', 'BO 1003', { treino: 'm2-intervalos' }),
    A('desfecho', 'BO 1003', { caso: '1003', ok: true }), A('prova', 'Prova Módulo 2', { onde: 'Prova Módulo 2', nota: 4 }),
    A('treino_fim', 'BO 1004', { treino: 'm3-agregacao' }), A('desfecho', 'BO 1004', { caso: '1004', ok: true }),
    A('treino_fim', 'BO 1005', { treino: 'm3-nulos' }), A('desfecho', 'BO 1005', { caso: '1005', ok: true }),
    A('prova', 'Prova Módulo 3', { onde: 'Prova Módulo 3', nota: 5 }),
    A('treino_fim', 'BO 1006', { treino: 'm4-join' }), A('desfecho', 'BO 1006', { caso: '1006', ok: true }),
    A('treino_fim', 'BO 1007', { treino: 'm4-left' }), A('desfecho', 'BO 1007', { caso: '1007', ok: true }),
    A('prova', 'Prova Módulo 4', { onde: 'Prova Módulo 4', nota: 5 }),
    B('sessao', 'Treino 01 · msg', { faixa: 'celular', navegador: 'Chrome', sistema: 'Android', msBanco: 2400 }),
    B('treino_fim', 'BO 1001', { treino: 'm1' }), B('desfecho', 'BO 1001', { caso: '1001', ok: true }),
    B('prova', 'Prova Módulo 1', { onde: 'Prova Módulo 1', nota: 4 }), B('treino_fim', 'BO 1002', { treino: 'm2-filtros' }),
    B('consulta', 'BO 1002', { res: 'erro', erro: 'near "FROM": syntax error' }), B('consulta', 'BO 1002', { res: 'vazio' }),
    B('dica', 'BO 1002', { nivel: 1 }), B('dica_auto', 'BO 1002', { texto: 'Faltou o WHERE.' }),
    B('erro_js', 'BO 1002', { msg: 'x is undefined', arquivo: 'js/apps/teste.js', linha: 3 }),
    B('dilema', 'BO 1002', { quem: 'beto', escolha: 'recusou' }), B('saida', 'BO 1002'),
  ];
}

test('análise: funil, onde travam, onde pararam, erros e aparelhos', () => {
  const a = analisar(linhas());
  assert.strictEqual(a.jogadores, 2);
  assert.strictEqual(a.sessoes, 2);
  const funil = Object.fromEntries(a.funil);
  assert.strictEqual(funil['Abriu o jogo'], 2);
  assert.strictEqual(funil['Terminou o treinamento Filtros'], 2);
  assert.strictEqual(funil['Fechou o BO 1002'], 1);
  assert.strictEqual(funil['Passou na prova do Módulo 2'], 1);
  assert.deepStrictEqual(a.ondeDesistiram, [['BO 1002', 1]]);
  assert.strictEqual(a.maisProblematicos[0].onde, 'BO 1002');
  assert.deepStrictEqual(a.errosSql, [['near "FROM": syntax error', 1]]);
  assert.deepStrictEqual(a.errosDoJogo, [['x is undefined (js/apps/teste.js:3)', 1]]);
  assert.deepStrictEqual(a.dilemaBeto, [['recusou', 1]]);
  assert.deepStrictEqual(Object.fromEntries(a.aparelhos.faixa), { desktop: 1, celular: 1 });
  assert.strictEqual(a.msBancoMediana, 1600);
  const md = relatorioMarkdown(a);
  assert.match(md, /\| Fechou o BO 1002 \| 1 \| 50% \|/);
  assert.match(md, /Erros técnicos do jogo/);
});

test('npm run telemetria: baixa do Supabase, separa por sessão e gera o relatório', async () => {
  const dados = linhas();
  const pedidos = [];
  const servidor = http.createServer((req, res) => {
    pedidos.push({ url: req.url, chave: req.headers.apikey });
    const depoisDe = Number((req.url.match(/id=gt\.(\d+)/) || [])[1] || 0);
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(dados.filter(d => d.id > depoisDe)));
  });
  await new Promise(r => servidor.listen(0, r));
  const pasta = fs.mkdtempSync(path.join(os.tmpdir(), 'sisp-tele-'));
  const rodar = (extra = {}) => new Promise((ok, falha) => execFile(process.execPath, [path.join(__dirname, '..', 'scripts', 'telemetria.js')],
    { env: { ...process.env, TELEMETRIA_IGNORAR: '', ...extra, SUPABASE_URL: `http://127.0.0.1:${servidor.address().port}`, SUPABASE_SERVICE_KEY: 'chave-secreta-teste', SISP_TELEMETRIA_PASTA: pasta, ...extra } },
    (erro, saida, err) => erro ? falha(new Error(err || erro.message)) : ok(saida)));
  try {
    assert.match(await rodar(), /31 evento\(s\) novo\(s\)/);
    assert.strictEqual(pedidos[0].chave, 'chave-secreta-teste');
    assert.deepStrictEqual(fs.readdirSync(path.join(pasta, 'sessoes')).sort(), ['2026-10-20-sessao-a.json', '2026-10-20-sessao-b.json']);
    const sessaoB = JSON.parse(fs.readFileSync(path.join(pasta, 'sessoes', '2026-10-20-sessao-b.json'), 'utf8'));
    assert.strictEqual(sessaoB.eventos.find(e => e.tipo === 'consulta').res, 'erro', 'mesmo formato do Baixar JSON do jogo');
    assert.match(fs.readFileSync(path.join(pasta, 'relatorio.md'), 'utf8'), /\*\*2\*\* jogador/);
    // segunda vez: só pede o que é novo e não duplica
    assert.match(await rodar(), /0 evento\(s\) novo\(s\)\. Total: 31 eventos/);
    assert.match(pedidos[pedidos.length - 1].url, /id=gt\.31/);
    // os testes do autor (TELEMETRIA_IGNORAR, pelo começo do código) ficam fora do relatório
    assert.match(await rodar({ TELEMETRIA_IGNORAR: 'jogador-bb' }), /Fora do relatório: \d+ evento\(s\) \(1 jogador/);
    assert.match(fs.readFileSync(path.join(pasta, 'relatorio.md'), 'utf8'), /\*\*1\*\* jogador/);
  } finally { servidor.close(); fs.rmSync(pasta, { recursive: true, force: true }); }
});
