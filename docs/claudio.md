# Cláudio Prates, do TI: problemas e sugestões

O Cláudio é o personagem que **recebe os relatos de problemas e as sugestões de melhoria do jogo**. Ele é fictício, mas o relato é real: o texto que o jogador escreve chega ao responsável pelo jogo, numa tabela do Supabase, para ser corrigido.

| | |
|---|---|
| Nome no jogo | Cláudio Prates · Suporte de TI · ramal 2210 |
| Onde aparece | PolíciaZap, desde o começo do jogo, e **SISP › Falar com o TI (problemas e sugestões)** |
| Código | `js/apps/suporte.js` (contato em `js/conteudo/personagens.js`) |
| Tabela no Supabase | `relatos` (criada com `supabase/relatos.sql`) |
| Para ler os relatos | `npm run bugs` |

---

## 1. O que o jogador vê

### Primeira conversa
Na primeira vez que o jogador abre a conversa, o Cláudio se apresenta:

> Cláudio, do TI. Antes que você pergunte: não, eu não conserto impressora de casa.

> Achou algo esquisito no sistema? Tela travada, botão que não faz nada, resposta certa que o sistema diz que está errada, texto que não dá para entender? Me conta aqui embaixo o que aconteceu e o que você esperava que acontecesse.

Logo abaixo vem um aviso **fora da história**, em cinza: o texto vai de verdade para a equipe do jogo, junto com informações técnicas, e não se deve escrever nome, e-mail, telefone ou senha. Dúvida de SQL fica com a Célia e o Guia SQL.

Na mesma apresentação ele avisa: *"E se tiver ideia para melhorar o sistema, também serve: escolhe **Sugestão** antes de escrever."* Quem já tinha conversado com ele antes das sugestões existirem recebe, uma vez, a mensagem *"Novidade: agora eu também anoto sugestão…"*.

### Problema ou sugestão
Acima da caixa de texto há dois botões: **Problema** (o padrão) e **Sugestão**. A escolha muda o texto de ajuda da caixa, a tela de revisão e a resposta do Cláudio. Depois de cada envio, volta para Problema. O aviso de erro técnico do jogo abre sempre em Problema.

### Escrever e revisar
1. O jogador escolhe o tipo e escreve na caixa de texto (até 1000 caracteres, com contador).
2. Clica em **Revisar e enviar**.
3. Abre uma tela de revisão com o texto e **tudo o que vai junto** (seção 2), e o código anônimo do jogador.
4. **Enviar** manda o relato. **Voltar e editar** não manda nada, e o rascunho continua na caixa.

### A resposta do Cláudio
| Situação | O que ele diz |
|---|---|
| Sugestão enviada | "Sugestão #B7Q2 anotada e encaminhada para a equipe. Se virar realidade, pode dizer que foi ideia sua." |
| Problema enviado | "Chamado #C53B aberto. Já está na fila da equipe, valeu por avisar! Lembrou de mais alguma coisa? Manda outro." |
| Sem internet, ou tabela ainda não criada | "Opa, a rede daqui caiu. Guardei o chamado #C53B e mando sozinho assim que voltar." |
| Jogo sem Supabase configurado | "Anotei o chamado, mas o sistema de chamados está fora do ar nesta versão do jogo…" |
| Texto curto demais (menos de 10 caracteres) | Pede mais detalhes; nem abre a revisão |
| 5 relatos no mesmo dia | "Hoje já são 5 chamados seus. Anota o resto e me manda amanhã, combinado?" |

O **número do chamado** (4 letras e números, como `C53B`) é o que liga a conversa ao relato no Supabase. Se um jogador falar com você sobre um problema, peça esse número.

### Quando o jogo dá erro
Se acontecer um **erro técnico do próprio jogo** (erro de JavaScript), o Cláudio manda um aviso discreto, **uma vez por sessão**: "Vi um erro aqui no sistema. Se alguma coisa parou de funcionar, me conta o que você estava fazendo." Clicar no aviso abre a conversa.

Erro de SQL do jogador **não** chama o Cláudio. Quem está aprendendo erra SQL o tempo todo, e isso não é bug.

---

## 2. O que é enviado

| Campo | O que é |
|---|---|
| `chamado` | número do chamado mostrado ao jogador |
| `jogador` | código anônimo do navegador (o mesmo da telemetria) |
| `versao` | versão do jogo (`VERSAO_JOGO` em `js/config.js`) |
| `texto` | o que o jogador escreveu |
| `contexto` | o resto, montado pelo jogo (abaixo) |

Dentro de `contexto`:
- **tipo**: `bug` (problema) ou `sugestao`. Fica dentro do contexto para a tabela não precisar mudar; relatos de antes das sugestões não têm tipo e contam como problema;
- **onde** o jogador estava (treino e passo, ou BO aberto), dia, patente e casos fechados;
- **treino**: módulo, passo e se estava pausado;
- **última consulta** SQL, com o resultado e a mensagem de erro;
- **último erro técnico** do jogo **nesta sessão** (mensagem, arquivo, linha, horário);
- **janelas abertas**;
- **aparelho** em categorias amplas (celular/notebook, sistema, navegador, largura da tela, toque) e idioma;
- código da sessão e horário do envio.

