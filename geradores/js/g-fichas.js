/* Gerador 8 · Fichas de caso: sorteia a fórmula (Crime + Rastro + Técnica + Armadilha + Escala + Desfecho)
   só com peças que combinam entre si, monta a hierarquia (laranja → operador → chefe, cada degrau pede SQL mais difícil)
   e devolve a ficha no formato de docs/casos-da-cidade.md. Arco: 5 a 8 casos lineares subindo a hierarquia. */
'use strict';

const TIPOS_FICHA = { solto: 'Caso solto', fragmento: 'Fragmento de facção', arco: 'Arco de chefão (5 a 8 casos)' };
const ESTRELAS = n => '★'.repeat(n) + '☆'.repeat(5 - n);
// valores e quantidades por gravidade do crime
const PORTE = { 1: { valor: [300, 3000], qtd: [3, 12], dias: [3, 10] }, 2: { valor: [8000, 250000], qtd: [5, 60], dias: [5, 30] }, 3: { valor: [300000, 9000000], qtd: [8, 200], dias: [15, 90] }, 4: { valor: [5000000, 80000000], qtd: [10, 120], dias: [60, 365] } };
// técnica de cada degrau: o laranja aparece com filtro, o operador com JOIN/agrupamento, o chefe com a técnica forte
const DEGRAU_TECNICAS = { laranja: ['filtro'], operador: ['join', 'agrupar', 'janela_tempo', 'antijoin'] };

function faccoesDisponiveis(projeto) {
  const doProjeto = (projeto && projeto.faccoes) || [];
  return FACCOES_PADRAO.map(f => doProjeto.find(p => p.base === f.id && p.padrao) || f).concat(doProjeto.filter(p => !p.padrao));
}
function escolherCrime(rng, o, faccao) {
  if (o.crime && o.crime !== 'qualquer') return CRIMES.find(c => c.id === o.crime);
  let l = CRIMES.slice();
  if (faccao) { const f = l.filter(c => (faccao.crimes || []).includes(c.id) || (c.faccao && (c.faccao === faccao.id || c.faccao === faccao.base))); if (f.length) l = f; }
  const d = +o.dificuldade;
  if (d) { const f = l.filter(c => d <= 2 ? c.gravidade <= 2 : d === 3 ? c.gravidade >= 2 && c.gravidade <= 3 : c.gravidade >= 3); if (f.length) l = f; }
  if (o.perfil && o.perfil !== 'qualquer') { const f = l.filter(c => c.perfis.includes(o.perfil)); if (f.length) l = f; }
  return U.pick(rng, l);
}
// técnica principal: a do crime mais perto da dificuldade pedida
function tecnicaPrincipal(rng, crime, dificuldade, faccao) {
  const ids = crime.tecnicas.concat(faccao && faccao.tecnica && !crime.tecnicas.includes(faccao.tecnica) ? [faccao.tecnica] : []);
  if (!dificuldade) return U.pick(rng, crime.tecnicas);
  return ids.slice().sort((a, b) => Math.abs(TECNICAS[a].nivel - dificuldade) - Math.abs(TECNICAS[b].nivel - dificuldade))[0];
}
function bairroDoCaso(rng, crime, projeto, perfil) {
  const perfis = perfil && perfil !== 'qualquer' ? [perfil] : crime.perfis;
  const l = ((projeto && projeto.bairros) || []).filter(b => perfis.includes(b.perfil));
  if (l.length) { const b = U.pick(rng, l); return { nome: b.nome, perfil: b.perfil }; }
  const pf = PERFIS_BAIRRO.find(p => p.id === U.pick(rng, perfis)) || U.pick(rng, PERFIS_BAIRRO);
  return { nome: U.pick(rng, pf.prefixos) + ' ' + U.pick(rng, pf.nomes), perfil: pf.id };
}
function frasePreenchida(crime, valor, qtd, dias, bairro) {
  return crime.frase.replace('{valor}', U.moeda(valor)).replace('{qtd}', qtd).replace('{dias}', dias).replace('{bairro}', bairro);
}
function pessoaDoCaso(rng, papel, projeto, novos, faccao) {
  // o chefe e os tenentes de uma facção salva no projeto são sempre os mesmos
  if (faccao && papel === 'chefao' && faccao.chefao) return faccao.chefao;
  if (faccao && papel === 'tenente' && faccao.tenentes && faccao.tenentes.length) return U.pick(rng, faccao.tenentes);
  const p = criarPessoa(rng, { papel }, projeto); novos.push(p); return p;
}

