/* Gerador 13 · Prompts de imagem: retrato, lote de rostos genéricos, lugar, emblema e cena,
   sempre com a fórmula de estilo do Beto. Mostra o prompt original como referência e a lista de verificação. */
'use strict';

const PROMPT_BETO = 'Upper body portrait of a friendly tired Brazilian police desk detective named Beto, early 30s, slightly messy dark wavy hair, 5 o\'clock shadow stubble, wearing a wrinkled light-blue dress shirt with rolled-up sleeves and a loosened necktie. Friendly and slightly nervous smirk, holding a disposable coffee cup in a cluttered fluorescent-lit precinct office. Semi-realistic graphic novel style, muted corporate office tones, cinematic rim lighting, detective adventure game art, digital painting, highly detailed --ar 1:1 --v 6.1';
const TIPOS_PROMPT = { retrato: 'Retrato de uma pessoa do projeto', novo: 'Retrato de uma pessoa nova (com o papel e a idade abaixo)', lote: 'Lote de rostos genéricos (variados)', lugar: 'Lugar (tipo de bairro)', emblema: 'Emblema de facção', cena: 'Cena livre (descreva em inglês)' };

registrarGerador({
  id: 'prompts', numero: 13, grupo: 'Imagens', nome: 'Prompts de imagem', colecao: null,
  descricao: 'Monta o prompt completo a partir de poucas escolhas, sempre com a mesma fórmula de estilo do retrato do Beto e o mesmo enquadramento. Cada prompt pode ir para a lista de produção com o nome de arquivo padrão.',
  campos: [
    { id: 'tipo', rotulo: 'O que desenhar', tipo: 'select', padrao: 'lote', opcoes: Object.keys(TIPOS_PROMPT).map(k => [k, TIPOS_PROMPT[k]]) },
    { id: 'pessoa', rotulo: 'Pessoa (retrato do projeto)', tipo: 'projeto', colecao: 'pessoas', padrao: '', vazio: 'Todas as pessoas do projeto' },
    { id: 'quantidade', rotulo: 'Quantos rostos (lote)', tipo: 'numero', padrao: 12, min: 1, max: 60 },
    { id: 'papel', rotulo: 'Papel (pessoa nova)', tipo: 'select', padrao: 'qualquer', opcoes: [['qualquer', 'Sortear']].concat(Object.keys(PAPEIS).map(k => [k, U.maiuscula(PAPEIS[k])])) },
    { id: 'genero', rotulo: 'Gênero (pessoa nova)', tipo: 'select', padrao: 'qualquer', opcoes: [['qualquer', 'Qualquer'], ['F', 'Feminino'], ['M', 'Masculino']] },
    { id: 'faixa', rotulo: 'Idade (pessoa nova)', tipo: 'select', padrao: 'qualquer', opcoes: [['qualquer', 'Qualquer'], ['jovem', '18 a 29'], ['adulto', '30 a 59'], ['idoso', '60 ou mais']] },
    { id: 'perfil', rotulo: 'Tipo de bairro (lugar)', tipo: 'select', padrao: 'todos', opcoes: [['todos', 'Todos (um de cada)']].concat(PERFIS_BAIRRO.map(p => [p.id, p.nome])) },
    { id: 'faccao', rotulo: 'Facção (emblema)', tipo: 'select', padrao: 'todas', opcoes: [['todas', 'As cinco']].concat(FACCOES_PADRAO.map(f => [f.id, f.nome])) },
    { id: 'descricao', rotulo: 'Descrição da cena (em inglês)', tipo: 'area', padrao: 'a detective analyzing glowing database tables on an old CRT monitor late at night' },
    { id: 'cenario', rotulo: 'Fundo do retrato', tipo: 'select', padrao: 'neutro', opcoes: Object.keys(CENARIOS).map(k => [k, k]) },
    { id: 'paleta', rotulo: 'Paleta', tipo: 'select', padrao: 'auto', opcoes: [['auto', 'Automática']].concat(Object.keys(ESTILO.paletas).map(k => [k, k + ' (' + ESTILO.paletas[k] + ')'])) },
    { id: 'motor', rotulo: 'Gerador de imagem', tipo: 'select', padrao: 'midjourney', opcoes: Object.keys(ESTILO.motores).map(k => [k, ESTILO.motores[k]]) },
  ],
  gerar(v, ctx) {
    const rng = ctx.rng, pr = ctx.projeto, opts = { motor: v.motor, cenario: v.cenario, paleta: v.paleta === 'auto' ? undefined : v.paleta };
    const cartoes = [], extras = [], avisos = [];
    const retrato = p => ({ titulo: p.nome, subtitulo: p.idade + ' anos · ' + p.profissao + ' · ' + (PAPEIS[p.papel] || p.papel), prompt: promptRetrato(p, opts), producao: { tipo: 'rosto', nome: p.nome }, html: '<p>' + U.esc(p.descricao) + '</p>' });
    if (v.tipo === 'retrato') {
      const l = (pr.pessoas || []).filter(p => !v.pessoa || p.id === v.pessoa);
      if (!l.length) avisos.push('O projeto ainda não tem pessoas. Gere no gerador 1 e salve, ou escolha "Retrato de uma pessoa nova".');
      l.forEach(p => cartoes.push(retrato(p)));
    } else if (v.tipo === 'novo' || v.tipo === 'lote') {
      // lote: alterna gênero e faixa de idade para o banco de rostos sair equilibrado
      const n = v.tipo === 'novo' ? 1 : v.quantidade, faixas = ['jovem', 'adulto', 'adulto', 'idoso'], novos = [];
      for (let i = 0; i < n; i++) {
        const o = v.tipo === 'novo' ? { papel: v.papel, genero: v.genero, faixa: v.faixa } : { papel: 'neutro', genero: i % 2 ? 'M' : 'F', faixa: faixas[Math.floor(i / 2) % faixas.length], distribuicao: 'equilibrado' };
        const p = criarPessoa(rng, Object.assign(o, opts), pr); novos.push(p); cartoes.push(retrato(p));
      }
      extras.push({ colecao: 'pessoas', itens: novos });
    } else if (v.tipo === 'lugar') {
      PERFIS_BAIRRO.filter(p => v.perfil === 'todos' || p.id === v.perfil).forEach(p => cartoes.push({ titulo: p.nome, subtitulo: 'lugar · 16:9', prompt: promptLugar(p.cenaEn, { motor: v.motor, paleta: opts.paleta || (p.id === 'porto' ? 'porto' : p.id === 'condominios' ? 'luxo' : p.id === 'governo' ? 'governo' : 'noite') }), producao: { tipo: 'lugar', nome: p.id }, html: '' }));
    } else if (v.tipo === 'emblema') {
      FACCOES_PADRAO.filter(f => v.faccao === 'todas' || f.id === v.faccao).forEach(f => cartoes.push({ titulo: f.nome, subtitulo: 'emblema · 1:1', prompt: promptEmblema(EMBLEMA_FACCAO[f.id], { motor: v.motor }), producao: { tipo: 'emblema', nome: f.id }, html: '<p>' + U.esc(f.especialidade) + '</p>' }));
    } else {
      const d = String(v.descricao || '').trim();
      if (/[ãõçáéíóúâêô]/i.test(d)) avisos.push('A descrição parece estar em português: os geradores de imagem entendem melhor inglês.');
      cartoes.push({ titulo: 'Cena', subtitulo: '16:9', prompt: promptCena(d || 'an empty precinct at night', { motor: v.motor, paleta: opts.paleta }), producao: { tipo: 'cena', nome: d.split(' ').slice(0, 4).join(' ') }, html: '' });
    }
    const ref = { titulo: 'Referência: o prompt do Beto', subtitulo: 'todos os prompts seguem esta fórmula', prompt: PROMPT_BETO, html: '<p class="arquivo">Images/Arco1/Beto.png</p>' };
    const check = { titulo: 'Antes de usar a imagem no jogo', subtitulo: 'lista de verificação', html: '<ul class="checklist">' + ESTILO.checklist.map(c => '<li>' + U.esc(c) + '</li>').join('') + '</ul>' };
    return {
      resumo: cartoes.length + ' prompt(s) · ' + ESTILO.motores[v.motor] + '.',
      avisos, itens: [], colecao: null, extras,
      cartoes: cartoes.concat([check, ref]),
      tabelas: [{ nome: 'prompts', colunas: ['titulo', 'subtitulo', 'prompt'], linhas: cartoes }],
      texto: cartoes.map(c => '## ' + c.titulo + '\n' + c.prompt).join('\n\n') + '\n\n## Lista de verificação\n' + ESTILO.checklist.map(c => '- [ ] ' + c).join('\n'),
    };
  },
});
