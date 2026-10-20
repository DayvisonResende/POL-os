/* Geradores (pasta geradores/, ferramentas de produção): todos rodam, repetem com a mesma semente,
   nunca geram CPF/CNPJ válido, o verificador pega os nomes reais e as exportações SQL rodam no SQLite. */
const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');
const { carregarGeradores, scriptsDosGeradores, RAIZ } = require('./carregar-geradores');

const G = carregarGeradores();
const rodar = (id, v, semente, projeto) => G.rodarGerador(id, v || {}, semente || 'teste', projeto);
// projeto "cheio", montado como a pessoa faria na interface (gerar e salvar em cadeia)
function projetoCheio() {
  const pr = G.novoProjeto();
  const salvar = r => { if (r.colecao && r.itens.length) G.adicionarAoProjeto(pr, r.colecao, r.itens); (r.extras || []).forEach(x => x.itens.length && G.adicionarAoProjeto(pr, x.colecao, x.itens)); };
  [['bairros'], ['pessoas', { quantidade: 30 }], ['empresas'], ['veiculos'], ['contas', { padrao: 'laranjas' }], ['faccoes'], ['fichas'], ['nomes'], ['producao', { acao: 'preparar' }]]
    .forEach(([id, v]) => salvar(rodar(id, v, 'cheio', pr)));
  return pr;
}

test('geradores: o index.html carrega todos os arquivos de js/', () => {
  const lista = scriptsDosGeradores(), arquivos = fs.readdirSync(path.join(RAIZ, 'js')).map(f => 'js/' + f);
  for (const f of arquivos) assert.ok(lista.includes(f) || f === 'js/app.js', f + ' não está no index.html');
  assert.strictEqual(G.GERADORES.length, 14);
  assert.strictEqual(Array.from(G.GERADORES, g => g.numero).join(','), Array.from({ length: 14 }, (_, i) => i + 1).join(','));
});

test('geradores: todos rodam com os valores padrão, com projeto vazio e cheio, e devolvem o formato esperado', () => {
  const cheio = projetoCheio();
  for (const pr of [G.novoProjeto(), cheio]) for (const g of G.GERADORES) {
    const r = rodar(g.id, {}, 'padrao', pr);
    assert.ok(typeof r.resumo === 'string' && r.resumo, g.id + ': sem resumo');
    assert.ok(Array.isArray(r.tabelas) && Array.isArray(r.cartoes || []), g.id + ': formato');
    for (const t of r.tabelas) for (const l of t.linhas.slice(0, 5)) for (const c of t.colunas) assert.ok(c in l || l[c] === undefined, g.id + '/' + t.nome + ': coluna ' + c);
    if (r.colecao) assert.ok(G.COLECOES.includes(r.colecao), g.id + ': coleção desconhecida');
    assert.doesNotMatch(r.texto || '', /undefined|NaN|\[object Object\]|\{(valor|qtd|dias|bairro|chefe|operador|laranja)\}/, g.id + ': texto com buraco');
  }
});

test('geradores: a mesma semente gera exatamente o mesmo resultado; outra semente, outro', () => {
  for (const g of G.GERADORES) {
    const a = JSON.stringify(rodar(g.id, {}, 'semente-x').tabelas), b = JSON.stringify(rodar(g.id, {}, 'semente-x').tabelas);
    assert.strictEqual(a, b, g.id + ' não é determinístico');
  }
  assert.notStrictEqual(JSON.stringify(rodar('pessoas', {}, 'a').itens), JSON.stringify(rodar('pessoas', {}, 'b').itens));
});

test('geradores: CPF e CNPJ saem sempre com o dígito errado (nunca podem ser de alguém)', () => {
  const pessoas = rodar('pessoas', { quantidade: 200 }, 'cpf').itens;
  for (const p of pessoas) { assert.match(p.cpf, /^\d{3}\.\d{3}\.\d{3}-\d{2}$/); assert.ok(!G.cpfValido(p.cpf), 'CPF válido gerado: ' + p.cpf); }
  const empresas = rodar('empresas', { quantidade: 120 }, 'cnpj').itens;
  for (const e of empresas) { assert.match(e.cnpj, /^\d{2}\.\d{3}\.\d{3}\/0001-\d{2}$/); assert.ok(!G.cnpjValido(e.cnpj), 'CNPJ válido gerado: ' + e.cnpj); }
  const rng = G.criarRng('dv');
  for (let i = 0; i < 2000; i++) { assert.ok(!G.cpfValido(G.gerarCpfFicticio(rng))); assert.ok(!G.cnpjValido(G.gerarCnpjFicticio(rng))); }
  // e o validador está certo: números conhecidos e válidos passam
  assert.ok(G.cpfValido('529.982.247-25') && G.cnpjValido('11.222.333/0001-81'));
  for (const p of pessoas) { assert.match(p.telefone, /^\(\d\d\) 90\d{3}-\d{4}$/); assert.match(p.email, /@email\.example$/); }
});

