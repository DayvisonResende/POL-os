/* Prova do Módulo 1. requer = BO que precisa estar encerrado; para = índice da patente em RANKS. */
registrarProva(1,{requer:'1001',para:1,titulo:'Módulo 1 · Leitura e extração',
  mcq:[
   {id:'1a',q:'O que esta consulta mostra?',code:'SELECT DISTINCT cidade FROM pessoas;',opts:['Cada cidade uma vez só','Todas as pessoas, com a cidade de cada uma','Um número: quantas cidades existem'],ok:0,exp:'DISTINCT tira as repetições. Cada cidade aparece uma vez. Contar seria COUNT, assunto do Módulo 3.'},
   {id:'1b',q:'Qual consulta mostra só os 10 primeiros veículos?',opts:['SELECT * FROM veiculos LIMIT 10;','SELECT 10 FROM veiculos;','SELECT * LIMIT 10 FROM veiculos;'],ok:0,exp:'LIMIT vai sempre no fim da consulta, depois do FROM.'},
   {id:'1c',q:'O que está errado nesta consulta?',code:'SELECT placa, modelo, FROM veiculos;',opts:['Sobrou uma vírgula antes do FROM','Faltou o * depois do SELECT','O nome da tabela deveria estar em maiúsculas'],ok:0,exp:'Colunas se separam com vírgula, mas a última não leva. A vírgula depois de modelo quebra a consulta.'},
   {id:'1d',q:'Depois de rodar esta consulta, o que muda no banco de dados?',code:'SELECT nome AS Suspeito FROM pessoas;',opts:['Nada. Só o título da coluna no resultado muda','A coluna nome passa a se chamar Suspeito','É criada uma tabela nova chamada Suspeito'],ok:0,exp:'AS é só um apelido no resultado. SELECT nunca altera o banco.'},
   {id:'1e',q:'Qual consulta mostra a placa e a cor de todos os veículos?',opts:['SELECT placa, cor FROM veiculos;','SELECT veiculos FROM placa, cor;','SELECT placa cor FROM veiculos;'],ok:0,exp:'Primeiro as colunas, separadas por vírgula, depois FROM e a tabela. Sem a vírgula, cor vira apelido de placa.'}
  ],
  write:[
   {id:'1w1',q:'Mostre só o <b>nome</b> e a <b>cidade</b> de todas as pessoas do cadastro.',check:function(R){return rcols(R)==='cidade,nome'&&R.n===F.nPessoas},model:'SELECT nome, cidade FROM pessoas;'},
   {id:'1w2',q:'Mostre os <b>anos</b> de fabricação dos veículos, <b>sem repetição</b>.',check:function(R){return R.cols.length===1&&R.n===F.anos.length&&hasAll(R,F.anos)},model:'SELECT DISTINCT ano FROM veiculos;'},
   {id:'1w3',q:'Mostre a placa dos <b>4 primeiros</b> veículos, numa coluna chamada <b>Placa_Suspeita</b>.',check:function(R){return R.n===4&&R.cols.length===1&&R.cols[0]==='placa_suspeita'},model:'SELECT placa AS Placa_Suspeita FROM veiculos LIMIT 4;'}
  ]});
