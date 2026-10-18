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
  // o jogo seleciona a lacuna logo depois do clique (setTimeout 0): espera isso antes de digitar
  // passo de lacuna: o autocompletar fica desligado (playtest de 18/10: "Ve" + Tab virava "veiculos")
  assert.strictEqual(await page.evaluate(() => autocompletarLigado()), false);
  const preencher = async s => { await page.click('#sqlEd');
    await page.waitForFunction(() => { const t = document.querySelector('#sqlEd'); return !/___/.test(t.value) || t.value.slice(t.selectionStart, t.selectionEnd) === '___'; });
    await page.keyboard.type(s); };
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
    // o jogo seleciona a lacuna logo depois do clique (setTimeout 0); espera isso antes de digitar, como uma pessoa faria
    const lacunaSelecionada = () => page.waitForFunction(() => { const t = document.querySelector('#sqlEd'); return t.value.slice(t.selectionStart, t.selectionEnd) === '___'; });
    await page.click('#guide');
    await page.click('#sqlEd'); await lacunaSelecionada(); await page.keyboard.type('18:00:00');
    await page.click('#guide');
    await page.click('#sqlEd'); await lacunaSelecionada(); await page.keyboard.type('20:00:00');
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
    assert.match(await page.textContent('.overlay'), /Termos de uso.*jogo de simulação.*ensinar SQL.*obra de ficção.*não tem nenhuma relação com a polícia.*nunca é enviado/s);
    const completo = await page.textContent('.overlay .termo');
    for (const re of [/Sem relação com a polícia/, /Obra de ficção/, /Coleta de dados de uso \(opcional\)/, /Lei 13\.709/, /equipe@exemplo\.com/]) assert.match(completo, re);
    assert.doesNotMatch(completo, /supabase/i, 'o termo não cita o fornecedor do banco');
    await page.click('.overlay button:has-text("sem enviar dados")');
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
    await page.click('.overlay button:has-text("Aceito os termos e envio")');
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

// PolíciaZap · lidas e não lidas (playtest da Mayumi: com a janela aberta, não sabia o que já tinha lido).
test('PolíciaZap · divisória de mensagens novas, destaque e não lidas', { skip: !CHROME && 'Chrome não encontrado (defina CHROME)', timeout: 60000 }, async () => {
  const { browser, page, erros } = await abrir('index.html', 1366);
  try {
    await page.click('#lgBtn');
    await page.evaluate(() => { S.treino = null; S.treinosFeitos = ['m1']; S.apps = ['db', 'ocorr', 'zap']; Object.keys(WINS).forEach(k => WINS[k].el.remove()); for (const k in WINS) delete WINS[k];
      for (let i = 1; i <= 12; i++) say('celia', 'Mensagem antiga ' + i); S.lidas.celia = 12; S.unread.celia = 0; openZap(); });
    assert.strictEqual(await page.$$eval('.novas', e => e.length), 0, 'sem novas, sem divisória');
    // com a janela aberta e na frente, chegam duas: divisória antes da primeira, as duas destacadas, nada de bolinha
    await page.evaluate(() => { say('celia', 'Primeira nova'); say('celia', 'Segunda nova'); });
    assert.match(await page.textContent('.novas'), /2 mensagens novas/);
    assert.deepStrictEqual(await page.$$eval('.msg.nova', e => e.map(x => x.textContent.replace(/\d\d:\d\d$/, ''))), ['CéliaPrimeira nova', 'CéliaSegunda nova']);
    assert.strictEqual(await page.evaluate(() => S.unread.celia), 0);
    assert.match(await page.textContent('.msg.nova'), /\d\d:\d\d/, 'cada mensagem tem a hora do jogo');
    // lendo mensagens antigas (rolou para cima): chega outra, a tela não pula e aparece o botão
    await page.evaluate(() => { document.querySelector('.msgs').scrollTop = 0; });
    await page.evaluate(() => say('celia', 'Terceira nova'));
    await page.waitForTimeout(50);
    assert.ok(await page.isVisible('.pular'), 'botão "Nova mensagem" aparece');
    assert.strictEqual(await page.evaluate(() => document.querySelector('.msgs').scrollTop), 0, 'não pulou para o fim');
    await page.click('.pular');
    assert.ok(!(await page.isVisible('.pular')));
    // outra janela na frente: a mensagem não conta como lida
    await page.evaluate(() => { openDb(); say('celia', 'Chegou com o terminal na frente'); });
    assert.strictEqual(await page.evaluate(() => S.unread.celia), 1);
    assert.ok(await page.isVisible('.contact .badge'));
    await page.click('.win:has(.zap) .wtb');   // traz o PolíciaZap para frente: vira lida
    await page.waitForFunction(() => S.unread.celia === 0);
    // responder ou trocar de conversa limpa a divisória
    await page.evaluate(() => { chatSel = 'celia'; delete divisoria.celia; say('beto', 'oi'); });
    await page.click('.contact:has-text("Beto")'); await page.click('.contact:has-text("Célia")');
    assert.strictEqual(await page.$$eval('.novas', e => e.length), 0);
    assert.deepStrictEqual(erros, []);
  } finally { await browser.close(); }
});

