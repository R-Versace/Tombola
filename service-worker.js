// Service worker: rende l'app installabile e utilizzabile anche senza connessione.
//
// Strategia:
// - File dell'app (HTML, CSS, JS, icone): "prima la rete, poi la cache". Online si ricevono
//   sempre i file più recenti (e tutti della stessa versione, importante per i moduli ES);
//   se la rete manca o è troppo lenta si usa l'ultima copia salvata.
// - Librerie su CDN (Bootstrap, jsPDF): "prima la cache", perché l'URL contiene la versione.
// - Tutto il resto (Google Analytics, PayPal...): non viene toccato.
//
// QUANDO AGGIUNGI UN NUOVO FILE all'app, aggiungilo anche a FILE_APP qui sotto e cambia
// VERSIONE_CACHE, così gli utenti scaricano la nuova versione.

const VERSIONE_CACHE = 'tombola-v1';
const CACHE_APP = `${VERSIONE_CACHE}-app`;
const CACHE_CDN = `${VERSIONE_CACHE}-cdn`;
const TIMEOUT_RETE_MS = 4000;

const FILE_APP = [
  './',
  'index.html',
  'manifest.json',
  'icon-192.png',
  'icon-512.png',
  'icon-maskable-512.png',
  'apple-touch-icon.png',
  'assets/css/style.css',
  'assets/favicon/favicon.svg',
  'assets/script/animazioni.js',
  'assets/script/audio.js',
  'assets/script/auto.js',
  'assets/script/cartelle-pdf.js',
  'assets/script/cartelle.js',
  'assets/script/coriandoli.js',
  'assets/script/countdown.js',
  'assets/script/detti.js',
  'assets/script/donazione.js',
  'assets/script/estrazione.js',
  'assets/script/lettura.js',
  'assets/script/main.js',
  'assets/script/premi.js',
  'assets/script/pwa.js',
  'assets/script/reset.js',
  'assets/script/sacchetto.js',
  'assets/script/salvataggio.js',
  'assets/script/state.js',
  'assets/script/storico.js',
  'assets/script/temi.js',
  'assets/script/ui.js',
  'assets/script/voce.js'
];

const FILE_CDN = [
  'https://cdnjs.cloudflare.com/ajax/libs/bootstrap/5.3.2/css/bootstrap.min.css',
  'https://cdnjs.cloudflare.com/ajax/libs/bootstrap/5.3.2/js/bootstrap.bundle.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js'
];

self.addEventListener('install', (evento) => {
  evento.waitUntil((async () => {
    // I file dell'app sono indispensabili: se uno manca l'installazione fallisce e
    // si riprova alla visita successiva (meglio di una cache incompleta).
    const cacheApp = await caches.open(CACHE_APP);
    await cacheApp.addAll(FILE_APP.map((url) => new Request(url, { cache: 'reload' })));

    // Le librerie CDN sono "best effort": se una non si scarica, verrà salvata
    // alla prima richiesta riuscita.
    const cacheCdn = await caches.open(CACHE_CDN);
    await Promise.allSettled(FILE_CDN.map((url) => cacheCdn.add(url)));

    await self.skipWaiting();
  })());
});

self.addEventListener('activate', (evento) => {
  evento.waitUntil((async () => {
    const nomi = await caches.keys();
    await Promise.all(
      nomi
        .filter((nome) => nome !== CACHE_APP && nome !== CACHE_CDN)
        .map((nome) => caches.delete(nome))
    );
    await self.clients.claim();
  })());
});

function conTimeout(promessa, ms) {
  return new Promise((risolvi, rifiuta) => {
    const timer = setTimeout(() => rifiuta(new Error('timeout')), ms);
    promessa.then(
      (valore) => { clearTimeout(timer); risolvi(valore); },
      (errore) => { clearTimeout(timer); rifiuta(errore); }
    );
  });
}

async function primaLaRete(richiesta) {
  const cache = await caches.open(CACHE_APP);
  try {
    const risposta = await conTimeout(fetch(richiesta), TIMEOUT_RETE_MS);
    if (risposta && risposta.ok) cache.put(richiesta, risposta.clone()).catch(() => {});
    return risposta;
  } catch (errore) {
    const salvata = await cache.match(richiesta, { ignoreSearch: true });
    if (salvata) return salvata;
    // Navigazione offline verso un indirizzo non salvato (es. "/Tombola" senza slash):
    // si serve comunque la pagina principale.
    if (richiesta.mode === 'navigate') {
      const pagina = await cache.match('index.html');
      if (pagina) return pagina;
    }
    throw errore;
  }
}

async function primaLaCache(richiesta) {
  const cache = await caches.open(CACHE_CDN);
  const salvata = await cache.match(richiesta);
  if (salvata) return salvata;
  const risposta = await fetch(richiesta);
  if (risposta && (risposta.ok || risposta.type === 'opaque')) cache.put(richiesta, risposta.clone()).catch(() => {});
  return risposta;
}

self.addEventListener('fetch', (evento) => {
  const richiesta = evento.request;
  if (richiesta.method !== 'GET') return;

  const url = new URL(richiesta.url);

  if (url.origin === self.location.origin) {
    evento.respondWith(primaLaRete(richiesta));
    return;
  }

  if (url.hostname === 'cdnjs.cloudflare.com') {
    evento.respondWith(primaLaCache(richiesta));
  }
});
