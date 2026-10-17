/* Pedidos dos colegas: tarefas opcionais pelo PolíciaZap, para praticar fora da história principal.
   Conteúdo em js/conteudo/pedidos.js (registrarPedido). Acerto dá Metas; erro não pune: é treino.
   Aparecem quando quando() fica verdadeiro (verificado ao entrar, ao fechar casos e ao ser promovido). */
function verificarPedidos(){
  apresentarServicos();
  PEDIDOS.forEach(function(p){
    if(S.pedidos[p.id]||!p.quando())return;
    S.pedidos[p.id]={estado:'aberto',tentativas:0};save();tele('pedido',{id:p.id,acao:'recebido'});
    setTimeout(function(){say(p.de,p.texto)},p.atraso||4000);
  });
}
function pedidoAberto(quem){return PEDIDOS.filter(function(p){return p.de===quem&&S.pedidos[p.id]&&S.pedidos[p.id].estado==='aberto'})[0]||null}
function responderPedido(p,v){
  var r=p.check(v),st=S.pedidos[p.id];st.tentativas++;
  tele('pedido',{id:p.id,acao:'resposta',ok:!!r.ok,tentativa:st.tentativas});
  if(r.ok){st.estado='feito';addMetas(p.metas||10)}
  save();setTimeout(function(){say(p.de,r.msg)},900);
}
