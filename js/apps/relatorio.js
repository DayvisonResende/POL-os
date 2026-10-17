/* ---------- report / game over ---------- */
function report(){
  tele('relatorio');
  var ov=h('div',{class:'overlay'});
  var rows=CASES.map(function(c,i){return '<tr><td>'+L('BO 2026/{id}: {titulo}',{id:c.id,titulo:escH(c.titulo)})+'</td><td>'+(caseDone(i)?L('encerrado'):caseUnlocked(i)?L('em análise'):L('pendente'))+'</td></tr>'}).join('');
  ov.innerHTML='<div class="report"><header><h2>'+L('Relatório de Produtividade')+'</h2><p>'+L('recruta.dti04 · {patente} · {dia}',{patente:escH(rankT()),dia:escH(diaAtual().nome)})+'</p></header><div class="rb"><table>'+rows+
   '<tr><td>'+L('Consultas executadas')+'</td><td>'+S.queries+'</td></tr><tr><td>'+L('Consultas com erro')+'</td><td>'+S.errors+'</td></tr><tr><td>'+L('Metas')+'</td><td>'+S.metas+'%</td></tr><tr><td>'+L('Corregedoria')+'</td><td>'+S.corr+'%</td></tr></table>'+
   '<p>'+(diaConcluido()?diaAtual().resumo+(temProximoDia()?'':' '+(diaAtual().proximo||'')):L('Ainda há chamados em aberto. Feche o relatório e volte ao trabalho.'))+'</p>'+
   '<div style="display:flex;gap:8px;flex-wrap:wrap">'+(diaConcluido()&&temProximoDia()?'<button class="btn-primary" id="rpDia">'+L('Encerrar expediente')+'</button>':'')+'<button class="'+(diaConcluido()&&temProximoDia()?'tb-btn':'btn-primary')+'" id="rpClose">'+L('Voltar ao desktop')+'</button><button class="tb-btn" id="rpReset">'+L('Recomeçar do zero')+'</button></div></div></div>';
  $('#app').appendChild(ov);$('#rpClose',ov).onclick=function(){ov.remove()};if($('#rpDia',ov))$('#rpDia',ov).onclick=function(){ov.remove();encerrarExpediente()};$('#rpReset',ov).onclick=function(){ov.remove();pedirReinicio()};
}
function fired(){
  tele('demitido');
  var ov=h('div',{class:'overlay fired'});
  ov.innerHTML='<div class="report"><header><h2>'+L('ACESSO SUSPENSO')+'</h2><p>'+L('Corregedoria Geral · Procedimento administrativo')+'</p></header><div class="rb"><p>'+L('A auditoria interna atingiu 100%. Seu login foi bloqueado e o caso foi encaminhado à Corregedoria. Mandados indeferidos, informações erradas e favores fora do protocolo pesam no seu prontuário.')+'</p><div><button class="btn-primary" id="frReset">'+L('Recomeçar o turno')+'</button></div></div></div>';
  $('#app').appendChild(ov);$('#frReset',ov).onclick=resetAll;
}