test('geradores: o verificador pega forças, facções e operações reais, e não acusa nomes comuns', () => {
  const v = n => G.verificarNome(n).nivel;
  for (const n of ['A Rota', 'Os da ROTA', 'Bope Sul', 'Irmãos do PCC', 'Comando Vermelho', 'Família do Norte', 'Operação Lava Jato', 'Grupo 1533']) assert.strictEqual(v(n), 'proibido', n);
  for (const n of ['A Família Seriema', 'Os Contadores', 'Comando Leste', 'Grupo GTX', 'O Livro-Caixa', 'A Tropa do Cais']) assert.strictEqual(v(n), 'atencao', n);
  for (const n of ['Operação Balança Viciada', 'O dízimo do porto', 'Ada Ferreira', 'Rumo Sul Transportes', 'Bairro II']) assert.strictEqual(v(n), 'ok', n);
  const docs = G.verificarDocumentos('cpf 529.982.247-25, outro 52998224726 e cnpj 11.222.333/0001-81');
  assert.strictEqual(docs.map(d => d.tipo + ':' + d.valido).join(' '), 'CPF:true CPF:false CNPJ:true');
});

test('geradores: os nomes do próprio vocabulário não esbarram em nada proibido', () => {
  const nomes = [].concat(Array.from(G.MARCA_EMPRESA), Array.from(G.BANCOS_FICTICIOS), Array.from(G.FACCOES_PADRAO, f => f.nome),
    ...Array.from(G.PERFIS_BAIRRO, p => Array.from(p.nomes).concat(Array.from(p.prefixos))), ...Object.values(G.PALAVRAS_CASO).map(l => Array.from(l, x => x[0] + ' ' + x[2])),
    ...Object.values(G.COMPLEMENTOS_CASO).map(l => Array.from(l, x => x[0])), Array.from(G.ADJETIVOS_CASO, a => a.join(' ')), ...Array.from(G.NOVAS_ESPECIALIDADES, e => Array.from(e.palavras, x => x[0] + ' ' + x[2])));
  const ruins = nomes.filter(n => G.verificarNome(n).nivel === 'proibido');
  assert.strictEqual(ruins.join(', '), '', 'vocabulário com termo proibido');
  // e em 300 nomes de caso sorteados, nenhum proibido
  const casos = rodar('nomes', { quantidade: 200 }, 'muitos').itens.concat(rodar('nomes', { quantidade: 100 }, 'outros').itens);
  assert.strictEqual(casos.filter(n => n.verificacao === 'proibido').map(n => n.nome).join('; '), '');
});

test('geradores: fichas coerentes (facção só com crimes dela, hierarquia, finais e moral só no arco)', () => {
  const fac = Object.fromEntries(Array.from(G.FACCOES_PADRAO, f => [f.id, f]));
  for (let i = 0; i < 60; i++) {
    const tipo = ['solto', 'fragmento', 'arco'][i % 3];
    const f = rodar('fichas', { quantidade: 1, tipo }, 'ficha' + i).itens[0];
    if (f.faccao) {
      const c = G.CRIMES.find(x => x.id === f.crime.id);
      assert.ok(fac[f.faccao].crimes.includes(c.id) || c.faccao === f.faccao, f.faccao + ' com crime ' + c.id);
    }
    assert.ok(f.hierarquia.laranja.nome && f.hierarquia.operador.nome && f.hierarquia.chefe.nome);
    assert.ok(G.CRIMES.find(x => x.id === f.crime.id).tecnicas.includes(f.tecnica.id) || (f.faccao && fac[f.faccao].tecnica === f.tecnica.id), 'técnica fora do crime: ' + f.tecnica.id);
    assert.strictEqual(Array.from(f.finais, x => x.tipo).join(','), tipo === 'arco' ? 'completo,parcial,fracasso,moral' : 'completo,parcial,fracasso');
    if (tipo === 'arco') { assert.ok(f.etapas.length >= 5 && f.etapas.length <= 8); assert.strictEqual(f.etapas[f.etapas.length - 1].degrau, 'chefão'); }
    assert.doesNotMatch(f.texto, /undefined|NaN/);
    assert.doesNotMatch(f.frase, /\b(na|da) (Centro|Jardim|Parque|Conjunto|Morro|Distrito|Bairro|Largo|Porto|Cais)\b/, 'concordância do bairro: ' + f.frase);
  }
});

