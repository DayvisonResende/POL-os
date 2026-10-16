/* Atalhos de DOM. */
var $=function(s,el){return (el||document).querySelector(s)};
// Entrega um arquivo para o jogador baixar.
function baixarArquivo(texto,nome,tipo){var a=h('a',{href:URL.createObjectURL(new Blob([texto],{type:tipo})),download:nome});document.body.appendChild(a);a.click();a.remove()}
function h(tag,attrs,html){var e=document.createElement(tag);if(attrs)for(var k in attrs){if(k==='class')e.className=attrs[k];else if(k.indexOf('on')===0)e.addEventListener(k.slice(2),attrs[k]);else e.setAttribute(k,attrs[k])}if(html!=null)e.innerHTML=html;return e}
