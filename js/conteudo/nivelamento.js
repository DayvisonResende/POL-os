/* Nivelamento "Já sei SQL" (ideia do playtest da Mayumi, profissional de BI): quem já sabe pode dispensar os
   treinamentos dos Módulos 2, 3 e 4. Oferecido no fim do treinamento do Módulo 1 (que todos fazem: é ele que
   apresenta a tela). Por módulo: acertou tudo, os treinamentos dele ficam dispensados; errou, para ali.
   Regras das questões: só tabelas liberadas no começo do jogo (veiculos, pessoas, leituras_radar, catraca_acessos);
   nada que repita prova ou BO; correção pelo resultado. App: js/apps/nivelamento.js. */
var NIVELAMENTO=[
 {modulo:2,titulo:L('Módulo 2 · Filtros, intervalos e ordem'),treinos:['m2-filtros','m2-intervalos'],questoes:[
  {id:'n2a',q:L('Mostre a <b>placa</b> e o <b>ano</b> dos carros <b>azuis</b> fabricados de <b>2015 em diante</b>, do mais novo para o mais velho.'),
   check:function(R){return bate(R,"SELECT placa, ano FROM veiculos WHERE cor = 'azul' AND ano >= 2015")&&ordenado(R,'ano',true)},
   model:"SELECT placa, ano FROM veiculos WHERE cor = 'azul' AND ano >= 2015 ORDER BY ano DESC;"},
  {id:'n2b',q:L('Liste o <b>nome</b> das pessoas cujo nome <b>começa com "Ro"</b> e que moram em <b>Sorocaba</b> ou em <b>Votorantim</b>.'),
   check:function(R){return bate(R,"SELECT nome FROM pessoas WHERE nome LIKE 'Ro%' AND cidade IN ('Sorocaba', 'Votorantim')")},
   model:"SELECT nome FROM pessoas WHERE nome LIKE 'Ro%' AND cidade IN ('Sorocaba', 'Votorantim');"},
  {id:'n2c',q:L('Mostre as passagens pelo radar da <b>Av. São Paulo</b> entre <b>22:00 e 23:59</b> do dia <b>12/10/2026</b>, acima de <b>40 km/h</b>.'),
   check:function(R){return bate(R,"SELECT * FROM leituras_radar WHERE local_radar = 'Av. São Paulo' AND data_hora BETWEEN '2026-10-12 22:00:00' AND '2026-10-12 23:59:59' AND velocidade_kmh > 40")},
   model:"SELECT * FROM leituras_radar WHERE local_radar = 'Av. São Paulo' AND data_hora BETWEEN '2026-10-12 22:00:00' AND '2026-10-12 23:59:59' AND velocidade_kmh > 40;"}]},
 {modulo:3,titulo:L('Módulo 3 · Contar, somar, agrupar e o vazio'),treinos:['m3-agregacao','m3-nulos'],questoes:[
  {id:'n3a',q:L('Quantos veículos há de <b>cada modelo</b>? Mostre só os modelos com <b>3 ou mais</b> veículos.'),
   check:function(R){return bateGrupos(R,linhasDe('SELECT modelo, COUNT(*) AS n FROM veiculos GROUP BY modelo HAVING COUNT(*) >= 3'),'modelo','n')},
   model:'SELECT modelo, COUNT(*) FROM veiculos GROUP BY modelo HAVING COUNT(*) >= 3;'},
  {id:'n3b',q:L('Mostre a <b>maior</b> e a <b>menor</b> velocidade registradas em <b>cada radar</b>.'),
   check:function(R){var l=linhasDe('SELECT local_radar, MAX(velocidade_kmh) AS mx, MIN(velocidade_kmh) AS mn FROM leituras_radar GROUP BY local_radar');return bateGrupos(R,l,'local_radar','mx')&&bateGrupos(R,l,'local_radar','mn')},
   model:'SELECT local_radar, MAX(velocidade_kmh), MIN(velocidade_kmh) FROM leituras_radar GROUP BY local_radar;'},
  {id:'n3c',q:L('Numa tabela de transferências, qual consulta conta as que estão <b>sem descrição</b>?'),
   opts:['SELECT COUNT(*) FROM transferencias WHERE descricao IS NULL;','SELECT COUNT(*) FROM transferencias WHERE descricao = NULL;','SELECT COUNT(descricao) FROM transferencias;'],ok:0}]},
 {modulo:4,titulo:L('Módulo 4 · Cruzar tabelas'),treinos:['m4-join','m4-left'],questoes:[
  {id:'n4a',q:L('Mostre a <b>data e hora</b> de cada passagem pelo radar da <b>Av. São Paulo</b>, com o <b>nome do dono</b> do carro.'),
   check:function(R){var l=linhasDe("SELECT r.data_hora, p.nome FROM leituras_radar r JOIN veiculos v ON v.placa = r.placa JOIN pessoas p ON p.cpf = v.cpf_proprietario WHERE r.local_radar = 'Av. São Paulo'");return R.n===l.length&&hasAll(R,l.map(function(x){return x.data_hora}))&&hasAll(R,l.map(function(x){return x.nome}))},
   model:"SELECT r.data_hora, p.nome FROM leituras_radar r JOIN veiculos v ON v.placa = r.placa JOIN pessoas p ON p.cpf = v.cpf_proprietario WHERE r.local_radar = 'Av. São Paulo';"},
  {id:'n4b',q:L('Liste o <b>nome</b> das pessoas de <b>Votorantim</b> que <b>não têm nenhum carro</b>.'),
   check:function(R){var l=linhasDe("SELECT p.nome FROM pessoas p LEFT JOIN veiculos v ON v.cpf_proprietario = p.cpf WHERE v.placa IS NULL AND p.cidade = 'Votorantim'");return R.n===l.length&&hasAll(R,l.map(function(x){return x.nome}))},
   model:"SELECT p.nome FROM pessoas p LEFT JOIN veiculos v ON v.cpf_proprietario = p.cpf WHERE v.placa IS NULL AND p.cidade = 'Votorantim';"},
  {id:'n4c',q:L('Uma nota fiscal de R$ 1.000 tem 5 itens. Quanto dá <code>SUM(n.valor_total)</code> depois do JOIN da nota com os itens?'),
   opts:[L('R$ 5.000, porque a nota se repete uma vez por item'),L('R$ 1.000'),L('Depende do preço de cada item')],ok:0}]}
];
