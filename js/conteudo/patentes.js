/* Patentes. aoPromover roda quando o jogador fecha a tela de promoção. A recompensa é acesso no sistema, não pontos. */
var RANKS=[
 {t:'Recruta'},
 {t:'Estagiário do Arquivo',libera:['Chamados de verdade no SISP Ocorrências','Treinamento de filtros com a Célia','Arquivos com consultas salvas e evidências'],
  celia:'Saiu tua promoção. Não sei como, mas saiu. Agora é ocorrência de verdade: furto no estacionamento do shopping, BO 2026/1002. Mas antes de sair digitando, senta comigo no DB-Investigator, que eu vou te ensinar a filtrar. Liberei também teus Arquivos.',
  aoPromover:function(){unlockApp('files','Arquivos');S.caseSel=indiceCaso('1002');save();unlockToast();renderOcorr();renderFiles()}},
 {t:'Investigador Júnior',libera:['Filtros, intervalos e ordenação em qualquer chamado','Próximo módulo: tabelas financeiras (em desenvolvimento)'],
  celia:'Investigador Júnior. Na minha época isso levava dois anos, você levou um dia. Não se acha, não.',
  aoPromover:function(){S.done=true;save();setTimeout(report,1500);
   // Gancho do fim do Ato I (docs/historia.md): o dono da caminhonete não é o motorista.
   setTimeout(function(){say('jairo','Prenderam o tal Valdemar. 66 anos, de chinelo, em Piedade. Jura que nunca dirigiu uma Hilux na vida. E a caminhonete? Sumiu.')},6000);
   setTimeout(function(){say('celia','Amanhã às 8. E traz café.')},9500)}}
];
