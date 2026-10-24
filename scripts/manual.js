/* Gera o PDF (A4, uma página) e a imagem para redes sociais do Manual do Recruta, a partir de manual/index.html.
   Uso: npm run manual   (precisa de um Chrome/Chromium; caminho na variável CHROME ou nos lugares comuns) */
const fs = require('fs');
const path = require('path');
const RAIZ = path.join(__dirname, '..');
const CHROME = [process.env.CHROME, '/usr/bin/google-chrome', '/usr/bin/chromium', '/usr/bin/chromium-browser', '/snap/bin/chromium',
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'].find(p => p && fs.existsSync(p));

async function gerarManual(destino = path.join(RAIZ, 'manual')) {
  if (!CHROME) throw new Error('Chrome não encontrado. Defina a variável CHROME com o caminho do navegador.');
  const { chromium } = require('playwright-core');
  const browser = await chromium.launch({ executablePath: CHROME, headless: true });
  try {
    const page = await browser.newPage({ viewport: { width: 1100, height: 1400 }, deviceScaleFactor: 2 });
    await page.goto('file://' + path.join(RAIZ, 'manual', 'index.html'));
    await page.waitForFunction(() => [...document.images].every(i => i.complete));
    const pdf = path.join(destino, 'manual-do-recruta.pdf'), png = path.join(destino, 'manual-do-recruta.png');
    await page.pdf({ path: pdf, format: 'A4', printBackground: true, preferCSSPageSize: true });
    await page.locator('.folha').screenshot({ path: png });
    const paginas = (fs.readFileSync(pdf, 'latin1').match(/\/Type\s*\/Page[^s]/g) || []).length;
    return { pdf, png, paginas };
  } finally { await browser.close(); }
}
if (require.main === module) gerarManual().then(r => {
  console.log(`PDF: ${path.relative(RAIZ, r.pdf)} (${r.paginas} página${r.paginas > 1 ? 's' : ''})`);
  console.log(`Imagem para redes sociais: ${path.relative(RAIZ, r.png)}`);
  if (r.paginas !== 1) { console.error('O manual passou de uma página: enxugue o texto ou o tamanho da letra de impressão.'); process.exit(1); }
}).catch(e => { console.error(e.message); process.exit(1); });
module.exports = { gerarManual, CHROME };
