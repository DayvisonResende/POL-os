/* Gerador 9 · Facções e chefões. Facção = Especialidade + Chefão + Hierarquia + Assinatura nos dados + Arco + Reação.
   Parte de uma das cinco aprovadas (o nome fica) ou cria uma nova, com nomes candidatos já verificados. */
'use strict';

// imagem do emblema de cada facção aprovada (símbolo inventado, sem letras)
const EMBLEMA_FACCAO = {
  livro_caixa: { temaEn: 'an old ledger and coins', simboloEn: 'open ledger with a coin on it' },
  atravessadores: { temaEn: 'crossing roads and a wheel', simboloEn: 'cargo truck wheel over two crossing roads' },
  balcao: { temaEn: 'an old service counter bell and a rubber stamp', simboloEn: 'counter bell beside a rubber stamp' },
  fantasmas: { temaEn: 'a hollow mask', simboloEn: 'blank hollow mask with empty eyes' },
  mare: { temaEn: 'a wave and an anchor', simboloEn: 'anchor wrapped by a rising wave' },
};
// especialidades para facções novas (crimes do catálogo que as cinco não cobrem)
const NOVAS_ESPECIALIDADES = [
  { id: 'apostas', especialidade: 'bancas de apostas ilegais', crimes: ['apostas'], tecnica: 'pivot', assinatura: 'prêmios que só saem para contas ligadas à própria banca', lugar: 'historico', temaEn: 'dice and a spinning wheel', simboloEn: 'cracked die', palavras: [['Banca', 'f', 'Bancas'], ['Roleta', 'f', 'Roletas'], ['Sorte', 'f', 'Sortes'], ['Bilhete', 'm', 'Bilhetes']] },
  { id: 'cadeira_vazia', especialidade: 'benefícios e salários de quem não existe', crimes: ['beneficio_falecido', 'servidor_fantasma'], tecnica: 'antijoin', assinatura: 'gente que recebe todo mês sem nunca aparecer em lugar nenhum', lugar: 'governo', temaEn: 'an empty office chair', simboloEn: 'empty chair silhouette', palavras: [['Cadeira', 'f', 'Cadeiras'], ['Folha', 'f', 'Folhas'], ['Ausente', 'm', 'Ausentes'], ['Crachá', 'm', 'Crachás']] },
  { id: 'espelho', especialidade: 'clonagem de placas e fraude de seguro', crimes: ['clonagem_placa', 'fraude_seguro'], tecnica: 'selfjoin_tempo', assinatura: 'o mesmo carro em dois lugares ao mesmo tempo', lugar: 'rodoviaria', temaEn: 'mirrored car silhouettes', simboloEn: 'two overlapping car silhouettes facing opposite ways', palavras: [['Espelho', 'm', 'Espelhos'], ['Gêmeo', 'm', 'Gêmeos'], ['Reflexo', 'm', 'Reflexos'], ['Sombra', 'f', 'Sombras']] },
  { id: 'maquininha', especialidade: 'cartões clonados e contas falsas', crimes: ['cartao_clonado', 'contas_falsas', 'ingressos_falsos'], tecnica: 'ranking', assinatura: 'compras em duas cidades com minutos de diferença, sempre depois do mesmo terminal', lugar: 'financeiro', temaEn: 'a card reader and a magnet', simboloEn: 'magnet over a blank card', palavras: [['Maquininha', 'f', 'Maquininhas'], ['Ímã', 'm', 'Ímãs'], ['Tarja', 'f', 'Tarjas'], ['Vitrine', 'f', 'Vitrines']] },
  { id: 'formigueiro', especialidade: 'pirâmides e "investimentos" milagrosos', crimes: ['piramide', 'aluguel_falso'], tecnica: 'cte_recursiva', assinatura: 'quem entra paga quem entrou antes, até a base parar de crescer', lugar: 'universitario', temaEn: 'an anthill and a golden coin', simboloEn: 'stylized anthill shaped like a pyramid', palavras: [['Formigueiro', 'm', 'Formigueiros'], ['Degrau', 'm', 'Degraus'], ['Colmeia', 'f', 'Colmeias'], ['Escada', 'f', 'Escadas']] },
];
function apelidoDe(rng, p) {
  const primeiro = p.nome.split(' ')[0], ultimo = p.nome.split(' ').slice(-1)[0], f = p.genero === 'F';
  return U.pick(rng, f ? ['Madrinha', 'Baronesa', 'Dona ' + primeiro, 'Doutora ' + ultimo, 'a Viúva', 'Tia ' + primeiro] : ['Padrinho', 'Barão', 'Seu ' + primeiro, 'Doutor ' + ultimo, 'o Velho ' + primeiro, 'Tio ' + primeiro]);
}
function membro(p, papel, extra) { return Object.assign({ nome: p.nome, cpf: p.cpf, idade: p.idade, genero: p.genero, profissao: p.profissao, bairro: p.bairro, papel }, extra || {}); }
function nomesCandidatos(rng, palavras, n) {
  const out = new Set();
  for (let t = 0; out.size < n && t < 60; t++) {
    const [pal, g, plural] = U.pick(rng, palavras);
    out.add(U.pick(rng, [art(g) + ' ' + pal, art(g, true) + ' ' + plural, art(g) + ' ' + pal + ' ' + adjetivo(rng, g, false)]));
  }
  return [...out].map(nome => Object.assign({ nome }, verificarNome(nome)));
}

