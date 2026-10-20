/* Gerador 1 · Pessoas completas. criarPessoa() é usada também por empresas, veículos, contas, facções e rotina.
   Regra ética: o papel no caso (vítima, suspeito, laranja…) é sorteado SEM olhar a aparência. */
'use strict';

const PAPEIS = { vitima: 'vítima', testemunha: 'testemunha', suspeito: 'suspeito(a)', laranja: 'laranja', operador: 'operador(a)', tenente: 'tenente', chefao: 'chefão / chefona', servidor: 'servidor(a) público(a)', neutro: 'sem papel definido' };
// idade e profissões típicas de cada papel (quem empresta o nome costuma ser idoso ou muito pobre; quem manda tem fachada respeitável)
const PAPEL_PERFIL = {
  laranja: { idade: [[18, 25, 1], [62, 90, 3]], profissoes: ['aposentado', 'desempregado', 'do lar', 'diarista', 'estudante', 'feirante', 'agricultor'] },
  chefao: { idade: [[40, 72, 1]], profissoes: ['empresário', 'comerciante', 'advogado', 'contador', 'corretor de imóveis', 'servidor público', 'médico'] },
  tenente: { idade: [[28, 55, 1]], profissoes: ['empresário', 'comerciante', 'autônomo', 'despachante aduaneiro', 'corretor de imóveis', 'vigilante'] },
  operador: { idade: [[21, 50, 1]], profissoes: ['autônomo', 'motorista de aplicativo', 'vendedor', 'despachante aduaneiro', 'auxiliar de logística', 'caminhoneiro', 'analista de sistemas'] },
  servidor: { idade: [[25, 66, 1]], profissoes: ['servidor público'] },
};

function sortearIdade(rng, papel, faixa) {
  const perfil = PAPEL_PERFIL[papel];
  if (perfil) { const f = U.pickW(rng, perfil.idade.map(x => [x, x[2]])); return U.int(rng, f[0], f[1]); }
  if (faixa === 'jovem') return U.int(rng, 18, 29);
  if (faixa === 'adulto') return U.int(rng, 30, 59);
  if (faixa === 'idoso') return U.int(rng, 60, 92);
  return U.pickW(rng, [[U.int(rng, 18, 29), 25], [U.int(rng, 30, 59), 55], [U.int(rng, 60, 90), 20]]);
}
function sortearProfissao(rng, idade, papel) {
  const perfil = PAPEL_PERFIL[papel];
  let lista = PROFISSOES.filter(p => idade >= p.min && idade <= p.max);
  if (perfil) { const f = lista.filter(p => perfil.profissoes.some(n => p.nome.split('|')[0] === n)); if (f.length) lista = f; }
  if (idade >= 66 && !perfil) lista = lista.filter(p => /aposentad|comerciante|empresári|do lar|agricultor|feirante|advogad|médic/.test(p.nome));
  return U.pickW(rng, lista.map(p => [p, p.peso]));
}
function nomeCompleto(rng, genero, ano, ascendencia) {
  const primeiro = U.pick(rng, NOMES[genero][geracaoNome(ano)]);
  let s1 = U.pick(rng, SOBRENOMES), s2; do s2 = U.pick(rng, SOBRENOMES); while (s2 === s1);
  if (ascendencia.origem && U.chance(rng, 0.7)) s2 = U.pick(rng, SOBRENOMES_ORIGEM[ascendencia.origem]);
  else if (U.chance(rng, 0.12)) s2 = U.pick(rng, SOBRENOMES_ORIGEM[U.pick(rng, ['italiana', 'arabe', 'alema', 'outra'])]);
  let nome = primeiro + ' ' + s1 + ' ' + s2;
  if (NOMES_DO_JOGO.includes(nome)) nome = primeiro + ' ' + s2 + ' ' + s1;
  return nome;
}
function sortearEndereco(rng, projeto, renda) {
  let bairro, perfil;
  const doProjeto = (projeto && projeto.bairros) || [];
  if (doProjeto.length) {
    const prefer = doProjeto.filter(b => renda >= (b.renda_min || 0) * 0.6 && renda <= (b.renda_max || 1e9) * 1.6);
    const b = U.pick(rng, prefer.length ? prefer : doProjeto); bairro = b.nome; perfil = b.perfil;
    return { bairro, perfil, rua: U.pick(rng, b.ruas && b.ruas.length ? b.ruas : [nomeDeRua(rng)]), numero: U.int(rng, 10, 2400), cep: gerarCep(rng, b.cep_prefixo) };
  }
  const p = renda >= 15000 ? U.pick(rng, ['condominios', 'financeiro']) : renda < 2500 ? U.pick(rng, ['periferia', 'periferia', 'rodoviaria']) : U.pick(rng, PERFIS_BAIRRO.map(x => x.id));
  const pf = PERFIS_BAIRRO.find(x => x.id === p);
  return { bairro: U.pick(rng, pf.prefixos) + ' ' + U.pick(rng, pf.nomes), perfil: p, rua: nomeDeRua(rng), numero: U.int(rng, 10, 2400), cep: gerarCep(rng) };
}
function nomeDeRua(rng) {
  const tipo = U.pickW(rng, RUAS_TIPO);
  if (U.chance(rng, 0.35)) { const g = U.pick(rng, ['F', 'M']); return tipo + ' ' + U.pick(rng, HOMENAGEM) + ' ' + U.pick(rng, NOMES[g][U.pick(rng, ['antiga', 'media'])]) + ' ' + U.pick(rng, SOBRENOMES); }
  return tipo + ' ' + U.pick(rng, RUAS_NOME);
}

