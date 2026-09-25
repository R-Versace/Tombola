// Voce del banditore (Web Speech API): scelta della voce, velocità, tono,
// lettura "alla banditore" dei numeri e ripetizione dell'ultimo numero.

import { stato, opzioni } from './state.js';
import { dettiNapoletani } from './detti.js';
import { testoAnnuncio } from './lettura.js';
import { $, escapeHtml, mostraToast } from './ui.js';

const supportoVoce = ('speechSynthesis' in window);
let vociDisponibili = [];
let voceSelezionataNome = null;
let voceRate = 0.95;
let vocePitch = 1.0;

// ---------- Preferenze salvate ----------

function caricaPreferenze() {
  try {
    voceSelezionataNome = localStorage.getItem('tombolaVoceNome') || null;
    voceRate = parseFloat(localStorage.getItem('tombolaVoceRate')) || 0.95;
    vocePitch = parseFloat(localStorage.getItem('tombolaVocePitch')) || 1.0;
    // la lettura delle cifre è attiva di default: si salva solo se l'utente la spegne
    opzioni.leggiCifre = localStorage.getItem('tombolaLeggiCifre') !== '0';
  } catch (e) { /* si usano i valori di default */ }
}

export function impostaLeggiCifre(attiva) {
  opzioni.leggiCifre = attiva;
  try { localStorage.setItem('tombolaLeggiCifre', attiva ? '1' : '0'); } catch (e) { /* non salvata */ }
}

// ---------- Elenco delle voci ----------

function caricaVociDisponibili() {
  if (!supportoVoce) return;
  vociDisponibili = speechSynthesis.getVoices();
  renderListaVoci();
}

// Assegna un punteggio di "naturalezza" a ciascuna voce disponibile,
// per proporre di default quella meno robotica sul dispositivo dell'utente.
function punteggioVoce(v) {
  let p = 0;
  const n = (v.name || '').toLowerCase();
  if (v.lang === 'it-IT') p += 5;
  else if (v.lang && v.lang.toLowerCase().startsWith('it')) p += 2;
  if (n.includes('neural') || n.includes('online') || n.includes('natural')) p += 6;
  if (n.includes('google')) p += 4;
  if (n.includes('multilingual')) p += 2;
  if (n.includes('federica') || n.includes('elsa') || n.includes('alice') || n.includes('female')) p += 2;
  if (n.includes('compact')) p -= 3;
  if (n.includes('espeak') || n.includes('e-speak')) p -= 5;
  if (!v.localService) p += 1; // le voci di rete (Google/Microsoft Online) sono spesso più naturali
  return p;
}

function vociItalianeOrdinate() {
  return vociDisponibili
    .filter((v) => v.lang && v.lang.toLowerCase().startsWith('it'))
    .sort((a, b) => punteggioVoce(b) - punteggioVoce(a));
}

function scegliVoceItaliana() {
  const italiane = vociItalianeOrdinate();
  if (italiane.length === 0) return null;
  if (voceSelezionataNome) {
    const scelta = italiane.find((v) => v.name === voceSelezionataNome);
    if (scelta) return scelta;
  }
  return italiane[0]; // la migliore secondo il punteggio
}

export function renderListaVoci() {
  const cont = $('listaVociContainer');
  if (!cont) return;
  const italiane = vociItalianeOrdinate();
  if (italiane.length === 0) {
    cont.innerHTML = '<div class="text-muted small px-1">Nessuna voce italiana trovata sul dispositivo</div>';
    return;
  }
  const nomeAttiva = scegliVoceItaliana()?.name;
  cont.innerHTML = italiane.map((v) => {
    const attiva = v.name === nomeAttiva ? 'attiva' : '';
    const nome = escapeHtml(v.name);
    return `<div class="voce-scelta ${attiva}" title="${nome}" data-azione="scegli-voce" data-nome="${nome}">${nome}</div>`;
  }).join('');
}

export function selezionaVoce(nome) {
  voceSelezionataNome = nome;
  try { localStorage.setItem('tombolaVoceNome', nome); } catch (e) { /* non salvata */ }
  renderListaVoci();
  pronunciaTesto('Ciao, sono io la nuova voce del banditore!');
}

export function aggiornaParametriVoce() {
  voceRate = parseFloat($('sliderVelocita').value) || 0.95;
  vocePitch = parseFloat($('sliderTono').value) || 1.0;
  try {
    localStorage.setItem('tombolaVoceRate', voceRate);
    localStorage.setItem('tombolaVocePitch', vocePitch);
  } catch (e) { /* non salvate */ }
}

// ---------- Parlato ----------

export function fermaVoce() {
  if (supportoVoce) speechSynthesis.cancel();
}

export function pronunciaTesto(testo) {
  if (!opzioni.voce) return;
  if (!supportoVoce) {
    console.warn('Questo browser non supporta la sintesi vocale (Web Speech API).');
    return;
  }
  try {
    // Annulla eventuali frasi accodate/bloccate prima di parlare
    speechSynthesis.cancel();

    const parla = () => {
      const msg = new SpeechSynthesisUtterance(testo);
      msg.lang = 'it-IT';
      msg.rate = voceRate;
      msg.pitch = vocePitch;
      const voce = scegliVoceItaliana();
      if (voce) msg.voice = voce;
      msg.onerror = (e) => console.warn('Errore sintesi vocale:', e.error);
      speechSynthesis.speak(msg);
    };

    if (vociDisponibili.length === 0) caricaVociDisponibili();
    // Piccolo ritardo: su alcuni browser, parlare subito dopo cancel() viene ignorato
    setTimeout(parla, 60);
  } catch (e) {
    console.warn('Sintesi vocale non disponibile:', e);
  }
}

export function testaVoce() {
  pronunciaTesto('Prova voce. Si sente il banditore?');
}

// ---------- Lettura alla banditore ----------

// "quarantasette. quattro, sette. <detto>" (il detto solo se attivo nel menu)
export function annunciaNumero(numero) {
  pronunciaTesto(testoAnnuncio(numero, {
    detto: opzioni.detti ? dettiNapoletani[numero] : '',
    leggiCifre: opzioni.leggiCifre
  }));
}

export function ripetiUltimoNumero() {
  const estratti = stato.numeriEstratti;
  if (estratti.length === 0) return;
  if (!opzioni.voce) {
    mostraToast('La voce del banditore è disattivata', '🔇');
    return;
  }
  annunciaNumero(estratti[estratti.length - 1]);
}

// ---------- Avvio ----------

export function inizializzaVoce() {
  caricaPreferenze();

  // Sincronizza slider e interruttore con le preferenze salvate
  $('sliderVelocita').value = voceRate;
  $('sliderTono').value = vocePitch;
  $('toggleCifre').checked = opzioni.leggiCifre;

  if (!supportoVoce) return;
  caricaVociDisponibili();
  speechSynthesis.addEventListener('voiceschanged', caricaVociDisponibili);

  // Bug noto di Chrome: la sintesi vocale si "blocca" dopo ~15s di inattività.
  // Questo workaround la mantiene sveglia mentre sta parlando.
  setInterval(() => {
    if (speechSynthesis.speaking && !speechSynthesis.paused) {
      speechSynthesis.pause();
      speechSynthesis.resume();
    }
  }, 8000);
}
