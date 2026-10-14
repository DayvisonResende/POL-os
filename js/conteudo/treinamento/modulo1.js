/* Treinamento guiado do BO 1001 (motor em js/apps/treinamento.js). */
var MINITAB='<table class="minitab"><tr><th>placa</th><th class="hc">modelo</th><th>cor</th></tr><tr><td>QAB1C23</td><td class="hc">Gol</td><td>branco</td></tr><tr class="hr"><td>RTD4E56</td><td class="hc">Strada</td><td>prata</td></tr><tr><td>MCV7F89</td><td class="hc">Onix</td><td>preto</td></tr></table><div class="legend"><span class="lr">uma linha = um carro</span><span class="lc">uma coluna = uma informação</span></div>';
var ANAT='<div class="anat"><div><code>SELECT</code><span>mostre</span></div><div><code>*</code><span>todas as colunas</span></div><div><code>FROM</code><span>da tabela</span></div><div><code>veiculos</code><span>nome da tabela</span></div><div><code>;</code><span>fim da consulta</span></div></div>';
var TUT=[
 {type:'msg',btn:'Tô ouvindo',text:'<p>Mais um recruta. O último durou três semanas.</p><p>Eu sou a Célia, vinte e dois anos de DTI, e hoje sou sua babá. Vou te ensinar <b>SQL</b>, que é o jeito de fazer pergunta pro banco de dados da polícia. Não precisa saber programar. Precisa prestar atenção, que eu não gosto de repetir.</p>'},
 {type:'msg',btn:'Entendi',text:'<p>Banco de dados é um arquivo de aço cheio de gavetas. Cada gaveta é uma <b>tabela</b>. E tabela é igual planilha de Excel, que até minha mãe usa:</p>',extra:MINITAB,text2:'<p>Cada <b>linha</b> é um registro: um carro. Cada <b>coluna</b> é um tipo de informação: placa, modelo, cor. Decorou? Vai cair na prova.</p>'},
 {type:'run',sql:'SELECT * FROM veiculos;',text:'<p>Deixei uma consulta pronta ali no editor, a tela preta. Ela pede pro banco: <i>me mostra tudo da gaveta de veículos</i>.</p><p>Tá vendo o botão azul-escuro lá em cima, escrito <b>Executar</b>? Clica nele. Sem medo, que esse aqui não morde.</p>',spot:'#runBtn',point:'clica aqui',
  ok:function(R){return R.n===F.nVeic&&R.cols.length>=5},
  after:'<p>Pronto. Isso que apareceu embaixo é a tabela <code>veiculos</code>: <b>{n} carros</b>, um por linha. Rola pro lado pra ver todas as colunas. Calma, ninguém vai te pedir pra decorar placa.</p>'},
 {type:'msg',text:'<p>Agora vamos abrir o bicho por dentro. Toda consulta tem o mesmo esqueleto: <b>SELECT</b> <i>o quê</i> <b>FROM</b> <i>de onde</i>.</p>',extra:ANAT,text2:'<p>É tudo em inglês porque quem inventou não falava português. SELECT é "selecione", FROM é "de". Simples assim.</p>'},
 {type:'explain',text:'<p>Segredo de quem tá aqui há vinte anos: ninguém lembra de tudo. Quando uma consulta parecer grego, clica em <b>Explique esta consulta</b> que o sistema traduz pro português, pedaço por pedaço.</p><p>Clica aí agora, quero ver.</p>',spot:'#explBtn',point:'esse aqui',
  after:'<p>Viu? Usa à vontade, quantas vezes quiser. Burro é quem fica com dúvida e não pergunta.</p>'},
 {type:'predict',sql:'SELECT placa FROM veiculos;',text:'<p>Mexi na consulta: troquei o <code>*</code> por outra coisa. E antes que você saia clicando, <b>pensa primeiro</b>.</p>',q:'O que essa consulta vai mostrar?',
  opts:[{t:'Só a coluna placa, de todos os carros',ok:true,fb:'Isso. Trocou o * pelo nome de uma coluna, aparece só aquela coluna. Agora executa pra conferir.'},
        {t:'Todas as colunas, mas de um carro só',fb:'Hmm, não. Onde é que tá escrito "um carro só" aí? O que mudou foi o *, que virou placa. Pensa de novo.'},
        {t:'Todas as colunas de todos os carros',fb:'Isso seria o *, espertinho. Mas o * sumiu, olha lá: virou placa. Tenta de novo.'}],
  ok:function(R){return R.cols.length===1&&R.cols[0]==='placa'&&R.n===F.nVeic},
  after:'<p>Exatamente. Uma coluna só, com as {n} placas. Viu como pensar antes ajuda? Quem chuta aqui dentro acaba assinando mandado errado.</p>'},
 {type:'slot',template:'SELECT placa, ___ FROM veiculos;',text:'<p>Agora é você que escolhe. O investigador Jairo quer a <b>placa e o modelo</b> de cada carro, e o Jairo não tem paciência.</p><p>Clica na peça que vai no lugar do <code>___</code>.</p>',
  chips:[{t:'cor'},{t:'modelo'},{t:'veiculos',bad:'Ô, criatura. <code>veiculos</code> é a gaveta, não o papel dentro dela. A tabela já tá ali depois do FROM. Escolhe uma <b>coluna</b>.'},{t:'ano'}],
  ok:function(R){return R.cols.length===2&&R.cols.indexOf('placa')>=0&&R.cols.indexOf('modelo')>=0&&R.n===F.nVeic},
  miss:function(R,k){return esc(k,['Rodou, mas não é isso que o Jairo pediu. Ele quer placa e <b>modelo</b>. Troca a peça.','De novo? Lê o pedido com calma: placa e <b>modelo</b>. A peça certa tá escrita igualzinho.'])},
  after:'<p>Agora sim. Repara na vírgula entre <code>placa</code> e <code>modelo</code>: coluna se separa com vírgula, e a última não leva. Esse errinho derruba muito recruta metido.</p>'},
 {type:'msg',text:'<p>Agora um problema. Pede só a coluna <code>cor</code> e você vai ver "preto" repetido até enjoar. Metade de Sorocaba tem carro preto.</p><p>Pra isso existe o <b>DISTINCT</b> ("distinto", diferente). Ele tira as repetições e vem logo depois do SELECT:</p><p><code>SELECT DISTINCT coluna FROM tabela;</code></p>'},
 {type:'blocks',pool:['FROM','cor',';','SELECT','veiculos','DISTINCT'],answer:['SELECT','DISTINCT','cor','FROM','veiculos',';'],text:'<p>Monta pra mim a consulta que mostra <b>as cores, sem repetir</b>. Clica nas peças na ordem certa. Errou, clica na peça lá em cima que ela volta.</p>',
  wrong:['A ordem não bateu. Lembra do esqueleto: <b>SELECT</b>, depois o que mostrar (<b>DISTINCT cor</b>), depois <b>FROM</b> e a gaveta. O <b>;</b> fecha. Clica nas peças lá em cima pra devolver.','Recruta, SELECT vem primeiro, sempre. A ordem é <b>SELECT DISTINCT cor FROM veiculos ;</b>. Devolve as peças e monta assim.'],
  ok:function(R){return R.cols.length===1&&R.n===F.cores.length&&hasAll(R,F.cores)},
  after:'<p>São <b>{cores} cores diferentes</b> no cadastro. Anota esse número, que ele vai pro meu relatório.</p>'},
 {type:'msg',text:'<p>Mais duas e eu te largo.</p><p><b>AS</b> ("como") dá apelido pra coluna no resultado. <code>modelo AS Veiculo</code> mostra a coluna modelo com o título Veiculo. No banco nada muda, é só maquiagem.</p><p><b>LIMIT</b> ("limite") corta o resultado. <code>LIMIT 5</code> traz só as 5 primeiras linhas. Vai sempre no finalzinho da consulta.</p>'},
 {type:'mold',template:'SELECT placa, modelo AS ___ FROM veiculos;',text:'<p>Agora quem digita é você. Clica no editor, apaga o <code>___</code> e escreve <code>Veiculo</code> no lugar. Depois executa.</p>',spot:'#sqlEd',
  ok:function(R){return R.cols.indexOf('veiculo')>=0&&R.n===F.nVeic},
  miss:function(R,k){return R.cols.indexOf('___')>=0?esc(k,['O resultado ainda tem uma coluna chamada ___. Apaga os três tracinhos e escreve Veiculo no lugar deles.','Os tracinhos continuam lá, recruta. Clica do lado deles, apaga com o Backspace e digita Veiculo.']):'Rodou, mas o modelo não ganhou o apelido Veiculo. Olha o que vem depois do AS.'},
  after:'<p>Olha o título da segunda coluna: agora é <b>Veiculo</b>. Maquiagem feita.</p>'},
 {type:'mold',template:'SELECT placa, modelo AS Veiculo FROM veiculos ___;',text:'<p>Agora troca o <code>___</code> por <code>LIMIT 5</code>. Eu quero ver cinco carros, não o pátio inteiro.</p>',spot:'#sqlEd',
  ok:function(R){return R.n===5&&R.cols.indexOf('veiculo')>=0},
  miss:function(R,k){return R.n>5?esc(k,['Veio o pátio inteiro de novo. Troca o ___ por LIMIT 5.','Recruta, cadê o LIMIT? O ___ ainda tá lá no fim. Apaga e escreve LIMIT 5.']):'Rodou, mas não deu 5 linhas com a coluna Veiculo. Confere a consulta.'},
  after:'<p>Cinco. Nem um a mais. Gosto assim.</p>'},
 {type:'free',text:'<p>Acabou a moleza. Apaguei o editor.</p><p>Escreve do zero uma consulta que mostre só as colunas <code>modelo</code> e <code>cor</code> dos <b>3 primeiros</b> veículos. Eu tô olhando.</p>',spot:'#sqlEd',
  hints:['Tá bom, tá bom. O esqueleto é: <code>SELECT</code> colunas <code>FROM</code> tabela <code>LIMIT</code> número <code>;</code>','Vou te dar de mão beijada, mas só dessa vez: <code>SELECT modelo, cor FROM veiculos LIMIT 3;</code>'],
  hintBtns:['Pedir ajuda pra Célia','Ainda travado? Implorar a resposta'],
  ok:function(R){return R.cols.length===2&&R.cols.indexOf('modelo')>=0&&R.cols.indexOf('cor')>=0&&R.n===3},
  miss:function(R,k){var c=R.cols.length===2&&R.cols.indexOf('modelo')>=0&&R.cols.indexOf('cor')>=0;
    if(c)return esc(k,['As colunas tão certas. Falta o freio: limitar a 3 linhas.','Colunas certas, e o pátio inteiro de novo. Cadê o LIMIT 3 no fim?']);
    if(R.n===3)return 'Três linhas, beleza. Mas eu pedi só modelo e cor. Confere as colunas depois do SELECT.';
    return esc(k,['Rodou, mas não é isso. Confere as colunas e o LIMIT.','Ainda não. Se travou, clica em Explique esta consulta e lê o que você escreveu em português.'])},
  after:'<p>Hm. Funcionou.</p><p>Não vou fazer festa, mas também não vou reclamar. Você escreveu sua primeira consulta sozinho.</p>'},
 {type:'final',btn:'Abrir SISP Ocorrências',text:'<p>Você aprendeu o Módulo 1 inteiro: <code>SELECT</code>, <code>FROM</code>, <code>*</code>, <code>DISTINCT</code>, <code>AS</code> e <code>LIMIT</code>. Não fez mais que a obrigação, mas fez.</p><p>Agora o relatório. Liberei o <b>SISP Ocorrências</b> e o <b>PolíciaZap</b> na sua área de trabalho. Me diz lá quantas cores diferentes tem no cadastro. E sem chutar.</p>'}
];
