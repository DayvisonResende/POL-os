/* BO 1002 · Módulo 2 · WHERE, AND, LIKE */
registrarCaso({id:'1002',titulo:'Furto no estacionamento do shopping',modulo:2,natureza:'Furto qualificado (art. 155 §4º)',quando:'12/10/2026 19:20',local:'Shopping Parque das Águas, Sorocaba',solicitante:'Investigador Jairo Teixeira',
  treino:'m2-filtros',rankMin:1,tempo:150,
  aoEncerrar:function(){unlockToast();setTimeout(function(){say('celia','O delegado gostou, e ele não gosta de ninguém. Agora é pesado: assalto na Castelo Branco, BO 2026/1003. Prioridade máxima, e nada de mandado no chute. Antes, dez minutos comigo no terminal: intervalo de horário você ainda não sabe fazer.')},1500);setTimeout(startBeto,22000)},
  relato:'Vítima teve um notebook furtado do carro no estacionamento G2. O vidro traseiro foi quebrado. O segurança do piso relata: <q>Vi um carro prata saindo apressado logo depois do barulho. A placa começava com FTR, o resto não deu pra ver.</q> Imagens da câmera interna ainda não foram liberadas.',
  steps:[
   {t:'Liste só os veículos de cor <code>prata</code>.',
    h:['WHERE filtra as linhas. Texto vai entre aspas simples, e as cores estão gravadas em minúsculas.','O formato é sempre <code>SELECT * FROM tabela WHERE coluna = \'valor\';</code>, nessa ordem. Mantenha o <code>*</code>, que mostra todas as colunas, e troque só <i>tabela</i>, <i>coluna</i> e <i>valor</i> pelas palavras do caso. Os nomes certos estão no Dicionário de Dados.','<code>SELECT * FROM veiculos WHERE cor = \'prata\';</code>'],
    ok:function(R){return R.n===F.prata.length&&hasAll(R,F.prata)},
    quase:function(R){if(mesmasLinhas(R,F.l1002prata)&&falta(R,'placa'))return 'o filtro está certo, vieram os '+R.n+' veículos prata. Mas com essas colunas não dá pra saber <i>quais</i> carros são. Mostre também a <code>placa</code>, ou use <code>SELECT *</code> para ver todas as colunas.'}},
   {t:'Liste os veículos cuja placa começa com <code>FTR</code>.',
    h:['LIKE compara padrões. O <code>%</code> vale por "qualquer coisa daqui pra frente".','Mesmo formato do passo anterior, trocando o <code>=</code> por <code>LIKE</code>: <code>WHERE coluna LIKE \'começo%\'</code>. O <code>%</code> fica logo depois do pedaço da placa que o segurança viu.','<code>SELECT * FROM veiculos WHERE placa LIKE \'FTR%\';</code>'],
    ok:function(R){return R.n===F.ftr.length&&hasAll(R,F.ftr)},
    quase:function(R){if(mesmasLinhas(R,F.l1002ftr)&&falta(R,'placa'))return 'o filtro está certo, vieram '+R.n+' veículos. Mas sem a coluna <code>placa</code> no resultado não dá pra conferir quais são. Inclua a placa, ou use <code>SELECT *</code>.'}},
   {t:'Combine as duas pistas numa consulta só.',
    h:['AND exige que as duas condições sejam verdadeiras na mesma linha.','Pegue as duas condições que você já escreveu nos passos anteriores e junte as duas com AND: <code>WHERE condição_1 AND condição_2</code>.','<code>SELECT * FROM veiculos WHERE cor = \'prata\' AND placa LIKE \'FTR%\';</code>'],
    ok:function(R){return R.n===1&&has(R,'FTR7A93')},
    quase:function(R){if(mesmasLinhas(R,F.l1002alvo)&&falta(R,'placa'))return 'sobrou um veículo só, ótimo. Agora mostre a <code>placa</code> dele no resultado, que é ela que vai no mandado.'}}
  ],
  final:{tipo:'mandado',titulo:'Mandado de busca e apreensão',campos:[{id:'placa',label:'Placa do veículo'}],
    check:function(v){var p=normPlaca(v.placa);
      if(p==='FTR7A93')return {ok:true,msg:'Mandado deferido. Viatura a caminho do endereço do proprietário.'};
      var why={FTR2C41:'Esse Onix é branco. O segurança viu um carro prata.',FTR1D08:'Esse Corolla é preto. O segurança viu um carro prata.',FTR9B50:'Esse Kwid é vermelho. O segurança viu um carro prata.'}[p];
      if(!why)why=F.prata.indexOf(p)>=0?'O carro é prata, mas a placa não começa com FTR.':(F.placas.indexOf(p)>=0?'Esse veículo não bate com nenhuma das duas pistas.':'Essa placa não existe no cadastro.');
      return {ok:false,pen:20,msg:'O delegado indeferiu o mandado. '+why}}},
  manual:'<h5>WHERE</h5>Filtra as linhas. Só passam as que tornam a condição verdadeira.<pre>SELECT * FROM pessoas WHERE cidade = \'Itu\';</pre><h5>Texto e maiúsculas</h5>Texto vai entre aspas simples. A comparação com <code>=</code> é exata: <code>\'Itu\'</code> é diferente de <code>\'itu\'</code>.<h5>Comparações</h5><code>=</code> <code>!=</code> <code>&lt;</code> <code>&gt;</code> <code>&lt;=</code> <code>&gt;=</code><pre>SELECT * FROM veiculos WHERE ano &gt;= 2020;</pre><h5>AND e OR</h5>AND: as duas condições valem. OR: basta uma.<pre>SELECT * FROM veiculos\nWHERE cor = \'azul\' OR cor = \'cinza\';</pre><h5>LIKE</h5><code>%</code> substitui qualquer sequência de caracteres.<pre>SELECT * FROM pessoas WHERE nome LIKE \'Ana%\';</pre><h5>ORDER BY</h5>Ordena o resultado. DESC inverte a ordem.<pre>SELECT * FROM veiculos ORDER BY ano DESC;</pre>'
 });
