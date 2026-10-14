/* BO 1003 · Módulo 2 · BETWEEN, IN, chave estrangeira */
registrarCaso({id:'1003',titulo:'Assalto à Transportadora Central',modulo:2,natureza:'Roubo de carga (art. 157)',quando:'12/10/2026 22:45',local:'Rod. Castelo Branco, Km 16',solicitante:'Delegado Paulo Henrique Dias',
  tempo:170,
  aoEncerrar:function(){setTimeout(function(){say('celia','Mandado assinado. Pra um primeiro dia, nada mal. Mas promoção não cai do céu: a prova do Módulo 2 já tá na ACADEPOL. Passa nela e eu assino tua promoção.')},1200);setTimeout(function(){toast('ACADEPOL','Prova do Módulo 2 liberada.','warn',openProva)},2600)},
  relato:'Três homens renderam o motorista de um caminhão da Transportadora Central e levaram a carga de eletrônicos. Duas testemunhas viram uma <b>caminhonete preta</b> sair do acostamento em alta velocidade, sentido capital, e <q>passar voando</q> pelo radar do Km 18. A escuta do número investigado foi anexada em Arquivos › Evidências. Identifique o veículo e o proprietário.',
  steps:[
   {t:'No radar do Km 18 da Castelo, ache as passagens <b>acima de 120 km/h</b> entre <b>22:45 e 23:15</b> do dia 12/10.',
    h:['São três filtros ao mesmo tempo, ligados por AND. Para o local, <code>LIKE \'%Km 18%\'</code> evita digitar o nome inteiro. A coluna data_hora guarda data e hora juntas.','<code>SELECT * FROM leituras_radar WHERE local_radar LIKE \'%Km 18%\' AND data_hora BETWEEN \'2026-10-12 22:45:00\' AND \'2026-10-12 23:15:00\' AND velocidade_kmh &gt; 120;</code>'],
    ok:function(R){return R.n===3&&has(R,'KZX9B21','JKL4A12','RTA8K02')}},
   {t:'O radar não sabe o modelo. Descubra no cadastro de <code>veiculos</code> qual dessas placas é uma caminhonete preta.',
    h:['IN compara com uma lista: <code>WHERE placa IN (\'AAA1A11\', \'BBB2B22\')</code>.','<code>SELECT placa, modelo, cor, cpf_proprietario FROM veiculos WHERE placa IN (…as três placas…);</code>'],
    ok:function(R){return R.n<=3&&has(R,'KZX9B21','hilux')}},
   {t:'Descubra o nome do proprietário na tabela <code>pessoas</code>.',
    h:['A coluna cpf_proprietario de veiculos aponta para a coluna cpf de pessoas. É assim que as tabelas se conectam.','<code>SELECT nome, cidade FROM pessoas WHERE cpf = \'…cpf que você achou…\';</code>'],
    ok:function(R){return R.n<=2&&has(R,'Valdemar Silveira')}}
  ],
  final:{tipo:'mandado',titulo:'Mandado de prisão preventiva',campos:[{id:'placa',label:'Placa do veículo'},{id:'nome',label:'Nome do proprietário'}],
    check:function(v){var p=normPlaca(v.placa),n=normTxt(v.nome);
      var why={JKL4A12:'Corolla é sedã. As testemunhas viram uma caminhonete.',RTA8K02:'A S10 é caminhonete, mas é prata. As testemunhas viram uma preta.',MNP3F77:'Essa Hilux passou a 97 km/h. Ninguém "passa voando" a 97.',LMB6G55:'Essa Hilux passou pelo radar às 21:32, antes do assalto.',HBD2D44:'Esse HB20 passou na Av. Dom Aguirre, longe da rodovia.'};
      if(p!=='KZX9B21')return {ok:false,pen:20,msg:'O delegado indeferiu o mandado. '+(why[p]||(F.placas.indexOf(p)>=0?'Esse veículo não aparece na janela do assalto.':'Essa placa não existe no cadastro.'))};
      if(n.indexOf('valdemar')<0||n.indexOf('silveira')<0)return {ok:false,pen:15,msg:'Placa certa, mas o nome não confere com o cadastro de pessoas. O delegado não assina mandado com nome errado.'};
      return {ok:true,msg:'Mandado assinado. Equipe da DIG a caminho do endereço de Valdemar Silveira.'}}},
  manual:'<h5>BETWEEN</h5>Intervalo inclusivo: inclui as duas pontas.<pre>SELECT * FROM veiculos WHERE ano BETWEEN 2018 AND 2020;</pre><h5>Datas são texto ordenável</h5>Aqui as datas estão no formato <code>AAAA-MM-DD HH:MM:SS</code>. Por isso dá para comparar com BETWEEN, desde que você escreva a data inteira.<pre>WHERE data_hora BETWEEN \'2026-10-12 08:00:00\'\n                    AND \'2026-10-12 09:00:00\'</pre><h5>IN</h5>Compara com uma lista fechada de valores.<pre>SELECT * FROM veiculos\nWHERE modelo IN (\'Gol\', \'Strada\');</pre><h5>Chaves</h5><code>veiculos.cpf_proprietario</code> guarda o mesmo valor de <code>pessoas.cpf</code>. É uma <b>chave estrangeira</b>: aponta para uma linha de outra tabela. No Módulo 4 você vai cruzar as duas numa consulta só com JOIN. Por enquanto, siga a pista em duas consultas.'
 });