// Módulo 3 inteiro, como o jogador vive: encerra a terça, bate o ponto, lê o e-mail, treina, resolve os BOs 1004 e 1005,
// faz o pedido opcional do Jairo pelo chat, passa na prova e vira Inspetor Analítico.
test('Módulo 3 · quarta-feira completa', { skip: !CHROME && 'Chrome não encontrado (defina CHROME)', timeout: 240000 }, async () => {
  const { chromium } = require('playwright-core');
  const browser = await chromium.launch({ executablePath: CHROME, headless: true });
  try {
    const page = await browser.newPage({ viewport: { width: 1366, height: 800 } });
    const erros = []; page.on('pageerror', e => erros.push(e.message));
    await page.route('**/*', r => { const u = r.request().url(); if (u.includes('sql-asm.js')) return r.fulfill({ body: fs.readFileSync(ASM), contentType: 'application/javascript' }); return u.startsWith('file:') ? r.continue() : r.abort(); });
    const fimDeTerca = { chat: { celia: [], beto: [], jairo: [], marina: [] }, unread: { celia: 0, beto: 0, jairo: 0, marina: 0 }, lidas: {},
      tut: 0, treino: null, treinosFeitos: ['m1', 'm2-filtros', 'm2-intervalos'], rank: 2, done: true, dia: 0, diaIniciado: 0, diaConcluido: 0,
      closed: ['1001', '1002', '1003'], caseSel: 2, apps: ['db', 'ocorr', 'zap', 'files', 'prova'], beto: 'done', metas: 90 };
    await page.addInitScript(s => { window.SISP_CONFIG_TESTE = { url: '', chave: '', contato: '' }; window.SISP_IDIOMA_TESTE = 'pt-BR';
      if (!sessionStorage.getItem('ok')) { localStorage.setItem('sisp-proto-v2', s); sessionStorage.setItem('ok', '1'); } }, JSON.stringify(fimDeTerca));
    const entrar = async () => { await page.waitForFunction(() => !document.querySelector('#lgBtn').disabled); await page.click('#lgBtn'); };
    await page.goto('file://' + path.join(RAIZ, 'index.html'));
    await entrar();
    assert.strictEqual(await page.evaluate(() => tabelaBloqueada('SELECT * FROM transferencias') !== null), true, 'na terça, as contas ainda são restritas');

    // fim da terça → quarta-feira
    await page.evaluate(() => report());
    await page.click('#rpDia');
    assert.match(await page.textContent('.dia-card'), /quarta-feira, 14\/10\/2026/);
    await Promise.all([page.waitForNavigation(), page.click('#diaOk')]);
    await page.waitForFunction(() => !document.querySelector('#lgBtn').disabled);
    assert.match(await page.textContent('#bootStatus'), /Expediente de quarta-feira/);
    await page.click('#lgBtn');
    assert.match(await page.textContent('.email'), /Operação Véio.*acesso provisório/s);
    assert.match(await page.textContent('#clock'), /qua 14\/10/);
    assert.strictEqual(await page.evaluate(() => tutActive()), false, 'o treinamento espera o e-mail');
    await page.click('#emOk');

    const rodar = async q => { await page.evaluate(q => { openDb(q); }, q); await page.click('#runBtn'); };
    const C = await page.evaluate(() => ({ F: { contaDenise: F.contaDenise, cpfDenise: F.cpfDenise, contasLaranja: F.contasLaranja, cpfsLaranja: F.cpfsLaranja, somaEspecie: F.somaEspecie } }));
    const D13 = "data_hora BETWEEN '2026-10-13 00:00:00' AND '2026-10-13 23:59:59'", FX = 'valor BETWEEN 9000 AND 9999.99', lar = C.F.contasLaranja.join(',');

    assert.strictEqual(await jogarTreino(page), 'm3-agregacao');
    assert.strictEqual(await page.evaluate(() => CASES[S.caseSel].id), '1004');
    for (const q of [`SELECT SUM(valor) FROM transferencias WHERE ${D13};`, `SELECT COUNT(*) FROM transferencias WHERE ${D13} AND ${FX};`,
      `SELECT conta_destino, COUNT(*) FROM transferencias WHERE ${D13} AND ${FX} GROUP BY conta_destino;`,
      `SELECT conta_destino, COUNT(*) FROM transferencias WHERE ${D13} AND ${FX} GROUP BY conta_destino HAVING COUNT(*) >= 5;`,
      `SELECT nome FROM pessoas WHERE cpf = '${C.F.cpfDenise}';`, `SELECT * FROM veiculos WHERE cpf_proprietario = '${C.F.cpfDenise}';`]) await rodar(q);
    assert.strictEqual(await page.evaluate(() => S.steps['1004'].length), 6);
    // a virada chega no momento da descoberta: Célia lembra do Virtus, Jairo confirma a vítima
    await page.waitForFunction(() => S.chat.jairo.some(m => /Transportadora Central/.test(m.text)), null, { timeout: 15000 });
    await page.evaluate(() => openOcorr());
    await entregar(page, { f_1004_conta: String(C.F.contaDenise), f_1004_titular: 'Denise Albuquerque Prado' });

    assert.strictEqual(await jogarTreino(page), 'm3-nulos');
    await page.waitForFunction(() => S.chat.marina.some(m => /data em que cada conta foi aberta/.test(m.text)), null, { timeout: 15000 });
    for (const q of [`SELECT DISTINCT conta_origem FROM transferencias WHERE conta_destino = ${C.F.contaDenise};`, `SELECT * FROM transferencias WHERE conta_destino IN (${lar});`,
      'SELECT COUNT(*) FROM transferencias WHERE conta_origem = NULL;',   // tropeço clássico: o jogo explica
      'SELECT COUNT(*) FROM transferencias WHERE conta_origem IS NULL;', 'SELECT SUM(valor) FROM transferencias WHERE conta_origem IS NULL;',
      `SELECT nome FROM pessoas WHERE cpf IN ('${C.F.cpfsLaranja.join("','")}');`, `SELECT MIN(aberta_em), MAX(aberta_em) FROM contas_bancarias WHERE id IN (${lar});`]) {
      await rodar(q);
      if (/= NULL/.test(q)) assert.match(await page.textContent('#dbMsg'), /IS NULL/);
    }
    assert.strictEqual(await page.evaluate(() => S.steps['1005'].length), 6);

    // pedido opcional do Jairo, respondido pelo PolíciaZap
    await page.waitForFunction(() => S.pedidos['jairo-radares'] && S.chat.jairo.some(m => /local de radar/.test(m.text)), null, { timeout: 15000 });
    const resp = await page.evaluate(() => { const t = linhasDe('SELECT local_radar, COUNT(*) AS n FROM leituras_radar GROUP BY local_radar ORDER BY n DESC LIMIT 1')[0]; return t.local_radar + ', ' + t.n; });
    await page.evaluate(() => { chatSel = 'jairo'; openZap(); });
    await page.fill('.reply input', resp); await page.click('.reply button');
    await page.waitForFunction(() => S.pedidos['jairo-radares'].estado === 'feito');

    await page.evaluate(() => openOcorr());
    await entregar(page, { f_1005_n: '8', f_1005_total: C.F.somaEspecie.toFixed(2) });
    await page.waitForFunction(() => provaMod() === 3);
    await prova(page);
    await page.waitForSelector('.report', { timeout: 5000 });
    const fim = await page.evaluate(() => ({ rank: S.rank, closed: S.closed, feitos: S.treinosFeitos, dia: S.dia, concl: S.diaConcluido, contas: tabelaBloqueada('SELECT * FROM transferencias') === null }));
    assert.deepStrictEqual(fim, { rank: 3, closed: ['1001', '1002', '1003', '1004', '1005'], feitos: ['m1', 'm2-filtros', 'm2-intervalos', 'm3-agregacao', 'm3-nulos'], dia: 1, concl: 1, contas: true });
    assert.match(await page.textContent('.report'), /Inspetor Analítico/);
    assert.ok(await page.$('#rpDia'), 'a quinta-feira existe: o relatório oferece encerrar o expediente');
    await page.waitForFunction(() => /uma vez só/.test(S.chat.celia[S.chat.celia.length - 1].text), null, { timeout: 15000 });
    assert.deepStrictEqual(erros, []);
  } finally { await browser.close(); }
});

