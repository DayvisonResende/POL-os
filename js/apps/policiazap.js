/* ---------- PolíciaZap (chat) ---------- */
var chatSel='celia';
function say(who,text,me){
  S.chat[who].push({me:!!me,sys:me==='sys',text:text});
  if(!me){var open=WINS.zap&&!WINS.zap.el.classList.contains('min')&&chatSel===who;
    if(!open){S.unread[who]++;toast(PEOPLE[who].nome,escH(text.replace(/<[^>]+>/g,'')).slice(0,140),'',function(){chatSel=who;openZap()})}}
  save();if(WINS.zap)renderZap();renderIcons();
}
function openZap(){openWin('zap',{title:nomeApp('zap'),w:560,h:440,x:null,build:function(r){renderZap()},refresh:function(){renderZap()}});}
function renderZap(){
  var r=WINS.zap;if(!r)return;S.unread[chatSel]=0;save();renderIcons();
  var b=r.body;b.innerHTML='';
  var wrap=h('div',{class:'zap'}),cl=h('div',{class:'contacts'}),th=h('div',{class:'thread'});
  Object.keys(PEOPLE).forEach(function(k){
    if(!PEOPLE[k].sempre&&!S.chat[k].length)return;
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
    var inp=h('input',{id:'betoAns',placeholder:L('horário de saída, ex.: 17:55:03'),'aria-label':L('Horário de saída do Beto')});
    var send=h('button',{class:'tb-btn run'},L('Enviar'));
    var go=function(){var v=inp.value.trim();if(!v)return;say('beto',escH(v),true);answerBeto(v)};
    send.onclick=go;inp.addEventListener('keydown',function(e){if(e.key==='Enter')go()});
    box.appendChild(inp);box.appendChild(send);
  }else if(chatSel==='beto'&&S.beto==='favor'){
    [[L('Não dá, Beto. Pede pro RH corrigir.'),'no'],[L('Deixa comigo, ninguém vai ver.'),'yes']].forEach(function(o){
      var b=h('button',{class:'opt'},escH(o[0]));b.onclick=function(){say('beto',escH(o[0]),true);favorBeto(o[1])};box.appendChild(b)});
  }else box.appendChild(h('span',{class:'muted'},L('Nenhuma resposta pendente.')));
  return box;
}

/* Marina se apresenta na primeira vez que o jogador abre a escuta (ou ao fechar o BO 1003).
   A fala tem duplo sentido de propósito: "pedaços que nem dava pra entender" justifica o trecho que ela cortou (Ato V). */
function marinaApresenta(){
  if(S.marinaApresentou||S.chat.marina.length)return;S.marinaApresentou=true;save();
  setTimeout(function(){say('marina',L('Oi, recruta! Marina, da perícia. Fui eu que transcrevi essa escuta da Castelo. Áudio horrível, viu? Tinha uns pedaços que nem dava pra entender. Qualquer coisa, me chama.'))},2500);
}
