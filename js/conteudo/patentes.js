/* Patentes. aoPromover roda quando o jogador fecha a tela de promoção. A recompensa é acesso no sistema, não pontos. */
var RANKS=[
 {t:'Recruta'},
 {t:'Estagiário do Arquivo',libera:['Chamados de verdade no SISP Ocorrências','Arquivos com consultas salvas e evidências'],
  celia:'Saiu tua promoção. Não sei como, mas saiu. Agora é ocorrência de verdade: furto no estacionamento do shopping, BO 2026/1002. Liberei teus Arquivos e deixei em Snippets um exemplo de filtro. Estuda antes de sair digitando.',
  aoPromover:function(){unlockApp('files','Arquivos');S.caseSel=indiceCaso('1002');save();unlockToast();renderOcorr();renderFiles()}},
 {t:'Investigador Júnior',libera:['Filtros, intervalos e ordenação em qualquer chamado','Próximo módulo: tabelas financeiras (em desenvolvimento)'],
  celia:'Investigador Júnior. Na minha época isso levava dois anos, você levou um dia. Não se acha, não.',
  aoPromover:function(){S.done=true;save();setTimeout(report,1500)}}
];
