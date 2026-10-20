/* Catálogo dos casos (docs/casos-da-cidade.md): Caso = Crime + Rastro + Técnica + Armadilha + Escala + Desfecho.
   Cada crime diz quais rastros, técnicas e armadilhas combinam com ele: o sorteio da ficha só monta casos coerentes. */
'use strict';

/* ---------- Técnicas SQL (o padrão que revela o crime) ---------- */
// nivel: 1 a 5 estrelas. modulo: onde a campanha ensina (6+ = além da campanha).
const TECNICAS = {
  filtro: { nome: 'Filtros combinados', nivel: 1, modulo: 2, sql: "SELECT … FROM t WHERE a = '…' AND b BETWEEN … AND …;" },
  agrupar: { nome: 'GROUP BY + HAVING', nivel: 2, modulo: 3, sql: 'SELECT chave, COUNT(*), SUM(valor) FROM t WHERE … GROUP BY chave HAVING COUNT(*) > n;' },
  join: { nome: 'JOIN de várias tabelas', nivel: 2, modulo: 4, sql: 'FROM a JOIN b ON b.chave = a.fk JOIN c ON c.chave = b.fk' },
  antijoin: { nome: '"Quem não tem" (LEFT JOIN + IS NULL / NOT EXISTS)', nivel: 3, modulo: 4, sql: 'FROM a LEFT JOIN b ON b.fk = a.chave WHERE b.chave IS NULL' },
  janela_tempo: { nome: 'Agregação por janela de tempo', nivel: 3, modulo: 3, sql: "SELECT destino, strftime('%Y-%m-%d %H', data_hora) AS hora, COUNT(*) FROM t GROUP BY destino, hora HAVING COUNT(*) >= n;" },
  selfjoin_tempo: { nome: 'JOIN da tabela com ela mesma (lugar e tempo)', nivel: 3, modulo: 6, sql: 'FROM t a JOIN t b ON b.chave = a.chave AND b.local <> a.local AND ABS(julianday(b.data_hora) - julianday(a.data_hora)) * 1440 < 15' },
  ranking: { nome: 'Os N maiores de cada grupo (ROW_NUMBER / RANK)', nivel: 3, modulo: 6, sql: 'SELECT * FROM (SELECT *, ROW_NUMBER() OVER (PARTITION BY grupo ORDER BY valor DESC) AS n FROM t) WHERE n <= 3;' },
  pivot: { nome: 'Linhas viram colunas (CASE dentro do SUM)', nivel: 3, modulo: 6, sql: "SELECT chave, SUM(CASE WHEN tipo = 'A' THEN valor ELSE 0 END) AS a, SUM(CASE WHEN tipo = 'B' THEN valor ELSE 0 END) AS b FROM t GROUP BY chave;" },
  dedup: { nome: 'Limpeza de texto e deduplicação', nivel: 3, modulo: 6, sql: "SELECT UPPER(TRIM(REPLACE(nome, '  ', ' '))) AS chave, COUNT(*) FROM t GROUP BY chave HAVING COUNT(*) > 1;" },
  janela_media: { nome: 'Comparar com a média do grupo (AVG OVER)', nivel: 4, modulo: 6, sql: 'SELECT *, valor / AVG(valor) OVER (PARTITION BY produto) AS razao FROM t ORDER BY razao DESC;' },
  lag: { nome: 'Sequência no tempo (LAG / LEAD)', nivel: 4, modulo: 6, sql: 'SELECT *, LAG(local) OVER (PARTITION BY placa ORDER BY data_hora) AS anterior FROM t;' },
  coorte: { nome: 'Coortes (primeira data de cada cliente)', nivel: 4, modulo: 6, sql: 'WITH primeira AS (SELECT cliente, MIN(data) AS d0 FROM t GROUP BY cliente) SELECT d0, COUNT(*) FROM primeira GROUP BY d0;' },
  cte_recursiva: { nome: 'Redes e ciclos (WITH RECURSIVE)', nivel: 5, modulo: 6, sql: 'WITH RECURSIVE rede(conta, nivel) AS (SELECT … UNION SELECT t.destino, nivel + 1 FROM transacoes t JOIN rede r ON t.origem = r.conta WHERE nivel < 6) SELECT * FROM rede;' },
  ilhas: { nome: 'Ilhas e lacunas (sequências sem buraco)', nivel: 5, modulo: 6, sql: 'SELECT chave, MIN(d), MAX(d) FROM (SELECT chave, d, julianday(d) - ROW_NUMBER() OVER (PARTITION BY chave ORDER BY d) AS grupo FROM t) GROUP BY chave, grupo;' },
};

