/* Utilitários compartilhados pelas demos. */
const $ = (sel, raiz = document) => raiz.querySelector(sel);
const $$ = (sel, raiz = document) => [...raiz.querySelectorAll(sel)];
const SVGNS = 'http://www.w3.org/2000/svg';

function h(tag, attrs = {}, ...filhos) {
  const el = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (v == null || v === false) continue;
    if (k === 'class') el.className = v;
    else if (k === 'html') el.innerHTML = v;
    else if (k === 'style' && typeof v === 'object') Object.assign(el.style, v);
    else if (k.startsWith('on')) el.addEventListener(k.slice(2), v);
    else el.setAttribute(k, v);
  }
  filhos.flat().forEach(f => f != null && el.append(f));
  return el;
}

function svg(tag, attrs = {}, ...filhos) {
  const el = document.createElementNS(SVGNS, tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (v == null || v === false) continue;
    if (k === 'text') el.textContent = v;
    else if (k.startsWith('on')) el.addEventListener(k.slice(2), v);
    else el.setAttribute(k, v);
  }
  filhos.flat().forEach(f => f != null && el.append(f));
  return el;
}

const espera = ms => new Promise(r => setTimeout(r, Deck.reduzido ? Math.min(ms, 30) : ms));
const fmt = (n, casas = 0) => Number(n).toLocaleString('pt-BR', { minimumFractionDigits: casas, maximumFractionDigits: casas });

/* Contador de geração: cada nova animação invalida as anteriores (para reset e saída do slide). */
function geracao() {
  let g = 0;
  return {
    nova() { return ++g; },
    viva(x) { return x === g; },
    cancela() { g++; },
  };
}

function interpola(de, para, dur, cada, fim) {
  if (Deck.reduzido || dur <= 0) { cada(1); if (fim) fim(); return () => {}; }
  const t0 = performance.now();
  let id;
  const passo = agora => {
    const t = Math.min(1, (agora - t0) / dur);
    const e = t < .5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
    cada(e, de + (para - de) * e);
    if (t < 1) id = requestAnimationFrame(passo); else if (fim) fim();
  };
  id = requestAnimationFrame(passo);
  return () => cancelAnimationFrame(id);
}

/* Hash FNV-1a de 32 bits: mesma entrada, mesmo número, bem espalhado. */
function hash32(str) {
  let h32 = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    h32 ^= str.charCodeAt(i);
    h32 = Math.imul(h32, 0x01000193) >>> 0;
  }
  return h32 >>> 0;
}
