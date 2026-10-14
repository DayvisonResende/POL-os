/* Fatos calculados do banco. As validações usam F, nunca números fixos. */
var F={};
function computeFacts(db){
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
  return F;
}
