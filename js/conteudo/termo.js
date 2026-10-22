/* Termos de uso e privacidade do Pol-OS. Aparece no primeiro login (e de novo quando TERMO_VERSAO aumenta).
   Duas partes: (1) os termos do jogo, que todo jogador aceita para jogar (simulação, ensino de SQL, ficção,
   sem relação com a polícia); (2) a coleta de dados de uso, que é OPCIONAL (LGPD: consentimento livre;
   o jogo funciona igual nas duas escolhas). Não citar o nome do fornecedor do banco de dados.
   Mudou algo importante? Aumente TERMO_VERSAO: todo mundo é perguntado de novo. */
var TERMO_VERSAO=3, TERMO_DATA='19/10/2026';   // v3: relatos de problemas ao Cláudio, do TI (seção 11)

function termoResumoHTML(){return ''+
 '<p>'+L('Antes de começar, o que você precisa saber:')+'</p>'+
 '<ul class="termo-pontos">'+
  '<li>'+L('O Pol-OS é um <b>jogo de simulação</b> feito para <b>ensinar SQL</b>.')+'</li>'+
  '<li>'+L('É uma <b>obra de ficção</b>: a história, os personagens, os casos, os nomes, as placas e os CPFs são inventados.')+'</li>'+
  '<li>'+L('O jogo <b>não tem nenhuma relação com a polícia</b> nem com qualquer órgão público.')+'</li>'+
 '</ul>'+
 '<p>'+L('<b>Problemas e sugestões:</b> se você mandar um problema ou uma sugestão ao <b>Cláudio, do TI</b>, o texto que você escrever vai para a equipe do jogo, junto com informações técnicas, e <b>só depois que você confirmar</b>.')+'</p>'+
 '<p>'+L('<b>Dados de uso (opcional):</b> para melhorar o jogo, você pode permitir o envio <b>anônimo</b> de como você joga (onde trava, quanto tempo leva, as consultas que executa). Seu nome, e-mail ou qualquer dado pessoal <b>nunca é enviado</b>. O jogo funciona igual nas duas escolhas, e você muda de ideia quando quiser em <b>SISP › Configurações</b>.')+'</p>'}