// A pessoa inteira. o: {genero, faixa, papel, distribuicao, ddd}
function criarPessoa(rng, o = {}, projeto) {
  const ref = DATA_REFERENCIA;
  const papel = o.papel && o.papel !== 'qualquer' ? o.papel : U.pickW(rng, [['vitima', 30], ['testemunha', 30], ['suspeito', 15], ['laranja', 10], ['operador', 10], ['servidor', 5]]);
  const genero = o.genero === 'F' || o.genero === 'M' ? o.genero : U.pick(rng, ['F', 'M']);
  const idadeAlvo = sortearIdade(rng, papel, o.faixa);
  const nasc = U.data(ref.getUTCFullYear() - idadeAlvo, U.int(rng, 1, 12), U.int(rng, 1, 28));
  const idade = U.idadeEm(nasc, ref);
  // aparência: sorteada sem olhar o papel
  const asc = U.pickW(rng, ASCENDENCIAS.map(a => [a, o.distribuicao === 'populacao' ? a.populacao : a.equilibrado]));
  const pele = U.pick(rng, asc.pele), tipoCabelo = U.pick(rng, asc.cabelo), olhos = U.pick(rng, asc.olhos);
  let cor = U.pick(rng, asc.cor);
  if (idade >= 70 && U.chance(rng, 0.85)) cor = U.pick(rng, [['grisalho', 'grey'], ['branco', 'white']]);
  else if (idade >= 52 && U.chance(rng, 0.55)) cor = [cor[0] + ' com fios brancos', cor[1] + ' with grey streaks'];
  const comp = U.pick(rng, COMPRIMENTO_CABELO[genero].filter(c => idade >= c[3]));
  const careca = comp[2] === 'careca';
  const fis = U.pick(rng, TIPO_FISICO), fisico = [genero === 'F' ? fis[1] : fis[0], fis[2]];
  const barba = genero === 'M' ? U.pick(rng, BARBA) : null;
  const marcas = U.chance(rng, 0.3) ? [] : U.amostra(rng, MARCAS.filter(m => m[1]), U.int(rng, 1, 2));
  const altura = genero === 'F' ? U.int(rng, 150, 178) : U.int(rng, 160, 192);
  const nome = nomeCompleto(rng, genero, nasc.getUTCFullYear(), asc);
  // vida
  const prof = sortearProfissao(rng, idade, papel);
  const renda = prof.rendaMax ? Math.round(U.real(rng, prof.rendaMin, prof.rendaMax) / 50) * 50 : 0;
  const end = sortearEndereco(rng, projeto, renda);
  const estiloRoupa = papel === 'chefao' && U.chance(rng, 0.7) ? 'luxo' : prof.roupa;
  const roupa = U.pick(rng, ROUPAS[estiloRoupa]);
  const expressao = U.pick(rng, EXPRESSOES[papel] || EXPRESSOES.neutro);
  const transporte = renda >= 6000 ? U.pickW(rng, [['carro', 8], ['carro por aplicativo', 2]]) : renda >= 2500 ? U.pickW(rng, [['carro', 4], ['moto', 2], ['ônibus', 3], ['metrô', 1]]) : U.pickW(rng, [['ônibus', 5], ['moto', 2], ['bicicleta', 1], ['a pé', 1]]);
  const estadoCivil = idade < 24 ? U.pickW(rng, [['solteiro(a)', 8], ['união estável', 2]]) : U.pickW(rng, [['casado(a)', 4], ['solteiro(a)', 3], ['divorciado(a)', 2], ['união estável', 2], ['viúvo(a)', idade > 60 ? 2 : 0.2]]);
  const pessoa = {
    nome, genero, idade, nascimento: U.dataISO(nasc), nascimento_br: U.dataBR(nasc),
    cpf: gerarCpfFicticio(rng), rg: gerarRg(rng), telefone: gerarTelefone(rng, o.ddd || (projeto && projeto.ddd) || '11'), email: gerarEmail(rng, nome),
    bairro: end.bairro, perfil_bairro: end.perfil, endereco: end.rua + ', ' + end.numero, cep: end.cep,
    profissao: U.genero(prof.nome, genero), renda, escolaridade: renda >= 9000 ? 'superior completo' : renda >= 4500 ? 'superior incompleto ou completo' : idade < 18 ? 'médio incompleto' : 'médio completo',
    estado_civil: estadoCivil, filhos: idade < 22 ? 0 : U.pickW(rng, [[0, 3], [1, 3], [2, 3], [3, 1]]),
    papel, personalidade: U.amostra(rng, PERSONALIDADE, 2).join(', '), jeito_de_falar: U.pick(rng, JEITO_DE_FALAR),
    fraqueza: ['chefao', 'tenente'].includes(papel) ? U.pick(rng, FRAQUEZAS) : '',
    transporte, horario_trabalho: prof.horario[0] === prof.horario[1] ? 'não trabalha fora' : U.pad(prof.horario[0]) + 'h às ' + U.pad(prof.horario[1]) + 'h',
    aparencia: {
      ascendencia: { pt: asc.pt, en: asc.en }, pele: { pt: pele[0], en: pele[1] }, olhos: { pt: olhos[0], en: olhos[1] }, fisico: { pt: fisico[0], en: fisico[1] },
      cabeloPt: careca ? comp[0] : 'cabelo ' + tipoCabelo[0] + ' ' + cor[0] + ', ' + comp[0],
      cabeloEn: careca ? (comp[1] === 'bald' ? 'bald head' : 'shaved head') : comp[2] === 'a' ? comp[1] + ' ' + tipoCabelo[1] + ' ' + cor[1] + ' hair' : tipoCabelo[1] + ' ' + cor[1] + ' hair ' + comp[1],
      barba: barba ? { pt: barba[0], en: barba[1] } : null, marcas: marcas.map(m => ({ pt: m[0], en: m[1] })), altura_cm: altura,
      roupa: { pt: roupa[0], en: roupa[1] }, expressao: { pt: expressao[0], en: expressao[1] },
    },
  };
  const a = pessoa.aparencia;
  pessoa.descricao = (genero === 'F' ? 'Mulher' : 'Homem') + ' de ' + idade + ' anos, ' + (altura / 100).toFixed(2).replace('.', ',') + ' m, ' + a.fisico.pt + ', ' + a.pele.pt + ', ' + a.cabeloPt + ', olhos ' + a.olhos.pt +
    (a.barba ? ', ' + a.barba.pt : '') + '. Veste ' + a.roupa.pt + '.' + (a.marcas.length ? ' Marcas: ' + a.marcas.map(m => m.pt).join(', ') + '.' : '') + ' Expressão ' + a.expressao.pt + '.';
  pessoa.prompt = promptRetrato(pessoa, { motor: o.motor, cenario: o.cenario || (papel === 'chefao' ? 'luxo' : 'neutro') });
  return pessoa;
}
// Linha "plana" para tabela, CSV e SQL
const COLUNAS_PESSOA = ['id', 'nome', 'genero', 'idade', 'nascimento', 'cpf', 'rg', 'telefone', 'email', 'bairro', 'endereco', 'cep', 'profissao', 'renda', 'escolaridade', 'estado_civil', 'filhos', 'papel', 'transporte', 'horario_trabalho', 'personalidade', 'jeito_de_falar', 'fraqueza', 'descricao', 'prompt'];
function linhaPessoa(p) { const l = {}; COLUNAS_PESSOA.forEach(c => l[c] = p[c] == null ? '' : p[c]); return l; }
function cartaoPessoa(p) {
  return { titulo: p.nome, subtitulo: (PAPEIS[p.papel] || p.papel) + ' · ' + p.idade + ' anos · ' + p.profissao + ' · ' + p.bairro, item: p, colecao: 'pessoas', prompt: p.prompt, producao: { tipo: 'rosto', nome: p.nome },
    html: '<p>' + U.esc(p.descricao) + '</p><dl class="ficha">' +
      [['CPF', p.cpf + ' (fictício: dígito inválido)'], ['Nascimento', p.nascimento_br], ['Telefone', p.telefone], ['E-mail', p.email], ['Endereço', p.endereco + ' · ' + p.bairro + ' · CEP ' + p.cep],
       ['Profissão', p.profissao + (p.renda ? ' · ' + U.moeda(p.renda) + '/mês' : '')], ['Estado civil', p.estado_civil + ' · ' + p.filhos + ' filho(s)'], ['Rotina', p.transporte + ' · ' + p.horario_trabalho],
       ['Personalidade', p.personalidade], ['Jeito de falar', p.jeito_de_falar], p.fraqueza ? ['Fraqueza', p.fraqueza] : null].filter(Boolean).map(x => '<dt>' + x[0] + '</dt><dd>' + U.esc(x[1]) + '</dd>').join('') + '</dl>' };
}

