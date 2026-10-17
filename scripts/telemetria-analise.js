/* Análise da telemetria remota (linhas da tabela eventos do Supabase). Usada por scripts/telemetria.js e pelos testes.
   Linha: {id, recebido_em, jogador, sessao, versao, t, tipo, onde, dados} */
const OCIO_MS = 300 * 1000;   // intervalo maior que isso entre dois eventos conta como pausa, não como tempo jogado

// Marcos do jogo, em ordem: o funil mostra quantos jogadores chegam a cada um.
const MARCOS = [
  ['Abriu o jogo', e => e.tipo === 'sessao'],
  ['Terminou o treinamento do Módulo 1', e => e.tipo === 'treino_fim' && e.dados.treino === 'm1'],
  ['Fechou o BO 1001', e => e.tipo === 'desfecho' && e.dados.caso === '1001' && e.dados.ok],
  ['Passou na prova do Módulo 1', e => e.tipo === 'prova' && /Módulo 1/.test(e.dados.onde || e.onde) && e.dados.nota >= 4],
  ['Terminou o treinamento Filtros', e => e.tipo === 'treino_fim' && e.dados.treino === 'm2-filtros'],
  ['Fechou o BO 1002', e => e.tipo === 'desfecho' && e.dados.caso === '1002' && e.dados.ok],
  ['Terminou o treinamento Intervalos', e => e.tipo === 'treino_fim' && e.dados.treino === 'm2-intervalos'],
  ['Fechou o BO 1003', e => e.tipo === 'desfecho' && e.dados.caso === '1003' && e.dados.ok],
  ['Passou na prova do Módulo 2', e => e.tipo === 'prova' && /Módulo 2/.test(e.dados.onde || e.onde) && e.dados.nota >= 4],
];

const contar = (lista, chave) => { const m = {}; lista.forEach(x => { const k = chave(x); if (k != null && k !== '') m[k] = (m[k] || 0) + 1; }); return Object.entries(m).sort((a, b) => b[1] - a[1]); };
const mediana = v => { if (!v.length) return 0; const s = [...v].sort((a, b) => a - b), m = Math.floor(s.length / 2); return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2; };

function analisar(linhas) {
  const ev = linhas.map(l => ({ ...l, dados: l.dados || {} })).sort((a, b) => a.t - b.t);
  const porSessao = {}, porJogador = {};
  ev.forEach(e => { (porSessao[e.sessao] = porSessao[e.sessao] || []).push(e); (porJogador[e.jogador] = porJogador[e.jogador] || []).push(e); });

  // tempo ativo por lugar, por jogador (o tempo até o próximo evento da mesma sessão conta para o lugar do evento)
  const lugares = {};
  const lugar = o => lugares[o] = lugares[o] || { onde: o, ordem: Infinity, tempos: {}, jogadores: new Set(), consultas: 0, erros: 0, vazias: 0, tropecos: 0, dicas: 0 };
  const ativoSessao = {};
  Object.values(porSessao).forEach(lista => {
    let ativo = 0;
    lista.forEach((e, i) => {
      const L = lugar(e.onde || '(sem lugar)'), prox = lista[i + 1];
      L.ordem = Math.min(L.ordem, e.t); L.jogadores.add(e.jogador);
      if (prox) { const d = prox.t - e.t; if (d <= OCIO_MS && e.tipo !== 'pausa') { L.tempos[e.jogador] = (L.tempos[e.jogador] || 0) + d; ativo += d; } }
      if (e.tipo === 'consulta') { L.consultas++; if (e.dados.res === 'erro' || e.dados.res === 'bloqueada') L.erros++; if (e.dados.res === 'vazio') L.vazias++; }
      if (e.tipo === 'tropeco') L.tropecos++;
      if (e.tipo === 'dica') L.dicas++;
    });
    ativoSessao[lista[0].sessao] = ativo;
  });
  const tabelaLugares = Object.values(lugares).sort((a, b) => a.ordem - b.ordem).map(L => {
    const n = L.jogadores.size;
    return { onde: L.onde, jogadores: n, minutosMediana: +(mediana(Object.values(L.tempos)) / 60000).toFixed(1),
      consultas: L.consultas, erros: L.erros, vazias: L.vazias, tropecos: L.tropecos, dicas: L.dicas,
      problemasPorJogador: n ? +((L.erros + L.vazias + L.tropecos + L.dicas) / n).toFixed(1) : 0 };
  });

  const jogadores = Object.keys(porJogador);
  const funil = MARCOS.map(([rotulo, f]) => [rotulo, jogadores.filter(j => porJogador[j].some(f)).length]);
  const terminou = j => porJogador[j].some(MARCOS[MARCOS.length - 1][1]);
  const ultimoLugar = j => { const l = porJogador[j].filter(e => !['saida', 'pausa', 'volta'].includes(e.tipo)); return l.length ? l[l.length - 1].onde : null; };
  const sessoes = ev.filter(e => e.tipo === 'sessao').map(e => e.dados);

  return {
    eventos: ev.length, jogadores: jogadores.length, sessoes: Object.keys(porSessao).length,
    versoes: contar(Object.values(porSessao), l => l[0].versao),
    minutosAtivosMediana: +(mediana(Object.values(ativoSessao)) / 60000).toFixed(1),
    funil, lugares: tabelaLugares,
    maisProblematicos: [...tabelaLugares].filter(l => l.jogadores > 0).sort((a, b) => b.problemasPorJogador - a.problemasPorJogador).slice(0, 10),
    maisDemorados: [...tabelaLugares].sort((a, b) => b.minutosMediana - a.minutosMediana).slice(0, 10),
    ondeDesistiram: contar(jogadores.filter(j => !terminou(j)), ultimoLugar),
    errosSql: contar(ev.filter(e => e.tipo === 'consulta' && e.dados.res === 'erro'), e => e.dados.erro).slice(0, 15),
    tropecos: contar(ev.filter(e => e.tipo === 'tropeco'), e => (e.onde || '') + ' — ' + e.dados.msg).slice(0, 15),
    dicasAutomaticas: contar(ev.filter(e => e.tipo === 'dica_auto'), e => e.dados.texto).slice(0, 15),
    escolhasErradas: contar(ev.filter(e => e.tipo === 'escolha' && !e.dados.certa), e => (e.onde || '') + ' — ' + (e.dados.peca != null ? 'peça ' + e.dados.peca : 'opção ' + e.dados.opcao)).slice(0, 15),
    errosDoJogo: contar(ev.filter(e => e.tipo === 'erro_js'), e => `${e.dados.msg} (${e.dados.arquivo}:${e.dados.linha})`),
    dilemaBeto: contar(ev.filter(e => e.tipo === 'dilema' && e.dados.quem === 'beto'), e => e.dados.escolha),
    respostasBeto: contar(ev.filter(e => e.tipo === 'beto'), e => (e.dados.aceita ? '✓ ' : '✗ ') + e.dados.resposta).slice(0, 10),
    aparelhos: { faixa: contar(sessoes, s => s.faixa), navegador: contar(sessoes, s => s.navegador), sistema: contar(sessoes, s => s.sistema) },
    msBancoMediana: Math.round(mediana(sessoes.map(s => s.msBanco).filter(Number.isFinite))),
  };
}

