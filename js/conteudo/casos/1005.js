/* BO 1005 · Módulo 3 · NULL, COUNT(coluna), SUM, MIN/MAX · Operação Véio, Ato II (docs/historia.md)
   O dinheiro entrou em espécie (conta_origem vazia: NULL) em contas de idosos abertas semanas antes: laranjas.
   Termina com a pergunta que abre os Atos IV e V: onde o bando arruma tanto CPF de idoso? */
registrarCaso({id:'1005',titulo:L('Os laranjas'),modulo:3,natureza:L('Lavagem de dinheiro com uso de laranjas'),quando:'14/10/2026 13:10',local:L('DTI · Operação Véio'),solicitante:L('Célia Moura, Supervisora DTI'),
  treino:'m3-nulos',rankMin:2,diaMin:1,tempo:170,
  relato:L('A conta da Denise está bloqueada. Agora a pergunta é outra: <b>quem</b> mandou esse dinheiro para ela? Cada depósito veio de uma conta diferente.<br><br><q>Ninguém tem tanto amigo generoso assim, recruta. Isso tem cara de laranja: gente que empresta o nome, às vezes sem nem saber, pra conta do crime.</q><br><br>Descubra de onde veio o dinheiro, quanto entrou, quem são os titulares e desde quando essas contas existem.'),
  steps:[
   {t:L('Liste, <b>sem repetir</b>, as contas que mandaram dinheiro para a conta da Denise.'),
    h:[L('As transferências que chegaram na conta dela têm <code>conta_destino</code> igual ao número da conta. A conta que mandou fica em <code>conta_origem</code>.'),
       L('O formato é <code>SELECT DISTINCT conta_origem FROM transferencias WHERE conta_destino = …;</code>'),
       L('Use o número da conta da Denise, o mesmo do BO 1004: <code>SELECT DISTINCT conta_origem FROM transferencias WHERE conta_destino = número;</code>')],
    ok:function(R){return R.n===F.contasLaranja.length&&hasAll(R,F.contasLaranja)},
    quase:function(R){if(hasAll(R,F.contasLaranja)&&R.n>F.contasLaranja.length)return L('as contas estão aí, mas repetidas. Use DISTINCT para cada uma aparecer uma vez só.')}},
   {t:L('Veja tudo o que <b>entrou</b> nessas contas. Repare na coluna <code>conta_origem</code>.'),
    h:[L('Agora essas contas são o destino. IN aceita a lista de números que você acabou de achar.'),
       L('O formato é <code>SELECT * FROM transferencias WHERE conta_destino IN (…, …, …);</code>'),
       L('Coloque os números das contas da tarefa anterior dentro do IN, separados por vírgula.')],
    ok:function(R){return bate(R,'SELECT * FROM transferencias WHERE conta_destino IN ('+F.contasLaranja.join(',')+')')},
    aoConcluir:function(){say('celia',L('Viu as células vazias em conta_origem? Isso é NULL: o banco não sabe de onde veio. Dinheiro vivo, depositado no caixa, não tem conta de origem. Esse é o dinheiro da carga entrando no sistema.'))}},
   {t:L('Conte quantas transferências do cadastro inteiro <b>não têm</b> conta de origem.'),
    h:[L('Vazio se procura com IS NULL. E lembra: <code>= NULL</code> nunca é verdade.'),
       L('O formato é <code>SELECT COUNT(*) FROM transferencias WHERE coluna IS NULL;</code>'),
       L('<code>SELECT COUNT(*) FROM transferencias WHERE conta_origem IS NULL;</code>')],
    ok:function(R){return R.n===1&&temNumero(R,F.nSemOrigem)},
    quase:function(R){if(R.n===1&&temNumero(R,0))return L('deu zero? Aposto num <code>= NULL</code>. Pra vazio, o certo é <code>IS NULL</code>.')}},
   {t:L('Some <b>quanto dinheiro</b> entrou assim, sem origem.'),
    h:[L('Mesmo filtro da tarefa anterior, trocando a contagem pela soma do valor.'),
       L('O formato é <code>SELECT SUM(valor) FROM transferencias WHERE … IS NULL;</code>'),
       L('<code>SELECT SUM(valor) FROM transferencias WHERE conta_origem IS NULL;</code>')],
    ok:function(R){return R.n===1&&temNumero(R,F.somaEspecie,0.01)},
    quase:function(R){if(R.n===1&&temNumero(R,valorDe('SELECT SUM(valor) FROM transferencias'),0.01))return L('essa é a soma de todas as transferências. Filtre só as sem origem.')}},
   {t:L('Descubra <b>quem são</b> os titulares das contas que mandaram dinheiro para a Denise.'),
    h:[L('Igual ao BO 1004, em duas consultas: primeiro os CPFs em <code>contas_bancarias</code>, depois os nomes em <code>pessoas</code>. Agora com IN, porque são várias contas.'),
       L("<code>SELECT cpf_titular FROM contas_bancarias WHERE id IN (…);</code> e depois <code>SELECT * FROM pessoas WHERE cpf IN ('…', '…');</code>"),
       L('Use os números das contas da tarefa 1 no primeiro IN e os CPFs que aparecerem no segundo. Repare na data de nascimento e na cidade de cada um.')],
    ok:function(R){return hasAll(R,F.laranjas)},
    quase:function(R){if(hasAll(R,F.cpfsLaranja))return L('esses são os CPFs dos titulares. Os nomes estão na tabela <code>pessoas</code>.')},
    aoConcluir:function(){say('celia',L('Olha as datas de nascimento, recruta. Todo mundo com mais de 70 anos. Todo mundo de Piedade ou de Itu.'))}},
   {t:L('Quando essas contas foram abertas? Mostre a data de abertura <b>mais antiga</b> e a <b>mais recente</b>.'),
    h:[L('A data de abertura está em <code>contas_bancarias.aberta_em</code>. MIN e MAX funcionam com datas também.'),
       L('O formato é <code>SELECT MIN(aberta_em), MAX(aberta_em) FROM contas_bancarias WHERE id IN (…);</code>'),
       L('Use os números das contas da tarefa 1 dentro do IN.')],
    ok:function(R){return R.n===1&&has(R,F.aberturaLaranjas[0],F.aberturaLaranjas[1])},
    aoConcluir:function(){say('celia',L('Todas abertas entre setembro e o começo de outubro. Semanas antes do assalto. Ninguém de 80 anos sai abrindo conta assim, de uma hora pra outra. Alguém abriu por eles.'))}}
  ],
  final:{tipo:'resposta',titulo:L('Relatório ao delegado'),campos:[{id:'n',label:L('Quantas pessoas emprestaram o nome (laranjas)?')},{id:'total',label:L('Quanto entrou em dinheiro vivo, no total? (R$)')}],
    check:function(v){
      var n=parseInt(String(v.n).replace(/\D/g,''),10),t=lerNumero(v.total);
      if(n!==F.laranjas.length)return {ok:false,pen:5,msg:L('Célia: "Contei de novo e não bateu o número de laranjas. Conta os titulares das contas que mandaram dinheiro pra Denise, sem repetir."')};
      if(!(Math.abs(t-F.somaEspecie)<=1))return {ok:false,pen:5,msg:L('Célia: "O número de laranjas tá certo, mas o total não bate. É a soma das transferências sem conta de origem. Confere os centavos também."')};
      return {ok:true,msg:L('Relatório aceito. O delegado mandou ouvir os oito titulares. "Nunca abri conta nenhuma", disse o primeiro, de 82 anos.')}}},
  manual:L("<h5>NULL</h5>É a célula vazia: \"ninguém sabe\". Não é zero nem texto em branco.<h5>IS NULL e IS NOT NULL</h5>Vazio se procura com IS NULL. <code>= NULL</code> nunca é verdade.<pre>SELECT * FROM transferencias WHERE descricao IS NULL;</pre><h5>COUNT(*) × COUNT(coluna)</h5>COUNT(*) conta todas as linhas; COUNT(coluna) só as preenchidas.<pre>SELECT COUNT(*), COUNT(descricao) FROM transferencias;</pre><h5>COALESCE</h5>Troca o vazio por um valor.<pre>SELECT COALESCE(descricao, 'sem descrição') FROM transferencias;</pre><h5>MIN e MAX com datas</h5>Funcionam com texto de data no formato AAAA-MM-DD.<pre>SELECT MIN(data_nascimento), MAX(data_nascimento) FROM pessoas;</pre>"),
  aoEncerrar:function(){
    setTimeout(function(){say('celia',L('Oito aposentados de Piedade e Itu, contas abertas semanas antes do crime. Me responde uma coisa, recruta: onde é que esse povo arruma tanto CPF de velhinho?'))},1500);
    setTimeout(function(){toast('ACADEPOL',L('Prova do Módulo 3 liberada.'),'warn',openProva)},3500)}
});
