/* Jogatina completa no Chrome headless: tutorial (errando de propósito), BO 1001,
   prova 1, BO 1002, BO 1003, prova 2 e promoção, em largura de desktop e de celular.
   Precisa de um Chrome/Chromium instalado; sem ele, o teste é pulado.
   Caminho do navegador: variável CHROME, ou os caminhos comuns abaixo. */
const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');
const { RAIZ } = require('./carregar');

const CHROME = [process.env.CHROME, '/usr/bin/google-chrome', '/usr/bin/chromium', '/usr/bin/chromium-browser', '/snap/bin/chromium',
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe']
  .find(p => p && fs.existsSync(p));
const ASM = path.join(RAIZ, 'node_modules/sql.js/dist/sql-asm.js');

// O index.html sempre; a versão empacotada só se já tiver sido gerada (npm run empacotar).
const ALVOS = ['index.html', 'dist/sisp.html'].filter(f => fs.existsSync(path.join(RAIZ, f)));

async function abrir(arquivo, largura, query = '', config = { url: '', chave: '', contato: '' }, idioma = 'pt-BR') {
  const { chromium } = require('playwright-core');
  const browser = await chromium.launch({ executablePath: CHROME, headless: true });
  const page = await browser.newPage({ viewport: { width: largura, height: 800 } });
  const erros = [];
  page.on('pageerror', e => erros.push(e.message));
  page.on('console', m => { if (m.type() === 'error' && !/ERR_FAILED/.test(m.text())) erros.push(m.text()); });
  // sql.js vem do disco; o resto da rede (fontes do Google) é bloqueado.
  await page.route('**/*', r => {
    const u = r.request().url();
    if (u.includes('sql-asm.js')) return r.fulfill({ body: fs.readFileSync(ASM), contentType: 'application/javascript' });
    return u.startsWith('file:') ? r.continue() : r.abort();
  });
  await page.addInitScript(c => { window.SISP_CONFIG_TESTE = c; }, config);   // nunca envia para o Supabase de verdade
  if (idioma) await page.addInitScript(i => { window.SISP_IDIOMA_TESTE = i; }, idioma);   // os testes não dependem do idioma do navegador
  await page.goto('file://' + path.join(RAIZ, arquivo) + query);
  await page.waitForFunction(() => !document.querySelector('#lgBtn').disabled);
  return { browser, page, erros };
}

async function treinamento(page) {
  const next = () => page.click('#gNext'), run = () => page.click('#runBtn');
  const digitar = s => page.fill('#sqlEd', s);
  await page.click('#lgBtn');
  await next(); await next();                                   // msg, msg
  await run(); await next();                                    // run
  await next();                                                 // msg anatomia
  await page.click('#explBtn'); await next();                   // explain
  await page.click('.gopt >> nth=1');                           // predict: alternativa errada
  await page.click('.gopt >> nth=0'); await run(); await next();
  await page.click('.chip:has-text("veiculos")');               // slot: peça errada
  await page.click('.chip:has-text("modelo")'); await run(); await next();
  await next();                                                 // msg DISTINCT
  for (const t of ['FROM', 'SELECT']) await page.click(`.chips .chip:text-is("${t}")`);   // blocos: ordem errada…
  for (const t of ['cor', ';', 'veiculos', 'DISTINCT']) await page.click(`.chips .chip:text-is("${t}")`);
  assert.match(await page.textContent('.gfb.bad'), /ordem/);
  while (await page.$('.bline .chip')) await page.click('.bline .chip >> nth=0');   // devolve as peças
  for (const t of ['SELECT', 'DISTINCT', 'cor', 'FROM', 'veiculos', ';']) await page.click(`.chips .chip:text-is("${t}")`);
  await run(); await next();
  await next();                                                 // msg AS/LIMIT
  // moldes: executa sem preencher (bronca), depois clica no editor e digita só a parte pedida
  const preencher = async s => { await page.click('#sqlEd'); await page.keyboard.type(s); };
  await run(); assert.ok(await page.isVisible('.gfb.bad'));
  const MOLDE1 = 'SELECT placa, modelo AS ___ FROM veiculos;';
  await page.fill('#sqlEd', ''); await run();                                    // apagou tudo e executou
  assert.strictEqual(await page.inputValue('#sqlEd'), MOLDE1);
  assert.match(await page.textContent('.gfb.info'), /molde de volta/);
  await page.fill('#sqlEd', 'Veiculo'); await run();                             // erro: a tradução aparece na fala da Célia
  assert.match(await page.textContent('.gfb.bad .gerr'), /Veiculo/);
  await page.click('#clrBtn');                                                    // Limpar devolve o molde
  assert.strictEqual(await page.inputValue('#sqlEd'), MOLDE1);
  await page.fill('#sqlEd', 'xxx'); await page.click('#gMolde');                  // botão Voltar o molde
  assert.strictEqual(await page.inputValue('#sqlEd'), MOLDE1);
  await page.click('#guide');                                                     // tira o foco do editor
  await preencher('Veiculo');
  assert.strictEqual(await page.inputValue('#sqlEd'), 'SELECT placa, modelo AS Veiculo FROM veiculos;');
  await run(); await next();
  await run(); assert.ok(await page.isVisible('.gfb.bad'));
  await preencher('LIMIT 5');
  assert.strictEqual(await page.inputValue('#sqlEd'), 'SELECT placa, modelo AS Veiculo FROM veiculos LIMIT 5;');
  await run(); await next();
  await digitar('SELECT modelo, cor FORM veiculos LIMIT 3;'); await run();         // erro de digitação
  assert.match(await page.textContent('#dbMsg'), /FROM/);
  await digitar('SELECT modelo, cor FROM veiculos LIMIT 3;'); await run(); await next();
  await next();                                                 // final: abre Ocorrências
}

// Joga o treinamento ativo pela interface, respondendo certo em cada passo (respostas vêm do próprio conteúdo).
async function jogarTreino(page) {
  await page.waitForFunction(() => tutActive());
  const id = await page.evaluate(() => S.treino);
  for (let i = 0; i < 60; i++) {
    const st = await page.evaluate(() => {
      if (!tutActive()) return null; const s = tutStep();
      return { type: s.type, after: S.tutPhase === 'after', sol: s.solucao, okOpt: s.opts ? s.opts.findIndex(o => o.ok) : -1,
               chip: s.chips ? s.chips.find(c => c.certo).t : null, answer: s.answer };
    });
    if (!st) return id;
    if (st.after || st.type === 'msg' || st.type === 'final') { await page.click('#gNext'); continue; }
    if (st.type === 'explain') { await page.click('#explBtn'); continue; }
    if (st.type === 'predict') await page.click(`.gopt >> nth=${st.okOpt}`);
    if (st.type === 'slot') await page.click(`.chips .chip:text-is("${st.chip}")`);
    if (st.type === 'blocks') for (const t of st.answer) await page.click(`.chips .chip:text-is("${t}")`);
    if (st.type === 'mold' || st.type === 'free') await page.fill('#sqlEd', st.sol);
    await page.click('#runBtn');
  }
  throw new Error('o treinamento ' + id + ' não terminou');
}

async function entregar(page, campos) {
  for (const [id, v] of Object.entries(campos)) await page.fill('#' + id, v);
  await page.click('.final button[type=submit]');
}

async function prova(page) {
  await page.evaluate(() => {
    openProva(); const pv = S.prova;
    pv.qs.forEach(id => { const q = findQ(pv.mod, id); if (q.check) pv.sql[id] = q.model; else pv.ans[id] = q.ok; });
    gradeProva();
  });
  await page.click('.prova .pfoot .btn-primary:has-text("Receber promoção")');
  await page.click('#prOk');
}

for (const alvo of ALVOS) for (const largura of [1366, 400]) {
  test(`jogatina completa · ${alvo} · ${largura}px`, { skip: !CHROME && 'Chrome não encontrado (defina CHROME)', timeout: 120000 }, async () => {
    const modoTeste = largura > 760;   // desktop com ?teste (painel de diagnóstico); celular sem
    const { browser, page, erros } = await abrir(alvo, largura, modoTeste ? '?teste' : '');
    try {
      await treinamento(page);
      assert.ok(await page.isVisible('.win .oc'), 'Ocorrências abriu no fim do treinamento');
      // a seleção do editor precisa ser translúcida, senão esconde o texto colorido que fica por baixo
      const sel = await page.evaluate(() => getComputedStyle(document.querySelector('#sqlEd'), '::selection').backgroundColor);
      assert.match(sel, /^rgba\(.*, 0?\.\d+\)$/, 'cor de seleção opaca: ' + sel);

      const nCores = await page.evaluate(() => F.cores.length);
      await entregar(page, { f_1001_resp: '99' });
      assert.ok(await page.isVisible('.verdict.bad'));
      await entregar(page, { f_1001_resp: String(nCores) });
      await page.waitForFunction(() => S.apps.indexOf('prova') >= 0);
      await prova(page);
      assert.strictEqual(await page.evaluate(() => S.rank), 1);
      assert.strictEqual(await jogarTreino(page), 'm2-filtros', 'treinamento de filtros começa depois da promoção');
      assert.ok(await page.isVisible('.win .oc'), 'Ocorrências abre no fim do treinamento');
      assert.strictEqual(await page.evaluate(() => CASES[S.caseSel].id), '1002');
      // Anotações da Célia: uma por treinamento concluído, em Arquivos › Anotações
      await page.evaluate(() => { openFiles(); filesDir = 'Anotações'; renderFiles(); });
      assert.deepStrictEqual(await page.$$eval('.flist .file span', e => e.map(x => x.textContent)), ['01_consultas_basicas.txt', '02_filtros.txt']);
      await page.dblclick('.flist .file:has-text("02_filtros.txt")');
      assert.match(await page.textContent('.txtview'), /LIKE entra NO LUGAR do =/);

      // BO 1002: a jogada do playtest recebe os três problemas de uma vez; a escada de dicas tem 3 degraus
      await page.evaluate(() => openOcorr());   // dicas antes de qualquer consulta: tarefa concluída não mostra dica
      for (const b of ['Pedir dica', 'Mais uma dica', 'Ainda travado? Ver a consulta']) await page.click(`.step >> nth=0 >> .hb:text-is("${b}")`);
      assert.strictEqual((await page.$$('.steps > li:first-child .hint')).length, 3);
      await page.evaluate(() => openDb('SELECT cor WHERE "prata" FROM veiculos;'));
      await page.click('#runBtn');
      assert.match(await page.textContent('#dbMsg'), /3 problemas/);
      assert.match(await page.textContent('#dbGrid'), /não rodou/, 'erro não deixa o resultado anterior na tela');
      await page.evaluate(() => openDb("SELECT cor FROM veiculos WHERE cor = 'prata';"));   // jogada do playtest
      await page.click('#runBtn');
      assert.match(await page.textContent('#dbMsg'), /Quase lá.*filtro está certo/);
      await page.evaluate(() => openDb('SELECT * FROM veiculos WHERE cor = "prata";'));
      await page.click('#runBtn');
      assert.match(await page.textContent('#dbMsg'), /por sorte/);
      // duas consultas no editor, a última vazia: o resultado é o da última (vazio), com aviso e dica
      await page.evaluate(() => openDb("SELECT * FROM veiculos Where cor = 'prata';  SELECT * FROM veiculos Where cor = 'Preto';"));
      await page.click('#runBtn');
      assert.match(await page.textContent('#dbGrid'), /não retornou nenhuma linha/);
      assert.match(await page.textContent('#dbMsg'), /2 consultas.*minúsculas/s);
      assert.match(await page.textContent('#dbStatus'), /executada às/);
      // selecionar uma consulta e executar roda só ela
      await page.evaluate(() => { const t = document.querySelector('#sqlEd'); t.focus(); t.setSelectionRange(0, t.value.indexOf(';') + 1); });
      await page.click('#runBtn');
      assert.match(await page.textContent('#dbStatus'), /só o trecho selecionado/);
      assert.strictEqual(await page.$$eval('#dbGrid tbody tr', r => r.length), await page.evaluate(() => F.prata.length));
      await page.evaluate(() => openOcorr());
      await entregar(page, { f_1002_placa: 'FTR2C41' });
      assert.match(await page.textContent('.verdict.bad'), /branco/);
      await entregar(page, { f_1002_placa: 'FTR7A93' });
      assert.strictEqual(await jogarTreino(page), 'm2-intervalos', 'treinamento de intervalos começa depois do BO 1002');

      await page.evaluate(() => { openFiles(); filesDir = 'Evidências'; renderFiles(); });
      const evid = await page.$$eval('.flist .file span', e => e.map(x => x.textContent));
      assert.deepStrictEqual(evid, ['depoimento_seguranca.txt', 'escuta_grampo_04.txt', 'radar_km18_225814.jpg']);
      await page.evaluate(() => openPhoto('radar_km18_225814.jpg'));

      await page.evaluate(() => openOcorr());
      await entregar(page, { f_1003_placa: 'KZX9B21', f_1003_nome: 'Valdemar Silveira' });
      await page.waitForFunction(() => provaMod() === 2);
      await prova(page);
      await page.waitForSelector('.report', { timeout: 5000 });
      // gancho do fim do Ato I: Jairo conta do Valdemar; Célia marca o dia seguinte
      await page.waitForFunction(() => S.chat.jairo.length === 1 && /Amanhã às 8/.test(S.chat.celia[S.chat.celia.length - 1].text), null, { timeout: 12000 });

      const S = await page.evaluate(() => JSON.parse(JSON.stringify(S)));
      assert.deepStrictEqual(S.closed, ['1001', '1002', '1003']);
      assert.deepStrictEqual(S.treinosFeitos, ['m1', 'm2-filtros', 'm2-intervalos']);
      assert.strictEqual(S.chat.marina.length, 1, 'Marina se apresenta uma vez (escuta ou fim do BO 1003)');
      assert.match(S.chat.marina[0].text, /pedaços que nem dava pra entender/);
      assert.strictEqual(S.rank, 2);
      assert.strictEqual(S.done, true);
      assert.strictEqual(S.corr, 25);   // relatório errado (+5) + mandado errado (+20)

      // telemetria: os tropeços de propósito do treinamento ficaram registrados no passo certo
      const T = await page.evaluate(() => ({ ev: TELE.ev, resumo: teleResumo() }));
      const lugar = o => T.resumo.lugares.find(x => x.onde.startsWith(o)) || {};
      assert.ok(lugar('Treino 06').tropecos >= 1, 'predict errado');
      assert.ok(lugar('Treino 07').tropecos >= 1, 'peça errada');
      assert.ok(lugar('Treino 09').tropecos >= 1, 'blocos fora de ordem');
      assert.ok(lugar('Treino 13').erros >= 1, 'erro de SQL no passo livre');
      assert.ok(T.ev.some(e => e.tipo === 'desfecho' && e.caso === '1002' && !e.ok), 'mandado indeferido');
      assert.strictEqual(T.ev.filter(e => e.tipo === 'prova').length, 2);
      assert.strictEqual(T.ev.filter(e => e.tipo === 'sessao').length, 1);

      await page.click('.report #rpClose');
      await page.click('#startBtn');
      const temDiag = await page.isVisible('#startMenu button:has-text("Diagnóstico")');
      assert.strictEqual(temDiag, modoTeste, 'painel só aparece com ?teste');
      if (modoTeste) {
        await page.click('#startMenu button:has-text("Diagnóstico")');
        assert.ok((await page.$$('.diag .dtab tbody tr')).length >= 14, 'uma linha por passo do treino + BOs');
        const dl = page.waitForEvent('download');
        await page.click('#dgBaixar');
        assert.match((await dl).suggestedFilename(), /^sisp-telemetria-.*\.json$/);
      }
      assert.deepStrictEqual(erros, [], 'sem erros no console');
    } finally { await browser.close(); }
  });
}

// Saves no formato de antes do Sprint 2 (sem S.treino): ninguém perde progresso nem refaz treinamento.
const SAVE_ANTIGO = extra => JSON.stringify(Object.assign({ chat: { celia: [], beto: [] }, unread: { celia: 0, beto: 0 }, apps: ['db'], tut: 0, tutPhase: 'doing' }, extra));
const CASOS_SAVE = [
  { nome: 'no meio do treinamento do Módulo 1', save: { tut: 5 },
    espera: { treino: 'm1', tut: 5, feitos: [] } },
  { nome: 'promovido, ainda no BO 1002', save: { tut: 14, rank: 1, closed: ['1001'], caseSel: 1, apps: ['db', 'ocorr', 'zap', 'prova', 'files'] },
    espera: { treino: 'm2-filtros', tut: 0, feitos: ['m1'] } },
  { nome: 'jogo já terminado', save: { tut: 14, rank: 2, done: true, closed: ['1001', '1002', '1003'], caseSel: 2, apps: ['db', 'ocorr', 'zap', 'prova', 'files'] },
    espera: { treino: null, tut: 0, feitos: ['m1'] } },
];
for (const c of CASOS_SAVE) {
  test(`save antigo · ${c.nome}`, { skip: !CHROME && 'Chrome não encontrado (defina CHROME)', timeout: 60000 }, async () => {
    const { chromium } = require('playwright-core');
    const browser = await chromium.launch({ executablePath: CHROME, headless: true });
    try {
      const page = await browser.newPage({ viewport: { width: 1366, height: 800 } });
      const erros = []; page.on('pageerror', e => erros.push(e.message));
      await page.route('**/*', r => { const u = r.request().url(); if (u.includes('sql-asm.js')) return r.fulfill({ body: fs.readFileSync(ASM), contentType: 'application/javascript' }); return u.startsWith('file:') ? r.continue() : r.abort(); });
      await page.addInitScript(() => { window.SISP_CONFIG_TESTE = { url: '', chave: '', contato: '' }; window.SISP_IDIOMA_TESTE = 'pt-BR'; });
      await page.addInitScript(s => { if (!sessionStorage.getItem('ok')) { localStorage.setItem('sisp-proto-v2', s); sessionStorage.setItem('ok', '1'); } }, SAVE_ANTIGO(c.save));
      await page.goto('file://' + path.join(RAIZ, 'index.html'));
      await page.waitForFunction(() => !document.querySelector('#lgBtn').disabled);
      await page.click('#lgBtn');
      await page.waitForTimeout(300);
      const S = await page.evaluate(() => ({ treino: S.treino, tut: S.tut, feitos: S.treinosFeitos, guia: !!document.querySelector('#guide'), passo: (document.querySelector('.gh small') || {}).textContent, contatos: Object.keys(S.chat).sort().join(',') }));
      assert.strictEqual(S.contatos, 'beto,celia,jairo,marina', 'save antigo ganha as conversas dos contatos novos');
      assert.strictEqual(S.treino, c.espera.treino);
      assert.strictEqual(S.tut, c.espera.tut);
      assert.deepStrictEqual(S.feitos, c.espera.feitos);
      assert.strictEqual(S.guia, !!c.espera.treino, 'painel da Célia aparece só se houver treinamento');
      if (c.espera.treino === 'm1') assert.match(S.passo, /passo 6 de 14/);
      assert.deepStrictEqual(erros, []);
    } finally { await browser.close(); }
  });
}

// Playtest do Dayvison (treino Intervalos): o intervalo de data e hora agora tem duas lacunas pequenas.
// Clicar seleciona a primeira lacuna que sobrou; digitar substitui. Executar com o BETWEEN vazio explica o que falta.
test('treino Intervalos · BETWEEN com data e hora em duas lacunas', { skip: !CHROME && 'Chrome não encontrado (defina CHROME)', timeout: 60000 }, async () => {
  const { browser, page, erros } = await abrir('index.html', 1366);
  try {
    await page.click('#lgBtn');
    const passo = await page.evaluate(() => { S.treinosFeitos = ['m1']; iniciarTreino('m2-intervalos'); const i = tutPassos().findIndex(p => p.type === 'mold' && /BETWEEN '2026-10-12 ___'/.test(p.template)); S.tut = i; tutEnter(); return i; });
    assert.ok(passo > 0);
    assert.strictEqual(await page.evaluate(() => tutPassos()[S.tut - 1].type), 'predict', 'antes de escrever, o jogador vê e prevê');
    // histórico: as falas anteriores ficam disponíveis para reler, recolhidas
    assert.strictEqual((await page.textContent('.ghist > summary')).trim(), `Rever falas anteriores (${passo})`);
    assert.ok(!(await page.isVisible('.ghi')), 'histórico começa recolhido');
    await page.click('.ghist > summary');
    await page.click(`.ghi[data-k="${passo}"] > summary`);
    assert.match(await page.textContent(`.ghi[data-k="${passo}"]`), /data e hora/);
    await page.waitForFunction(n => TELE.ev.some(e => e.tipo === 'releu' && e.passo === n), passo, { timeout: 3000 });   // releitura vai para a telemetria
    // a jogada que travou: apagar a lacuna e executar
    await page.fill('#sqlEd', "SELECT placa, data_hora FROM leituras_radar WHERE local_radar = 'Av. São Paulo' AND data_hora BETWEEN ;");
    await page.click('#runBtn');
    assert.match(await page.textContent('.gfb.bad'), /duas pontas/);
    await page.click('#gMolde');
    await page.click('#guide');
    await page.click('#sqlEd'); await page.keyboard.type('18:00:00');
    await page.click('#guide');
    await page.click('#sqlEd'); await page.keyboard.type('20:00:00');
    assert.match(await page.inputValue('#sqlEd'), /BETWEEN '2026-10-12 18:00:00' AND '2026-10-12 20:00:00';$/);
    await page.click('#runBtn');
    assert.strictEqual(await page.evaluate(() => S.tutPhase), 'after');
    assert.deepStrictEqual(erros, []);
  } finally { await browser.close(); }
});

// Tabelas financeiras: só para Inspetor Analítico. Antes disso, não aparecem e não podem ser consultadas (sem punição).
test('tabelas restritas por patente', { skip: !CHROME && 'Chrome não encontrado (defina CHROME)', timeout: 60000 }, async () => {
  const { browser, page, erros } = await abrir('index.html', 1366);
  try {
    await page.click('#lgBtn');
    await page.evaluate(() => { S.treino = null; S.treinosFeitos = ['m1']; S.tut = 0; Object.keys(WINS).forEach(k => WINS[k].el.remove()); for (const k in WINS) delete WINS[k]; dictOpen = true; openDb('SELECT * FROM transferencias;'); });
    assert.doesNotMatch(await page.textContent('#dict'), /transferencias|contas_bancarias/, 'Dicionário não mostra tabela restrita');
    const corr = await page.evaluate(() => S.corr);
    await page.click('#runBtn');
    assert.match(await page.textContent('#dbMsg'), /Acesso negado.*transferencias.*Inspetor Analítico/s);
    assert.strictEqual(await page.evaluate(() => S.corr), corr, 'consultar tabela restrita não pune');
    // com a patente, a tabela aparece e roda
    await page.evaluate(() => { S.rank = 3; atualizarSchema(); renderDict(); });
    assert.match(await page.textContent('#dict'), /transferencias/);
    assert.strictEqual(await page.evaluate(() => tabelaBloqueada('SELECT * FROM transferencias')), null);
    assert.deepStrictEqual(erros, []);
  } finally { await browser.close(); }
});

// Backup do progresso: salvar em arquivo, reiniciar (com confirmação) e carregar pelo menu Configurações.
test('backup · salvar, reiniciar e carregar o progresso', { skip: !CHROME && 'Chrome não encontrado (defina CHROME)', timeout: 90000 }, async () => {
  const os = require('os');
  const { browser, page, erros } = await abrir('index.html', 1366);
  try {
    await page.click('#lgBtn');
    await page.evaluate(() => { S.treino = null; S.tut = 0; S.treinosFeitos = ['m1', 'm2-filtros']; S.rank = 1; S.closed = ['1001']; S.metas = 30; save(); buildStart(); });
    const menu = async item => { await page.click('#startBtn'); await page.click('#startMenu .sm-abre'); await page.click(`#startMenu .sm-fly button:has-text("${item}")`); };

    const dl = page.waitForEvent('download');
    await menu('Salvar progresso em arquivo');
    const download = await dl;
    assert.match(download.suggestedFilename(), /^sisp-progresso-.*\.json$/);
    const arquivo = await download.path();
    const salvo = JSON.parse(fs.readFileSync(arquivo, 'utf8'));
    assert.strictEqual(salvo.jogo, 'sisp');
    assert.deepStrictEqual(salvo.estado.closed, ['1001']);

    // reiniciar pede confirmação; cancelar não apaga nada
    await menu('Reiniciar turno');
    assert.ok(await page.isVisible('.overlay [role=dialog]'));
    await page.click('.overlay button:has-text("Cancelar")');
    assert.strictEqual(await page.evaluate(() => S.rank), 1);
    await menu('Reiniciar turno');
    await Promise.all([page.waitForNavigation(), page.click('.overlay button:has-text("Reiniciar sem salvar")')]);
    await page.waitForFunction(() => !document.querySelector('#lgBtn').disabled);
    assert.strictEqual(await page.evaluate(() => S.rank), 0, 'progresso apagado');

    assert.strictEqual(await page.$('#bootImport'), null, 'a tela de login não oferece carregar progresso');
    await page.click('#lgBtn');

    // arquivo que não é backup: explica e não mexe em nada
    const ruim = path.join(os.tmpdir(), 'nao-e-backup.json'); fs.writeFileSync(ruim, '{"oi":1}');
    let fc = page.waitForEvent('filechooser'); await menu('Carregar progresso'); await (await fc).setFiles(ruim);
    await page.waitForFunction(() => /não é um progresso salvo/.test(document.querySelector('#toasts').textContent));

    // carregar o backup pelo menu Configurações
    fc = page.waitForEvent('filechooser'); await menu('Carregar progresso'); await (await fc).setFiles(arquivo);
    await page.waitForSelector('.overlay [role=dialog]');
    assert.match(await page.textContent('.overlay'), /Estagiário do Arquivo, 1 chamado/);
    await Promise.all([page.waitForNavigation(), page.click('.overlay button:has-text("Carregar este progresso")')]);
    await page.waitForFunction(() => !document.querySelector('#lgBtn').disabled);
    const S = await page.evaluate(() => ({ rank: S.rank, closed: S.closed, feitos: S.treinosFeitos, metas: S.metas }));
    assert.deepStrictEqual(S, { rank: 1, closed: ['1001'], feitos: ['m1', 'm2-filtros'], metas: 30 });
    assert.match(await page.textContent('#bootStatus'), /progresso foi mantido/);
    assert.deepStrictEqual(erros, []);
  } finally { await browser.close(); }
});

// Telemetria remota contra um Supabase simulado: termo no primeiro login, nada sai sem "sim",
// eventos anônimos em lote, envio para quando o jogador desliga.
test('telemetria remota · termo de uso e envio anônimo', { skip: !CHROME && 'Chrome não encontrado (defina CHROME)', timeout: 90000 }, async () => {
  const URL_SUPA = 'https://teste-sisp.supabase.co';
  const recebidos = [];
  const preparar = async () => {
    const r = await abrir('index.html', 1366, '', { url: URL_SUPA, chave: 'chave-publica-teste', contato: 'equipe@exemplo.com' });
    await r.page.route(URL_SUPA + '/**', async rota => {
      const req = rota.request();
      recebidos.push({ url: req.url(), headers: req.headers(), corpo: JSON.parse(req.postData() || '[]') });
      await rota.fulfill({ status: 201, body: '' });
    });
    return r;
  };

  // 1) recusa: o jogo segue normal e nada é enviado
  let { browser, page, erros } = await preparar();
  try {
    await page.click('#lgBtn');
    await page.waitForSelector('.overlay [role=dialog]');
    assert.match(await page.textContent('.overlay'), /Termo de uso do Pol-OS.*nunca é enviado/s);
    await page.click('.overlay button:has-text("Não enviar")');
    assert.ok(await page.isVisible('#guide'), 'jogo começa normalmente');
    await page.click('#gNext'); await page.click('#gNext');
    await page.evaluate(() => enviarFila());
    await page.waitForTimeout(300);
    assert.strictEqual(recebidos.length, 0, 'sem consentimento, nada sai do navegador');
    assert.deepStrictEqual(erros, []);
  } finally { await browser.close(); }

  // 2) aceite: eventos anônimos chegam em lote, com os campos certos e sem dado pessoal
  ({ browser, page, erros } = await preparar());
  try {
    await page.click('#lgBtn');
    await page.click('.overlay button:has-text("Aceito")');
    await page.click('#gNext'); await page.click('#gNext'); await page.click('#runBtn');
    await page.evaluate(() => enviarFila());
    await page.waitForFunction(() => true);
    await page.waitForTimeout(500);
    assert.ok(recebidos.length >= 1, 'enviou');
    const req = recebidos[0];
    assert.match(req.url, /\/rest\/v1\/eventos$/);
    assert.strictEqual(req.headers['apikey'], 'chave-publica-teste');
    const ev = recebidos.flatMap(r => r.corpo);
    const tipos = ev.map(e => e.tipo);
    for (const t of ['consentimento', 'sessao', 'treino_passo', 'consulta']) assert.ok(tipos.includes(t), 'faltou o evento ' + t);
    for (const e of ev) {
      assert.deepStrictEqual(Object.keys(e).sort(), ['dados', 'jogador', 'onde', 'sessao', 't', 'tipo', 'versao']);
      assert.ok(e.jogador.length >= 8 && e.sessao.length >= 8);
    }
    const sessao = ev.find(e => e.tipo === 'sessao').dados;
    for (const k of ['faixa', 'navegador', 'sistema', 'versao', 'msBanco']) assert.ok(k in sessao, 'sessão sem ' + k);
    const tudo = JSON.stringify(ev);
    assert.doesNotMatch(tudo, /recruta\.dti04|cafe-frio|equipe@exemplo/, 'nada de login, senha ou contato nos eventos');

    // 3) desligar em Configurações › Privacidade: para de enviar
    await page.click('#startBtn'); await page.click('#startMenu .sm-abre');
    await page.click('#startMenu .sm-fly button:has-text("Dados de uso")');
    assert.match(await page.textContent('.overlay'), /ligado.*código anônimo/s);
    await page.click('.overlay button:has-text("Desligar o envio")');
    const antes = recebidos.length;
    await page.click('#gNext').catch(() => {});
    await page.evaluate(() => { tele('teste_depois_de_desligar'); enviarFila(); });
    await page.waitForTimeout(400);
    assert.strictEqual(recebidos.length, antes, 'depois de desligar, nada mais é enviado');
    assert.deepStrictEqual(erros, []);
  } finally { await browser.close(); }
});

// Idiomas: o jogo inteiro em inglês com ?idioma=en (interface traduzida; conteúdo ainda em português cai no original).
test('idioma · interface em inglês e troca pelo menu', { skip: !CHROME && 'Chrome não encontrado (defina CHROME)', timeout: 60000 }, async () => {
  const { browser, page, erros } = await abrir('index.html', 1366, '?idioma=en&teste', undefined, null);
  try {
    assert.strictEqual(await page.evaluate(() => document.documentElement.lang), 'en');
    assert.strictEqual((await page.textContent('#lgBtn')).trim(), 'Start shift');
    assert.match(await page.textContent('#bootStatus'), /Database loaded: 48 vehicles on record\./);
    await page.click('#lgBtn');
    assert.match(await page.textContent('#runBtn'), /Run/);
    assert.match(await page.textContent('#explBtn'), /Explain this query/);
    assert.match(await page.textContent('.gh small'), /step 1 of 14/);
    await page.click('#gNext'); await page.click('#gNext'); await page.click('#runBtn');
    assert.match(await page.textContent('#dbStatus'), /48 rows · 5 columns/);
    await page.click('#startBtn');
    assert.match(await page.textContent('#startMenu'), /Programs.*Shift report.*Settings/s);
    // com ?teste o menu oferece também idiomas incompletos; escolher português recarrega em português
    await page.click('#startMenu .sm-abre');
    await page.click('#startMenu .sm-fly button:has-text("English")');
    assert.match(await page.textContent('.overlay'), /Choose the game's language/);
    await page.evaluate(() => { delete window.SISP_IDIOMA_TESTE; });
    await Promise.all([page.waitForNavigation(), page.click('.overlay button:has-text("Português")')]);
    await page.waitForFunction(() => !document.querySelector('#lgBtn').disabled);
    assert.strictEqual(await page.evaluate(() => idiomaAtual()), 'pt-BR');
    assert.strictEqual((await page.textContent('#lgBtn')).trim(), 'Iniciar expediente');
    assert.deepStrictEqual(erros, []);
  } finally { await browser.close(); }
});