// o: {tipo, crime, faccao, dificuldade, perfil}
function criarFicha(rng, o, projeto) {
  const tipo = TIPOS_FICHA[o.tipo] ? o.tipo : 'solto', novos = [];
  const faccoes = faccoesDisponiveis(projeto);
  let faccao = null;
  if (tipo !== 'solto' || (o.faccao && o.faccao !== 'nenhuma')) faccao = faccoes.find(f => f.id === o.faccao) || (tipo !== 'solto' ? U.pick(rng, faccoes) : null);
  const crime = escolherCrime(rng, o, faccao);
  const porte = PORTE[crime.gravidade];
  const dificuldade = +o.dificuldade || Math.min(5, Math.max(1, crime.gravidade + U.int(rng, 0, 1)));
  const tecId = tecnicaPrincipal(rng, crime, dificuldade, faccao), tec = TECNICAS[tecId];
  const armId = U.pick(rng, crime.armadilhas), arm = ARMADILHAS[armId];
  const escalaId = dificuldade <= 2 ? 'bairro' : dificuldade === 3 ? 'cidade' : 'estado', escala = ESCALAS[escalaId];
  const b = bairroDoCaso(rng, crime, projeto, o.perfil);
  const faixa = crime.valor || porte.valor, valor = Math.round(U.real(rng, faixa[0], faixa[1]) / 10) * 10, qtd = U.int(rng, porte.qtd[0], porte.qtd[1]), dias = U.int(rng, porte.dias[0], porte.dias[1]);
  // hierarquia: no caso solto pequeno o "chefe" é o próprio autor
  const topo = tipo === 'arco' ? 'chefao' : faccao ? 'tenente' : crime.gravidade >= 3 ? 'chefao' : 'suspeito';
  const tecOperador = DEGRAU_TECNICAS.operador.filter(t => TECNICAS[t].nivel <= Math.max(2, tec.nivel - 1));
  const hier = {
    laranja: Object.assign({ papel: 'laranja' }, pick3(pessoaDoCaso(rng, 'laranja', projeto, novos)), { achado_com: TECNICAS.filtro.nome.toLowerCase() }),
    operador: Object.assign({ papel: 'operador' }, pick3(pessoaDoCaso(rng, 'operador', projeto, novos)), { achado_com: TECNICAS[U.pick(rng, tecOperador)].nome }),
    chefe: Object.assign({ papel: topo }, pick3(pessoaDoCaso(rng, topo, projeto, novos, faccao)), { achado_com: tec.nome }),
  };
  // quem o jogador pode acusar errado (a armadilha decide quem)
  let errado;
  if (armId === 'homonimo') errado = { nome: hier.chefe.nome + ' (o homônimo)', porque: 'mesmo nome, outro CPF: filtrou pelo nome em vez do documento' };
  else if (armId === 'laranja') errado = { nome: hier.laranja.nome, porque: 'parou no titular da conta, que só emprestou o nome' };
  else { const inocente = criarPessoa(rng, { papel: 'suspeito' }, projeto); novos.push(inocente); errado = { nome: inocente.nome, porque: armId === 'pista_falsa' ? 'era o suspeito óbvio, mas os dados mostram que estava em outro lugar' : 'caiu na armadilha (' + arm.nome.toLowerCase() + ') e o número apontou para a pessoa errada' }; }
  const tabelas = [].concat(...crime.rastros.map(r => RASTROS[r].tabelas));
  const ficha = {
    titulo: U.maiuscula(nomeDeCaso(rng, TEMA_DO_CRIME[crime.id], U.pickW(rng, [['manchete', 6], ['capitulo', 3], ['operacao', 1]]))),
    tipo, tipo_nome: TIPOS_FICHA[tipo], faccao: faccao ? faccao.id : '', faccao_nome: faccao ? faccao.nome : '',
    dificuldade, estrelas: ESTRELAS(dificuldade), bairro: b.nome, perfil: b.perfil,
    crime: { id: crime.id, nome: crime.nome, gravidade: crime.gravidade }, frase: frasePreenchida(crime, valor, qtd, dias, b.nome),
    rastros: crime.rastros.map(r => RASTROS[r].nome), tabelas,
    tecnica: { id: tecId, nome: tec.nome, nivel: tec.nivel, modulo: tec.modulo, sql: tec.sql },
    armadilha: { id: armId, nome: arm.nome, como: arm.como },
    escala: { id: escalaId, nome: escala.nome, linhas: U.int(rng, escala.linhas[0], escala.linhas[1]), tabelas: Math.max(tabelas.length, U.int(rng, escala.tabelas[0], escala.tabelas[1])) },
    desfecho: crime.desfechos.map(d => DESFECHOS[d]), valor, qtd, dias,
    hierarquia: hier, errado, reacao: U.pick(rng, REACOES),
    variacao: 'Mudam com a semente: nomes e CPFs dos envolvidos, ' + (porte.valor[1] > 3000 ? 'valores, ' : '') + 'bairro, datas e horários. Ficam fixos: o padrão (' + tec.nome.toLowerCase() + ') e a armadilha.',
    imagens: imagensDaFicha(tipo, faccao, b.perfil, topo),
    testes: ['A resposta é única? (só uma pessoa / um valor satisfaz todas as condições)', 'Dá para acertar por sorte ou olhando a tabela inteira? (escala de ' + escala.nome.toLowerCase() + ' deve impedir)', 'A consulta ingênua, que cai na armadilha (' + arm.nome.toLowerCase() + '), dá uma resposta diferente da certa?', 'A consulta de referência (' + tec.nome + ') passa e é a única forma razoável de chegar?', 'Nenhum dado fica de fora por NULL sem querer?'],
    _novos: novos,
  };
  ficha.finais = gerarFinais(rng, ficha, 'celia', 'auto');
  if (tipo === 'arco') ficha.etapas = etapasDoArco(rng, ficha, faccao);
  return ficha;
}
function pick3(p) { return { nome: p.nome, cpf: p.cpf, idade: p.idade, profissao: p.profissao }; }
function imagensDaFicha(tipo, faccao, perfil, topo) {
  const l = ['lugar: ' + (PERFIS_BAIRRO.find(p => p.id === perfil) || {}).nome + ' (do banco de lugares)', 'rostos: ' + (tipo === 'solto' ? '2 a 3' : '3 a 4') + ' do banco de rostos genéricos'];
  if (faccao) l.push(topo === 'chefao' ? 'chefão de ' + faccao.nome + ' (chefao-' + U.arquivo(faccao.id) + '.webp)' : 'tenente de ' + faccao.nome + ' (tenente-' + U.arquivo(faccao.id) + '-1.webp)', 'emblema de ' + faccao.nome + ' (emblema-' + U.arquivo(faccao.id) + '.webp)');
  if (tipo === 'arco') l.push('cenas de final do arco: completo, parcial e fracasso (final-' + U.arquivo(faccao.id) + '-*.webp)');
  else l.push('final: as 3 cenas genéricas (final-completo/parcial/fracasso.webp)');
  return l;
}
// arco: cada etapa sobe um degrau e pede uma técnica mais forte
function etapasDoArco(rng, ficha, faccao) {
  const n = U.int(rng, 5, 8), degraus = [];
  for (let i = 0; i < n; i++) degraus.push(i === n - 1 ? 'chefão' : i >= n - 3 ? 'tenente' : i >= Math.floor(n / 3) ? 'operador' : 'laranja');
  const crimes = CRIMES.filter(c => (faccao.crimes || []).includes(c.id) || c.faccao === faccao.id);
  const porNivel = Object.keys(TECNICAS).sort((a, b) => TECNICAS[a].nivel - TECNICAS[b].nivel);
  return degraus.map((d, i) => {
    const c = crimes.length ? crimes[i % crimes.length] : CRIMES.find(x => x.id === ficha.crime.id);
    const nivelAlvo = Math.min(5, 1 + Math.round(i * 4 / (n - 1)));
    const tec = i === n - 1 && faccao.tecnica ? faccao.tecnica : (c.tecnicas.find(t => TECNICAS[t].nivel === nivelAlvo) || porNivel.find(t => TECNICAS[t].nivel === nivelAlvo) || c.tecnicas[0]);
    return { etapa: i + 1, degrau: d, titulo: U.maiuscula(nomeDeCaso(rng, TEMA_DO_CRIME[c.id], 'capitulo')), crime: c.nome, tecnica: TECNICAS[tec].nome, nivel: TECNICAS[tec].nivel,
      alvo: d === 'chefão' ? ficha.hierarquia.chefe.nome : d === 'tenente' ? 'um(a) tenente de ' + faccao.nome : d === 'operador' ? 'um(a) operador(a)' : 'um laranja' };
  });
}
function fichaEmTexto(f) {
  const h = f.hierarquia, linha = (r, t) => (r + ' ').padEnd(21, '.') + ' ' + t;
  const out = ['FICHA DO CASO', '─'.repeat(45), linha('Título', f.titulo), linha('Tipo', f.tipo_nome), linha('Facção', f.faccao_nome || '(nenhuma)'), linha('Dificuldade', f.estrelas), linha('Bairro / cidade', f.bairro), '',
    linha('1. CRIME', f.frase), linha('2. RASTRO', f.rastros.join(', ')), '     tabelas: ' + f.tabelas.join('; '), linha('3. TÉCNICA', f.tecnica.nome + ' (nível ' + f.tecnica.nivel + ', ' + (f.tecnica.modulo <= 5 ? 'ensinada no Módulo ' + f.tecnica.modulo : 'além da campanha') + ')'), '     ' + f.tecnica.sql,
    linha('4. ARMADILHA', f.armadilha.nome + ': ' + f.armadilha.como), linha('5. ESCALA', f.escala.nome + ': ~' + f.escala.linhas.toLocaleString('pt-BR') + ' linhas, ' + f.escala.tabelas + ' tabelas'), linha('6. DESFECHO', f.desfecho.join(' + ')), '',
    '7. HIERARQUIA', '   - laranja ......... ' + h.laranja.nome + ', ' + h.laranja.idade + ' anos, ' + h.laranja.profissao + ' · achado com ' + h.laranja.achado_com,
    '   - operador ........ ' + h.operador.nome + ', ' + h.operador.idade + ' anos, ' + h.operador.profissao + ' · achado com ' + h.operador.achado_com,
    '   - ' + (h.chefe.papel === 'chefao' ? 'chefe ...........' : h.chefe.papel === 'tenente' ? 'tenente .........' : 'autor ...........') + ' ' + h.chefe.nome + ', ' + h.chefe.idade + ' anos, ' + h.chefe.profissao + ' · achado com ' + h.chefe.achado_com, '',
    '8. FINAIS'].concat(f.finais.map(x => '   - ' + (x.tipo + ' ').padEnd(16, '.') + ' ' + x.condicao + '\n       → ' + x.consequencia))
    .concat(['', linha('9. VARIAÇÃO', f.variacao), '', '10. IMAGENS'].concat(f.imagens.map(i => '   - ' + i)), ['', '11. TESTES'].concat(f.testes.map(t => '   [ ] ' + t)));
  if (f.etapas) out.push('', 'ARCO (' + f.etapas.length + ' casos)', ...f.etapas.map(e => '   ' + e.etapa + '. [' + e.degrau + '] "' + e.titulo + '" · ' + e.crime + ' · ' + e.tecnica + ' (nível ' + e.nivel + ') · alvo: ' + e.alvo));
  return out.join('\n');
}