// Caderno do Investigador: fixar linha da grade, colar valor no editor, anotar, sobreviver à recarga.
test('Caderno · fixar, colar no editor, anotar e manter depois de recarregar', { skip: !CHROME && 'Chrome não encontrado (defina CHROME)', timeout: 90000 }, async () => {
  const { chromium } = require('playwright-core');
  const browser = await chromium.launch({ executablePath: CHROME, headless: true });
  try {
    const page = await browser.newPage({ viewport: { width: 1366, height: 800 } });
    const erros = []; page.on('pageerror', e => erros.push(e.message));
    await page.route('**/*', r => { const u = r.request().url(); if (u.includes('sql-asm.js')) return r.fulfill({ body: fs.readFileSync(ASM), contentType: 'application/javascript' }); return u.startsWith('file:') ? r.continue() : r.abort(); });
    // save de antes do Caderno, já na quarta-feira (BO 1004 em andamento)
    const quarta = { chat: { celia: [], beto: [], jairo: [], marina: [] }, unread: {}, lidas: {}, tut: 0, treino: null, treinosFeitos: ['m1', 'm2-filtros', 'm2-intervalos', 'm3-agregacao'],
      rank: 2, done: true, dia: 1, diaIniciado: 1, diaConcluido: 0, closed: ['1001', '1002', '1003'], caseSel: 3, apps: ['db', 'ocorr', 'zap', 'files', 'prova'], beto: 'done' };
    await page.addInitScript(s => { window.SISP_CONFIG_TESTE = { url: '', chave: '', contato: '' }; window.SISP_IDIOMA_TESTE = 'pt-BR';
      if (!sessionStorage.getItem('ok')) { localStorage.setItem('sisp-proto-v2', s); sessionStorage.setItem('ok', '1'); } }, JSON.stringify(quarta));
    await page.goto('file://' + path.join(RAIZ, 'index.html'));
    await page.waitForFunction(() => !document.querySelector('#lgBtn').disabled);
    await page.click('#lgBtn');
    assert.ok(await page.isVisible('#ic-caderno'), 'save antigo ganha o Caderno');

    // fixa a linha da conta suspeita e o CPF da titular
    await page.evaluate(() => { openDb('SELECT id, cpf_titular FROM contas_bancarias WHERE id = ' + F.contaDenise + ';'); });
    await page.click('#runBtn');
    await page.click('#dbGrid .pin');
    assert.match(await page.textContent('#toasts'), /Fixado no Caderno.*BO 1004/s);
    await page.evaluate(() => openCaderno());
    assert.match(await page.textContent('.cad-titulo'), /BO 1004/);
    assert.strictEqual(await page.$$eval('.cad-fix', e => e.length), 1);
    // clicar no CPF fixado cola no editor, com aspas
    await page.evaluate(() => { const ta = document.querySelector('#sqlEd'); ta.value = 'SELECT nome FROM pessoas WHERE cpf = '; ta.selectionStart = ta.selectionEnd = ta.value.length; });
    const cpf = await page.evaluate(() => F.cpfDenise);
    await page.click(`.cad-valor:has-text("${cpf}")`);
    assert.strictEqual(await page.inputValue('#sqlEd'), `SELECT nome FROM pessoas WHERE cpf = '${cpf}'`);
    await page.click('#runBtn');
    assert.match(await page.textContent('#dbGrid'), /Denise Albuquerque Prado/);
    // anotação livre
    await page.evaluate(() => openCaderno());
    await page.fill('.cad-texto', 'Conta da Denise recebeu 14 depósitos fracionados.');
    // tudo continua lá depois de recarregar
    await page.reload();
    await page.waitForFunction(() => !document.querySelector('#lgBtn').disabled);
    await page.click('#lgBtn');
    await page.evaluate(() => openCaderno('1004'));
    assert.strictEqual(await page.inputValue('.cad-texto'), 'Conta da Denise recebeu 14 depósitos fracionados.');
    assert.strictEqual(await page.$$eval('.cad-fix', e => e.length), 1);
    // casos futuros não aparecem como página (não revela o enredo)
    assert.doesNotMatch(await page.textContent('.cad-pags'), /1005/);
    await page.click('.cad-x');
    assert.strictEqual(await page.$$eval('.cad-fix', e => e.length), 0);
    assert.deepStrictEqual(erros, []);
  } finally { await browser.close(); }
});

// Vozes: desligadas por padrão; 🔊 toca a fala; ligadas, as falas novas tocam sozinhas, em fila. Sem áudio, nada é pedido.
test('vozes · botão ouvir, ligar nas Configurações e tocar só o que existe', { skip: !CHROME && 'Chrome não encontrado (defina CHROME)', timeout: 60000 }, async () => {
  const { browser, page, erros } = await abrir('index.html', 1366);
  try {
    await page.evaluate(() => {   // alto-falante falso: registra o que seria tocado
      window.__tocados = [];
      window.Audio = function (src) { window.__tocados.push(src); this.play = () => Promise.resolve(); setTimeout(() => this.onended && this.onended(), 5); };
    });
    await page.click('#lgBtn');
    // grava (de mentira) a primeira fala da Célia e uma mensagem de chat
    await page.evaluate(() => { registrarVozes('pt-BR', [idFala('celia', fill(tutStep().text)), idFala('celia', 'Chegou a voz.')]); renderGuide(); buildStart(); });
    assert.ok(await page.isVisible('.gbub .ouvir'), '🔊 aparece na fala que tem áudio');
    assert.deepStrictEqual(await page.evaluate(() => __tocados), [], 'desligado por padrão: não toca sozinho');
    await page.click('.gbub .ouvir');
    await page.waitForFunction(() => __tocados.length === 1);
    assert.match(await page.evaluate(() => __tocados[0]), /^audio\/pt-BR\/celia-[0-9a-f]{8}\.mp3$/);
    // liga em Configurações › Vozes
    await page.click('#startBtn'); await page.click('#startMenu .sm-abre');
    await page.click('#startMenu .sm-fly button:has-text("Vozes")');
    await page.click('.overlay button:has-text("Ligar as vozes")');
    assert.strictEqual(await page.evaluate(() => VOZ_PREF.ligado), true);
    await page.evaluate(() => { say('celia', 'Chegou a voz.'); say('celia', 'Esta não foi gravada.'); });
    await page.waitForFunction(() => __tocados.length === 2);
    await page.waitForTimeout(100);
    assert.strictEqual(await page.evaluate(() => __tocados.length), 2, 'fala sem áudio não pede arquivo nenhum');
    assert.deepStrictEqual(erros, []);
  } finally { await browser.close(); }
});

