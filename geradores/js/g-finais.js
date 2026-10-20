/* Gerador 10 · Finais: completo, parcial e fracasso (e o moral, só nos arcos de chefão).
   Final = Profundidade + Precisão + Escolha (docs/casos-da-cidade.md). gerarFinais() é usada pelas fichas. */
'use strict';

const TONS_FINAL = { celia: 'Fala da Célia (chat)', jornal: 'Jornal da cidade (manchete + texto)', relatorio: 'Relatório ao delegado' };
const CENA_FINAL_EN = {
  completo: 'plainclothes detectives escorting a well-dressed suspect out of {lugar} at dawn, evidence boxes being carried behind them',
  parcial: 'a minor accomplice being detained in the foreground while a figure in a dark coat slips away through a back door of {lugar} at night',
  fracasso: 'an empty precinct desk at night with a closed case folder with no readable text, cold coffee and rain on the window',
  moral: 'two silhouettes at a dimly lit table, a thick envelope slid halfway across, {lugar} visible through the window',
};
// texto de cada final em cada tom; {chefe} {operador} {laranja} {bairro} {valor} {faccao} {crime} {reacao} {errado}
const TEXTOS_FINAL = {
  completo: {
    celia: 'Célia: Fechou, recruta. {chefe} foi levado(a) hoje cedo, com tudo documentado: {valor} rastreados, de {laranja} até o topo. {faccao}Pode tomar esse café sem pressa.',
    jornal: 'PRESO(A) O CHEFE DO ESQUEMA DE {CRIME}\nA polícia prendeu {chefe}, apontado(a) como responsável pelo esquema que movimentou {valor} na região de {bairro}. As provas vieram do cruzamento de dados.',
    relatorio: 'Relatório: identificado(a) e indiciado(a) {chefe}, no topo da cadeia ({laranja} → {operador} → {chefe}). Valor apurado: {valor}. Provas anexadas; consultas de referência arquivadas. {faccao}',
  },
  parcial: {
    celia: 'Célia: Pegamos {operador}, e isso é bom. Mas {chefe} não aparece em nenhum papel que a gente tenha. Gente assim não some: muda de jeito. Já ouvi que {reacao}. Vamos nos ver de novo.',
    jornal: 'OPERADOR(A) DE ESQUEMA É PRESO(A); MANDANTE SEGUE SOLTO\n{operador} foi detido(a) em {bairro}. Investigadores admitem que o dinheiro, {valor}, seguia para alguém acima.',
    relatorio: 'Relatório: indiciado(a) {operador}. O vínculo com o mandante não foi demonstrado nos dados. Risco: o grupo {reacao}. Recomenda-se manter o caso aberto.',
  },
  fracasso: {
    celia: 'Célia: Recruta… a pessoa que você apontou, {errado}, tinha como provar onde estava. O caso foi arquivado e a Corregedoria quer conversar. E {chefe} agora sabe que estamos olhando.',
    jornal: 'INVESTIGAÇÃO ACUSA PESSOA ERRADA E CASO É ARQUIVADO\n{errado} foi liberado(a) após apresentar provas de que não tinha relação com o esquema de {crime} em {bairro}.',
    relatorio: 'Relatório: a acusação contra {errado} não se sustentou (álibi nos dados). Caso arquivado; encaminhado à Corregedoria. O grupo responsável segue ativo.',
  },
  moral: {
    celia: 'Célia: Eu vi o envelope, recruta. Talvez ninguém mais tenha visto. Hoje o caso fecha mais rápido. Amanhã {chefe} vai lembrar que você tem preço. E eu também.',
    jornal: 'CASO ENCERRADO ÀS PRESSAS LEVANTA SUSPEITAS\nO esquema de {crime} em {bairro} foi dado como resolvido, mas {chefe} não foi sequer ouvido(a). Fontes falam em acordo por fora.',
    relatorio: 'Relatório (anexo reservado): o investigador aceitou a proposta do grupo. Consequência futura: o grupo passa a contar com informação de dentro.',
  },
};
const CONDICAO_FINAL = {
  completo: f => 'Entregou ' + f.desfecho.map(d => d.charAt(0).toLowerCase() + d.slice(1)).join(' e ') + ' e chegou ao topo (' + f.hierarquia.chefe.nome + ') com ' + f.hierarquia.chefe.achado_com + '.',
  parcial: f => 'Parou um degrau abaixo: entregou ' + f.hierarquia.operador.nome + ' (achado com ' + f.hierarquia.operador.achado_com + '), mas não ligou ao chefe.',
  fracasso: f => 'Acusou ' + f.errado.nome + ' (' + f.errado.porque + ').',
  moral: () => 'Aceitou a oferta do grupo (a tentação aparece no meio do caso, numa mensagem ou num encontro).',
};
const CONSEQUENCIA_FINAL = {
  completo: f => f.faccao ? 'O mural de ' + f.faccao_nome + ' acende uma pista; a facção perde força.' : 'O caso fecha; o bairro fica mais tranquilo por um tempo.',
  parcial: f => f.hierarquia.chefe.nome + ' volta mais forte num caso futuro (' + f.reacao + ').',
  fracasso: () => 'Caso arquivado, a Corregedoria sobe e o chefe ganha confiança.',
  moral: () => 'Ganha no curto prazo (o caso fecha) e paga depois: o grupo passa a ter alguém "de dentro".',
};
function preencherFinal(txt, f) {
  const faccaoFrase = f.faccao ? 'O mural de ' + f.faccao_nome + ' ganhou mais uma peça. ' : '';
  return txt.replace(/\{chefe\}/g, f.hierarquia.chefe.nome).replace(/\{operador\}/g, f.hierarquia.operador.nome).replace(/\{laranja\}/g, f.hierarquia.laranja.nome)
    .replace(/\{bairro\}/g, f.bairro).replace(/\{valor\}/g, U.moeda(f.valor)).replace(/\{faccao\}/g, faccaoFrase).replace(/\{CRIME\}/g, f.crime.nome.toUpperCase())
    .replace(/\{crime\}/g, f.crime.nome.toLowerCase()).replace(/\{reacao\}/g, f.reacao).replace(/\{errado\}/g, f.errado.nome).trim();
}
// moral: 'auto' (só nos arcos de chefão), 'sempre', 'nunca'
function gerarFinais(rng, ficha, tom = 'celia', moral = 'auto', motor = 'midjourney') {
  const tipos = ['completo', 'parcial', 'fracasso'];
  if (moral === 'sempre' || (moral === 'auto' && ficha.tipo === 'arco')) tipos.push('moral');
  const perfil = PERFIS_BAIRRO.find(p => p.id === ficha.perfil);
  const lugarEn = perfil ? perfil.cenaEn : 'a city building';
  return tipos.map(t => ({
    tipo: t, condicao: CONDICAO_FINAL[t](ficha), texto: preencherFinal(TEXTOS_FINAL[t][TONS_FINAL[tom] ? tom : 'celia'], ficha), consequencia: CONSEQUENCIA_FINAL[t](ficha),
    prompt: promptCena(CENA_FINAL_EN[t].replace('{lugar}', lugarEn), { motor, paleta: t === 'completo' ? 'padrao' : 'noite' }),
    imagem: ficha.faccao ? 'final-' + U.arquivo(ficha.faccao) + '-' + t + '.webp' : 'final-' + t + '.webp',
  }));
}
function cartoesFinais(finais, ficha) {
  const nomes = { completo: 'Final completo', parcial: 'Final parcial', fracasso: 'Fracasso', moral: 'Final moral' };
  return finais.map(f => ({ titulo: nomes[f.tipo] + ' · ' + ficha.titulo, subtitulo: f.condicao, prompt: f.prompt, producao: { tipo: 'final', nome: (ficha.faccao || 'generico') + '-' + f.tipo, arquivo: f.imagem },
    html: '<pre class="fala">' + U.esc(f.texto) + '</pre><p><b>Consequência:</b> ' + U.esc(f.consequencia) + '</p><p class="arquivo">Imagem: ' + f.imagem + (ficha.faccao ? '' : ' (genérica, serve para todos os casos soltos)') + '</p>' }));
}

