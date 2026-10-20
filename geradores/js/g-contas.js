/* Gerador 6 · Contas e transações: a movimentação normal (salário, aluguel, mercado, PIX entre amigos) e,
   se pedido, um padrão criminoso plantado no meio, com o gabarito (quais transações foram plantadas e por quê). */
'use strict';

const PADROES = {
  nenhum: 'Nenhum (só movimentação normal)',
  fracionamento: 'Fracionamento: depósitos em espécie logo abaixo de R$ 10 mil',
  carrossel: 'Carrossel: o dinheiro dá voltas por várias contas e volta à origem',
  laranjas: 'Laranjas: contas de idosos recebem em espécie e repassam a uma conta central',
  golpe_serie: 'Golpe em série: muitas vítimas pagam a uma conta de passagem que esvazia em minutos',
  saque_atipico: 'Saque atípico: quem ganha pouco saca um valor muito alto',
};
function criarConta(rng, id, titular, bancos) {
  const anos = titular.tipo === 'PJ' ? [titular.aberta ? +titular.aberta.slice(0, 4) : 2015, 2026] : [2008, 2025];
  return { id, banco: U.pick(rng, bancos), agencia: U.digitos(rng, 4), numero: U.int(rng, 10000, 99999) + '-' + U.int(rng, 0, 9),
    titular_doc: titular.doc, titular_nome: titular.nome, tipo: titular.tipo, renda: titular.renda || 0, idade: titular.idade || 0,
    aberta_em: U.dataISO(U.data(U.int(rng, anos[0], Math.max(anos[0], anos[1] - 1)), U.int(rng, 1, 12), U.int(rng, 1, 28))) };
}
function hora(rng, d, h0, h1) { return U.dataHoraISO(U.data(d.getUTCFullYear(), d.getUTCMonth() + 1, d.getUTCDate(), U.int(rng, h0, h1), U.int(rng, 0, 59), U.int(rng, 0, 59))); }
function centavos(v) { return Math.round(v * 100) / 100; }

