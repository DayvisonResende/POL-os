/* Gerador 7 · Nomes de casos: "O dízimo do porto", "Operação Balança Viciada", "Os herdeiros do nada".
   Concordância de gênero e número; cada nome passa pelo verificador (gerador 11). nomeDeCaso() é usada pelas fichas. */
'use strict';

const ESTILOS_NOME = { operacao: 'Nome de operação ("Operação Balança Viciada")', manchete: 'Manchete ("O dízimo do porto")', apelido: 'Apelido do bando ("Os Cupins de Papel")', capitulo: 'Título de capítulo ("A gaveta que mentia")' };
// "do porto", "da prefeitura": onde a coisa acontece, por tema
const COMPLEMENTOS_CASO = {
  porto: [['Porto', 'm'], ['Cais', 'm'], ['Baía', 'f'], ['Alfândega', 'f'], ['Armazém 7', 'm']],
  dinheiro: [['Caixa Dois', 'm'], ['Cofre', 'm'], ['Tesouraria', 'f'], ['Contabilidade', 'f'], ['Agência', 'f']],
  estrada: [['Rodovia', 'f'], ['Km 40', 'm'], ['Serra', 'f'], ['Marginal', 'f'], ['Pedágio', 'm']],
  governo: [['Prefeitura', 'f'], ['Câmara', 'f'], ['Secretaria', 'f'], ['Palácio', 'm'], ['Almoxarifado', 'm']],
  digital: [['Rede', 'f'], ['Aplicativo', 'm'], ['Grupo da Família', 'm'], ['Central', 'f'], ['Madrugada', 'f']],
  rua: [['Praia', 'f'], ['Feira', 'f'], ['Rodoviária', 'f'], ['Esquina', 'f'], ['Calçadão', 'm']],
  natureza: [['Nada', 'm'], ['Vento', 'm'], ['Sereno', 'm'], ['Quintal', 'm'], ['Brejo', 'm']],
};
const art = (g, plural) => g === 'f' ? (plural ? 'As' : 'A') : (plural ? 'Os' : 'O');
const de = g => g === 'f' ? 'da' : 'do';
function pluralAdj(a) {
  if (/^de |^Sem /.test(a)) return a;
  if (/vel$/.test(a)) return a.replace(/vel$/, 'veis');
  if (/l$/.test(a)) return a.replace(/l$/, 'is');
  return a + 's';
}
function adjetivo(rng, genero, plural) { const a = U.pick(rng, ADJETIVOS_CASO)[genero === 'f' ? 1 : 0]; return plural ? pluralAdj(a) : a; }
// Um nome no estilo pedido. tema: chave de PALAVRAS_CASO (ou 'qualquer').
function nomeDeCaso(rng, tema, estilo) {
  const t = PALAVRAS_CASO[tema] ? tema : U.pick(rng, Object.keys(PALAVRAS_CASO));
  const [pal, g, plural] = U.pick(rng, PALAVRAS_CASO[t]);
  const [lugar, gl] = U.pick(rng, COMPLEMENTOS_CASO[t]);
  const e = ESTILOS_NOME[estilo] ? estilo : U.pick(rng, Object.keys(ESTILOS_NOME));
  if (e === 'operacao') return 'Operação ' + pal + ' ' + adjetivo(rng, g, false);
  if (e === 'manchete') return U.chance(rng, 0.6) ? art(g) + ' ' + pal.toLowerCase() + ' ' + de(gl) + ' ' + lugar : art(g) + ' ' + pal.toLowerCase() + ' ' + U.pick(rng, VERBOS_CASO);
  if (e === 'apelido') return art(g, true) + ' ' + plural + ' ' + adjetivo(rng, g, true);
  return art(g) + ' ' + pal.toLowerCase() + ' ' + U.pick(rng, VERBOS_CASO);
}

registrarGerador({
  id: 'nomes', numero: 7, grupo: 'Casos e história', nome: 'Nomes de casos', colecao: 'nomes',
  descricao: 'Dezenas de títulos para escolher, no estilo de manchete, nome de operação, apelido de bando ou capítulo, por tema ou por tipo de crime. Cada nome já passa pelo verificador e traz os links de busca para conferir se existe de verdade.',
  campos: [
    { id: 'quantidade', rotulo: 'Quantos nomes', tipo: 'numero', padrao: 24, min: 1, max: 200 },
    { id: 'crime', rotulo: 'Crime (escolhe o tema)', tipo: 'select', padrao: 'qualquer', opcoes: [['qualquer', 'Usar o tema abaixo']].concat(CRIMES.map(c => [c.id, c.nome])) },
    { id: 'tema', rotulo: 'Tema', tipo: 'select', padrao: 'qualquer', opcoes: [['qualquer', 'Misturar']].concat(Object.keys(PALAVRAS_CASO).map(k => [k, U.maiuscula(k)])) },
    { id: 'estilo', rotulo: 'Estilo', tipo: 'select', padrao: 'qualquer', opcoes: [['qualquer', 'Misturar']].concat(Object.keys(ESTILOS_NOME).map(k => [k, ESTILOS_NOME[k]])) },
  ],
  gerar(v, ctx) {
    const rng = ctx.rng, tema = v.crime !== 'qualquer' ? TEMA_DO_CRIME[v.crime] : v.tema;
    const usados = new Set((ctx.projeto.nomes || []).map(n => n.nome)), nomes = [];
    for (let tent = 0; nomes.length < v.quantidade && tent < v.quantidade * 20; tent++) {
      const estilo = ESTILOS_NOME[v.estilo] ? v.estilo : U.pick(rng, Object.keys(ESTILOS_NOME));
      const t = PALAVRAS_CASO[tema] ? tema : U.pick(rng, Object.keys(PALAVRAS_CASO));
      const nome = nomeDeCaso(rng, t, estilo);
      if (usados.has(nome)) continue;
      usados.add(nome);
      const ver = verificarNome(nome);
      nomes.push({ nome, tema: t, estilo, crime: v.crime !== 'qualquer' ? v.crime : '', verificacao: ver.nivel, motivos: ver.achados.map(a => a.termo + ': ' + a.motivo).join('; ') });
    }
    const rotulo = { ok: 'nada encontrado na lista', atencao: 'ATENÇÃO', proibido: 'PROIBIDO' };
    return {
      resumo: nomes.length + ' nome(s); ' + nomes.filter(n => n.verificacao !== 'ok').length + ' com alerta do verificador.',
      avisos: ['"Nada encontrado" quer dizer só que o nome não está na lista de termos proibidos. Antes de fixar um nome, clique nos links de busca.'],
      itens: nomes, colecao: 'nomes',
      cartoes: nomes.map(n => ({ titulo: n.nome, subtitulo: n.tema + ' · ' + ESTILOS_NOME[n.estilo].split(' (')[0] + ' · verificador: ' + rotulo[n.verificacao], item: n, colecao: 'nomes',
        html: (n.motivos ? '<p class="alerta">' + U.esc(n.motivos) + '</p>' : '') + '<p class="links">' + linksDeBusca(n.nome.replace(/^Operação /, '')) + '</p>' })),
      tabelas: [{ nome: 'nomes', colunas: ['nome', 'tema', 'estilo', 'crime', 'verificacao', 'motivos'], linhas: nomes }],
      texto: nomes.map(n => '- ' + n.nome + (n.verificacao !== 'ok' ? '  [' + rotulo[n.verificacao] + ': ' + n.motivos + ']' : '')).join('\n'),
    };
  },
});
