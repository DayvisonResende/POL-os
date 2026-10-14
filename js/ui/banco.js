/* Banco SQLite em memória (sql.js) e o esquema lido dele para o Dicionário de Dados e a tradução de erros. */
var SQL=null, db=null, SCHEMA={tables:[],cols:[],info:{}};
var TABELAS=['veiculos','pessoas','leituras_radar','catraca_acessos'];
function iniciarBanco(lib){
  SQL=lib;db=new SQL.Database();db.run(buildSeedSQL());computeFacts(db);
  SCHEMA.tables=TABELAS.slice();SCHEMA.cols=[];
  SCHEMA.tables.forEach(function(t){var info=db.exec('PRAGMA table_info('+t+')')[0].values;var fks=(db.exec('PRAGMA foreign_key_list('+t+')')[0]||{values:[]}).values.map(function(v){return v[3]});
    SCHEMA.info[t]=info.map(function(c){SCHEMA.cols.push(c[1]);return {name:c[1],type:c[2],pk:!!c[5],fk:fks.indexOf(c[1])>=0}})});
  SCHEMA.cols=Array.from(new Set(SCHEMA.cols));
}