function relatorioMarkdown(a, agora = new Date()) {
  const lista = (t, l) => `\n## ${t}\n\n` + (l.length ? l.map(([k, n]) => `- **${n}×** ${k}`).join('\n') : '_Nada registrado._') + '\n';
  const pct = (n, tot) => tot ? Math.round(n / tot * 100) + '%' : '—';
  const tab = (cab, linhas) => `| ${cab.join(' | ')} |\n|${cab.map(() => '---').join('|')}|\n` + linhas.map(l => `| ${l.join(' | ')} |`).join('\n') + '\n';
  return `# Telemetria do SISP — relatório automático

Gerado em ${agora.toLocaleString('pt-BR')} por \`npm run telemetria\`. Dados anônimos, enviados com consentimento.

**${a.jogadores}** jogador(es) · **${a.sessoes}** sessão(ões) · **${a.eventos}** eventos · tempo ativo mediano por sessão: **${a.minutosAtivosMediana} min** · carregamento mediano do banco: **${a.msBancoMediana} ms**
Versões: ${a.versoes.map(([v, n]) => `${v} (${n})`).join(', ') || '—'}

## Funil: quantos jogadores chegam a cada etapa

${tab(['Etapa', 'Jogadores', '% de quem abriu'], a.funil.map(([r, n]) => [r, n, pct(n, a.funil[0][1])]))}
## Onde mais travam (erros, vazios, tropeços e dicas por jogador)

${tab(['Lugar', 'Jogadores', 'Problemas/jogador', 'Min (mediana)', 'Erros', 'Vazias', 'Tropeços', 'Dicas'], a.maisProblematicos.map(l => [l.onde, l.jogadores, l.problemasPorJogador, l.minutosMediana, l.erros, l.vazias, l.tropecos, l.dicas]))}
## Onde mais demoram

${tab(['Lugar', 'Min (mediana)', 'Jogadores'], a.maisDemorados.map(l => [l.onde, l.minutosMediana, l.jogadores]))}${lista('Onde pararam (jogadores que ainda não terminaram)', a.ondeDesistiram)}${lista('Erros de SQL mais comuns', a.errosSql)}${lista('Broncas da Célia mais repetidas', a.tropecos)}${lista('Dicas automáticas mais exibidas', a.dicasAutomaticas)}${lista('Escolhas erradas mais comuns nos treinamentos', a.escolhasErradas)}${lista('Erros técnicos do jogo (corrigir!)', a.errosDoJogo)}${lista('Dilema do Beto', a.dilemaBeto)}${lista('Respostas ao Beto (horário de saída)', a.respostasBeto)}
## Aparelhos

- Tela: ${a.aparelhos.faixa.map(([k, n]) => `${k} (${n})`).join(', ') || '—'}
- Navegador: ${a.aparelhos.navegador.map(([k, n]) => `${k} (${n})`).join(', ') || '—'}
- Sistema: ${a.aparelhos.sistema.map(([k, n]) => `${k} (${n})`).join(', ') || '—'}

## Todos os lugares, na ordem do jogo

${tab(['Lugar', 'Jogadores', 'Min (mediana)', 'Consultas', 'Erros', 'Vazias', 'Tropeços', 'Dicas'], a.lugares.map(l => [l.onde, l.jogadores, l.minutosMediana, l.consultas, l.erros, l.vazias, l.tropecos, l.dicas]))}`;
}

module.exports = { analisar, relatorioMarkdown, MARCOS };
