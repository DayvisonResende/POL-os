/* Fatos calculados do banco. As validações usam F, nunca números fixos. */
var F={};
function computeFacts(db){
  F._db=db;F._cache={};
  var col=function(q){var r=db.exec(q);return r.length?r[0].values.map(function(x){return x[0]}):[]};
  F.nVeic=col('SELECT COUNT(*) FROM veiculos')[0];
  F.placas=col('SELECT placa FROM veiculos');
  F.cores=col('SELECT DISTINCT cor FROM veiculos');
  F.prata=col("SELECT placa FROM veiculos WHERE cor='prata'");
  F.ftr=col("SELECT placa FROM veiculos WHERE placa LIKE 'FTR%'");
  F.nPessoas=col('SELECT COUNT(*) FROM pessoas')[0];
  F.anos=col('SELECT DISTINCT ano FROM veiculos');
  F.branco20=col("SELECT placa FROM veiculos WHERE cor='branco' AND ano>=2020");
  F.nAguirre=col("SELECT COUNT(*) FROM leituras_radar WHERE local_radar='Av. Dom Aguirre'")[0];
  F.ituSalto=col("SELECT nome FROM pessoas WHERE cidade IN ('Itu','Salto')");
  // Linhas esperadas de cada tarefa dos BOs (objetos coluna→valor). Usadas pelo "quase" das tarefas.
  var rows=function(q){var r=db.exec(q);if(!r.length)return [];var cs=r[0].columns.map(function(c){return c.toLowerCase()});return r[0].values.map(function(v){var o={};cs.forEach(function(c,i){o[c]=v[i]});return o})};
  F.l1002prata=rows("SELECT * FROM veiculos WHERE cor='prata'");
  F.l1002ftr=rows("SELECT * FROM veiculos WHERE placa LIKE 'FTR%'");
  F.l1002alvo=rows("SELECT * FROM veiculos WHERE cor='prata' AND placa LIKE 'FTR%'");
  F.l1003radar=rows("SELECT * FROM leituras_radar WHERE local_radar LIKE '%Km 18%' AND data_hora BETWEEN '2026-10-12 22:45:00' AND '2026-10-12 23:15:00' AND velocidade_kmh>120");
  F.l1003veic=rows("SELECT * FROM veiculos WHERE placa IN ('KZX9B21','JKL4A12','RTA8K02')");
  F.l1003dono=rows("SELECT * FROM pessoas WHERE cpf='318.442.907-15'");
  return F;
}

// Linhas que uma consulta de referência devolve (objetos coluna→valor), calculadas uma vez e guardadas.
// Usado pelos passos de treinamento: bate(R, "SELECT * FROM … WHERE …") = o jogador trouxe exatamente essas linhas.
function linhasDe(q){
  if(!F._cache[q]){var r=F._db.exec(q);var cs=r.length?r[0].columns.map(function(c){return c.toLowerCase()}):[];
    F._cache[q]=r.length?r[0].values.map(function(v){var o={};cs.forEach(function(c,i){o[c]=v[i]});return o}):[]}
  return F._cache[q];
}
function bate(R,q){return mesmasLinhas(R,linhasDe(q))}
