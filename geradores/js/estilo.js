/* Estilo das imagens: a mesma fórmula em todos os prompts, tirada do prompt que gerou o Beto
   ("Semi-realistic graphic novel style, …, cinematic rim lighting, detective adventure game art, digital painting,
   highly detailed --ar 1:1 --v 6.1"). Enquadramento padrão: do peito para cima, fundo escuro, luz lateral. */
'use strict';

const ESTILO = {
  base: 'semi-realistic graphic novel style, cinematic rim lighting, detective adventure game art, digital painting, highly detailed',
  paletas: { padrao: 'muted slate and amber tones', escritorio: 'muted corporate office tones', noite: 'cold blue night tones with amber highlights', porto: 'misty teal and rust tones', luxo: 'warm gold and deep shadow tones', governo: 'faded beige and grey bureaucratic tones' },
  motores: { midjourney: 'Midjourney', dalle: 'DALL-E / ChatGPT', generico: 'Outro gerador' },
  // o que conferir na imagem pronta antes de usar no jogo
  checklist: ['Nenhum texto, letra ou palavra na imagem (principalmente em inglês, como "POLICE" ou "DETECTIVE")', 'Nenhum distintivo, brasão ou farda oficial real', 'Nenhum símbolo, cor ou número de facção real', 'Não parece uma pessoa famosa ou real', 'Mesmo enquadramento (do peito para cima) e mesmo estilo dos outros personagens', 'Mãos e rosto sem defeitos (dedos a mais, olhos tortos)', 'Fundo escuro e simples o bastante para virar avatar pequeno (32 px)'],
};
const PROFISSAO_EN = { 'estudante': 'student', 'estagiário': 'intern', 'atendente': 'customer service clerk', 'vendedor': 'salesperson', 'caixa de supermercado': 'supermarket cashier', 'auxiliar administrativo': 'office assistant', 'motorista de aplicativo': 'rideshare driver', 'entregador': 'delivery courier', 'professor': 'school teacher', 'enfermeiro': 'nurse', 'médico': 'doctor', 'advogado': 'lawyer', 'engenheiro': 'engineer', 'analista de sistemas': 'software analyst', 'contador': 'accountant', 'pedreiro': 'construction worker', 'eletricista': 'electrician', 'mecânico': 'mechanic', 'cabeleireiro': 'hairdresser', 'cozinheiro': 'cook', 'garçom': 'waiter', 'vigilante': 'security guard', 'porteiro': 'building doorman', 'diarista': 'housekeeper', 'servidor público': 'civil servant', 'empresário': 'businessperson', 'comerciante': 'shop owner', 'feirante': 'street market vendor', 'aposentado': 'retiree', 'corretor de imóveis': 'real estate agent', 'bancário': 'bank clerk', 'farmacêutico': 'pharmacist', 'jornalista': 'journalist', 'arquiteto': 'architect', 'operador de telemarketing': 'call center operator', 'auxiliar de logística': 'warehouse worker', 'caminhoneiro': 'truck driver', 'estivador': 'dock worker', 'despachante aduaneiro': 'customs broker', 'agricultor': 'farmer', 'do lar': 'homemaker', 'desempregado': 'unemployed person', 'autônomo': 'self-employed worker' };

function faixaIdadeEn(idade) {
  if (idade < 20) return 'late teens';
  const dec = Math.floor(idade / 10) * 10, u = idade % 10;
  return (u <= 3 ? 'early ' : u <= 6 ? 'mid ' : 'late ') + dec + 's';
}
// Fim do prompt conforme o gerador de imagem e o formato (1:1 retrato e emblema; 16:9 lugar e cena)
// artigo em inglês: "an" antes de som de vogal
function artigoEn(palavra) { return /^[aeiou]/i.test(palavra) ? 'an' : 'a'; }
function fimDoPrompt(motor, formato = '1:1') {
  if (motor === 'dalle') return '. ' + (formato === '1:1' ? 'Square image' : 'Wide 16:9 image') + '. No text, letters, logos or watermarks anywhere in the image.';
  if (motor === 'generico') return '. ' + formato + ' image, no text, no letters, no logos, no watermark.';
  return ' --ar ' + formato + ' --v 6.1 --no text, letters, words, logo, watermark';
}

// Retrato de uma pessoa gerada (gerador 1). opts: {motor, cenario, paleta, expressaoEn}
function promptRetrato(p, opts = {}) {
  const a = p.aparencia, homem = p.genero === 'M';
  const quem = (homem ? 'man' : 'woman');
  const prof = PROFISSAO_EN[String(p.profissao).split('|')[0]] || PROFISSAO_EN[Object.keys(PROFISSAO_EN).find(k => String(p.profissao).startsWith(k.slice(0, 6)))] || '';
  const partes = [
    'Upper body portrait of ' + artigoEn(opts.expressaoEn || a.expressao.en) + ' ' + (opts.expressaoEn || a.expressao.en) + ' ' + a.ascendencia.en + ' ' + quem + (prof ? ', ' + artigoEn(prof) + ' ' + prof : '') + ', ' + faixaIdadeEn(p.idade),
    a.cabeloEn, a.barba && a.barba.en ? a.barba.en : '', a.pele.en, a.olhos.en + ' eyes', a.fisico.en,
    a.marcas.filter(m => m.en).map(m => m.en).join(', '),
    'wearing ' + a.roupa.en,
  ].filter(Boolean);
  const cena = CENARIOS[opts.cenario || 'neutro'] || opts.cenario;
  return partes.join(', ') + '. ' + U.maiuscula(a.expressao.en) + ' expression, ' + cena + '. ' + U.maiuscula(ESTILO.base) + ', ' + ESTILO.paletas[opts.paleta || 'padrao'] + fimDoPrompt(opts.motor);
}
// Lugar (gerador 3)
function promptLugar(cenaEn, opts = {}) {
  return 'Wide establishing shot of ' + cenaEn + ' in a fictional Brazilian metropolis, no people in focus, atmospheric. ' + U.maiuscula(ESTILO.base) + ', ' + ESTILO.paletas[opts.paleta || 'noite'] + fimDoPrompt(opts.motor, '16:9');
}
// Emblema de facção (gerador 9): símbolo inventado, sem letras, sem nada que lembre grupo real
function promptEmblema(faccao, opts = {}) {
  return 'Fictional crest emblem for a fictional criminal organization themed around ' + faccao.temaEn + ', simple bold symbol, ' + (faccao.simboloEn || 'abstract geometric shape') + ', engraved metal look, centered on a dark background, no text, no letters, no numbers, nothing resembling any real gang, police or government symbol. ' + U.maiuscula(ESTILO.base) + ', ' + ESTILO.paletas.padrao + fimDoPrompt(opts.motor);
}
// Cena de final (gerador 10)
function promptCena(descricaoEn, opts = {}) {
  return 'Cinematic scene: ' + descricaoEn + ', in a fictional Brazilian city. ' + U.maiuscula(ESTILO.base) + ', ' + ESTILO.paletas[opts.paleta || 'noite'] + fimDoPrompt(opts.motor, '16:9');
}
