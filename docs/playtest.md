# Roteiro de playtest — SISP

Objetivo: descobrir **onde uma pessoa que nunca programou trava**, sem ajuda nenhuma. Não é para saber se ela gostou; é para achar os pontos em que o jogo não ensinou o suficiente.

Perfil: 2 ou 3 pessoas que **nunca escreveram código**, de preferência fora da área de TI. Uma pessoa por vez.

Tempo: 40 a 60 minutos por sessão (o treinamento + BO 1001 + prova do Módulo 1 cabem nisso; se sobrar tempo, BO 1002).

---

## Antes da sessão

1. Use um computador com Chrome ou Firefox. Teste também no celular com pelo menos uma das pessoas, se der.
2. Abra o jogo com `?teste` no fim do endereço. Exemplo: `file:///…/POL-os/index.html?teste`
   (versão de arquivo único: `dist/sisp.html?teste`, gerada com `npm run empacotar`).
3. Se já jogou nesse navegador: menu **SISP › Reiniciar turno**, e depois **SISP › Diagnóstico de playtest › Limpar telemetria**.
4. Deixe o jogo na tela de login. Tenha papel ou a tabela abaixo aberta para anotar.

## O que dizer para a pessoa (e só isso)

> "Isso é um jogo que estou testando. Eu não vou te ajudar, porque quero ver onde o jogo falha, não você. Se travar, tudo bem: é exatamente isso que eu preciso ver. Tenta falar em voz alta o que você está pensando enquanto joga. Pode parar quando quiser."

## Durante a sessão

- **Não ajude.** Nem com o olhar, nem apontando. Se a pessoa perguntar, responda: "o que você acha que deveria fazer?"
- Se ela travar por **mais de 5 minutos** no mesmo ponto e estiver frustrada, ajude com o **mínimo** e anote exatamente o que você precisou dizer. Isso é o dado mais valioso da sessão.
- Anote o que ela **fala** e o que ela **faz**, não o que você acha que ela pensou.

### Tabela de anotação

| Hora | Onde (passo do treino / BO / prova) | O que aconteceu | O que ela disse | Precisei ajudar? O quê? |
|---|---|---|---|---|
| | | | | |

### Sinais que valem anotar
- Leu a fala da Célia e mesmo assim não soube o que fazer.
- Clicou no lugar errado (onde? o que esperava que acontecesse?).
- Entendeu a bronca da Célia como ofensa, e não como instrução.
- Não percebeu um botão (Executar, Explique, Dicionário de Dados, Pedir dica).
- Achou que errou quando acertou, ou o contrário.
- Desistiu de ler textos longos (quais?).
- Usou o botão **Explique** sozinha (bom sinal) ou nunca usou.
- No celular: algo ficou escondido, pequeno ou difícil de tocar.

## Depois da sessão (5 minutos de conversa)

1. "Em que momento você ficou mais perdida(o)?"
2. "Teve alguma hora em que você sabia o que queria fazer, mas não sabia como?"
3. "Explica para mim, com suas palavras, o que faz o `WHERE`" (ou o último comando que ela aprendeu). *Se ela não conseguir, o jogo ensinou a passar de fase, não o conceito.*
4. "Alguma fala da Célia te incomodou?"
5. "Você jogaria a próxima parte?"

## Coletar os dados

1. Menu **SISP › Diagnóstico de playtest**.
2. Olhe as linhas **em destaque** (3 ou mais erros/tropeços, ou 5 minutos ou mais no mesmo lugar): são os candidatos a ponto de travamento.
3. Clique em **Baixar JSON** e guarde o arquivo com o nome da sessão (ex.: `sessao-1-ana.json`) junto com suas anotações.
4. **Limpar telemetria** antes da próxima pessoa.

A telemetria fica só no navegador; nada é enviado para lugar nenhum.

## Depois de todas as sessões

Junte anotações + JSONs e procure **pontos em que 2 ou mais pessoas travaram**. Esses viram tarefas do ajuste do tutorial (último item do Sprint 1). Travamento de uma pessoa só: anote, mas não mude nada por causa dele ainda.
