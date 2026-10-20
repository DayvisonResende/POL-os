/* Interface dos geradores: lista lateral, formulário de cada gerador, resultado (cartões, tabelas, texto),
   ações (salvar no projeto, copiar, baixar CSV/SQL/JSON/MD) e a tela do projeto (coleções e lista de produção). */
'use strict';

const $ = s => document.querySelector(s);
let projeto = carregarProjeto();
let ultimo = (() => { try { return JSON.parse(localStorage.getItem('pol-geradores-ultimo') || '{}'); } catch (e) { return {}; } })();
let resultado = null, abaAtual = 'cartoes';
ultimo.valores = ultimo.valores || {}; ultimo.sementes = ultimo.sementes || {};

function guardarUltimo() { try { localStorage.setItem('pol-geradores-ultimo', JSON.stringify(ultimo)); } catch (e) { /* sem armazenamento */ } }
function salvar() {
  if (!salvarProjeto(projeto)) toast('Não consegui salvar no navegador (espaço cheio?). Exporte o projeto em JSON para não perder.', true);
  atualizarContagem();
}
function toast(msg, erro) {
  const t = $('#toast'); t.textContent = msg; t.className = 'toast visivel' + (erro ? ' erro' : '');
  clearTimeout(toast.t); toast.t = setTimeout(() => t.className = 'toast', erro ? 6000 : 2600);
}
function copiar(txt, aviso) {
  const ok = () => toast(aviso || 'Copiado.');
  if (navigator.clipboard && window.isSecureContext) navigator.clipboard.writeText(txt).then(ok, () => copiarAntigo(txt) && ok());
  else if (copiarAntigo(txt)) ok();
}
function copiarAntigo(txt) {
  const a = document.createElement('textarea'); a.value = txt; a.style.position = 'fixed'; a.style.opacity = '0'; document.body.appendChild(a); a.select();
  let ok = false; try { ok = document.execCommand('copy'); } catch (e) { ok = false; }
  a.remove(); if (!ok) toast('Não deu para copiar automaticamente. Selecione o texto e use Ctrl+C.', true); return ok;
}
function baixar(nome, conteudo, tipo) {
  const url = URL.createObjectURL(new Blob([conteudo], { type: tipo || 'text/plain;charset=utf-8' }));
  const a = document.createElement('a'); a.href = url; a.download = nome; document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
const carimbo = () => new Date().toISOString().slice(0, 16).replace(/[-:T]/g, '');
function atualizarContagem() { $('#contagemProjeto').textContent = COLECOES.reduce((s, c) => s + projeto[c].length, 0); }
function rotuloItem(x) { return x.nome || x.titulo || x.razao_social || x.placa || x.titular_nome || x.id; }

/* ---------- Lista lateral ---------- */
function montarLista() {
  const grupos = {};
  GERADORES.forEach(g => (grupos[g.grupo] = grupos[g.grupo] || []).push(g));
  $('#lista').innerHTML = Object.keys(grupos).map(gr => '<h2>' + U.esc(gr) + '</h2><ul>' + grupos[gr].map(g => '<li><a href="#' + g.id + '" data-id="' + g.id + '"><span class="num">' + g.numero + '</span>' + U.esc(g.nome) + '</a></li>').join('') + '</ul>').join('') +
    '<h2>Projeto</h2><ul><li><a href="#projeto" data-id="projeto"><span class="num">≡</span>Coleções e produção</a></li></ul>';
}
function marcarLista(id) { document.querySelectorAll('#lista a').forEach(a => a.classList.toggle('ativo', a.dataset.id === id)); }

/* ---------- Formulário ---------- */
function valorPadrao(g, c) { const v = (ultimo.valores[g.id] || {})[c.id]; return v === undefined ? c.padrao : v; }
function campoHtml(g, c) {
  const v = valorPadrao(g, c), id = 'f_' + c.id, rot = '<label for="' + id + '">' + U.esc(c.rotulo) + '</label>';
  if (c.tipo === 'numero') return '<div class="campo">' + rot + '<input type="number" id="' + id + '" value="' + U.esc(v) + '"' + (c.min != null ? ' min="' + c.min + '"' : '') + (c.max != null ? ' max="' + c.max + '"' : '') + '></div>';
  if (c.tipo === 'texto') return '<div class="campo">' + rot + '<input type="text" id="' + id + '" value="' + U.esc(v) + '"></div>';
  if (c.tipo === 'data') return '<div class="campo">' + rot + '<input type="date" id="' + id + '" value="' + U.esc(v) + '"></div>';
  if (c.tipo === 'area') return '<div class="campo largo">' + rot + '<textarea id="' + id + '" rows="5">' + U.esc(v) + '</textarea></div>';
  if (c.tipo === 'check') return '<div class="campo check"><label><input type="checkbox" id="' + id + '"' + (v ? ' checked' : '') + '> ' + U.esc(c.rotulo) + '</label></div>';
  if (c.tipo === 'checks') return '<fieldset class="campo largo checks"><legend>' + U.esc(c.rotulo) + '</legend>' + c.opcoes.map(o => '<label><input type="checkbox" name="' + id + '" value="' + U.esc(o[0]) + '"' + ((v || []).includes(o[0]) ? ' checked' : '') + '> ' + U.esc(o[1]) + '</label>').join('') + '</fieldset>';
  let opcoes = c.opcoes;
  if (c.tipo === 'projeto') {
    const l = projeto[c.colecao] || [];
    opcoes = [['', c.vazio || '—']].concat(l.map(x => [x.id, rotuloItem(x) + ' (' + x.id + ')']));
  }
  return '<div class="campo">' + rot + '<select id="' + id + '">' + opcoes.map(o => '<option value="' + U.esc(o[0]) + '"' + (String(o[0]) === String(v) ? ' selected' : '') + '>' + U.esc(o[1]) + '</option>').join('') + '</select>' +
    (c.tipo === 'projeto' && !(projeto[c.colecao] || []).length ? '<small>O projeto ainda não tem ' + c.colecao + '.</small>' : '') + '</div>';
}
function lerCampos(g) {
  const v = {};
  (g.campos || []).forEach(c => {
    const el = $('#f_' + c.id);
    if (c.tipo === 'checks') v[c.id] = [...document.querySelectorAll('input[name="f_' + c.id + '"]:checked')].map(x => x.value);
    else if (c.tipo === 'check') v[c.id] = el.checked;
    else if (c.tipo === 'numero') { let n = parseInt(el.value, 10); if (isNaN(n)) n = c.padrao; if (c.min != null) n = Math.max(c.min, n); if (c.max != null) n = Math.min(c.max, n); v[c.id] = n; el.value = n; }
    else if (c.tipo === 'data') v[c.id] = el.value || c.padrao;
    else v[c.id] = el.value;
  });
  return v;
}
function abrirGerador(g) {
  marcarLista(g.id); ultimo.atual = g.id; guardarUltimo();
  const semente = ultimo.sementes[g.id] || sementeAleatoria();
  $('#painel').innerHTML = '<section class="cabecalho"><p class="numero">Gerador ' + g.numero + ' · ' + U.esc(g.grupo) + '</p><h2>' + U.esc(g.nome) + '</h2><p>' + U.esc(g.descricao) + '</p></section>' +
    '<form id="form" class="form" autocomplete="off">' + (g.campos || []).map(c => campoHtml(g, c)).join('') +
    '<div class="campo semente"><label for="f_semente">Semente <small>(a mesma semente gera o mesmo resultado)</small></label><div class="linha"><input type="text" id="f_semente" value="' + U.esc(semente) + '"><button type="button" id="btDado" title="Sortear outra semente" aria-label="Sortear outra semente">🎲</button></div></div>' +
    '<div class="acoes-form"><button type="submit" class="primario">Gerar</button><button type="button" id="btPadrao" class="secundario">Voltar ao padrão</button></div></form><section id="resultado"></section>';
  $('#form').addEventListener('submit', e => { e.preventDefault(); gerarAgora(g); });
  $('#btDado').addEventListener('click', () => { $('#f_semente').value = sementeAleatoria(); gerarAgora(g); });
  $('#btPadrao').addEventListener('click', () => { delete ultimo.valores[g.id]; guardarUltimo(); abrirGerador(g); });
  resultado = null; abaAtual = 'cartoes';
}
function gerarAgora(g) {
  const v = lerCampos(g), semente = $('#f_semente').value.trim() || sementeAleatoria();
  $('#f_semente').value = semente;
  ultimo.valores[g.id] = v; ultimo.sementes[g.id] = semente; guardarUltimo();
  try { resultado = g.gerar(v, { rng: criarRng(semente + '|' + g.id), semente, projeto }); }
  catch (e) { console.error(e); $('#resultado').innerHTML = '<p class="aviso erro">Erro ao gerar: ' + U.esc(e.message) + '</p>'; return; }
  resultado.gerador = g; resultado.semente = semente; resultado.salvo = false;
  mostrarResultado();
}

/* ---------- Resultado ---------- */
function mostrarResultado() {
  const r = resultado, g = r.gerador;
  const podeSalvar = (r.itens && r.itens.length && r.colecao) || (r.extras || []).some(x => x.itens.length);
  const tabelas = r.tabelas || [];
  $('#resultado').innerHTML = '<div class="resumo"><p>' + U.esc(r.resumo || '') + '</p>' + (r.avisos || []).map(a => '<p class="aviso">' + U.esc(a) + '</p>').join('') + '</div>' +
    '<div class="barra-acoes">' +
    (podeSalvar ? '<button id="btSalvarTudo" class="primario"' + (r.salvo ? ' disabled' : '') + '>' + (r.salvo ? 'Salvo no projeto' : 'Salvar tudo no projeto') + '</button>' : '') +
    (r.texto ? '<button data-acao="copiarTexto">Copiar texto</button><button data-acao="md">Baixar .md</button>' : '') +
    (tabelas.length ? '<button data-acao="sql">Baixar SQL</button><button data-acao="csv">Baixar CSV' + (tabelas.length > 1 ? ' (' + tabelas.length + ')' : '') + '</button>' : '') +
    '<button data-acao="json">Baixar JSON</button></div>' +
    '<div class="abas" role="tablist">' + [['cartoes', 'Cartões'], ['tabelas', 'Tabelas'], ['texto', 'Texto']].map(a => '<button role="tab" data-aba="' + a[0] + '" aria-selected="' + (abaAtual === a[0]) + '">' + a[1] + '</button>').join('') + '</div>' +
    '<div id="conteudoAba"></div>';
  if (podeSalvar) $('#btSalvarTudo').addEventListener('click', salvarTudo);
  document.querySelectorAll('.barra-acoes [data-acao]').forEach(b => b.addEventListener('click', () => acao(b.dataset.acao)));
  document.querySelectorAll('.abas [data-aba]').forEach(b => b.addEventListener('click', () => { abaAtual = b.dataset.aba; mostrarResultado(); }));
  if (abaAtual === 'cartoes' && !(r.cartoes || []).length) abaAtual = tabelas.length ? 'tabelas' : 'texto';
  document.querySelectorAll('.abas [data-aba]').forEach(b => b.setAttribute('aria-selected', b.dataset.aba === abaAtual));
  const c = $('#conteudoAba');
  if (abaAtual === 'cartoes') c.innerHTML = '<div class="cartoes">' + (r.cartoes || []).map(cartaoHtml).join('') + '</div>';
  else if (abaAtual === 'tabelas') c.innerHTML = tabelas.map((t, i) => tabelaHtml(t, i)).join('') || '<p class="vazio">Este gerador não produz tabela.</p>';
  else c.innerHTML = '<pre class="texto">' + U.esc(r.texto || '') + '</pre>';
  c.querySelectorAll('[data-cartao]').forEach(b => b.addEventListener('click', () => acaoCartao(+b.dataset.cartao, b.dataset.op)));
  c.querySelectorAll('[data-tabela]').forEach(b => b.addEventListener('click', () => { const t = tabelas[+b.dataset.tabela]; b.dataset.op === 'csv' ? baixar(t.nome + '.csv', paraCSV(t.colunas, t.linhas), 'text/csv;charset=utf-8') : baixar(t.nome + '.sql', paraSQL(t.nome, t.colunas, t.linhas)); }));
}
function cartaoHtml(c, i) {
  const ops = [];
  if (c.item && c.colecao) ops.push('<button data-cartao="' + i + '" data-op="salvar">Salvar</button>');
  if (c.prompt) ops.push('<button data-cartao="' + i + '" data-op="prompt">Copiar prompt</button>');
  if (c.producao) ops.push('<button data-cartao="' + i + '" data-op="producao">+ produção</button>');
  return '<article class="cartao"><h3>' + U.esc(c.titulo) + '</h3>' + (c.subtitulo ? '<p class="sub">' + U.esc(c.subtitulo) + '</p>' : '') + (c.html || '') +
    (c.prompt ? '<details class="prompt"><summary>Prompt da imagem</summary><pre>' + U.esc(c.prompt) + '</pre></details>' : '') + (ops.length ? '<div class="ops">' + ops.join('') + '</div>' : '') + '</article>';
}
function tabelaHtml(t, i) {
  const max = 200, l = t.linhas.slice(0, max);
  return '<div class="tabela"><div class="tabela-topo"><h3>' + U.esc(t.nome) + ' <small>' + t.linhas.length + ' linha(s)</small></h3><span><button data-tabela="' + i + '" data-op="csv">CSV</button><button data-tabela="' + i + '" data-op="sql">SQL</button></span></div>' +
    '<div class="rolagem"><table><thead><tr>' + t.colunas.map(c => '<th>' + U.esc(c) + '</th>').join('') + '</tr></thead><tbody>' +
    l.map(x => '<tr>' + t.colunas.map(c => '<td' + (x[c] == null ? ' class="nulo"' : '') + '>' + (x[c] == null ? 'NULL' : U.esc(typeof x[c] === 'object' ? JSON.stringify(x[c]) : x[c])) + '</td>').join('') + '</tr>').join('') +
    '</tbody></table></div>' + (t.linhas.length > max ? '<p class="vazio">Mostrando ' + max + ' de ' + t.linhas.length + '. Os downloads levam tudo.</p>' : '') + '</div>';
}
function salvarTudo() {
  const r = resultado; let n = 0;
  if (r.itens && r.itens.length && r.colecao) n += adicionarAoProjeto(projeto, r.colecao, r.itens).length;
  (r.extras || []).forEach(x => { if (x.itens.length) n += adicionarAoProjeto(projeto, x.colecao, x.itens).length; });
  r.salvo = true; salvar(); mostrarResultado();
  toast(n + ' item(ns) salvo(s) no projeto.');
}
function acaoCartao(i, op) {
  const c = resultado.cartoes[i];
  if (op === 'prompt') return copiar(c.prompt, 'Prompt copiado.');
  if (op === 'salvar') { const [x] = adicionarAoProjeto(projeto, c.colecao, c.item); salvar(); return toast('Salvo como ' + x.id + '.'); }
  if (op === 'producao') {
    const it = novoItemProducao(projeto, { tipo: c.producao.tipo, nome: c.producao.nome, arquivo: c.producao.arquivo, prompt: c.prompt });
    const igual = projeto.producao.find(x => x.arquivo === it.arquivo);
    if (igual) { if (c.prompt && !igual.prompt) { igual.prompt = c.prompt; if (igual.status === 'falta') igual.status = 'prompt'; salvar(); return toast('Prompt guardado na vaga ' + igual.arquivo + '.'); } return toast('Já está na lista: ' + igual.arquivo + '.'); }
    // rosto novo ocupa a primeira vaga de rosto ainda sem prompt
    const vaga = it.categoria === 'rosto' && projeto.producao.find(x => x.categoria === 'rosto' && x.status === 'falta' && !x.prompt);
    if (vaga) { vaga.prompt = c.prompt || ''; vaga.status = 'prompt'; vaga.nome = c.producao.nome; salvar(); return toast('Na lista de produção: ' + vaga.arquivo + '.'); }
    adicionarAoProjeto(projeto, 'producao', it); salvar(); toast('Na lista de produção: ' + it.arquivo + '.');
  }
}
function acao(a) {
  const r = resultado, base = r.gerador.id + '-' + U.slug(r.semente).replace(/\./g, '-');
  if (a === 'copiarTexto') return copiar(r.texto, 'Texto copiado.');
  if (a === 'md') return baixar(base + '.md', r.texto, 'text/markdown;charset=utf-8');
  if (a === 'sql') return baixar(base + '.sql', '-- Gerado por geradores/ (' + r.gerador.nome + ', semente "' + r.semente + '"). Dados fictícios.\n' + r.tabelas.map(t => paraSQL(t.nome, t.colunas, t.linhas)).join('\n'));
  if (a === 'csv') return r.tabelas.forEach((t, i) => setTimeout(() => baixar(base + '-' + t.nome + '.csv', paraCSV(t.colunas, t.linhas), 'text/csv;charset=utf-8'), i * 300));
  if (a === 'json') {
    const o = { gerador: r.gerador.id, semente: r.semente };
    if (r.colecao) o[r.colecao] = r.itens;
    (r.extras || []).forEach(x => o[x.colecao] = (o[x.colecao] || []).concat(x.itens));
    if (!r.colecao) o.tabelas = r.tabelas;
    return baixar(base + '.json', JSON.stringify(o, null, 2), 'application/json');
  }
}

/* ---------- Projeto ---------- */
function linhaPlana(x) { const o = {}; Object.keys(x).forEach(k => o[k] = x[k] != null && typeof x[k] === 'object' ? JSON.stringify(x[k]) : x[k]); return o; }
function colunasDe(itens) { const s = new Set(); itens.forEach(x => Object.keys(x).forEach(k => s.add(k))); return [...s]; }
function abrirProjeto() {
  marcarLista('projeto'); ultimo.atual = 'projeto'; guardarUltimo();
  const nomes = { pessoas: 'Pessoas', bairros: 'Bairros', empresas: 'Empresas', veiculos: 'Veículos', contas: 'Contas', transacoes: 'Transações', faccoes: 'Facções', fichas: 'Fichas de caso', nomes: 'Nomes de casos', producao: 'Lista de produção' };
  $('#painel').innerHTML = '<section class="cabecalho"><p class="numero">Projeto</p><h2>Coleções e produção</h2><p>Tudo o que você salva fica neste navegador e é usado pelos outros geradores (as empresas usam as pessoas como sócias, as contas usam pessoas e empresas, e assim por diante). Exporte o JSON de vez em quando: limpar os dados do navegador apaga o projeto.</p></section>' +
    '<div class="form"><div class="campo"><label for="pCidade">Nome da cidade</label><input type="text" id="pCidade" value="' + U.esc(projeto.cidade) + '"></div><div class="campo"><label for="pDdd">DDD dos telefones</label><input type="text" id="pDdd" maxlength="2" value="' + U.esc(projeto.ddd) + '"></div></div>' +
    '<div class="barra-acoes"><button id="pExportar" class="primario">Exportar projeto (JSON)</button><label class="botao">Importar JSON<input type="file" id="pImportar" accept=".json,application/json" hidden></label><button id="pSql">Exportar tudo em SQL</button><button id="pApagar" class="perigo">Apagar o projeto</button></div>' +
    '<div class="colecoes">' + COLECOES.map(c => '<div class="colecao"><div><b>' + projeto[c].length + '</b><span>' + nomes[c] + '</span></div>' + (projeto[c].length ? '<div class="botoes"><button data-ver="' + c + '">Ver</button><button data-limpar="' + c + '" class="perigo">Limpar</button></div>' : '') + '</div>').join('') + '</div>' +
    '<section id="producao"></section><section id="verColecao"></section>';
  $('#pCidade').addEventListener('change', e => { projeto.cidade = e.target.value.trim() || 'Cidade fictícia'; salvar(); });
  $('#pDdd').addEventListener('change', e => { projeto.ddd = (e.target.value.replace(/\D/g, '') || '11').slice(0, 2); e.target.value = projeto.ddd; salvar(); });
  $('#pExportar').addEventListener('click', () => baixar('projeto-geradores-' + carimbo() + '.json', JSON.stringify(projeto, null, 2), 'application/json'));
  $('#pImportar').addEventListener('change', e => importar(e.target.files[0]));
  $('#pSql').addEventListener('click', () => baixar('projeto-geradores-' + carimbo() + '.sql', '-- Projeto dos geradores do Pol-OS. Dados fictícios.\n' + COLECOES.filter(c => projeto[c].length).map(c => { const l = projeto[c].map(linhaPlana); return paraSQL(c, colunasDe(l), l); }).join('\n')));
  $('#pApagar').addEventListener('click', () => { if (confirm('Apagar TODO o projeto deste navegador? Exporte o JSON antes se quiser guardar.')) { projeto = novoProjeto(); salvar(); abrirProjeto(); toast('Projeto apagado.'); } });
  document.querySelectorAll('[data-ver]').forEach(b => b.addEventListener('click', () => verColecao(b.dataset.ver)));
  document.querySelectorAll('[data-limpar]').forEach(b => b.addEventListener('click', () => { const c = b.dataset.limpar; if (confirm('Apagar as ' + projeto[c].length + ' entradas de "' + nomes[c] + '"?')) { projeto[c] = []; salvar(); abrirProjeto(); } }));
  mostrarProducao();
}
function verColecao(c) {
  const l = projeto[c].map(linhaPlana), t = { nome: c, colunas: colunasDe(l), linhas: l };
  $('#verColecao').innerHTML = tabelaHtml(t, 0);
  $('#verColecao').querySelectorAll('[data-tabela]').forEach(b => b.addEventListener('click', () => b.dataset.op === 'csv' ? baixar(c + '.csv', paraCSV(t.colunas, t.linhas), 'text/csv;charset=utf-8') : baixar(c + '.sql', paraSQL(c, t.colunas, t.linhas))));
  $('#verColecao').scrollIntoView({ behavior: 'smooth' });
}
function mostrarProducao() {
  const itens = projeto.producao, res = resumoProducao(projeto);
  const filtro = mostrarProducao.filtro || 'pendentes';
  const visiveis = itens.filter(x => filtro === 'todas' || (filtro === 'pendentes' ? !['aprovada', 'no_jogo'].includes(x.status) : x.categoria === filtro));
  $('#producao').innerHTML = '<h3>Lista de produção de imagens</h3>' +
    (itens.length ? '<div class="progresso">' + res.filter(r => r.meta || r.total).map(r => '<div><span>' + r.nome + '</span><div class="barra"><span style="width:' + (r.meta ? Math.min(100, Math.round(r.prontas * 100 / r.meta)) : 100) + '%"></span></div><small>' + r.prontas + '/' + (r.meta || r.total) + '</small></div>').join('') + '</div>' +
      '<div class="campo"><label for="pFiltro">Mostrar</label><select id="pFiltro">' + [['pendentes', 'Pendentes'], ['todas', 'Todas']].concat(CATEGORIAS_PRODUCAO.map(c => [c.id, c.nome])).map(o => '<option value="' + o[0] + '"' + (o[0] === filtro ? ' selected' : '') + '>' + o[1] + '</option>').join('') + '</select></div>' +
      '<div class="rolagem"><table class="producao"><thead><tr><th>Arquivo</th><th>Nome</th><th>Status</th><th></th></tr></thead><tbody>' +
      visiveis.map(x => '<tr><td><code>' + U.esc(x.arquivo) + '</code></td><td>' + U.esc(x.nome) + '</td><td><select data-status="' + x.id + '">' + Object.keys(STATUS_PRODUCAO).map(s => '<option value="' + s + '"' + (s === x.status ? ' selected' : '') + '>' + STATUS_PRODUCAO[s] + '</option>').join('') + '</select></td><td>' +
        (x.prompt ? '<button data-pprompt="' + x.id + '">Copiar prompt</button>' : '<small>sem prompt</small>') + '<button data-premover="' + x.id + '" class="perigo" title="Tirar da lista">×</button></td></tr>').join('') +
      '</tbody></table></div>' + (visiveis.length ? '' : '<p class="vazio">Nada aqui com esse filtro.</p>')
      : '<p class="vazio">A lista está vazia. Abra o gerador 14, escolha "Preparar a lista" e salve no projeto. Os botões "+ produção" dos cartões também mandam itens para cá.</p>');
  const f = $('#pFiltro'); if (f) f.addEventListener('change', e => { mostrarProducao.filtro = e.target.value; mostrarProducao(); });
  document.querySelectorAll('[data-status]').forEach(s => s.addEventListener('change', () => { const x = itens.find(y => y.id === s.dataset.status); x.status = s.value; salvar(); mostrarProducao(); }));
  document.querySelectorAll('[data-pprompt]').forEach(b => b.addEventListener('click', () => copiar(itens.find(y => y.id === b.dataset.pprompt).prompt, 'Prompt copiado.')));
  document.querySelectorAll('[data-premover]').forEach(b => b.addEventListener('click', () => { projeto.producao = itens.filter(y => y.id !== b.dataset.premover); salvar(); mostrarProducao(); }));
}
function importar(arquivo) {
  if (!arquivo) return;
  const leitor = new FileReader();
  leitor.onload = () => {
    try {
      const p = JSON.parse(leitor.result);
      if (!p || typeof p !== 'object' || !COLECOES.some(c => Array.isArray(p[c]))) throw new Error('não parece um projeto dos geradores');
      const substituir = confirm('OK = SUBSTITUIR o projeto atual pelo arquivo.\nCancelar = JUNTAR o arquivo ao projeto atual.');
      if (substituir) { projeto = novoProjeto(); projeto.cidade = p.cidade || projeto.cidade; projeto.ddd = p.ddd || projeto.ddd; }
      COLECOES.forEach(c => { if (Array.isArray(p[c]) && p[c].length) { if (substituir) projeto[c] = JSON.parse(JSON.stringify(p[c])); else adicionarAoProjeto(projeto, c, p[c]); } });
      salvar(); abrirProjeto(); toast('Projeto importado.');
    } catch (e) { toast('Não consegui importar: ' + e.message, true); }
  };
  leitor.readAsText(arquivo);
}

/* ---------- Rotas ---------- */
function rota() {
  document.body.classList.remove('menu-aberto');
  const id = location.hash.slice(1) || ultimo.atual || 'pessoas';
  if (id === 'projeto') return abrirProjeto();
  abrirGerador(gerador(id) || GERADORES[0]);
}
montarLista(); atualizarContagem();
window.addEventListener('hashchange', rota);
$('#btMenu').addEventListener('click', () => document.body.classList.toggle('menu-aberto'));
window.addEventListener('storage', e => { if (e.key === 'pol-geradores-projeto') { projeto = carregarProjeto(); atualizarContagem(); } });
rota();