/* ---------- Rastros (as tabelas que o crime suja) ---------- */
const RASTROS = {
  radar: { nome: 'Radares', tabelas: ['leituras_radar(placa, local, data_hora, velocidade_kmh)'] },
  camera: { nome: 'Câmeras de monitoramento', tabelas: ['registros_camera(camera_id, local, data_hora, placa, descricao)'] },
  antena: { nome: 'Antenas de celular', tabelas: ['registros_antena(telefone, antena_id, local, data_hora)'] },
  transacoes: { nome: 'Contas e transações', tabelas: ['contas(id, banco, agencia, numero, titular_doc, aberta_em)', 'transacoes(id, origem, destino, valor, data_hora, tipo, descricao)'] },
  cartao: { nome: 'Compras no cartão', tabelas: ['compras_cartao(cartao_final, estabelecimento, terminal, cidade, valor, data_hora)'] },
  notas: { nome: 'Notas fiscais', tabelas: ['notas_fiscais(id, numero, emitente, destinatario, data_emissao, valor_total)', 'itens_nota(nota_id, produto, quantidade, valor_unitario)'] },
  ponto: { nome: 'Ponto eletrônico', tabelas: ['registros_ponto(matricula, data, entrada, saida)'] },
  folha: { nome: 'Folha de pagamento', tabelas: ['folha_pagamento(matricula, nome, cargo, lotacao, salario, competencia)'] },
  licitacoes: { nome: 'Licitações', tabelas: ['licitacoes(id, orgao, objeto, data, valor_estimado)', 'propostas(licitacao_id, cnpj, valor, vencedora)'] },
  contratos: { nome: 'Contratos públicos', tabelas: ['contratos(id, orgao, cnpj, objeto, valor, inicio, fim)'] },
  empresas: { nome: 'Junta Comercial', tabelas: ['empresas(cnpj, razao_social, aberta_em, cpf_responsavel)', 'socios(cnpj, cpf, entrada)'] },
  imoveis: { nome: 'Cartórios de imóveis', tabelas: ['imoveis(id, endereco, tipo, doc_locatario, alugado_em)'] },
  hospedagens: { nome: 'Hotéis', tabelas: ['hospedagens(hotel, cpf_hospede, entrada, saida, quarto)'] },
  passagens: { nome: 'Passagens de ônibus e avião', tabelas: ['passagens(cpf, origem, destino, data_hora, companhia)'] },
  ligacoes: { nome: 'Ligações telefônicas', tabelas: ['ligacoes(origem, destino, data_hora, duracao_seg)'] },
  obitos: { nome: 'Óbitos (cartório)', tabelas: ['obitos(cpf, data_obito, cartorio)'] },
  beneficios: { nome: 'Benefícios pagos', tabelas: ['beneficios(cpf, tipo, valor, competencia, sacado_em)'] },
  pesagem: { nome: 'Balança do porto', tabelas: ['pesagens(conteiner, data_hora, peso_kg)'] },
  estoque: { nome: 'Movimentação de estoque', tabelas: ['movimentacoes(produto, tipo, quantidade, data_hora, usuario)'] },
  logs: { nome: 'Log do sistema', tabelas: ['log_sistema(usuario, acao, tabela, registro, data_hora, estacao)'] },
  pedidos: { nome: 'Pedidos e cadastros online', tabelas: ['clientes(id, nome, cpf, email, criado_em)', 'pedidos(id, cliente_id, data, valor, status)'] },
  ocorrencias: { nome: 'Boletins de ocorrência', tabelas: ['ocorrencias(bo, natureza, bairro, data_hora, descricao)'] },
  apostas: { nome: 'Apostas', tabelas: ['apostas(conta, evento, valor, data_hora, premio)'] },
};

/* ---------- Armadilhas (o que engana quem vai rápido demais) ---------- */
const ARMADILHAS = {
  homonimo: { nome: 'Homônimo', como: 'Duas pessoas com o mesmo nome; quem filtra só pelo nome acusa a errada. A saída é usar o CPF.' },
  dado_sujo: { nome: 'Dado sujo', como: 'O mesmo valor escrito de vários jeitos (espaços, maiúsculas, CPF com e sem ponto). Sem limpar, a contagem sai errada.' },
  null_not_in: { nome: 'NULL no NOT IN', como: 'Um vazio na lista da subconsulta e o NOT IN volta vazio sem avisar. A saída é NOT EXISTS ou filtrar o NULL.' },
  soma_infla: { nome: 'A soma que infla', como: 'Um JOIN 1 para N repete o valor do lado "um"; a soma sai várias vezes maior.' },
  fuso: { nome: 'Horário e formato de data', como: 'Registros de outra cidade com horário diferente, ou datas em formatos misturados (texto x data).' },
  pista_falsa: { nome: 'Pista falsa plantada', como: 'Um suspeito óbvio, mas com álibi nos dados (estava em outro lugar na hora).' },
  laranja: { nome: 'Laranja no lugar do chefe', como: 'O titular da conta ou da empresa é só um nome emprestado; é preciso seguir o dinheiro além dele.' },
  duplicado: { nome: 'Registro duplicado', como: 'A mesma operação importada duas vezes; sem deduplicar, o total dobra.' },
  estorno: { nome: 'Estornos e cancelamentos', como: 'Operações canceladas que continuam na tabela e não podem entrar na soma.' },
  centavos: { nome: 'Centavos e arredondamento', como: 'Valores fracionados em que o arredondamento muda o total ou esconde o padrão.' },
};

