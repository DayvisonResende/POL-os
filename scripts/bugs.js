/* Problemas e sugestões que os jogadores mandaram ao Cláudio, do TI (tabela "relatos" do Supabase).
   O tipo vai em contexto.tipo ('bug' ou 'sugestao'); relatos de antes das sugestões não têm tipo e contam como problema.
   Uso:
     npm run bugs                         lista os novos (e marca como "visto")
     npm run bugs -- --todos              lista todos, de qualquer status
     npm run bugs -- --sugestoes          só as sugestões (junta com --todos, se quiser)
     npm run bugs -- --problemas          só os problemas
     npm run bugs -- --resolver A7F3      marca o chamado A7F3 como resolvido
     npm run bugs -- --descartar A7F3     marca como descartado (não era bug, duplicado…)
     npm run bugs -- --nota A7F3 "texto"  guarda uma anotação sua no chamado
   Precisa do .env com SUPABASE_URL e SUPABASE_SERVICE_KEY (o mesmo da telemetria). Também salva tudo em
   telemetria/relatos.md (fora do git: são dados de jogadores). Criar a tabela: supabase/relatos.sql */
const fs = require('fs');
const path = require('path');
const RAIZ = path.join(__dirname, '..');
const PASTA = process.env.SISP_TELEMETRIA_PASTA || path.join(RAIZ, 'telemetria');
try { process.loadEnvFile(path.join(RAIZ, '.env')); } catch (e) { /* sem .env: avisa abaixo */ }

const tipoDe = r => (r.contexto && r.contexto.tipo) === 'sugestao' ? 'sugestao' : 'bug';
function formatar(r) {
  const c = r.contexto || {}, q = c.ultima_consulta, e = c.ultimo_erro_do_jogo, a = c.aparelho || {};
  return [
    `## ${tipoDe(r) === 'sugestao' ? '💡 Sugestão' : '🐞 Problema'} #${r.chamado} · ${r.status} · ${new Date(r.recebido_em).toLocaleString('pt-BR')}`,
    '',
    r.texto.split('\n').map(l => '> ' + l).join('\n'),
    '',
    `- **Onde:** ${c.onde || '?'} (dia ${c.dia != null ? c.dia + 1 : '?'}, ${c.patente || '?'})${c.treino ? ` · treino ${c.treino.modulo}, passo ${c.treino.passo}${c.treino.pausado ? ' (pausado)' : ''}` : ''}`,
    q ? `- **Última consulta** (${q.onde}, ${q.resultado}): \`${String(q.sql).replace(/\s+/g, ' ')}\`${q.erro ? `\n  → ${q.erro}` : ''}` : '- **Última consulta:** nenhuma',
    e ? `- **Erro do jogo:** ${e.msg} (${e.arquivo}:${e.linha}, ${e.quando})` : '- **Erro do jogo:** nenhum',
    `- **Aparelho:** ${[a.faixa, a.sistema, a.navegador, a.largura && a.largura + 'px', a.toque ? 'toque' : null].filter(Boolean).join(' · ')} · idioma ${c.idioma || '?'} · janelas: ${(c.janelas || []).join(', ') || 'nenhuma'}`,
    `- **Versão:** ${r.versao} · jogador \`${r.jogador}\` · sessão \`${c.sessao || '?'}\``,
    r.nota ? `- **Sua nota:** ${r.nota}` : null,
  ].filter(l => l !== null).join('\n');
}

async function main() {
  const url = (process.env.SUPABASE_URL || '').replace(/\/$/, ''), chave = process.env.SUPABASE_SERVICE_KEY;
  if (!url || !chave) { console.error('Faltam SUPABASE_URL e SUPABASE_SERVICE_KEY no arquivo .env. Veja docs/telemetria-supabase.md.'); process.exit(1); }
  const H = { apikey: chave, Authorization: 'Bearer ' + chave, 'Content-Type': 'application/json' };
  const args = process.argv.slice(2);
  const mudar = async (chamado, campos) => {
    const r = await fetch(`${url}/rest/v1/relatos?chamado=eq.${encodeURIComponent(chamado.toUpperCase())}`, { method: 'PATCH', headers: { ...H, Prefer: 'return=representation' }, body: JSON.stringify(campos) });
    if (!r.ok) throw new Error(`O Supabase respondeu ${r.status}: ${await r.text()}`);
    const l = await r.json();
    console.log(l.length ? `Chamado #${chamado.toUpperCase()}: ${JSON.stringify(campos)}` : `Chamado #${chamado.toUpperCase()} não encontrado.`);
  };
  for (const [flag, status] of [['--resolver', 'resolvido'], ['--descartar', 'descartado']]) {
    const i = args.indexOf(flag);
    if (i >= 0) return mudar(args[i + 1] || '', { status });
  }
  const n = args.indexOf('--nota');
  if (n >= 0) return mudar(args[n + 1] || '', { nota: args.slice(n + 2).join(' ') });

  const todos = args.includes('--todos');
  const r = await fetch(`${url}/rest/v1/relatos?select=*&order=recebido_em.asc${todos ? '' : '&status=eq.novo'}`, { headers: H });
  if (r.status === 404) { console.error('A tabela "relatos" não existe. Rode supabase/relatos.sql no SQL Editor do Supabase.'); process.exit(1); }
  if (!r.ok) throw new Error(`O Supabase respondeu ${r.status}: ${await r.text()}`);
  const so = args.includes('--sugestoes') ? 'sugestao' : args.includes('--problemas') ? 'bug' : null;
  const lista = (await r.json()).filter(x => !so || tipoDe(x) === so);
  if (!lista.length) { console.log(todos ? 'Nenhum relato ainda.' : 'Nenhum relato novo. (Para ver todos: npm run bugs -- --todos)'); return; }
  const nSug = lista.filter(x => tipoDe(x) === 'sugestao').length;
  const texto = `# Relatos ao Cláudio, do TI\n\n${lista.length} relato(s)${todos ? '' : ' novo(s)'}: ${lista.length - nSug} problema(s) e ${nSug} sugestão(ões), baixados em ${new Date().toLocaleString('pt-BR')}.\n\n` + lista.map(formatar).join('\n\n') + '\n';
  console.log(texto);
  fs.mkdirSync(PASTA, { recursive: true });
  fs.writeFileSync(path.join(PASTA, 'relatos.md'), texto);
  if (!todos) {
    const ids = lista.map(x => x.id).join(',');
    const m = await fetch(`${url}/rest/v1/relatos?id=in.(${ids})`, { method: 'PATCH', headers: { ...H, Prefer: 'return=minimal' }, body: JSON.stringify({ status: 'visto' }) });
    if (m.ok) console.log(`(${lista.length} marcado(s) como "visto". Salvo também em telemetria/relatos.md.)`);
  }
}
if (require.main === module) main().catch(e => { console.error(e.message); process.exit(1); });
module.exports = { formatar };
