/* Gerador 2 · Rotina de uma pessoa: dias de vida em dados (antenas, radares, ponto, compras, PIX).
   É a "normalidade" onde o crime vai ser plantado. Opcional: plantar uma anomalia, com o gabarito. */
'use strict';

const ANOMALIAS = {
  nenhuma: 'Nenhuma (só a rotina)',
  clonagem: 'Placa clonada: o carro aparece em dois lugares longe, com minutos de diferença',
  madrugada: 'Madrugada estranha: celular e carro no distrito industrial às 3h',
  saque: 'Saque fora do padrão: valor alto, longe de casa',
  encontro: 'Encontro suspeito: celular parado por 40 minutos perto do porto à noite',
};
function localDe(rng, bairros, perfil, excluir) {
  const l = bairros.filter(b => (!perfil || b.perfil === perfil) && b.nome !== excluir);
  const b = l.length ? U.pick(rng, l) : (() => { const pf = PERFIS_BAIRRO.find(p => p.id === perfil) || U.pick(rng, PERFIS_BAIRRO); return { nome: U.pick(rng, pf.prefixos) + ' ' + U.pick(rng, pf.nomes), ruas: [nomeDeRua(rng)] }; })();
  return { bairro: b.nome, rua: U.pick(rng, b.ruas && b.ruas.length ? b.ruas : [nomeDeRua(rng)]) };
}
function antenaId(bairro, n) { return 'ANT-' + U.slug(bairro).replace(/\./g, '').toUpperCase().slice(0, 6) + '-' + n; }

