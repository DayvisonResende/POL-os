/* Ferramenta de tradução. Uso:
     npm run i18n                 resumo: cobertura de cada idioma e textos ainda não marcados com L()
     npm run i18n -- en           o que falta traduzir em inglês, pronto para colar em js/i18n/en.js
   Convenção e passo a passo: docs/idiomas.md */
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const RAIZ = path.join(__dirname, '..');

function arquivosJs(dir = path.join(RAIZ, 'js')) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap(d => d.isDirectory() ? arquivosJs(path.join(dir, d.name)) : d.name.endsWith('.js') ? [path.join(dir, d.name)] : []);
}
const rel = f => path.relative(RAIZ, f).split(path.sep).join('/');
const literal = s => new Function('return ' + s)();   // só recebe literais de string casados pela regex abaixo
const RE_L = /(?<![\w$.])L\(\s*('(?:[^'\\\n]|\\.)*'|"(?:[^"\\\n]|\\.)*")/g;
const RE_L_SEM_LITERAL = /(?<![\w$.])L\(\s*(?!['"])/g;
const LIT = `('(?:[^'\\\\\n]|\\\\.)*'|"(?:[^"\\\\\n]|\\\\.)*")`;
const RE_LP = new RegExp(`(?<![\\w$.])Lp\\([^,]+,\\s*${LIT}\\s*,\\s*${LIT}`, 'g');   // Lp(n, '1 linha', '{n} linhas')

// Todos os textos marcados para tradução: L('…') no JS e data-i18n / data-i18n-title no index.html.
function extrairTextos() {
  const textos = new Map(), problemas = [];
  const add = (t, onde) => { if (!textos.has(t)) textos.set(t, []); textos.get(t).push(onde); };
  for (const f of arquivosJs()) {
    if (rel(f).startsWith('js/i18n/') || rel(f) === 'js/core/i18n.js') continue;
    const s = fs.readFileSync(f, 'utf8');
    for (const m of s.matchAll(RE_L)) add(literal(m[1]), rel(f) + ':' + (s.slice(0, m.index).split('\n').length));
    for (const m of s.matchAll(RE_LP)) { const l = rel(f) + ':' + (s.slice(0, m.index).split('\n').length); add(literal(m[1]), l); add(literal(m[2]), l); }
    for (const m of s.matchAll(RE_L_SEM_LITERAL)) if (!/i18n-dinamico/.test(s.slice(m.index, s.indexOf('\n', m.index)))) problemas.push(rel(f) + ':' + (s.slice(0, m.index).split('\n').length) + ' → L() sem texto literal');
  }
  const html = fs.readFileSync(path.join(RAIZ, 'index.html'), 'utf8');
  for (const m of html.matchAll(/<(\w+)[^>]*\sdata-i18n(?=[\s>=])[^>]*>(.*?)<\/\1>/g)) add(m[2].trim(), 'index.html');
  for (const m of html.matchAll(/\sdata-i18n-title[^>]*?\stitle="([^"]*)"|\stitle="([^"]*)"[^>]*?\sdata-i18n-title/g)) add(m[1] || m[2], 'index.html (title)');
  return { textos, problemas };
}

function carregarIdiomas() {
  const ctx = vm.createContext({});
  vm.runInContext(fs.readFileSync(path.join(RAIZ, 'js/core/i18n.js'), 'utf8'), ctx);
  for (const f of fs.readdirSync(path.join(RAIZ, 'js/i18n')).filter(n => n.endsWith('.js')))
    vm.runInContext(fs.readFileSync(path.join(RAIZ, 'js/i18n', f), 'utf8'), ctx, { filename: 'js/i18n/' + f });
  return ctx.IDIOMAS;
}

const marcadores = s => [...String(s).matchAll(/\{(\w+)\}/g)].map(m => m[1]).sort().join(',');
function cobertura(idioma) {
  const { textos } = extrairTextos(), I = carregarIdiomas()[idioma];
  if (!I) throw new Error('Idioma não registrado: ' + idioma);
  const fonte = [...textos.keys()];
  const traduzidos = fonte.filter(t => I.textos[t]);
  return {
    idioma, nome: I.nome, pronto: I.pronto, total: fonte.length, traduzidos: traduzidos.length,
    faltando: fonte.filter(t => !I.textos[t]),
    orfaos: Object.keys(I.textos).filter(t => !textos.has(t)),              // tradução de um texto que não existe mais no código
    marcadoresDiferentes: traduzidos.filter(t => marcadores(t) !== marcadores(I.textos[t])),
  };
}

// Arquivos que não entram na tradução, e por quê.
const NAO_TRADUZIR = {
  'js/core/i18n.js': 'o próprio mecanismo',
  'js/config.js': 'configuração técnica',
  'js/core/banco/seed.js': 'dados do banco (nomes, cidades, modelos): a ambientação brasileira é a mesma em todo idioma',
  'js/ui/telemetria.js': 'painel de diagnóstico de playtest: ferramenta interna da equipe',
  'js/apps/radar.js': 'texto impresso pela câmera do radar (DER-SP): equipamento brasileiro, faz parte da ambientação',
};
// Literais com cara de texto em português que ainda não passam por L(): o que falta migrar.
function naoMarcados() {
  const lit = /'((?:[^'\\\n]|\\.)*)'|"((?:[^"\\\n]|\\.)*)"/g, res = {};
  for (const f of arquivosJs()) {
    const r = rel(f);
    if (r.startsWith('js/i18n/') || NAO_TRADUZIR[r] !== undefined) continue;
    const s = fs.readFileSync(f, 'utf8').replace(RE_L, 'L(0').replace(RE_LP, 'Lp(0');   // o que já está em L() não conta
    let n = 0;
    for (const m of s.matchAll(lit)) {
      const x = m[1] || m[2] || '';
      if (/[áéíóúãõâêôçÁÉÍÓÚÃÕÇ]/.test(x) || (/[a-zA-Z]{3,} [a-zA-Z]{2,}/.test(x) && !/SELECT |FROM |WHERE |px|rgba|var\(|svg|class=|PRAGMA|INSERT |CREATE /.test(x))) n++;
    }
    if (n) res[r] = n;
  }
  return res;
}

if (require.main === module) {
  const alvo = process.argv[2];
  const idiomas = carregarIdiomas(), { problemas } = extrairTextos();
  if (alvo) {
    const c = cobertura(alvo);
    console.log(`// ${c.nome}: faltam ${c.faltando.length} de ${c.total}. Cole em js/i18n/${alvo}.js, dentro de textos:{…}, e traduza.`);
    for (const t of c.faltando) console.log(`  ${JSON.stringify(t)}:'',`);
    if (c.orfaos.length) { console.log(`\n// Órfãos (texto mudou ou saiu do código; apague ou atualize):`); c.orfaos.forEach(t => console.log('//  ' + JSON.stringify(t))); }
  } else {
    console.log('Idiomas:');
    for (const cod of Object.keys(idiomas)) {
      if (cod === 'pt-BR') { console.log(`  pt-BR  idioma-fonte`); continue; }
      const c = cobertura(cod);
      console.log(`  ${cod.padEnd(6)} ${c.nome}: ${c.traduzidos}/${c.total} (${Math.round(c.traduzidos / Math.max(1, c.total) * 100)}%)${c.pronto ? ' · oferecido aos jogadores' : ' · só com ?idioma=' + cod}${c.orfaos.length ? ` · ${c.orfaos.length} órfão(s)` : ''}${c.marcadoresDiferentes.length ? ` · ${c.marcadoresDiferentes.length} com {marcadores} diferentes` : ''}`);
    }
    const nm = naoMarcados(), tot = Object.values(nm).reduce((a, b) => a + b, 0);
    console.log(`\nTextos ainda não marcados com L() (aproximado): ${tot}`);
    Object.entries(nm).sort((a, b) => b[1] - a[1]).forEach(([f, n]) => console.log(`  ${String(n).padStart(4)}  ${f}`));
    if (problemas.length) { console.log('\nProblemas:'); problemas.forEach(p => console.log('  ' + p)); }
  }
}

module.exports = { extrairTextos, carregarIdiomas, cobertura, naoMarcados, NAO_TRADUZIR };
