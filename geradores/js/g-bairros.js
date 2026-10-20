/* Gerador 3 · Bairros e endereços da cidade fictícia (e sugestões de nome para a própria cidade). */
'use strict';

function nomeDeCidade(rng) {
  const a = U.pick(rng, CIDADE_PARTES.a), b = U.pick(rng, CIDADE_PARTES.b), c = U.pick(rng, CIDADE_PARTES.c);
  return (a + ' ' + b + (c ? ' ' + c : '')).trim();
}
function criarBairro(rng, perfilId, usados) {
  const pf = PERFIS_BAIRRO.find(p => p.id === perfilId) || U.pick(rng, PERFIS_BAIRRO);
  let nome, tent = 0;
  do nome = U.pick(rng, pf.prefixos) + ' ' + U.pick(rng, pf.nomes); while (usados.has(nome) && ++tent < 30);
  if (usados.has(nome)) nome += ' ' + U.pick(rng, ['II', 'Novo', 'de Cima', 'de Baixo']);
  usados.add(nome);
  const ruas = []; while (ruas.length < 6) { const r = nomeDeRua(rng); if (!ruas.includes(r)) ruas.push(r); }
  const rendaMin = pf.renda[0], rendaMax = pf.renda[1];
  const pontos = U.amostra(rng, PONTOS_REFERENCIA, U.int(rng, 4, 7)).map(t => t + ' · ' + U.pick(rng, ruas) + ', ' + U.int(rng, 10, 2400));
  return {
    nome, perfil: pf.id, perfil_nome: pf.nome, populacao: Math.round(U.int(rng, pf.pop[0], pf.pop[1]) / 100) * 100,
    renda_min: rendaMin, renda_max: rendaMax, renda_media: Math.round(U.real(rng, rendaMin, rendaMax) * 0.6 / 50) * 50,
    cep_prefixo: U.digitos(rng, 5), ruas, pontos, crimes_tipicos: pf.crimes.join(', '),
    descricao: '', prompt: '',
    cenaEn: pf.cenaEn,
  };
}
const COLUNAS_BAIRRO = ['nome', 'perfil', 'populacao', 'renda_media', 'cep_prefixo', 'ruas', 'pontos', 'crimes_tipicos', 'descricao', 'prompt'];

registrarGerador({
  id: 'bairros', numero: 3, grupo: 'Mundo e lugares', nome: 'Bairros e endereços', colecao: 'bairros',
  descricao: 'Bairros da cidade fictícia, cada um com perfil (porto, periferia, centro financeiro…), ruas, faixa de CEP, pontos de referência (radares, antenas, agências), crimes típicos e o prompt da imagem do lugar. Também sugere nomes para a cidade.',
  campos: [
    { id: 'quantidade', rotulo: 'Quantos bairros', tipo: 'numero', padrao: 10, min: 1, max: 60 },
    { id: 'perfil', rotulo: 'Perfil', tipo: 'select', padrao: 'variados', opcoes: [['variados', 'Variados (um de cada, depois sorteados)']].concat(PERFIS_BAIRRO.map(p => [p.id, p.nome])) },
    { id: 'cidades', rotulo: 'Sugerir nomes para a cidade', tipo: 'check', padrao: true },
    { id: 'motor', rotulo: 'Gerador de imagem', tipo: 'select', padrao: 'midjourney', opcoes: Object.keys(ESTILO.motores).map(k => [k, ESTILO.motores[k]]) },
  ],
  gerar(v, ctx) {
    const rng = ctx.rng, usados = new Set((ctx.projeto.bairros || []).map(b => b.nome));
    const ordem = U.embaralhar(rng, PERFIS_BAIRRO.map(p => p.id));
    const bairros = [];
    for (let i = 0; i < v.quantidade; i++) {
      const perfil = v.perfil === 'variados' ? (i < ordem.length ? ordem[i] : U.pick(rng, ordem)) : v.perfil;
      const b = criarBairro(rng, perfil, usados);
      b.descricao = b.perfil_nome + ', cerca de ' + b.populacao.toLocaleString('pt-BR') + ' moradores, renda típica de ' + U.moeda(b.renda_min) + ' a ' + U.moeda(b.renda_max) + '. Crimes típicos: ' + b.crimes_tipicos + '.';
      b.prompt = promptLugar(b.cenaEn, { motor: v.motor, paleta: b.perfil === 'porto' ? 'porto' : b.perfil === 'condominios' ? 'luxo' : b.perfil === 'governo' ? 'governo' : 'noite' });
      bairros.push(b);
    }
    const cidades = v.cidades ? Array.from({ length: 6 }, () => nomeDeCidade(rng)) : [];
    return {
      resumo: bairros.length + ' bairro(s)' + (cidades.length ? ' e ' + cidades.length + ' sugestões de nome para a cidade' : '') + '.',
      avisos: cidades.length ? ['Antes de adotar um nome de cidade, confira na lista de municípios do IBGE e na busca (o verificador de nomes ajuda): muitos nomes "inventados" existem de verdade.'] : [],
      itens: bairros, colecao: 'bairros',
      cartoes: cidades.map(c => ({ titulo: c, subtitulo: 'sugestão de nome para a cidade fictícia', html: '<p>' + linksDeBusca(c) + '</p>' })).concat(bairros.map(b => ({
        titulo: b.nome, subtitulo: b.perfil_nome + ' · CEP ' + b.cep_prefixo + '-xxx', item: b, colecao: 'bairros', prompt: b.prompt, producao: { tipo: 'lugar', nome: b.nome },
        html: '<p>' + U.esc(b.descricao) + '</p><dl class="ficha"><dt>Ruas</dt><dd>' + b.ruas.map(U.esc).join(' · ') + '</dd><dt>Pontos de referência</dt><dd>' + b.pontos.map(U.esc).join('<br>') + '</dd></dl>' }))),
      tabelas: [{ nome: 'bairros', colunas: COLUNAS_BAIRRO, linhas: bairros.map(b => Object.assign({}, b, { ruas: b.ruas.join(' | '), pontos: b.pontos.join(' | ') })) }],
      texto: (cidades.length ? '# Nomes para a cidade\n' + cidades.map(c => '- ' + c).join('\n') + '\n\n' : '') + bairros.map(b => '## ' + b.nome + '\n' + b.descricao + '\nRuas: ' + b.ruas.join(', ') + '\nPontos: ' + b.pontos.join('; ') + '\n\nPrompt:\n' + b.prompt).join('\n\n'),
    };
  },
});
// links de busca para conferir se um nome existe de verdade (usado por vários geradores)
function linksDeBusca(nome) {
  const q = s => 'https://www.google.com/search?q=' + encodeURIComponent(s);
  return ['"' + nome + '"', '"' + nome + '" facção', '"' + nome + '" polícia', '"' + nome + '" empresa', '"' + nome + '" município'].map(s => '<a href="' + q(s) + '" target="_blank" rel="noopener">' + U.esc(s) + '</a>').join(' · ');
}