registrarGerador({
  id: 'rotina', numero: 2, grupo: 'Personagens e pessoas', nome: 'Rotina de uma pessoa', colecao: null,
  descricao: 'Pega uma pessoa do projeto (ou cria uma) e gera os dias dela em dados: antenas de celular, radares (se anda de carro ou moto), ponto, compras e PIX. Pode plantar uma anomalia; o gabarito marca o que foi plantado.',
  campos: [
    { id: 'pessoa', rotulo: 'Pessoa', tipo: 'projeto', colecao: 'pessoas', padrao: '', vazio: 'Criar uma pessoa nova' },
    { id: 'inicio', rotulo: 'Primeiro dia', tipo: 'data', padrao: '2026-10-05' },
    { id: 'dias', rotulo: 'Quantos dias', tipo: 'numero', padrao: 7, min: 1, max: 31 },
    { id: 'anomalia', rotulo: 'Anomalia a plantar', tipo: 'select', padrao: 'nenhuma', opcoes: Object.keys(ANOMALIAS).map(k => [k, ANOMALIAS[k]]) },
  ],
  gerar(v, ctx) {
    const rng = ctx.rng, pr = ctx.projeto, extras = [];
    let p = (pr.pessoas || []).find(x => x.id === v.pessoa);
    if (!p) { p = criarPessoa(rng, { papel: 'neutro', faixa: 'adulto' }, pr); extras.push({ colecao: 'pessoas', itens: [p] }); }
    const bairros = pr.bairros || [];
    const casa = { bairro: p.bairro, rua: p.endereco.split(',')[0] };
    const trab = localDe(rng, bairros, U.pick(rng, ['financeiro', 'industrial', 'governo', 'historico', 'universitario']), p.bairro);
    const motorizado = ['carro', 'moto'].includes(p.transporte);
    const veic = (pr.veiculos || []).find(x => x.dono_doc === p.cpf);
    const placa = motorizado ? (veic ? veic.placa : gerarPlaca(rng)) : null;
    const [hIni, hFim] = (p.horario_trabalho.match(/\d+/g) || [8, 17]).map(Number);
    const trabalha = !/não trabalha/.test(p.horario_trabalho);
    const ini = U.data(+v.inicio.slice(0, 4), +v.inicio.slice(5, 7), +v.inicio.slice(8, 10));
    const ev = [], gab = [];
    const push = (d, tipo, local, detalhe, tabela, linha, plantado) => { ev.push({ data_hora: U.dataHoraISO(d), tipo, local, detalhe, plantado: plantado ? 1 : 0, _t: tabela, _l: linha }); if (plantado) gab.push({ data_hora: U.dataHoraISO(d), tipo, explicacao: plantado }); };
    const radarCasa = 'Radar · ' + casa.rua, radarTrab = 'Radar · ' + trab.rua;
    for (let d = 0; d < v.dias; d++) {
      const dia = U.somarMin(ini, d * 1440), util = ![0, 6].includes(dia.getUTCDay()) && trabalha;
      const em = (h, m) => U.data(dia.getUTCFullYear(), dia.getUTCMonth() + 1, dia.getUTCDate(), h, m, U.int(rng, 0, 59));
      push(em(U.int(rng, 0, 5), U.int(rng, 0, 59)), 'antena', casa.bairro, 'celular conectado em casa', 'antenas', { telefone: p.telefone, antena_id: antenaId(casa.bairro, 1), local: casa.bairro });
      if (util) {
        const sai = U.somarMin(em(Math.max(0, hIni - 1), U.int(rng, 0, 40)), 0);
        if (motorizado) push(U.somarMin(sai, U.int(rng, 5, 15)), 'radar', radarCasa, placa + ' a ' + U.int(rng, 35, 70) + ' km/h', 'radares', { placa, local: radarCasa, velocidade_kmh: U.int(rng, 35, 70) });
        push(U.somarMin(sai, U.int(rng, 30, 55)), 'antena', trab.bairro, 'celular perto do trabalho', 'antenas', { telefone: p.telefone, antena_id: antenaId(trab.bairro, 2), local: trab.bairro });
        const entrada = em(hIni, U.int(rng, 0, 12)), saida = em(hFim, U.int(rng, 0, 25));
        push(entrada, 'ponto', trab.bairro, 'entrada ' + U.horaISO(entrada) + ', saída ' + U.horaISO(saida), 'ponto', { cpf: p.cpf, data: U.dataISO(dia), entrada: U.horaISO(entrada), saida: U.horaISO(saida) });
        if (U.chance(rng, 0.7)) { const val = Math.round(U.real(rng, 18, 45) * 100) / 100; push(em(12, U.int(rng, 0, 50)), 'compra', trab.bairro, 'almoço · ' + U.moeda(val), 'compras', { cpf: p.cpf, estabelecimento: 'Restaurante ' + U.pick(rng, MARCA_EMPRESA), valor: val, forma: U.pick(rng, ['débito', 'PIX', 'crédito']) }); }
        if (motorizado) push(U.somarMin(saida, U.int(rng, 8, 25)), 'radar', radarTrab, placa + ' a ' + U.int(rng, 35, 75) + ' km/h', 'radares', { placa, local: radarTrab, velocidade_kmh: U.int(rng, 35, 75) });
        push(U.somarMin(saida, U.int(rng, 40, 80)), 'antena', casa.bairro, 'celular de volta em casa', 'antenas', { telefone: p.telefone, antena_id: antenaId(casa.bairro, 1), local: casa.bairro });
      } else {
        const lazer = localDe(rng, bairros, U.pick(rng, ['historico', 'litoral', 'universitario', 'periferia']), p.bairro);
        const h = U.int(rng, 9, 16);
        push(em(h, U.int(rng, 0, 59)), 'antena', lazer.bairro, 'passeio / compras', 'antenas', { telefone: p.telefone, antena_id: antenaId(lazer.bairro, 3), local: lazer.bairro });
        const val = Math.round(U.real(rng, 30, Math.max(60, (p.renda || 800) * 0.05)) * 100) / 100;
        push(em(h + 1, U.int(rng, 0, 59)), 'compra', lazer.bairro, 'mercado · ' + U.moeda(val), 'compras', { cpf: p.cpf, estabelecimento: 'Mercado ' + U.pick(rng, MARCA_EMPRESA), valor: val, forma: U.pick(rng, ['débito', 'PIX']) });
      }
      if (U.chance(rng, 0.25)) { const val = Math.round(U.real(rng, 10, 300) * 100) / 100; push(em(U.int(rng, 8, 22), U.int(rng, 0, 59)), 'pix', casa.bairro, 'PIX para amigo · ' + U.moeda(val), 'pix', { origem_cpf: p.cpf, destino: 'conta de amigo', valor: val, descricao: U.pick(rng, DESCRICOES_PIX) }); }
    }
    // anomalia plantada num dia útil do meio do período
    const diaA = U.somarMin(ini, Math.floor(v.dias / 2) * 1440), emA = (h, m) => U.data(diaA.getUTCFullYear(), diaA.getUTCMonth() + 1, diaA.getUTCDate(), h, m, U.int(rng, 0, 59));
    if (v.anomalia === 'clonagem') {
      const pl = placa || gerarPlaca(rng), longe = localDe(rng, bairros, U.pick(rng, ['periferia', 'rodoviaria', 'porto']), trab.bairro);
      const real = emA(hIni + 2, 10);
      if (!placa) push(real, 'radar', radarTrab, pl + ' a 52 km/h', 'radares', { placa: pl, local: radarTrab, velocidade_kmh: 52 });
      push(U.somarMin(real, U.int(rng, 3, 9)), 'radar', 'Radar · ' + longe.rua, pl + ' a ' + U.int(rng, 60, 95) + ' km/h', 'radares', { placa: pl, local: 'Radar · ' + longe.rua, velocidade_kmh: U.int(rng, 60, 95) }, 'a mesma placa em ' + longe.bairro + ' minutos depois de passar perto do trabalho: impossível de carro. Placa clonada.');
    }
    if (v.anomalia === 'madrugada') {
      const ind = localDe(rng, bairros, 'industrial');
      push(emA(3, U.int(rng, 0, 30)), 'antena', ind.bairro, 'celular no distrito industrial às 3h', 'antenas', { telefone: p.telefone, antena_id: antenaId(ind.bairro, 7), local: ind.bairro }, 'fora de qualquer padrão: o celular nunca sai de casa de madrugada');
      if (placa) push(emA(3, U.int(rng, 31, 59)), 'radar', 'Radar · ' + ind.rua, placa + ' a 88 km/h', 'radares', { placa, local: 'Radar · ' + ind.rua, velocidade_kmh: 88 }, 'o carro também estava lá');
    }
    if (v.anomalia === 'saque') {
      const longe = localDe(rng, bairros, 'rodoviaria'), val = Math.round(U.real(rng, Math.max(5000, (p.renda || 1000) * 4), Math.max(15000, (p.renda || 1000) * 10)));
      push(emA(15, U.int(rng, 0, 59)), 'saque', longe.bairro, 'saque de ' + U.moeda(val) + ' no caixa', 'saques', { cpf: p.cpf, local: longe.bairro, valor: val }, 'saque muito acima da renda (' + U.moeda(p.renda) + '/mês), longe de casa e do trabalho');
    }
    if (v.anomalia === 'encontro') {
      const porto = localDe(rng, bairros, 'porto'), h = emA(22, U.int(rng, 10, 40));
      for (let k = 0; k < 5; k++) push(U.somarMin(h, k * 10), 'antena', porto.bairro, 'celular parado perto do porto', 'antenas', { telefone: p.telefone, antena_id: antenaId(porto.bairro, 9), local: porto.bairro }, k === 0 ? 'celular parado 40 minutos perto do porto à noite, fora da rotina' : null);
    }
    ev.sort((a, b) => a.data_hora < b.data_hora ? -1 : 1);
    // tabelas por tipo de registro, já no formato de banco
    const tabelas = {};
    ev.forEach(e => { if (!e._t) return; (tabelas[e._t] = tabelas[e._t] || []).push(Object.assign({ data_hora: e.data_hora }, e._l)); });
    const lista = ev.map(e => ({ data_hora: e.data_hora, tipo: e.tipo, local: e.local, detalhe: e.detalhe, plantado: e.plantado }));
    return {
      resumo: v.dias + ' dia(s) de ' + p.nome + ' (' + p.profissao + ', ' + p.transporte + '): ' + ev.length + ' registros' + (gab.length ? ', ' + gab.length + ' plantado(s)' : '') + '.',
      avisos: v.anomalia === 'clonagem' && !motorizado ? [p.nome + ' anda de ' + p.transporte + ': a placa clonada plantada é de um carro que não aparece no resto da rotina. Para um caso coerente, escolha uma pessoa que anda de carro.'] : [],
      itens: [], colecao: null, extras,
      cartoes: [{ titulo: p.nome, subtitulo: p.profissao + ' · mora em ' + casa.bairro + ' · trabalha em ' + trab.bairro + (placa ? ' · placa ' + placa : ''), html: '<ol class="linha-tempo">' + lista.map(e => '<li' + (e.plantado ? ' class="plantado"' : '') + '><b>' + e.data_hora.slice(5, 16) + '</b> ' + U.esc(e.tipo) + ' · ' + U.esc(e.local) + ' · ' + U.esc(e.detalhe) + '</li>').join('') + '</ol>' }],
      tabelas: [{ nome: 'linha_do_tempo', colunas: ['data_hora', 'tipo', 'local', 'detalhe', 'plantado'], linhas: lista }]
        .concat(Object.keys(tabelas).map(k => ({ nome: k, colunas: Object.keys(tabelas[k][0]), linhas: tabelas[k] })))
        .concat(gab.length ? [{ nome: 'gabarito', colunas: ['data_hora', 'tipo', 'explicacao'], linhas: gab }] : []),
      texto: '# Rotina de ' + p.nome + '\n' + lista.map(e => (e.plantado ? '⚠ ' : '- ') + e.data_hora + ' · ' + e.tipo + ' · ' + e.local + ' · ' + e.detalhe).join('\n'),
    };
  },
});
