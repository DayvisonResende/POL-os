/* ---------- Arquivos ---------- */
var filesDir='Snippets';
function openFiles(){openWin('files',{title:'Arquivos',w:540,h:360,x:160,y:120,build:function(){renderFiles()},refresh:function(){renderFiles()}})}
function renderFiles(){
  var r=WINS.files;if(!r)return;r.body.innerHTML='';
  var wrap=h('div',{class:'files'}),tree=h('div',{class:'tree'});
  ['Snippets','Evidências'].forEach(function(d){var b=h('button',{class:d===filesDir?'sel':''},'&#128193; '+d);b.onclick=function(){filesDir=d;renderFiles()};tree.appendChild(b)});
  var right=h('div',{style:'flex:1;min-width:0;display:flex;flex-direction:column'});
  right.appendChild(h('div',{class:'path'},'C:\\DTI04\\'+filesDir+'\\'));
  var fl=h('div',{class:'flist'});var vis=FILES.filter(function(f){return f.dir===filesDir&&caseUnlocked(indiceCaso(f.caso))});
  if(!vis.length)fl.appendChild(h('div',{class:'empty'},'Pasta vazia. Arquivos novos chegam com os chamados.'));
  vis.forEach(function(f){var b=h('button',{class:'file',title:'Abrir '+f.name},ICONS[f.kind]+'<span>'+f.name+'</span>');b.ondblclick=function(){openFile(f)};b.onkeydown=function(e){if(e.key==='Enter')openFile(f)};
    b.onclick=function(){if(window.matchMedia('(pointer:coarse)').matches)openFile(f)};fl.appendChild(b)});
  fl.appendChild(h('div',{class:'muted',style:'grid-column:1/-1;font-size:12.5px;padding:4px'},'Dois cliques para abrir. Arquivos .sql abrem no DB-Investigator.'));
  right.appendChild(fl);wrap.appendChild(tree);wrap.appendChild(right);r.body.appendChild(wrap);
}
function openFile(f){
  if(f.kind==='sql'){openDb(f.body);return}
  if(f.kind==='jpg'){openPhoto(f.name);return}
  openWin('tx_'+f.name,{title:f.name+' — Bloco de Notas',w:520,h:360,build:function(r){r.body.appendChild(h('pre',{class:'txtview'},escH(f.body)))}});
}