function termoCompletoHTML(){var c=TELEMETRIA_REMOTA.contato,contato=c?'<b>'+escH(c)+'</b>':L('o contato informado na página do jogo');return ''+
 '<h4>'+L('Termos de Uso e Política de Privacidade do Pol-OS')+'</h4>'+
 '<p class="muted">'+L('Versão {v}, de {data}.',{v:TERMO_VERSAO,data:TERMO_DATA})+'</p>'+

 '<h5>'+L('1. Aceitação')+'</h5>'+
 '<p>'+L('Ao jogar o Pol-OS, você declara que leu e concorda com estes termos. Se não concordar, não utilize o jogo. A coleta de dados de uso (seção 10) é uma escolha à parte: você pode concordar com os termos e recusar a coleta.')+'</p>'+

 '<h5>'+L('2. O que é o Pol-OS')+'</h5>'+
 '<p>'+L('O Pol-OS é um <b>jogo eletrônico de simulação</b>, gratuito e em desenvolvimento, que roda no navegador. O jogador faz o papel de um recruta num departamento de investigação fictício e resolve casos escrevendo consultas em SQL num banco de dados também fictício.')+'</p>'+

 '<h5>'+L('3. Finalidade educativa')+'</h5>'+
 '<p>'+L('O objetivo do jogo é <b>ensinar a linguagem SQL</b> de forma prática. O jogo não é um curso oficial, não substitui formação reconhecida pelo Ministério da Educação e não confere diploma, certificação profissional nem garantia de emprego. Eventuais certificados do jogo atestam apenas a conclusão de etapas do próprio jogo.')+'</p>'+

 '<h5>'+L('4. Sem relação com a polícia ou órgãos públicos')+'</h5>'+
 '<p>'+L('O Pol-OS é um projeto independente. <b>Não tem nenhuma relação</b> com a Polícia Civil, a Polícia Militar, a Polícia Federal, secretarias de segurança pública, academias de polícia, corregedorias, tribunais, o Ministério Público, o COAF, bancos ou qualquer outro órgão ou empresa, públicos ou privados, e não é patrocinado, aprovado nem endossado por nenhum deles.')+'</p>'+
 '<p>'+L('Nomes de cargos, departamentos, sistemas e documentos (como "DTI", "ACADEPOL", "Corregedoria", "boletim de ocorrência" ou "mandado") são usados apenas como ambientação da história. O jogo <b>não reproduz procedimentos policiais reais</b>, não serve como treinamento policial e não deve ser usado como referência sobre o trabalho da polícia. O distintivo e a logomarca do jogo são criações próprias e não são símbolos oficiais.')+'</p>'+

 '<h5>'+L('5. Obra de ficção')+'</h5>'+
 '<p>'+L('O Pol-OS é uma <b>obra de ficção</b>. A história, os personagens, os diálogos, os crimes, os casos, as empresas, as contas bancárias, os telefones, as placas de veículos e os CPFs são <b>inventados</b>. Qualquer semelhança com pessoas, fatos ou dados reais é mera coincidência.')+'</p>'+
 '<p>'+L('Os nomes, placas e CPFs do banco de dados do jogo foram gerados por computador e não pertencem a ninguém. Não os utilize fora do jogo. Cidades e rodovias reais aparecem apenas como cenário.')+'</p>'+

 '<h5>'+L('6. Conteúdo')+'</h5>'+
 '<p>'+L('A história retrata crimes como furto, roubo de carga, lavagem de dinheiro e corrupção, sem violência explícita e sem palavrões, com a intenção de servir também a escolas. Retratar um crime não é incentivá-lo: no jogo, as escolhas desonestas têm consequências.')+'</p>'+

 '<h5>'+L('7. Propriedade intelectual')+'</h5>'+
 '<p>'+L('Os textos, a história, os personagens, as imagens e o código do Pol-OS pertencem ao seu autor, salvo indicação em contrário. Você pode jogar e indicar o jogo livremente; copiar, vender ou distribuir o jogo ou partes dele depende de autorização.')+'</p>'+

 '<h5>'+L('8. Seu progresso')+'</h5>'+
 '<p>'+L('O progresso fica guardado <b>no seu navegador</b>, neste aparelho, e não é enviado para lugar nenhum. Ele pode se perder se você limpar os dados do navegador, usar uma janela anônima ou trocar de aparelho. Para não perder, use <b>SISP › Configurações › Salvar progresso em arquivo</b>.')+'</p>'+

 '<h5>'+L('9. Sem garantias')+'</h5>'+
 '<p>'+L('O jogo é oferecido gratuitamente, "no estado em que se encontra", e pode ter erros, mudar ou sair do ar sem aviso. Dentro do que a lei permite, o autor não se responsabiliza por perdas decorrentes do uso do jogo, como progresso perdido.')+'</p>'+

 '<h5>'+L('10. Coleta de dados de uso (opcional)')+'</h5>'+
 '<p>'+L('<b>Só acontece se você aceitar.</b> Recusar não muda nada no jogo.')+'</p>'+
 '<p><b>'+L('Quem é o responsável:')+'</b> '+L('o autor do Pol-OS, pelo e-mail {contato}.',{contato:contato})+'</p>'+
 '<p><b>'+L('O que é coletado:')+'</b></p><ul>'+
  '<li>'+L('Eventos do jogo: passos do treinamento, casos, provas, dicas pedidas, mensagens de erro, tempo em cada parte e escolhas feitas (por exemplo, nas conversas com os personagens).')+'</li>'+
  '<li>'+L('As consultas SQL que você executa no jogo (até 400 caracteres cada), sempre sobre o banco fictício do jogo.')+'</li>'+
  '<li>'+L('Informações técnicas: tipo de aparelho, família do navegador e do sistema, idioma, faixa de tamanho da tela, erros técnicos do jogo e versão do jogo.')+'</li>'+
  '<li>'+L('Um código aleatório criado neste navegador e um código para cada vez que o jogo é aberto.')+'</li></ul>'+
 '<p><b>'+L('O que nunca é coletado:')+'</b> '+L('nome, e-mail, telefone, endereço, localização, fotos, contatos, o usuário e a senha da tela de entrada do jogo, o nome digitado em certificados ou qualquer informação de fora do jogo. O código aleatório não permite descobrir quem você é.')+'</p>'+
 '<p><b>'+L('Para quê:')+'</b> '+L('somente para melhorar o jogo: entender onde as pessoas travam, quanto tempo cada parte leva, quais explicações ajudam e quais erros técnicos acontecem. Resultados gerais, sem nenhum código individual (por exemplo, "metade dos jogadores termina o primeiro módulo em 15 minutos"), podem ser divulgados. Os dados não são vendidos, não são usados para publicidade e não são compartilhados com terceiros.')+'</p>'+
 '<p><b>'+L('Base legal:')+'</b> '+L('o seu consentimento (Lei Geral de Proteção de Dados, Lei 13.709/2018, art. 7º, I), que pode ser retirado a qualquer momento.')+'</p>'+
 '<p><b>'+L('Onde ficam e por quanto tempo:')+'</b> '+L('num banco de dados na nuvem, contratado de um fornecedor de serviços, com acesso restrito ao responsável. Ficam guardados enquanto forem úteis para melhorar o jogo, por no máximo 5 anos, e depois são apagados.')+'</p>'+
 '<p><b>'+L('Seus direitos:')+'</b> '+L('parar o envio a qualquer momento em SISP › Configurações › Privacidade; pedir uma cópia ou a exclusão dos dados já enviados, informando o seu código anônimo (aparece na mesma tela) para {contato}.',{contato:contato})+'</p>'+

 '<h5>'+L('11. Problemas e sugestões (Cláudio, do TI)')+'</h5>'+
 '<p>'+L('No jogo, o personagem <b>Cláudio, do TI</b> recebe relatos de problemas e sugestões de melhoria. Apesar de ele ser fictício, <b>o relato é real</b>: o texto que você escrever é enviado ao responsável pelo jogo (seção 10), para corrigir erros e melhorar o jogo.')+'</p>'+
 '<p>'+L('Junto com o texto vão: onde você estava no jogo, o dia e a patente no jogo, a última consulta SQL que você executou e a mensagem de erro dela, o último erro técnico do jogo, as janelas abertas, as mesmas informações técnicas do aparelho da seção 10, a versão do jogo e o seu código anônimo. Antes de enviar, o jogo mostra tudo isso e só envia se você confirmar.')+'</p>'+
 '<p>'+L('O relato é enviado mesmo que você tenha recusado a coleta de dados de uso, porque cada envio é uma escolha sua, feita na hora. <b>Não escreva no relato</b> nome, e-mail, telefone, senha ou qualquer dado pessoal seu ou de outra pessoa. Os relatos seguem as mesmas regras de guarda, prazo e direitos da seção 10 (para pedir a exclusão, informe o seu código anônimo ou o número do chamado).')+'</p>'+

 '<h5>'+L('12. Menores de idade')+'</h5>'+
 '<p>'+L('Se você tem menos de 18 anos, leia estes termos com o seu responsável. Menores de 12 anos só devem aceitar a coleta de dados com a autorização do responsável.')+'</p>'+

 '<h5>'+L('13. Mudanças nestes termos')+'</h5>'+
 '<p>'+L('Se estes termos mudarem de forma importante, o jogo mostra a nova versão e pergunta de novo antes de continuar.')+'</p>'+

 '<h5>'+L('14. Lei aplicável e contato')+'</h5>'+
 '<p>'+L('Estes termos seguem a legislação brasileira. Dúvidas, pedidos ou reclamações: {contato}.',{contato:contato})+'</p>'}