registrarGerador({
  id: 'contas', numero: 6, grupo: 'Mundo e lugares', nome: 'Contas e transações', colecao: 'contas',
  descricao: 'Contas (bancos fictícios) para as pessoas e empresas do projeto e um período de movimentação realista. Pode plantar um padrão criminoso; o gabarito diz exatamente o que foi plantado. Exporta direto em SQL para o banco do jogo.',
  campos: [
    { id: 'titulares', rotulo: 'Titulares', tipo: 'select', padrao: 'projeto', opcoes: [['projeto', 'Pessoas e empresas do projeto (ou novas, se não houver)'], ['novos', 'Sempre pessoas novas']] },
    { id: 'quantidade', rotulo: 'Pessoas novas (se não houver no projeto)', tipo: 'numero', padrao: 20, min: 3, max: 300 },
    { id: 'inicio', rotulo: 'Início do período', tipo: 'data', padrao: '2026-09-01' },
    { id: 'dias', rotulo: 'Dias de movimentação', tipo: 'numero', padrao: 42, min: 1, max: 365 },
    { id: 'padrao', rotulo: 'Padrão criminoso a plantar', tipo: 'select', padrao: 'nenhum', opcoes: Object.keys(PADROES).map(k => [k, PADROES[k]]) },
  ],
  gerar(v, ctx) {
    const rng = ctx.rng, pr = ctx.projeto, novos = [];
    let titulares = v.titulares === 'projeto' ? (pr.pessoas || []).map(p => ({ doc: p.cpf, nome: p.nome, renda: p.renda, idade: p.idade, papel: p.papel, tipo: 'PF' })).concat((pr.empresas || []).map(e => ({ doc: e.cnpj, nome: e.razao_social, tipo: 'PJ', aberta: e.aberta_em, ramo: e.ramo }))) : [];
    if (!titulares.length) for (let i = 0; i < v.quantidade; i++) { const p = criarPessoa(rng, { papel: 'neutro' }, pr); novos.push(p); titulares.push({ doc: p.cpf, nome: p.nome, renda: p.renda, idade: p.idade, papel: p.papel, tipo: 'PF' }); }
    // comércio para onde vão as compras do dia a dia (cria empresas genéricas se o projeto não tiver)
    let lojas = titulares.filter(t => t.tipo === 'PJ');
    if (!lojas.length) lojas = ['Mercado Bom Preço', 'Farmácia Popular da Esquina', 'Posto Avenida', 'Padaria Pão Quente'].map(n => ({ doc: gerarCnpjFicticio(rng), nome: n + ' Ltda', tipo: 'PJ' }));
    const bancos = BANCOS_FICTICIOS;
    const todos = titulares.concat(lojas.filter(l => !titulares.includes(l)));
    const maiorId = col => Math.max(0, ...(pr[col] || []).map(x => typeof x.id === 'number' ? x.id : 0));
    const baseConta = maiorId('contas'), baseTr = maiorId('transacoes');   // continua a numeração do projeto: origem/destino não quebram ao salvar
    const contas = todos.map((t, i) => criarConta(rng, baseConta + i + 1, t, bancos));
    const pf = contas.filter(c => c.tipo === 'PF'), pj = contas.filter(c => c.tipo === 'PJ');
    const ini = U.data(+v.inicio.slice(0, 4), +v.inicio.slice(5, 7), +v.inicio.slice(8, 10));
    const tr = [], gabarito = [];
    const add = (origem, destino, valor, dataHora, tipo, descricao, plantada) => {
      const id = tr.length + 1; tr.push({ id, origem: origem ? origem.id : null, destino: destino ? destino.id : null, valor: centavos(valor), data_hora: dataHora, tipo, descricao: descricao == null ? null : descricao });
      if (plantada) gabarito.push({ transacao: id, padrao: v.padrao, explicacao: plantada }); return id;
    };
    // movimentação normal, dia a dia
    for (let d = 0; d < v.dias; d++) {
      const dia = U.somarMin(ini, d * 1440), dom = dia.getUTCDate(), fds = [0, 6].includes(dia.getUTCDay());
      pf.forEach(c => {
        if (dom === 5 && c.renda > 0 && pj.length) add(U.pick(rng, pj), c, c.renda * U.real(rng, 0.85, 0.95), hora(rng, dia, 6, 9), 'TED', 'salário');
        if (dom === 10 && c.renda > 1500 && U.chance(rng, 0.5)) add(c, U.pick(rng, pf.filter(x => x !== c)), Math.max(600, c.renda * U.real(rng, 0.2, 0.35)), hora(rng, dia, 8, 20), 'PIX', 'aluguel');
        if (U.chance(rng, fds ? 0.5 : 0.25) && pj.length) add(c, U.pick(rng, pj), U.real(rng, 15, Math.max(40, c.renda * 0.06)), hora(rng, dia, 8, 21), U.pick(rng, ['PIX', 'PIX', 'DÉBITO']), U.pick(rng, ['mercado', 'farmácia', 'posto', 'padaria', null]));
        if (U.chance(rng, 0.07)) add(c, U.pick(rng, pf.filter(x => x !== c)), U.real(rng, 10, 400), hora(rng, dia, 7, 23), 'PIX', U.pick(rng, DESCRICOES_PIX));
      });
    }
    // padrões plantados (acrescentados no fim, como no banco do jogo)
    const alvo = (filtro) => { const l = pf.filter(filtro); return l.length ? U.pick(rng, l) : U.pick(rng, pf); };
    const fim = U.somarMin(ini, (v.dias - 2) * 1440);
    if (v.padrao === 'fracionamento') {
      const conta = alvo(c => c.renda < 4000), central = alvo(c => c !== conta), n = U.int(rng, 8, 14);
      for (let i = 0; i < n; i++) add(null, conta, U.real(rng, 9000, 9990), hora(rng, U.somarMin(fim, U.int(rng, 0, 1) * 1440), 9, 16), 'DEPÓSITO', 'DEPÓSITO EM ESPÉCIE', 'depósito em espécie logo abaixo de R$ 10 mil na conta de ' + conta.titular_nome);
      add(conta, central, n * 9300, hora(rng, U.somarMin(fim, 2 * 1440), 9, 12), 'TED', 'transferência', 'o total dos depósitos sai de uma vez para ' + central.titular_nome);
    }
    if (v.padrao === 'carrossel') {
      const roda = U.amostra(rng, pj.length >= 4 ? pj : contas, U.int(rng, 4, Math.min(6, contas.length)));
      let valor = U.real(rng, 80000, 400000);
      for (let volta = 0; volta < U.int(rng, 2, 3); volta++) roda.forEach((c, i) => {
        const prox = roda[(i + 1) % roda.length]; valor *= U.real(rng, 0.97, 0.995);
        add(c, prox, valor, hora(rng, U.somarMin(ini, U.int(rng, 1, v.dias - 1) * 1440), 9, 17), 'TED', U.pick(rng, ['consultoria', 'prestação de serviços', 'mútuo', 'nota de serviço']), 'volta ' + (volta + 1) + ': ' + c.titular_nome + ' → ' + prox.titular_nome + ' (o dinheiro volta à origem)');
      });
    }
    if (v.padrao === 'laranjas') {
      const central = alvo(c => c.renda >= 3000), idosos = pf.filter(c => c !== central).sort((a, b) => b.idade - a.idade).slice(0, 6);
      idosos.forEach(c => {
        c.aberta_em = U.dataISO(U.somarMin(ini, -U.int(rng, 10, 40) * 1440));
        for (let k = 0; k < U.int(rng, 1, 2); k++) {
          const dep = U.real(rng, 9400, 9960), dia = U.somarMin(fim, U.int(rng, 0, 1) * 1440);
          add(null, c, dep, hora(rng, dia, 8, 11), 'DEPÓSITO', 'DEPÓSITO EM ESPÉCIE', 'espécie entra na conta de ' + c.titular_nome + ' (aberta há pouco)');
          add(c, central, dep - U.real(rng, 50, 300), hora(rng, dia, 13, 17), 'PIX', 'PIX', 'e é repassado no mesmo dia para ' + central.titular_nome);
        }
      });
    }
    if (v.padrao === 'golpe_serie') {
      const passagem = alvo(c => c.renda < 2500), destinos = U.amostra(rng, pf.filter(c => c !== passagem), Math.max(1, Math.min(4, Math.floor((pf.length - 1) / 3)))), vitimas = U.amostra(rng, pf.filter(c => c !== passagem && !destinos.includes(c)), 30);
      const dia = U.somarMin(fim, 1440); let total = 0;
      vitimas.forEach(c => { const val = U.real(rng, 300, 4800); total += val; add(c, passagem, val, U.dataHoraISO(U.somarMin(dia, U.int(rng, 600, 780))), 'PIX', U.pick(rng, ['PIX', 'urgente', 'ajuda', null]), 'vítima ' + c.titular_nome + ' paga à conta de passagem'); });
      destinos.forEach((c, i) => add(passagem, c, total / destinos.length, U.dataHoraISO(U.somarMin(dia, 790 + i * U.int(rng, 1, 4))), 'PIX', null, 'a conta de passagem esvazia em minutos para ' + c.titular_nome));
    }
    if (v.padrao === 'saque_atipico') {
      const c = alvo(x => x.renda > 0 && x.renda < 2500);
      add(c, null, U.real(rng, 40000, 120000), hora(rng, fim, 10, 15), 'SAQUE', 'saque no caixa', 'saque de quem declara renda de ' + U.moeda(c.renda) + '/mês');
    }
    tr.sort((a, b) => a.data_hora < b.data_hora ? -1 : 1);
    const novoId = new Map(); tr.forEach((t, i) => { novoId.set(t.id, baseTr + i + 1); t.id = baseTr + i + 1; });
    gabarito.forEach(g => g.transacao = novoId.get(g.transacao));
    const linhasContas = contas.map(c => ({ id: c.id, banco: c.banco, agencia: c.agencia, numero: c.numero, titular_doc: c.titular_doc, titular_nome: c.titular_nome, tipo: c.tipo, aberta_em: c.aberta_em }));
    return {
      resumo: contas.length + ' contas e ' + tr.length + ' transações em ' + v.dias + ' dias' + (gabarito.length ? '; ' + gabarito.length + ' transações plantadas (' + PADROES[v.padrao].split(':')[0] + '), ver o gabarito' : '') + '.',
      avisos: ['Bancos fictícios. A coluna "origem" vazia (NULL) é dinheiro em espécie, como no BO 1005.'],
      itens: linhasContas, colecao: 'contas', extras: [{ colecao: 'transacoes', itens: tr }].concat(novos.length ? [{ colecao: 'pessoas', itens: novos }] : []),
      tabelas: [{ nome: 'contas', colunas: Object.keys(linhasContas[0]), linhas: linhasContas }, { nome: 'transacoes', colunas: ['id', 'origem', 'destino', 'valor', 'data_hora', 'tipo', 'descricao'], linhas: tr }]
        .concat(gabarito.length ? [{ nome: 'gabarito', colunas: ['transacao', 'padrao', 'explicacao'], linhas: gabarito }] : []),
      texto: '# Contas e transações\n' + contas.length + ' contas, ' + tr.length + ' transações.\n' + (gabarito.length ? '\n## Gabarito (' + PADROES[v.padrao] + ')\n' + gabarito.map(g => '- transação ' + g.transacao + ': ' + g.explicacao).join('\n') : ''),
    };
  },
});
