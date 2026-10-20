// Voce del banditore: sintesi vocale (Web Speech API), scelta automatica della voce
// italiana più naturale disponibile, lettura "alla banditore" e pulsante Ripeti.

import { opzioni } from './state.js';
import { $ } from './ui.js';
import { cifrePerCifra } from './lettura.js';

const supportoVoce = ('speechSynthesis' in window);
let vociDisponibili = [];
let voceSelezionataNome = null;
let voceRate = 0.95;
let vocePitch = 1.0;
let ultimoTestoPronunciato = null;

try {
  voceSelezionataNome = localStorage.getItem('tombolaVoceNome') || null;
  voceRate = parseFloat(localStorage.getItem('tombolaVoceRate')) || 0.95;
  vocePitch = parseFloat(localStorage.getItem('tombolaVocePitch')) || 1.0;
} catch (e) { /* storage non disponibile */ }

function caricaVociDisponibili() {
  if (!supportoVoce) return;
  vociDisponibili = speechSynthesis.getVoices();
  renderListaVoci();
}

// Assegna un punteggio di "naturalezza" a ciascuna voce disponibile, per proporre di
// default quella meno robotica sul dispositivo dell'utente.
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
  if (!v.localService) p += 1; // le voci di rete sono spesso più naturali
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
  return italiane[0];
}

function renderListaVoci() {
  const cont = $('listaVociContainer');
  if (!cont) return;
  const italiane = vociItalianeOrdinate();
  if (italiane.length === 0) {
    cont.innerHTML = '<div class="text-muted small px-1">Nessuna voce italiana trovata sul dispositivo</div>';
    return;
  }
  const vocePreferita = scegliVoceItaliana();
  const nomeAttiva = vocePreferita ? vocePreferita.name : null;
  cont.innerHTML = italiane.map((v) => {
    const attiva = v.name === nomeAttiva ? 'attiva' : '';
    return `<div class="voce-scelta ${attiva}" title="${v.name}" data-azione="scegli-voce" data-nome="${v.name.replace(/"/g, '&quot;')}">${v.name}</div>`;
  }).join('');
}

export function selezionaVoce(nome) {
  voceSelezionataNome = nome;
  try { localStorage.setItem('tombolaVoceNome', nome); } catch (e) { /* storage non disponibile */ }
  renderListaVoci();
  pronunciaTesto('Ciao, sono io la nuova voce del banditore!');
}

export function aggiornaParametriVoce() {
  voceRate = parseFloat($('sliderVelocita').value) || 0.95;
  vocePitch = parseFloat($('sliderTono').value) || 1.0;
  try {
    localStorage.setItem('tombolaVoceRate', voceRate);
    localStorage.setItem('tombolaVocePitch', vocePitch);
  } catch (e) { /* storage non disponibile */ }
}

function pronunciaTesto(testo) {
  if (!opzioni.voce) return;
  if (!supportoVoce) {
    console.warn('Questo browser non supporta la sintesi vocale (Web Speech API).');
    return;
  }
  ultimoTestoPronunciato = testo;
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

export function fermaVoce() {
  if (supportoVoce) speechSynthesis.cancel();
}

export function testaVoce() {
  pronunciaTesto('Prova voce. Si sente il banditore?');
}

// Annuncia un numero appena estratto, nello stile "alla banditore": il numero (la sintesi
// vocale legge "47" come "quarantasette" naturalmente), il detto napoletano se attivo, e
// infine le cifre lette una per una per chi non ha sentito bene il primo annuncio.
export function annunciaNumero(numero, detto) {
  const parti = [String(numero)];
  if (opzioni.detti && detto) parti.push(detto);
  if (opzioni.leggiCifre && numero >= 10) parti.push(cifrePerCifra(numero));
  pronunciaTesto(parti.join('. '));
}

export function ripetiUltimoNumero() {
  if (!ultimoTestoPronunciato) return;
  pronunciaTesto(ultimoTestoPronunciato);
}

export function impostaLeggiCifre(attivo) {
  opzioni.leggiCifre = attivo;
}

export function inizializzaVoce() {
  $('sliderVelocita').value = voceRate;
  $('sliderTono').value = vocePitch;
  renderListaVoci();
  if (supportoVoce) {
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
}
