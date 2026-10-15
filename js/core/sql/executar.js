/* Executa uma ou mais consultas e devolve o resultado de CADA uma, inclusive as vazias.
   (O db.exec do sql.js omite as consultas sem linhas: com "A; B" e B vazia, o "último resultado" era o de A.) */
function executarSQL(db,sql){
  var out=[],it=db.iterateStatements(sql),st;
  while((st=it.next())&&!st.done){
    var stmt=st.value,r={sql:stmt.getSQL().trim(),columns:stmt.getColumnNames(),values:[]};
    try{while(stmt.step())r.values.push(stmt.get())}finally{stmt.free()}
    out.push(r);
  }
  return out;
}