// Serviços do Beto: pedir, esperar, errar (dica), acertar (Metas), desistir (o Beto mostra a consulta), Caderno › Treino.
test('serviços do Beto · "Tem serviço?" do pedido ao domínio', { skip: !CHROME && 'Chrome não encontrado (defina CHROME)', timeout: 90000 }, async () => {
  const { chromium } = require('playwright-core');
  const browser = await chromium.launch({ executablePath: CHROME, headless: true });
  try {
    const page = await browser.newPage({ viewport: { width: 1366, height: 800 } });
    const erros = []; page.on('pageerror', e => erros.push(e.message));
    await page.route('**/*', r => { const u = r.request().url(); if (u.includes('sql-asm.js')) return r.fulfill({ body: fs.readFileSync(ASM), contentType: 'application/javascript' }); return u.startsWith('file:') ? r.continue() : r.abort(); });
    // terça, depois do BO 1002 e do dilema do Beto: Módulos 1 e 2 aprendidos
    const terca = { chat: { celia: [], beto: [{ me: false, text: 'Valeu mesmo assim.' }], jairo: [], marina: [] }, unread: {}, lidas: {}, tut: 0, treino: null,
      treinosFeitos: ['m1', 'm2-filtros', 'm2-intervalos'], rank: 1, done: true, dia: 0, diaIniciado: 0, closed: ['1001', '1002'], caseSel: 2, apps: ['db', 'ocorr', 'zap', 'files', 'caderno'], beto: 'done', metas: 0 };
    await page.addInitScript(s => { window.SISP_CONFIG_TESTE = { url: '', chave: '', contato: '' }; window.SISP_IDIOMA_TESTE = 'pt-BR';
      if (!sessionStorage.getItem('ok')) { localStorage.setItem('sisp-proto-v2', s); sessionStorage.setItem('ok', '1'); } }, JSON.stringify(terca));
    await page.goto('file://' + path.join(RAIZ, 'index.html'));
    await page.waitForFunction(() => !document.querySelector('#lgBtn').disabled);
    await page.click('#lgBtn');
    // o Beto conta que tem serviço (uma vez só)
    await page.waitForFunction(() => S.chat.beto.some(m => /me pede serviço/.test(m.text)));
    await page.evaluate(() => { SERV_ESPERA = [0, 0]; chatSel = 'beto'; openZap(); });
    const resposta = () => page.evaluate(() => { const a = S.servicos.aberto, s = servicoDe(a.id), r = respostaServico(s, a.p); return typeof r === 'number' ? String(Math.round(r * 100) / 100).replace('.', ',') : String(r); });
    const pedir = async () => {
      await page.click('.reply .servico-pedir');
      assert.match(await page.textContent('.reply'), /separando o serviço/);
      await page.waitForSelector('.reply input', { timeout: 5000 });
      assert.ok(await page.evaluate(() => S.servicos.aberto.id && SERVICOS.find(s => s.id === S.servicos.aberto.id).conceitos.length === 1), 'antes de dominar, nada de mistura');
    };
    const enviar = async v => { const n = await page.evaluate(() => S.chat.beto.length); await page.fill('.reply input', v); await page.press('.reply input', 'Enter'); await page.waitForFunction(k => S.chat.beto.length >= k + 2, n); };

    // 1º: erra, recebe dica, acerta → Metas, mas não conta como "de primeira"
    await pedir();
    await enviar('xyz 99999');
    assert.match(await page.evaluate(() => S.chat.beto.at(-1).text), /não bate/);
    await enviar(await resposta());
    assert.strictEqual(await page.evaluate(() => S.metas), 5);
    assert.ok(await page.evaluate(() => { const v = Object.values(S.servicos.conceitos).filter(e => e.visto >= 0); return v.length >= 1 && v.every(e => e.seguidos === 0 && e.erros === 1 && e.acertos === 0); }), 'acertou depois de errar: não conta como de primeira');
    // 2º: desiste → o Beto mostra a consulta e a resposta
    await pedir();
    await page.click('.reply button:has-text("Deixa pra lá")');
    await page.waitForFunction(() => /Fiz assim: <code>SELECT/.test(S.chat.beto.at(-1).text));
    // depois do 3º do turno, treina sem ganhar Metas
    await page.evaluate(() => { S.servicos.noTurno = 3; });
    await pedir();
    assert.match(await page.evaluate(() => S.chat.beto.at(-2).text), /fome|De novo/);
    await enviar(await resposta());
    assert.strictEqual(await page.evaluate(() => S.metas), 5, 'sem Metas depois do 3º do turno');
    // recarregar no meio da espera: o serviço chega mesmo assim
    await page.evaluate(() => { SERV_ESPERA = [3, 3]; });
    await page.click('.reply .servico-pedir');
    await page.reload();
    await page.waitForFunction(() => !document.querySelector('#lgBtn').disabled);
    await page.click('#lgBtn');
    await page.waitForFunction(() => S.servicos.aberto && S.servicos.aberto.entregue, null, { timeout: 8000 });
    // Caderno › Treino mostra a situação de cada conceito aprendido (e nenhum do Módulo 3)
    await page.evaluate(() => openCaderno('treino'));
    const t = await page.textContent('.cad-treino');
    assert.match(t, /WHERE com texto/); assert.match(t, /Ainda não treinou|Praticando/);
    assert.doesNotMatch(t, /GROUP BY/);
    assert.match(await page.textContent('.cad-pags'), /Treino com o Beto/);
    assert.deepStrictEqual(erros, []);
  } finally { await browser.close(); }
});

