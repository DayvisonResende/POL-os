/* ---------- ACADEPOL (prova de promoção) ---------- */
function provaMod(){for(var m in PROVAS){var P=PROVAS[m];if(P.para===S.rank+1&&caseDone(indiceCaso(P.requer)))return +m}return null}
function newProva(mod){var P=PROVAS[mod],m=shuffle(P.mcq).slice(0,3),w=shuffle(P.write).slice(0,2),ord={};
  m.forEach(function(q){ord[q.id]=shuffle([0,1,2])});
  S.prova={mod:mod,qs:m.map(function(q){return q.id}).concat(w.map(function(q){return q.id})),ord:ord,ans:{},sql:{},graded:null};save()}
function findQ(mod,id){var P=PROVAS[mod];return P.mcq.concat(P.write).filter(function(q){return q.id===id})[0]}
function runSafe(sql){if(!sql||!sql.trim())return {err:'Consulta vazia.'};if(!isReadOnly(sql))return {err:'Na prova só vale consulta de leitura (SELECT).'};var bloq=tabelaBloqueada(sql);if(bloq)return {err:msgTabelaBloqueada(bloq)};
  try{var r=db.exec(sql);return {R:toR(r.length?r[r.length-1]:null),raw:r.length?r[r.length-1]:null}}catch(e){return {err:translateError(String(e.message||e),sql,SCHEMA),rawErr:String(e.message||e)}}}
