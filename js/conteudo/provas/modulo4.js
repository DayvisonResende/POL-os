/* Prova do Módulo 4 (JOIN). requer = BO que precisa estar encerrado; para = índice da patente em RANKS.
   As questões de escrever são corrigidas pelo resultado, nunca pelo texto. Nada do galpão nem da carga. */
registrarProva(4,{requer:'1007',para:4,titulo:L('Módulo 4 · Cruzar tabelas'),
  mcq:[
   {id:'4a',q:L('O que o <code>ON</code> faz num JOIN?'),opts:[L('Diz qual coluna de uma tabela combina com qual coluna da outra'),L('Filtra as linhas, igual ao WHERE'),L('Ordena o resultado')],ok:0,exp:L('O ON é a regra da ligação: a coluna que aponta de um lado, a chave do outro.')},
   {id:'4b',q:L('Esta consulta não tem <code>ON</code>. O que acontece?'),code:'SELECT * FROM veiculos JOIN pessoas;',opts:[L('Cada veículo é combinado com cada pessoa: milhares de linhas sem sentido'),L('Dá erro'),L('Mostra cada veículo com o seu dono')],ok:0,exp:L('Sem a regra, o banco combina tudo com tudo. Não dá erro, e por isso é perigoso.')},
   {id:'4c',q:L('Qual consulta lista as pessoas que <b>não têm</b> carro?'),opts:['SELECT p.nome FROM pessoas p LEFT JOIN veiculos v ON v.cpf_proprietario = p.cpf WHERE v.placa IS NULL;','SELECT p.nome FROM pessoas p JOIN veiculos v ON v.cpf_proprietario = p.cpf WHERE v.placa IS NULL;','SELECT p.nome FROM pessoas p LEFT JOIN veiculos v ON v.cpf_proprietario = p.cpf WHERE v.placa = NULL;'],ok:0,exp:L('LEFT JOIN mantém quem não tem par, e IS NULL pega justamente esses. O JOIN comum tira quem não tem carro; = NULL nunca é verdade.')},
   {id:'4d',q:L('Uma nota fiscal de R$ 1.000 tem 5 itens. Quanto dá <code>SUM(n.valor_total)</code> depois do JOIN da nota com os itens?'),opts:[L('R$ 5.000: a nota se repete uma vez por item'),L('R$ 1.000'),L('Depende do preço dos itens')],ok:0,exp:L('No JOIN 1 para N, a linha da nota aparece uma vez por item. Somar a coluna dela infla o total.')},
   {id:'4e',q:L('Na consulta abaixo, o que é o <code>v</code>?'),code:'SELECT v.placa, v.cor FROM veiculos v;',opts:[L('Um apelido para a tabela veiculos'),L('Uma coluna da tabela'),L('Outra tabela do banco')],ok:0,exp:L('O apelido vem logo depois do nome da tabela. Depois, v.coluna quer dizer uma coluna de veiculos.')}
  ],
  write:[
   {id:'4w1',q:L('Mostre a <b>placa</b> e o <b>nome do dono</b> de cada carro <b>preto</b>.'),
    check:function(R){var l=linhasDe("SELECT v.placa, p.nome FROM veiculos v JOIN pessoas p ON p.cpf = v.cpf_proprietario WHERE v.cor = 'preto'");return R.n===l.length&&hasAll(R,l.map(function(x){return x.placa}))&&hasAll(R,l.map(function(x){return x.nome}))},
    model:"SELECT v.placa, p.nome FROM veiculos v JOIN pessoas p ON p.cpf = v.cpf_proprietario WHERE v.cor = 'preto';"},
   {id:'4w2',q:L('Mostre a <b>data e hora</b> de cada passagem pelo radar da <b>Av. Dom Aguirre</b>, com o <b>nome do dono</b> do carro.'),
    check:function(R){var l=linhasDe("SELECT r.data_hora, p.nome FROM leituras_radar r JOIN veiculos v ON v.placa = r.placa JOIN pessoas p ON p.cpf = v.cpf_proprietario WHERE r.local_radar = 'Av. Dom Aguirre'");return R.n===l.length&&hasAll(R,l.map(function(x){return x.data_hora}))&&hasAll(R,l.map(function(x){return x.nome}))},
    model:"SELECT r.data_hora, p.nome FROM leituras_radar r JOIN veiculos v ON v.placa = r.placa JOIN pessoas p ON p.cpf = v.cpf_proprietario WHERE r.local_radar = 'Av. Dom Aguirre';"},
   {id:'4w3',q:L('Liste o <b>nome</b> das pessoas que <b>não têm nenhum veículo</b>.'),
    check:function(R){var l=linhasDe('SELECT p.nome FROM pessoas p LEFT JOIN veiculos v ON v.cpf_proprietario = p.cpf WHERE v.placa IS NULL');return R.n===l.length&&hasAll(R,l.map(function(x){return x.nome}))},
    model:'SELECT p.nome FROM pessoas p LEFT JOIN veiculos v ON v.cpf_proprietario = p.cpf WHERE v.placa IS NULL;'},
   {id:'4w4',q:L('Mostre, para <b>cada nota fiscal</b>, o número da nota e o valor calculado pelos itens (<b>quantidade × preço</b>).'),
    check:function(R){return bateGrupos(R,linhasDe('SELECT n.numero, SUM(i.quantidade * i.valor_unitario) AS v FROM notas_fiscais n JOIN itens_nota i ON i.nota_id = n.id GROUP BY n.numero'),'numero','v',0.01)},
    model:'SELECT n.numero, SUM(i.quantidade * i.valor_unitario) FROM notas_fiscais n JOIN itens_nota i ON i.nota_id = n.id GROUP BY n.numero;'}
  ]});
