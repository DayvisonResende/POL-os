/* Banco SQLite em memória (sql.js) e o esquema lido dele para o Dicionário de Dados e a tradução de erros.
   Algumas tabelas só ficam visíveis a partir de uma patente (rankMin): a recompensa da promoção é acesso no sistema. */
var SQL=null, db=null, SCHEMA={tables:[],cols:[],info:{}};
var TABELAS=[
 {nome:'veiculos'},{nome:'pessoas'},{nome:'leituras_radar'},{nome:'catraca_acessos'},
 {nome:'contas_bancarias',rankMin:3,patente:'Inspetor Analítico'},
 {nome:'transferencias',rankMin:3,patente:'Inspetor Analítico'}
];
function tabelaLiberada(t){return S.rank>=(t.rankMin||0)}
function iniciarBanco(lib){
  SQL=lib;db=new SQL.Database();db.run(buildSeedSQL());computeFacts(db);
  TABELAS.forEach(function(t){var info=db.exec('PRAGMA table_info('+t.nome+')')[0].values;var fks=(db.exec('PRAGMA foreign_key_list('+t.nome+')')[0]||{values:[]}).values.map(function(v){return v[3]});
    SCHEMA.info[t.nome]=info.map(function(c){return {name:c[1],type:c[2],pk:!!c[5],fk:fks.indexOf(c[1])>=0}})});
  atualizarSchema();
}
// O que o jogador enxerga (Dicionário, sugestões de nome nos erros) depende da patente.
function atualizarSchema(){
  SCHEMA.tables=TABELAS.filter(tabelaLiberada).map(function(t){return t.nome});
  var cols=[];SCHEMA.tables.forEach(function(t){SCHEMA.info[t].forEach(function(c){cols.push(c.name)})});
  SCHEMA.cols=Array.from(new Set(cols));
}
// Primeira tabela restrita citada na consulta (ou null).
function tabelaBloqueada(sql){
  var ws=(stripSql(sql).match(/[A-Za-z_]+/g)||[]).map(function(w){return w.toLowerCase()});
  return TABELAS.filter(function(t){return !tabelaLiberada(t)&&ws.indexOf(t.nome)>=0})[0]||null;
}
function msgTabelaBloqueada(t){return '<b>Acesso negado.</b> A tabela <code>'+escH(t.nome)+'</code> é restrita: seu perfil ('+escH(rankT())+') ainda não tem acesso. Ela é liberada para <b>'+escH(t.patente)+'</b>.'}
