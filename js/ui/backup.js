/* Backup do progresso em arquivo. O progresso normal fica no localStorage, que some se o navegador limpar
   os dados, em aba anônima ou ao trocar de computador. Com o arquivo, o jogador continua de onde parou. */
var BACKUP_JOGO='sisp';
function hojeArquivo(){return new Date().toISOString().slice(0,16).replace(/[:T]/g,'-')}
function exportarProgresso(){
  save();
  var dados={jogo:BACKUP_JOGO,formato:SAVE_KEY,salvoEm:new Date().toISOString(),patente:rankT(),encerrados:S.closed.length,estado:S};
  baixarArquivo(JSON.stringify(dados,null,1),'sisp-progresso-'+hojeArquivo()+'.json','application/json');
  tele('backup',{acao:'exportar'});
  toast('Progresso salvo em arquivo','Guarde o arquivo. Com ele você continua de onde parou, em qualquer navegador: menu SISP › Carregar progresso.','ok');
}
function importarProgresso(){
  var inp=h('input',{type:'file',accept:'.json,application/json',style:'display:none'});
  inp.onchange=function(){var f=inp.files[0];inp.remove();if(f)f.text().then(lerBackup)};
  document.body.appendChild(inp);inp.click();
}
function lerBackup(txt){
  var d;try{d=JSON.parse(txt)}catch(e){d=null}
  if(!d||d.jogo!==BACKUP_JOGO||!d.estado||!d.estado.chat)return avisoBackup('Esse arquivo não é um progresso salvo do SISP. Escolha o arquivo sisp-progresso-….json que o jogo baixou.');
  if(d.formato!==SAVE_KEY)return avisoBackup('Esse progresso é de uma versão do jogo que não é mais compatível com esta.');
  var quando=new Date(d.salvoEm);
  confirmar('Carregar progresso salvo?',
    '<p>Arquivo salvo em <b>'+escH(isNaN(quando)?'data desconhecida':quando.toLocaleString('pt-BR'))+'</b>: '+escH(d.patente||'')+', '+(d.encerrados||0)+' chamado(s) encerrado(s).</p><p>O progresso atual neste navegador será <b>substituído</b>.</p>',
    [['Carregar este progresso',function(){try{localStorage.setItem(SAVE_KEY,JSON.stringify(d.estado))}catch(e){}tele('backup',{acao:'importar'});location.reload()},'btn-primary'],
     ['Cancelar',null,'tb-btn']]);
}
function avisoBackup(msg){toast('Não deu para carregar',escH(msg),'bad')}
// Reiniciar apaga tudo: pergunta antes e oferece salvar um backup.
function pedirReinicio(){
  confirmar('Reiniciar o turno?','<p>Isso <b>apaga todo o progresso</b> neste navegador: chamados, patente, treinamentos e conversas. Não tem como desfazer.</p>',
    [['Salvar progresso e reiniciar',function(){exportarProgresso();setTimeout(resetAll,600)},'btn-primary'],
     ['Reiniciar sem salvar',resetAll,'tb-btn'],
     ['Cancelar',null,'tb-btn']]);
}
// Caixa de confirmação do Pol-OS (artifact não permite confirm()). botoes: [[rótulo, ação ou null, classe]]
function confirmar(titulo,html,botoes){
  var ov=h('div',{class:'overlay'}),box=h('div',{class:'report',role:'dialog','aria-label':titulo});
  box.innerHTML='<header><h2>'+escH(titulo)+'</h2></header><div class="rb">'+html+'<div class="gact conf"></div></div>';
  var act=box.querySelector('.conf');
  botoes.forEach(function(b){var bt=h('button',{class:b[2]},escH(b[0]));bt.onclick=function(){ov.remove();if(b[1])b[1]()};act.appendChild(bt)});
  ov.appendChild(box);$('#app').appendChild(ov);act.firstChild.focus();
}
