// Countdown di Natale e Capodanno.
// Fasi (ora locale del dispositivo):
//  - fino al 24 dicembre: conto alla rovescia verso Natale (25/12 ore 00:00)
//  - 25 dicembre: messaggio "Buon Natale!"
//  - dal 26 dicembre al 31 dicembre: conto alla rovescia verso Capodanno (01/01 ore 00:00)
//  - 1 gennaio: messaggio "Buon Anno!"
//  - dal 2 gennaio: di nuovo il conto alla rovescia verso il prossimo Natale

import { opzioni } from './state.js';
import { $ } from './ui.js';

const CHIAVE = 'tombolaCountdown';
let timer = null;

export function countdownSalvato() {
  try { return localStorage.getItem(CHIAVE) !== 'off'; } catch (e) { return true; }
}

function salvaCountdown(attivo) {
  try { localStorage.setItem(CHIAVE, attivo ? 'on' : 'off'); } catch (e) { /* storage non disponibile */ }
}

// Restituisce { tipo: 'conto', evento, emoji, nome, target } oppure { tipo: 'festa', emoji, testo }.
export function calcolaFase(adesso = new Date()) {
  const anno = adesso.getFullYear();
  const mese = adesso.getMonth();   // 0 = gennaio, 11 = dicembre
  const giorno = adesso.getDate();

  if (mese === 11 && giorno === 25) {
    return { tipo: 'festa', emoji: '🎄🎅🎁', testo: 'Buon Natale!' };
  }
  if (mese === 0 && giorno === 1) {
    return { tipo: 'festa', emoji: '🎆🥂🎉', testo: 'Buon Anno!' };
  }

  // Dal 26 dicembre al 31 dicembre: verso Capodanno
  if (mese === 11 && giorno >= 26) {
    return {
      tipo: 'conto', evento: 'capodanno', emoji: '🎆', nome: 'Capodanno',
      target: new Date(anno + 1, 0, 1, 0, 0, 0)
    };
  }

  // In tutti gli altri casi: verso il prossimo Natale
  // (dal 2 gennaio al 24 dicembre è sempre il Natale dell'anno corrente)
  return {
    tipo: 'conto', evento: 'natale', emoji: '🎄', nome: 'Natale',
    target: new Date(anno, 11, 25, 0, 0, 0)
  };
}

function pad(n) { return String(n).padStart(2, '0'); }

function cella(valore, etichetta) {
  return `<div class="countdown-cella"><span class="countdown-valore">${valore}</span><span class="countdown-etichetta">${etichetta}</span></div>`;
}

export function aggiornaCountdown() {
  const box = $('countdownBox');
  if (!box) return;

  const fase = calcolaFase();
  box.dataset.evento = fase.evento || 'festa';

  if (fase.tipo === 'festa') {
    box.innerHTML = `<div class="countdown-festa">${fase.emoji} ${fase.testo} ${fase.emoji}</div>`;
    return;
  }

  const differenza = Math.max(0, fase.target - new Date());
  const giorni = Math.floor(differenza / 86400000);
  const ore = Math.floor((differenza % 86400000) / 3600000);
  const minuti = Math.floor((differenza % 3600000) / 60000);
  const secondi = Math.floor((differenza % 60000) / 1000);

  box.innerHTML =
    `<div class="countdown-titolo">${fase.emoji} Mancano a ${fase.nome} ${fase.emoji}</div>` +
    `<div class="countdown-celle">` +
      cella(giorni, giorni === 1 ? 'giorno' : 'giorni') +
      cella(pad(ore), 'ore') +
      cella(pad(minuti), 'min') +
      cella(pad(secondi), 'sec') +
    `</div>`;
}

export function mostraCountdown(mostra) {
  const box = $('countdownBox');
  if (!box) return;
  box.classList.toggle('d-none', !mostra);

  if (timer) { clearInterval(timer); timer = null; }
  if (mostra) {
    aggiornaCountdown();
    timer = setInterval(aggiornaCountdown, 1000);
  }
}

export function impostaCountdown(attivo) {
  opzioni.countdown = attivo;
  salvaCountdown(attivo);
  mostraCountdown(attivo);
}

// Da chiamare all'avvio: legge la preferenza salvata e allinea interruttore e visibilità.
export function inizializzaCountdown() {
  opzioni.countdown = countdownSalvato();
  $('toggleCountdown').checked = opzioni.countdown;
  mostraCountdown(opzioni.countdown);
}