// Playtest de 17/10 (jogadora experiente): Ctrl+Z, formulário que se apagava, prova pendente sem aviso,
// dicionário todo aberto, colar valor do resultado, botão Organizar e a nota id × número das contas.
test('playtest 17/10 · editor, formulário, prova pendente, dicionário e resultado', { skip: !CHROME && 'Chrome não encontrado (defina CHROME)', timeout: 90000 }, async () => {
  const { chromium } = require('playwright-core');
  const browser = await chromium.launch({ executablePath: CHROME, headless: true });
  try {
    const page = await browser.newPage({ viewport: { width: 1366, height: 800 } });
    const erros = []; page.on('pageerror', e => erros.push(e.message));
    await page.route('**/*', r => { const u = r.request().url(); if (u.includes('sql-asm.js')) return r.fulfill({ body: fs.readFileSync(ASM), contentType: 'application/javascript' }); return u.startsWith('file:') ? r.continue() : r.abort(); });
    // quarta-feira, BO 1004 em andamento
    const quarta = { chat: { celia: [], beto: [], jairo: [], marina: [] }, unread: {}, lidas: {}, tut: 0, treino: null, treinosFeitos: ['m1', 'm2-filtros', 'm2-intervalos', 'm3-agregacao'],
      rank: 2, done: true, dia: 1, diaIniciado: 1, diaConcluido: 0, closed: ['1001', '1002', '1003'], caseSel: 3, apps: ['db', 'ocorr', 'zap', 'files', 'prova', 'caderno'], beto: 'done' };
    await page.addInitScript(s => { window.SISP_CONFIG_TESTE = { url: '', chave: '', contato: '' }; window.SISP_IDIOMA_TESTE = 'pt-BR';
      if (!sessionStorage.getItem('ok')) { localStorage.setItem('sisp-proto-v2', s); sessionStorage.setItem('ok', '1'); } }, JSON.stringify(quarta));
    await page.goto('file://' + path.join(RAIZ, 'index.html'));
    await page.waitForFunction(() => !document.querySelector('#lgBtn').disabled);
    await page.click('#lgBtn');

    // formulário do desfecho sobrevive às consultas
    await page.evaluate(() => openOcorr());
    await page.fill('form.final input[name="titular"]', 'Fulana de Tal');
    await page.evaluate(() => openDb('SELECT * FROM veiculos;'));
    await page.click('#runBtn');
    assert.strictEqual(await page.inputValue('form.final input[name="titular"]'), 'Fulana de Tal', 'o que foi digitado no BO não some');

    // dicionário: tabelas fechadas, dica no topo, nota id × número nas contas
    assert.match(await page.textContent('#dict .dict-dica'), /Clique num nome para inserir/);
    assert.strictEqual(await page.$$eval('#dict details[open]', e => e.length), 0, 'tabelas fechadas por padrão');
    await page.click('#dict summary:has-text("contas_bancarias")');
    assert.match(await page.textContent('#dict'), /as transferências NÃO usam este/);
    assert.strictEqual(await page.evaluate(() => S.dictAbertas.contas_bancarias), true, 'lembra o que foi aberto');

    // Ctrl+Z desfaz o que entrou pelo dicionário
    await page.evaluate(() => { const ta = document.querySelector('#sqlEd'); ta.focus(); ta.setSelectionRange(ta.value.length, ta.value.length); });
    await page.click('#dict button[title="Inserir numero"]');
    assert.match(await page.inputValue('#sqlEd'), /numero$/);
    await page.focus('#sqlEd'); await page.keyboard.press('Control+z');
    assert.strictEqual(await page.inputValue('#sqlEd'), 'SELECT * FROM veiculos;', 'Ctrl+Z desfez a inserção');

    // clicar num valor do resultado copia (sem aspas), mostra "Copiado" e não mexe no editor
    await page.context().grantPermissions(['clipboard-read', 'clipboard-write']).catch(() => {});
    const antes = await page.inputValue('#sqlEd');
    const placa = await page.textContent('#dbGrid tbody tr:first-child td:nth-child(2)');
    await page.click('#dbGrid tbody tr:first-child td:nth-child(2)');
    await page.waitForSelector('#dbGrid .copiado-tag');
    assert.match(await page.textContent('#dbGrid .copiado-tag'), /Copiado/);
    assert.strictEqual(await page.evaluate(() => navigator.clipboard.readText()), placa);
    assert.strictEqual(await page.inputValue('#sqlEd'), antes, 'o editor não muda');
    // navegador recusou o jeito moderno (arquivo aberto do disco): o jeito antigo copia mesmo assim
    await page.evaluate(() => { navigator.clipboard.writeText = () => Promise.reject(new Error('negado')); });
    const cor = await page.textContent('#dbGrid tbody tr:nth-child(2) td:nth-child(4)');
    await page.click('#dbGrid tbody tr:nth-child(2) td:nth-child(4)');
    await page.waitForSelector('#dbGrid tbody tr:nth-child(2) .copiado-tag');
    assert.match(await page.textContent('#dbGrid tbody tr:nth-child(2) .copiado-tag'), /Copiado/);
    await page.waitForFunction(c => navigator.clipboard.readText().then(t => t === c), cor, { timeout: 3000 });

    // Organizar: uma parte por linha
    await page.evaluate(() => { const ta = document.querySelector('#sqlEd'); ta.value = "select cor, count(*) as total from veiculos where ano >= 2018 group by cor"; S.editor = ta.value; });
    await page.click('#orgBtn');
    assert.strictEqual(await page.inputValue('#sqlEd'), 'SELECT cor, COUNT(*) AS total\nFROM veiculos\nWHERE ano >= 2018\nGROUP BY cor;');

    // autocompletar: Tab completa o nome da tabela, e o Ctrl+Z continua funcionando
    await page.evaluate(() => { const ta = document.querySelector('#sqlEd'); ta.value = ''; S.editor = ''; ta.focus(); });
    await page.keyboard.type('SELECT * FROM ve');
    assert.match(await page.textContent('#sugest'), /veiculos/);
    await page.keyboard.press('Tab');
    assert.strictEqual(await page.inputValue('#sqlEd'), 'SELECT * FROM veiculos');
    assert.ok(await page.isHidden('#sugest'));

    // prova pendente: aviso fixo em Ocorrências e "!" no ícone da ACADEPOL
    await page.evaluate(() => { S.closed.push('1004', '1005'); S.caseSel = 4; save(); renderIcons(); renderOcorr(); });
    assert.match(await page.textContent('.oc-proximo'), /prova do Módulo 3/);
    assert.ok(await page.isVisible('#ic-prova .badge'));
    assert.deepStrictEqual(erros, []);
  } finally { await browser.close(); }
});

// Telas grandes ou pequenas: a tradução da consulta e a mensagem de erro nunca são espremidas até sumir.
test('DB-Investigator · tradução e erro aparecem inteiros', { skip: !CHROME && 'Chrome não encontrado (defina CHROME)', timeout: 60000 }, async () => {
  const { browser, page, erros } = await abrir('index.html', 1366);
  try {
    await page.click('#lgBtn');
    await page.evaluate(() => { S.treino = null; openDb("select cor, count(*) from veiculos where count(*) > 3 group by cor"); });
    await page.click('#runBtn'); await page.click('#explBtn');
    const [expl, msg] = await page.evaluate(() => [document.querySelector('#dbExpl').offsetHeight, document.querySelector('#dbMsg').offsetHeight]);
    assert.ok(expl > 150, 'tradução com altura de verdade: ' + expl);
    assert.ok(msg > 40, 'mensagem de erro visível: ' + msg);
    assert.ok(await page.evaluate(() => document.querySelector('#dbMsg').getBoundingClientRect().top < document.querySelector('#dbExpl').getBoundingClientRect().top), 'erro antes da tradução');
    assert.deepStrictEqual(erros, []);
  } finally { await browser.close(); }
});

// Guia SQL: aparece depois do primeiro treinamento, mostra só o que foi ensinado, busca e leva o exemplo ao editor.
test('Guia SQL · aparece com o que foi aprendido, busca e exemplo no editor', { skip: !CHROME && 'Chrome não encontrado (defina CHROME)', timeout: 60000 }, async () => {
  const { chromium } = require('playwright-core');
  const browser = await chromium.launch({ executablePath: CHROME, headless: true });
  try {
    const page = await browser.newPage({ viewport: { width: 1366, height: 800 } });
    const erros = []; page.on('pageerror', e => erros.push(e.message));
    await page.route('**/*', r => { const u = r.request().url(); if (u.includes('sql-asm.js')) return r.fulfill({ body: fs.readFileSync(ASM), contentType: 'application/javascript' }); return u.startsWith('file:') ? r.continue() : r.abort(); });
    const terca = { chat: { celia: [], beto: [], jairo: [], marina: [] }, unread: {}, lidas: {}, tut: 0, treino: null, treinosFeitos: ['m1', 'm2-filtros'],
      rank: 1, done: true, dia: 0, diaIniciado: 0, closed: ['1001'], caseSel: 1, apps: ['db', 'ocorr', 'zap', 'files', 'caderno'], beto: 'none' };
    await page.addInitScript(s => { window.SISP_CONFIG_TESTE = { url: '', chave: '', contato: '' }; window.SISP_IDIOMA_TESTE = 'pt-BR';
      if (!sessionStorage.getItem('ok')) { localStorage.setItem('sisp-proto-v2', s); sessionStorage.setItem('ok', '1'); } }, JSON.stringify(terca));
    await page.goto('file://' + path.join(RAIZ, 'index.html'));
    await page.waitForFunction(() => !document.querySelector('#lgBtn').disabled);
    await page.click('#lgBtn');
    assert.ok(await page.isVisible('#ic-guia'), 'ícone do Guia na área de trabalho');
    await page.evaluate(() => openGuia());
    const lista = await page.textContent('.guia-lista');
    assert.match(lista, /LIKE/); assert.doesNotMatch(lista, /GROUP BY|BETWEEN|HAVING/, 'nada do que ainda não foi ensinado');
    await page.fill('.guia-busca', 'pedaço');
    assert.match(await page.textContent('.guia-titulo'), /LIKE/);
    assert.ok(await page.evaluate(() => document.activeElement.classList.contains('guia-busca')), 'a busca continua com o cursor');
    const sql = await page.textContent('.guia-ex pre');
    await page.click('.guia-ex .tb-btn.run');
    assert.strictEqual(await page.inputValue('#sqlEd'), sql);
    await page.click('#runBtn');
    assert.match(await page.textContent('#dbStatus'), /linha/);
    assert.deepStrictEqual(erros, []);
  } finally { await browser.close(); }
});

