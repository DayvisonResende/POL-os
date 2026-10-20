/* Gerador 12 · Sujador de dados: estraga dados limpos do jeito que a vida real estraga
   (espaços, maiúsculas, acentos, abreviações, CPF sem ponto, erro de digitação, datas misturadas, vazios, duplicados).
   O gabarito diz cada célula alterada e o valor original: é a base dos casos de limpeza e deduplicação. */
'use strict';

const SUJEIRAS = {
  espacos: 'Espaços sobrando ("  Maria  da Silva ")',
  caixa: 'Maiúsculas e minúsculas misturadas ("MARIA da silva")',
  acentos: 'Sem acento ("Joao", "Conceicao")',
  abreviacoes: 'Abreviações ("R." por "Rua", "M." no nome do meio)',
  documento: 'CPF/CNPJ sem pontuação ou com pontuação diferente',
  digitacao: 'Erro de digitação (letras trocadas)',
  datas: 'Datas em outro formato ("05/10/2026", "2026/10/05")',
  vazios: 'Valores vazios (NULL) e "não informado"',
  duplicados: 'Linhas duplicadas (a mesma pessoa cadastrada de novo)',
  ordem_nome: 'Nome invertido ("Silva, Maria")',
};
const ABREV = [[/\bRua\b/, 'R.'], [/\bAvenida\b/, 'Av.'], [/\bTravessa\b/, 'Tv.'], [/\bAlameda\b/, 'Al.'], [/\bDoutor\b|\bDr\.\s/, 'Dr '], [/\bSão\b/, 'S.'], [/\bSanta\b/, 'Sta.'], [/\bJardim\b/, 'Jd.'], [/\bVila\b/, 'Vl.'], [/\bLtda\b/, 'LTDA.']];
function lerCSV(txt) {
  const linhas = String(txt || '').replace(/^﻿/, '').split(/\r?\n/).filter(l => l.trim());
  if (!linhas.length) return { colunas: [], linhas: [] };
  const sep = (linhas[0].match(/;/g) || []).length >= (linhas[0].match(/,/g) || []).length ? ';' : ',';
  const partir = l => { const out = []; let cur = '', q = false; for (let i = 0; i < l.length; i++) { const c = l[i]; if (q) { if (c === '"' && l[i + 1] === '"') { cur += '"'; i++; } else if (c === '"') q = false; else cur += c; } else if (c === '"') q = true; else if (c === sep) { out.push(cur); cur = ''; } else cur += c; } out.push(cur); return out; };
  const colunas = partir(linhas[0]).map(s => s.trim());
  return { colunas, linhas: linhas.slice(1).map(l => { const p = partir(l), o = {}; colunas.forEach((c, i) => o[c] = p[i] == null ? '' : p[i]); return o; }) };
}
const ehDoc = v => /^\d{3}\.\d{3}\.\d{3}-\d{2}$|^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/.test(v);
const ehData = v => /^\d{4}-\d{2}-\d{2}( \d{2}:\d{2}(:\d{2})?)?$/.test(v);
const ehNome = (col, v) => /nome|razao|titular|responsavel/.test(col) && /^[A-ZÀ-Ú][\p{L}' ]+ [\p{L}' ]+$/u.test(v);
// cada sujeira devolve o valor sujo, ou undefined se não se aplica àquele valor (null é um valor: o vazio)
const APLICAR = {
  espacos: (rng, v) => typeof v === 'string' && /\S/.test(v) ? U.pick(rng, ['  ' + v, v + '  ', v.replace(' ', '  '), ' ' + v.replace(/ /g, '  ') + ' ']) : undefined,
  caixa: (rng, v) => typeof v === 'string' && /[a-zà-ú]/i.test(v) && !ehDoc(v) && !ehData(v) ? U.pick(rng, [v.toUpperCase(), v.toLowerCase(), v.split(' ').map((w, i) => i % 2 ? w.toUpperCase() : w.toLowerCase()).join(' ')]) : undefined,
  acentos: (rng, v) => typeof v === 'string' && U.semAcento(v) !== v ? U.semAcento(v) : undefined,
  abreviacoes: (rng, v, col) => {
    if (typeof v !== 'string') return undefined;
    const a = ABREV.find(([re]) => re.test(v)); if (a) return v.replace(a[0], a[1]);
    if (ehNome(col, v)) { const p = v.split(' '); if (p.length >= 3) { const i = U.int(rng, 1, p.length - 2); if (!/^d[aeo]s?$/.test(p[i])) { p[i] = p[i][0] + '.'; return p.join(' '); } } }
    return undefined;
  },
  documento: (rng, v) => typeof v === 'string' && ehDoc(v) ? U.pick(rng, [v.replace(/\D/g, ''), v.replace(/\D/g, '').replace(/^(\d{3})(\d{3})(\d{3})/, '$1 $2 $3 '), v.replace(/-/, '.'), v.replace(/\./g, '')]) : undefined,
  digitacao: (rng, v) => { if (typeof v !== 'string' || v.length < 5 || ehDoc(v) || ehData(v) || !/[a-z]{4}/i.test(v)) return undefined; const i = U.int(rng, 1, v.length - 3); if (/\W/.test(v[i] + v[i + 1])) return undefined; return v.slice(0, i) + v[i + 1] + v[i] + v.slice(i + 2); },
  datas: (rng, v) => typeof v === 'string' && ehData(v) ? U.pick(rng, [v.slice(8, 10) + '/' + v.slice(5, 7) + '/' + v.slice(0, 4) + v.slice(10), v.slice(0, 4) + '/' + v.slice(5, 7) + '/' + v.slice(8, 10) + v.slice(10), v.slice(8, 10) + '-' + v.slice(5, 7) + '-' + v.slice(2, 4)]) : undefined,
  vazios: (rng, v, col) => /^id$|_id$/.test(col) || v == null || v === '' ? undefined : U.pick(rng, [null, null, '', 'não informado', '-']),
  ordem_nome: (rng, v, col) => typeof v === 'string' && ehNome(col, v) ? (p => p.slice(-1)[0] + ', ' + p.slice(0, -1).join(' '))(v.split(' ')) : undefined,
};

