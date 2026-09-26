// Punto di ingresso dell'applicazione.
// Inizializza l'interfaccia e collega tutti gli event listener: niente onclick/onchange
// inline nell'HTML, niente funzioni appese a `window`. Gli elementi generati
// dinamicamente (temi, voci, cartelle) usano la delega degli eventi tramite gli
// attributi data-azione impostati dal modulo che li disegna.

import { opzioni } from './state.js';
import { $, mostraModal, nascondiModal, modalAperto, impostaMenuDropdown } from './ui.js';
import { applyTheme, temaSalvato } from './temi.js';
import {
  inizializzaVoce, selezionaVoce, aggiornaParametriVoce, testaVoce,
  ripetiUltimoNumero, impostaLeggiCifre, fermaVoce
} from './voce.js';
import { suonoEstrazione } from './audio.js';
import { apriStorico, esportaStoricoTxt, esportaStoricoPDF, renderStorico } from './storico.js';
import {
  generaNuovaCartellaGioco, rimuoviCartellaGioco, apriCartelleGioco, renderCartelleGioco
} from './cartelle.js';
import { generaCartelle, paginePerCartelle, MINIMO_CARTELLE } from './cartelle-pdf.js';
import { aggiornaAnteprima, resetPercentuali, impostaBudget, mostraPremi } from './premi.js';
import { creaTabellone, generaNumero, ridisegnaEstrazione } from './estrazione.js';
import { toggleEstrazioneAutomatica, aggiornaIntervalloAuto, inizializzaAuto } from './auto.js';
import { avviaParticelle, fermaParticelle, riavviaParticelle } from './animazioni.js';
import {
  leggiPartitaSalvata, haPartitaDaRiprendere, applicaSalvataggio, cancellaPartitaSalvata
} from './salvataggio.js';
import { mostraDonazione } from './donazione.js';
import { resetEstrazione, nuovaPartita } from './reset.js';

// ===================== Interruttori del menu =====================

function collegaInterruttori() {
  $('toggleDetti').addEventListener('change', () => {
    opzioni.detti = $('toggleDetti').checked;
    if (!opzioni.detti) $('dettoNapoletano').textContent = '';
  });

  $('toggleAnimazioni').addEventListener('change', () => {
    opzioni.animazioni = $('toggleAnimazioni').checked;
    if (opzioni.animazioni) avviaParticelle();
    else fermaParticelle();
  });

  $('toggleSuoni').addEventListener('change', () => {
    opzioni.suoni = $('toggleSuoni').checked;
    if (opzioni.suoni) suonoEstrazione();
  });

  $('toggleVoce').addEventListener('change', () => {
    opzioni.voce = $('toggleVoce').checked;
    if (!opzioni.voce) fermaVoce();
  });

  $('toggleCifre').addEventListener('change', () => {
    impostaLeggiCifre($('toggleCifre').checked);
  });

  $('sliderVelocita').addEventListener('input', aggiornaParametriVoce);
  $('sliderTono').addEventListener('input', aggiornaParametriVoce);
}

// ===================== Menu ⚙️ e controlli principali =====================

function collegaControlli() {
  $('btnEstrai').addEventListener('click', generaNumero);
  $('btnRipeti').addEventListener('click', ripetiUltimoNumero);

  $('btnAutoEstrazione').addEventListener('click', toggleEstrazioneAutomatica);
  $('intervalloAuto').addEventListener('change', aggiornaIntervalloAuto);

  const collegaVoceDiMenu = (id, azione) => {
    $(id).addEventListener('click', (evento) => { evento.preventDefault(); azione(); });
  };
  collegaVoceDiMenu('menuReset', resetEstrazione);
  collegaVoceDiMenu('menuNuovaPartita', nuovaPartita);
  collegaVoceDiMenu('menuCartelle', () => mostraModal('cartelleModal'));
  collegaVoceDiMenu('menuApriCartelle', apriCartelleGioco);
  collegaVoceDiMenu('menuApriStorico', apriStorico);
  collegaVoceDiMenu('menuDonazione', mostraDonazione);
  collegaVoceDiMenu('menuTestaVoce', testaVoce);
}

// ===================== Contenuti generati dinamicamente (delega eventi) =====================

function collegaListeDinamiche() {
  // Temi: ogni voce ha data-azione="scegli-tema" e data-tema="<chiave>"
  $('listaTemi').addEventListener('click', (evento) => {
    const el = evento.target.closest('[data-azione="scegli-tema"]');
    if (!el) return;
    applyTheme(el.dataset.tema);
    riavviaParticelle();
  });

  // Voci: ogni voce ha data-azione="scegli-voce" e data-nome="<nome voce>"
  $('listaVociContainer').addEventListener('click', (evento) => {
    const el = evento.target.closest('[data-azione="scegli-voce"]');
    if (!el) return;
    selezionaVoce(el.dataset.nome);
  });

  // Le Mie Cartelle: il cestino ha data-azione="rimuovi-cartella" e data-id="<id>"
  $('cartelleGiocoContainer').addEventListener('click', (evento) => {
    const el = evento.target.closest('[data-azione="rimuovi-cartella"]');
    if (!el) return;
    rimuoviCartellaGioco(parseInt(el.dataset.id, 10));
  });
}

