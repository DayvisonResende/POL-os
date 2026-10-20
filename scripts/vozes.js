/* Vozes dos personagens: roteiro de gravação e manifesto dos áudios. Guia: docs/vozes.md
   Uso:
     npm run vozes                  roteiro (audio/pt-BR/roteiro.csv) + o que falta gravar, o que mudou e o que sobrou
     npm run vozes -- manifesto     depois de colocar os mp3 em audio/pt-BR/: atualiza js/vozes/pt-BR.js
     npm run vozes -- en            o mesmo para outro idioma (audio/en/, js/vozes/en.js) */
const fs = require('fs');
const path = require('path');
const { carregarJogo, RAIZ } = require('../tests/carregar');

const PERSONAGENS = ['celia', 'beto', 'jairo', 'marina'];
const literal = s => new Function('return ' + s)();
const LIT = `'(?:[^'\\\\\\n]|\\\\.)*'|"(?:[^"\\\\\\n]|\\\\.)*"`;
// L('…') ou '…' (literal solto), dentro de um trecho de código
const literaisL = src => [...src.matchAll(new RegExp(`(?<![\\w$.])L\\(\\s*(${LIT})`, 'g'))].map(m => literal(m[1]));

async function coletarFalas(idioma) {
  const { T } = await carregarJogo(idioma);
  const falas = new Map();   // id → fala
  // preencher: só os textos do treinamento passam pelo fill() no jogo ({n}, {cores}: valores fixos do banco).
  // No chat, {marcadores} recebem valores na hora: a fala é dinâmica e não dá para gravar uma vez só.
  const add = (personagem, html, contexto, preencher) => {
    if (!html) return;
    const tela = preencher ? T.fill(html) : html, texto = T.textoDaFala(tela);
    if (!texto || texto.length < 3) return;
    const id = T.idFala(personagem, tela);
    if (!falas.has(id)) falas.set(id, { id, personagem, texto, falado: T.textoFalado(tela, idioma), contexto, dinamica: /\{\w+\}/.test(texto) });
  };
  // 1. treinamentos: tudo o que a Célia diz no painel
  for (const [tid, tr] of Object.entries(T.TREINOS)) tr.passos.forEach((p, k) => {
    const ctx = `Treino ${tid} · passo ${k + 1} (${p.tema || p.type})`;
    add('celia', p.text, ctx, true); add('celia', p.text2, ctx + ' · continuação', true); add('celia', p.after, ctx + ' · depois do acerto', true);
    (p.opts || []).forEach(o => add('celia', T.escH(o.fb), ctx + ' · resposta a "' + T.textoDaFala(o.t).slice(0, 40) + '"'));
    (p.chips || []).forEach(c => c.bad && add('celia', c.bad, ctx + ' · peça errada "' + c.t + '"'));
    (p.wrong || []).forEach(w => add('celia', w, ctx + ' · blocos fora de ordem'));
    if (p.miss) literaisL(String(p.miss)).concat([...String(p.miss).matchAll(new RegExp(`(${LIT})`, 'g'))].map(m => literal(m[1])).filter(s => s.length > 25 && / /.test(s)))
      .forEach(s => add('celia', s, ctx + ' · quando erra'));
  });
  // 2. broncas do motor do treinamento (iguais em todos os treinamentos)
  const motor = fs.readFileSync(path.join(RAIZ, 'js/apps/treinamento.js'), 'utf8');
  for (const fn of ['tutBeforeRun', 'tutOnError', 'tutOnEmpty']) {
    const ini = motor.indexOf('function ' + fn + '('), fim = motor.indexOf('\nfunction ', ini + 10);
    literaisL(motor.slice(ini, fim)).filter(s => s.length > 20).forEach(s => add('celia', s, 'Treino (qualquer) · ' + fn));
  }
  add('celia', T.L('Agora sim. Executa.'), 'Treino (qualquer) · blocos na ordem certa');
  // 3. mensagens do chat: say('quem', L('…')) e say('quem', '…') em todo o código
  const arquivos = d => fs.readdirSync(d, { withFileTypes: true }).flatMap(e => e.isDirectory() ? arquivos(path.join(d, e.name)) : e.name.endsWith('.js') ? [path.join(d, e.name)] : []);
  for (const f of arquivos(path.join(RAIZ, 'js'))) {
    const src = fs.readFileSync(f, 'utf8'), rel = path.relative(RAIZ, f);
    for (const m of src.matchAll(new RegExp(`say\\('(${PERSONAGENS.join('|')})',\\s*(?:L\\()?(${LIT})`, 'g'))) {
      const linha = src.slice(0, m.index).split('\n').length;
      add(m[1], T.L(literal(m[2])), `Chat · ${rel}:${linha}`);
    }
  }
  // 4. patentes (fala da Célia na promoção) e pedidos dos colegas
  T.RANKS.forEach(r => r.celia && add('celia', r.celia, 'Chat · promoção a ' + r.t));
  T.PEDIDOS.forEach(p => { add(p.de, p.texto, 'Chat · pedido ' + p.id); literaisL(String(p.check)).forEach(s => add(p.de, s, 'Chat · pedido ' + p.id + ' · resposta')); });
  return [...falas.values()];
}

