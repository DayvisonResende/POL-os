/* Gerador 14 · Lista de produção de imagens: o que existe, o que falta e o nome de arquivo padrão de cada uma.
   As metas vêm de docs/casos-da-cidade.md (seção 6). Os itens ficam no projeto (coleção "producao");
   os cartões dos outros geradores mandam itens para cá com o botão "+ produção". */
'use strict';

const CATEGORIAS_PRODUCAO = [
  { id: 'equipe', nome: 'Equipe (campanha + cidade)', meta: 7, arquivo: n => 'equipe-' + n + '.webp' },
  { id: 'chefao', nome: 'Chefões', meta: 5, arquivo: n => 'chefao-' + n + '.webp' },
  { id: 'tenente', nome: 'Tenentes', meta: 10, arquivo: n => 'tenente-' + n + '.webp' },
  { id: 'rosto', nome: 'Rostos genéricos', meta: 40, arquivo: (n, i) => 'rosto-' + U.pad(i, 3) + '.webp' },
  { id: 'lugar', nome: 'Lugares', meta: 12, arquivo: n => 'lugar-' + n + '.webp' },
  { id: 'emblema', nome: 'Emblemas', meta: 5, arquivo: n => 'emblema-' + n + '.webp' },
  { id: 'final', nome: 'Cenas de final', meta: 18, arquivo: n => 'final-' + n.replace(/^generico-/, '') + '.webp' },
  { id: 'cena', nome: 'Outras cenas', meta: 0, arquivo: n => 'cena-' + n + '.webp' },
];
const STATUS_PRODUCAO = { falta: 'Falta', prompt: 'Prompt pronto', gerada: 'Imagem gerada', aprovada: 'Aprovada', no_jogo: 'No jogo' };
// o que já existe hoje (Images/Arco1 e img/)
const JA_EXISTEM = [
  { categoria: 'equipe', nome: 'Beto', arquivo: 'Images/Arco1/Beto.png', status: 'gerada', prompt: PROMPT_BETO },
  { categoria: 'equipe', nome: 'Estagiária', arquivo: 'Images/Arco1/ (Estagiária)', status: 'gerada', prompt: '' },
  { categoria: 'equipe', nome: 'Estagiário', arquivo: 'Images/Arco1/ (Estagiário)', status: 'gerada', prompt: '' },
  { categoria: 'cena', nome: 'Logo do Pol-OS', arquivo: 'img/logo.webp', status: 'no_jogo', prompt: '' },
];
// item novo para a lista, com o nome de arquivo padrão (rostos numerados em sequência)
function novoItemProducao(projeto, { tipo, nome, arquivo, prompt }) {
  const cat = CATEGORIAS_PRODUCAO.find(c => c.id === tipo) || CATEGORIAS_PRODUCAO.find(c => c.id === 'cena');
  const doTipo = (projeto.producao || []).filter(x => x.categoria === cat.id);
  return { categoria: cat.id, nome: nome || cat.nome, arquivo: arquivo || cat.arquivo(U.arquivo(nome || 'sem-nome'), doTipo.length + 1), status: prompt ? 'prompt' : 'falta', prompt: prompt || '', criado_em: U.dataISO(new Date()) };
}
function resumoProducao(projeto) {
  const itens = projeto.producao || [];
  return CATEGORIAS_PRODUCAO.map(c => {
    const l = itens.filter(x => x.categoria === c.id), porStatus = {};
    Object.keys(STATUS_PRODUCAO).forEach(s => porStatus[s] = l.filter(x => x.status === s).length);
    return { id: c.id, nome: c.nome, meta: c.meta, total: l.length, prontas: porStatus.aprovada + porStatus.no_jogo, porStatus };
  });
}

