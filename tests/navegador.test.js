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

async function abrir(arquivo, largura, query = '') {
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

      await page.evaluate(() => { openFiles(); filesDir = 'Evidências'; renderFiles(); });
      const evid = await page.$$eval('.flist .file span', e => e.map(x => x.textContent));
      assert.deepStrictEqual(evid, ['depoimento_seguranca.txt', 'escuta_grampo_04.txt', 'radar_km18_225814.jpg']);
      await page.evaluate(() => openPhoto('radar_km18_225814.jpg'));

      await page.evaluate(() => openOcorr());
      await entregar(page, { f_1003_placa: 'KZX9B21', f_1003_nome: 'Valdemar Silveira' });
      await page.waitForFunction(() => provaMod() === 2);
      await prova(page);
      await page.waitForSelector('.report', { timeout: 5000 });

      const S = await page.evaluate(() => JSON.parse(JSON.stringify(S)));
      assert.deepStrictEqual(S.closed, ['1001', '1002', '1003']);
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
