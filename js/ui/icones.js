/* Ícones em SVG inline. */
/* ---------- icons (inline svg) ---------- */
var MENU_ICONS={
 suporte:'<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#cfe2dc" stroke-width="1.7"><path d="M4 14v-2a8 8 0 0 1 16 0v2"/><rect x="3" y="13" width="4" height="6" rx="1"/><rect x="17" y="13" width="4" height="6" rx="1"/><path d="M19 19c0 1.5-2 2-5 2"/></svg>',
 relatorio:'<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#cfe2dc" stroke-width="1.7"><path d="M6 3h9l3 3v15H6z"/><path d="M9 11h6M9 15h6M9 7h3"/></svg>',
 diag:'<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#cfe2dc" stroke-width="1.7"><path d="M4 20V4M4 20h16"/><path d="M8 16v-4M12 16V8M16 16v-6"/></svg>',
 config:'<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#cfe2dc" stroke-width="1.7"><circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M4.9 19.1L7 17M17 7l2.1-2.1"/></svg>',
 salvar:'<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#cfe2dc" stroke-width="1.7"><path d="M12 4v11M7 10l5 5 5-5"/><path d="M4 18v2h16v-2"/></svg>',
 carregar:'<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#cfe2dc" stroke-width="1.7"><path d="M12 15V4M7 9l5-5 5 5"/><path d="M4 18v2h16v-2"/></svg>',
 voz:'<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#cfe2dc" stroke-width="1.7"><path d="M4 9h4l5-4v14l-5-4H4z"/><path d="M16 9a4 4 0 0 1 0 6M18.5 6.5a7.5 7.5 0 0 1 0 11"/></svg>',
 idioma:'<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#cfe2dc" stroke-width="1.7"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c3 3.5 3 14.5 0 18M12 3c-3 3.5-3 14.5 0 18"/></svg>',
 reiniciar:'<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#f0a59e" stroke-width="1.7"><path d="M20 12a8 8 0 1 1-2.3-5.6"/><path d="M20 4v5h-5"/></svg>'
};
var ICONS={
 ocorr:'<svg width="38" height="38" viewBox="0 0 38 38"><rect x="7" y="4" width="24" height="30" fill="#f4f1e6" stroke="#22404c" stroke-width="1.5"/><rect x="13" y="2" width="12" height="5" fill="#22404c"/><path d="M11 14h16M11 19h16M11 24h10" stroke="#7d9197" stroke-width="1.6"/><circle cx="27" cy="28" r="5" fill="#d6951c"/></svg>',
 db:'<svg width="38" height="38" viewBox="0 0 38 38"><rect x="3" y="6" width="32" height="24" fill="#0f191c" stroke="#9aa7a6"/><path d="M8 13l4 3-4 3" stroke="#e8b04a" stroke-width="2" fill="none"/><path d="M15 19h9" stroke="#93d39f" stroke-width="2"/><rect x="13" y="30" width="12" height="3" fill="#9aa7a6"/></svg>',
 zap:'<svg width="38" height="38" viewBox="0 0 38 38"><path d="M5 7h28v19H17l-7 6v-6H5z" fill="#e3e7e5" stroke="#22404c" stroke-width="1.5"/><circle cx="13" cy="16.5" r="2" fill="#22404c"/><circle cx="19" cy="16.5" r="2" fill="#22404c"/><circle cx="25" cy="16.5" r="2" fill="#22404c"/></svg>',
 files:'<svg width="38" height="38" viewBox="0 0 38 38"><path d="M3 9h12l3 3h17v20H3z" fill="#d6951c"/><path d="M3 14h32v18H3z" fill="#e8b04a"/></svg>',
 prova:'<svg width="38" height="38" viewBox="0 0 38 38"><rect x="6" y="4" width="26" height="30" fill="#f4f1e6" stroke="#22404c" stroke-width="1.5"/><path d="M11 12h16M11 17h16M11 22h9" stroke="#7d9197" stroke-width="1.6"/><circle cx="26" cy="27" r="6" fill="#d6951c"/><path d="M23 33l3-3 3 3v4l-3-2-3 2z" fill="#b0302a"/></svg>',
 caderno:'<svg width="38" height="38" viewBox="0 0 38 38"><rect x="8" y="4" width="23" height="30" fill="#fffef4" stroke="#22404c" stroke-width="1.5"/><path d="M8 4h4v30H8z" fill="#d6951c"/><path d="M15 12h12M15 17h12M15 22h8" stroke="#9aa7a6" stroke-width="1.5"/><circle cx="26" cy="27" r="3" fill="#b0302a"/><path d="M26 27l3 5" stroke="#22404c" stroke-width="1.5"/></svg>',
 guia:'<svg width="38" height="38" viewBox="0 0 38 38"><path d="M6 6h11c1.7 0 2 1 2 2v26c0-1-.6-2-2-2H6z" fill="#22404c"/><path d="M32 6H21c-1.7 0-2 1-2 2v26c0-1 .6-2 2-2h11z" fill="#2f5866"/><path d="M9 11h7M9 15h7M22 11h7M22 15h5" stroke="#9fb6b3" stroke-width="1.4"/><rect x="8" y="21" width="22" height="8" rx="1" fill="#d6951c"/><text x="19" y="27.6" font-size="7" font-family="monospace" font-weight="700" text-anchor="middle" fill="#14262b">SQL</text></svg>',
 sql:'<svg width="34" height="40" viewBox="0 0 34 40"><path d="M4 2h18l8 8v28H4z" fill="#fff" stroke="#4a5a5e"/><rect x="4" y="22" width="26" height="10" fill="#22404c"/><text x="17" y="30" font-size="8" font-family="monospace" fill="#fff" text-anchor="middle">SQL</text></svg>',
 txt:'<svg width="34" height="40" viewBox="0 0 34 40"><path d="M4 2h18l8 8v28H4z" fill="#fffef6" stroke="#4a5a5e"/><path d="M9 16h16M9 21h16M9 26h12" stroke="#9aa7a6" stroke-width="1.5"/></svg>',
 jpg:'<svg width="34" height="40" viewBox="0 0 34 40"><path d="M4 2h18l8 8v28H4z" fill="#fff" stroke="#4a5a5e"/><rect x="8" y="14" width="18" height="14" fill="#14262b"/><path d="M8 28l6-7 4 4 3-3 5 6z" fill="#7d9197"/><circle cx="21" cy="18" r="2" fill="#e8b04a"/></svg>'
};
