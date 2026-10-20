// Estrazione automatica: estrae un numero a intervalli regolari finché non viene fermata.

import { stato } from './state.js';
import { $, modalAperto } from './ui.js';
import { generaNumero } from './estrazione.js';

let timerAuto = null;

function aggiornaBottoneAuto() {
  const btn = $('btnAutoEstrazione');
  if (!btn) return;
  if (stato.estrazioneAutomaticaAttiva) {
    btn.textContent = '⏸️ Ferma Auto';
    btn.classList.add('attivo');
  } else {
    btn.textContent = '▶️ Auto';
    btn.classList.remove('attivo');
  }
}

function tick() {
  // Non estrarre mentre è aperto un modale (es. si sta configurando qualcosa)
  if (modalAperto()) return;
  if (stato.numeriEstratti.length >= 90) {
    fermaEstrazioneAutomatica();
    return;
  }
  generaNumero();
}

export function avviaEstrazioneAutomatica() {
  const secondi = Math.max(2, parseInt($('intervalloAuto').value, 10) || 6);
  stato.estrazioneAutomaticaAttiva = true;
  if (timerAuto) clearInterval(timerAuto);
  timerAuto = setInterval(tick, secondi * 1000);
  aggiornaBottoneAuto();
}

export function fermaEstrazioneAutomatica() {
  stato.estrazioneAutomaticaAttiva = false;
  if (timerAuto) {
    clearInterval(timerAuto);
    timerAuto = null;
  }
  aggiornaBottoneAuto();
}

export function toggleEstrazioneAutomatica() {
  if (stato.estrazioneAutomaticaAttiva) fermaEstrazioneAutomatica();
  else avviaEstrazioneAutomatica();
}

export function aggiornaIntervalloAuto() {
  if (stato.estrazioneAutomaticaAttiva) avviaEstrazioneAutomatica(); // riavvia col nuovo intervallo
}

export function inizializzaAuto() {
  aggiornaBottoneAuto();
}