registrarGerador({
  id: 'sujador', numero: 12, grupo: 'Qualidade e segurança', nome: 'Sujador de dados', colecao: null,
  descricao: 'Pega uma tabela limpa (do projeto ou colada em CSV) e a suja como acontece na vida real. Sai a tabela suja e o gabarito com cada célula alterada e o valor original: base dos casos de limpeza, TRIM/UPPER/REPLACE e deduplicação.',
  campos: [
    { id: 'fonte', rotulo: 'Dados de origem', tipo: 'select', padrao: 'pessoas', opcoes: [['pessoas', 'Pessoas do projeto'], ['empresas', 'Empresas do projeto'], ['veiculos', 'Veículos do projeto'], ['contas', 'Contas do projeto'], ['transacoes', 'Transações do projeto'], ['csv', 'CSV colado abaixo']] },
    { id: 'csv', rotulo: 'CSV (se escolheu "CSV colado"); separador ; ou ,', tipo: 'area', padrao: '' },
    { id: 'colunas', rotulo: 'Colunas a sujar (separadas por vírgula; vazio = todas)', tipo: 'texto', padrao: 'nome, cpf, endereco, bairro, nascimento' },
    { id: 'intensidade', rotulo: 'Linhas afetadas (%)', tipo: 'numero', padrao: 30, min: 1, max: 100 },
    { id: 'sujeiras', rotulo: 'Sujeiras', tipo: 'checks', padrao: ['espacos', 'caixa', 'acentos', 'abreviacoes', 'documento', 'digitacao', 'datas', 'duplicados'], opcoes: Object.keys(SUJEIRAS).map(k => [k, SUJEIRAS[k]]) },
  ],
  gerar(v, ctx) {
    const rng = ctx.rng, avisos = [], extras = [];
    let colunas, linhas;
    if (v.fonte === 'csv') ({ colunas, linhas } = lerCSV(v.csv));
    else {
      let itens = ctx.projeto[v.fonte] || [];
      if (!itens.length && v.fonte === 'pessoas') { itens = Array.from({ length: 20 }, () => criarPessoa(rng, {}, ctx.projeto)); extras.push({ colecao: 'pessoas', itens }); avisos.push('O projeto não tem pessoas: usei 20 pessoas novas (salvar o projeto guarda também essas).'); }
      if (!itens.length) return { resumo: 'Nada para sujar.', avisos: ['O projeto não tem ' + v.fonte + '. Gere e salve primeiro, ou cole um CSV.'], itens: [], cartoes: [], tabelas: [], texto: '' };
      const plano = x => { const o = {}; Object.keys(x).forEach(k => { if (x[k] == null || typeof x[k] !== 'object') o[k] = x[k]; }); return o; };
      linhas = itens.map(plano); colunas = Object.keys(linhas[0]).filter(c => !['prompt', 'descricao', 'perfil_bairro', 'nascimento_br'].includes(c));
    }
    if (!linhas.length) return { resumo: 'Nada para sujar.', avisos: ['O CSV está vazio ou sem linhas de dados.'], itens: [], cartoes: [], tabelas: [], texto: '' };
    const pedidas = String(v.colunas || '').split(',').map(s => s.trim()).filter(Boolean);
    const alvo = pedidas.length ? colunas.filter(c => pedidas.includes(c)) : colunas;
    if (pedidas.length && alvo.length < pedidas.length) avisos.push('Colunas que não existem nesta tabela foram ignoradas: ' + pedidas.filter(c => !colunas.includes(c)).join(', ') + '.');
    const tipos = (Array.isArray(v.sujeiras) ? v.sujeiras : []).filter(s => APLICAR[s]);
    const suja = linhas.map((l, i) => Object.assign({ linha_original: i + 1 }, l)), gabarito = [];
    suja.forEach((l, i) => {
      if (!U.chance(rng, v.intensidade / 100) || !tipos.length || !alvo.length) return;
      // 1 a 2 colunas por linha, uma sujeira em cada
      U.amostra(rng, alvo, U.int(rng, 1, Math.min(2, alvo.length))).forEach(col => {
        for (const t of U.embaralhar(rng, tipos)) {
          const novo = APLICAR[t](rng, l[col], col);
          if (novo === undefined || novo === l[col]) continue;
          gabarito.push({ linha: i + 1, coluna: col, original: l[col], sujo: novo, sujeira: t });
          l[col] = novo; break;
        }
      });
    });
    if ((v.sujeiras || []).includes('duplicados')) {
      const n = Math.max(1, Math.round(suja.length * v.intensidade / 100 / 4));
      U.amostra(rng, suja.slice(0, linhas.length), n).forEach(l => {
        const copia = Object.assign({}, l), col = alvo.find(c => typeof copia[c] === 'string' && copia[c]) || null;
        if (col && tipos.length) { const t = U.pick(rng, tipos.filter(x => !['vazios'].includes(x)).concat(['espacos'])); const novo = APLICAR[t] && APLICAR[t](rng, copia[col], col); if (novo) copia[col] = novo; }
        suja.push(copia); gabarito.push({ linha: suja.length, coluna: '(linha inteira)', original: 'cópia da linha ' + l.linha_original, sujo: col ? String(copia[col]) : '', sujeira: 'duplicados' });
      });
      const ordem = U.embaralhar(rng, suja.map((_, i) => i)), mapa = new Map(ordem.map((de, para) => [de + 1, para + 1]));
      const embaralhada = ordem.map(i => suja[i]); suja.length = 0; suja.push(...embaralhada);
      gabarito.forEach(g => g.linha = mapa.get(g.linha));
    }
    gabarito.sort((a, b) => a.linha - b.linha);
    const cols = ['linha_original'].concat(colunas);
    return {
      resumo: suja.length + ' linhas (' + linhas.length + ' originais); ' + gabarito.length + ' sujeiras plantadas. A coluna linha_original fica para conferência: apague-a antes de levar ao jogo.',
      avisos, itens: [], colecao: null, extras,
      cartoes: [{ titulo: 'Exemplos do gabarito', subtitulo: 'as 12 primeiras alterações', html: '<table class="mini"><tr><th>linha</th><th>coluna</th><th>antes</th><th>depois</th></tr>' + gabarito.slice(0, 12).map(g => '<tr><td>' + g.linha + '</td><td>' + U.esc(g.coluna) + '</td><td>' + U.esc(JSON.stringify(g.original)) + '</td><td>' + U.esc(JSON.stringify(g.sujo)) + '</td></tr>').join('') + '</table>' }],
      tabelas: [{ nome: 'dados_sujos', colunas: cols, linhas: suja }, { nome: 'gabarito', colunas: ['linha', 'coluna', 'original', 'sujo', 'sujeira'], linhas: gabarito }],
      texto: '# Gabarito do sujador\n' + gabarito.map(g => 'linha ' + g.linha + ' · ' + g.coluna + ' · ' + g.sujeira + ': ' + JSON.stringify(g.original) + ' → ' + JSON.stringify(g.sujo)).join('\n'),
    };
  },
});
