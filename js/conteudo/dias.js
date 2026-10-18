/* Dias de expediente: cada módulo é um dia (docs/historia.md, seção 4). O jogador encerra o expediente pelo
   Relatório do turno e começa o dia seguinte com login e o e-mail da manhã.
   resumo: texto do relatório quando o dia termina. proximo: aparece se o dia seguinte ainda não existe no jogo. */
var DIAS=[
 {rotulo:L('ter 13/10'),nome:L('terça-feira, 13/10/2026'),
  resumo:L('Promovido a Investigador Júnior. Você concluiu os Módulos 1 e 2: SELECT, colunas, DISTINCT, LIMIT, AS, WHERE, AND, LIKE, BETWEEN, IN e ORDER BY.')},
 {rotulo:L('qua 14/10'),nome:L('quarta-feira, 14/10/2026'),
  chegada:L('Quarta-feira. 07:58. Você chega com dois cafés: um é pra Célia. Ela aceita sem dizer obrigado.'),
  email:{de:L('Delegado Paulo Henrique Dias'),assunto:L('Operação Véio: acesso provisório às contas'),
   corpo:L('<p>Bom dia.</p><p>O Valdemar Silveira foi ouvido ontem à noite. 66 anos, aposentado, nunca dirigiu uma Hilux na vida: o nome dele foi usado. A caminhonete continua desaparecida.</p><p>A investigação passa a se chamar <b>Operação Véio</b>.</p><p>A carga da Transportadora Central foi avaliada em R$ 380 mil. Eletrônico vira dinheiro rápido, e dinheiro sujo precisa ser lavado. A partir de hoje seu perfil tem <b>acesso provisório</b> às tabelas <code>contas_bancarias</code> e <code>transferencias</code>. Use com responsabilidade: tudo fica registrado.</p><p>A Célia vai te preparar antes. Siga o dinheiro.</p><p>— Paulo Henrique Dias, Delegado de Polícia</p>')},
  resumo:L('Promovido a Inspetor Analítico. Você concluiu o Módulo 3: COUNT, SUM, AVG, MIN, MAX, GROUP BY, HAVING e NULL. Seguiu o dinheiro da carga até a Denise e descobriu os laranjas.'),
  proximo:L('Quinta-feira (Módulo 4: cruzamento de tabelas com JOIN) ainda está em desenvolvimento.')},
 {rotulo:L('qui 15/10'),nome:L('quinta-feira, 15/10/2026'),
  chegada:L('Quinta-feira. 07:51. "Até sexta", dizia a escuta. A Célia já está na mesa, com o mapa da Raposo Tavares aberto e o café frio do lado.'),
  email:{de:L('Delegado Paulo Henrique Dias'),assunto:L('Operação Véio: cruzamento de bases'),
   corpo:L('<p>Bom dia.</p><p>A Hilux continua sumida, e a escuta falava em sumir com a carga "até sexta". Temos até amanhã.</p><p>A partir de hoje seu perfil tem <b>acesso provisório</b> a quatro bases novas: <code>empresas</code> (Junta Comercial), <code>imoveis</code> (cartórios), <code>notas_fiscais</code> e <code>itens_nota</code> (Receita). Sozinhas, elas não dizem nada. <b>Cruzadas</b>, dizem tudo.</p><p>O Dicionário de Dados agora tem um <b>Mapa das tabelas</b>, que mostra como cada base se liga às outras. A Célia vai te preparar antes.</p><p>— Paulo Henrique Dias, Delegado de Polícia</p>')},
  resumo:L('Promovido a Agente Especial. Você concluiu o Módulo 4: JOIN, ON, apelidos, JOIN de várias tabelas, LEFT JOIN, "quem não tem" e a soma que infla. Achou o galpão, e alguém avisou o bando antes da operação.'),
  proximo:L('Sexta-feira (Módulo 5: alterar dados com segurança) ainda está em desenvolvimento.')}
];
