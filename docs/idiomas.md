# Idiomas do SISP

O português (pt-BR) é o **idioma-fonte**: todo texto é escrito em português, direto no código. As traduções mapeiam "texto em português → texto traduzido". O que ainda não foi traduzido aparece em português.

Progresso a qualquer momento:
```bash
npm run i18n          # cobertura de cada idioma + textos ainda não marcados, arquivo por arquivo
npm run i18n -- en    # o que falta traduzir em inglês, pronto para colar
```

---

## Para quem escreve texto no jogo (casos, falas, telas)

**Toda frase que o jogador vê passa por `L()`**, com o texto em português dentro:

```js
toast(L('Chamado encerrado'), …)
```

**Valores entram por marcadores `{nome}`**, nunca por concatenação, porque outros idiomas mudam a ordem das palavras:

```js
// ✗ errado
'Base carregada: ' + n + ' veículos no cadastro.'
// ✓ certo
L('Base carregada: {n} veículos no cadastro.', { n: n })
```

**Plural com `Lp()`:**
```js
Lp(total, '1 linha', '{n} linhas')
```

**Texto fixo do `index.html`:** use o atributo `data-i18n` no elemento (o conteúdo vira a chave) e `data-i18n-title` para o atributo `title`.

**Regras:**
1. Dentro do `L()`, sempre um texto literal (`'…'`). `L(variavel)` não é enxergado pela ferramenta; os testes acusam. Exceção marcada com o comentário `// i18n-dinamico`.
2. Mudou o texto em português? A tradução antiga vira "órfã" (o teste avisa): atualize a chave no arquivo do idioma.
3. **Não traduzir**, porque é ambientação e fica igual em todo idioma: dados do banco (nomes, cidades, placas, modelos), siglas e nomes de instituições (BO, DTI, ACADEPOL, Polícia Civil), a câmera do radar, os nomes de marca dos programas (DB-Investigator, PolíciaZap, ACADEPOL). A lista técnica está em `NAO_TRADUZIR`, em `scripts/i18n.js`.
4. **O SQL nunca se traduz**: palavras-chave, nomes de tabela e coluna ficam iguais em todo idioma, como no mercado.

## Para quem traduz

1. `npm run i18n -- en` lista o que falta, já no formato do arquivo.
2. Cole dentro de `textos:{…}` em `js/i18n/en.js` e preencha as traduções.
3. Mantenha os **mesmos `{marcadores}`** e as tags HTML (`<b>`, `<code>`…).
4. **A voz dos personagens vale mais que a fidelidade literal.** A Célia é resmungona, direta e engraçada em qualquer idioma: primeira frase com personalidade, segunda com a instrução. Tradução automática estraga a personagem; use como rascunho, nunca como versão final.
5. Rode `npm test`: ele confere órfãos e marcadores.

## Idioma novo

1. Crie `js/i18n/<código>.js` (ex.: `es.js`) copiando o cabeçalho de `en.js`, com `pronto:false`.
2. Acrescente `<script src="js/i18n/<código>.js"></script>` no `index.html`, logo depois de `en.js`.
3. Traduza com `npm run i18n -- <código>`.
4. Para testar: abra o jogo com `?idioma=<código>`. Com `?teste`, o menu SISP › Configurações › Idioma mostra também os idiomas incompletos.
5. Quando estiver **100% traduzido e revisado por uma pessoa**, troque para `pronto:true`. Só então ele aparece para os jogadores, e o jogo passa a escolhê-lo automaticamente para quem usa o navegador nesse idioma.

## Como o idioma é escolhido

1. `?idioma=xx` no endereço (qualquer idioma registrado, mesmo incompleto: serve para testar);
2. a escolha salva em Configurações › Idioma;
3. o idioma do navegador, se houver tradução pronta;
4. português.

Trocar de idioma recarrega a página (o texto é montado ao carregar). O progresso está salvo e não se perde.

## Estado da migração (17/10/2026)

| Parte | Situação |
|---|---|
| Mecanismo (`L`, `Lp`, escolha de idioma, seletor, `index.html`) | ✅ |
| Interface: menus, janelas, DB-Investigator, Ocorrências, PolíciaZap, Arquivos, ACADEPOL, relatório, backup, termo de uso, privacidade | ✅ marcada; inglês 100% |
| Conteúdo: casos, treinamentos, provas, patentes, personagens, arquivos de evidência, história do Beto | ⏳ ainda em português direto; migrar com `L()` |
| Mensagens de erro e diagnóstico de SQL (`js/core/sql/erros.js`, `diagnostico.js`) | ⏳ migrar com `L()` |
| Explique (`js/core/sql/explicador.js`) | ⏳ **caso especial**: ele monta frases com gramática do português ("do valor", "da cor"). Cada idioma vai precisar da própria versão do explicador, não só de traduções |

**Regra a partir de agora:** todo conteúdo novo (Módulo 3 em diante) já nasce com `L()`. O conteúdo antigo migra aos poucos; `npm run i18n` mostra quanto falta em cada arquivo.
