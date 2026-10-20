/* Gerador 5 · Veículos e placas: modelo, cor, ano e valor coerentes com a renda do dono.
   Opção para casos: carros caros no nome de quem não tem renda (o padrão da Hilux do Valdemar). */
'use strict';

const COR_EN = { branco: 'white', prata: 'silver', cinza: 'grey', preto: 'black', vermelho: 'red', azul: 'blue', verde: 'green', bege: 'beige' };
function chassiFicticio(rng) { const c = 'ABCDEFGHJKLMNPRSTUVWXYZ0123456789'; return '9' + Array.from({ length: 16 }, () => c[U.int(rng, 0, c.length - 1)]).join(''); }
function valorVeiculo(rng, m, ano) { return Math.round(m.preco * Math.pow(0.88, Math.max(0, 2026 - ano)) * U.real(rng, 0.92, 1.08) / 100) * 100; }
function criarVeiculo(rng, dono, o = {}) {
  const ref = DATA_REFERENCIA.getUTCFullYear();
  const renda = dono ? dono.renda || 0 : 0;
  const lista = MODELOS.filter(m => o.tipo === 'qualquer' || !o.tipo ? m.tipo !== 'caminhão' || (dono && dono.tipo === 'PJ') : m.tipo === o.tipo);
  // "caro demais para o dono": só quando o tipo escolhido tem modelo caro (moto, por exemplo, não tem)
  const caros = lista.filter(x => x.preco >= 150000 && x.tipo !== 'moto' && x.ate >= ref - 3);
  const suspeito = o.suspeitos && caros.length && dono && dono.tipo !== 'PJ' && renda < 2500 && U.chance(rng, 0.6);
  let m, ano;
  if (suspeito) { m = U.pick(rng, caros); ano = U.int(rng, Math.max(m.desde, ref - 3), Math.min(m.ate, ref)); }
  else {
    const alvo = dono && dono.tipo === 'PJ' ? 250000 : Math.max(15000, renda * U.real(rng, 6, 18));
    const candidatos = [];
    lista.forEach(x => { for (let a = Math.max(x.desde, ref - 18); a <= Math.min(x.ate, ref); a++) { const v = x.preco * Math.pow(0.88, ref - a); if (v >= alvo * 0.5 && v <= alvo * 1.5) candidatos.push([x, a]); } });
    const c = candidatos.length ? U.pick(rng, candidatos) : [U.pick(rng, lista), U.int(rng, ref - 15, ref - 8)];
    m = c[0]; ano = Math.min(Math.max(c[1], m.desde), m.ate);
  }
  const cor = U.pickW(rng, CORES_VEICULO), valor = valorVeiculo(rng, m, ano);
  const comb = m.tipo === 'moto' ? 'gasolina' : m.tipo === 'caminhão' || ['Hilux', 'S10', 'Ranger'].includes(m.modelo) ? 'diesel' : 'flex';
  const sinais = [];
  if (dono && dono.tipo !== 'PJ' && valor > Math.max(renda, 1) * 40) sinais.push('vale ' + U.moeda(valor) + ' e o dono declara renda de ' + U.moeda(renda) + '/mês');
  return {
    placa: gerarPlaca(rng), marca: m.marca, modelo: m.modelo, tipo: m.tipo, cor, ano_fabricacao: ano, ano_modelo: U.chance(rng, 0.5) && ano < ref ? ano + 1 : ano,
    valor_aprox: valor, combustivel: comb, chassi: chassiFicticio(rng),
    dono_doc: dono ? dono.doc : '', dono_nome: dono ? dono.nome : '', dono_tipo: dono ? dono.tipo : '', sinais_alerta: sinais,
    prompt: 'Illustration of a ' + (COR_EN[cor] || cor) + ' ' + ano + ' ' + m.marca + ' ' + m.modelo + ' parked on a city street at night, three-quarter view, license plate unreadable. ' + U.maiuscula(ESTILO.base) + ', ' + ESTILO.paletas.noite + fimDoPrompt(o.motor, '16:9'),
  };
}
const COLUNAS_VEICULO = ['placa', 'marca', 'modelo', 'tipo', 'cor', 'ano_fabricacao', 'ano_modelo', 'valor_aprox', 'combustivel', 'chassi', 'dono_doc', 'dono_nome', 'sinais_alerta'];

