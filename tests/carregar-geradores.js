/* Carrega os scripts de geradores/ (na ordem do index.html) num contexto isolado, sem navegador. */
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const RAIZ = path.join(__dirname, '..', 'geradores');
function scriptsDosGeradores() {
  const html = fs.readFileSync(path.join(RAIZ, 'index.html'), 'utf8');
  return [...html.matchAll(/<script src="(js\/[^"]+)"><\/script>/g)].map(m => m[1]).filter(f => !/app\.js$/.test(f));
}
function carregarGeradores(lista) {
  const armazem = {};
  const ctx = vm.createContext({ console, localStorage: { getItem: k => armazem[k] || null, setItem: (k, v) => { armazem[k] = String(v); } } });
  for (const f of lista || scriptsDosGeradores()) vm.runInContext(fs.readFileSync(path.join(RAIZ, f), 'utf8'), ctx, { filename: f });
  // as declarações de topo (const/function) ficam no escopo global do contexto: exporta o que os testes usam
  return vm.runInContext('({ U, GERADORES, gerador, rodarGerador, novoProjeto, adicionarAoProjeto, cpfValido, cnpjValido, gerarCpfFicticio, gerarCnpjFicticio, paraSQL, paraCSV, criarRng, TERMOS_PROIBIDOS, CRIMES, TECNICAS, ARMADILHAS, FACCOES_PADRAO, verificarNome, verificarDocumentos, MARCA_EMPRESA, PERFIS_BAIRRO, BANCOS_FICTICIOS, NATUREZA_JURIDICA, RAMOS, PALAVRAS_CASO, ADJETIVOS_CASO, COMPLEMENTOS_CASO, NOVAS_ESPECIALIDADES, CATEGORIAS_PRODUCAO, COLECOES })', ctx);
}
module.exports = { carregarGeradores, scriptsDosGeradores, RAIZ };