function lerAjustes(idioma) {
  const f = path.join(RAIZ, 'audio', idioma, 'ajustes.json');
  return fs.existsSync(f) ? JSON.parse(fs.readFileSync(f, 'utf8')) : {};
}
const csv = v => '"' + String(v).replace(/"/g, '""') + '"';

async function main() {
  const args = process.argv.slice(2), manifesto = args.includes('manifesto'), idioma = args.find(a => a !== 'manifesto') || 'pt-BR';
  const pasta = path.join(RAIZ, 'audio', idioma);
  fs.mkdirSync(pasta, { recursive: true });
  const falas = await coletarFalas(idioma), ajustes = lerAjustes(idioma);
  const gravados = new Set(fs.readdirSync(pasta).filter(n => n.endsWith('.mp3')).map(n => n.slice(0, -4)));
  const ids = new Set(falas.map(f => f.id));
  const sobrando = [...gravados].filter(g => !ids.has(g));

  if (manifesto) {
    const validos = [...gravados].filter(g => ids.has(g)).sort();
    fs.writeFileSync(path.join(RAIZ, 'js', 'vozes', idioma + '.js'),
      `/* Áudios gravados (${idioma}): arquivos em audio/${idioma}/<id>.mp3. GERADO por: npm run vozes -- manifesto${idioma === 'pt-BR' ? '' : ' ' + idioma}\n   Não editar à mão: grave os mp3, coloque na pasta e rode o comando. */\nregistrarVozes(${JSON.stringify(idioma)},[\n${validos.map(v => JSON.stringify(v)).join(',\n')}\n]);\n`);
    console.log(`Manifesto atualizado: ${validos.length} áudio(s) em js/vozes/${idioma}.js.`);
    if (idioma !== 'pt-BR' && !fs.readFileSync(path.join(RAIZ, 'index.html'), 'utf8').includes(`js/vozes/${idioma}.js`))
      console.log(`Atenção: acrescente <script src="js/vozes/${idioma}.js"></script> no index.html, logo depois de js/vozes/pt-BR.js.`);
    if (sobrando.length) console.log(`${sobrando.length} mp3 sem fala correspondente (texto mudou ou saiu): ${sobrando.join(', ')}`);
    return;
  }

  const linhas = falas.map(f => [f.id, f.personagem, f.id + '.mp3', ajustes[f.id] || f.falado, f.texto, f.contexto,
    f.dinamica ? 'dinâmica (não gravar)' : gravados.has(f.id) ? 'gravada' : 'falta gravar']);
  fs.writeFileSync(path.join(pasta, 'roteiro.csv'), '﻿' + [['id', 'personagem', 'arquivo', 'texto_para_a_voz', 'texto_na_tela', 'contexto', 'situacao'], ...linhas].map(l => l.map(csv).join(';')).join('\n') + '\n');
  // um arquivo de texto por personagem, para colar direto no gerador de voz
  for (const p of PERSONAGENS) {
    const doP = falas.filter(f => f.personagem === p && !f.dinamica && !gravados.has(f.id));
    fs.writeFileSync(path.join(pasta, `roteiro-${p}.txt`), doP.map(f => `### ${f.id}.mp3   (${f.contexto})\n${ajustes[f.id] || f.falado}\n`).join('\n'));
  }
  const falta = falas.filter(f => !f.dinamica && !gravados.has(f.id));
  // Piloto: só a Célia no treinamento do Módulo 1 (o começo do jogo), para ouvir o efeito antes de gravar tudo
  const piloto = falta.filter(f => f.personagem === 'celia' && /^Treino m1 /.test(f.contexto));
  fs.writeFileSync(path.join(pasta, 'roteiro-piloto.txt'), piloto.map(f => `### ${f.id}.mp3   (${f.contexto})\n${ajustes[f.id] || f.falado}\n`).join('\n'));
  const porP = PERSONAGENS.map(p => { const l = falta.filter(f => f.personagem === p); return `${p}: ${l.length} falas, ${l.reduce((a, f) => a + (ajustes[f.id] || f.falado).length, 0)} caracteres`; });
  console.log(`Vozes (${idioma}): ${falas.length} falas · ${falas.length - falta.length - falas.filter(f => f.dinamica).length} gravadas · ${falta.length} faltando · ${falas.filter(f => f.dinamica).length} dinâmicas (não dá para gravar)`);
  console.log('Falta gravar, por personagem → ' + porP.join(' · '));
  console.log(`Total a gravar: ${falta.reduce((a, f) => a + (ajustes[f.id] || f.falado).length, 0)} caracteres.`);
  console.log(`Roteiro: audio/${idioma}/roteiro.csv (planilha) e audio/${idioma}/roteiro-<personagem>.txt (para colar no gerador).`);
  console.log(`Piloto (Célia, treinamento do Módulo 1): ${piloto.length} falas, ${piloto.reduce((a, f) => a + (ajustes[f.id] || f.falado).length, 0)} caracteres → audio/${idioma}/roteiro-piloto.txt`);
  if (sobrando.length) console.log(`Sobrando (texto mudou ou saiu do jogo; regravar ou apagar): ${sobrando.join(', ')}`);
}

if (require.main === module) main().catch(e => { console.error(e.message); process.exit(1); });
module.exports = { coletarFalas };