registrarGerador({
  id: 'producao', numero: 14, grupo: 'Imagens', nome: 'Lista de produção', colecao: 'producao',
  descricao: 'O controle das imagens: quantas existem e quantas faltam em cada categoria (metas da seção 6 de casos-da-cidade.md), o status de cada uma e o nome de arquivo padrão. Para mudar o status, use a aba Projeto. "Preparar a lista" cria as vagas que faltam para você ir preenchendo.',
  campos: [
    { id: 'acao', rotulo: 'O que fazer', tipo: 'select', padrao: 'ver', opcoes: [['ver', 'Ver o andamento'], ['preparar', 'Preparar a lista (o que já existe + as vagas que faltam)']] },
  ],
  gerar(v, ctx) {
    const pr = ctx.projeto, novos = [];
    if (v.acao === 'preparar') {
      const temp = { producao: (pr.producao || []).slice() };
      JA_EXISTEM.forEach(x => { if (!temp.producao.some(y => y.nome === x.nome && y.categoria === x.categoria)) { const it = Object.assign({ criado_em: U.dataISO(new Date()) }, x); temp.producao.push(it); novos.push(it); } });
      const vagas = { chefao: FACCOES_PADRAO.map(f => f.id), emblema: FACCOES_PADRAO.map(f => f.id), tenente: [].concat(...FACCOES_PADRAO.map(f => [f.id + '-1', f.id + '-2'])), lugar: PERFIS_BAIRRO.map(p => p.id).concat(['delegacia', 'sala-de-dados']),
        final: [].concat(...FACCOES_PADRAO.map(f => ['completo', 'parcial', 'fracasso'].map(t => f.id + '-' + t))).concat(['generico-completo', 'generico-parcial', 'generico-fracasso']), equipe: ['chefe', 'parceiro', 'perito', 'analista'], rosto: [] };
      Object.keys(vagas).forEach(cat => vagas[cat].forEach(nome => {
        if (temp.producao.some(y => y.categoria === cat && y.nome === nome)) return;
        const it = novoItemProducao(temp, { tipo: cat, nome }); temp.producao.push(it); novos.push(it);
      }));
      const faltamRostos = 40 - temp.producao.filter(x => x.categoria === 'rosto').length;
      for (let i = 0; i < faltamRostos; i++) { const it = novoItemProducao(temp, { tipo: 'rosto', nome: 'rosto ' + U.pad(temp.producao.filter(x => x.categoria === 'rosto').length + 1, 3) }); temp.producao.push(it); novos.push(it); }
      return {
        resumo: novos.length + ' item(ns) para acrescentar à lista. Clique em "Salvar tudo no projeto" para guardar.',
        avisos: ['As vagas de rosto usam rosto-001.webp em diante. Para preencher uma vaga, gere o prompt (gerador 1 ou 13) e use "+ produção", ou mude o status direto na aba Projeto.'],
        itens: novos, colecao: 'producao',
        cartoes: [{ titulo: 'Itens novos', subtitulo: novos.length + ' itens', html: '<ul>' + CATEGORIAS_PRODUCAO.map(c => [c, novos.filter(x => x.categoria === c.id).length]).filter(x => x[1]).map(([c, n]) => '<li>' + c.nome + ': ' + n + '</li>').join('') + '</ul>' }],
        tabelas: [{ nome: 'producao', colunas: ['categoria', 'nome', 'arquivo', 'status'], linhas: novos }],
        texto: novos.map(x => '- [' + x.categoria + '] ' + x.nome + ' → ' + x.arquivo + ' (' + STATUS_PRODUCAO[x.status] + ')').join('\n'),
      };
    }
    const res = resumoProducao(pr), itens = pr.producao || [];
    const barra = (n, meta) => meta ? '<div class="barra"><span style="width:' + Math.min(100, Math.round(n * 100 / meta)) + '%"></span></div>' : '';
    return {
      resumo: itens.length + ' imagem(ns) na lista; ' + itens.filter(x => ['aprovada', 'no_jogo'].includes(x.status)).length + ' aprovadas ou no jogo. Meta total: cerca de 85 a 95.',
      avisos: itens.length ? [] : ['A lista está vazia. Escolha "Preparar a lista" e salve no projeto.'],
      itens: [], colecao: null,
      cartoes: res.map(r => ({ titulo: r.nome, subtitulo: r.prontas + ' prontas de ' + (r.meta || r.total) + (r.meta ? ' (meta)' : ''), html: barra(r.prontas, r.meta) + '<p>' + Object.keys(STATUS_PRODUCAO).filter(s => r.porStatus[s]).map(s => STATUS_PRODUCAO[s] + ': ' + r.porStatus[s]).join(' · ') + '</p>' })),
      tabelas: [{ nome: 'producao', colunas: ['id', 'categoria', 'nome', 'arquivo', 'status', 'prompt'], linhas: itens.map(x => Object.assign({}, x, { status: STATUS_PRODUCAO[x.status] || x.status })) }],
      texto: res.map(r => r.nome + ': ' + r.prontas + '/' + (r.meta || r.total)).join('\n') + '\n\n' + itens.filter(x => !['aprovada', 'no_jogo'].includes(x.status)).map(x => '- [ ] ' + x.arquivo + ' (' + STATUS_PRODUCAO[x.status] + ')').join('\n'),
    };
  },
});
