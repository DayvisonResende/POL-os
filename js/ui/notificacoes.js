/* ---------- toasts & meters ---------- */
function toast(title,text,kind,onclick){
  var t=h('div',{class:'toast '+(kind||''),role:'status'},'<b>'+escH(title)+'</b>'+text);
  t.onclick=function(){t.remove();if(onclick)onclick()};
  var tc=$('#toasts');tc.appendChild(t);while(tc.children.length>3)tc.firstChild.remove();setTimeout(function(){t.remove()},6500);
}
function meters(){
  var m=Math.max(0,Math.min(100,S.metas)),c=Math.max(0,Math.min(100,S.corr));
  $('#mMetas b').textContent=m+'%';$('#mMetas .fill').style.width=m+'%';
  $('#mCorr b').textContent=c+'%';$('#mCorr .fill').style.width=c+'%';
  var hh=Math.floor(S.clock/60),mm=S.clock%60;
  $('#clock').innerHTML=String(hh).padStart(2,'0')+':'+String(mm).padStart(2,'0')+'<small>'+diaAtual().rotulo+' · '+L('treino')+'</small>';
  if(S.corr>=100&&!S.fired){S.fired=true;save();setTimeout(fired,600)}
}
function addCorr(n,why){S.corr+=n;tele('corregedoria',{n:n,motivo:why});meters();toast(L('Corregedoria +{n}%',{n:n}),escH(why),'bad');save()}
function addMetas(n){S.metas+=n;meters();save()}
