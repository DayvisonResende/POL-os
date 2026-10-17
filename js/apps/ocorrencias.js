/* ---------- Ocorrências ---------- */
function caseUnlocked(i){if(S.rank<(CASES[i].rankMin||0)||S.dia<(CASES[i].diaMin||0))return false;return i===0||S.closed.indexOf(CASES[i-1].id)>=0}
function caseWaitsRank(i){return i>0&&caseDone(i-1)&&S.rank<(CASES[i].rankMin||0)}
function caseWaitsDay(i){return i>0&&caseDone(i-1)&&S.dia<(CASES[i].diaMin||0)}
function caseDone(i){return S.closed.indexOf(CASES[i].id)>=0}
function caseActive(){for(var k=0;k<CASES.length;k++)if(caseUnlocked(k)&&!caseDone(k))return k;return -1}
function openOcorr(){openWin('ocorr',{title:nomeApp('ocorr'),w:760,h:540,x:110,y:14,build:function(){renderOcorr()},refresh:function(){renderOcorr()}})}
function renderOcorr(){
  var r=WINS.ocorr;if(!r)return;var scroll=r.body.querySelector('.ocdetail');var st=scroll?scroll.scrollTop:0;
  r.body.innerHTML='';var wrap=h('div',{class:'oc'}),list=h('div',{class:'oclist'});
  CASES.forEach(function(c,i){
    var un=caseUnlocked(i),dn=caseDone(i);
    var b=h('button',{class:'ocitem'+(i===S.caseSel?' sel':'')},'<span class="no">'+L('BO 2026/{id} · Módulo {m}',{id:c.id,m:c.modulo})+'</span><span class="tt">'+escH(c.titulo)+'</span><span class="pill '+(dn?'p-done':un?'p-open':'p-lock')+'">'+(dn?L('Encerrado'):un?L('Em análise'):(caseWaitsRank(i)?L('Aguarda promoção'):caseWaitsDay(i)?L('Próximo expediente'):L('Pendente')))+'</span>');
    if(!un)b.disabled=true;b.onclick=function(){S.caseSel=i;save();renderOcorr()};list.appendChild(b)});
  wrap.appendChild(list);
  var c=CASES[S.caseSel],d=h('div',{class:'ocdetail'});
  var done=caseDone(S.caseSel),stp=S.steps[c.id]||[];
  d.innerHTML='<div class="eyebrow">'+L('Boletim nº 2026/{id}',{id:c.id})+'</div><h2>'+escH(c.titulo)+'</h2>'+
   '<div class="bohead"><div><span>'+L('Natureza')+'</span>'+escH(c.natureza)+'</div><div><span>'+L('Data e hora')+'</span>'+c.quando+'</div><div><span>'+L('Local')+'</span>'+escH(c.local)+'</div><div><span>'+L('Solicitante')+'</span>'+escH(c.solicitante)+'</div></div>'+
   '<h3>'+L('Relato')+'</h3><p class="relato">'+c.relato+'</p><h3>'+L('Tarefas da investigação')+'</h3>';
  var ul=h('ul',{class:'steps'});
  c.steps.forEach(function(s,k){
    var ok=done||stp.indexOf(k)>=0,hk=c.id+':'+k,lvl=S.hintsSeen[hk]||0;
    var li=h('li',{class:'step'+(ok?' done':'')},'<span class="chk" aria-hidden="true">'+(ok?'&#10003;':'')+'</span><span class="st">'+s.t+'</span>');
    for(var q=0;q<lvl;q++)li.appendChild(h('div',{class:'hint'},(q===s.h.length-1&&q>0?'<b>'+L('Quase a resposta:')+'</b> ':'')+s.h[q]));
    if(!ok&&lvl<s.h.length){var hb=h('button',{class:'hb'},lvl===0?L('Pedir dica'):lvl===s.h.length-1?L('Ainda travado? Ver a consulta'):L('Mais uma dica'));hb.onclick=function(){S.hintsSeen[hk]=lvl+1;tele('dica',{caso:c.id,tarefa:k+1,nivel:lvl+1});save();renderOcorr()};li.appendChild(hb)}
    ul.appendChild(li)});
  d.appendChild(ul);
  d.appendChild(h('h3',null,L('Manual do recruta')));
  var man=h('details',{class:'manual'},'<summary>Comandos deste módulo</summary><div class="mb">'+c.manual+'</div>');
  if(!stp.length&&!done)man.open=true;
  d.appendChild(man);
  d.appendChild(h('h3',null,c.final.tipo==='mandado'?L('Desfecho'):L('Entrega')));
  var fin=h('form',{class:'final'});
  if(done){fin.innerHTML='<div class="ft">'+escH(c.final.titulo)+'</div><span class="stamp">'+(c.final.tipo==='mandado'?L('DEFERIDO'):L('ACEITO'))+'</span><div class="verdict ok">'+escH(S.verdict[c.id]||L('Chamado encerrado.'))+'</div>'}
  else{
    fin.innerHTML='<div class="ft">'+escH(c.final.titulo)+'</div><div class="row">'+c.final.campos.map(function(f){return '<label for="f_'+c.id+'_'+f.id+'">'+escH(f.label)+'<input id="f_'+c.id+'_'+f.id+'" name="'+f.id+'" autocomplete="off"></label>'}).join('')+'</div>'+
      (c.final.tipo==='mandado'?'<div class="muted" style="font-size:13px">'+L('Mandado errado custa caro: o delegado indefere e a Corregedoria anota.')+'</div>':'')+
      '<div><button class="btn-primary" type="submit">'+(c.final.tipo==='mandado'?L('Assinar e enviar ao delegado'):L('Enviar relatório'))+'</button></div><div class="vslot"></div>';
    fin.addEventListener('submit',function(e){e.preventDefault();var v={};c.final.campos.forEach(function(f){v[f.id]=fin.elements[f.id].value});
      if(c.final.campos.some(function(f){return !String(v[f.id]).trim()}))return;
      var res=c.final.check(v);tele('desfecho',{caso:c.id,ok:!!res.ok,valores:v});
      if(res.ok){closeCase(S.caseSel,res.msg)}else{fin.querySelector('.vslot').innerHTML='<div class="verdict bad">'+escH(res.msg)+'</div>';addCorr(res.pen,res.msg)}});
  }
  d.appendChild(fin);wrap.appendChild(d);r.body.appendChild(wrap);
  d.scrollTop=st;
}
function closeCase(i,msg){
  var c=CASES[i];if(caseDone(i))return;
  S.closed.push(c.id);S.verdict[c.id]=msg;S.clock+=c.tempo||60;addMetas(30);
  toast(L('Chamado encerrado'),L('BO 2026/{id}: {titulo}',{id:c.id,titulo:escH(c.titulo)}),'ok');
  if(c.aoEncerrar)c.aoEncerrar();
  setTimeout(verificarTreinos,2500);   // o próximo caso pode ter treinamento
  verificarPedidos();
  if(i<CASES.length-1&&caseUnlocked(i+1))S.caseSel=i+1;
  save();renderOcorr();renderFiles();
}
function unlockToast(){toast(L('Novo chamado'),L('Um novo BO foi atribuído a você no SISP Ocorrências.'),'warn',openOcorr)}

function checkSteps(res){
  var R=toR(res),i=S.caseSel;
  // checa o caso ativo (o primeiro não encerrado)
  var idx=caseActive();
  if(idx<0)return;var c=CASES[idx],stp=S.steps[c.id]||(S.steps[c.id]=[]);
  var feitas=0,quase=null;
  c.steps.forEach(function(s,k){if(stp.indexOf(k)<0){var ok=false;try{ok=s.ok(R)}catch(e){}if(ok){feitas++;stp.push(k);tele('tarefa',{caso:c.id,tarefa:k+1});if(s.aoConcluir)setTimeout(s.aoConcluir,1200);if(!tutActive())toast('Tarefa concluída',s.t.replace(/<[^>]+>/g,''),'ok')}
    else if(!quase&&s.quase){try{var q=s.quase(R);if(q)quase={k:k,msg:q}}catch(e){}}}});
  save();renderOcorr();
  // Nenhuma tarefa marcou, mas a consulta chegou perto de uma: diz o que falta em vez de ficar calado.
  if(feitas||!quase)return null;
  tele('quase',{caso:c.id,tarefa:quase.k+1});
  return L('<b>Quase lá</b> (tarefa {n}): {msg}',{n:quase.k+1,msg:quase.msg});
}
