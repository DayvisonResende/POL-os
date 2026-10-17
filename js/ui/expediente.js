/* Dias de expediente (conteúdo em js/conteudo/dias.js): fim do dia pelo Relatório do turno, transição,
   login no dia seguinte e e-mail da manhã antes de qualquer outra coisa. */
function diaAtual(){return DIAS[S.dia]||DIAS[DIAS.length-1]}
function diaConcluido(){return S.diaConcluido>=S.dia}
function temProximoDia(){return !!DIAS[S.dia+1]}
function concluirDia(){S.diaConcluido=S.dia;if(S.dia===0)S.done=true;save();tele('fim_do_dia',{dia:S.dia})}
// Encerrar o expediente: transição curta e recarrega no dia seguinte (o progresso está salvo).
function encerrarExpediente(){
  var prox=DIAS[S.dia+1];if(!prox)return;
  S.dia++;S.clock=480;S.metas=0;save();tele('novo_dia',{dia:S.dia});
  var ov=h('div',{class:'overlay dia-transicao'});
  ov.innerHTML='<div class="dia-card"><div class="eyebrow">'+L('Fim do expediente')+'</div><h2>'+escH(prox.nome)+'</h2><p>08:00</p>'+(prox.chegada?'<q>'+prox.chegada+'</q>':'')+'<button class="btn-primary" id="diaOk">'+L('Bater o ponto')+'</button></div>';
  $('#app').appendChild(ov);$('#diaOk').focus();
  $('#diaOk').onclick=function(){location.reload()};
}
// Primeiro login de um dia novo: o e-mail da manhã abre antes de tudo; o resto do dia começa ao fechá-lo.
function diaNovoPendente(){return S.dia>0&&S.diaIniciado!==S.dia}
function abrirEmailDoDia(depois){
  var d=diaAtual(),feito=false,seguir=function(){if(feito)return;feito=true;S.diaIniciado=S.dia;save();if(depois)depois()};
  if(!d.email){seguir();return}
  tele('email',{dia:S.dia});
  openWin('email',{title:L('Correio interno'),w:620,h:520,x:140,y:20,onClose:seguir,build:function(r){
    r.body.innerHTML='<div class="email"><div class="em-cab"><div><span>'+L('De')+'</span>'+escH(d.email.de)+'</div><div><span>'+L('Para')+'</span>recruta.dti04 · '+escH(rankT())+'</div><div><span>'+L('Assunto')+'</span><b>'+escH(d.email.assunto)+'</b></div></div><div class="em-corpo">'+d.email.corpo+'</div><div class="em-acao"><button class="btn-primary" id="emOk">'+L('Começar o expediente')+'</button></div></div>';
    $('#emOk',r.body).onclick=function(){r.el.remove();delete WINS.email;renderTasks();seguir()};
  }});
}
