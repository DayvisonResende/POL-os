/* ---------- PolíciaZap (chat) ---------- */
var chatSel='celia';
function say(who,text,me){
  S.chat[who].push({me:!!me,sys:me==='sys',text:text});
  if(!me){var open=WINS.zap&&!WINS.zap.el.classList.contains('min')&&chatSel===who;
    if(!open){S.unread[who]++;toast(PEOPLE[who].nome,escH(text.replace(/<[^>]+>/g,'')).slice(0,140),'',function(){chatSel=who;openZap()})}}
  save();if(WINS.zap)renderZap();renderIcons();
}
function openZap(){openWin('zap',{title:'PolíciaZap',w:560,h:440,x:null,build:function(r){renderZap()},refresh:function(){renderZap()}});}
function renderZap(){
  var r=WINS.zap;if(!r)return;S.unread[chatSel]=0;save();renderIcons();
  var b=r.body;b.innerHTML='';
  var wrap=h('div',{class:'zap'}),cl=h('div',{class:'contacts'}),th=h('div',{class:'thread'});
  ['celia','beto'].forEach(function(k){
    if(k==='beto'&&S.chat.beto.length===0)return;
    var p=PEOPLE[k],c=h('button',{class:'contact'+(k===chatSel?' sel':'')},'<span class="av '+p.cls+'">'+p.av+'</span><span><span class="cn">'+escH(p.nome)+'</span><br><span class="cr">'+escH(p.cargo)+'</span></span>'+(S.unread[k]?'<span class="badge">'+S.unread[k]+'</span>':''));
    c.onclick=function(){chatSel=k;renderZap()};cl.appendChild(c)});
  var ms=h('div',{class:'msgs'});
  S.chat[chatSel].forEach(function(m){ms.appendChild(h('div',{class:'msg'+(m.sys?' sys':m.me?' me':'')},(m.me||m.sys?'':'<span class="who">'+escH(PEOPLE[chatSel].nome.split(' ')[0])+'</span>')+m.text))});
  th.appendChild(ms);th.appendChild(replyBox());
  wrap.appendChild(cl);wrap.appendChild(th);b.appendChild(wrap);
  setTimeout(function(){ms.scrollTop=ms.scrollHeight},0);
}
function replyBox(){
  var box=h('div',{class:'reply'});
  if(chatSel==='beto'&&(S.beto==='asked'||S.beto==='wrong')){
    var inp=h('input',{id:'betoAns',placeholder:'horário de saída, ex.: 17:55:03','aria-label':'Horário de saída do Beto'});
    var send=h('button',{class:'tb-btn run'},'Enviar');
    var go=function(){var v=inp.value.trim();if(!v)return;say('beto',escH(v),true);answerBeto(v)};
    send.onclick=go;inp.addEventListener('keydown',function(e){if(e.key==='Enter')go()});
    box.appendChild(inp);box.appendChild(send);
  }else if(chatSel==='beto'&&S.beto==='favor'){
    [['Não dá, Beto. Pede pro RH corrigir.','no'],['Deixa comigo, ninguém vai ver.','yes']].forEach(function(o){
      var b=h('button',{class:'opt'},escH(o[0]));b.onclick=function(){say('beto',escH(o[0]),true);favorBeto(o[1])};box.appendChild(b)});
  }else box.appendChild(h('span',{class:'muted'},'Nenhuma resposta pendente.'));
  return box;
}