// Módulo 4 (parte técnica): tabelas novas só na quinta; mapa, Explique com JOIN, aviso de JOIN sem ON, autocompletar com apelido.
test('Módulo 4 · tabelas novas, mapa e ferramentas de JOIN', { skip: !CHROME && 'Chrome não encontrado (defina CHROME)', timeout: 90000 }, async () => {
  const { chromium } = require('playwright-core');
  const browser = await chromium.launch({ executablePath: CHROME, headless: true });
  try {
    const abrirDia = async dia => {
      const page = await browser.newPage({ viewport: { width: 1366, height: 800 } });
      const erros = []; page.on('pageerror', e => erros.push(e.message));
      await page.route('**/*', r => { const u = r.request().url(); if (u.includes('sql-asm.js')) return r.fulfill({ body: fs.readFileSync(ASM), contentType: 'application/javascript' }); return u.startsWith('file:') ? r.continue() : r.abort(); });
      const st = { chat: { celia: [], beto: [], jairo: [], marina: [] }, unread: {}, lidas: {}, tut: 0, treino: null, treinosFeitos: ['m1', 'm2-filtros', 'm2-intervalos', 'm3-agregacao', 'm3-nulos'].concat(dia >= 2 ? ['m4-join', 'm4-left'] : []),
        rank: 3, done: true, dia, diaIniciado: dia, diaConcluido: dia - 1, closed: ['1001', '1002', '1003', '1004', '1005'], caseSel: 4, apps: ['db', 'ocorr', 'zap', 'files', 'prova', 'caderno'], beto: 'done' };
      await page.addInitScript(s => { window.SISP_CONFIG_TESTE = { url: '', chave: '', contato: '' }; window.SISP_IDIOMA_TESTE = 'pt-BR'; localStorage.setItem('sisp-proto-v2', s); }, JSON.stringify(st));
      await page.goto('file://' + path.join(RAIZ, 'index.html'));
      await page.waitForFunction(() => !document.querySelector('#lgBtn').disabled);
      await page.click('#lgBtn');
      return { page, erros };
    };
    // quarta-feira: nada do Módulo 4 aparece
    let { page, erros } = await abrirDia(1);
    await page.evaluate(() => openDb('SELECT * FROM empresas;'));
    await page.click('#runBtn');
    assert.match(await page.textContent('#dbMsg'), /Agente Especial/, 'tabela bloqueada até a patente/quinta');
    await page.click('.dict-mapa');
    assert.doesNotMatch(await page.textContent('.mapa'), /empresas|imoveis|notas_fiscais/);
    assert.deepStrictEqual(erros, []);
    await page.close();

    // quinta-feira: tabelas liberadas, mapa com as ligações novas
    ({ page, erros } = await abrirDia(2));
    await page.evaluate(() => openDb());
    await page.click('.dict-mapa');
    const mapa = await page.textContent('.mapa');
    for (const t of ['empresas', 'imoveis', 'notas_fiscais', 'itens_nota', 'cnpj_locatario']) assert.match(mapa, new RegExp(t));
    assert.ok(await page.$$eval('.mapa-liga', l => l.length) >= 9, 'uma seta por ligação');
    // Explique entende JOIN; JOIN sem ON avisa
    await page.evaluate(() => { const ta = document.querySelector('#sqlEd'); ta.value = 'SELECT v.placa, p.nome FROM veiculos v JOIN pessoas p ON p.cpf = v.cpf_proprietario;'; S.editor = ta.value; focusWin('db'); });
    await page.click('#explBtn');
    assert.match(await page.textContent('#dbExpl'), /juntando cada linha com a linha da tabela pessoas/);
    await page.evaluate(() => { const ta = document.querySelector('#sqlEd'); ta.value = 'SELECT * FROM veiculos v JOIN pessoas p;'; S.editor = ta.value; });
    await page.click('#runBtn');
    assert.match(await page.textContent('#dbMsg'), /não tem <code>ON|não tem ON/);
    // autocompletar com apelido
    await page.evaluate(() => { const ta = document.querySelector('#sqlEd'); ta.value = ' FROM imoveis i'; S.editor = ta.value; ta.focus(); ta.setSelectionRange(0, 0); });
    await page.keyboard.type('SELECT i.cn');
    assert.match(await page.textContent('#sugest'), /cnpj_locatario/);
    await page.keyboard.press('Tab');
    assert.strictEqual(await page.inputValue('#sqlEd'), 'SELECT i.cnpj_locatario FROM imoveis i');
    assert.deepStrictEqual(erros, []);
  } finally { await browser.close(); }
});

// Quem deixou o pedido do Beto sem resposta ganha os serviços no dia seguinte (antes ficava sem nunca).
test('serviços do Beto · liberam no dia seguinte para quem ignorou o pedido do ponto', { skip: !CHROME && 'Chrome não encontrado (defina CHROME)', timeout: 60000 }, async () => {
  const { chromium } = require('playwright-core');
  const browser = await chromium.launch({ executablePath: CHROME, headless: true });
  try {
    const page = await browser.newPage({ viewport: { width: 1366, height: 800 } });
    const erros = []; page.on('pageerror', e => erros.push(e.message));
    await page.route('**/*', r => { const u = r.request().url(); if (u.includes('sql-asm.js')) return r.fulfill({ body: fs.readFileSync(ASM), contentType: 'application/javascript' }); return u.startsWith('file:') ? r.continue() : r.abort(); });
    const quarta = { chat: { celia: [], beto: [{ me: false, text: 'Irmão, salva minha vida.' }], jairo: [], marina: [] }, unread: {}, lidas: {}, tut: 0, treino: null, treinosFeitos: ['m1', 'm2-filtros', 'm2-intervalos'],
      rank: 2, done: true, dia: 1, diaIniciado: 1, diaConcluido: 0, closed: ['1001', '1002', '1003'], caseSel: 3, apps: ['db', 'ocorr', 'zap', 'files', 'prova', 'caderno'], beto: 'asked' };
    await page.addInitScript(s => { window.SISP_CONFIG_TESTE = { url: '', chave: '', contato: '' }; window.SISP_IDIOMA_TESTE = 'pt-BR'; localStorage.setItem('sisp-proto-v2', s); }, JSON.stringify(quarta));
    await page.goto('file://' + path.join(RAIZ, 'index.html'));
    await page.waitForFunction(() => !document.querySelector('#lgBtn').disabled);
    await page.click('#lgBtn');
    await page.waitForFunction(() => S.beto === 'done' && S.chat.beto.some(m => /me pede serviço/.test(m.text)));
    assert.ok(await page.evaluate(() => S.betoIgnorou && S.chat.beto.some(m => /esquece aquele horário/i.test(m.text))));
    await page.evaluate(() => { chatSel = 'beto'; openZap(); });
    assert.ok(await page.isVisible('.reply .servico-pedir'), '"Tem serviço?" disponível');
    assert.deepStrictEqual(erros, []);
  } finally { await browser.close(); }
});