registrarGerador({
  id: 'pessoas', numero: 1, grupo: 'Personagens e pessoas', nome: 'Pessoas completas', colecao: 'pessoas',
  descricao: 'Pessoa fictícia inteira: nome da geração certa, idade, CPF (sempre inválido de propósito), endereço, profissão, renda, aparência, personalidade, rotina e o prompt da imagem no estilo do jogo. Em lote, gera os rostos genéricos já variados.',
  campos: [
    { id: 'quantidade', rotulo: 'Quantas pessoas', tipo: 'numero', padrao: 6, min: 1, max: 200 },
    { id: 'genero', rotulo: 'Gênero', tipo: 'select', padrao: 'qualquer', opcoes: [['qualquer', 'Qualquer'], ['F', 'Feminino'], ['M', 'Masculino']] },
    { id: 'faixa', rotulo: 'Idade', tipo: 'select', padrao: 'qualquer', opcoes: [['qualquer', 'Qualquer'], ['jovem', '18 a 29'], ['adulto', '30 a 59'], ['idoso', '60 ou mais']] },
    { id: 'papel', rotulo: 'Papel no caso', tipo: 'select', padrao: 'qualquer', opcoes: [['qualquer', 'Sortear']].concat(Object.keys(PAPEIS).map(k => [k, U.maiuscula(PAPEIS[k])])) },
    { id: 'distribuicao', rotulo: 'Variedade de aparência', tipo: 'select', padrao: 'equilibrado', opcoes: [['equilibrado', 'Equilibrada (bom para o banco de rostos)'], ['populacao', 'Como a população brasileira (IBGE)']] },
    { id: 'cenario', rotulo: 'Fundo do retrato', tipo: 'select', padrao: 'neutro', opcoes: Object.keys(CENARIOS).map(k => [k, k]) },
    { id: 'motor', rotulo: 'Gerador de imagem', tipo: 'select', padrao: 'midjourney', opcoes: Object.keys(ESTILO.motores).map(k => [k, ESTILO.motores[k]]) },
  ],
  gerar(v, ctx) {
    const pessoas = [];
    for (let i = 0; i < v.quantidade; i++) pessoas.push(criarPessoa(ctx.rng, v, ctx.projeto));
    return {
      resumo: pessoas.length + ' pessoa(s). O papel foi sorteado sem olhar a aparência.',
      itens: pessoas, colecao: 'pessoas', cartoes: pessoas.map(cartaoPessoa),
      tabelas: [{ nome: 'pessoas', colunas: COLUNAS_PESSOA.filter(c => c !== 'id'), linhas: pessoas.map(linhaPessoa) }],
      texto: pessoas.map(p => '## ' + p.nome + '\n' + p.descricao + '\nCPF ' + p.cpf + ' · ' + p.profissao + ' · ' + p.bairro + '\n\nPrompt:\n' + p.prompt).join('\n\n'),
    };
  },
});