// ===================== Modali =====================

function collegaModali() {
  // Budget e premi: un solo listener delegato per i 6 campi numerici dell'anteprima.
  $('budgetModal').addEventListener('input', (evento) => {
    if (evento.target.matches('#budgetInput, #percAmbo, #percTerno, #percQuaterna, #percCinquina, #percTombola')) {
      aggiornaAnteprima();
    }
  });
  $('btnResetPercentuali').addEventListener('click', resetPercentuali);
  $('btnIniziaPartita').addEventListener('click', impostaBudget);

  // Le Mie Cartelle
  $('btnAggiungiCartella').addEventListener('click', generaNuovaCartellaGioco);

  // Storico
  $('btnEsportaStoricoTxt').addEventListener('click', esportaStoricoTxt);
  $('btnEsportaStoricoPDF').addEventListener('click', esportaStoricoPDF);

  // Modale "Genera Cartelle PDF": quantità libera, minimo 10.
  const aggiornaStimaPagine = () => {
    const quantita = Math.max(MINIMO_CARTELLE, parseInt($('quantitaCartelle').value, 10) || 0);
    $('cartelleStimaPagine').textContent = `≈ ${paginePerCartelle(quantita)} pagine (3 cartelle per foglio)`;
  };
  $('quantitaCartelle').addEventListener('input', aggiornaStimaPagine);
  $('btnCartelleMeno').addEventListener('click', () => {
    const attuale = parseInt($('quantitaCartelle').value, 10) || MINIMO_CARTELLE;
    $('quantitaCartelle').value = Math.max(MINIMO_CARTELLE, attuale - 10);
    aggiornaStimaPagine();
  });
  $('btnCartellePiu').addEventListener('click', () => {
    const attuale = parseInt($('quantitaCartelle').value, 10) || MINIMO_CARTELLE;
    $('quantitaCartelle').value = attuale + 10;
    aggiornaStimaPagine();
  });
  $('btnGeneraCartelle').addEventListener('click', () => {
    const quantita = parseInt($('quantitaCartelle').value, 10);
    if (isNaN(quantita) || quantita < MINIMO_CARTELLE) {
      alert(`Inserisci almeno ${MINIMO_CARTELLE} cartelle`);
      return;
    }
    generaCartelle(quantita);
    nascondiModal('cartelleModal');
  });
  aggiornaStimaPagine();
}

// ===================== Salvataggio: riprendi o inizia una nuova partita =====================

function inizializzaSalvataggio() {
  const salvataggio = leggiPartitaSalvata();

  if (!haPartitaDaRiprendere(salvataggio)) {
    mostraModal('budgetModal');
    return;
  }

  $('ripristinoNumeriCount').textContent = salvataggio.numeriEstratti.length;
  if (salvataggio.salvataIl) {
    $('ripristinoData').textContent = new Date(salvataggio.salvataIl).toLocaleString('it-IT');
    $('ripristinoDataWrap').classList.remove('d-none');
  } else {
    $('ripristinoDataWrap').classList.add('d-none');
  }

  const ripristinoEl = $('ripristinoModal');

  $('btnRiprendiPartita').addEventListener('click', () => {
    applicaSalvataggio(salvataggio);
    ridisegnaEstrazione();
    mostraPremi();
    renderStorico();
    renderCartelleGioco();
    nascondiModal('ripristinoModal');
  }, { once: true });

  $('btnNuovaPartitaDaRipristino').addEventListener('click', () => {
    cancellaPartitaSalvata();
    ripristinoEl.addEventListener('hidden.bs.modal', () => mostraModal('budgetModal'), { once: true });
    nascondiModal('ripristinoModal');
  }, { once: true });

  mostraModal('ripristinoModal');
}

// ===================== Avvio =====================

function inizializza() {
  creaTabellone();
  ridisegnaEstrazione();
  aggiornaAnteprima();
  impostaMenuDropdown();

  applyTheme(temaSalvato(), false);
  inizializzaVoce();
  inizializzaAuto();
  avviaParticelle();

  renderStorico();
  renderCartelleGioco();

  collegaInterruttori();
  collegaControlli();
  collegaListeDinamiche();
  collegaModali();

  document.addEventListener('keydown', (evento) => {
    if (modalAperto()) return;
    if (evento.key === 'Enter' || evento.key === ' ') {
      evento.preventDefault();
      generaNumero();
    }
  });

  inizializzaSalvataggio();
}

window.addEventListener('load', inizializza);
