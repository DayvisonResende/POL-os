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
  if(sql!=null){var ta=$('#sqlEd');ta.value=sql;S.editor=sql;syncHl();save();ta.focus()}
}
function buildDb(r){
  var b=r.body;if(tutActive())dictOpen=false;
  b.innerHTML='<div class="toolbar"><button class="tb-btn run" id="runBtn">&#9654; '+L('Executar')+' <span class="kbd">Ctrl+Enter</span></button><button class="tb-btn" id="clrBtn">'+L('Limpar')+'</button><button class="tb-btn" id="explBtn" title="'+escH(L('Traduz a consulta do editor para português'))+'">'+L('Explique esta consulta')+'</button><span style="flex:1"></span><button class="tb-btn" id="dictBtn" aria-pressed="'+dictOpen+'">'+L('Dicionário de Dados')+'</button></div>'+
   '<div class="dbwrap'+(tutActive()?' tut':'')+'">'+(tutActive()?'<div class="guide" id="guide" aria-live="polite"></div>':'')+'<div class="dbmain"><div class="ed"><pre aria-hidden="true" id="sqlHl"></pre><textarea id="sqlEd" spellcheck="false" aria-label="'+escH(L('Editor SQL'))+'" placeholder="'+escH(L('-- escreva sua consulta aqui. Ex.: SELECT * FROM veiculos;'))+'"></textarea></div><div class="status" id="dbStatus">'+L('Pronto. Perfil: {patente} (somente leitura).',{patente:escH(rankT())})+'</div><div id="dbExpl"></div><div id="dbMsg"></div><div class="grid" id="dbGrid"><div class="empty">'+L('O resultado da consulta aparece aqui. Clique em uma coluna no Dicionário de Dados para inserir o nome dela no editor.')+'</div></div></div><div class="dict" id="dict"'+(dictOpen?'':' hidden')+'></div></div>';
  var ta=$('#sqlEd',b);ta.value=S.editor||'';syncHl();
  ta.addEventListener('input',function(){S.editor=ta.value;syncHl();save()});
  ta.addEventListener('scroll',function(){$('#sqlHl').scrollTop=ta.scrollTop});
  ta.addEventListener('focus',function(){setTimeout(tutMarcarLacuna,0)});ta.addEventListener('click',tutMarcarLacuna);
  ta.addEventListener('keydown',function(e){
    if((e.ctrlKey||e.metaKey)&&e.key==='Enter'){e.preventDefault();runQuery()}
    else if(e.key==='Tab'&&!e.shiftKey){e.preventDefault();insertAt('  ')}
  });
  $('#runBtn',b).onclick=runQuery;
  $('#clrBtn',b).onclick=function(){if(tutEmMolde()){tutRestaurarMolde();return}ta.value='';S.editor='';syncHl();save();ta.focus()};
  $('#dictBtn',b).onclick=function(){dictOpen=!dictOpen;$('#dict').hidden=!dictOpen;this.setAttribute('aria-pressed',dictOpen)};
  $('#explBtn',b).onclick=showExplain;
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
  tutOnExplain();
}
function syncHl(){var ta=$('#sqlEd');if(!ta)return;$('#sqlHl').innerHTML=highlight(ta.value);$('#sqlHl').scrollTop=ta.scrollTop}
function insertAt(txt){var ta=$('#sqlEd');var s=ta.selectionStart,e=ta.selectionEnd;ta.value=ta.value.slice(0,s)+txt+ta.value.slice(e);ta.selectionStart=ta.selectionEnd=s+txt.length;S.editor=ta.value;syncHl();save();ta.focus()}
var COLNOTES={'veiculos.cor':'em minúsculas: preto, prata, branco…','veiculos.placa':'sem traço, ex.: ABC1D23','veiculos.cpf_proprietario':'aponta para pessoas.cpf','leituras_radar.data_hora':'AAAA-MM-DD HH:MM:SS','leituras_radar.placa':'aponta para veiculos.placa','leituras_radar.foto_radar_url':'clique no resultado para abrir','catraca_acessos.data':'AAAA-MM-DD'};
function renderDict(){
  var d=$('#dict');if(!d)return;d.innerHTML='<h4>'+L('Dicionário de Dados')+'</h4>';
  SCHEMA.tables.forEach(function(t,ti){
    var det=h('details');if(ti<2)det.open=true;
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
    msg.innerHTML='<div class="err">'+tr+'<span class="raw">SQLite: '+escH(e.message||e)+'</span></div>';
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
    msg.innerHTML=notas.map(function(n){return '<div class="hint0">'+n+'</div>'}).join('');
    checkSteps(null);tutOnRun(toR(null));return}
  status(Lp(ult.values.length,'1 linha','{n} linhas')+' · '+Lp(ult.columns.length,'1 coluna','{n} colunas')+' · '+ms+' ms');
  renderGrid(ult);
  notas.push(avisoSQL(sql,SCHEMA),checkSteps(ult));
  notas.filter(Boolean).forEach(function(n){tele('dica_auto',{texto:semTags(n).slice(0,140)})});
  msg.innerHTML=notas.filter(Boolean).map(function(n){return '<div class="hint0">'+n+'</div>'}).join('');
  tutOnRun(toR(ult));
}
var ultimoResultado=null;   // para o 📌 (fixar linha no Caderno)
function renderGrid(res){
  var grid=$('#dbGrid'),max=300;ultimoResultado=res;
  var podeFixar=S.apps.indexOf('caderno')>=0;
  var html='<table><thead><tr><th class="rn">#</th>'+res.columns.map(function(c){return '<th>'+escH(c)+'</th>'}).join('')+'</tr></thead><tbody>';
  res.values.slice(0,max).forEach(function(row,i){
    html+='<tr><td class="rn">'+(podeFixar?'<button class="pin" data-i="'+i+'" title="'+escH(L('Fixar esta linha no Caderno'))+'" aria-label="'+escH(L('Fixar esta linha no Caderno'))+'">📌</button>':'')+(i+1)+'</td>'+row.map(function(v){
      if(v===null)return '<td class="null">NULL</td>';
      var s=String(v);if(/\.jpg$/i.test(s))return '<td><a data-foto="'+escH(s)+'">'+escH(s)+'</a></td>';
      return '<td>'+escH(s)+'</td>'}).join('')+'</tr>'});
  html+='</tbody></table>';
  if(res.values.length>max)html+='<div class="empty">'+L('Mostrando {max} de {total} linhas. Use LIMIT ou WHERE para enxugar.',{max:max,total:res.values.length})+'</div>';
  grid.innerHTML=html;
  grid.querySelectorAll('a[data-foto]').forEach(function(a){a.onclick=function(){openPhoto(a.getAttribute('data-foto'))}});
  grid.querySelectorAll('.pin').forEach(function(b){b.onclick=function(){fixarLinha(res,+b.getAttribute('data-i'))}});
}