test('geradores: o sujador registra cada sujeira e o gabarito confere com a tabela', () => {
  const pr = G.novoProjeto();
  G.adicionarAoProjeto(pr, 'pessoas', rodar('pessoas', { quantidade: 60 }, 'limpas').itens);
  const r = rodar('sujador', { intensidade: 60, sujeiras: ['espacos', 'caixa', 'acentos', 'abreviacoes', 'documento', 'digitacao', 'datas', 'vazios', 'duplicados', 'ordem_nome'] }, 'suja', pr);
  const suja = r.tabelas.find(t => t.nome === 'dados_sujos').linhas, gab = r.tabelas.find(t => t.nome === 'gabarito').linhas;
  assert.ok(gab.length > 20, 'poucas sujeiras: ' + gab.length);
  assert.strictEqual(suja.length, 60 + gab.filter(g => g.sujeira === 'duplicados').length);
  const tipos = new Set(gab.map(g => g.sujeira));
  for (const t of ['espacos', 'caixa', 'documento', 'duplicados']) assert.ok(tipos.has(t), 'faltou ' + t);
  for (const g of gab.filter(x => x.sujeira !== 'duplicados')) {
    const linha = suja[g.linha - 1], original = pr.pessoas[linha.linha_original - 1];
    // a célula suja é a do gabarito (a não ser que a mesma célula tenha sido sujada de novo na cópia duplicada)
    assert.strictEqual(String(g.original), String(original[g.coluna]), 'original errado na linha ' + g.linha);
    assert.strictEqual(String(linha[g.coluna]), String(g.sujo), 'linha ' + g.linha + ' coluna ' + g.coluna);
  }
  // CSV colado também funciona
  const csv = rodar('sujador', { fonte: 'csv', csv: 'nome;cpf\nMaria da Conceição;123.456.789-00\nJoão Araújo;987.654.321-00', colunas: '', intensidade: 100 }, 'csv');
  assert.strictEqual(csv.tabelas[0].linhas.length >= 2, true);
});

test('geradores: as exportações SQL rodam no SQLite e os padrões plantados aparecem na consulta', async () => {
  const SQL = await require('sql.js')();
  const cheio = projetoCheio();
  for (const g of G.GERADORES) {
    const r = rodar(g.id, {}, 'sql', cheio);
    const db = new SQL.Database();
    for (const t of r.tabelas) { if (!t.linhas.length) continue; db.exec(G.paraSQL(t.nome, Array.from(t.colunas), Array.from(t.linhas))); assert.strictEqual(db.exec('SELECT COUNT(*) FROM ' + t.nome)[0].values[0][0], t.linhas.length, g.id + '/' + t.nome); }
    db.close();
  }
  // fracionamento: os depósitos plantados (em espécie, logo abaixo de 10 mil) são exatamente os que a consulta acha
  const r = rodar('contas', { padrao: 'fracionamento', titulares: 'novos', quantidade: 25 }, 'frac');
  const db = new SQL.Database();
  r.tabelas.forEach(t => db.exec(G.paraSQL(t.nome, Array.from(t.colunas), Array.from(t.linhas))));
  const achados = db.exec("SELECT id FROM transacoes WHERE origem IS NULL AND tipo = 'DEPÓSITO' AND valor BETWEEN 9000 AND 9999.99 ORDER BY id")[0].values.map(v => v[0]);
  const plantados = db.exec("SELECT g.transacao FROM gabarito g JOIN transacoes t ON t.id = g.transacao WHERE t.origem IS NULL ORDER BY 1")[0].values.map(v => v[0]);
  assert.strictEqual(achados.join(','), plantados.join(','));
  assert.ok(achados.length >= 8);
  db.close();
});

test('geradores: contas salvas em dois lotes não quebram origem/destino', () => {
  const pr = G.novoProjeto();
  for (const s of ['lote1', 'lote2']) { const r = rodar('contas', { titulares: 'novos', quantidade: 5, dias: 10 }, s, pr); G.adicionarAoProjeto(pr, 'contas', r.itens); G.adicionarAoProjeto(pr, 'transacoes', r.extras[0].itens); }
  const ids = new Set(pr.contas.map(c => c.id));
  assert.strictEqual(ids.size, pr.contas.length);
  for (const t of pr.transacoes) { if (t.origem != null) assert.ok(ids.has(t.origem)); if (t.destino != null) assert.ok(ids.has(t.destino)); }
  assert.strictEqual(new Set(pr.transacoes.map(t => t.id)).size, pr.transacoes.length);
});

test('geradores: prompts no estilo do Beto, sem texto na imagem, e nomes de arquivo padronizados', () => {
  const r = rodar('prompts', { tipo: 'lote', quantidade: 20 }, 'rostos');
  const rostos = r.cartoes.filter(c => c.producao);
  assert.strictEqual(rostos.length, 20);
  for (const c of rostos) { assert.match(c.prompt, /^Upper body portrait of an? /); assert.match(c.prompt, /graphic novel style.*rim lighting.*--ar 1:1 --v 6\.1 --no text/); }
  // o lote sai equilibrado em gênero
  const pessoas = r.extras[0].itens; assert.strictEqual(pessoas.filter(p => p.genero === 'F').length, 10);
  const prep = rodar('producao', { acao: 'preparar' }).itens;
  for (const x of prep) assert.match(x.arquivo, /^(Images\/|img\/)|^[a-z]+(-[a-z0-9]+)*\.webp$/, 'arquivo fora do padrão: ' + x.arquivo);
  assert.strictEqual(prep.filter(x => x.categoria === 'rosto').length, 40);
  assert.ok(prep.some(x => x.arquivo === 'rosto-001.webp') && prep.some(x => x.arquivo === 'chefao-livro-caixa.webp') && prep.some(x => x.arquivo === 'final-completo.webp'));
});
