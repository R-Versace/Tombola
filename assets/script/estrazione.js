// Tabellone e logica di estrazione dei numeri.

import { stato, opzioni } from './state.js';
import { $ } from './ui.js';
import { dettiNapoletani } from './detti.js';
import { suonoEstrazione } from './audio.js';
import { annunciaNumero } from './voce.js';
import { mostraPersonaggio } from './animazioni.js';
import { aggiungiStorico } from './storico.js';
import { verificaVinciteCartelle } from './cartelle.js';
import { salvaPartita } from './salvataggio.js';

export function creaTabellone() {
  const tabellone = $('tabellone');
  tabellone.innerHTML = '';

  // Crea 6 cartelle del tabellone (non quelle dei giocatori: qui sono solo i 90 numeri)
  for (let cartella = 0; cartella < 6; cartella++) {
    const cartellaDiv = document.createElement('div');
    cartellaDiv.className = 'cartella';

    const blocco = Math.floor(cartella / 2);
    const offset = (cartella % 2) * 5;

    for (let riga = 0; riga < 3; riga++) {
      for (let colonna = 0; colonna < 5; colonna++) {
        const numero = (blocco * 30) + offset + colonna + 1 + (riga * 10);
        const div = document.createElement('div');
        div.className = 'numero';
        div.id = 'num-' + numero;
        div.textContent = numero;
        cartellaDiv.appendChild(div);
      }
    }

    tabellone.appendChild(cartellaDiv);
  }
}

function aggiornaUltimiNumeri() {
  const container = $('ultimiNumeri');
  const ultimi = stato.numeriEstratti.slice(-5).reverse();
  container.innerHTML = ultimi.map((n) => `<div class="ultimo-mini">${n}</div>`).join('');
}

// Ridisegna lo stato dell'estrazione sul tabellone: serve dopo un ripristino o un reset,
// e a ogni nuova estrazione.
export function ridisegnaEstrazione() {
  const estratti = stato.numeriEstratti;
  document.querySelectorAll('.numero').forEach((el) => {
    el.classList.toggle('estratto', estratti.includes(parseInt(el.id.replace('num-', ''), 10)));
  });

  const ultimoNumero = $('ultimoNumero');
  if (estratti.length === 0) {
    ultimoNumero.innerHTML = '<span class="text-muted" style="font-size: 0.6em;">--</span>';
  } else {
    ultimoNumero.innerHTML = `<span>${estratti[estratti.length - 1]}</span>`;
  }

  aggiornaUltimiNumeri();
  $('contatore').textContent = estratti.length;
  $('btnRipeti').disabled = estratti.length === 0;
}

export function applicaNumeroEstratto(numero) {
  if (stato.numeriEstratti.includes(numero)) return;
  stato.numeriEstratti.push(numero);

  const cella = $('num-' + numero);
  if (cella) cella.classList.add('estratto');
  $('ultimoNumero').innerHTML = `<span>${numero}</span>`;
  $('contatore').textContent = stato.numeriEstratti.length;
  $('btnRipeti').disabled = false;

  const detto = dettiNapoletani[numero] || '';
  if (opzioni.detti) $('dettoNapoletano').textContent = detto;
  else $('dettoNapoletano').textContent = '';

  aggiornaUltimiNumeri();
  suonoEstrazione();

  if (opzioni.animazioni) mostraPersonaggio(numero);

  annunciaNumero(numero, detto);

  aggiungiStorico(`Estratto il numero ${numero}${detto ? ' - ' + detto : ''}`);
  verificaVinciteCartelle(numero);
  salvaPartita();
}

export function generaNumero() {
  if (stato.numeriEstratti.length >= 90) {
    alert('Tutti i numeri sono stati estratti!');
    return;
  }

  let numero;
  do {
    numero = Math.floor(Math.random() * 90) + 1;
  } while (stato.numeriEstratti.includes(numero));

  applicaNumeroEstratto(numero);
}
