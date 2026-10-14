/* Prova do Módulo 2. requer = BO que precisa estar encerrado; para = índice da patente em RANKS. */
registrarProva(2,{requer:'1003',para:2,titulo:'Módulo 2 · Filtros, pistas parciais e ordenação',
  mcq:[
   {id:'2a',q:'Esta consulta voltou vazia, mas o cadastro tem carros pretos. Por quê?',code:"SELECT * FROM veiculos WHERE cor = 'Preto';",opts:["As cores estão gravadas em minúsculas, e 'Preto' é diferente de 'preto'",'Faltou o LIMIT no fim','O WHERE só funciona com números'],ok:0,exp:'Com =, o texto precisa ser idêntico, letra por letra, inclusive maiúsculas.'},
   {id:'2b',q:'Qual filtro encontra as placas que <b>terminam</b> com 21?',opts:["placa LIKE '%21'","placa LIKE '21%'","placa = '%21'"],ok:0,exp:"O % vale por qualquer coisa. '%21' quer dizer: qualquer coisa antes, 21 no fim. Com = o % não funciona como curinga."},
   {id:'2c',q:'O filtro abaixo inclui os carros de 2020?',code:'WHERE ano BETWEEN 2018 AND 2020',opts:['Sim, o BETWEEN inclui as duas pontas','Não, ele para em 2019','Só se a consulta tiver ORDER BY'],ok:0,exp:'BETWEEN é inclusivo: 2018, 2019 e 2020 entram.'},
   {id:'2d',q:'Qual a diferença entre AND e OR?',opts:['AND exige as duas condições; OR aceita qualquer uma delas','OR exige as duas condições; AND aceita qualquer uma','Nenhuma, os dois funcionam igual'],ok:0,exp:'AND estreita a busca (as duas precisam valer). OR alarga (basta uma).'},
   {id:'2e',q:'Nesta consulta, qual linha aparece primeiro?',code:'SELECT * FROM leituras_radar\nORDER BY velocidade_kmh DESC;',opts:['A passagem mais rápida','A passagem mais lenta','A passagem mais recente'],ok:0,exp:'DESC ordena do maior para o menor. Aqui, do mais rápido para o mais lento.'}
  ],
  write:[
   {id:'2w1',q:'Liste os veículos <b>brancos</b> fabricados <b>a partir de 2020</b>.',check:function(R){return R.n===F.branco20.length&&hasAll(R,F.branco20)},model:"SELECT * FROM veiculos WHERE cor = 'branco' AND ano >= 2020;"},
   {id:'2w2',q:'Liste a <b>placa</b> e a <b>velocidade</b> das passagens pela <b>Av. Dom Aguirre</b>, da mais rápida para a mais lenta.',check:function(R){var i=R.cols.indexOf('velocidade_kmh');if(R.n!==F.nAguirre||i<0||R.cols.indexOf('placa')<0)return false;for(var k=1;k<R.rows.length;k++)if(R.rows[k][i]>R.rows[k-1][i])return false;return true},model:"SELECT placa, velocidade_kmh FROM leituras_radar\nWHERE local_radar = 'Av. Dom Aguirre'\nORDER BY velocidade_kmh DESC;"},
   {id:'2w3',q:'Encontre as pessoas que moram em <b>Itu</b> ou em <b>Salto</b>.',check:function(R){return R.n===F.ituSalto.length&&hasAll(R,F.ituSalto)},model:"SELECT * FROM pessoas WHERE cidade IN ('Itu', 'Salto');"}
  ]});
