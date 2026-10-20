# Vozes dos personagens

As falas da Célia, do Beto, do Jairo e da Marina podem ser lidas em voz alta. O texto continua na tela: a voz é um extra, **desligada por padrão**. O jogador liga em **SISP › Configurações › Som › Vozes** e, mesmo com elas desligadas, pode tocar uma fala pelo botão 🔊 ao lado dela.

O jogo só toca o que foi gravado. Uma fala sem áudio fica muda, sem erro e sem pedir arquivo nenhum. Por isso dá para gravar aos poucos, por exemplo só a Célia do Módulo 1 como piloto.

> **Quando gravar:** depois que os textos estabilizarem. Cada mudança de texto gera uma fala nova, e o áudio antigo deixa de tocar.

---

## Como o jogo acha o áudio de cada fala

Cada fala tem um **id** calculado a partir do personagem e do texto que aparece na tela, como `celia-3fa9c21b`. O arquivo é `audio/<idioma>/<id>.mp3`.

- A formatação não conta: negrito, `<code>` e espaços extras dão o mesmo id.
- Mudou uma palavra, muda o id. O mp3 antigo fica "sobrando", e a ferramenta avisa.
- Ninguém numera nada à mão.

O jogo só pede os arquivos listados em `js/vozes/<idioma>.js` (o **manifesto**). Esse arquivo é gerado pelo comando abaixo; não edite à mão.

## Passo a passo

1. **Gerar o roteiro:**
   ```bash
   npm run vozes
   ```
   O comando cria, em `audio/pt-BR/` (fora do git):
   - `roteiro.csv`: todas as falas, com as colunas id, personagem, arquivo, texto para a voz, texto na tela, contexto e situação (gravada, falta ou dinâmica). Abre no Excel/LibreOffice.
   - `roteiro-celia.txt`, `roteiro-beto.txt`…: um por personagem, no formato `### <id>.mp3 (contexto)` seguido do texto. Dá para colar direto no ElevenLabs.

   No terminal, aparece quanto falta gravar por personagem, em falas e em caracteres (o ElevenLabs cobra por caractere), além dos mp3 que sobraram de textos antigos.

2. **Gravar** cada fala e salvar com o nome exato da coluna `arquivo` (`celia-3fa9c21b.mp3`) em `audio/pt-BR/`.
   - Use **mp3 mono, 64–96 kbps, 44,1 kHz**. Voz não precisa de mais, e o jogo fica leve.
   - Não deixe silêncio longo no começo nem no fim.

3. **Atualizar o manifesto:**
   ```bash
   npm run vozes -- manifesto
   ```
   Ele lê os mp3 da pasta e reescreve `js/vozes/pt-BR.js`. Faça o commit dos mp3 e desse arquivo juntos.

4. Abra o jogo, ligue as vozes e confira.

## Piloto: só a Célia no Módulo 1

Antes de gravar as cerca de 340 falas, vale gravar só o começo do jogo e ouvir o efeito.

1. `npm run vozes` gera também `audio/pt-BR/roteiro-piloto.txt`: as falas da Célia no treinamento do Módulo 1 (umas 43 falas, cerca de 5.400 caracteres).
2. No ElevenLabs, escolha **uma** voz para a Célia (feminina, madura, firme e meio impaciente; ela tem 22 anos de DTI) e gere cada bloco. Salve cada áudio com o nome do bloco (`### celia-xxxxxxxx.mp3`) em `audio/pt-BR/`.
3. `npm run vozes -- manifesto` e abra o jogo do começo, com **SISP › Configurações › Som › Vozes** ligadas.
4. Jogue o treinamento do Módulo 1 e responda: a voz ajuda ou atrapalha? O ritmo do treinamento fica mais lento? A voz combina com a Célia? Só depois disso vale gravar o resto.

## Texto para a voz × texto na tela

A voz não lê SQL do jeito que está escrito. A ferramenta converte os símbolos em palavras: `*` vira "asterisco", `>=` vira "maior ou igual a", `%` vira "porcento" e `___` vira "tracinhos". As regras de cada idioma ficam em `PRONUNCIA`, em `js/core/vozes.js`.

Quando uma fala específica precisar de outro texto falado (uma sigla, uma pausa, uma placa soletrada), crie `audio/pt-BR/ajustes.json`:

```json
{
  "celia-3fa9c21b": "Placa F T R sete A noventa e três. Anota aí."
}
```

O id continua o mesmo, porque é calculado pelo texto da tela; muda só o que vai para o roteiro.

## Falas que não dá para gravar

Algumas falas montam um valor na hora, como o nome do radar e o número de passagens no pedido do Jairo. O roteiro marca essas falas como **dinâmica** e elas ficam sem voz. Se uma delas for importante, reescreva a fala sem o valor variável.

As falas do treinamento com `{n}` ou `{cores}` **podem** ser gravadas: o banco é sempre o mesmo, então o número é sempre o mesmo, e o roteiro já traz o texto com o número preenchido.

## Outros idiomas

Mesmo esquema, com outra pasta: `npm run vozes -- en`, depois `npm run vozes -- manifesto en`, que gera `js/vozes/en.js` (acrescente o `<script>` no `index.html`). As regras de pronúncia ficam em `PRONUNCIA.en`. As falas só existem depois que o conteúdo estiver traduzido.

## Direitos e consentimento

- Use apenas vozes da biblioteca do ElevenLabs liberadas para uso comercial no seu plano, ou vozes criadas do zero (Voice Design).
- **Não clone a voz de ninguém sem autorização por escrito** da pessoa, guardada fora do repositório.
- Guarde o comprovante do plano usado na época da geração: a licença do áudio depende dele.

## Onde fica cada coisa

| Arquivo | O que é |
|---|---|
| `js/core/vozes.js` | id da fala, texto falado, regras de pronúncia |
| `js/vozes/pt-BR.js` | manifesto (gerado) |
| `js/ui/vozes.js` | tocador, fila, botão 🔊, tela de Configurações |
| `scripts/vozes.js` | roteiro e manifesto |
| `tests/vozes.test.js` | id estável, pronúncia, roteiro |
| `audio/pt-BR/*.mp3` | os áudios (versionados) |
| `audio/pt-BR/roteiro*` | gerados, fora do git |