registrarGerador({
  id: 'finais', numero: 10, grupo: 'Casos e história', nome: 'Finais', colecao: null,
  descricao: 'Rascunho dos finais de um caso: completo, parcial e fracasso, cada um com a condição, o texto no tom escolhido, a consequência e o prompt da cena. O final moral entra só nos arcos de chefão (ou quando você pedir). Usa uma ficha do projeto ou sorteia uma.',
  campos: [
    { id: 'ficha', rotulo: 'Ficha de caso', tipo: 'projeto', colecao: 'fichas', padrao: '', vazio: 'Sortear uma ficha nova' },
    { id: 'crime', rotulo: 'Crime (se for sortear)', tipo: 'select', padrao: 'qualquer', opcoes: [['qualquer', 'Qualquer']].concat(CRIMES.map(c => [c.id, c.nome])) },
    { id: 'tom', rotulo: 'Tom do texto', tipo: 'select', padrao: 'celia', opcoes: Object.keys(TONS_FINAL).map(k => [k, TONS_FINAL[k]]) },
    { id: 'moral', rotulo: 'Final moral', tipo: 'select', padrao: 'auto', opcoes: [['auto', 'Só nos arcos de chefão (recomendado)'], ['sempre', 'Sempre'], ['nunca', 'Nunca']] },
    { id: 'motor', rotulo: 'Gerador de imagem', tipo: 'select', padrao: 'midjourney', opcoes: Object.keys(ESTILO.motores).map(k => [k, ESTILO.motores[k]]) },
  ],
  gerar(v, ctx) {
    let ficha = (ctx.projeto.fichas || []).find(f => f.id === v.ficha), extras = [];
    if (!ficha) { ficha = criarFicha(ctx.rng, { crime: v.crime, tipo: 'solto', dificuldade: 'qualquer' }, ctx.projeto); extras = ficha._novos.length ? [{ colecao: 'pessoas', itens: ficha._novos }] : []; delete ficha._novos; }
    const finais = gerarFinais(ctx.rng, ficha, v.tom, v.moral, v.motor);
    return {
      resumo: finais.length + ' finais para "' + ficha.titulo + '" (' + ficha.crime.nome + ').',
      avisos: v.moral === 'sempre' && ficha.tipo !== 'arco' ? ['O final moral pesa mais quando é raro: a regra é deixá-lo só nos arcos de chefão.'] : [],
      itens: [], colecao: null, extras,
      cartoes: cartoesFinais(finais, ficha),
      tabelas: [{ nome: 'finais', colunas: ['tipo', 'condicao', 'texto', 'consequencia', 'imagem', 'prompt'], linhas: finais }],
      texto: '# Finais · ' + ficha.titulo + '\n\n' + finais.map(f => '## ' + f.tipo + '\nCondição: ' + f.condicao + '\n\n' + f.texto + '\n\nConsequência: ' + f.consequencia + '\nImagem: ' + f.imagem + '\nPrompt: ' + f.prompt).join('\n\n'),
    };
  },
});
