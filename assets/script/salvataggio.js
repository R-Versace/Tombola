// Salvataggio automatico della partita in corso (localStorage) e ripristino all'avvio.
// Le caselle segnate sulle cartelle NON vengono salvate come tali: si ricalcolano sempre
// dai numeri estratti, così non possono mai andare fuori sincrono col tabellone.

import { stato } from './state.js';

const CHIAVE = 'tombolaPartita';

export function salvaPartita() {
  try {
    const mieCartelleSerializzate = stato.mieCartelle.map((c) => ({
      id: c.id,
      numeri: c.numeri,
      vinte: c.vinte
    }));

    const dati = {
      numeriEstratti: stato.numeriEstratti,
      tema: stato.tema,
      modalitaPremi: stato.modalitaPremi,
      premi: stato.premi,
      prossimoPremioId: stato.prossimoPremioId,
      mieCartelle: mieCartelleSerializzate,
      prossimoCartellaId: stato.prossimoCartellaId,
      storicoEventi: stato.storicoEventi,
      salvataIl: new Date().toISOString()
    };
    localStorage.setItem(CHIAVE, JSON.stringify(dati));
  } catch (e) { /* storage non disponibile o pieno: si continua senza salvare */ }
}

export function cancellaPartitaSalvata() {
  try { localStorage.removeItem(CHIAVE); } catch (e) { /* storage non disponibile */ }
}

export function leggiPartitaSalvata() {
  try {
    const grezzo = localStorage.getItem(CHIAVE);
    return grezzo ? JSON.parse(grezzo) : null;
  } catch (e) {
    return null;
  }
}

// Valida la struttura minima prima di proporre il ripristino: dati corrotti, o salvati da
// una versione precedente dell'app con un formato diverso, vengono ignorati senza errori.
export function haPartitaDaRiprendere(dati) {
  if (!dati || typeof dati !== 'object') return false;
  if (!Array.isArray(dati.numeriEstratti)) return false;
  if (!Array.isArray(dati.premi)) return false;
  if (!Array.isArray(dati.mieCartelle)) return false;
  return dati.numeriEstratti.length > 0 || dati.mieCartelle.length > 0 || dati.premi.length > 0;
}

export function applicaSalvataggio(dati) {
  stato.numeriEstratti = Array.isArray(dati.numeriEstratti) ? dati.numeriEstratti : [];
  stato.tema = typeof dati.tema === 'string' ? dati.tema : stato.tema;
  stato.modalitaPremi = (dati.modalitaPremi === 'budget' || dati.modalitaPremi === 'lista') ? dati.modalitaPremi : null;
  stato.premi = Array.isArray(dati.premi) ? dati.premi : [];
  stato.prossimoPremioId = Number.isInteger(dati.prossimoPremioId) ? dati.prossimoPremioId : stato.premi.length + 1;
  stato.prossimoCartellaId = Number.isInteger(dati.prossimoCartellaId) ? dati.prossimoCartellaId : 1;
  stato.storicoEventi = Array.isArray(dati.storicoEventi) ? dati.storicoEventi : [];

  stato.mieCartelle = (Array.isArray(dati.mieCartelle) ? dati.mieCartelle : []).map((c) => {
    const carta = {
      id: c.id,
      numeri: c.numeri,
      segnati: new Set(),
      vinte: c.vinte || { ambo: false, terno: false, quaterna: false, cinquina: false, tombola: false }
    };
    // Ricalcola le caselle segnate dai numeri già estratti, invece di fidarsi di un
    // eventuale elenco salvato: così cartella e tabellone restano sempre coerenti.
    stato.numeriEstratti.forEach((n) => {
      if (carta.numeri.some((riga) => riga.includes(n))) carta.segnati.add(n);
    });
    return carta;
  });
}
