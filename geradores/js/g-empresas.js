/* Gerador 4 · Empresas (Junta Comercial fictícia), com a opção "de fachada" e os sinais de alerta.
   Para não virar regra óbvia, algumas empresas honestas também têm um sinal inocente (abertura recente, endereço simples). */
'use strict';

function razaoSocial(rng, ramo) {
  const marca = U.pick(rng, MARCA_EMPRESA), termo = U.pick(rng, ramo.termos), nat = U.pickW(rng, NATUREZA_JURIDICA);
  const base = U.chance(rng, 0.5) ? marca + ' ' + termo : termo + ' ' + marca;
  return { razao: base + ' ' + nat, fantasia: U.chance(rng, 0.5) ? marca : base };
}
function escolherSocios(rng, projeto, fachada, n) {
  const pessoas = (projeto && projeto.pessoas) || [];
  const pool = fachada ? pessoas.filter(p => p.papel === 'laranja' || p.idade >= 62 || p.renda < 2500) : pessoas.filter(p => p.renda >= 4000 && p.idade >= 23);
  const escolhidos = U.amostra(rng, pool, Math.min(n, pool.length)), novos = [];
  while (escolhidos.length < n) { const p = criarPessoa(rng, { papel: fachada ? 'laranja' : 'neutro' }, projeto); escolhidos.push(p); novos.push(p); }
  return { socios: escolhidos, novos };
}
function criarEmpresa(rng, o, projeto) {
  const ramo = o.ramo && o.ramo !== 'qualquer' ? RAMOS.find(r => r.id === o.ramo) : U.pick(rng, RAMOS);
  const fachada = o.fachada === 'sempre' || (o.fachada === 'as_vezes' && U.chance(rng, 0.25));
  const nomes = razaoSocial(rng, ramo), ref = DATA_REFERENCIA;
  const aberta = fachada ? U.somarMin(ref, -U.int(rng, 15, 120) * 1440) : U.chance(rng, 0.1) ? U.somarMin(ref, -U.int(rng, 20, 200) * 1440) : U.data(U.int(rng, 1996, 2024), U.int(rng, 1, 12), U.int(rng, 1, 28));
  const func = fachada ? U.int(rng, 0, 1) : U.int(rng, ramo.func[0], ramo.func[1]);
  const capital = ramo.capital[1] ? Math.round(U.real(rng, ramo.capital[0], ramo.capital[1]) / 1000) * 1000 : 0;
  const bairros = (projeto && projeto.bairros) || [];
  const b = bairros.length ? U.pick(rng, fachada ? (bairros.filter(x => ['industrial', 'porto', 'financeiro'].includes(x.perfil)).concat(bairros)).slice(0, 8) : bairros) : null;
  const endTipo = fachada ? U.pick(rng, ['galpão alugado', 'sala comercial compartilhada (escritório virtual)', 'casa simples em bairro residencial', 'caixa postal']) : U.pick(rng, ['loja', 'escritório', 'galpão', 'sala comercial', 'sede própria']);
  const { socios, novos } = escolherSocios(rng, projeto, fachada, fachada ? U.pick(rng, [1, 1, 2]) : U.pick(rng, [1, 2, 2, 3]));
  const diasAberta = Math.round((ref - aberta) / 86400000);
  const sinais = [];
  if (diasAberta <= 120) sinais.push('aberta há ' + diasAberta + ' dias');
  if (fachada) {
    socios.forEach(s => { if (s.idade >= 62) sinais.push('sócio(a) de ' + s.idade + ' anos (' + s.profissao + ')'); else if (s.renda < 2500) sinais.push('sócio(a) com renda de ' + U.moeda(s.renda) + ' (' + s.profissao + ')'); });
    if (capital >= 100000 && func <= 1) sinais.push('capital de ' + U.moeda(capital) + ' sem funcionários');
    sinais.push('endereço: ' + endTipo);
  } else if (/casa simples/.test(endTipo)) sinais.push('endereço residencial (comum em empresa pequena)');
  return {
    cnpj: gerarCnpjFicticio(rng), razao_social: nomes.razao, nome_fantasia: nomes.fantasia, ramo: ramo.nome,
    aberta_em: U.dataISO(aberta), capital_social: capital, funcionarios: func,
    faturamento_anual: fachada ? Math.round(U.real(rng, 300000, 9000000) / 1000) * 1000 : Math.round(func * U.real(rng, 60000, 180000) / 1000) * 1000,
    bairro: b ? b.nome : '', endereco: (b && b.ruas ? U.pick(rng, b.ruas) : nomeDeRua(rng)) + ', ' + U.int(rng, 10, 3000), tipo_endereco: endTipo,
    telefone: gerarTelefone(rng, (projeto && projeto.ddd) || '11'), email: 'contato@' + U.slug(nomes.fantasia).replace(/\./g, '') + '.example',
    socios: socios.map(s => ({ cpf: s.cpf, nome: s.nome, idade: s.idade })), cpf_responsavel: socios[0].cpf, responsavel: socios[0].nome,
    fachada, sinais_alerta: sinais, _novosSocios: novos,
  };
}
const COLUNAS_EMPRESA = ['cnpj', 'razao_social', 'nome_fantasia', 'ramo', 'aberta_em', 'capital_social', 'funcionarios', 'faturamento_anual', 'bairro', 'endereco', 'tipo_endereco', 'telefone', 'email', 'cpf_responsavel', 'responsavel', 'fachada', 'sinais_alerta'];