/* ---------- Escalas e desfechos ---------- */
const ESCALAS = {
  bairro: { nome: 'Bairro', linhas: [1000, 10000], tabelas: [2, 3] },
  cidade: { nome: 'Cidade', linhas: [10000, 100000], tabelas: [3, 5] },
  estado: { nome: 'Estado', linhas: [100000, 300000], tabelas: [4, 7] },
};
const DESFECHOS = {
  nome: 'O nome do culpado (e o CPF, para não errar de homônimo)',
  valor: 'O valor desviado, em reais',
  mandado: 'Mandado de busca: o endereço exato',
  bloqueio: 'Bloqueio de conta: banco, agência e número',
  rede: 'O mapa da rede: todos os envolvidos e quem manda',
  vitimas: 'A lista de vítimas, para o ressarcimento',
  flagrante: 'Flagrante: o local e o horário da próxima ação',
  empresa: 'A empresa (CNPJ) e quem responde por ela',
  relatorio: 'Relatório ao delegado com os números do caso',
};

/* ---------- Crimes ---------- */
// gravidade: 1 pequeno · 2 médio · 3 grande · 4 sistêmico. valor: faixa própria do total, quando a da gravidade não serve.
// frase: {qtd}, {dias}, {valor}, {bairro}.
const CRIMES = [
  { id: 'furto_chinelo', nome: 'Furto de chinelos na praia', gravidade: 1, perfis: ['litoral'], rastros: ['camera', 'ocorrencias'], tecnicas: ['filtro', 'janela_tempo'], armadilhas: ['pista_falsa', 'homonimo'], desfechos: ['nome', 'flagrante'], frase: 'Uma onda de furtos de chinelos no bairro {bairro}: {qtd} queixas em {dias} dias, sempre perto do mesmo quiosque.' },
  { id: 'furto_bicicleta', nome: 'Furto de bicicletas', gravidade: 1, perfis: ['universitario', 'financeiro', 'litoral'], rastros: ['camera', 'pedidos', 'ocorrencias'], tecnicas: ['filtro', 'join'], armadilhas: ['dado_sujo', 'pista_falsa'], desfechos: ['nome', 'flagrante'], frase: '{qtd} bicicletas sumiram de bicicletários do bairro {bairro} em {dias} dias. Algumas apareceram à venda na internet.' },
  { id: 'furto_celular', nome: 'Furto de celulares no transporte', gravidade: 1, perfis: ['periferia', 'rodoviaria', 'historico'], rastros: ['antena', 'ocorrencias'], tecnicas: ['selfjoin_tempo', 'join'], armadilhas: ['duplicado', 'fuso'], desfechos: ['nome', 'flagrante'], frase: '{qtd} celulares furtados em ônibus da linha que passa pelo bairro {bairro}. Os aparelhos voltam a ligar todos no mesmo lugar.' },
  { id: 'falso_parente', nome: 'Golpe do falso parente', gravidade: 2, valor: [15000, 180000], perfis: ['periferia', 'condominios'], rastros: ['ligacoes', 'transacoes'], tecnicas: ['janela_tempo', 'agrupar'], armadilhas: ['laranja', 'centavos'], desfechos: ['bloqueio', 'vitimas'], frase: '"Mãe, troquei de número": {qtd} famílias do bairro {bairro} transferiram {valor} em {dias} dias para contas que ninguém conhece.' },
  { id: 'pix_idosos', nome: 'Golpe do PIX em idosos', gravidade: 2, valor: [20000, 300000], perfis: ['periferia'], rastros: ['transacoes', 'ligacoes'], tecnicas: ['janela_tempo', 'join'], armadilhas: ['laranja', 'estorno'], desfechos: ['bloqueio', 'vitimas'], frase: 'Aposentados do bairro {bairro} receberam ligação "do banco" e fizeram PIX que somam {valor}.' },
  { id: 'clonagem_placa', nome: 'Clonagem de placa', gravidade: 2, perfis: ['financeiro', 'periferia', 'industrial', 'rodoviaria'], rastros: ['radar', 'camera'], tecnicas: ['selfjoin_tempo', 'lag'], armadilhas: ['fuso', 'dado_sujo'], desfechos: ['nome', 'flagrante'], frase: 'Um dono de carro do bairro {bairro} recebeu {qtd} multas de lugares onde nunca esteve.' },
  { id: 'aluguel_falso', nome: 'Aluguel de temporada falso', gravidade: 2, valor: [12000, 150000], perfis: ['litoral', 'universitario'], rastros: ['pedidos', 'transacoes'], tecnicas: ['dedup', 'agrupar'], armadilhas: ['dado_sujo', 'laranja'], desfechos: ['nome', 'vitimas'], frase: '{qtd} famílias pagaram sinal por casas no bairro {bairro} que não existem. Total: {valor}.' },
  { id: 'ingressos_falsos', nome: 'Venda de ingressos falsos', gravidade: 2, perfis: ['universitario', 'historico'], rastros: ['pedidos', 'transacoes'], tecnicas: ['janela_tempo', 'dedup'], armadilhas: ['duplicado', 'estorno'], desfechos: ['nome', 'vitimas'], frase: 'Barrados na porta do show: {qtd} pessoas com ingressos comprados de um perfil que já sumiu.' },
  { id: 'cartao_clonado', nome: 'Cartão clonado', gravidade: 2, perfis: ['historico', 'financeiro', 'litoral'], rastros: ['cartao'], tecnicas: ['selfjoin_tempo', 'ranking'], armadilhas: ['fuso', 'estorno'], desfechos: ['flagrante', 'empresa'], frase: '{qtd} clientes com compras em duas cidades com minutos de diferença. Todos passaram o cartão no mesmo lugar do bairro {bairro}.' },
  { id: 'desvio_estoque', nome: 'Desvio de estoque', gravidade: 2, valor: [40000, 900000], perfis: ['industrial', 'porto'], rastros: ['estoque', 'logs'], tecnicas: ['antijoin', 'lag'], armadilhas: ['estorno', 'pista_falsa'], desfechos: ['nome', 'valor'], frase: 'O inventário de um galpão do bairro {bairro} fechou com {valor} a menos. Ninguém viu nada sair.' },
  { id: 'fraude_seguro', nome: 'Fraude em seguro de carro', gravidade: 2, perfis: ['condominios', 'financeiro', 'periferia'], rastros: ['ocorrencias', 'radar', 'camera'], tecnicas: ['selfjoin_tempo', 'join'], armadilhas: ['fuso', 'pista_falsa'], desfechos: ['nome', 'relatorio'], frase: '{qtd} carros "roubados" no bairro {bairro} continuaram passando em radares depois do boletim.' },
  { id: 'contas_falsas', nome: 'Contas falsas em loja online', gravidade: 2, valor: [20000, 400000], perfis: ['universitario', 'financeiro'], rastros: ['pedidos'], tecnicas: ['dedup', 'coorte'], armadilhas: ['duplicado', 'dado_sujo'], desfechos: ['rede', 'valor'], frase: 'Uma loja online do bairro {bairro} perdeu {valor} com cupons de primeira compra usados por {qtd} "clientes novos".' },
  { id: 'servidor_fantasma', nome: 'Servidor fantasma', gravidade: 3, valor: [250000, 3000000], perfis: ['governo'], rastros: ['folha', 'ponto'], tecnicas: ['antijoin', 'agrupar'], armadilhas: ['homonimo', 'null_not_in'], desfechos: ['valor', 'rede'], frase: 'A folha da secretaria tem {qtd} servidores que recebem todo mês e nunca passaram na catraca. Custo: {valor}.' },
  { id: 'beneficio_falecido', nome: 'Benefício pago a quem já morreu', gravidade: 3, valor: [60000, 900000], perfis: ['governo', 'periferia'], rastros: ['beneficios', 'obitos'], tecnicas: ['join', 'antijoin'], armadilhas: ['dado_sujo', 'null_not_in'], desfechos: ['valor', 'nome'], frase: '{qtd} benefícios continuaram sendo sacados depois da morte do titular. Total: {valor}.' },
  { id: 'superfaturamento', nome: 'Superfaturamento na merenda', gravidade: 3, perfis: ['governo'], rastros: ['contratos', 'notas'], tecnicas: ['janela_media', 'join'], armadilhas: ['soma_infla', 'centavos'], desfechos: ['valor', 'empresa'], frase: 'A prefeitura pagou {valor} por itens da merenda que custam a metade no mercado.' },
  { id: 'cartel_licitacao', nome: 'Cartel de licitações', gravidade: 3, perfis: ['governo'], rastros: ['licitacoes', 'empresas'], tecnicas: ['lag', 'ranking'], armadilhas: ['pista_falsa', 'laranja'], desfechos: ['rede', 'empresa'], faccao: 'balcao', frase: '{qtd} licitações seguidas, sempre as mesmas empresas, cada vez uma ganha. Contratos somam {valor}.' },
  { id: 'lavagem_fachada', nome: 'Lavagem com empresas de fachada', gravidade: 3, perfis: ['financeiro', 'condominios'], rastros: ['transacoes', 'empresas'], tecnicas: ['cte_recursiva', 'agrupar'], armadilhas: ['laranja', 'centavos'], desfechos: ['rede', 'bloqueio'], faccao: 'livro_caixa', frase: '{valor} entraram por {qtd} empresas abertas no mesmo mês e voltaram à origem depois de dar voltas.' },
  { id: 'roubo_carga', nome: 'Roubo de carga', gravidade: 3, perfis: ['porto', 'industrial', 'rodoviaria'], rastros: ['radar', 'notas', 'imoveis'], tecnicas: ['lag', 'join'], armadilhas: ['soma_infla', 'laranja'], desfechos: ['mandado', 'valor'], faccao: 'atravessadores', frase: 'Um caminhão com {valor} em eletrônicos sumiu entre dois radares perto do bairro {bairro}.' },
  { id: 'contrabando_porto', nome: 'Contrabando no porto', gravidade: 3, perfis: ['porto'], rastros: ['notas', 'pesagem'], tecnicas: ['janela_media', 'join'], armadilhas: ['soma_infla', 'dado_sujo'], desfechos: ['empresa', 'valor'], faccao: 'mare', frase: '{qtd} contêineres declarados como roupa pesaram como se fossem eletrônicos.' },
  { id: 'nota_fria', nome: 'Nota fria', gravidade: 3, perfis: ['industrial', 'financeiro'], rastros: ['notas', 'empresas'], tecnicas: ['antijoin', 'agrupar'], armadilhas: ['dado_sujo', 'laranja'], desfechos: ['empresa', 'valor'], frase: 'Uma empresa do bairro {bairro} emitiu {valor} em notas de serviço sem ter um funcionário sequer.' },
  { id: 'piramide', nome: 'Pirâmide financeira', gravidade: 3, perfis: ['financeiro', 'universitario', 'periferia'], rastros: ['transacoes', 'pedidos'], tecnicas: ['cte_recursiva', 'coorte'], armadilhas: ['centavos', 'laranja'], desfechos: ['rede', 'valor'], frase: '"Rende 10% ao mês": {qtd} investidores do bairro {bairro} colocaram {valor}. Os pagamentos pararam.' },
  { id: 'golpe_massa', nome: 'Golpe digital em massa', gravidade: 3, perfis: ['periferia', 'universitario', 'condominios'], rastros: ['transacoes', 'ligacoes', 'pedidos'], tecnicas: ['janela_tempo', 'dedup'], armadilhas: ['laranja', 'duplicado'], desfechos: ['bloqueio', 'vitimas'], faccao: 'fantasmas', frase: 'Em {dias} dias, {qtd} vítimas em toda a cidade, o mesmo roteiro, contas diferentes que esvaziam em minutos.' },
  { id: 'propina_fiscal', nome: 'Propina em fiscalização', gravidade: 3, perfis: ['governo', 'industrial'], rastros: ['transacoes', 'logs'], tecnicas: ['join', 'lag'], armadilhas: ['pista_falsa', 'laranja'], desfechos: ['nome', 'rede'], frase: 'Autos de infração do bairro {bairro} somem do sistema dias depois de um depósito na conta da cunhada de um fiscal.' },
  { id: 'apostas', nome: 'Banca de apostas ilegal', gravidade: 3, perfis: ['historico', 'periferia'], rastros: ['apostas', 'transacoes'], tecnicas: ['agrupar', 'pivot'], armadilhas: ['centavos', 'laranja'], desfechos: ['rede', 'valor'], frase: 'Uma banca clandestina movimentou {valor} no bairro {bairro}. Os prêmios nunca saem para quem não é da casa.' },
  { id: 'remedio_falso', nome: 'Remédios falsificados', gravidade: 3, perfis: ['periferia', 'industrial'], rastros: ['notas', 'estoque'], tecnicas: ['join', 'janela_media'], armadilhas: ['duplicado', 'dado_sujo'], desfechos: ['empresa', 'flagrante'], frase: 'Farmácias do bairro {bairro} venderam {qtd} caixas de um remédio que o fabricante nunca produziu nesse lote.' },
  { id: 'rachadinha', nome: 'Devolução de salário no gabinete', gravidade: 4, valor: [300000, 4000000], perfis: ['governo'], rastros: ['folha', 'transacoes'], tecnicas: ['join', 'agrupar'], armadilhas: ['laranja', 'centavos'], desfechos: ['rede', 'valor'], frase: 'Assessores de um gabinete (fictício) devolvem parte do salário todo mês. Já são {valor}.' },
  { id: 'corrupcao_prefeitura', nome: 'Corrupção na prefeitura', gravidade: 4, perfis: ['governo', 'condominios'], rastros: ['contratos', 'empresas', 'transacoes'], tecnicas: ['cte_recursiva', 'join'], armadilhas: ['laranja', 'soma_infla'], desfechos: ['rede', 'valor'], faccao: 'balcao', frase: 'Contratos de {valor} com empresas ligadas a um secretário (fictício). O dinheiro volta em "consultorias".' },
  { id: 'rede_governador', nome: 'A rede que chega ao governador', gravidade: 4, perfis: ['governo', 'condominios', 'financeiro'], rastros: ['contratos', 'empresas', 'transacoes', 'hospedagens', 'passagens'], tecnicas: ['cte_recursiva', 'selfjoin_tempo'], armadilhas: ['pista_falsa', 'laranja'], desfechos: ['rede', 'relatorio'], frase: 'Viagens, hotéis e contratos de {valor}: os mesmos nomes aparecem juntos, sempre um passo antes do palácio (fictício).' },
];

