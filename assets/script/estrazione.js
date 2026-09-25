// Tabellone e estrazione dei numeri.

import { stato, opzioni } from './state.js';
import { $ } from './ui.js';
import { dettiNapoletani } from './detti.js';
import { suonoEstrazione } from './audio.js';
import { annunciaNumero, pronunciaTesto } from './voce.js';
import { mostraPersonaggio } from './animazioni.js';
import { aggiungiStorico } from './storico.js';
import { verificaVinciteCartelle } from './cartelle.js';
import { salvaPartita } from './salvataggio.js';

export const EVENTO_FINE_PARTITA = 'tombola:finita';

export function creaTabellone() {
  const tabellone = $('tabellone');

  // Crea 6 cartelle
  for (let cartella = 0; cartella < 6; cartella++) {
    const cartellaDiv = document.createElement('div');
    cartellaDiv.className = 'cartella';

    // Calcola il blocco di 30 numeri (0-29, 30-59, 60-89)
    const blocco = Math.floor(cartella / 2);
    // Calcola l'offset all'interno del blocco (0-4 o 5-9)
    const offset = (cartella % 2) * 5;

    // Per ogni cartella, crea 15 numeri disposti per righe
    for (let riga = 0; riga < 3; riga++) {
      for (let colonna = 0; colonna < 5; colonna++) {
        const numero = (blocco * 30) + offset + colonna + 1 + (riga * 10);

        const div = document.createElement('div');
        div.className = 'numero';
        div.id = 'num-' + numero;
        div.innerText = numero;
        cartellaDiv.appendChild(div);
      }
    }

    tabellone.appendChild(cartellaDiv);
  }
}

function aggiornaUltimiNumeri() {
  const ultimi = stato.numeriEstratti.slice(-5).reverse();
  $('ultimiNumeri').innerHTML = ultimi.map((n) => `<div class="ultimo-mini">${n}</div>`).join('');
}

// Ridisegna tabellone, ultimo numero, contatore e ultimi 5 a partire dallo stato.
// Serve dopo un ripristino o un reset, e a ogni nuova estrazione.
export function ridisegnaEstrazione() {
  const estratti = stato.numeriEstratti;

  document.querySelectorAll('.numero').forEach((el) => el.classList.remove('estratto'));
  estratti.forEach((n) => { const cella = $('num-' + n); if (cella) cella.classList.add('estratto'); });

  if (estratti.length === 0) {
    $('ultimoNumero').innerHTML = '<span class="text-muted" style="font-size: 0.6em;">--</span>';
    $('dettoNapoletano').textContent = '';
  } else {
    const ultimo = estratti[estratti.length - 1];
    $('ultimoNumero').innerHTML = `<span>${ultimo}</span>`;
    $('dettoNapoletano').textContent = opzioni.detti ? (dettiNapoletani[ultimo] || '') : '';
  }

  aggiornaUltimiNumeri();
  $('contatore').textContent = estratti.length;
  $('btnRipeti').disabled = estratti.length === 0;
}

export function applicaNumeroEstratto(numero) {
  if (stato.numeriEstratti.includes(numero)) return;
  stato.numeriEstratti.push(numero);
  ridisegnaEstrazione();

  suonoEstrazione();
  if (opzioni.animazioni) mostraPersonaggio(numero);
  annunciaNumero(numero);

  const detto = dettiNapoletani[numero];
  aggiungiStorico(`Estratto il numero ${numero}${detto ? ' - ' + detto : ''}`);
  verificaVinciteCartelle(numero);
  salvaPartita();
}

export function generaNumero() {
  if (stato.numeriEstratti.length >= 90) {
    alert('Tutti i numeri sono stati estratti!');
    pronunciaTesto('Tutti i numeri sono stati estratti!');
    // l'estrazione automatica (auto.js) ascolta questo evento e si ferma
    document.dispatchEvent(new CustomEvent(EVENTO_FINE_PARTITA));
    return;
  }

  let numero;
  do {
    numero = Math.floor(Math.random() * 90) + 1;
  } while (stato.numeriEstratti.includes(numero));

  applicaNumeroEstratto(numero);
}
