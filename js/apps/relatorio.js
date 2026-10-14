/* ---------- report / game over ---------- */
function report(){
  var ov=h('div',{class:'overlay'});
  var rows=CASES.map(function(c,i){return '<tr><td>BO 2026/'+c.id+' · '+escH(c.titulo)+'</td><td>'+(caseDone(i)?'encerrado':caseUnlocked(i)?'em análise':'pendente')+'</td></tr>'}).join('');
  ov.innerHTML='<div class="report"><header><h2>Relatório de Produtividade</h2><p>recruta.dti04 · '+escH(rankT())+' · terça-feira, 13/10/2026</p></header><div class="rb"><table>'+rows+
   '<tr><td>Consultas executadas</td><td>'+S.queries+'</td></tr><tr><td>Consultas com erro</td><td>'+S.errors+'</td></tr><tr><td>Metas</td><td>'+S.metas+'%</td></tr><tr><td>Corregedoria</td><td>'+S.corr+'%</td></tr></table>'+
   '<p>'+(S.done?'Promovido a Investigador Júnior. Você concluiu os Módulos 1 e 2: SELECT, colunas, DISTINCT, LIMIT, AS, WHERE, AND, LIKE, BETWEEN, IN e ORDER BY. O Módulo 3 (COUNT, SUM, GROUP BY, HAVING) ainda está em desenvolvimento.':'Ainda há chamados em aberto. Feche o relatório e volte ao trabalho.')+'</p>'+
   '<div style="display:flex;gap:8px;flex-wrap:wrap"><button class="btn-primary" id="rpClose">Voltar ao desktop</button><button class="tb-btn" id="rpReset">Recomeçar do zero</button></div></div></div>';
  $('#app').appendChild(ov);$('#rpClose',ov).onclick=function(){ov.remove()};$('#rpReset',ov).onclick=resetAll;
}
function fired(){
  var ov=h('div',{class:'overlay fired'});
  ov.innerHTML='<div class="report"><header><h2>ACESSO SUSPENSO</h2><p>Corregedoria Geral · Procedimento administrativo</p></header><div class="rb"><p>A auditoria interna atingiu 100%. Seu login foi bloqueado e o caso foi encaminhado à Corregedoria. Mandados indeferidos, informações erradas e favores fora do protocolo pesam no seu prontuário.</p><div><button class="btn-primary" id="frReset">Recomeçar o turno</button></div></div></div>';
  $('#app').appendChild(ov);$('#frReset',ov).onclick=resetAll;
}
