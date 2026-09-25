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
import { generaCartelle } from './cartelle-pdf.js';
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
  collegaVoceDiMenu('menuCartelle50', () => generaCartelle(50));
  collegaVoceDiMenu('menuCartelle100', () => generaCartelle(100));
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

  // Modale "Genera Cartelle PDF" (raggiungibile in futuro da un pulsante dedicato)
  $('cartelleModalBtn50')?.addEventListener('click', () => generaCartelle(50));
  $('cartelleModalBtn100')?.addEventListener('click', () => generaCartelle(100));
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
