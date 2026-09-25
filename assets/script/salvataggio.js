// Salvataggio automatico della partita in localStorage.
//
// Si salva a ogni cambiamento (estrazione, premio assegnato, cartella aggiunta/rimossa,
// reset, nuovo budget). All'avvio, se c'è una partita in corso, l'app propone di riprenderla.
//
// Nota sui dati salvati: le caselle segnate sulle cartelle NON vengono salvate, perché si
// ricavano dai numeri estratti; così non possono mai andare fuori sincrono con il tabellone.

import { stato, creaPremiIniziali, TIPI_PREMIO } from './state.js';

const CHIAVE = 'tombolaPartita';
const VERSIONE = 1;

// ---------- Salvataggio ----------

export function salvaPartita() {
  try {
    const snapshot = {
      versione: VERSIONE,
      salvataIl: Date.now(),
      numeriEstratti: stato.numeriEstratti,
      premi: stato.premi,
      storicoEventi: stato.storicoEventi,
      prossimoCartellaId: stato.prossimoCartellaId,
      mieCartelle: stato.mieCartelle.map((c) => ({ id: c.id, numeri: c.numeri, vinte: c.vinte }))
    };
    localStorage.setItem(CHIAVE, JSON.stringify(snapshot));
  } catch (e) {
    // localStorage non disponibile (navigazione privata, quota piena...): si gioca senza salvataggio
  }
}

export function cancellaPartitaSalvata() {
  try { localStorage.removeItem(CHIAVE); } catch (e) { /* niente da fare */ }
}

// ---------- Lettura e validazione ----------

const interoTra = (n, min, max) => Number.isInteger(n) && n >= min && n <= max;

function validaCartella(c) {
  if (!c || !interoTra(c.id, 1, Number.MAX_SAFE_INTEGER)) return null;
  if (!Array.isArray(c.numeri) || c.numeri.length !== 3) return null;
  for (const riga of c.numeri) {
    if (!Array.isArray(riga) || riga.length !== 9) return null;
    if (!riga.every((n) => n === null || interoTra(n, 1, 90))) return null;
  }
  const vinte = {};
  TIPI_PREMIO.forEach((tipo) => { vinte[tipo] = !!(c.vinte && c.vinte[tipo]); });
  return { id: c.id, numeri: c.numeri, vinte };
}

// Restituisce una versione "pulita" del salvataggio, oppure null se i dati non sono affidabili.
function valida(grezzo) {
  if (!grezzo || typeof grezzo !== 'object' || grezzo.versione !== VERSIONE) return null;

  const numeri = grezzo.numeriEstratti;
  if (!Array.isArray(numeri) || !numeri.every((n) => interoTra(n, 1, 90))) return null;
  if (new Set(numeri).size !== numeri.length) return null;

  const premi = creaPremiIniziali();
  TIPI_PREMIO.forEach((tipo) => {
    const p = grezzo.premi && grezzo.premi[tipo];
    if (!p) return;
    const importo = parseFloat(p.importo);
    premi[tipo].importo = Number.isFinite(importo) && importo >= 0 ? importo.toFixed(2) : 0;
    premi[tipo].vinto = !!p.vinto;
  });

  const storico = Array.isArray(grezzo.storicoEventi)
    ? grezzo.storicoEventi
        .filter((e) => e && typeof e.testo === 'string')
        .map((e) => ({
          testo: e.testo,
          evento: !!e.evento,
          orario: typeof e.orario === 'string' ? e.orario : ''
        }))
    : [];

  const cartelle = Array.isArray(grezzo.mieCartelle)
    ? grezzo.mieCartelle.map(validaCartella).filter(Boolean)
    : [];

  const idMassimo = cartelle.reduce((max, c) => Math.max(max, c.id), 0);
  const prossimo = interoTra(grezzo.prossimoCartellaId, 1, Number.MAX_SAFE_INTEGER)
    ? Math.max(grezzo.prossimoCartellaId, idMassimo + 1)
    : idMassimo + 1;

  return {
    salvataIl: Number.isFinite(grezzo.salvataIl) ? grezzo.salvataIl : null,
    numeriEstratti: numeri,
    premi,
    storicoEventi: storico,
    mieCartelle: cartelle,
    prossimoCartellaId: prossimo
  };
}

export function leggiPartitaSalvata() {
  try {
    const testo = localStorage.getItem(CHIAVE);
    if (!testo) return null;
    return valida(JSON.parse(testo));
  } catch (e) {
    return null;
  }
}

// Vale la pena proporre la ripresa solo se c'è davvero qualcosa da riprendere.
export function haPartitaDaRiprendere(salvataggio) {
  return !!salvataggio && (salvataggio.numeriEstratti.length > 0 || salvataggio.mieCartelle.length > 0);
}

// ---------- Ripristino ----------

// Copia il salvataggio (già validato) nello stato dell'app. Non tocca l'interfaccia:
// dopo la chiamata bisogna ridisegnare tabellone, premi, storico e cartelle.
export function applicaSalvataggio(salvataggio) {
  const estratti = new Set(salvataggio.numeriEstratti);

  stato.numeriEstratti = salvataggio.numeriEstratti.slice();
  TIPI_PREMIO.forEach((tipo) => { Object.assign(stato.premi[tipo], salvataggio.premi[tipo]); });
  stato.storicoEventi = salvataggio.storicoEventi.slice();
  stato.prossimoCartellaId = salvataggio.prossimoCartellaId;
  stato.mieCartelle = salvataggio.mieCartelle.map((c) => ({
    id: c.id,
    numeri: c.numeri,
    vinte: c.vinte,
    segnati: new Set(c.numeri.flat().filter((n) => n !== null && estratti.has(n)))
  }));
}
