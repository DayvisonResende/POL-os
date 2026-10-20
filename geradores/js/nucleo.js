/* Núcleo dos geradores: sorteio com semente, utilidades, documentos fictícios, exportação e o "projeto"
   (coleções compartilhadas entre geradores, salvas no navegador). Sem DOM no carregamento: roda no Node (testes). */
'use strict';

/* ---------- Sorteio com semente ---------- */
// A mesma semente gera sempre o mesmo resultado (para refazer algo exatamente igual).
function hashSemente(txt) {
  let h = 0x811c9dc5;
  for (const ch of String(txt)) { h ^= ch.codePointAt(0); h = Math.imul(h, 0x01000193) >>> 0; }
  return h >>> 0;
}
function criarRng(semente) {
  let a = hashSemente(semente) || 1;
  return function () {   // mulberry32
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const PALAVRAS_SEMENTE = ['cafe', 'radar', 'galpao', 'maré', 'balcao', 'caixa', 'recruta', 'pista', 'cofre', 'trilha', 'ancora', 'sereno', 'lampião', 'farol', 'bússola', 'tinta', 'carimbo', 'arquivo'];
function sementeAleatoria() {
  const p = PALAVRAS_SEMENTE[Math.floor(Math.random() * PALAVRAS_SEMENTE.length)];
  return p + '-' + Math.floor(Math.random() * 9000 + 1000);
}

/* ---------- Utilidades de sorteio ---------- */
const U = {
  int: (rng, a, b) => a + Math.floor(rng() * (b - a + 1)),
  real: (rng, a, b) => a + rng() * (b - a),
  chance: (rng, p) => rng() < p,
  pick: (rng, lista) => lista[Math.floor(rng() * lista.length)],
  // [[item, peso], …]
  pickW: (rng, pares) => {
    const tot = pares.reduce((s, p) => s + p[1], 0); let x = rng() * tot;
    for (const p of pares) { x -= p[1]; if (x < 0) return p[0]; }
    return pares[pares.length - 1][0];
  },
  embaralhar: (rng, lista) => { const a = lista.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rng() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; },
  amostra: (rng, lista, n) => U.embaralhar(rng, lista).slice(0, n),
  pad: (n, t = 2) => String(n).padStart(t, '0'),
  digitos: (rng, n) => Array.from({ length: n }, () => U.int(rng, 0, 9)).join(''),
  letra: (rng, sem = '') => U.pick(rng, 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').filter(l => !sem.includes(l))),
  semAcento: s => String(s).normalize('NFD').replace(/[̀-ͯ]/g, ''),
  slug: s => U.semAcento(s).toLowerCase().replace(/[^a-z0-9]+/g, '.').replace(/^\.|\.$/g, ''),
  arquivo: s => U.slug(s).replace(/\./g, '-'),   // "livro_caixa" → "livro-caixa" (nomes de arquivo de imagem)
  maiuscula: s => String(s).charAt(0).toUpperCase() + String(s).slice(1),
  // "vendedor|vendedora" → forma do gênero
  genero: (txt, g) => { const p = String(txt).split('|'); return g === 'F' && p[1] ? p[1] : p[0]; },
  moeda: v => 'R$ ' + Number(v).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
  dataISO: d => d.getUTCFullYear() + '-' + U.pad(d.getUTCMonth() + 1) + '-' + U.pad(d.getUTCDate()),
  dataBR: d => U.pad(d.getUTCDate()) + '/' + U.pad(d.getUTCMonth() + 1) + '/' + d.getUTCFullYear(),
  horaISO: d => U.pad(d.getUTCHours()) + ':' + U.pad(d.getUTCMinutes()) + ':' + U.pad(d.getUTCSeconds()),
  dataHoraISO: d => U.dataISO(d) + ' ' + U.horaISO(d),
  // data no fuso "do jogo" (usamos UTC como relógio local, igual ao gerador do banco do jogo)
  data: (a, m, d, h = 0, mi = 0, s = 0) => new Date(Date.UTC(a, m - 1, d, h, mi, s)),
  somarMin: (d, min) => new Date(d.getTime() + min * 60000),
  idadeEm: (nasc, ref) => { let i = ref.getUTCFullYear() - nasc.getUTCFullYear(); const m = ref.getUTCMonth() - nasc.getUTCMonth(); if (m < 0 || (m === 0 && ref.getUTCDate() < nasc.getUTCDate())) i--; return i; },
  esc: s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])),
};
const DATA_REFERENCIA = U.data(2026, 10, 12);   // o "hoje" da história (dia do assalto)