function criarFaccao(rng, o, projeto) {
  const novos = [];
  const padrao = FACCOES_PADRAO.find(f => f.id === o.base);
  const esp = padrao ? null : (NOVAS_ESPECIALIDADES.find(e => e.id === o.especialidade) || U.pick(rng, NOVAS_ESPECIALIDADES));
  let nome, candidatos = [];
  if (padrao) nome = padrao.nome;
  else { candidatos = nomesCandidatos(rng, esp.palavras, 6); nome = (candidatos.find(c => c.nivel === 'ok') || candidatos[0]).nome; }
  const base = padrao || esp;
  const emb = padrao ? EMBLEMA_FACCAO[padrao.id] : { temaEn: esp.temaEn, simboloEn: esp.simboloEn };
  const nova = p => { const x = criarPessoa(rng, Object.assign({ motor: o.motor }, p), projeto); novos.push(x); return x; };
  const chefe = nova({ papel: 'chefao', cenario: 'luxo' });
  const tenentes = [nova({ papel: 'tenente', cenario: base.lugar === 'porto' ? 'porto' : base.lugar === 'industrial' ? 'galpao' : 'escritorio' }), nova({ papel: 'tenente', cenario: 'rua' })];
  const operadores = Array.from({ length: o.operadores }, () => nova({ papel: 'operador' }));
  const laranjas = Array.from({ length: o.laranjas }, () => nova({ papel: 'laranja' }));
  const id = padrao ? padrao.id : U.slug(nome.replace(/^(O|A|Os|As) /, '')).replace(/\./g, '_');
  const fac = {
    id, base: base.id, padrao: !!padrao, nome, especialidade: base.especialidade, assinatura: base.assinatura, tecnica: base.tecnica, tecnica_nome: TECNICAS[base.tecnica].nome,
    crimes: base.crimes, lugar: base.lugar, temaEn: emb.temaEn, simboloEn: emb.simboloEn,
    chefao: membro(chefe, 'chefao', { apelido: apelidoDe(rng, chefe), fraqueza: chefe.fraqueza, descricao: chefe.descricao, prompt: chefe.prompt }),
    tenentes: tenentes.map(t => membro(t, 'tenente', { fraqueza: t.fraqueza, descricao: t.descricao, prompt: t.prompt })),
    operadores: operadores.map(p => membro(p, 'operador')), laranjas: laranjas.map(p => membro(p, 'laranja')),
    reacoes: U.amostra(rng, REACOES, 3), candidatos: candidatos.map(c => ({ nome: c.nome, nivel: c.nivel })),
    emblema_prompt: promptEmblema(emb, { motor: o.motor }),
  };
  novos.forEach(p => p.faccao = fac.nome);
  // o arco: uma ficha "arco" montada com esta facção (o chefão do arco é o desta facção)
  const comEla = Object.assign({}, projeto, { faccoes: ((projeto && projeto.faccoes) || []).filter(f => f.id !== fac.id).concat([fac]) });
  const ficha = criarFicha(rng, { tipo: 'arco', faccao: fac.id }, comEla);
  novos.push(...ficha._novos); delete ficha._novos;
  fac.arco = ficha.etapas.map(e => ({ etapa: e.etapa, degrau: e.degrau, titulo: e.titulo, crime: e.crime, tecnica: e.tecnica, nivel: e.nivel }));
  return { fac, novos };
}
function faccaoEmTexto(f) {
  const pessoa = p => p.nome + ', ' + p.idade + ' anos, ' + p.profissao;
  return ['# ' + f.nome + (f.padrao ? '' : ' (nova)'), 'Especialidade: ' + f.especialidade, 'Assinatura nos dados: ' + f.assinatura, 'Técnica principal: ' + f.tecnica_nome, '',
    '## Chefão', pessoa(f.chefao) + ' · apelido: "' + f.chefao.apelido + '"', 'Fraqueza: ' + f.chefao.fraqueza, f.chefao.descricao, '',
    '## Tenentes', ...f.tenentes.map(t => '- ' + pessoa(t) + ' · fraqueza: ' + t.fraqueza), '', '## Operadores', ...f.operadores.map(p => '- ' + pessoa(p)), '', '## Laranjas', ...f.laranjas.map(p => '- ' + pessoa(p)), '',
    '## Reações (quando o jogador chega perto)', ...f.reacoes.map(r => '- ' + r), '', '## Arco', ...f.arco.map(e => e.etapa + '. [' + e.degrau + '] ' + e.titulo + ' · ' + e.crime + ' · ' + e.tecnica),
    '', '## Imagens', 'chefao-' + U.arquivo(f.id) + '.webp:\n' + f.chefao.prompt, ...f.tenentes.map((t, i) => 'tenente-' + U.arquivo(f.id) + '-' + (i + 1) + '.webp:\n' + t.prompt), 'emblema-' + U.arquivo(f.id) + '.webp:\n' + f.emblema_prompt]
    .concat(f.candidatos.length ? ['', '## Nomes candidatos', ...f.candidatos.map(c => '- ' + c.nome + ' (' + c.nivel + ')')] : []).join('\n');
}

