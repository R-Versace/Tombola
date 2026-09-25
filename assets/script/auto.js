// Estrazione automatica a intervallo regolare.

import { stato } from './state.js';
import { $, modalAperto } from './ui.js';
import { generaNumero, EVENTO_FINE_PARTITA } from './estrazione.js';

let attiva = false;
let timer = null;

function tick() {
  // Non estrarre mentre è aperto un modale (es. si sta configurando qualcosa)
  if (modalAperto()) return;
  if (stato.numeriEstratti.length >= 90) {
    fermaEstrazioneAutomatica();
    return;
  }
  generaNumero();
}

function aggiornaBottone() {
  const btn = $('btnAutoEstrazione');
  if (!btn) return;
  if (attiva) {
    btn.textContent = '⏸️ Ferma Auto';
    btn.classList.add('attivo');
  } else {
    btn.textContent = '▶️ Auto';
    btn.classList.remove('attivo');
  }
}

export function avviaEstrazioneAutomatica() {
  const secondi = Math.max(2, parseInt($('intervalloAuto').value, 10) || 6);
  attiva = true;
  if (timer) clearInterval(timer);
  timer = setInterval(tick, secondi * 1000);
  aggiornaBottone();
}

export function fermaEstrazioneAutomatica() {
  attiva = false;
  if (timer) {
    clearInterval(timer);
    timer = null;
  }
  aggiornaBottone();
}

export function toggleEstrazioneAutomatica() {
  if (attiva) fermaEstrazioneAutomatica();
  else avviaEstrazioneAutomatica();
}

export function aggiornaIntervalloAuto() {
  if (attiva) avviaEstrazioneAutomatica(); // riavvia con il nuovo intervallo
}

export function inizializzaAuto() {
  document.addEventListener(EVENTO_FINE_PARTITA, fermaEstrazioneAutomatica);
}
