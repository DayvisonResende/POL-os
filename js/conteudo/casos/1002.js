/* BO 1002 · Módulo 2 · WHERE, AND, LIKE */
registrarCaso({id:'1002',titulo:'Furto no estacionamento do shopping',modulo:2,natureza:'Furto qualificado (art. 155 §4º)',quando:'12/10/2026 19:20',local:'Shopping Parque das Águas, Sorocaba',solicitante:'Investigador Jairo Teixeira',
  rankMin:1,tempo:150,
  aoEncerrar:function(){unlockToast();setTimeout(function(){say('celia','O delegado gostou, e ele não gosta de ninguém. Agora é pesado: assalto na Castelo Branco, BO 2026/1003. A escuta tá em Arquivos › Evidências. Prioridade máxima, e nada de mandado no chute.')},1500);setTimeout(startBeto,22000)},
  relato:'Vítima teve um notebook furtado do carro no estacionamento G2. O vidro traseiro foi quebrado. O segurança do piso relata: <q>Vi um carro prata saindo apressado logo depois do barulho. A placa começava com FTR, o resto não deu pra ver.</q> Imagens da câmera interna ainda não foram liberadas.',
  steps:[
   {t:'Liste só os veículos de cor <code>prata</code>.',
    h:['WHERE filtra as linhas. Texto vai entre aspas simples, e as cores estão gravadas em minúsculas.','<code>SELECT * FROM veiculos WHERE cor = \'prata\';</code>'],
    ok:function(R){return R.n===F.prata.length&&hasAll(R,F.prata)}},
   {t:'Liste os veículos cuja placa começa com <code>FTR</code>.',
    h:['LIKE compara padrões. O <code>%</code> vale por "qualquer coisa daqui pra frente".','<code>SELECT * FROM veiculos WHERE placa LIKE \'FTR%\';</code>'],
    ok:function(R){return R.n===F.ftr.length&&hasAll(R,F.ftr)}},
   {t:'Combine as duas pistas numa consulta só.',
    h:['AND exige que as duas condições sejam verdadeiras na mesma linha.','<code>… WHERE cor = \'prata\' AND placa LIKE \'FTR%\';</code>'],
    ok:function(R){return R.n===1&&has(R,'FTR7A93')}}
  ],
  final:{tipo:'mandado',titulo:'Mandado de busca e apreensão',campos:[{id:'placa',label:'Placa do veículo'}],
    check:function(v){var p=normPlaca(v.placa);
      if(p==='FTR7A93')return {ok:true,msg:'Mandado deferido. Viatura a caminho do endereço do proprietário.'};
      var why={FTR2C41:'Esse Onix é branco. O segurança viu um carro prata.',FTR1D08:'Esse Corolla é preto. O segurança viu um carro prata.',FTR9B50:'Esse Kwid é vermelho. O segurança viu um carro prata.'}[p];
      if(!why)why=F.prata.indexOf(p)>=0?'O carro é prata, mas a placa não começa com FTR.':(F.placas.indexOf(p)>=0?'Esse veículo não bate com nenhuma das duas pistas.':'Essa placa não existe no cadastro.');
      return {ok:false,pen:20,msg:'O delegado indeferiu o mandado. '+why}}},
  manual:'<h5>WHERE</h5>Filtra as linhas. Só passam as que tornam a condição verdadeira.<pre>SELECT * FROM pessoas WHERE cidade = \'Itu\';</pre><h5>Texto e maiúsculas</h5>Texto vai entre aspas simples. A comparação com <code>=</code> é exata: <code>\'Itu\'</code> é diferente de <code>\'itu\'</code>.<h5>Comparações</h5><code>=</code> <code>!=</code> <code>&lt;</code> <code>&gt;</code> <code>&lt;=</code> <code>&gt;=</code><pre>SELECT * FROM veiculos WHERE ano &gt;= 2020;</pre><h5>AND e OR</h5>AND: as duas condições valem. OR: basta uma.<pre>SELECT * FROM veiculos\nWHERE cor = \'azul\' OR cor = \'cinza\';</pre><h5>LIKE</h5><code>%</code> substitui qualquer sequência de caracteres.<pre>SELECT * FROM pessoas WHERE nome LIKE \'Ana%\';</pre><h5>ORDER BY</h5>Ordena o resultado. DESC inverte a ordem.<pre>SELECT * FROM veiculos ORDER BY ano DESC;</pre>'
 });
