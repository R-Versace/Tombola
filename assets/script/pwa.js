// PWA: registra il service worker (uso offline) e gestisce il pulsante "Installa l'app".
//
// - Chrome, Edge e Android: il browser lancia "beforeinstallprompt"; lo si conserva e lo si
//   mostra quando l'utente sceglie "📲 Installa l'app" dal menu.
// - iPhone/iPad (Safari): non esiste un prompt automatico, quindi la voce del menu spiega
//   come aggiungere l'app alla schermata Home.
// - Se l'app è già installata (o aperta in modalità standalone) la voce resta nascosta.

import { $ } from './ui.js';

let promptInstallazione = null;

const eStandalone = () => (
  window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true
);

const eIOS = () => (
  /iphone|ipad|ipod/i.test(navigator.userAgent)
  || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
);

function aggiornaVoceInstalla() {
  const voce = $('voceInstalla');
  if (!voce) return;
  const mostra = !eStandalone() && (promptInstallazione !== null || eIOS());
  voce.classList.toggle('d-none', !mostra);
}

export async function installaApp() {
  if (promptInstallazione) {
    promptInstallazione.prompt();
    try { await promptInstallazione.userChoice; } catch (e) { /* scelta non disponibile */ }
    promptInstallazione = null; // il prompt si può usare una sola volta
    aggiornaVoceInstalla();
    return;
  }
  if (eIOS()) {
    alert(
      "Per installare l'app su iPhone o iPad:\n\n"
      + '1. Tocca il pulsante Condividi (il quadrato con la freccia) in Safari\n'
      + '2. Scegli "Aggiungi alla schermata Home"\n'
      + '3. Conferma con "Aggiungi"'
    );
  }
}

export function inizializzaPWA() {
  window.addEventListener('beforeinstallprompt', (evento) => {
    evento.preventDefault(); // niente mini-barra automatica: si usa la voce del menu
    promptInstallazione = evento;
    aggiornaVoceInstalla();
  });

  window.addEventListener('appinstalled', () => {
    promptInstallazione = null;
    aggiornaVoceInstalla();
  });

  aggiornaVoceInstalla();

  // Il service worker funziona solo su HTTPS (o localhost): altrove si salta senza errori.
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('service-worker.js').catch((errore) => {
      console.warn('Service worker non registrato:', errore);
    });
  }
}