registrarGerador({
  id: 'fichas', numero: 8, grupo: 'Casos e história', nome: 'Fichas de caso', colecao: 'fichas',
  descricao: 'O sorteador da fórmula: escolhe peças que combinam (o crime decide os rastros, as técnicas e as armadilhas possíveis), monta os envolvidos de cada degrau e os finais, e devolve a ficha pronta como rascunho, no formato de docs/casos-da-cidade.md. Você descarta, ajusta e escolhe.',
  campos: [
    { id: 'quantidade', rotulo: 'Quantas fichas', tipo: 'numero', padrao: 3, min: 1, max: 50 },
    { id: 'tipo', rotulo: 'Tipo', tipo: 'select', padrao: 'solto', opcoes: Object.keys(TIPOS_FICHA).map(k => [k, TIPOS_FICHA[k]]) },
    { id: 'faccao', rotulo: 'Facção', tipo: 'select', padrao: 'qualquer', opcoes: [['qualquer', 'Sortear (só fragmento e arco)'], ['nenhuma', 'Nenhuma']].concat(FACCOES_PADRAO.map(f => [f.id, f.nome])) },
    { id: 'dificuldade', rotulo: 'Dificuldade', tipo: 'select', padrao: 'qualquer', opcoes: [['qualquer', 'Conforme o crime'], ['1', '★ (Módulos 1–2)'], ['2', '★★ (Módulos 3–4)'], ['3', '★★★'], ['4', '★★★★'], ['5', '★★★★★']] },
    { id: 'crime', rotulo: 'Crime', tipo: 'select', padrao: 'qualquer', opcoes: [['qualquer', 'Sortear']].concat(CRIMES.map(c => [c.id, c.nome + ' (gravidade ' + c.gravidade + ')'])) },
    { id: 'perfil', rotulo: 'Tipo de bairro', tipo: 'select', padrao: 'qualquer', opcoes: [['qualquer', 'Conforme o crime']].concat(PERFIS_BAIRRO.map(p => [p.id, p.nome])) },
  ],
  gerar(v, ctx) {
    const fichas = [], novos = [];
    for (let i = 0; i < v.quantidade; i++) { const f = criarFicha(ctx.rng, v, ctx.projeto); novos.push(...f._novos); delete f._novos; f.texto = fichaEmTexto(f); fichas.push(f); }
    return {
      resumo: fichas.length + ' ficha(s): ' + fichas.map(f => '"' + f.titulo + '"').join(', ') + '.',
      avisos: ['É rascunho: confira se a história fecha antes de virar caso. Os envolvidos foram criados agora; salvar no projeto guarda também essas pessoas.'],
      itens: fichas, colecao: 'fichas', extras: novos.length ? [{ colecao: 'pessoas', itens: novos }] : [],
      cartoes: fichas.map(f => ({ titulo: f.titulo, subtitulo: f.tipo_nome + (f.faccao_nome ? ' · ' + f.faccao_nome : '') + ' · ' + f.estrelas + ' · ' + f.crime.nome + ' · ' + f.bairro, item: f, colecao: 'fichas', html: '<pre class="ficha-caso">' + U.esc(f.texto) + '</pre>' })),
      tabelas: [{ nome: 'fichas', colunas: ['titulo', 'tipo', 'faccao', 'dificuldade', 'bairro', 'crime', 'tecnica', 'armadilha', 'valor', 'frase'], linhas: fichas.map(f => ({ titulo: f.titulo, tipo: f.tipo, faccao: f.faccao, dificuldade: f.dificuldade, bairro: f.bairro, crime: f.crime.nome, tecnica: f.tecnica.nome, armadilha: f.armadilha.nome, valor: f.valor, frase: f.frase })) }],
      texto: fichas.map(f => f.texto).join('\n\n\n'),
    };
  },
});