registrarGerador({
  id: 'empresas', numero: 4, grupo: 'Mundo e lugares', nome: 'Empresas', colecao: 'empresas',
  descricao: 'Empresas com razão social no estilo do ramo, CNPJ (sempre inválido de propósito), abertura, capital, funcionários, endereço e sócios (usa as pessoas do projeto quando houver). A opção "de fachada" cria os sinais que um investigador procura.',
  campos: [
    { id: 'quantidade', rotulo: 'Quantas empresas', tipo: 'numero', padrao: 8, min: 1, max: 200 },
    { id: 'ramo', rotulo: 'Ramo', tipo: 'select', padrao: 'qualquer', opcoes: [['qualquer', 'Qualquer']].concat(RAMOS.map(r => [r.id, U.maiuscula(r.nome)])) },
    { id: 'fachada', rotulo: 'De fachada', tipo: 'select', padrao: 'as_vezes', opcoes: [['nunca', 'Nunca'], ['as_vezes', 'Às vezes (1 em 4)'], ['sempre', 'Sempre']] },
  ],
  gerar(v, ctx) {
    const empresas = [], novos = [];
    for (let i = 0; i < v.quantidade; i++) { const e = criarEmpresa(ctx.rng, v, ctx.projeto); novos.push(...e._novosSocios); delete e._novosSocios; empresas.push(e); }
    const socios = []; empresas.forEach(e => e.socios.forEach(s => socios.push({ cnpj: e.cnpj, cpf: s.cpf, nome: s.nome, entrada: e.aberta_em })));
    return {
      resumo: empresas.length + ' empresa(s), ' + empresas.filter(e => e.fachada).length + ' de fachada' + (novos.length ? '; ' + novos.length + ' sócio(s) novo(s) criados (salvar o projeto guarda também essas pessoas)' : '') + '.',
      itens: empresas, colecao: 'empresas', extras: novos.length ? [{ colecao: 'pessoas', itens: novos }] : [],
      cartoes: empresas.map(e => ({ titulo: e.razao_social, subtitulo: e.ramo + ' · ' + (e.fachada ? 'DE FACHADA' : 'comum') + ' · aberta em ' + e.aberta_em, item: e, colecao: 'empresas',
        html: '<dl class="ficha"><dt>CNPJ</dt><dd>' + e.cnpj + ' (fictício: dígito inválido)</dd><dt>Nome fantasia</dt><dd>' + U.esc(e.nome_fantasia) + '</dd><dt>Endereço</dt><dd>' + U.esc(e.endereco + (e.bairro ? ' · ' + e.bairro : '') + ' (' + e.tipo_endereco + ')') + '</dd><dt>Capital / funcionários</dt><dd>' + U.moeda(e.capital_social) + ' · ' + e.funcionarios + '</dd><dt>Sócios</dt><dd>' + e.socios.map(s => U.esc(s.nome + ', ' + s.idade + ' anos')).join('<br>') + '</dd>' + (e.sinais_alerta.length ? '<dt>Sinais de alerta</dt><dd class="alerta">' + e.sinais_alerta.map(U.esc).join('<br>') + '</dd>' : '') + '</dl>' })),
      tabelas: [{ nome: 'empresas', colunas: COLUNAS_EMPRESA, linhas: empresas.map(e => Object.assign({}, e, { fachada: e.fachada ? 1 : 0, sinais_alerta: e.sinais_alerta.join(' | ') })) },
                { nome: 'socios', colunas: ['cnpj', 'cpf', 'nome', 'entrada'], linhas: socios }],
      texto: empresas.map(e => '## ' + e.razao_social + (e.fachada ? ' (FACHADA)' : '') + '\nCNPJ ' + e.cnpj + ' · ' + e.ramo + ' · aberta em ' + e.aberta_em + '\nSócios: ' + e.socios.map(s => s.nome + ' (' + s.idade + ')').join(', ') + (e.sinais_alerta.length ? '\nSinais: ' + e.sinais_alerta.join('; ') : '')).join('\n\n'),
    };
  },
});
