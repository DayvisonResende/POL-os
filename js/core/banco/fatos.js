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
  // Módulo 3 (Operação Véio, Ato II). Tudo calculado do banco: textos e validações nunca têm números fixos.
  var um=function(q){var r=db.exec(q);return r.length?r[0].values[0][0]:null};
  F.contaDenise=um("SELECT c.id FROM contas_bancarias c, pessoas p WHERE p.cpf=c.cpf_titular AND p.nome='Denise Albuquerque Prado' AND c.numero='48211-6'");
  F.cpfDenise=um("SELECT cpf FROM pessoas WHERE nome='Denise Albuquerque Prado'");
  var D13="data_hora BETWEEN '2026-10-13 00:00:00' AND '2026-10-13 23:59:59'",FAIXA='valor BETWEEN 9000 AND 9999.99';
  F.Q13=D13;F.QFAIXA=FAIXA;
  F.soma13=um('SELECT SUM(valor) FROM transferencias WHERE '+D13);
  F.nFaixa13=um('SELECT COUNT(*) FROM transferencias WHERE '+D13+' AND '+FAIXA);
  F.gruposFaixa13=rows('SELECT conta_destino, COUNT(*) AS n FROM transferencias WHERE '+D13+' AND '+FAIXA+' GROUP BY conta_destino');
  F.nParaDenise=um('SELECT COUNT(*) FROM transferencias WHERE conta_destino='+F.contaDenise);
  F.contasLaranja=col('SELECT DISTINCT conta_origem FROM transferencias WHERE conta_destino='+F.contaDenise+' ORDER BY 1');
  F.cpfsLaranja=col('SELECT cpf_titular FROM contas_bancarias WHERE id IN ('+F.contasLaranja.join(',')+')');
  F.laranjas=col("SELECT nome FROM pessoas WHERE cpf IN ('"+F.cpfsLaranja.join("','")+"')");
  F.aberturaLaranjas=[um('SELECT MIN(aberta_em) FROM contas_bancarias WHERE id IN ('+F.contasLaranja.join(',')+')'),um('SELECT MAX(aberta_em) FROM contas_bancarias WHERE id IN ('+F.contasLaranja.join(',')+')')];
  F.nTransf=um('SELECT COUNT(*) FROM transferencias');
  F.nSemOrigem=um('SELECT COUNT(*) FROM transferencias WHERE conta_origem IS NULL');
  F.somaEspecie=um('SELECT SUM(valor) FROM transferencias WHERE conta_origem IS NULL');
  F.nComDescricao=um('SELECT COUNT(descricao) FROM transferencias');
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
// Primeiro valor de uma consulta de referência (ex.: valorDe('SELECT MAX(x) FROM t')).
function valorDe(q){var l=linhasDe(q);if(!l.length)return null;var o=l[0];return o[Object.keys(o)[0]]}

// {n} = total de veículos, {cores} = cores distintas, {chave} = F.chave (lista vira o tamanho dela)
function fill(t){return String(t).replace(/\{(\w+)\}/g,function(m,k){var v=k==='n'?F.nVeic:k==='cores'?F.cores.length:F[k];return v==null?m:Array.isArray(v)?v.length:v})}
