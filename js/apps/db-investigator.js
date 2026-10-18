/* ---------- DB-Investigator ---------- */
var KW_RE=new RegExp('\\b('+KEYWORDS.concat(['UPDATE','DELETE','INSERT','INTO','SET','DROP','TABLE','VALUES','CREATE','ALTER','LIKE']).join('|')+')\\b','gi');
function highlight(src){
  var out='',re=/(--[^\n]*)|('(?:[^']|'')*'?)|(\b\d+(?:\.\d+)?\b)|([A-Za-z_][A-Za-z0-9_]*)|([\s\S])/g,m;
  while((m=re.exec(src))){
    if(m[1])out+='<span class="c">'+escH(m[1])+'</span>';
    else if(m[2])out+='<span class="s">'+escH(m[2])+'</span>';
    else if(m[3])out+='<span class="n">'+m[3]+'</span>';
    else if(m[4])out+=KEYWORDS.indexOf(m[4].toUpperCase())>=0||/^(UPDATE|DELETE|INSERT|INTO|SET|DROP|TABLE|VALUES|CREATE|ALTER)$/i.test(m[4])?'<span class="k">'+m[4]+'</span>':escH(m[4]);
    else out+=escH(m[5]);
  }
  return out+'\n';
}
var dictOpen=window.innerWidth>760;
function openDb(sql){
  var big=tutActive(),dw=$('#desk').clientWidth;
  openWin('db',{title:'DB-Investigator — Terminal SQL',w:big?1000:780,h:big?640:520,x:big?Math.max(110,(dw-1000)/2+50):Math.max(130,(dw-780)/2+60),y:big?8:40,build:buildDb,refresh:function(){}});
  if(sql!=null)editorTrocar(sql)
}
function buildDb(r){
  var b=r.body;if(tutActive())dictOpen=false;
  b.innerHTML='<div class="toolbar"><button class="tb-btn run" id="runBtn">&#9654; '+L('Executar')+' <span class="kbd">Ctrl+Enter</span></button><button class="tb-btn" id="clrBtn">'+L('Limpar')+'</button><button class="tb-btn" id="explBtn" title="'+escH(L('Traduz a consulta do editor para português'))+'">'+L('Explique esta consulta')+'</button>'+(tutActive()?'':'<button class="tb-btn" id="orgBtn" title="'+escH(L('Arruma a consulta em linhas, uma parte por linha'))+'">'+L('Organizar')+'</button>')+'<span style="flex:1"></span><button class="tb-btn" id="dictBtn" aria-pressed="'+dictOpen+'">'+L('Dicionário de Dados')+'</button></div>'+
   '<div class="dbwrap'+(tutActive()?' tut':'')+'">'+(tutActive()?'<div class="guide" id="guide" aria-live="polite"></div>':'')+'<div class="dbmain"><div class="ed"><pre aria-hidden="true" id="sqlHl"></pre><textarea id="sqlEd" spellcheck="false" aria-label="'+escH(L('Editor SQL'))+'" placeholder="'+escH(L('-- escreva sua consulta aqui. Ex.: SELECT * FROM veiculos;'))+'"></textarea></div><div class="sugest" id="sugest" hidden></div><div class="status" id="dbStatus">'+L('Pronto. Perfil: {patente} (somente leitura).',{patente:escH(rankT())})+'</div><div id="dbMsg"></div><div id="dbExpl"></div><div class="grid" id="dbGrid"><div class="empty">'+L('O resultado da consulta aparece aqui. Clique num valor do resultado para copiar.')+'</div></div></div><div class="dict" id="dict"'+(dictOpen?'':' hidden')+'></div></div>';
  var ta=$('#sqlEd',b);ta.value=S.editor||'';syncHl();
  ta.addEventListener('input',function(){S.editor=ta.value;syncHl();save()});
  ta.addEventListener('scroll',function(){$('#sqlHl').scrollTop=ta.scrollTop});
  ta.addEventListener('focus',function(){setTimeout(tutMarcarLacuna,0)});ta.addEventListener('click',tutMarcarLacuna);
  ta.addEventListener('keydown',function(e){
    if((e.ctrlKey||e.metaKey)&&e.key==='Enter'){e.preventDefault();runQuery()}
    else if(e.key==='Tab'&&!e.shiftKey&&sugestaoAtual){e.preventDefault();aceitarSugestao(sugestaoAtual.opcoes[0])}
    else if(e.key==='Tab'&&!e.shiftKey){e.preventDefault();insertAt('  ')}
    else if(e.key==='Escape'&&sugestaoAtual){e.preventDefault();esconderSugestoes()}
  });
  ta.addEventListener('input',mostrarSugestoes);ta.addEventListener('click',esconderSugestoes);ta.addEventListener('blur',function(){setTimeout(function(){if(document.activeElement!==ta)esconderSugestoes()},150)});
  $('#runBtn',b).onclick=runQuery;
  $('#clrBtn',b).onclick=function(){if(tutEmMolde()){tutRestaurarMolde();return}editorTrocar('')};
  $('#dictBtn',b).onclick=function(){dictOpen=!dictOpen;$('#dict').hidden=!dictOpen;this.setAttribute('aria-pressed',dictOpen)};
  $('#explBtn',b).onclick=showExplain;
  var org=$('#orgBtn',b);if(org)org.onclick=function(){var f=formatarSQL(ta.value);
    if(f==null){$('#dbStatus').textContent=ta.value.trim()?L('Não organizo consultas com comentários (-- ou /* */).'):L('Escreva uma consulta antes de organizar.');return}
    if(f!==ta.value)editorTrocar(f);tele('organizar')};
  renderDict();
  if(tutActive()){tutApplyEditor();renderGuide()}
}
function showExplain(){
  tele('explique');
  var box=$('#dbExpl'),ex=explainSQL($('#sqlEd').value);
  var html='<div class="explain"><div class="exh">'+L('Tradução da consulta')+'<button id="explClose">'+L('fechar')+'</button></div>';
  if(ex.err)html+='<div class="exn">'+ex.err+'</div>';
  else{html+='<table>'+ex.rows.map(function(r){return '<tr><td class="cd">'+escH(r.code)+'</td><td>'+r.pt+'</td></tr>'}).join('')+'</table>';
    if(ex.extra)html+='<div class="exn">'+L('Depois do primeiro <code>;</code> há outra consulta. Eu expliquei só a primeira.')+'</div>'}
  box.innerHTML=html+'</div>';$('#explClose').onclick=function(){box.innerHTML=''};
  var ids=ex.err?[]:guiaDaConsulta($('#sqlEd').value);
  if(ids.length){var gl=h('div',{class:'exn guia-links'},'<span>'+L('No Guia:')+'</span>');ids.slice(0,8).forEach(function(id){var b=h('button',{type:'button'},escH(verbete(id).titulo));b.onclick=function(){tele('guia',{acao:'atalho',verbete:id});openGuia(id);renderGuia()};gl.appendChild(b)});box.querySelector('.explain').appendChild(gl)}
  tutOnExplain();
}
function syncHl(){var ta=$('#sqlEd');if(!ta)return;$('#sqlHl').innerHTML=highlight(ta.value);$('#sqlHl').scrollTop=ta.scrollTop}
// Escreve no editor como se fosse digitado: assim o Ctrl+Z continua funcionando (trocar ta.value por código
// apaga o histórico de desfazer do navegador; playtest de 17/10). Sem execCommand, cai no jeito antigo.
function editorDigitar(ta,txt){
  ta.focus();var ok=false;try{ok=document.execCommand('insertText',false,txt)}catch(e){}
  if(!ok){var s=ta.selectionStart;ta.value=ta.value.slice(0,s)+txt+ta.value.slice(ta.selectionEnd);ta.selectionStart=ta.selectionEnd=s+txt.length}
  S.editor=ta.value;syncHl();save();
}
function insertAt(txt){editorDigitar($('#sqlEd'),txt)}
function editorTrocar(txt){var ta=$('#sqlEd');ta.focus();ta.select();if(txt)editorDigitar(ta,txt);else{try{document.execCommand('delete')}catch(e){}if(ta.value){ta.value=''}S.editor='';syncHl();save()}}
// Notas das colunas: js/conteudo/dicionario.js (COLNOTES).
function renderDict(){
  var d=$('#dict');if(!d)return;d.innerHTML='<h4>'+L('Dicionário de Dados')+'</h4><p class="dict-dica">'+L('Clique numa tabela para ver as colunas. Clique num nome para inserir no editor.')+'</p>';
  var mb=h('button',{class:'dict-mapa',title:L('Desenho das tabelas e de como elas se ligam')},'&#9707; '+L('Mapa das tabelas'));mb.onclick=openMapa;d.appendChild(mb);
  // Tabelas fechadas por padrão (com tudo aberto, a lista fica enorme: playtest de 17/10); lembra o que o jogador abriu.
  var abertas=S.dictAbertas||(S.dictAbertas={});
  SCHEMA.tables.forEach(function(t){
    var det=h('details');det.open=!!abertas[t];det.addEventListener('toggle',function(){abertas[t]=det.open;save()});
    det.appendChild(h('summary',null,t));var ul=h('ul');
    SCHEMA.info[t].forEach(function(c){
      var li=h('li');var bt=h('button',{title:L('Inserir {nome}',{nome:c.name})},(c.pk?'<span class="key">PK</span>':c.fk?'<span class="key">FK</span>':'')+'<span>'+c.name+'</span><span class="ty">'+escH((c.type||'').toLowerCase())+'</span>');
      bt.onclick=function(){insertAt(c.name)};li.appendChild(bt);
      var note=COLNOTES[t+'.'+c.name];if(note)li.appendChild(h('div',{class:'note'},escH(note)));
      ul.appendChild(li)});
    var tb=h('li');var tbb=h('button',{title:L('Inserir nome da tabela')},'<span class="muted">↳ '+L('inserir')+'</span><span>'+t+'</span>');tbb.onclick=function(){insertAt(t)};tb.appendChild(tbb);ul.appendChild(tb);
    det.appendChild(ul);d.appendChild(det)});
}
function runQuery(){
  var ta=$('#sqlEd'),msg=$('#dbMsg'),grid=$('#dbGrid'),st=$('#dbStatus');
  // Com um trecho selecionado, executa só ele (como nos programas de banco de verdade). No treinamento, sempre o editor todo.
  var trecho=!tutActive()&&ta.selectionEnd>ta.selectionStart?ta.value.slice(ta.selectionStart,ta.selectionEnd).trim():'';
  var sql=trecho||ta.value.trim();
  msg.innerHTML='';if(!sql){if(tutOnEmpty())return;st.textContent=L('Escreva uma consulta antes de executar.');return}
  if(!isReadOnly(sql)){
    msg.innerHTML='<div class="err">'+L('<b>Acesso negado.</b> Seu perfil ({patente}) é somente leitura. Comandos que alteram o banco, como UPDATE e DELETE, são liberados no Módulo 5, com supervisão.',{patente:escH(rankT())})+'</div>';
    st.textContent=L('Tentativa de escrita bloqueada e registrada.');
    tele('consulta',{sql:sql.slice(0,400),res:'bloqueada'});
    if(!S.writeWarned){S.writeWarned=true;addCorr(5,L('Tentativa de escrita no banco com perfil de recruta.'))}
    return;
  }
  var bloq=tabelaBloqueada(sql);
  if(bloq){msg.innerHTML='<div class="err">'+msgTabelaBloqueada(bloq)+'</div>';st.textContent=L('Acesso a tabela restrita bloqueado.');tele('consulta',{sql:sql.slice(0,400),res:'restrita',tabela:bloq.nome});return}
  if(!tutBeforeRun())return;
  S.queries++;var t0=performance.now(),todos;
  var hora=new Date().toLocaleTimeString(idiomaAtual());
  var status=function(t){st.textContent=t+' · '+L('executada às {hora}',{hora:hora})+(trecho?' · '+L('só o trecho selecionado'):'');st.classList.remove('flash');void st.offsetWidth;st.classList.add('flash')};
  try{todos=executarSQL(db,sql)}catch(e){
    S.errors++;tele('consulta',{sql:sql.slice(0,400),res:'erro',erro:String(e.message||e)});save();var tr=translateError(String(e.message||e),sql,SCHEMA);
    msg.innerHTML='<div class="err">'+tr+'<span class="raw">SQLite: '+escH(e.message||e)+'</span></div>';guiaNasMensagens(msg);
    grid.innerHTML='<div class="empty">'+L('A consulta não rodou, então não há resultado. Corrija o erro acima e execute de novo.')+'</div>';
    status(L('Erro na consulta'));tutOnError(tr);return}
  var ms=(performance.now()-t0).toFixed(1),ult=todos[todos.length-1],vazio=!ult||!ult.values.length;save();
  tele('consulta',{sql:sql.slice(0,400),res:vazio?'vazio':'ok',linhas:vazio?0:ult.values.length,consultas:todos.length});
  var notas=[];
  if(todos.length>1)notas.push(L('O editor tem <b>{n} consultas</b>. Executei todas, mas o resultado abaixo é só da <b>última</b>: <code>{sql}</code>. Para rodar só uma, selecione o texto dela e clique em Executar, ou apague as outras.',{n:todos.length,sql:escH(ult.sql)}));
  if(vazio){
    grid.innerHTML='<div class="empty">'+L('A consulta rodou e não retornou nenhuma linha.')+'</div>';status(Lp(0,'1 linha','{n} linhas')+' · '+ms+' ms');
    var zh=zeroRowHint(ult?ult.sql:sql,SCHEMA);if(zh)notas.push(zh);
    notas.forEach(function(n){tele('dica_auto',{texto:semTags(n).slice(0,140)})});
    msg.innerHTML=notas.map(function(n){return '<div class="hint0">'+n+'</div>'}).join('');guiaNasMensagens(msg);
    checkSteps(null);tutOnRun(toR(null));return}
  status(Lp(ult.values.length,'1 linha','{n} linhas')+' · '+Lp(ult.columns.length,'1 coluna','{n} colunas')+' · '+ms+' ms');
  renderGrid(ult);
  notas.push(avisoSQL(sql,SCHEMA),checkSteps(ult));
  notas.filter(Boolean).forEach(function(n){tele('dica_auto',{texto:semTags(n).slice(0,140)})});
  msg.innerHTML=notas.filter(Boolean).map(function(n){return '<div class="hint0">'+n+'</div>'}).join('');guiaNasMensagens(msg);
  tutOnRun(toR(ult));
}
var ultimoResultado=null;   // para o 📌 (fixar linha no Caderno)
function renderGrid(res){
  var grid=$('#dbGrid'),max=300;ultimoResultado=res;
  var podeFixar=S.apps.indexOf('caderno')>=0,colavel=!tutActive();
  var html='<table><thead><tr><th class="rn">#</th>'+res.columns.map(function(c){return '<th>'+escH(c)+'</th>'}).join('')+'</tr></thead><tbody>';
  res.values.slice(0,max).forEach(function(row,i){
    html+='<tr><td class="rn">'+(podeFixar?'<button class="pin" data-i="'+i+'" title="'+escH(L('Fixar esta linha no Caderno'))+'" aria-label="'+escH(L('Fixar esta linha no Caderno'))+'">📌</button>':'')+(i+1)+'</td>'+row.map(function(v){
      if(v===null)return '<td class="null">NULL</td>';
      var s=numTela(v);if(/\.jpg$/i.test(s))return '<td><a data-foto="'+escH(s)+'">'+escH(s)+'</a></td>';
      return '<td'+(colavel?' class="colar" title="'+escH(L('Clique para copiar'))+'"':'')+'>'+escH(s)+'</td>'}).join('')+'</tr>'});
  html+='</tbody></table>';
  if(res.values.length>max)html+='<div class="empty">'+L('Mostrando {max} de {total} linhas. Use LIMIT ou WHERE para enxugar.',{max:max,total:res.values.length})+'</div>';
  grid.innerHTML=html;
  grid.querySelectorAll('a[data-foto]').forEach(function(a){a.onclick=function(){openPhoto(a.getAttribute('data-foto'))}});
  grid.querySelectorAll('.pin').forEach(function(b){b.onclick=function(){fixarLinha(res,+b.getAttribute('data-i'))}});
  // Clicar num valor copia (CPF, placa, conta: para colar no editor, no formulário do BO ou no Caderno) e mostra
  // um "Copiado" discreto na célula. Sem aspas: é o certo para o formulário; no SQL a pessoa põe. Playtest de 17/10.
  if(colavel)grid.querySelectorAll('td.colar').forEach(function(td){td.onclick=function(){
    var sel=window.getSelection&&String(window.getSelection());if(sel)return;
    var tr=td.parentNode,i=[].indexOf.call(tr.parentNode.children,tr),k=[].indexOf.call(tr.children,td)-1,v=res.values[i][k];
    copiarTexto(typeof v==='number'?numTela(v):String(v),function(ok){
      var tag=h('span',{class:'copiado-tag'+(ok?'':' falhou'),role:'status'},ok?'✓ '+L('Copiado'):L('Não deu para copiar'));
      var velho=td.querySelector('.copiado-tag');if(velho)velho.remove();td.appendChild(tag);setTimeout(function(){tag.remove()},1200)});
    tele('grid',{acao:'copiar'})}});
}