registrarGerador({
  id: 'veiculos', numero: 5, grupo: 'Mundo e lugares', nome: 'Veículos e placas', colecao: 'veiculos',
  descricao: 'Placa no padrão Mercosul, marca, modelo, cor (na proporção das mais vendidas), ano e valor aproximado coerentes com a renda do dono. Usa pessoas e empresas do projeto como donos. Valores são aproximações, só para dar coerência.',
  campos: [
    { id: 'quantidade', rotulo: 'Quantos veículos', tipo: 'numero', padrao: 10, min: 1, max: 300 },
    { id: 'tipo', rotulo: 'Tipo', tipo: 'select', padrao: 'qualquer', opcoes: [['qualquer', 'Qualquer'], ['carro', 'Carro'], ['caminhonete', 'Caminhonete'], ['moto', 'Moto'], ['caminhão', 'Caminhão']] },
    { id: 'donos', rotulo: 'Donos', tipo: 'select', padrao: 'projeto', opcoes: [['projeto', 'Pessoas e empresas do projeto (ou novas, se não houver)'], ['novos', 'Sempre pessoas novas']] },
    { id: 'suspeitos', rotulo: 'Incluir carros caros no nome de quem não tem renda', tipo: 'check', padrao: false },
    { id: 'motor', rotulo: 'Gerador de imagem', tipo: 'select', padrao: 'midjourney', opcoes: Object.keys(ESTILO.motores).map(k => [k, ESTILO.motores[k]]) },
  ],
  gerar(v, ctx) {
    const rng = ctx.rng, pr = ctx.projeto, novos = [];
    const donosProjeto = v.donos === 'projeto' ? (pr.pessoas || []).map(p => ({ doc: p.cpf, nome: p.nome, renda: p.renda, tipo: 'PF' })).concat((pr.empresas || []).map(e => ({ doc: e.cnpj, nome: e.razao_social, renda: 50000, tipo: 'PJ' }))) : [];
    const veiculos = [];
    for (let i = 0; i < v.quantidade; i++) {
      let dono;
      if (donosProjeto.length) dono = U.pick(rng, donosProjeto);
      else { const p = criarPessoa(rng, { papel: v.suspeitos && U.chance(rng, 0.3) ? 'laranja' : 'neutro' }, pr); novos.push(p); dono = { doc: p.cpf, nome: p.nome, renda: p.renda, tipo: 'PF' }; }
      veiculos.push(criarVeiculo(rng, dono, v));
    }
    return {
      resumo: veiculos.length + ' veículo(s)' + (veiculos.filter(x => x.sinais_alerta.length).length ? ', ' + veiculos.filter(x => x.sinais_alerta.length).length + ' com sinal de alerta' : '') + '.',
      itens: veiculos, colecao: 'veiculos', extras: novos.length ? [{ colecao: 'pessoas', itens: novos }] : [],
      cartoes: veiculos.map(x => ({ titulo: x.placa + ' · ' + x.marca + ' ' + x.modelo, subtitulo: x.cor + ' · ' + x.ano_fabricacao + '/' + x.ano_modelo + ' · ' + U.moeda(x.valor_aprox), item: x, colecao: 'veiculos', prompt: x.prompt,
        html: '<dl class="ficha"><dt>Dono</dt><dd>' + U.esc(x.dono_nome + ' (' + x.dono_doc + ')') + '</dd><dt>Combustível</dt><dd>' + x.combustivel + '</dd><dt>Chassi</dt><dd>' + x.chassi + ' (fictício)</dd>' + (x.sinais_alerta.length ? '<dt>Sinal de alerta</dt><dd class="alerta">' + U.esc(x.sinais_alerta.join('; ')) + '</dd>' : '') + '</dl>' })),
      tabelas: [{ nome: 'veiculos', colunas: COLUNAS_VEICULO, linhas: veiculos.map(x => Object.assign({}, x, { sinais_alerta: x.sinais_alerta.join(' | ') })) }],
      texto: veiculos.map(x => x.placa + ' · ' + x.marca + ' ' + x.modelo + ' ' + x.cor + ' ' + x.ano_fabricacao + ' · ' + U.moeda(x.valor_aprox) + ' · dono: ' + x.dono_nome + (x.sinais_alerta.length ? ' · ALERTA: ' + x.sinais_alerta.join('; ') : '')).join('\n'),
    };
  },
});
