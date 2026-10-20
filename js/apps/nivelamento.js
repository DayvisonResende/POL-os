/* ---------- Nivelamento "Já sei SQL" ----------
   Questões em js/conteudo/nivelamento.js. Estado: S.nivelamento = {estado:'oferecido'|'recusado'|'fazendo'|'feito',
   modulo (índice em NIVELAMENTO), sql:{}, ans:{}, dispensados:[ids de treinamento]}.
   Um módulo por vez: acertou tudo, dispensa os treinamentos dele (entram em S.treinosFeitos, então anotações,
   Guia e serviços do Beto ficam liberados como se tivesse feito) e passa ao próximo; errou algum, para ali. */
function nivelamento(){return S.nivelamento||(S.nivelamento={estado:null,modulo:0,sql:{},ans:{},dispensados:[]})}
function nivelamentoDisponivel(){var n=nivelamento();return treinoFeito('m1')&&n.estado!=='feito'&&!treinoFeito('m2-filtros')}
// No fim do treinamento do Módulo 1, a Célia pergunta pelo PolíciaZap (sem janela que bloqueia: o iniciante
// não é interrompido). A notificação e o menu SISP abrem a explicação.
function convidarNivelamento(){
  var n=nivelamento();if(n.estado||!nivelamentoDisponivel())return;n.estado='oferecido';save();tele('nivelamento',{acao:'oferecido'});
  say('celia',L('Uma pergunta, recruta: você já mexe com SQL? Se já, tem um nivelamento no menu SISP que dispensa os próximos treinamentos. Se nunca mexeu, segue comigo, que é o caminho mais rápido.'));
  toast(L('Já sabe SQL?'),L('Clique para ver o nivelamento: quem acerta dispensa os treinamentos e vai direto aos casos.'),'',ofertaNivelamento);
}
function ofertaNivelamento(){
  if(!nivelamentoDisponivel())return;
  confirmar(L('Já sabe SQL?'),
    '<p>'+L('Se você já usa SQL no trabalho ou nos estudos, pode fazer um <b>nivelamento</b> rápido, de 5 a 15 minutos.')+'</p>'+
    '<p>'+L('Para cada módulo em que acertar todas as questões, os treinamentos daquele módulo ficam <b>dispensados</b>, e você vai direto aos casos. Os casos, as provas e a história continuam iguais.')+'</p>'+
    '<p class="muted">'+L('Nunca usou SQL? Siga o treinamento: ele foi feito pra você. Dá para fazer o nivelamento depois, pelo menu SISP.')+'</p>',
    [[L('Fazer o nivelamento'),function(){abrirNivelamento()},'btn-igual'],
     [L('Seguir o treinamento completo'),function(){tele('nivelamento',{acao:'recusou'})},'btn-igual']]);
}
function abrirNivelamento(){
  var n=nivelamento();if(n.estado!=='fazendo'){n.estado='fazendo';n.modulo=n.modulo||0;save();tele('nivelamento',{acao:'comecou'})}
  openWin('nivel',{title:L('Nivelamento — Já sei SQL'),w:720,h:600,x:160,y:16,build:function(){renderNivelamento()},refresh:function(){renderNivelamento()}});
}
function renderNivelamento(){
  var r=WINS.nivel;if(!r)return;var n=nivelamento(),b=r.body;b.innerHTML='';
  var wrap=h('div',{class:'prova'});b.appendChild(wrap);
  if(n.estado==='feito'){
    var lista=NIVELAMENTO.filter(function(m){return m.treinos.every(function(t){return n.dispensados.indexOf(t)>=0})}).map(function(m){return m.modulo});
    wrap.innerHTML='<div class="phead"><div class="eyebrow">'+L('Nivelamento')+'</div><h2>'+L('Resultado')+'</h2><p>'+
      (lista.length?L('Treinamentos dispensados: Módulo {lista}. Nesses módulos você vai direto aos casos; as anotações da Célia e o Guia SQL já estão liberados.',{lista:lista.join(', ')}):L('Nenhum módulo dispensado. Siga o treinamento normal: ele vai te deixar pronto para os casos.'))+'</p></div>';
    return;
  }
  var M=NIVELAMENTO[n.modulo];
  wrap.innerHTML='<div class="phead"><div class="eyebrow">'+L('Nivelamento · {i} de {t}',{i:n.modulo+1,t:NIVELAMENTO.length})+'</div><h2>'+escH(M.titulo)+'</h2><p>'+L('Acerte todas para dispensar os treinamentos deste módulo. Errou alguma? Sem problema: você segue o treinamento daqui em diante.')+'</p></div>';
  var body=h('div',{class:'pbody'});wrap.appendChild(body);
  M.questoes.forEach(function(q,k){
    var box=h('div',{class:'pq'});
    box.appendChild(h('div',{class:'qn'},L('QUESTÃO {n}',{n:k+1})+' · '+(q.check?L('ESCREVA A CONSULTA'):L('MÚLTIPLA ESCOLHA'))));
    box.appendChild(h('div',{class:'qt'},q.q));
    if(!q.check){q.opts.forEach(function(o,oi){var lab=h('label',{class:'opt'},'<input type="radio" name="nv_'+q.id+'"'+(n.ans[q.id]===oi?' checked':'')+'><span>'+escH(o)+'</span>');
      lab.querySelector('input').onchange=function(){n.ans[q.id]=oi;save()};box.appendChild(lab)});body.appendChild(box);return}
    var ta=h('textarea',{id:'nv_'+q.id,spellcheck:'false','aria-label':L('Sua consulta para a questão {n}',{n:k+1}),placeholder:L('-- escreva aqui. Ex.: SELECT … FROM … ;')});ta.value=n.sql[q.id]||'';
    ta.addEventListener('input',function(){n.sql[q.id]=ta.value;save()});
    var prev=h('div',{class:'prev'}),tb=h('button',{class:'tb-btn',type:'button'},'&#9654; '+L('Testar consulta'));
    tb.onclick=function(){var x=runSafe(ta.value);tele('consulta',{onde:'Nivelamento',questao:q.id,sql:ta.value.slice(0,400),res:x.err?'erro':x.raw?'ok':'vazio'});
      if(x.err){prev.innerHTML='<div class="err" style="margin:0">'+x.err+'</div>';return}
      if(!x.raw){prev.innerHTML=L('A consulta rodou e não trouxe nenhuma linha.');return}
      prev.innerHTML=Lp(x.raw.values.length,'1 linha','{n} linhas')+'<table><tr>'+x.raw.columns.map(function(c){return '<th>'+escH(c)+'</th>'}).join('')+'</tr>'+x.raw.values.slice(0,3).map(function(row){return '<tr>'+row.map(function(v){return '<td>'+escH(v===null?'NULL':numTela(v))+'</td>'}).join('')+'</tr>'}).join('')+'</table>'};
    box.appendChild(ta);var ac=h('div',{class:'pfoot'});ac.appendChild(tb);box.appendChild(ac);box.appendChild(prev);body.appendChild(box);
  });
  var foot=h('div',{class:'pfoot'}),conf=h('button',{class:'btn-primary'},L('Conferir o módulo {m}',{m:M.modulo})),parar=h('button',{class:'tb-btn'},L('Parar aqui e seguir o treinamento'));
  conf.onclick=function(){conferirNivelamento()};parar.onclick=function(){encerrarNivelamento('parou')};
  foot.appendChild(conf);foot.appendChild(parar);body.appendChild(foot);
}
function conferirNivelamento(){
  var n=nivelamento(),M=NIVELAMENTO[n.modulo];
  var certas=M.questoes.filter(function(q){if(!q.check)return n.ans[q.id]===q.ok;var x=runSafe(n.sql[q.id]||'');return !x.err&&q.check(x.R)});
  var passou=certas.length===M.questoes.length;
  tele('nivelamento',{acao:'modulo',modulo:M.modulo,ok:passou,acertos:certas.length,de:M.questoes.length});
  if(!passou){toast(L('Nivelamento'),L('Módulo {m}: {a} de {t}. Daqui em diante, treinamento normal: é o caminho mais rápido pra você.',{m:M.modulo,a:certas.length,t:M.questoes.length}),'warn');encerrarNivelamento('errou');return}
  M.treinos.forEach(function(t){if(n.dispensados.indexOf(t)<0)n.dispensados.push(t);if(!treinoFeito(t))S.treinosFeitos.push(t)});
  toast(L('Nivelamento'),L('Módulo {m} dispensado. Treinamentos pulados, casos mantidos.',{m:M.modulo}),'ok');
  n.modulo++;save();
  if(n.modulo>=NIVELAMENTO.length){encerrarNivelamento('completo');return}
  renderNivelamento();var sc=WINS.nivel&&WINS.nivel.body.querySelector('.prova');if(sc)sc.scrollTop=0;
}
function encerrarNivelamento(motivo){
  var n=nivelamento();n.estado='feito';save();tele('nivelamento',{acao:'fim',motivo:motivo,dispensados:n.dispensados.length});
  renderNivelamento();renderIcons();buildStart();renderFiles();
  if(n.dispensados.length)setTimeout(function(){say('celia',L('Vi o teu nivelamento. Dispensado do treinamento, não da cobrança: nos casos, eu quero o mesmo capricho de quem fez tudo.'))},1500);
}
