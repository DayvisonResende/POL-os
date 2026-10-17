/* ---------- report / game over ---------- */
function report(){
  tele('relatorio');
  var ov=h('div',{class:'overlay'});
  var rows=CASES.map(function(c,i){return '<tr><td>'+L('BO 2026/{id}: {titulo}',{id:c.id,titulo:escH(c.titulo)})+'</td><td>'+(caseDone(i)?L('encerrado'):caseUnlocked(i)?L('em análise'):L('pendente'))+'</td></tr>'}).join('');
  ov.innerHTML='<div class="report"><header><h2>'+L('Relatório de Produtividade')+'</h2><p>'+L('recruta.dti04 · {patente} · terça-feira, 13/10/2026',{patente:escH(rankT())})+'</p></header><div class="rb"><table>'+rows+
   '<tr><td>'+L('Consultas executadas')+'</td><td>'+S.queries+'</td></tr><tr><td>'+L('Consultas com erro')+'</td><td>'+S.errors+'</td></tr><tr><td>'+L('Metas')+'</td><td>'+S.metas+'%</td></tr><tr><td>'+L('Corregedoria')+'</td><td>'+S.corr+'%</td></tr></table>'+
   '<p>'+(S.done?L('Promovido a Investigador Júnior. Você concluiu os Módulos 1 e 2: SELECT, colunas, DISTINCT, LIMIT, AS, WHERE, AND, LIKE, BETWEEN, IN e ORDER BY. O Módulo 3 (COUNT, SUM, GROUP BY, HAVING) ainda está em desenvolvimento.'):L('Ainda há chamados em aberto. Feche o relatório e volte ao trabalho.'))+'</p>'+
   '<div style="display:flex;gap:8px;flex-wrap:wrap"><button class="btn-primary" id="rpClose">'+L('Voltar ao desktop')+'</button><button class="tb-btn" id="rpReset">'+L('Recomeçar do zero')+'</button></div></div></div>';
  $('#app').appendChild(ov);$('#rpClose',ov).onclick=function(){ov.remove()};$('#rpReset',ov).onclick=function(){ov.remove();pedirReinicio()};
}
function fired(){
  tele('demitido');
  var ov=h('div',{class:'overlay fired'});
  ov.innerHTML='<div class="report"><header><h2>'+L('ACESSO SUSPENSO')+'</h2><p>'+L('Corregedoria Geral · Procedimento administrativo')+'</p></header><div class="rb"><p>'+L('A auditoria interna atingiu 100%. Seu login foi bloqueado e o caso foi encaminhado à Corregedoria. Mandados indeferidos, informações erradas e favores fora do protocolo pesam no seu prontuário.')+'</p><div><button class="btn-primary" id="frReset">'+L('Recomeçar o turno')+'</button></div></div></div>';
  $('#app').appendChild(ov);$('#frReset',ov).onclick=resetAll;
}