/* Autocompletar: faixa logo abaixo do editor com até 5 nomes que começam com o que a pessoa está digitando.
   Tab aceita o primeiro; clique aceita qualquer um; Esc esconde. Desligado no celular (teclado na tela). */
var sugestaoAtual=null;
function autocompletarLigado(){return window.innerWidth>760&&!(window.matchMedia&&window.matchMedia('(pointer:coarse)').matches)}
function esconderSugestoes(){sugestaoAtual=null;var b=$('#sugest');if(b){b.hidden=true;b.innerHTML=''}}
function mostrarSugestoes(){
  var ta=$('#sqlEd'),b=$('#sugest');if(!ta||!b)return;
  if(!autocompletarLigado()||ta.selectionStart!==ta.selectionEnd){esconderSugestoes();return}
  var s=sugerirSQL(ta.value.slice(0,ta.selectionStart),SCHEMA,ta.value);if(!s){esconderSugestoes();return}
  sugestaoAtual=s;b.innerHTML='<span class="muted">'+escH(L('Tab completa:'))+'</span>';
  s.opcoes.forEach(function(o,i){var bt=h('button',{class:i?'':'prim',tabindex:'-1'},escH(o));bt.onmousedown=function(e){e.preventDefault();aceitarSugestao(o)};b.appendChild(bt)});
  b.hidden=false;
}
function aceitarSugestao(o){
  var ta=$('#sqlEd'),s=sugestaoAtual;if(!s)return;var fim=ta.selectionStart;
  ta.setSelectionRange(fim-s.prefixo.length,fim);esconderSugestoes();editorDigitar(ta,o);tele('autocompletar');
}

// Copia para a área de transferência. O jeito moderno pode ser recusado (arquivo aberto do disco, permissão);
// aí tenta o jeito antigo, com um campo escondido. depois(ok) diz se deu certo.
function copiarTexto(txt,depois){
  var antigo=function(){var t=document.createElement('textarea');t.value=txt;t.setAttribute('readonly','');t.style.cssText='position:fixed;left:-9999px;top:0';
    document.body.appendChild(t);t.select();var ok=false;try{ok=document.execCommand('copy')}catch(e){}t.remove();depois(ok)};
  if(navigator.clipboard&&navigator.clipboard.writeText)navigator.clipboard.writeText(txt).then(function(){depois(true)},antigo);else antigo();
}
