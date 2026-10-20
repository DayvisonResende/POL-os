/* Gerador 11 · Verificador: nomes (termos proibidos, siglas, nomes já usados no jogo) e documentos
   (CPF/CNPJ com dígito VÁLIDO podem ser de alguém de verdade: não usar). verificarNome() é usada por nomes e facções. */
'use strict';

const norm = s => U.semAcento(s).toLowerCase();
const escRe = s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
// Siglas curtas (até 3 letras) só batem em MAIÚSCULAS ("ADA" sim, "Ada" não); o resto bate em qualquer caixa, palavra inteira.
function bateTermo(texto, termo) {
  if (/^[A-Z0-9]{2,3}$/.test(termo)) return new RegExp('(^|[^A-Za-z0-9])' + termo + '($|[^A-Za-z0-9])').test(texto);
  return new RegExp('(^|[^a-z0-9])' + escRe(norm(termo)) + '(s|es)?($|[^a-z0-9])').test(norm(texto));   // aceita o plural ("Os Contadores")
}
function verificarNome(texto) {
  const achados = [];
  TERMOS_PROIBIDOS.forEach(t => { if (bateTermo(texto, t.termo)) achados.push({ termo: t.termo, nivel: t.nivel, motivo: t.motivo }); });
  // qualquer outra sigla de 2 a 4 letras maiúsculas: muitas são de órgãos ou grupos reais
  (String(texto).match(/\b[A-ZÀ-Ú]{2,4}\b/g) || []).filter(s => !/^[IVX]+$/.test(s)).forEach(s => {   // algarismo romano não é sigla
    if (!achados.some(a => a.termo.toUpperCase() === s)) achados.push({ termo: s, nivel: 'atencao', motivo: 'sigla: confira se não é de órgão, empresa ou grupo real' });
  });
  NOMES_DO_JOGO.forEach(n => { if (bateTermo(texto, n)) achados.push({ termo: n, nivel: 'atencao', motivo: 'já é usado no jogo' }); });
  const nivel = achados.some(a => a.nivel === 'proibido') ? 'proibido' : achados.length ? 'atencao' : 'ok';
  return { nivel, achados };
}
// CPFs e CNPJs num texto (com ou sem pontuação)
function verificarDocumentos(texto) {
  const out = [], vistos = new Set();
  (String(texto).match(/\d[\d.\-\/ ]{9,19}\d/g) || []).forEach(bruto => {
    const n = bruto.replace(/\D/g, '');
    if (vistos.has(n) || (n.length !== 11 && n.length !== 14)) return;
    vistos.add(n);
    const tipo = n.length === 11 ? 'CPF' : 'CNPJ', valido = tipo === 'CPF' ? cpfValido(n) : cnpjValido(n);
    out.push({ documento: bruto.trim(), tipo, valido, situacao: valido ? 'PODE SER REAL: não use' : 'seguro (dígito verificador inválido)' });
  });
  return out;
}

registrarGerador({
  id: 'verificador', numero: 11, grupo: 'Qualidade e segurança', nome: 'Verificador de nomes e documentos', colecao: null,
  descricao: 'Cole nomes (um por linha) e ele avisa se lembram forças policiais, facções, operações ou empresas reais, siglas, profissões ou origens usadas como nome de grupo, ou nomes que o jogo já usa. No modo documentos, confere se um CPF ou CNPJ tem o dígito válido (e portanto pode ser de alguém).',
  campos: [
    { id: 'modo', rotulo: 'O que verificar', tipo: 'select', padrao: 'nomes', opcoes: [['nomes', 'Nomes (um por linha)'], ['documentos', 'CPFs e CNPJs (texto livre)']] },
    { id: 'texto', rotulo: 'Texto', tipo: 'area', padrao: 'A Rota\nO Livro-Caixa\nOs Contadores\nFamília Seriema\nOperação Balança Viciada\nGrupo GTX' },
    { id: 'projeto', rotulo: 'Verificar também os nomes salvos no projeto (facções, nomes, empresas)', tipo: 'check', padrao: false },
  ],
  gerar(v, ctx) {
    const pr = ctx.projeto, rot = { ok: 'nada na lista', atencao: 'ATENÇÃO', proibido: 'PROIBIDO' };
    if (v.modo === 'documentos') {
      const docs = verificarDocumentos(v.texto + (v.projeto ? '\n' + (pr.pessoas || []).map(p => p.cpf).concat((pr.empresas || []).map(e => e.cnpj)).join('\n') : ''));
      return {
        resumo: docs.length + ' documento(s) encontrado(s); ' + docs.filter(d => d.valido).length + ' com dígito válido (podem ser reais).',
        avisos: docs.some(d => d.valido) ? ['Há documento com dígito válido: troque por um gerado aqui (o gerador sempre erra o dígito de propósito).'] : [],
        itens: [], colecao: null,
        cartoes: docs.map(d => ({ titulo: d.documento, subtitulo: d.tipo + ' · ' + d.situacao, html: d.valido ? '<p class="alerta">Este número passa na conta do dígito verificador: pode pertencer a alguém de verdade.</p>' : '<p>Não passa na conta do dígito: não pode ser de ninguém.</p>' })),
        tabelas: [{ nome: 'documentos', colunas: ['documento', 'tipo', 'valido', 'situacao'], linhas: docs.map(d => Object.assign({}, d, { valido: d.valido ? 1 : 0 })) }],
        texto: docs.map(d => d.documento + ' · ' + d.tipo + ' · ' + d.situacao).join('\n'),
      };
    }
    let nomes = String(v.texto || '').split('\n').map(s => s.trim()).filter(Boolean);
    if (v.projeto) nomes = nomes.concat((pr.faccoes || []).map(f => f.nome), (pr.faccoes || []).map(f => f.chefao && f.chefao.apelido).filter(Boolean), (pr.nomes || []).map(n => n.nome), (pr.empresas || []).map(e => e.razao_social));
    nomes = [...new Set(nomes)];
    const res = nomes.map(n => Object.assign({ nome: n }, verificarNome(n)));
    return {
      resumo: res.length + ' nome(s): ' + res.filter(r => r.nivel === 'proibido').length + ' proibido(s), ' + res.filter(r => r.nivel === 'atencao').length + ' com atenção.',
      avisos: ['A lista pega o que já conhecemos. Um nome "limpo" ainda precisa da busca na internet (os links ficam em cada cartão).'],
      itens: [], colecao: null,
      cartoes: res.map(r => ({ titulo: r.nome, subtitulo: rot[r.nivel], html: (r.achados.length ? '<ul class="' + (r.nivel === 'proibido' ? 'alerta' : 'atencao') + '">' + r.achados.map(a => '<li><b>' + U.esc(a.termo) + '</b> (' + rot[a.nivel] + '): ' + U.esc(a.motivo) + '</li>').join('') + '</ul>' : '') + '<p class="links">' + linksDeBusca(r.nome) + '</p>' })),
      tabelas: [{ nome: 'verificacao', colunas: ['nome', 'nivel', 'motivos'], linhas: res.map(r => ({ nome: r.nome, nivel: r.nivel, motivos: r.achados.map(a => a.termo + ': ' + a.motivo).join('; ') })) }],
      texto: res.map(r => (r.nivel === 'ok' ? '✓ ' : r.nivel === 'proibido' ? '✗ ' : '! ') + r.nome + (r.achados.length ? ' — ' + r.achados.map(a => a.termo + ' (' + a.motivo + ')').join('; ') : '')).join('\n'),
    };
  },
});
