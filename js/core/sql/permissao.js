/* Checagem de somente leitura. No Módulo 5 deve passar a depender da patente. */
function isReadOnly(sql){
  return stripSql(sql).split(';').map(function(s){return s.trim()}).filter(Boolean).every(function(s){var w=(s.match(/^[a-z]+/i)||[''])[0].toUpperCase();return ['SELECT','WITH','EXPLAIN','VALUES','PRAGMA'].indexOf(w)>=0&&!/\b(insert|update|delete|drop|alter|create|replace|attach)\b/i.test(s)});
}