**Nunca vai:** login, senha, o e-mail de contato, o nome do certificado ou qualquer dado de fora do jogo. Há teste automático para isso.

---

## 3. Regras e privacidade

- **Só sai com a confirmação do jogador.** Nada é enviado sem passar pela tela de revisão.
- **Vai mesmo para quem recusou a telemetria.** Cada envio é uma escolha feita na hora, com aviso; isso está no termo de uso.
- **Termo de uso, versão 3** (19/10/2026): seção 11, "Relatos de problemas (Cláudio, do TI)", e uma linha no resumo inicial.
- **Limites:** de 10 a 1000 caracteres; até 5 relatos por dia em cada navegador, somando problemas e sugestões.
- **Fila:** sem internet, o relato fica guardado no navegador (`sisp-relatos-fila`, até 20) e é reenviado a cada minuto. Se a tabela ainda não existir ou a chave estiver errada, também espera na fila. Se o servidor recusar o relato por dado inválido, ele é descartado para não travar a fila.
- **Segurança no servidor:** com a chave pública, o jogo só consegue **inserir** relatos, sempre com status "novo". Ler, mudar e apagar exige a chave secreta do `.env`.
- **Pedido de exclusão (LGPD):** pelo código anônimo ou pelo número do chamado:
  ```sql
  delete from public.relatos where jogador = 'CODIGO-INFORMADO';
  delete from public.relatos where chamado = 'C53B';
  ```

---

## 4. Como você usa

### Uma vez só: criar a tabela
No Supabase: **SQL Editor › New query**, cole todo o [`supabase/relatos.sql`](../supabase/relatos.sql) e clique em **Run**. Deve aparecer "Success. No rows returned".

### No dia a dia
```bash
npm run bugs                          # mostra os novos e marca como "visto"
npm run bugs -- --todos               # mostra todos
npm run bugs -- --sugestoes           # só as sugestões (dá para juntar com --todos)
npm run bugs -- --problemas           # só os problemas
npm run bugs -- --resolver C53B       # marca como corrigido
npm run bugs -- --descartar C53B      # não era bug, ou repetido
npm run bugs -- --nota C53B "corrigido na versão 2026-10-20"
```
Precisa do `.env` com `SUPABASE_URL` e `SUPABASE_SERVICE_KEY`, o mesmo da telemetria. A lista também fica salva em `telemetria/relatos.md`, fora do git.

Cada chamado aparece assim:
```
## 🐞 Problema #C53B · novo · 19/10/2026, 11:02:00

> Cliquei em Executar e a tela ficou branca no passo 3.

- Onde: Treino 03 · mold (dia 1, Recruta) · treino m1, passo 3
- Última consulta (Treino 03 · mold, erro): `SELECT placa FROM veiculos`
  → no such column: placa2
- Erro do jogo: nenhum
- Aparelho: celular · Android · Chrome · 390px · toque · idioma pt-BR · janelas: db
- Versão: 2026-10-19-ti · jogador `0907aa3d-0e13` · sessão `abc`
```

**Status de um chamado:** `novo` → `visto` (depois do `npm run bugs`) → `resolvido` ou `descartado`.

**Dica:** para separar os seus testes dos relatos dos jogadores, compare o código `jogador` com o seu (aparece em SISP › Configurações › Privacidade).

---

## 5. Para quem mexe no código

| Arquivo | O que tem |
|---|---|
| `js/apps/suporte.js` | conversa, revisão, envio, fila, limites e o aviso de erro técnico |
| `js/apps/policiazap.js` | abre a saudação e troca a caixa de resposta pela caixa do Cláudio |
| `js/conteudo/personagens.js` | o contato `claudio` (`sempre: true`) |
| `js/ui/telemetria-remota.js` | chama `oferecerSuporteErro()` quando há erro técnico |
| `js/ui/desktop.js` e `js/ui/icones.js` | item do menu e o ícone de fone |
| `js/conteudo/termo.js` | termo de uso, versão 3 |
| `css/apps/policiazap.css` | estilo da caixa de texto e da revisão |
| `supabase/relatos.sql` | tabela e regras de acesso |
| `scripts/bugs.js` | o comando `npm run bugs` |
| `tests/navegador.test.js` | teste "suporte · Cláudio…" contra um Supabase simulado |

Funções principais de `suporte.js`: `abrirSuporte()`, `saudacaoClaudio()`, `caixaClaudio()`, `revisarRelato()`, `enviarRelato()`, `contextoRelato()`, `enviarFilaRelatos()` e `oferecerSuporteErro()`.

O Cláudio **não tem voz**: ele não está na lista de personagens do roteiro de vozes (`scripts/vozes.js`).

---

## 6. O que ele não faz (por enquanto)

- **Não responde depois.** Avisar o jogador quando o bug for corrigido exigiria o jogo ler dados do servidor. Se precisar falar com alguém, use o número do chamado.
- **Não tira dúvida de SQL.** A conversa manda para a Célia e o Guia SQL.
- **Não anexa imagem da tela.** Só texto e o contexto acima.