/* ---------- As cinco facções (docs/casos-da-cidade.md) ---------- */
const FACCOES_PADRAO = [
  { id: 'livro_caixa', nome: 'O Livro-Caixa', especialidade: 'lavagem e empresas de fachada', assinatura: 'dinheiro que dá voltas por várias empresas e volta à origem', tecnica: 'cte_recursiva', crimes: ['lavagem_fachada', 'nota_fria', 'piramide'], lugar: 'financeiro' },
  { id: 'atravessadores', nome: 'Os Atravessadores', especialidade: 'roubo de carga e receptação', assinatura: 'caminhão que some entre dois radares e carga que reaparece em galpão alugado há pouco', tecnica: 'lag', crimes: ['roubo_carga', 'desvio_estoque'], lugar: 'industrial' },
  { id: 'balcao', nome: 'O Balcão', especialidade: 'licitações e prefeituras', assinatura: 'empresas que se revezam ganhando licitações, cada vez uma', tecnica: 'lag', crimes: ['cartel_licitacao', 'superfaturamento', 'corrupcao_prefeitura'], lugar: 'governo' },
  { id: 'fantasmas', nome: 'Os Fantasmas', especialidade: 'golpes digitais em massa', assinatura: 'muitas vítimas, uma conta de passagem, poucas horas, conta esvaziada em minutos', tecnica: 'janela_tempo', crimes: ['golpe_massa', 'falso_parente', 'pix_idosos'], lugar: 'periferia' },
  { id: 'mare', nome: 'A Maré', especialidade: 'contrabando no porto', assinatura: 'notas com peso que não bate com o produto declarado', tecnica: 'janela_media', crimes: ['contrabando_porto', 'remedio_falso'], lugar: 'porto' },
];
const REACOES = ['troca o laranja da conta por outro', 'apaga registros do sistema (e o log entrega)', 'oferece propina a alguém da equipe', 'muda o ponto de encontro', 'pressiona uma testemunha a mudar o depoimento', 'abre uma empresa de fachada nova', 'faz o dinheiro dar mais voltas', 'some por um tempo e volta em outro bairro'];

