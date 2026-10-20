/* ---------- boot ---------- */
function startDesktop(resumed){
  teleSessao(resumed);
  $('#boot').hidden=true;renderIcons();buildStart();meters();
  $('#startBtn').onclick=function(e){e.stopPropagation();toggleStart()};
  document.addEventListener('click',function(e){if(!e.target.closest('#startMenu'))toggleStart(false)});
  document.addEventListener('keydown',function(e){if(e.key==='Escape'&&!$('#startMenu').hidden){toggleStart(false);$('#startBtn').focus()}});
  if(diaNovoPendente())abrirEmailDoDia(function(){if(!verificarTreinos())openOcorr()});
  else if(verificarTreinos()){}
  else if(tutActive()){openDb();if(S.tutEntrou!==tutChavePasso())tutEnter()}
  else{openOcorr();if(S.closed.indexOf('1002')>=0&&S.beto==='none')setTimeout(startBeto,15000)}
  verificarPedidos();agendarServico();
  if(treinoPausado())setTimeout(function(){toast(L('Treinamento pausado'),L('Quando quiser voltar: DB-Investigator › Voltar ao treinamento.'),'warn',function(){openDb()})},1500);
  if(provaMod()&&S.apps.indexOf('prova')<0){S.apps.push('prova');save();renderIcons();buildStart()}
}
(function boot(){
  aplicarI18nHTML();
  var resumed=load();
  $('#loginForm').addEventListener('submit',function(e){e.preventDefault();if(precisaPerguntar())mostrarTermo(function(){startDesktop(resumed)});else startDesktop(resumed)});
  var t0=performance.now();
  if(typeof initSqlJs!=='function'){$('#bootStatus').textContent=L('Não consegui carregar o motor SQL (sql.js). Verifique a conexão e recarregue.');return}
  initSqlJs().then(function(lib){
    iniciarBanco(lib);window.MS_BANCO=Math.round(performance.now()-t0);
    $('#bootStatus').textContent=!resumed?L('Base carregada: {n} veículos no cadastro.',{n:F.nVeic}):S.dia>0?L('Base carregada. Expediente de {dia}.',{dia:diaAtual().nome}):L('Base carregada. Expediente anterior encontrado: seu progresso foi mantido.');
    var b=$('#lgBtn');b.disabled=false;b.focus();
  }).catch(function(err){$('#bootStatus').textContent=L('Erro ao iniciar o banco: {erro}',{erro:err})})
})();
