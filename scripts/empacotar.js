/* Gera dist/sisp.html: o jogo inteiro num arquivo só, para mandar por e-mail, pendrive etc.
   Copia o CSS e o JS locais para dentro do HTML, na mesma ordem do index.html.
   Recursos externos (sql.js no cdnjs, Google Fonts) continuam como links.
   Uso: npm run empacotar */
const fs = require('fs');
const path = require('path');

const RAIZ = path.join(__dirname, '..');
const ler = f => fs.readFileSync(path.join(RAIZ, f), 'utf8');

let html = ler('index.html');
let nCss = 0, nJs = 0;
html = html.replace(/<link rel="stylesheet" href="((?:css)\/[^"]+)">/g, (_, f) => {
  nCss++; return '<style>/* ' + f + ' */\n' + ler(f).replace(/<\/style/gi, '<\\/style') + '</style>';
});
html = html.replace(/<script src="((?:js)\/[^"]+)"><\/script>/g, (_, f) => {
  nJs++; return '<script>/* ' + f + ' */\n' + ler(f).replace(/<\/script/gi, '<\\/script') + '</script>';
});
// imagens locais viram data: (o arquivo único não tem pasta img/)
let nImg = 0;
html = html.replace(/src="(img\/[^"]+\.(webp|png|jpg))"/g, (_, f, ext) => {
  nImg++; return 'src="data:image/' + (ext === 'jpg' ? 'jpeg' : ext) + ';base64,' + fs.readFileSync(path.join(RAIZ, f)).toString('base64') + '"';
});
if (/(href|src)="(css|js|img)\//.test(html)) throw new Error('Sobrou referência local sem embutir.');

fs.mkdirSync(path.join(RAIZ, 'dist'), { recursive: true });
fs.writeFileSync(path.join(RAIZ, 'dist/sisp.html'), html);
console.log(`dist/sisp.html gerado: ${nCss} CSS e ${nJs} JS e ${nImg} imagem(ns) embutidos, ${(html.length / 1024).toFixed(0)} KB.`);
