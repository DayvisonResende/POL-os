/* BO 1001 · Módulo 1 · treinamento */
registrarCaso({id:'1001',titulo:'Primeiro acesso ao cadastro',modulo:1,natureza:'Chamado interno (treinamento)',quando:'13/10/2026 08:00',local:'DTI · Baia 04',solicitante:'Célia Moura, Supervisora DTI',
  tempo:100,
  aoEncerrar:function(){setTimeout(function(){unlockApp('prova','ACADEPOL');say('celia','Relatório aceito. Mas calma: ocorrência de verdade só depois da prova da ACADEPOL. Cinco questões, com consulta liberada. Abre o programa da Academia na tua área de trabalho. E não cola do Beto, que ele reprovou três vezes.')},1200)},
  relato:'<q>Recruta, antes de encostar em ocorrência de verdade, você vai aprender a ler o cadastro do Detran comigo, no DB-Investigator. Do meu jeito. No fim, quero saber quantas cores diferentes de veículo existem no cadastro. Relatório até as 10h, e o café é por sua conta.</q>',
  steps:[
   {t:'Veja a tabela <code>veiculos</code> inteira.',
    h:['O asterisco quer dizer todas as colunas.','<code>SELECT * FROM veiculos;</code>'],
    ok:function(R){return R.n===F.nVeic&&['placa','modelo','cor','ano','cpf_proprietario'].every(function(c){return R.cols.indexOf(c)>=0})}},
   {t:'Mostre só as colunas <code>placa</code> e <code>modelo</code> de todos os veículos.',
    h:['Troque o * pelos nomes das colunas que você quer, separados por vírgula.','<code>SELECT placa, modelo FROM veiculos;</code>'],
    ok:function(R){return R.cols.length===2&&R.cols.indexOf('placa')>=0&&R.cols.indexOf('modelo')>=0&&R.n===F.nVeic}},
   {t:'Liste as cores do cadastro <b>sem repetição</b>.',
    h:['DISTINCT vem logo depois do SELECT e elimina linhas repetidas.','<code>SELECT DISTINCT cor FROM veiculos;</code>'],
    ok:function(R){return R.cols.length===1&&R.n===F.cores.length&&hasAll(R,F.cores)}},
   {t:'Mostre só 5 veículos, com a coluna <code>modelo</code> renomeada para <code>Veiculo</code>.',
    h:['LIMIT vai no fim da consulta e corta a quantidade de linhas. AS dá um apelido para a coluna.','<code>SELECT placa, modelo AS Veiculo FROM veiculos LIMIT 5;</code>'],
    ok:function(R){return R.n===5&&R.cols.indexOf('veiculo')>=0}}
  ],
  final:{tipo:'resposta',titulo:'Relatório à supervisão',campos:[{id:'resp',label:'Quantas cores distintas existem no cadastro?'}],
    check:function(v){var n=parseInt(String(v.resp).trim(),10);if(n===F.cores.length)return {ok:true,msg:'Célia: "Conferi, '+n+' cores. Relatório aceito. Não fez mais que a obrigação."'};return {ok:false,pen:5,msg:'Célia: "Contei aqui e não bateu. Roda o DISTINCT de novo e conta as linhas, uma por uma. Chute eu reconheço de longe."'}}},
  manual:'<h5>SELECT e FROM</h5>Toda consulta diz <i>o que</i> mostrar (SELECT) e <i>de onde</i> (FROM). O ponto e vírgula fecha a consulta.<pre>SELECT nome, cidade FROM pessoas;</pre><h5>O asterisco</h5><code>*</code> traz todas as colunas. Bom para explorar uma tabela que você ainda não conhece.<pre>SELECT * FROM pessoas;</pre><h5>DISTINCT</h5>Remove linhas repetidas do resultado.<pre>SELECT DISTINCT cidade FROM pessoas;</pre><h5>LIMIT</h5>Corta o resultado em N linhas. Útil quando a tabela é grande.<pre>SELECT * FROM pessoas LIMIT 3;</pre><h5>AS</h5>Dá um apelido para a coluna no resultado. Não muda nada no banco.<pre>SELECT nome AS Cidadao FROM pessoas;</pre>'
 });
