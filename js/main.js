/* ---------- boot ---------- */
function startDesktop(resumed){
  teleSessao(resumed);
  $('#boot').hidden=true;renderIcons();buildStart();meters();
  $('#startBtn').onclick=function(e){e.stopPropagation();toggleStart()};
  document.addEventListener('click',function(e){if(!e.target.closest('#startMenu'))toggleStart(false)});
  document.addEventListener('keydown',function(e){if(e.key==='Escape'&&!$('#startMenu').hidden){toggleStart(false);$('#startBtn').focus()}});
  if(verificarTreinos()){}
  else if(tutActive()){openDb();if(S.tutEntrou!==tutChavePasso())tutEnter()}
  else{openOcorr();if(S.closed.indexOf('1002')>=0&&S.beto==='none')setTimeout(startBeto,15000)}
  if(provaMod()&&S.apps.indexOf('prova')<0){S.apps.push('prova');save();renderIcons();buildStart()}
}
(function boot(){
  var resumed=load();
  $('#loginForm').addEventListener('submit',function(e){e.preventDefault();startDesktop(resumed)});
  if(typeof initSqlJs!=='function'){$('#bootStatus').textContent='Não consegui carregar o motor SQL (sql.js). Verifique a conexão e recarregue.';return}
  initSqlJs().then(function(lib){
    iniciarBanco(lib);
    $('#bootStatus').textContent=resumed?'Base carregada. Expediente anterior encontrado: seu progresso foi mantido.':'Base carregada: '+F.nVeic+' veículos no cadastro.';
    var b=$('#lgBtn');b.disabled=false;b.focus();
  }).catch(function(err){$('#bootStatus').textContent='Erro ao iniciar o banco: '+err})
})();