/* ---------- Documentos fictícios ---------- */
// CPF e CNPJ saem com o dígito verificador ERRADO de propósito: parecem reais, mas não podem pertencer a ninguém.
function cpfDV(base9) {
  const d = base9.split('').map(Number);
  let s = 0; for (let i = 0; i < 9; i++) s += d[i] * (10 - i);
  let r = s % 11; const d1 = r < 2 ? 0 : 11 - r;
  s = 0; for (let i = 0; i < 9; i++) s += d[i] * (11 - i); s += d1 * 2;
  r = s % 11; const d2 = r < 2 ? 0 : 11 - r;
  return [d1, d2];
}
function cpfValido(cpf) {
  const n = String(cpf).replace(/\D/g, '');
  if (n.length !== 11 || /^(\d)\1{10}$/.test(n)) return false;
  const [d1, d2] = cpfDV(n.slice(0, 9));
  return +n[9] === d1 && +n[10] === d2;
}
function formatarCpf(n) { return n.slice(0, 3) + '.' + n.slice(3, 6) + '.' + n.slice(6, 9) + '-' + n.slice(9); }
function gerarCpfFicticio(rng) {
  let base; do base = U.digitos(rng, 9); while (/^(\d)\1{8}$/.test(base));
  const [d1, d2] = cpfDV(base);
  const errado = (d2 + U.int(rng, 1, 9)) % 10;   // nunca igual ao certo
  return formatarCpf(base + d1 + errado);
}
function cnpjDV(base12) {
  const d = base12.split('').map(Number), p1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2], p2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  let s = 0; for (let i = 0; i < 12; i++) s += d[i] * p1[i];
  let r = s % 11; const d1 = r < 2 ? 0 : 11 - r;
  s = 0; for (let i = 0; i < 12; i++) s += d[i] * p2[i]; s += d1 * p2[12];
  r = s % 11; const d2 = r < 2 ? 0 : 11 - r;
  return [d1, d2];
}
function cnpjValido(cnpj) {
  const n = String(cnpj).replace(/\D/g, '');
  if (n.length !== 14 || /^(\d)\1{13}$/.test(n)) return false;
  const [d1, d2] = cnpjDV(n.slice(0, 12));
  return +n[12] === d1 && +n[13] === d2;
}
function formatarCnpj(n) { return n.slice(0, 2) + '.' + n.slice(2, 5) + '.' + n.slice(5, 8) + '/' + n.slice(8, 12) + '-' + n.slice(12); }
function gerarCnpjFicticio(rng) {
  const base = U.digitos(rng, 8) + '0001', [d1, d2] = cnpjDV(base);
  return formatarCnpj(base + d1 + (d2 + U.int(rng, 1, 9)) % 10);
}
// Placa no padrão Mercosul (LLL N L NN); evita as letras dos BOs da campanha.
function gerarPlaca(rng) {
  let p; do p = U.letra(rng) + U.letra(rng) + U.letra(rng) + U.int(rng, 0, 9) + U.letra(rng) + U.digitos(rng, 2);
  while (/^(FTR|KZX|ABC|AAA|XXX)/.test(p));
  return p;
}
// Celular na faixa "9 0xxx": pouco usada, mas ainda assim nunca use número real no jogo.
function gerarTelefone(rng, ddd = '11') { return '(' + ddd + ') 90' + U.digitos(rng, 3) + '-' + U.digitos(rng, 4); }
function gerarCep(rng, prefixo) { return (prefixo || U.digitos(rng, 5)) + '-' + U.digitos(rng, 3); }
function gerarRg(rng) { return U.digitos(rng, 2) + '.' + U.digitos(rng, 3) + '.' + U.digitos(rng, 3) + '-' + U.int(rng, 0, 9); }
// Domínio .example é reservado (RFC 2606): nunca é um e-mail real.
function gerarEmail(rng, nome) { const p = U.slug(nome).split('.'); return p[0] + '.' + p[p.length - 1] + U.int(rng, 1, 99) + '@email.example'; }

