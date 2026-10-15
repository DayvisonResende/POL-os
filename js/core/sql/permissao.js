/* Checagem de somente leitura. No Módulo 5 deve passar a depender da patente.
   Bloqueia comando que o SQLite reconhece e que não é de leitura. Palavra desconhecida no início
   (ex.: SELEC, um erro de digitação) passa adiante: o SQLite recusa com erro de sintaxe e o jogador
   recebe a tradução ("você quis dizer SELECT?"), em vez de levar Corregedoria por tentativa de escrita. */
var SQL_LEITURA=['SELECT','WITH','EXPLAIN','VALUES','PRAGMA'];
var SQL_COMANDOS=SQL_LEITURA.concat(['INSERT','UPDATE','DELETE','REPLACE','CREATE','DROP','ALTER','ATTACH','DETACH','VACUUM','REINDEX','ANALYZE','BEGIN','COMMIT','END','ROLLBACK','SAVEPOINT','RELEASE']);
function isReadOnly(sql){
  return stripSql(sql).split(';').map(function(s){return s.trim()}).filter(Boolean).every(function(s){
    var w=(s.match(/^[a-z]+/i)||[''])[0].toUpperCase();
    if(SQL_COMANDOS.indexOf(w)>=0&&SQL_LEITURA.indexOf(w)<0)return false;
    if(w==='PRAGMA'&&/=/.test(s))return false;
    return !/\b(insert|update|delete|drop|alter|create|replace|attach)\b/i.test(s)});
}