// Atalhos para o Guia: o erro do HAVING leva ao verbete do HAVING; o Explique lista os comandos da consulta.
test('Guia SQL · atalhos a partir do erro e do Explique', { skip: !CHROME && 'Chrome não encontrado (defina CHROME)', timeout: 60000 }, async () => {
  const { chromium } = require('playwright-core');
  const browser = await chromium.launch({ executablePath: CHROME, headless: true });
  try {
    const page = await browser.newPage({ viewport: { width: 1366, height: 800 } });
    const erros = []; page.on('pageerror', e => erros.push(e.message));
    await page.route('**/*', r => { const u = r.request().url(); if (u.includes('sql-asm.js')) return r.fulfill({ body: fs.readFileSync(ASM), contentType: 'application/javascript' }); return u.startsWith('file:') ? r.continue() : r.abort(); });
    const quarta = { chat: { celia: [], beto: [], jairo: [], marina: [] }, unread: {}, lidas: {}, tut: 0, treino: null, treinosFeitos: ['m1', 'm2-filtros', 'm2-intervalos', 'm3-agregacao'],
      rank: 2, done: true, dia: 1, diaIniciado: 1, diaConcluido: 0, closed: ['1001', '1002', '1003'], caseSel: 3, apps: ['db', 'ocorr', 'zap', 'files', 'prova', 'caderno'], beto: 'done' };
    await page.addInitScript(s => { window.SISP_CONFIG_TESTE = { url: '', chave: '', contato: '' }; window.SISP_IDIOMA_TESTE = 'pt-BR'; localStorage.setItem('sisp-proto-v2', s); }, JSON.stringify(quarta));
    await page.goto('file://' + path.join(RAIZ, 'index.html'));
    await page.waitForFunction(() => !document.querySelector('#lgBtn').disabled);
    await page.click('#lgBtn');
    await page.evaluate(() => openDb('SELECT cor FROM veiculos HAVING COUNT(*) > 3;'));
    await page.click('#runBtn');
    assert.match(await page.textContent('#dbMsg .ver-guia'), /HAVING/);
    await page.click('#dbMsg .ver-guia');
    assert.match(await page.textContent('.guia-titulo'), /HAVING/);
    await page.evaluate(() => { focusWin('db'); const ta = document.querySelector('#sqlEd'); ta.value = "SELECT cor, COUNT(*) FROM veiculos WHERE ano > 2015 GROUP BY cor;"; S.editor = ta.value; });
    await page.click('#explBtn');
    const links = await page.textContent('#dbExpl .guia-links');
    for (const re of [/GROUP BY/, /COUNT/, /WHERE/, /Comparação/]) assert.match(links, re);
    assert.doesNotMatch(links, /NULL|COALESCE/, 'só o que está na consulta (e já foi ensinado)');
    assert.deepStrictEqual(erros, []);
  } finally { await browser.close(); }
});


// Quinta-feira (Módulo 4, Ato III): JOIN até o galpão, a pergunta da Marina, a soma que infla, a prova e o galpão vazio.
test('Módulo 4 · quinta-feira completa', { skip: !CHROME && 'Chrome não encontrado (defina CHROME)', timeout: 240000 }, async () => {
  const { chromium } = require('playwright-core');
  const browser = await chromium.launch({ executablePath: CHROME, headless: true });
  try {
    const page = await browser.newPage({ viewport: { width: 1366, height: 800 } });
    const erros = []; page.on('pageerror', e => erros.push(e.message));
    await page.route('**/*', r => { const u = r.request().url(); if (u.includes('sql-asm.js')) return r.fulfill({ body: fs.readFileSync(ASM), contentType: 'application/javascript' }); return u.startsWith('file:') ? r.continue() : r.abort(); });
    const fimDeQuarta = { chat: { celia: [], beto: [], jairo: [], marina: [{ me: false, text: 'Oi, recruta!' }] }, unread: { celia: 0, beto: 0, jairo: 0, marina: 0 }, lidas: {},
      tut: 0, treino: null, treinosFeitos: ['m1', 'm2-filtros', 'm2-intervalos', 'm3-agregacao', 'm3-nulos'], rank: 3, done: true, dia: 1, diaIniciado: 1, diaConcluido: 1,
      closed: ['1001', '1002', '1003', '1004', '1005'], caseSel: 4, apps: ['db', 'ocorr', 'zap', 'files', 'prova', 'caderno'], beto: 'done', metas: 90, marinaApresentou: true };
    await page.addInitScript(s => { window.SISP_CONFIG_TESTE = { url: '', chave: '', contato: '' }; window.SISP_IDIOMA_TESTE = 'pt-BR';
      if (!sessionStorage.getItem('ok')) { localStorage.setItem('sisp-proto-v2', s); sessionStorage.setItem('ok', '1'); } }, JSON.stringify(fimDeQuarta));
    await page.goto('file://' + path.join(RAIZ, 'index.html'));
    await page.waitForFunction(() => !document.querySelector('#lgBtn').disabled);
    await page.click('#lgBtn');
    assert.ok(await page.evaluate(() => tabelaBloqueada('SELECT * FROM empresas') !== null), 'na quarta, as bases do Módulo 4 são restritas');

    // fim da quarta → quinta-feira
    await page.evaluate(() => report());
    await page.click('#rpDia');
    assert.match(await page.textContent('.dia-card'), /quinta-feira, 15\/10\/2026/);
    await Promise.all([page.waitForNavigation(), page.click('#diaOk')]);
    await page.waitForFunction(() => !document.querySelector('#lgBtn').disabled);
    await page.click('#lgBtn');
    assert.match(await page.textContent('.email'), /cruzamento de bases.*Mapa das tabelas/s);
    await page.click('#emOk');

    const rodar = async q => { await page.evaluate(q => { openDb(q); }, q); await page.click('#runBtn'); };
    const C = await page.evaluate(() => ({ cadeia: F.Q4CADEIA, galpao: F.galpao, fachada: F.fachada, carga: F.QCARGA, valor: F.valorCarga }));

    assert.strictEqual(await jogarTreino(page), 'm4-join');
    assert.strictEqual(await page.evaluate(() => CASES[S.caseSel].id), '1006');
    for (const q of ["SELECT r.placa, r.local_radar, r.data_hora FROM leituras_radar r JOIN veiculos v ON v.placa = r.placa WHERE v.modelo = 'Hilux';",
      "SELECT p.nome, r.data_hora FROM leituras_radar r JOIN veiculos v ON v.placa = r.placa JOIN pessoas p ON p.cpf = v.cpf_proprietario WHERE r.local_radar LIKE '%Km 92%' AND v.modelo = 'Hilux';",
      "SELECT e.razao_social, e.aberta_em FROM empresas e JOIN pessoas p ON p.cpf = e.cpf_responsavel WHERE p.nome = 'Valdemar Silveira';",
      `SELECT i.endereco, i.alugado_em FROM imoveis i JOIN empresas e ON e.cnpj = i.cnpj_locatario WHERE e.razao_social = '${C.fachada}';`,
      `SELECT r.data_hora, i.endereco ${C.cadeia};`]) await rodar(q);
    assert.strictEqual(await page.evaluate(() => S.steps['1006'].length), 5);
    await page.evaluate(() => openOcorr());
    await entregar(page, { f_1006_endereco: C.galpao, f_1006_empresa: C.fachada });

    // a Marina pergunta o horário e o caminho da operação; o jogador decide
    await page.waitForFunction(() => S.marinaOperacao === 'perguntou', null, { timeout: 25000 });
    await page.evaluate(() => { chatSel = 'marina'; openZap(); });
    await page.click('.reply button:has-text("Não contar")');
    await page.waitForFunction(() => S.marinaOperacao === 'recusou' && /profissional/.test(S.chat.marina.at(-1).text));

    assert.strictEqual(await jogarTreino(page), 'm4-left');
    assert.strictEqual(await page.evaluate(() => CASES[S.caseSel].id), '1007');
    const nota = "JOIN empresas e ON e.cnpj = n.cnpj_transportadora WHERE e.razao_social LIKE '%Central%' AND n.data_emissao = '2026-10-12'";
    await rodar(`SELECT n.* FROM notas_fiscais n ${nota};`);
    await rodar(`SELECT i.produto, i.quantidade FROM notas_fiscais n JOIN itens_nota i ON i.nota_id = n.id ${nota};`);
    await rodar(`SELECT SUM(n.valor_total) FROM notas_fiscais n JOIN itens_nota i ON i.nota_id = n.id ${nota};`);   // a soma que infla
    assert.match(await page.textContent('#dbMsg'), /não existe/);
    for (const q of [`SELECT SUM(n.valor_total) FROM notas_fiscais n ${nota};`,
      `SELECT i.produto, SUM(i.quantidade) FROM notas_fiscais n JOIN itens_nota i ON i.nota_id = n.id ${nota} GROUP BY i.produto;`,
      "SELECT i.endereco, e.razao_social FROM imoveis i LEFT JOIN empresas e ON e.cnpj = i.cnpj_locatario WHERE i.referencia LIKE '%Raposo%';",
      "SELECT i.endereco FROM imoveis i LEFT JOIN empresas e ON e.cnpj = i.cnpj_locatario WHERE i.referencia LIKE '%Raposo%' AND e.cnpj IS NULL;"]) await rodar(q);
    assert.strictEqual(await page.evaluate(() => S.steps['1007'].length), 6);
    const vagos = await page.evaluate(() => linhasDe("SELECT id FROM imoveis WHERE referencia LIKE '%Raposo%' AND cnpj_locatario IS NULL").length);
    await page.evaluate(() => openOcorr());
    await entregar(page, { f_1007_valor: String(C.valor), f_1007_vagos: String(vagos) });

    await page.waitForFunction(() => provaMod() === 4);
    await prova(page);
    await page.waitForSelector('.report', { timeout: 5000 });
    const fim = await page.evaluate(() => ({ rank: S.rank, patente: rankT(), dia: S.dia, concl: S.diaConcluido, feitos: S.treinosFeitos.slice(-2), joins: tabelaBloqueada('SELECT * FROM empresas') === null }));
    assert.deepStrictEqual(fim, { rank: 4, patente: 'Agente Especial', dia: 2, concl: 2, feitos: ['m4-join', 'm4-left'], joins: true });
    assert.match(await page.textContent('.report'), /Agente Especial.*Sexta-feira.*em desenvolvimento/s);
    // o gancho da noite: galpão vazio, alguém avisou
    await page.waitForFunction(() => S.chat.jairo.some(m => /Galpão vazio/.test(m.text)) && /Só cinco pessoas sabiam/.test(S.chat.celia.at(-1).text), null, { timeout: 20000 });
    assert.deepStrictEqual(erros, []);
  } finally { await browser.close(); }
});