/* ---------- Exportação ---------- */
function paraCSV(colunas, linhas) {
  const c = v => { const s = v == null ? '' : String(v); return /[;"\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s; };
  return '﻿' + [colunas.join(';')].concat(linhas.map(l => colunas.map(k => c(l[k])).join(';'))).join('\n') + '\n';
}
function tipoSQL(valores) {
  const v = valores.filter(x => x != null && x !== '');
  if (v.length && v.every(x => typeof x === 'number' && Number.isInteger(x))) return 'INTEGER';
  if (v.length && v.every(x => typeof x === 'number')) return 'REAL';
  return 'TEXT';
}
function sqlValor(v) { return v == null || v === '' ? 'NULL' : typeof v === 'number' ? String(v) : "'" + String(v).replace(/'/g, "''") + "'"; }
function paraSQL(tabela, colunas, linhas) {
  const tipos = colunas.map(k => tipoSQL(linhas.map(l => l[k])));
  const out = ['CREATE TABLE ' + tabela + ' (' + colunas.map((k, i) => k + ' ' + tipos[i]).join(', ') + ');'];
  linhas.forEach(l => out.push('INSERT INTO ' + tabela + ' (' + colunas.join(', ') + ') VALUES (' + colunas.map(k => sqlValor(l[k])).join(', ') + ');'));
  return out.join('\n') + '\n';
}

/* ---------- Registro dos geradores ---------- */
const GERADORES = [];
function registrarGerador(g) { GERADORES.push(g); GERADORES.sort((a, b) => a.numero - b.numero); }
function gerador(id) { return GERADORES.find(g => g.id === id) || null; }
// Roda um gerador fora da interface (testes e "gerar em cadeia").
function rodarGerador(id, valores = {}, semente = 'teste', projeto = novoProjeto()) {
  const g = gerador(id); const v = {};
  (g.campos || []).forEach(c => { v[c.id] = c.id in valores ? valores[c.id] : c.padrao; });
  Object.assign(v, valores);
  return g.gerar(v, { rng: criarRng(semente + '|' + id), semente, projeto });
}

/* ---------- Projeto (coleções compartilhadas) ---------- */
// pessoas, bairros, empresas, veiculos, contas, transacoes, faccoes, fichas, nomes, producao
const COLECOES = ['pessoas', 'bairros', 'empresas', 'veiculos', 'contas', 'transacoes', 'faccoes', 'fichas', 'nomes', 'producao'];
const PREFIXO_ID = { pessoas: 'P', bairros: 'B', empresas: 'E', veiculos: 'V', contas: 'C', transacoes: 'T', faccoes: 'F', fichas: 'K', nomes: 'N', producao: 'I' };
function novoProjeto() { const p = { versao: 1, cidade: 'Cidade fictícia', ddd: '11' }; COLECOES.forEach(c => p[c] = []); return p; }
function proximoId(projeto, colecao) {
  const pre = PREFIXO_ID[colecao] + '-', usados = projeto[colecao].map(x => +String(x.id || '').replace(pre, '') || 0);
  return pre + U.pad((usados.length ? Math.max(...usados) : 0) + 1, 4);
}
function adicionarAoProjeto(projeto, colecao, itens) {
  const novos = [];
  (Array.isArray(itens) ? itens : [itens]).forEach(it => {
    const x = JSON.parse(JSON.stringify(it));
    if (!x.id || projeto[colecao].some(y => y.id === x.id)) x.id = proximoId(projeto, colecao);
    projeto[colecao].push(x); novos.push(x);
  });
  return novos;
}
const CHAVE_PROJETO = 'pol-geradores-projeto';
function carregarProjeto() {
  try { const p = JSON.parse(localStorage.getItem(CHAVE_PROJETO) || 'null'); if (p) { const n = novoProjeto(); COLECOES.forEach(c => n[c] = p[c] || []); n.cidade = p.cidade || n.cidade; n.ddd = p.ddd || n.ddd; return n; } } catch (e) { /* sem armazenamento */ }
  return novoProjeto();
}
function salvarProjeto(projeto) { try { localStorage.setItem(CHAVE_PROJETO, JSON.stringify(projeto)); return true; } catch (e) { return false; } }

if (typeof module !== 'undefined') module.exports = { hashSemente, criarRng, sementeAleatoria, U, DATA_REFERENCIA, cpfDV, cpfValido, gerarCpfFicticio, cnpjDV, cnpjValido, gerarCnpjFicticio, gerarPlaca, gerarTelefone, gerarCep, gerarRg, gerarEmail, paraCSV, paraSQL, sqlValor, GERADORES, registrarGerador, gerador, rodarGerador, COLECOES, novoProjeto, adicionarAoProjeto, carregarProjeto, salvarProjeto };
