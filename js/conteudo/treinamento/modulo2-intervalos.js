/* Treinamento "Intervalos", antes do BO 1003 (Módulo 2): comparações, BETWEEN (números e data/hora), ORDER BY, IN.
   Mais curto que o "Filtros": começa no degrau de prever.
   Regra: nenhum exemplo usa os dados que resolvem o BO 1003 (Km 18, 22:45–23:15, KZX9B21) nem as respostas
   da prova do Módulo 2 (Itu/Salto, Av. Dom Aguirre, 2018–2020). Passos mold/free têm `solucao` (usada nos testes). */
registrarTreino({id:'m2-intervalos',titulo:'Intervalos',
 passos:[
 {tema:'Comparações e BETWEEN',type:'msg',btn:'Manda',
  text:"<p>Assalto na Castelo é coisa séria, e pra ele você precisa de ferramenta nova. Dez minutos comigo e eu te solto.</p><p>Primeira: comparação. Além do <code>=</code>, tem <code>&gt;</code> (maior que), <code>&lt;</code> (menor que), <code>&gt;=</code> e <code>&lt;=</code>. E pra intervalo tem o <b>BETWEEN</b> (\"entre\"):</p>",
  extra:"<div class=\"anat\"><div><code>ano &gt; 2020</code><span>depois de 2020</span></div><div><code>ano &gt;= 2020</code><span>2020 ou depois</span></div><div><code>ano BETWEEN 2021 AND 2023</code><span>de 2021 a 2023</span></div></div>",
  text2:"<p>Número vai <b>sem</b> aspas. Aspas são só pra texto.</p>"},

 {tema:'BETWEEN inclui as pontas',type:'predict',sql:"SELECT placa, modelo, ano FROM veiculos WHERE ano BETWEEN 2021 AND 2023;",
  text:"<p>Essa aqui pega os carros de 2021 a 2023. Antes de executar, me responde:</p>",q:'Os carros de 2023 aparecem no resultado?',
  opts:[{t:'Sim, o BETWEEN inclui as duas pontas',ok:true,fb:'Isso: 2021, 2022 e 2023 entram. Executa e confere.'},
        {t:'Não, ele para em 2022',fb:'Para não. BETWEEN é inclusivo: as duas pontas entram. Tenta de novo.'},
        {t:'Só se a consulta tiver ORDER BY',fb:'ORDER BY só muda a ordem, não quais linhas aparecem. Pensa de novo.'}],
  ok:function(R){return bate(R,"SELECT * FROM veiculos WHERE ano BETWEEN 2021 AND 2023")},
  after:"<p>As duas pontas entram. Guarda isso.</p>"},

 {tema:'ORDER BY … DESC',type:'slot',template:"SELECT placa, velocidade_kmh FROM leituras_radar WHERE local_radar = 'Av. São Paulo' ORDER BY velocidade_kmh ___;",
  text:"<p>Segunda: o <b>ORDER BY</b> ordena o resultado. Vai no <b>fim</b> da consulta, depois do WHERE.</p><p>Quero as passagens da Av. São Paulo com a <b>mais rápida no topo</b>. Escolhe a peça.</p>",
  chips:[{t:'ASC',bad:"ASC é do menor pro maior: a mais <b>lenta</b> ficaria no topo. Eu pedi a mais rápida."},
         {t:'DESC',certo:true},
         {t:'MAIOR',bad:"Não existe MAIOR em SQL. A ordem é <b>ASC</b> (crescente) ou <b>DESC</b> (decrescente)."}],
  ok:function(R){return bate(R,"SELECT * FROM leituras_radar WHERE local_radar = 'Av. São Paulo'")&&ordenado(R,'velocidade_kmh',true)},
  after:"<p>DESC, do maior pro menor. Sem nada, o padrão é ASC. Em radar, a mais rápida no topo já te mostra quem passou voando.</p>"},

 {tema:'IN: lista de valores',type:'msg',
  text:"<p>Terceira: o <b>IN</b> (\"em\"), pra quando o valor pode ser um de vários. Em vez de repetir OR:</p><p><code>WHERE modelo = 'Gol' OR modelo = 'Strada'</code></p><p>você escreve:</p><p><code>WHERE modelo IN ('Gol', 'Strada')</code></p>",
  text2:"<p>A lista vai entre parênteses, cada texto com as suas aspas, separados por vírgula.</p>"},

 {tema:'Escrever uma lista com IN',type:'mold',template:"SELECT nome, cidade FROM pessoas WHERE cidade IN (___);",solucao:"SELECT nome, cidade FROM pessoas WHERE cidade IN ('Piedade', 'Votorantim');",spot:'#sqlEd',
  text:"<p>Quero as pessoas de <b>Piedade</b> ou de <b>Votorantim</b>, numa condição só. Clica nos tracinhos e escreve a lista.</p>",
  ok:function(R){return bate(R,"SELECT * FROM pessoas WHERE cidade IN ('Piedade','Votorantim')")},
  miss:function(R,k){if(!R.n)return esc(k,["Voltou vazio. Cada cidade com as aspas dela, separadas por vírgula: <code>'Cidade1', 'Cidade2'</code>.","Confere letra por letra: <code>IN ('Piedade', 'Votorantim')</code>, com as maiúsculas e as aspas."]);
    return 'Veio gente de outra cidade, ou faltou uma das duas. A lista tem que ter exatamente Piedade e Votorantim.'},
  after:"<p>Duas cidades numa condição só. No BO você vai usar o IN pra conferir uma lista de placas suspeitas de uma vez.</p>"},

 {tema:'BETWEEN com data e hora',type:'predict',sql:"SELECT placa, data_hora FROM leituras_radar\nWHERE local_radar = 'Av. São Paulo'\n  AND data_hora BETWEEN '2026-10-13 04:00:00' AND '2026-10-13 06:00:00';",
  text:"<p>Agora o pulo do gato: intervalo de <b>horário</b>. A coluna <code>data_hora</code> guarda data <b>e</b> hora juntas, assim: <code>2026-10-12 20:31:48</code>.</p><p>Então cada ponta do BETWEEN é uma data e hora <b>completa</b>, entre aspas, e as duas pontas são ligadas pelo <b>AND</b>. Olha a consulta no editor.</p>",
  q:'O que essa consulta vai mostrar?',
  opts:[{t:'As passagens na Av. São Paulo entre 4h e 6h da manhã do dia 13/10',ok:true,fb:'Isso. Do primeiro valor até o segundo, com as pontas incluídas. Executa pra conferir.'},
        {t:'Só as passagens às 4h em ponto e às 6h em ponto',fb:'Não. BETWEEN é tudo que está entre as duas pontas, não só as pontas. Pensa de novo.'},
        {t:'Todas as passagens do dia 13/10',fb:'Não: a hora também conta. Repara que cada ponta tem data e hora. Tenta de novo.'}],
  ok:function(R){return bate(R,"SELECT * FROM leituras_radar WHERE local_radar = 'Av. São Paulo' AND data_hora BETWEEN '2026-10-13 04:00:00' AND '2026-10-13 06:00:00'")},
  after:"<p>Repara no formato de cada ponta: <code>'2026-10-13 04:00:00'</code>. Ano-mês-dia, espaço, hora:minuto:segundo, tudo dentro das aspas. E entre as duas pontas, o <b>AND</b>.</p>"},

 {tema:'Completar as horas do intervalo',type:'mold',template:"SELECT placa, data_hora FROM leituras_radar\nWHERE local_radar = 'Av. São Paulo'\n  AND data_hora BETWEEN '2026-10-12 ___' AND '2026-10-12 ___';",
  solucao:"SELECT placa, data_hora FROM leituras_radar WHERE local_radar = 'Av. São Paulo' AND data_hora BETWEEN '2026-10-12 18:00:00' AND '2026-10-12 20:00:00';",spot:'#sqlEd',
  text:"<p>Agora você. Quero as passagens na Av. São Paulo entre <b>18h e 20h do dia 12/10</b>.</p><p>A data eu já deixei escrita. Clica no primeiro <code>___</code> e digita a hora de início, com segundos (<code>18:00:00</code>). Depois clica no segundo e digita a hora do fim.</p>",
  ok:function(R){return bate(R,"SELECT * FROM leituras_radar WHERE local_radar = 'Av. São Paulo' AND data_hora BETWEEN '2026-10-12 18:00:00' AND '2026-10-12 20:00:00'")},
  miss:function(R,k){if(!R.n)return esc(k,["Voltou vazio. A hora precisa dos segundos: <code>18:00:00</code>, não <code>18:00</code>. E confere se não sobrou nenhum <code>___</code>.","Vazio de novo. Cada ponta tem que ficar assim, inteirinha: <code>'2026-10-12 18:00:00'</code> e <code>'2026-10-12 20:00:00'</code>."]);
    return 'Veio passagem fora do horário. Confere as duas horas: início 18:00:00, fim 20:00:00.'},
  after:"<p>Data inteira, hora inteira, com segundos. Escreveu só <code>'18:00'</code>, volta vazio e você nem sabe por quê. No BO você vai escrever as duas pontas sozinho, no mesmo formato.</p>"},

 {tema:'>= e ORDER BY do zero',type:'free',solucao:"SELECT placa, ano FROM veiculos WHERE ano >= 2022 ORDER BY ano DESC;",spot:'#sqlEd',
  text:"<p>Última, do zero: os veículos fabricados <b>de 2022 pra cá</b>, do <b>mais novo pro mais velho</b>. Mostra pelo menos a placa e o ano.</p>",
  hints:["Duas partes: um filtro com <code>&gt;=</code> no WHERE e um <code>ORDER BY</code> com DESC no fim.",
         "Tá, toma: <code>SELECT placa, ano FROM veiculos WHERE ano &gt;= 2022 ORDER BY ano DESC;</code>"],
  hintBtns:['Pedir ajuda pra Célia','Ainda travado? Implorar a resposta'],
  ok:function(R){return bate(R,"SELECT * FROM veiculos WHERE ano >= 2022")&&!falta(R,'placa')&&ordenado(R,'ano',true)},
  miss:function(R,k){
    if(bate(R,"SELECT * FROM veiculos WHERE ano >= 2022")){if(falta(R,'placa')||falta(R,'ano'))return 'Filtro certo. Mostra a placa e o ano.';return 'Filtro certo. Falta a ordem: do mais novo pro mais velho é <code>ORDER BY ano DESC</code>.'}
    if(bate(R,"SELECT * FROM veiculos WHERE ano > 2022"))return 'Faltou 2022. "De 2022 pra cá" inclui 2022: é <code>&gt;=</code>, não <code>&gt;</code>.';
    return esc(k,['Rodou, mas não é isso. Confere o filtro do ano.','Ainda não. Clica em Explique esta consulta e lê o que você escreveu.'])},
  after:"<p>Filtro e ordem na mesma consulta. Tá pronto pra Castelo.</p>"},

 {tema:'Resumo dos intervalos',type:'final',btn:'Abrir o BO 1003',
  text:"<p>Resumo: <code>&gt;</code> <code>&lt;</code> <code>&gt;=</code> <code>&lt;=</code> pra comparar; <b>BETWEEN</b> inclui as pontas; data e hora sempre <b>completas</b>; <b>ORDER BY … DESC</b> no fim pra pôr o maior no topo; <b>IN</b> pra lista.</p><p>No BO você vai precisar de tudo junto, e de um detalhe: o radar só sabe a placa. Modelo e dono estão em outras tabelas. Segue a pista de tabela em tabela.</p>"}
 ],
 anotacoes:{arquivo:'03_intervalos.txt',texto:[
  "ANOTAÇÕES DA CÉLIA — INTERVALOS",
  "",
  "COMPARAÇÃO (número vai SEM aspas)",
  "  =   igual            !=  diferente",
  "  >   maior que        <   menor que",
  "  >=  maior ou igual   <=  menor ou igual",
  "",
  "BETWEEN = intervalo. INCLUI as duas pontas.",
  "  WHERE ano BETWEEN 2021 AND 2023        2021, 2022 e 2023",
  "",
  "DATA E HORA (coluna data_hora)",
  "  formato: 'AAAA-MM-DD HH:MM:SS'          ex.: '2026-10-12 20:31:48'",
  "  cada ponta COMPLETA, com segundos, entre aspas, e AND no meio:",
  "  WHERE data_hora BETWEEN '2026-10-12 18:00:00' AND '2026-10-12 20:00:00'",
  "  Escreveu só '18:00'? Volta vazio.",
  "",
  "ORDER BY = ordem do resultado (vai no FIM, depois do WHERE)",
  "  ORDER BY velocidade_kmh DESC    maior primeiro",
  "  ORDER BY ano ASC                menor primeiro (é o padrão, se não escrever nada)",
  "",
  "IN = um entre vários valores",
  "  WHERE modelo IN ('Gol', 'Strada')",
  "  lista entre parênteses, cada texto com as suas aspas, separados por vírgula",
  "",
  "UMA TABELA NÃO SABE TUDO",
  "  O radar só tem a placa. Modelo e cor ficam em veiculos. O dono fica em pessoas.",
  "  veiculos.cpf_proprietario aponta pra pessoas.cpf: segue a pista de tabela em tabela."
 ].join('\n')},
 aoConcluir:function(){
  S.caseSel=indiceCaso('1003');save();openOcorr();renderOcorr();
  say('celia','Treino feito. A escuta do BO 1003 tá em Arquivos › Evidências. E repito: mandado só com placa e nome conferidos.');
 }
});