function openProva(){openWin('prova',{title:'ACADEPOL — Avaliação',w:720,h:600,x:150,y:12,build:function(){renderProva()},refresh:function(){renderProva()}})}
function renderProva(){
  var r=WINS.prova;if(!r)return;var mod=provaMod();var b=r.body;var sc=b.querySelector('.prova');var top=sc?sc.scrollTop:0;b.innerHTML='';
  var wrap=h('div',{class:'prova'});b.appendChild(wrap);
  if(!mod){wrap.innerHTML='<div class="phead"><div class="eyebrow">Academia de Polícia Civil · ACADEPOL</div><h2>Nenhuma prova agendada</h2><p>'+(S.rank>=2?'Você já é '+escH(rankT())+'. A prova do Módulo 3 sai quando o módulo sair.':'A próxima prova é liberada quando você fechar os chamados do módulo.')+'</p></div>';return}
  if(!S.prova||S.prova.mod!==mod)newProva(mod);
  var P=PROVAS[mod],pv=S.prova,g=pv.graded;
  wrap.innerHTML='<div class="phead"><div class="eyebrow">Academia de Polícia Civil · ACADEPOL</div><h2>Prova de promoção a '+escH(RANKS[P.para].t)+'</h2><p>'+escH(P.titulo)+'. Cinco questões, aprovação com 4 acertos. A prova é com consulta: pode usar o DB-Investigator, o Dicionário de Dados e o botão Explique. Reprovou, refaz com outras questões.</p></div>';
  var body=h('div',{class:'pbody'});wrap.appendChild(body);
  if(g){var pass=g.score>=4;
    body.appendChild(h('div',{class:'score'},'<b>'+g.score+'/5</b><span class="stamp'+(pass?'':' bad')+'">'+(pass?'APROVADO':'REPROVADO')+'</span><span class="muted" style="flex:1;min-width:160px">'+(pass?'Promoção assinada pela supervisão.':'Leia as correções abaixo antes de refazer.')+'</span>'))}
  pv.qs.forEach(function(id,n){
    var q=findQ(mod,id),isW=!!q.check,res=g?g.res[id]:null;
    var box=h('div',{class:'pq'+(g?(res?' ok':' no'):'')});
    box.appendChild(h('div',{class:'qn'},'QUESTÃO '+(n+1)+(isW?' · ESCREVA A CONSULTA':' · MÚLTIPLA ESCOLHA')+(g?(res?' · CERTA':' · ERRADA'):'')));
    box.appendChild(h('div',{class:'qt'},q.q));
    if(q.code)box.appendChild(h('pre',null,escH(q.code)));
    if(!isW){
      pv.ord[id].forEach(function(oi){
        var picked=pv.ans[id]===oi,cls='opt'+(g&&oi===q.ok?' right':'')+(g&&picked&&oi!==q.ok?' wrongpick':'');
        var lab=h('label',{class:cls},'<input type="radio" name="q_'+id+'" id="q_'+id+'_'+oi+'"'+(picked?' checked':'')+(g?' disabled':'')+'><span>'+escH(q.opts[oi])+'</span>');
        if(!g)lab.querySelector('input').onchange=function(){pv.ans[id]=oi;save();updFoot()};
        box.appendChild(lab)});
    }else{
      var ta=h('textarea',{id:'pw_'+id,spellcheck:'false','aria-label':'Sua consulta para a questão '+(n+1),placeholder:'-- escreva aqui. Ex.: SELECT … FROM … ;'});ta.value=pv.sql[id]||'';if(g)ta.readOnly=true;
      var prev=h('div',{class:'prev'});
      ta.addEventListener('input',function(){pv.sql[id]=ta.value;save();updFoot()});
      box.appendChild(ta);
      if(!g){var tb=h('button',{class:'tb-btn',type:'button'},'&#9654; Testar consulta');tb.onclick=function(){
          var x=runSafe(ta.value);tele('consulta',{onde:'Prova Módulo '+mod,questao:id,sql:ta.value.slice(0,400),res:x.err?'erro':x.raw?'ok':'vazio',erro:x.rawErr});if(x.err){prev.innerHTML='<div class="err" style="margin:0">'+x.err+'</div>';return}
          var raw=x.raw;if(!raw){prev.innerHTML='A consulta rodou e não trouxe nenhuma linha.';return}
          prev.innerHTML=raw.values.length+' linha(s) · colunas: '+raw.columns.map(escH).join(', ')+'<table><tr>'+raw.columns.map(function(c){return '<th>'+escH(c)+'</th>'}).join('')+'</tr>'+raw.values.slice(0,3).map(function(row){return '<tr>'+row.map(function(v){return '<td>'+escH(v===null?'NULL':v)+'</td>'}).join('')+'</tr>'}).join('')+'</table>'+(raw.values.length>3?'…':'')};
        var ac=h('div',{class:'pfoot'});ac.appendChild(tb);box.appendChild(ac)}
      box.appendChild(prev);
    }
    if(g)box.appendChild(h('div',{class:'exp'},isW?(res?'Resultado correto.':'O resultado não bateu. Uma resposta possível:')+(res?'':'<pre style="margin-top:6px">'+escH(q.model)+'</pre>'):escH(q.exp)));
    body.appendChild(box)});
  var foot=h('div',{class:'pfoot'});body.appendChild(foot);
  function updFoot(){if(g)return;var done=pv.qs.filter(function(id){var q=findQ(mod,id);return q.check?(pv.sql[id]||'').trim():pv.ans[id]!=null}).length;
    foot.innerHTML='';var bt=h('button',{class:'btn-primary'},'Entregar prova');bt.disabled=done<5;bt.onclick=gradeProva;foot.appendChild(bt);foot.appendChild(h('span',{class:'muted'},done+' de 5 respondidas'))}
  if(g){var pass=g.score>=4;var bt=h('button',{class:'btn-primary'},pass?'Receber promoção':'Refazer com outras questões');
    bt.onclick=function(){if(pass){S.prova=null;save();promote(P.para)}else{newProva(mod);renderProva();wrap.scrollTop=0}};foot.appendChild(bt)}
  else updFoot();
  wrap.scrollTop=top;
}
function gradeProva(){
  var pv=S.prova,mod=pv.mod,res={},score=0;
  pv.qs.forEach(function(id){var q=findQ(mod,id),ok;
    if(q.check){var x=runSafe(pv.sql[id]);ok=!x.err&&q.check(x.R)}else ok=pv.ans[id]===q.ok;
    res[id]=!!ok;if(ok)score++});
  pv.graded={score:score,res:res};tele('prova',{onde:'Prova Módulo '+mod,nota:score,erradas:pv.qs.filter(function(id){return !res[id]})});S.provaTries[mod]=(S.provaTries[mod]||0)+1;save();
  var t=S.provaTries[mod];
  if(score>=4)setTimeout(function(){say('celia',t===1?'Passou de primeira. Não vou elogiar, mas anotei.':'Passou. Demorou, mas passou. É isso que importa.')},700);
  else setTimeout(function(){say('celia',t===1?'Reprovou. Normal, metade reprova na primeira. Lê as correções com calma e refaz.':'De novo? Abre o Manual do recruta no SISP Ocorrências antes de refazer. Prova com consulta, recruta. Com consulta.')},700);
  renderProva();var w=WINS.prova&&WINS.prova.body.querySelector('.prova');if(w)w.scrollTop=0;
}
function promote(to){
  S.rank=to;save();buildStart();atualizarSchema();if(WINS.db)renderDict();
  var R=RANKS[to],ov=h('div',{class:'overlay'});
  var stars='';for(var i=0;i<to;i++)stars+='<path transform="translate('+(i*30)+' 0)" d="M15 2l3.5 8.2 8.9.7-6.8 5.8 2.1 8.7L15 20.8l-7.7 4.6 2.1-8.7L2.6 10.9l8.9-.7z" fill="#d6951c"/>';
  ov.innerHTML='<div class="promo" role="dialog" aria-label="Promoção"><svg width="'+(to*30)+'" height="28" viewBox="0 0 '+(to*30)+' 28" aria-hidden="true">'+stars+'</svg><div class="eyebrow">Diário Oficial · DTI · Promoção</div><h2>'+escH(R.t)+'</h2><div class="muted">recruta.dti04, por aprovação na ACADEPOL</div><ul>'+R.libera.map(function(l){return '<li>'+escH(l)+'</li>'}).join('')+'</ul><q>'+escH(R.celia)+'</q><button class="btn-primary" id="prOk">Voltar ao trabalho</button></div>';
  $('#app').appendChild(ov);
  $('#prOk',ov).onclick=function(){ov.remove();say('celia',R.celia);
    if(R.aoPromover)R.aoPromover();
    setTimeout(verificarTreinos,1200);
    if(WINS.prova)renderProva();if(WINS.db)$('#dbStatus').textContent='Perfil: '+rankT()+' (somente leitura).'};
}