/* ---------- Termos proibidos (verificador de nomes) ---------- */
// nivel: 'proibido' (é real, não usar) ou 'atencao' (pode lembrar algo real ou ofender; avaliar).
const TERMOS_PROIBIDOS = [
  // forças policiais e órgãos reais
  ['ROTA', 'policia', 'proibido', 'Rondas Ostensivas Tobias de Aguiar, tropa da Polícia Militar de SP'], ['BOPE', 'policia', 'proibido', 'Batalhão de Operações Policiais Especiais (PM)'],
  ['COE', 'policia', 'proibido', 'Comandos e Operações Especiais (PM-SP)'], ['GATE', 'policia', 'proibido', 'Grupo de Ações Táticas Especiais (PM-SP)'],
  ['CORE', 'policia', 'proibido', 'Coordenadoria de Recursos Especiais (Polícia Civil)'], ['GOE', 'policia', 'proibido', 'Grupo de Operações Especiais (Polícia Civil)'],
  ['GARRA', 'policia', 'proibido', 'grupo especial da Polícia Civil de SP'], ['DEIC', 'policia', 'proibido', 'departamento da Polícia Civil de SP'],
  ['DHPP', 'policia', 'proibido', 'departamento de homicídios da Polícia Civil de SP'], ['DENARC', 'policia', 'proibido', 'departamento de narcóticos da Polícia Civil'],
  ['ROCAM', 'policia', 'proibido', 'rondas com motocicletas (PM)'], ['Tropa de Choque', 'policia', 'proibido', 'tropa da Polícia Militar'],
  ['Força Nacional', 'policia', 'proibido', 'Força Nacional de Segurança Pública'], ['Polícia Federal', 'orgao', 'proibido', 'órgão real'],
  ['PRF', 'orgao', 'proibido', 'Polícia Rodoviária Federal'], ['ABIN', 'orgao', 'proibido', 'Agência Brasileira de Inteligência'], ['GAECO', 'orgao', 'proibido', 'grupo do Ministério Público'],
  ['Polícia Civil', 'orgao', 'atencao', 'órgão real: só como ambientação, nunca como nome de grupo'], ['Polícia Militar', 'orgao', 'atencao', 'órgão real'],
  ['Receita Federal', 'orgao', 'atencao', 'órgão real'], ['COAF', 'orgao', 'atencao', 'órgão real'], ['Detran', 'orgao', 'atencao', 'órgão real'], ['INSS', 'orgao', 'atencao', 'órgão real'],
  // facções reais
  ['PCC', 'faccao', 'proibido', 'Primeiro Comando da Capital, facção real'], ['Primeiro Comando', 'faccao', 'proibido', 'facção real (PCC, Primeiro Comando do Maranhão…)'],
  ['Comando Vermelho', 'faccao', 'proibido', 'facção real'], ['CV', 'faccao', 'proibido', 'sigla do Comando Vermelho'],
  ['Terceiro Comando', 'faccao', 'proibido', 'facção real (Terceiro Comando Puro)'], ['TCP', 'faccao', 'proibido', 'Terceiro Comando Puro'],
  ['Amigos dos Amigos', 'faccao', 'proibido', 'facção real'], ['ADA', 'faccao', 'proibido', 'Amigos dos Amigos'],
  ['Família do Norte', 'faccao', 'proibido', 'facção real'], ['FDN', 'faccao', 'proibido', 'Família do Norte'],
  ['Guardiões do Estado', 'faccao', 'proibido', 'facção real'], ['GDE', 'faccao', 'proibido', 'Guardiões do Estado'],
  ['Sindicato do Crime', 'faccao', 'proibido', 'facção real'], ['Bonde do Maluco', 'faccao', 'proibido', 'facção real'], ['BDM', 'faccao', 'proibido', 'Bonde do Maluco'],
  ['Primeiro Grupo Catarinense', 'faccao', 'proibido', 'facção real'], ['PGC', 'faccao', 'proibido', 'Primeiro Grupo Catarinense'],
  ['Okaida', 'faccao', 'proibido', 'facção real'], ['Os Manos', 'faccao', 'proibido', 'facção real'], ['Bala na Cara', 'faccao', 'proibido', 'facção real'],
  ['1533', 'simbolo', 'proibido', 'número associado ao PCC'], ['Comando', 'faccao', 'atencao', 'palavra presente no nome de várias facções reais'],
  ['Família', 'faccao', 'atencao', 'lembra Família do Norte e máfias'], ['Bonde', 'faccao', 'atencao', 'lembra Bonde do Maluco'], ['Milícia', 'faccao', 'atencao', 'tema sensível e real'],
  ['Tropa', 'policia', 'atencao', 'lembra tropas policiais e facções'],
  // operações e escândalos reais
  ['Lava Jato', 'operacao', 'proibido', 'operação real'], ['Zelotes', 'operacao', 'proibido', 'operação real'], ['Greenfield', 'operacao', 'proibido', 'operação real'],
  ['Satiagraha', 'operacao', 'proibido', 'operação real'], ['Carne Fraca', 'operacao', 'proibido', 'operação real'], ['Castelo de Areia', 'operacao', 'proibido', 'operação real'],
  ['Calicute', 'operacao', 'proibido', 'operação real'], ['Mensalão', 'operacao', 'proibido', 'escândalo real'], ['Petrolão', 'operacao', 'proibido', 'escândalo real'],
  ['Odebrecht', 'empresa', 'proibido', 'empresa real ligada a escândalo'], ['Petrobras', 'empresa', 'proibido', 'empresa real'], ['JBS', 'empresa', 'proibido', 'empresa real'],
  // profissões, origens e religiões (soam como acusação a um grupo)
  ['Contador', 'profissao', 'atencao', 'profissão: como nome de grupo, soa como acusação a quem trabalha nela'], ['Advogado', 'profissao', 'atencao', 'profissão'],
  ['Médico', 'profissao', 'atencao', 'profissão'], ['Estivador', 'profissao', 'atencao', 'profissão'], ['Caminhoneiro', 'profissao', 'atencao', 'profissão'],
  ['Motorista', 'profissao', 'atencao', 'profissão'], ['Policial', 'profissao', 'atencao', 'profissão'], ['Juiz', 'profissao', 'atencao', 'profissão'], ['Pastor', 'religiao', 'atencao', 'liderança religiosa'],
  ['Padre', 'religiao', 'atencao', 'liderança religiosa'], ['Cigano', 'origem', 'atencao', 'povo: não associar a crime'], ['Nordestino', 'origem', 'atencao', 'origem regional: não associar a crime'],
  ['Baiano', 'origem', 'atencao', 'origem regional: não associar a crime'], ['Índio', 'origem', 'atencao', 'povo: não associar a crime'], ['Judeu', 'origem', 'atencao', 'religião/povo: não associar a crime'],
  ['Árabe', 'origem', 'atencao', 'origem: não associar a crime'], ['Favela', 'lugar', 'atencao', 'estigmatiza moradores: prefira "bairro" ou "comunidade" com cuidado'],
].map(t => ({ termo: t[0], tipo: t[1], nivel: t[2], motivo: t[3] }));
// Nomes já usados no jogo (evitar repetir sem querer) e os reservados às facções
const NOMES_DO_JOGO = ['Célia Moura', 'Roberto Silva', 'Beto', 'Jairo Teixeira', 'Marina Okada', 'Paulo Henrique Dias', 'Denise Albuquerque Prado', 'Valdemar Silveira', 'Lucas Ferraz Tavares', 'Sueli Ramos', 'Roberta Silva Lima', 'Transportadora Central', 'VS Armazéns Gerais', 'Eletro Sul Distribuidora', 'Operação Véio', 'O Livro-Caixa', 'Os Atravessadores', 'O Balcão', 'Os Fantasmas', 'A Maré'];

