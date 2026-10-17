/* Atalhos de DOM. */
var $=function(s,el){return (el||document).querySelector(s)};
// Traduz o texto fixo do index.html: elementos com data-i18n (conteúdo) e data-i18n-title (atributo title).
function aplicarI18nHTML(){
  document.documentElement.lang=idiomaAtual();
  document.querySelectorAll('[data-i18n]').forEach(function(el){el.innerHTML=L(el.innerHTML.trim())});   // i18n-dinamico: os textos do HTML são extraídos pela ferramenta direto do index.html
  document.querySelectorAll('[data-i18n-title]').forEach(function(el){el.title=L(el.title)});   // i18n-dinamico
}
// Entrega um arquivo para o jogador baixar.
function baixarArquivo(texto,nome,tipo){var a=h('a',{href:URL.createObjectURL(new Blob([texto],{type:tipo})),download:nome});document.body.appendChild(a);a.click();a.remove()}
function h(tag,attrs,html){var e=document.createElement(tag);if(attrs)for(var k in attrs){if(k==='class')e.className=attrs[k];else if(k.indexOf('on')===0)e.addEventListener(k.slice(2),attrs[k]);else e.setAttribute(k,attrs[k])}if(html!=null)e.innerHTML=html;return e}
