/* Baixa a telemetria do Supabase para a pasta telemetria/ (fora do git) e gera telemetria/relatorio.md.
   Uso: npm run telemetria
   Precisa do arquivo .env na raiz com SUPABASE_URL e SUPABASE_SERVICE_KEY (a chave secreta; nunca commitar).
   Passo a passo: docs/telemetria-supabase.md */
const fs = require('fs');
const path = require('path');
const { analisar, relatorioMarkdown, semDuplicados } = require('./telemetria-analise');

const RAIZ = path.join(__dirname, '..');
const PASTA = process.env.SISP_TELEMETRIA_PASTA || path.join(RAIZ, 'telemetria');   // a variável serve para os testes
try { process.loadEnvFile(path.join(RAIZ, '.env')); } catch (e) { /* sem .env: avisa abaixo */ }

async function main() {
  const url = (process.env.SUPABASE_URL || '').replace(/\/$/, '');
  const chave = process.env.SUPABASE_SERVICE_KEY;
  if (!url || !chave) {
    console.error('Faltam SUPABASE_URL e SUPABASE_SERVICE_KEY no arquivo .env. Veja docs/telemetria-supabase.md.');
    process.exit(1);
  }
  fs.mkdirSync(path.join(PASTA, 'sessoes'), { recursive: true });
  const arqEventos = path.join(PASTA, 'eventos.jsonl'), arqUltimo = path.join(PASTA, '.ultimo-id');
  let ultimo = fs.existsSync(arqUltimo) ? Number(fs.readFileSync(arqUltimo, 'utf8')) || 0 : 0, novos = 0;

  // baixa só o que chegou desde a última vez, de 1000 em 1000
  for (;;) {
    const r = await fetch(`${url}/rest/v1/eventos?select=*&id=gt.${ultimo}&order=id.asc&limit=1000`, { headers: { apikey: chave, Authorization: 'Bearer ' + chave } });
    if (!r.ok) throw new Error(`O Supabase respondeu ${r.status}: ${await r.text()}`);
    const lote = await r.json();
    if (!lote.length) break;
    fs.appendFileSync(arqEventos, lote.map(e => JSON.stringify(e)).join('\n') + '\n');
    ultimo = lote[lote.length - 1].id; novos += lote.length;
    fs.writeFileSync(arqUltimo, String(ultimo));
    if (lote.length < 1000) break;
  }

  const brutos = fs.existsSync(arqEventos) ? fs.readFileSync(arqEventos, 'utf8').split('\n').filter(Boolean).map(l => JSON.parse(l)) : [];
  const todos = semDuplicados(brutos);   // eventos.jsonl continua bruto; daqui em diante, sem as cópias

  // um arquivo por sessão, no mesmo formato do "Baixar JSON" do painel de diagnóstico do jogo
  const porSessao = {};
  todos.forEach(e => (porSessao[e.sessao] = porSessao[e.sessao] || []).push(e));
  Object.entries(porSessao).forEach(([sessao, lista]) => {
    lista.sort((a, b) => a.t - b.t);
    const dia = new Date(lista[0].t).toISOString().slice(0, 10);
    const eventos = lista.map(e => ({ t: e.t, s: 1, tipo: e.tipo, onde: e.onde, ...e.dados }));
    fs.writeFileSync(path.join(PASTA, 'sessoes', `${dia}-${sessao.slice(0, 8)}.json`),
      JSON.stringify({ exportado: new Date().toISOString(), sessao, jogador: lista[0].jogador, versao: lista[0].versao, eventos }, null, 1));
  });

  // Fora do relatório: os códigos de TELEMETRIA_IGNORAR no .env (os seus navegadores de teste; o código aparece em
  // SISP › Configurações › Privacidade; vale o começo do código) e sessões que nunca passaram da tela de login.
  const ignorar = ['teste-configuracao', ...(process.env.TELEMETRIA_IGNORAR || '').split(',').map(s => s.trim()).filter(Boolean)];
  const entrou = new Set(todos.filter(e => e.tipo === 'sessao').map(e => e.sessao));
  const usados = todos.filter(e => !ignorar.some(p => e.jogador.startsWith(p)) && (entrou.has(e.sessao) || e.tipo === 'erro_js'));
  const a = analisar(usados);
  a.ignorados = { eventos: todos.length - usados.length, jogadores: new Set(todos.filter(e => ignorar.some(p => e.jogador.startsWith(p))).map(e => e.jogador)).size };
  fs.writeFileSync(path.join(PASTA, 'relatorio.md'), relatorioMarkdown(a));
  console.log(`${novos} evento(s) novo(s). Total: ${todos.length} eventos, ${a.sessoes} sessão(ões), ${a.jogadores} jogador(es).`);
  if (brutos.length > todos.length) console.log(`Cópias repetidas ignoradas: ${brutos.length - todos.length} (bug de envio corrigido na versão 2026-10-21-fila).`);
  console.log(`Fora do relatório: ${a.ignorados.eventos} evento(s) (${a.ignorados.jogadores} jogador(es) de TELEMETRIA_IGNORAR e sessões que não passaram do login).`);
  console.log('Relatório: telemetria/relatorio.md · Sessões: telemetria/sessoes/');
}

main().catch(e => { console.error('Não deu para baixar a telemetria: ' + e.message); process.exit(1); });
