/* BO 1004 · Módulo 3 · COUNT, SUM, GROUP BY, HAVING · Operação Véio, Ato II (docs/historia.md)
   O padrão de fracionamento leva à conta da Denise, a dona do Virtus do furto de terça (BO 1002).
   As tarefas 5 e 6 disparam a virada no momento em que o jogador descobre (aoConcluir). */
registrarCaso({id:'1004',titulo:L('Siga o dinheiro'),modulo:3,natureza:L('Lavagem de dinheiro (Lei 9.613/98)'),quando:'14/10/2026 08:30',local:L('DTI · Operação Véio'),solicitante:L('Delegado Paulo Henrique Dias'),
  treino:'m3-agregacao',rankMin:2,diaMin:1,tempo:150,
  relato:L('<q>Receptador paga eletrônico roubado em dinheiro vivo, e dinheiro vivo precisa entrar no banco sem chamar atenção.</q> O banco é obrigado a avisar o COAF (o órgão que fiscaliza lavagem de dinheiro) de todo depósito de <b>R$ 10 mil ou mais</b>. Quem lava dinheiro sabe disso e quebra o valor em vários depósitos <b>logo abaixo de R$ 10 mil</b>: é o chamado <b>fracionamento</b>.<br><br>A carga da Transportadora Central valia R$ 380 mil. A inteligência financeira pede: olhe as transferências de <b>13/10</b>, o dia seguinte ao assalto, e encontre a conta que está recebendo esse padrão.'),
  steps:[
   {t:L('Some o valor de <b>todas</b> as transferências do dia <b>13/10</b>, o dia seguinte ao assalto.'),
    h:[L('SUM soma os valores de uma coluna, e o WHERE escolhe quais linhas entram na soma. A <code>data_hora</code> tem data e hora juntas: o dia inteiro vai de 00:00:00 a 23:59:59.'),
       L("O formato é <code>SELECT SUM(coluna) FROM tabela WHERE data_hora BETWEEN 'dia 00:00:00' AND 'dia 23:59:59';</code>"),
       L("<code>SELECT SUM(valor) FROM transferencias WHERE data_hora BETWEEN '2026-10-13 00:00:00' AND '2026-10-13 23:59:59';</code>")],
    ok:function(R){return R.n===1&&temNumero(R,F.soma13,0.01)},
    quase:function(R){if(R.n===1&&temNumero(R,valorDe('SELECT SUM(valor) FROM transferencias'),0.01))return L('essa é a soma de <b>todas</b> as transferências do cadastro. Filtre só o dia 13/10 com WHERE.')}},
   {t:L('Conte quantas transferências de 13/10 ficaram <b>entre R$ 9.000 e R$ 9.999,99</b>: logo abaixo do limite que obriga o banco a avisar.'),
    h:[L('COUNT(*) conta as linhas. Agora são duas condições no WHERE: o dia e a faixa de valor. Valor é número, vai sem aspas.'),
       L("O formato é <code>SELECT COUNT(*) FROM transferencias WHERE data_hora BETWEEN … AND … AND valor BETWEEN … AND …;</code>"),
       L("<code>SELECT COUNT(*) FROM transferencias WHERE data_hora BETWEEN '2026-10-13 00:00:00' AND '2026-10-13 23:59:59' AND valor BETWEEN 9000 AND 9999.99;</code>")],
    ok:function(R){return R.n===1&&temNumero(R,F.nFaixa13)},
    quase:function(R){if(R.n===1&&temNumero(R,valorDe('SELECT COUNT(*) FROM transferencias WHERE '+F.Q13)))return L('esse é o total de transferências do dia. Falta a faixa de valor: <code>valor BETWEEN 9000 AND 9999.99</code>.')}},
   {t:L('Agrupe essas transferências por <b>conta de destino</b> e mostre quantas cada conta recebeu.'),
    h:[L('O GROUP BY faz uma contagem por grupo. Aqui o grupo é a conta que recebeu: <code>conta_destino</code>. Mantenha os mesmos filtros do WHERE.'),
       L('O formato é <code>SELECT conta_destino, COUNT(*) FROM transferencias WHERE … GROUP BY conta_destino;</code>'),
       L("<code>SELECT conta_destino, COUNT(*) FROM transferencias WHERE data_hora BETWEEN '2026-10-13 00:00:00' AND '2026-10-13 23:59:59' AND valor BETWEEN 9000 AND 9999.99 GROUP BY conta_destino;</code>")],
    ok:function(R){return bateGrupos(R,F.gruposFaixa13,'conta_destino','n')},
    quase:function(R){if(R.n===1&&temNumero(R,F.nFaixa13))return L('saiu um número só, o total. Falta separar por conta: <code>GROUP BY conta_destino</code>.')}},
   {t:L('Deixe só as contas que receberam <b>5 ou mais</b> depósitos nessa faixa.'),
    h:[L('Filtro de grupo é com HAVING, depois do GROUP BY. O WHERE continua lá, filtrando as linhas antes.'),
       L('Acrescente no fim: <code>HAVING COUNT(*) &gt;= 5</code>.'),
       L("<code>SELECT conta_destino, COUNT(*) FROM transferencias WHERE data_hora BETWEEN '2026-10-13 00:00:00' AND '2026-10-13 23:59:59' AND valor BETWEEN 9000 AND 9999.99 GROUP BY conta_destino HAVING COUNT(*) &gt;= 5;</code>")],
    ok:function(R){return R.n===1&&has(R,F.contaDenise)},
    quase:function(R){if(bateGrupos(R,F.gruposFaixa13,'conta_destino','n'))return L('agrupou certinho. Agora o filtro dos grupos: <code>HAVING COUNT(*) &gt;= 5</code>.')},
    aoConcluir:function(){say('celia',L('Achou a conta. Fixa essa linha no Caderno, no 📌, que você vai precisar desse número mais de uma vez hoje.'))}},
   {t:L('Descubra <b>de quem</b> é essa conta: o nome do titular.'),
    h:[L('A tabela <code>contas_bancarias</code> tem o CPF do titular (<code>cpf_titular</code>). O nome fica em <code>pessoas</code>. São duas consultas, como no BO da Castelo.'),
       L('Primeiro <code>SELECT * FROM contas_bancarias WHERE id = …;</code> e depois <code>SELECT * FROM pessoas WHERE cpf = \'…\';</code>'),
       L('Pegue o <code>cpf_titular</code> da conta e procure esse CPF em <code>pessoas</code>: <code>SELECT nome FROM pessoas WHERE cpf = \'o CPF que você achou\';</code>')],
    ok:function(R){return has(R,'Denise Albuquerque Prado')},
    quase:function(R){if(has(R,F.cpfDenise))return L('esse é o CPF da titular. O nome está na tabela <code>pessoas</code>.')},
    aoConcluir:function(){say('celia',L('Denise Albuquerque Prado. Recruta… esse nome não te lembra nada?'))}},
   {t:L('Esse nome não é estranho. Confira se essa pessoa tem algum <b>veículo</b> no cadastro.'),
    h:[L('O dono do veículo está em <code>veiculos.cpf_proprietario</code>. Você já tem o CPF dela.'),
       L("<code>SELECT * FROM veiculos WHERE cpf_proprietario = '…';</code>"),
       L("Use o CPF da Denise: <code>SELECT * FROM veiculos WHERE cpf_proprietario = 'o CPF dela';</code>")],
    ok:function(R){return has(R,'FTR7A93')},
    aoConcluir:function(){
     say('celia',L('O Virtus prata. O do shopping. Terça, 19:20, ela furta um notebook. Terça, 22:45, roubam a carga. No mesmo dia.'));
     setTimeout(function(){say('jairo',L('Recruta, liguei agora pra vítima do furto do shopping. Sabe onde ela trabalha? Transportadora Central. É coordenadora de logística. O notebook tinha a escala dos caminhões da semana: rota, horário, placa.'))},4500);
     setTimeout(function(){say('celia',L('O furtinho de terça foi o primeiro passo do assalto, e você pegou as duas pontas sem saber. Agora pede o bloqueio dessa conta antes que o dinheiro suma.'))},9000)}}
  ],
  final:{tipo:'mandado',titulo:L('Pedido de bloqueio de conta'),campos:[{id:'conta',label:L('Conta (número no sistema)')},{id:'titular',label:L('Nome do titular')}],
    check:function(v){
      var bruto=String(v.conta).trim(),id=parseInt(bruto.replace(/\D/g,''),10),n=normTxt(v.titular);
      var certa=id===F.contaDenise||bruto.replace(/\s/g,'')===valorDe('SELECT numero FROM contas_bancarias WHERE id = '+F.contaDenise);
      if(!certa){
        if(F.contasLaranja.indexOf(id)>=0)return {ok:false,pen:15,msg:L('O juiz negou o bloqueio. Essa conta recebeu dinheiro vivo e repassou: ela é de quem empresta o nome, não de quem acumula. A conta que concentra os depósitos é outra.')};
        if(valorDe('SELECT COUNT(*) FROM contas_bancarias WHERE id = '+(id||0)))return {ok:false,pen:15,msg:L('O juiz negou o bloqueio. Essa conta não tem o padrão de depósitos fracionados de 13/10.')};
        return {ok:false,pen:15,msg:L('O juiz negou o bloqueio. Essa conta não existe no cadastro.')};
      }
      if(n.indexOf('denise')<0||n.indexOf('prado')<0)return {ok:false,pen:10,msg:L('Conta certa, mas o nome do titular não confere com o cadastro. Juiz não bloqueia conta com nome errado.')};
      return {ok:true,msg:L('Bloqueio deferido. A conta de Denise Albuquerque Prado está congelada, e o dinheiro da carga parou de andar.')}}},
  manual:L("<h5>Funções de agregação</h5>Resumem uma coluna inteira num número.<pre>SELECT COUNT(*) FROM veiculos;\nSELECT MAX(ano), MIN(ano) FROM veiculos;\nSELECT AVG(velocidade_kmh) FROM leituras_radar;</pre><h5>SUM com WHERE</h5>O WHERE escolhe as linhas antes da conta.<pre>SELECT SUM(velocidade_kmh) FROM leituras_radar\nWHERE local_radar = 'Av. Dom Aguirre';</pre><h5>GROUP BY</h5>Uma conta para cada grupo. Cada grupo vira uma linha.<pre>SELECT cidade, COUNT(*) FROM pessoas GROUP BY cidade;</pre><h5>HAVING</h5>Filtra os grupos, depois da conta pronta. O WHERE filtra linhas antes.<pre>SELECT cor, COUNT(*) FROM veiculos\nGROUP BY cor HAVING COUNT(*) &gt; 5;</pre><h5>A ordem</h5><code>SELECT … FROM … WHERE … GROUP BY … HAVING … ORDER BY … LIMIT …</code>"),
  aoEncerrar:function(){
    setTimeout(function(){say('celia',L('Conta bloqueada. Agora a pergunta que importa: quem mandou esse dinheiro pra ela? Antes, cinco minutos comigo: hoje você vai conhecer o vazio.'))},1500);
    setTimeout(function(){say('marina',L('Vi que você achou a Denise, que orgulho! Dica de quem já apanhou disso: conta de laranja costuma ser aberta pouco antes do crime. Olha a data em que cada conta foi aberta.'))},7000)}
});
