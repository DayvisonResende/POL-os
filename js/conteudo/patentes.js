/* Patentes. aoPromover roda quando o jogador fecha a tela de promoção. A recompensa é acesso no sistema, não pontos. */
var RANKS=[
 {t:'Recruta'},
 {t:'Estagiário do Arquivo',libera:['Chamados de verdade no SISP Ocorrências','Treinamento de filtros com a Célia','Arquivos com consultas salvas e evidências'],
  celia:'Saiu tua promoção. Não sei como, mas saiu. Agora é ocorrência de verdade: furto no estacionamento do shopping, BO 2026/1002. Mas antes de sair digitando, senta comigo no DB-Investigator, que eu vou te ensinar a filtrar. Liberei também teus Arquivos.',
  aoPromover:function(){unlockApp('files','Arquivos');S.caseSel=indiceCaso('1002');save();unlockToast();renderOcorr();renderFiles()}},
 {t:'Investigador Júnior',libera:['Filtros, intervalos e ordenação em qualquer chamado','Amanhã: acesso às contas bancárias da Operação'],
  celia:'Investigador Júnior. Na minha época isso levava dois anos, você levou um dia. Não se acha, não.',
  aoPromover:function(){concluirDia();setTimeout(report,1500);
   // Gancho do fim do Ato I (docs/historia.md): o dono da caminhonete não é o motorista.
   setTimeout(function(){say('jairo','Prenderam o tal Valdemar. 66 anos, de chinelo, em Piedade. Jura que nunca dirigiu uma Hilux na vida. E a caminhonete? Sumiu.')},6000);
   setTimeout(function(){say('celia','Amanhã às 8. E traz café.')},9500)}},
 {t:L('Inspetor Analítico'),libera:[L('Tabelas financeiras em definitivo'),L('Amanhã: cruzamento de bases (JOIN)')],
  celia:L('Inspetor Analítico. Seguiu o dinheiro, achou a Denise e os velhinhos. Na minha época isso era trabalho de uma semana. Agora vai pra casa, que amanhã é quinta.'),
  aoPromover:function(){concluirDia();setTimeout(report,1500);
   // Gancho do fim do Ato II (docs/historia.md): o prazo da escuta e a pergunta do segundo radar.
   setTimeout(function(){say('jairo',L('Recruta, amanhã é quinta. "Some com ela até sexta", lembra da escuta? A Hilux continua sumida, e a carga com ela.'))},6000);
   setTimeout(function(){say('celia',L('Uma pergunta pra você pensar no caminho de casa: o radar viu aquela caminhonete uma vez só? Amanhã às 8.'))},10500)}},
 {t:L('Agente Especial'),libera:[L('Cruzamento de bases (JOIN) em definitivo'),L('Amanhã: acesso de escrita no banco, com supervisão')],
  celia:L('Agente Especial. Cinco tabelas numa consulta e um mandado deferido. Na minha época isso era trabalho de força-tarefa. Vai pra casa; o resto da noite é com o Jairo.'),
  aoPromover:function(){concluirDia();setTimeout(report,1500);
   // Gancho do fim do Ato III (docs/historia.md): o galpão vazio. Alguém avisou, e o jogador está na lista.
   setTimeout(function(){S.clock=23*60+10;save();say('jairo',L('Chegamos. Galpão vazio. Café ainda quente na garrafa. Saíram faz uma hora, no máximo. Alguém avisou.'))},6500);
   setTimeout(function(){say('celia',L('Só cinco pessoas sabiam dessa operação. Eu, você, o delegado, o Jairo e a perícia. Vai dormir. Amanhã a gente conversa.'))},12500)}}
];