// Primeiro iniciante (18/10): sem ligaduras na fonte do código (>= aparecia como ≥) e empurrão para as dicas do BO.
test('playtest 18/10 · ">=" sem ligadura e empurrão para as dicas depois de 3 tentativas', { skip: !CHROME && 'Chrome não encontrado (defina CHROME)', timeout: 60000 }, async () => {
  const { chromium } = require('playwright-core');
  const browser = await chromium.launch({ executablePath: CHROME, headless: true });
  try {
    const page = await browser.newPage({ viewport: { width: 1366, height: 800 } });
    const erros = []; page.on('pageerror', e => erros.push(e.message));
    await page.route('**/*', r => { const u = r.request().url(); if (u.includes('sql-asm.js')) return r.fulfill({ body: fs.readFileSync(ASM), contentType: 'application/javascript' }); return u.startsWith('file:') ? r.continue() : r.abort(); });
    const terca = { chat: { celia: [], beto: [], jairo: [], marina: [] }, unread: {}, lidas: {}, tut: 0, treino: null, treinosFeitos: ['m1', 'm2-filtros', 'm2-intervalos'],
      rank: 1, done: true, dia: 0, diaIniciado: 0, closed: ['1001', '1002'], caseSel: 2, apps: ['db', 'ocorr', 'zap', 'files', 'caderno'], beto: 'done' };
    await page.addInitScript(s => { window.SISP_CONFIG_TESTE = { url: '', chave: '', contato: '' }; window.SISP_IDIOMA_TESTE = 'pt-BR'; localStorage.setItem('sisp-proto-v2', s); }, JSON.stringify(terca));
    await page.goto('file://' + path.join(RAIZ, 'index.html'));
    await page.waitForFunction(() => !document.querySelector('#lgBtn').disabled);
    await page.click('#lgBtn');
    for (const sel of ['code', '#sqlEd', '#sqlHl']) {
      const lig = await page.evaluate(s => { if (s !== 'code' && !document.querySelector(s)) openDb(); const el = document.querySelector(s) || document.body.appendChild(document.createElement('code')); return getComputedStyle(el).fontVariantLigatures; }, sel);
      assert.strictEqual(lig, 'none', sel + ' sem ligaduras');
    }
    // três tentativas sem avançar no BO 1003: aparece o botão da dica; ele abre a dica certa em Ocorrências
    const Q = "SELECT * FROM leituras_radar WHERE local_radar = 'Rod. Castelo Branco - Km 18' BETWEEN '2026-10-12 22:45:00' AND '2026-10-12 23:15:59';";
    for (let i = 0; i < 3; i++) { await page.evaluate(q => openDb(q), Q); await page.click('#runBtn'); }
    assert.match(await page.textContent('#dbMsg'), /qual coluna/);
    assert.match(await page.textContent('#dbMsg .pedir-dica'), /dica da tarefa 1/);
    await page.click('#dbMsg .pedir-dica');
    assert.strictEqual(await page.evaluate(() => S.hintsSeen['1003:0']), 1);
    assert.match(await page.textContent('.ocdetail .steps .step .hint'), /três filtros/);
    assert.deepStrictEqual(erros, []);
  } finally { await browser.close(); }
});
