// Animazione del sacchetto: prima di ogni estrazione un sacchetto di tela si scuote al
// centro dello schermo e ne esce la pallina con il numero. Il numero viene registrato sul
// tabellone solo quando l'animazione sta per finire. Si può disattivare dal menu ⚙️.

import { opzioni } from './state.js';
import { $ } from './ui.js';

const CHIAVE_PREFERENZA = 'tombolaSacchetto';

// Tempi in ms. Devono restare coerenti con le animazioni in style.css (sezione "Sacchetto").
const T_APPLICA_NUMERO = 1450;  // la pallina è uscita: il numero entra nel tabellone
const T_FINE = 1700;            // dissolvenza completata: l'overlay sparisce

let sacchettoInCorso = false;
let timer = [];
let overlay = null;

export function estrazioneInCorso() {
  return sacchettoInCorso;
}

export function caricaPreferenzaSacchetto() {
  try {
    const valore = localStorage.getItem(CHIAVE_PREFERENZA);
    if (valore !== null) opzioni.sacchetto = valore === '1';
  } catch (e) { /* storage non disponibile: resta il valore predefinito */ }
}

export function salvaPreferenzaSacchetto() {
  try { localStorage.setItem(CHIAVE_PREFERENZA, opzioni.sacchetto ? '1' : '0'); } catch (e) { /* storage non disponibile */ }
}

function creaOverlay(numero) {
  const el = document.createElement('div');
  el.className = 'sacchetto-overlay';
  el.setAttribute('aria-hidden', 'true');
  el.innerHTML = `
    <div class="sacchetto-scena">
      <div class="sacchetto-pallina"><span class="sacchetto-pallina-numero">${numero}</span></div>
      <div class="sacchetto-bag">
        <svg class="sacchetto-svg" viewBox="0 0 200 230" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="sacchettoTela" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0" stop-color="#a9784a"/>
              <stop offset="0.45" stop-color="#d4a373"/>
              <stop offset="1" stop-color="#8c5e35"/>
            </linearGradient>
          </defs>
          <ellipse cx="100" cy="222" rx="66" ry="7" fill="rgba(0,0,0,.28)"/>
          <path d="M64 80 C14 122 4 206 50 219 C80 227 120 227 150 219 C196 206 186 122 136 80 Z"
                fill="url(#sacchettoTela)" stroke="#6b4423" stroke-width="3" stroke-linejoin="round"/>
          <path d="M44 150 C48 186 66 206 96 212" fill="none" stroke="rgba(255,255,255,.28)" stroke-width="6" stroke-linecap="round"/>
          <path d="M74 118 C60 150 62 182 80 200" fill="none" stroke="rgba(107,68,35,.35)" stroke-width="3" stroke-linecap="round"/>
          <path d="M126 112 C142 146 140 180 122 198" fill="none" stroke="rgba(107,68,35,.35)" stroke-width="3" stroke-linecap="round"/>
          <path d="M74 80 L80 38 L120 38 L126 80 Z" fill="url(#sacchettoTela)" stroke="#6b4423" stroke-width="3" stroke-linejoin="round"/>
          <path d="M80 38 C86 46 94 36 100 44 C106 36 114 46 120 38" fill="none" stroke="#6b4423" stroke-width="3" stroke-linecap="round"/>
          <ellipse cx="100" cy="38" rx="20" ry="6" fill="#3b2a1a"/>
          <path d="M70 78 Q100 92 130 78" fill="none" stroke="#c41e3a" stroke-width="7" stroke-linecap="round"/>
          <circle cx="100" cy="86" r="7" fill="#c41e3a" stroke="#8f1228" stroke-width="2"/>
          <path d="M97 90 C90 104 84 108 80 116 M103 90 C110 104 116 108 120 116" fill="none" stroke="#c41e3a" stroke-width="4" stroke-linecap="round"/>
        </svg>
      </div>
    </div>`;
  return el;
}

function pulisci() {
  timer.forEach(clearTimeout);
  timer = [];
  document.querySelectorAll('.sacchetto-overlay').forEach((el) => el.remove());
  overlay = null;
  sacchettoInCorso = false;
  const btn = $('btnEstrai');
  if (btn) btn.disabled = false;
}

// Mostra l'animazione per `numero` e chiama `alTermine` quando la pallina è uscita.
export function animaEstrazioneSacchetto(numero, alTermine) {
  pulisci();
  sacchettoInCorso = true;

  const btn = $('btnEstrai');
  if (btn) btn.disabled = true;

  overlay = creaOverlay(numero);
  document.body.appendChild(overlay);

  timer.push(setTimeout(() => {
    if (overlay) overlay.classList.add('sacchetto-esce-di-scena');
    alTermine();
  }, T_APPLICA_NUMERO));

  timer.push(setTimeout(pulisci, T_FINE));
}

// Interrompe un'animazione in corso senza registrare il numero (usata dal reset).
export function annullaSacchetto() {
  pulisci();
}