registrarGerador({
  id: 'faccoes', numero: 9, grupo: 'Casos e história', nome: 'Facções e chefões', colecao: 'faccoes',
  descricao: 'Monta uma facção pela receita: chefão com apelido e fraqueza humana, 2 tenentes, operadores e laranjas, assinatura nos dados, reações e o arco de 5 a 8 casos subindo a hierarquia, com os prompts do chefão, dos tenentes e do emblema. Parte de uma das cinco aprovadas ou cria uma nova.',
  campos: [
    { id: 'base', rotulo: 'Facção', tipo: 'select', padrao: 'livro_caixa', opcoes: FACCOES_PADRAO.map(f => [f.id, f.nome + ' (aprovada)']).concat([['nova', 'Criar uma nova']]) },
    { id: 'especialidade', rotulo: 'Especialidade (se for nova)', tipo: 'select', padrao: 'qualquer', opcoes: [['qualquer', 'Sortear']].concat(NOVAS_ESPECIALIDADES.map(e => [e.id, U.maiuscula(e.especialidade)])) },
    { id: 'operadores', rotulo: 'Operadores', tipo: 'numero', padrao: 3, min: 1, max: 10 },
    { id: 'laranjas', rotulo: 'Laranjas', tipo: 'numero', padrao: 4, min: 1, max: 20 },
    { id: 'motor', rotulo: 'Gerador de imagem', tipo: 'select', padrao: 'midjourney', opcoes: Object.keys(ESTILO.motores).map(k => [k, ESTILO.motores[k]]) },
  ],
  gerar(v, ctx) {
    const { fac, novos } = criarFaccao(ctx.rng, v, ctx.projeto);
    const ja = (ctx.projeto.faccoes || []).find(f => f.id === fac.id);
    const pessoa = p => U.esc(p.nome + ', ' + p.idade + ' anos, ' + p.profissao);
    return {
      resumo: fac.nome + ': chefão "' + fac.chefao.apelido + '", 2 tenentes, ' + fac.operadores.length + ' operadores, ' + fac.laranjas.length + ' laranjas e um arco de ' + fac.arco.length + ' casos.',
      avisos: (ja ? ['O projeto já tem uma versão de ' + fac.nome + '. Salvar agora guarda esta como outra (as fichas usam a primeira).'] : [])
        .concat(fac.padrao ? [] : ['Facção nova: confira o nome nos links de busca antes de adotar. Os outros candidatos estão no fim do texto.']),
      itens: [fac], colecao: 'faccoes', extras: [{ colecao: 'pessoas', itens: novos }],
      cartoes: [
        { titulo: fac.nome, subtitulo: fac.especialidade + ' · técnica: ' + fac.tecnica_nome, item: fac, colecao: 'faccoes', prompt: fac.emblema_prompt, producao: { tipo: 'emblema', nome: fac.id },
          html: '<p><b>Assinatura nos dados:</b> ' + U.esc(fac.assinatura) + '</p><p><b>Reações:</b> ' + fac.reacoes.map(U.esc).join('; ') + '</p><ol class="arco">' + fac.arco.map(e => '<li><b>[' + e.degrau + ']</b> ' + U.esc(e.titulo) + ' · ' + U.esc(e.crime) + ' · <i>' + U.esc(e.tecnica) + '</i></li>').join('') + '</ol>' +
            (fac.candidatos.length ? '<p class="links">' + linksDeBusca(fac.nome.replace(/^(O|A|Os|As) /, '')) + '</p>' : '') + '<p class="arquivo">Emblema: emblema-' + U.arquivo(fac.id) + '.webp</p>' },
        { titulo: '"' + fac.chefao.apelido + '" · ' + fac.chefao.nome, subtitulo: 'chefão · ' + fac.chefao.idade + ' anos · ' + fac.chefao.profissao + ' (fachada)', prompt: fac.chefao.prompt, producao: { tipo: 'chefao', nome: fac.id },
          html: '<p>' + U.esc(fac.chefao.descricao) + '</p><p><b>Fraqueza:</b> ' + U.esc(fac.chefao.fraqueza) + '</p><p class="arquivo">chefao-' + U.arquivo(fac.id) + '.webp</p>' },
      ].concat(fac.tenentes.map((t, i) => ({ titulo: t.nome, subtitulo: 'tenente ' + (i + 1) + ' · ' + t.idade + ' anos · ' + t.profissao, prompt: t.prompt, producao: { tipo: 'tenente', nome: fac.id + '-' + (i + 1) },
          html: '<p>' + U.esc(t.descricao) + '</p><p><b>Fraqueza:</b> ' + U.esc(t.fraqueza) + '</p><p class="arquivo">tenente-' + U.arquivo(fac.id) + '-' + (i + 1) + '.webp</p>' })))
        .concat([{ titulo: 'Operadores e laranjas', subtitulo: fac.operadores.length + ' + ' + fac.laranjas.length + ' pessoas', html: '<p><b>Operadores:</b><br>' + fac.operadores.map(pessoa).join('<br>') + '</p><p><b>Laranjas:</b><br>' + fac.laranjas.map(pessoa).join('<br>') + '</p>' }]),
      tabelas: [{ nome: 'membros', colunas: ['nome', 'cpf', 'idade', 'genero', 'profissao', 'bairro', 'papel'], linhas: [fac.chefao].concat(fac.tenentes, fac.operadores, fac.laranjas) },
                { nome: 'arco', colunas: ['etapa', 'degrau', 'titulo', 'crime', 'tecnica', 'nivel'], linhas: fac.arco }],
      texto: faccaoEmTexto(fac),
    };
  },
});
