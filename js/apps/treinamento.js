/* ---------- motor do treinamento guiado (passos em js/conteudo/treinamento/) ---------- */
function fill(t){return String(t).replace(/\{n\}/g,F.nVeic).replace(/\{cores\}/g,F.cores.length)}
function tutActive(){return S.tut<TUT.length}
function tutStep(){return TUT[S.tut]}
function setEditor(sql,ro){var ta=$('#sqlEd');if(!ta)return;if(sql!=null){ta.value=sql;S.editor=sql;syncHl()}ta.readOnly=!!ro;$('.ed').classList.toggle('locked',!!ro)}
function tutApplyEditor(){var st=tutStep();if(!st)return setEditor(null,false);setEditor(null,!(st.type==='mold'||st.type==='free'))}
function tutEnter(){
  var st=tutStep();S.tutPhase='doing';S.tutPick=null;S.tutPred=false;S.tutWrong=[];S.tutBlocks=[];S.tutHint=0;S.tutFb=null;S.tutMiss=0;S.tutErr=0;S.tutBlk=0;
  if(st.type==='run'||st.type==='predict')setEditor(st.sql,true);
  else if(st.type==='slot'||st.type==='mold')setEditor(st.template,st.type==='slot');
  else if(st.type==='blocks'||st.type==='free')setEditor('',st.type==='blocks');
  else setEditor(null,true);
  $('#dbExpl')&&($('#dbExpl').innerHTML='');$('#dbMsg')&&($('#dbMsg').innerHTML='');
  save();renderGuide();
  if(st.type==='mold'||st.type==='free'){var ta=$('#sqlEd');if(ta&&window.innerWidth>760)ta.focus()}
}
function tutNext(){S.tut++;if(S.tut>=TUT.length){tutFinish();return}tutEnter()}
function tutComplete(){var st=tutStep();S.tutFb=null;if(st.after){S.tutPhase='after';save();renderGuide()}else tutNext()}
function tutFinish(){
  S.tut=TUT.length;spot(null,null);setEditor(null,false);
  var g=$('#guide');if(g){g.remove();$('.dbwrap').classList.remove('tut')}
  S.apps.indexOf('ocorr')<0&&S.apps.push('ocorr');S.apps.indexOf('zap')<0&&S.apps.push('zap');save();renderIcons();buildStart();
  toast('Programas liberados','SISP Ocorrências e PolíciaZap estão na sua área de trabalho.','warn');
  say('celia','Treinamento acabou. Tô aqui no PolíciaZap se precisar, mas não me chama pra besteira. Agora me entrega o relatório no SISP Ocorrências.');
  openOcorr();
}
function tutFeedback(kind,html){S.tutFb={k:kind,h:html};save();renderGuide()}
function tutBeforeRun(){
  if(!tutActive()||S.tutPhase!=='doing')return true;var st=tutStep();
  if(st.type==='predict'&&!S.tutPred){tutFeedback('info','Calma, apressadinho. Primeiro me diz o que vai sair. Quem chuta sem pensar aqui dentro acaba assinando mandado errado.');return false}
  if(st.type==='slot'&&!S.tutPick){tutFeedback('info','Executar o quê? Tem um buraco no meio da consulta. Escolhe uma peça primeiro.');return false}
  if(st.type==='blocks'&&$('#sqlEd').value.trim()===''){tutFeedback('info','Tela vazia, recruta. Monta a consulta com as peças primeiro.');return false}
  return true;
}
function tutOnRun(R){
  if(!tutActive()||S.tutPhase!=='doing')return;var st=tutStep();if(!st.ok)return;
  if(st.ok(R)){tutComplete();return}
  if(st.miss){tutFeedback('bad',st.miss(R,S.tutMiss||0));S.tutMiss=(S.tutMiss||0)+1;save()}
}
function tutOnError(){if(!tutActive()||S.tutPhase!=='doing')return;var st=tutStep();if(st.type==='mold'||st.type==='free'){tutFeedback('bad',esc(S.tutErr||0,['Errou. Ótimo, é assim que se aprende. Lê a mensagem vermelha embaixo do editor, que o sistema já te disse o que tá errado.','Errou de novo. Respira. Lê a mensagem vermelha devagar e faz o que ela diz.','Tá brigando com o teclado? Confere letra por letra com o que eu pedi. Se travar de vez, clica em Explique esta consulta.']));S.tutErr=(S.tutErr||0)+1;save()}}
function tutOnExplain(){if(tutActive()&&S.tutPhase==='doing'&&tutStep().type==='explain')tutComplete()}
function renderGuide(){
  var g=$('#guide');if(!g)return;var st=tutStep();if(!st)return;
  var i=S.tut,N=TUT.length,after=S.tutPhase==='after';
  var html='<div class="gh"><span class="av">CM</span><div><b>Célia Moura</b><small>Treinamento · passo '+(i+1)+' de '+N+'</small></div></div><div class="gprog"><i style="width:'+Math.round((i+(after?1:0))/N*100)+'%"></i></div>';
  if(after){html+='<div class="gbub after">'+fill(st.after)+'</div><div class="gact"><button class="btn-primary" id="gNext">Continuar</button></div>';g.innerHTML=html;$('#gNext').onclick=tutNext;spot('#gNext');return}
  html+='<div class="gbub">'+fill(st.text)+(st.extra||'')+(st.text2||'')+'</div>';
  g.innerHTML=html;var sp=st.spot||null,pl=st.point||null;
  if(st.type==='msg'||st.type==='final'){var a=h('div',{class:'gact'});var b=h('button',{class:'btn-primary',id:'gNext'},escH(st.btn||'Continuar'));b.onclick=tutNext;a.appendChild(b);g.appendChild(a);sp='#gNext'}
  if(st.type==='predict'){
    g.appendChild(h('div',{class:'gq'},escH(st.q)));var og=h('div',{class:'gopts'});
    st.opts.forEach(function(o,k){var cls='gopt'+(S.tutPred&&o.ok?' right':'')+(S.tutWrong.indexOf(k)>=0?' wrong':'');var b=h('button',{class:cls},escH(o.t));
      if(S.tutPred||S.tutWrong.indexOf(k)>=0)b.disabled=true;
      b.onclick=function(){if(o.ok){S.tutPred=true;tutFeedback('ok',escH(o.fb))}else{S.tutWrong.push(k);tutFeedback('bad',escH(o.fb))}};og.appendChild(b)});
    g.appendChild(og);sp=S.tutPred?'#runBtn':null;pl=S.tutPred?'agora executa':null}
  if(st.type==='slot'){
    var cg=h('div',{class:'chips'});
    st.chips.forEach(function(c){var b=h('button',{class:'chip'+(S.tutPick===c.t?' on':'')+(c.bad&&S.tutWrong.indexOf(c.t)>=0?' no':'')},escH(c.t));
      b.onclick=function(){if(c.bad){S.tutWrong.push(c.t);S.tutPick=null;setEditor(st.template,true);tutFeedback('bad',c.bad);return}
        S.tutPick=c.t;setEditor(st.template.replace('___',c.t),true);S.tutFb=null;save();renderGuide()};cg.appendChild(b)});
    g.appendChild(cg);sp=S.tutPick?'#runBtn':null;pl=S.tutPick?'executa':null}
  if(st.type==='blocks'){
    var line=h('div',{class:'bline','aria-label':'Sua consulta'});
    if(!S.tutBlocks.length)line.appendChild(h('span',{class:'ph'},'clique nas peças abaixo…'));
    S.tutBlocks.forEach(function(pi,k){var t=st.pool[pi];var b=h('button',{class:'chip'+(/^[A-Z]+$/.test(t)?' kw':''),title:'Devolver esta peça'},escH(t));
      b.onclick=function(){S.tutBlocks.splice(k,1);setEditor('',true);S.tutFb=null;save();renderGuide()};line.appendChild(b)});
    g.appendChild(line);var pool=h('div',{class:'chips'});
    st.pool.forEach(function(t,pi){if(S.tutBlocks.indexOf(pi)>=0)return;var b=h('button',{class:'chip'+(/^[A-Z]+$/.test(t)?' kw':'')},escH(t));
      b.onclick=function(){S.tutBlocks.push(pi);S.tutFb=null;
        if(S.tutBlocks.length===st.pool.length){var seq=S.tutBlocks.map(function(x){return st.pool[x]});
          if(seq.join(' ')===st.answer.join(' ')){setEditor(joinToks(seq),true);tutFeedback('ok','Agora sim. Executa.');return}
          setEditor('',true);tutFeedback('bad',esc(S.tutBlk||0,st.wrong));S.tutBlk=(S.tutBlk||0)+1;save();return}
        save();renderGuide()};pool.appendChild(b)});
    g.appendChild(pool);sp=$('#sqlEd').value?'#runBtn':null;pl=$('#sqlEd').value?'executa':null}
  if(st.type==='free'&&st.hints){
    for(var q=0;q<S.tutHint;q++)g.appendChild(h('div',{class:'ghint'},st.hints[q]));
    if(S.tutHint<st.hints.length){var hb=h('button',{class:'tb-btn'},escH((st.hintBtns||['Pedir dica','Ver a consulta'])[S.tutHint]));hb.onclick=function(){S.tutHint++;save();renderGuide()};var ha=h('div',{class:'gact'});ha.appendChild(hb);g.appendChild(ha)}}
  if(S.tutFb)g.appendChild(h('div',{class:'gfb '+S.tutFb.k},S.tutFb.h));
  if(st.type==='mold'||st.type==='free')g.appendChild(h('div',{class:'muted',style:'font-size:12.5px'},'Atalho: Ctrl+Enter também executa.'));
  if(sp==='#gNext'||sp==='#sqlEd')pl=null;
  spot(sp,pl);
}
