// Cartelle: generazione di una cartella valida e "Le mie cartelle",
// cioè cartelle personali segnate automaticamente a ogni estrazione.

import { stato } from './state.js';
import { $, mostraModal, mostraToast } from './ui.js';
import { aggiungiStorico } from './storico.js';
import { suonoVincita, suonoTombola } from './audio.js';
import { salvaPartita } from './salvataggio.js';

export function generaCartellaValida() {
  let cartella = Array(3).fill().map(() => Array(9).fill(null));
  
  for (let riga = 0; riga < 3; riga++) {
    let colonne = [];
    while (colonne.length < 5) {
      let col = Math.floor(Math.random() * 9);
      if (!colonne.includes(col)) colonne.push(col);
    }
    colonne.sort((a, b) => a - b);
    
    colonne.forEach(col => {
      let min = col === 0 ? 1 : col * 10;
      let max = col === 8 ? 90 : (col + 1) * 10 - 1;
      let num;
      do {
        num = Math.floor(Math.random() * (max - min + 1)) + min;
      } while (cartella.some(r => r[col] === num));
      cartella[riga][col] = num;
    });
  }
  
  return cartella;
}

// Il menu ⚙️ si apre verso l'alto (i controlli stanno in fondo alla pagina):

const NOMI_VINCITA = { ambo: 'Ambo', terno: 'Terno', quaterna: 'Quaterna', cinquina: 'Cinquina', tombola: 'TOMBOLA! 🎉' };
const RINTOCCHI = { ambo: 1, terno: 2, quaterna: 3, cinquina: 4 };
const LIVELLI_RIGA = [['ambo', 2], ['terno', 3], ['quaterna', 4], ['cinquina', 5]];

export function generaNuovaCartellaGioco() {
  const carta = {
    id: stato.prossimoCartellaId++,
    numeri: generaCartellaValida(),
    segnati: new Set(),
    vinte: { ambo: false, terno: false, quaterna: false, cinquina: false, tombola: false }
  };
  stato.mieCartelle.push(carta);
  // Applica subito i numeri già estratti
  stato.numeriEstratti.forEach((n) => marcaCartellaSeNecessario(carta, n));
  renderCartelleGioco();
  salvaPartita();
}

export function rimuoviCartellaGioco(id) {
  stato.mieCartelle = stato.mieCartelle.filter((c) => c.id !== id);
  renderCartelleGioco();
  salvaPartita();
}

// Nuova partita / reset: le cartelle restano, ma senza numeri segnati né vincite.
export function azzeraCartelle() {
  stato.mieCartelle.forEach((carta) => {
    carta.segnati = new Set();
    carta.vinte = { ambo: false, terno: false, quaterna: false, cinquina: false, tombola: false };
  });
}

function marcaCartellaSeNecessario(carta, numero) {
  const presente = carta.numeri.some((riga) => riga.includes(numero));
  if (presente) carta.segnati.add(numero);
  return presente;
}

export function verificaVinciteCartelle(numero) {
  stato.mieCartelle.forEach((carta) => {
    if (!marcaCartellaSeNecessario(carta, numero)) return;

    carta.numeri.forEach((riga) => {
      const count = riga.filter((n) => n !== null && carta.segnati.has(n)).length;
      LIVELLI_RIGA.forEach(([tipo, soglia]) => {
        if (count >= soglia && !carta.vinte[tipo]) {
          carta.vinte[tipo] = true;
          segnalaVincitaCartella(carta, tipo);
        }
      });
    });

    const totaleNumeri = carta.numeri.flat().filter((n) => n !== null);
    const totaleSegnati = totaleNumeri.filter((n) => carta.segnati.has(n));
    if (totaleSegnati.length === totaleNumeri.length && !carta.vinte.tombola) {
      carta.vinte.tombola = true;
      segnalaVincitaCartella(carta, 'tombola');
    }
  });
  renderCartelleGioco();
}

function segnalaVincitaCartella(carta, tipo) {
  const nome = NOMI_VINCITA[tipo];
  aggiungiStorico(`🏆 ${nome} sulla Cartella #${carta.id}!`, true);
  if (tipo === 'tombola') suonoTombola();
  else suonoVincita(RINTOCCHI[tipo] || 1);
  mostraToast(`Cartella #${carta.id}: ${nome}!`);
}

export function renderCartelleGioco() {
  const cont = $('cartelleGiocoContainer');
  if (!cont) return;
  if (stato.mieCartelle.length === 0) {
    cont.innerHTML = '<p class="text-muted text-center">Nessuna cartella ancora. Aggiungine una!</p>';
    return;
  }
  cont.innerHTML = stato.mieCartelle.map((carta) => {
    const celle = carta.numeri.map((riga) => riga.map((n) => {
      if (n === null) return '<div class="numero-mini vuoto"></div>';
      const segnato = carta.segnati.has(n) ? 'segnato' : '';
      return `<div class="numero-mini ${segnato}">${n}</div>`;
    }).join('')).join('');
    const badges = ['ambo', 'terno', 'quaterna', 'cinquina', 'tombola'].map((tipo) => {
      const ottenuta = carta.vinte[tipo] ? 'ottenuta' : '';
      const nome = tipo.charAt(0).toUpperCase() + tipo.slice(1);
      return `<span class="badge-vincita ${ottenuta}">${nome}</span>`;
    }).join('');
    return `
      <div class="cartella-gioco-wrapper">
        <div class="cartella-gioco-header">
          <span class="cartella-gioco-titolo">Cartella #${carta.id}</span>
          <button class="btn btn-sm btn-outline-danger" data-azione="rimuovi-cartella" data-id="${carta.id}">🗑️</button>
        </div>
        <div class="cartella-gioco-grid">${celle}</div>
        <div>${badges}</div>
      </div>
    `;
  }).join('');
}

export function apriCartelleGioco() {
  renderCartelleGioco();
  mostraModal('cartelleGiocoModal');
}