/* ---------- Nomes de casos ---------- */
// substantivos com gênero (m/f) e plural; adjetivos com as duas formas
const PALAVRAS_CASO = {
  porto: [['Maré', 'f', 'Marés'], ['Âncora', 'f', 'Âncoras'], ['Cais', 'm', 'Cais'], ['Contêiner', 'm', 'Contêineres'], ['Farol', 'm', 'Faróis'], ['Ressaca', 'f', 'Ressacas'], ['Correnteza', 'f', 'Correntezas']],
  dinheiro: [['Dízimo', 'm', 'Dízimos'], ['Troco', 'm', 'Trocos'], ['Cofre', 'm', 'Cofres'], ['Moeda', 'f', 'Moedas'], ['Balança', 'f', 'Balanças'], ['Câmbio', 'm', 'Câmbios'], ['Carimbo', 'm', 'Carimbos'], ['Envelope', 'm', 'Envelopes']],
  estrada: [['Comboio', 'm', 'Comboios'], ['Acostamento', 'm', 'Acostamentos'], ['Pedágio', 'm', 'Pedágios'], ['Carreta', 'f', 'Carretas'], ['Neblina', 'f', 'Neblinas'], ['Retorno', 'm', 'Retornos']],
  governo: [['Gaveta', 'f', 'Gavetas'], ['Protocolo', 'm', 'Protocolos'], ['Edital', 'm', 'Editais'], ['Assinatura', 'f', 'Assinaturas'], ['Carimbo', 'm', 'Carimbos'], ['Despacho', 'm', 'Despachos']],
  digital: [['Eco', 'm', 'Ecos'], ['Clone', 'm', 'Clones'], ['Espelho', 'm', 'Espelhos'], ['Senha', 'f', 'Senhas'], ['Sinal', 'm', 'Sinais'], ['Nuvem', 'f', 'Nuvens'], ['Máscara', 'f', 'Máscaras']],
  rua: [['Chinelo', 'm', 'Chinelos'], ['Esquina', 'f', 'Esquinas'], ['Calçada', 'f', 'Calçadas'], ['Marmita', 'f', 'Marmitas'], ['Varal', 'm', 'Varais'], ['Guarda-chuva', 'm', 'Guarda-chuvas']],
  natureza: [['Formigueiro', 'm', 'Formigueiros'], ['Cupim', 'm', 'Cupins'], ['Teia', 'f', 'Teias'], ['Colmeia', 'f', 'Colmeias'], ['Ninho', 'm', 'Ninhos'], ['Raiz', 'f', 'Raízes']],
};
const ADJETIVOS_CASO = [['Viciado', 'Viciada'], ['Fantasma', 'Fantasma'], ['de Areia', 'de Areia'], ['Sem Fundo', 'Sem Fundo'], ['de Vidro', 'de Vidro'], ['Invisível', 'Invisível'], ['Furado', 'Furada'], ['Dobrado', 'Dobrada'], ['de Papel', 'de Papel'], ['Cego', 'Cega'], ['Mudo', 'Muda'], ['Torto', 'Torta'], ['Emprestado', 'Emprestada'], ['Silencioso', 'Silenciosa'], ['Esquecido', 'Esquecida']];
const VERBOS_CASO = ['que mentia', 'que sumiu duas vezes', 'que não fechava', 'que falava demais', 'que ninguém viu', 'que voltou vazio', 'que chegou cedo demais', 'que pagava a conta de todos', 'que tinha dois donos', 'que ninguém conferiu'];
const TEMA_DO_CRIME = { furto_chinelo: 'rua', furto_bicicleta: 'rua', furto_celular: 'rua', falso_parente: 'digital', pix_idosos: 'digital', clonagem_placa: 'estrada', aluguel_falso: 'rua', ingressos_falsos: 'digital', cartao_clonado: 'digital', desvio_estoque: 'estrada', fraude_seguro: 'estrada', contas_falsas: 'digital', servidor_fantasma: 'governo', beneficio_falecido: 'governo', superfaturamento: 'dinheiro', cartel_licitacao: 'governo', lavagem_fachada: 'dinheiro', roubo_carga: 'estrada', contrabando_porto: 'porto', nota_fria: 'dinheiro', piramide: 'natureza', golpe_massa: 'digital', propina_fiscal: 'governo', apostas: 'dinheiro', remedio_falso: 'natureza', rachadinha: 'dinheiro', corrupcao_prefeitura: 'governo', rede_governador: 'natureza' };
