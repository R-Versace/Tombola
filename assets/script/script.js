let numeriEstratti = [];
let dettiAttivi = true;
let animazioniAttive = true;
let suoniAttivi = true;
let voceAttiva = true;
let premi = {
  ambo: { nome: "Ambo", importo: 0, vinto: false },
  terno: { nome: "Terno", importo: 0, vinto: false },
  quaterna: { nome: "Quaterna", importo: 0, vinto: false },
  cinquina: { nome: "Cinquina", importo: 0, vinto: false },
  tombola: { nome: "Tombola", importo: 0, vinto: false }
};

// ===================== TEMI =====================
const THEMES = {
  natale: {
    label: "🎄 Natale",
    bgGradient: "linear-gradient(135deg, #c41e3a 0%, #165b33 50%, #c41e3a 100%)",
    primary: "#c41e3a", secondary: "#165b33", accent: "#ffd700",
    titleEmoji: "🎄", corner1: "❄️", corner2: "🎄", particella: "❄️",
    personaggi: [
      { emoji: '🎅🦌🦌🦌', nome: 'Babbo Natale con le renne' },
      { emoji: '🎅', nome: 'Babbo Natale' },
      { emoji: '🤶', nome: 'Mamma Natale' },
      { emoji: '🧝‍♂️', nome: 'Elfo' },
      { emoji: '🧝‍♀️', nome: 'Elfa' },
      { emoji: '⛄', nome: 'Pupazzo di neve' },
      { emoji: '🎄', nome: 'Albero di Natale' },
      { emoji: '🎁', nome: 'Regalo' },
      { emoji: '⭐', nome: 'Stella' },
      { emoji: '🔔', nome: 'Campana' }
    ]
  },
  capodanno: {
    label: "🎆 Capodanno",
    bgGradient: "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)",
    primary: "#e94560", secondary: "#0f3460", accent: "#ffd700",
    titleEmoji: "🎆", corner1: "✨", corner2: "🥂", particella: "🎉",
    personaggi: [
      { emoji: '🎆', nome: 'Fuochi d\'artificio' },
      { emoji: '🥂', nome: 'Brindisi' },
      { emoji: '🍾', nome: 'Spumante' },
      { emoji: '🎉', nome: 'Coriandoli' },
      { emoji: '⏰', nome: 'Mezzanotte' },
      { emoji: '🌟', nome: 'Stella filante' },
      { emoji: '🎊', nome: 'Festa' }
    ]
  },
  pasqua: {
    label: "🐣 Pasqua",
    bgGradient: "linear-gradient(135deg, #a8e6cf 0%, #dcedc1 50%, #ffd3b6 100%)",
    primary: "#ff8b94", secondary: "#6ab04c", accent: "#ffeaa7",
    titleEmoji: "🐣", corner1: "🌷", corner2: "🐰", particella: "🌸",
    personaggi: [
      { emoji: '🐰', nome: 'Coniglietto' },
      { emoji: '🐣', nome: 'Pulcino' },
      { emoji: '🥚', nome: 'Uovo di Pasqua' },
      { emoji: '🌷', nome: 'Tulipano' },
      { emoji: '🦋', nome: 'Farfalla' },
      { emoji: '🐑', nome: 'Agnellino' },
      { emoji: '🌸', nome: 'Fiore di ciliegio' }
    ]
  },
  estate: {
    label: "☀️ Estate",
    bgGradient: "linear-gradient(135deg, #2193b0 0%, #6dd5ed 50%, #f6d365 100%)",
    primary: "#ff6b35", secondary: "#2193b0", accent: "#ffd166",
    titleEmoji: "☀️", corner1: "🌊", corner2: "🍉", particella: "☀️",
    personaggi: [
      { emoji: '☀️', nome: 'Sole' },
      { emoji: '🏖️', nome: 'Spiaggia' },
      { emoji: '🍉', nome: 'Anguria' },
      { emoji: '🕶️', nome: 'Occhiali da sole' },
      { emoji: '🍦', nome: 'Gelato' },
      { emoji: '🌊', nome: 'Onda' },
      { emoji: '🐬', nome: 'Delfino' }
    ]
  },
  classico: {
    label: "🎲 Classico",
    bgGradient: "linear-gradient(135deg, #2c3e50 0%, #4a5568 50%, #2c3e50 100%)",
    primary: "#8b0000", secondary: "#2c3e50", accent: "#d4af37",
    titleEmoji: "🎲", corner1: "🍀", corner2: "🎲", particella: "✨",
    personaggi: [
      { emoji: '🎲', nome: 'Dado' },
      { emoji: '🃏', nome: 'Jolly' },
      { emoji: '🍀', nome: 'Quadrifoglio' },
      { emoji: '⭐', nome: 'Stella' },
      { emoji: '🎯', nome: 'Bersaglio' }
    ]
  }
};

let temaAttuale = "natale";
let personaggiCorrenti = THEMES.natale.personaggi;

function applyTheme(key, salvaScelta = true) {
  const t = THEMES[key];
  if (!t) return;
  temaAttuale = key;
  personaggiCorrenti = t.personaggi;
  const r = document.documentElement.style;
  r.setProperty('--bg-gradient', t.bgGradient);
  r.setProperty('--color-primary', t.primary);
  r.setProperty('--color-secondary', t.secondary);
  r.setProperty('--color-accent', t.accent);
  r.setProperty('--title-emoji', `"${t.titleEmoji}"`);
  r.setProperty('--corner-emoji-1', `"${t.corner1}"`);
  r.setProperty('--corner-emoji-2', `"${t.corner2}"`);
  r.setProperty('--particle-emoji', `"${t.particella}"`);
  document.querySelectorAll('.snowflake, .personaggio-natalizio').forEach(el => el.remove());
  if (animazioniAttive) avviaNeveNatalizia();
  if (salvaScelta) {
    try { localStorage.setItem('tombolaTema', key); } catch(e) {}
  }
  renderListaTemi();
}

function renderListaTemi() {
  const cont = document.getElementById('listaTemi');
  if (!cont) return;
  cont.innerHTML = Object.keys(THEMES).map(key => {
    const attivo = key === temaAttuale ? 'attivo' : '';
    return `<div class="tema-scelta ${attivo}" onclick="window.cambiaTema('${key}')">${THEMES[key].label}</div>`;
  }).join('');
}

window.cambiaTema = function(key) {
  applyTheme(key);
}

// ===================== EFFETTI SONORI =====================
let audioCtx = null;
function getAudioCtx() {
  if (!audioCtx) {
    const AC = window.AudioContext || window.webkitAudioContext;
    audioCtx = new AC();
  }
  if (audioCtx.state === 'suspended') audioCtx.resume();
  return audioCtx;
}

function beep(freq, durata, tipo, volume) {
  if (!suoniAttivi) return;
  try {
    const ctx = getAudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = tipo || 'sine';
    osc.frequency.value = freq;
    gain.gain.value = volume || 0.2;
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + durata);
    osc.stop(ctx.currentTime + durata);
  } catch(e) { /* audio non disponibile */ }
}

// Sintesi additiva di una campana: somma di parziali inarmoniche con decadimento
// esponenziale, il modo classico per ottenere un timbro di campana credibile
// partendo da semplici oscillatori.
function suonaCampana(frequenzaBase, durata, volume) {
  if (!suoniAttivi) return;
  try {
    const ctx = getAudioCtx();
    const now = ctx.currentTime;
    const parziali = [1, 1.5, 2, 2.6, 3.4, 4.2, 5.4];
    const guadagni  = [1, 0.55, 0.4, 0.28, 0.18, 0.12, 0.08];
    const vol = volume || 0.2;
    parziali.forEach((rapporto, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.value = frequenzaBase * rapporto;
      const picco = vol * guadagni[i];
      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(picco, now + 0.008);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + durata);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + durata);
    });
  } catch(e) { /* audio non disponibile */ }
}

// ----- Suono di estrazione: stile "carillon" -----
// Due note morbide in salita (Sol5 -> Re6, una quinta), timbro caldo con armoniche
// che si spengono prima della fondamentale, filtrate e con un leggero eco.
// Bus condiviso creato una sola volta: passa-basso (toglie la durezza) + eco morbido.
let busEstrazione = null;
function getBusEstrazione(ctx) {
  if (busEstrazione) return busEstrazione;
  const ingresso = ctx.createGain();

  const filtro = ctx.createBiquadFilter();
  filtro.type = 'lowpass';
  filtro.frequency.value = 3800;
  filtro.Q.value = 0.5;

  const eco = ctx.createDelay(0.5);
  eco.delayTime.value = 0.17;
  const feedback = ctx.createGain();
  feedback.gain.value = 0.3;
  const livelloEco = ctx.createGain();
  livelloEco.gain.value = 0.32;

  ingresso.connect(filtro);
  filtro.connect(ctx.destination);   // suono diretto
  filtro.connect(eco);               // suono verso l'eco
  eco.connect(feedback);
  feedback.connect(eco);
  eco.connect(livelloEco);
  livelloEco.connect(ctx.destination);

  busEstrazione = ingresso;
  return busEstrazione;
}

function suonaNotaDolce(frequenza, ritardo, durata, volume) {
  const ctx = getAudioCtx();
  const bus = getBusEstrazione(ctx);
  const inizio = ctx.currentTime + ritardo;
  const parziali = [1, 2, 3, 4.2];      // armoniche: più "rotonde" delle campane
  const guadagni = [1, 0.28, 0.1, 0.04];
  parziali.forEach((rapporto, i) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.value = frequenza * rapporto;
    const fine = inizio + durata / (1 + i * 0.9); // le armoniche alte svaniscono prima
    gain.gain.setValueAtTime(0.0001, inizio);
    gain.gain.linearRampToValueAtTime(volume * guadagni[i], inizio + 0.006);
    gain.gain.exponentialRampToValueAtTime(0.0001, fine);
    osc.connect(gain);
    gain.connect(bus);
    osc.start(inizio);
    osc.stop(fine + 0.02);
  });
}

function suonoEstrazione() {
  if (!suoniAttivi) return;
  try {
    suonaNotaDolce(783.99, 0, 0.7, 0.16);      // Sol5
    suonaNotaDolce(1174.66, 0.11, 0.9, 0.18);  // Re6
  } catch(e) { /* audio non disponibile */ }
}

// Scampanio di festeggiamento: il numero di rintocchi cresce con l'importanza del premio
// (1 per l'ambo, fino a 4 per la cinquina), per dare più enfasi ai premi più grandi.
function suonoVincita(rintocchi) {
  const note = [523.25, 659.25, 784.0, 987.77]; // Do-Mi-Sol-Si, arpeggio maggiore
  const n = Math.max(1, Math.min(rintocchi || 1, note.length));
  for (let i = 0; i < n; i++) {
    setTimeout(() => suonaCampana(note[i], 1.1, 0.22), i * 300);
  }
}

// Grande scampanio finale + arpeggio trionfale per la Tombola
function suonoTombola() {
  const rintocchi = [523.25, 659.25, 784.0, 1046.5];
  rintocchi.forEach((f, i) => setTimeout(() => suonaCampana(f, 1.4, 0.26), i * 260));
  const fanfaraInizio = rintocchi.length * 260 + 250;
  const fanfara = [659.25, 784.0, 987.77, 1318.5, 1567.98];
  fanfara.forEach((f, i) => setTimeout(() => suonaCampana(f, 1.6, 0.24), fanfaraInizio + i * 220));
}

window.toggleSuoni = function() {
  suoniAttivi = document.getElementById('toggleSuoni').checked;
  if (suoniAttivi) suonoEstrazione();
}

window.toggleVoce = function() {
  voceAttiva = document.getElementById('toggleVoce').checked;
  if (!voceAttiva) speechSynthesis.cancel();
}

// ===================== LE MIE CARTELLE (verifica automatica) =====================
let mieCartelle = [];
let prossimoCartellaId = 1;

window.generaNuovaCartellaGioco = function() {
  const griglia = generaCartellaValida();
  const carta = {
    id: prossimoCartellaId++,
    numeri: griglia,
    segnati: new Set(),
    vinte: { ambo: false, terno: false, quaterna: false, cinquina: false, tombola: false }
  };
  mieCartelle.push(carta);
  // Applica subito i numeri già estratti
  numeriEstratti.forEach(n => marcaCartellaSeNecessario(carta, n));
  renderCartelleGioco();
}

window.rimuoviCartellaGioco = function(id) {
  mieCartelle = mieCartelle.filter(c => c.id !== id);
  renderCartelleGioco();
}

function marcaCartellaSeNecessario(carta, numero) {
  let presente = carta.numeri.some(riga => riga.includes(numero));
  if (presente) carta.segnati.add(numero);
  return presente;
}

function verificaVinciteCartelle(numero) {
  const nomiTipi = { ambo: 'Ambo', terno: 'Terno', quaterna: 'Quaterna', cinquina: 'Cinquina', tombola: 'TOMBOLA! 🎉' };
  mieCartelle.forEach(carta => {
    if (!marcaCartellaSeNecessario(carta, numero)) return;

    carta.numeri.forEach(riga => {
      const numeriRiga = riga.filter(n => n !== null);
      const segnatiRiga = numeriRiga.filter(n => carta.segnati.has(n));
      const count = segnatiRiga.length;
      const livelli = [['ambo', 2], ['terno', 3], ['quaterna', 4], ['cinquina', 5]];
      livelli.forEach(([tipo, soglia]) => {
        if (count >= soglia && !carta.vinte[tipo]) {
          carta.vinte[tipo] = true;
          segnalaVincitaCartella(carta, tipo, nomiTipi[tipo]);
        }
      });
    });

    const totaleNumeri = carta.numeri.flat().filter(n => n !== null);
    const totaleSegnati = totaleNumeri.filter(n => carta.segnati.has(n));
    if (totaleSegnati.length === totaleNumeri.length && !carta.vinte.tombola) {
      carta.vinte.tombola = true;
      segnalaVincitaCartella(carta, 'tombola', nomiTipi.tombola);
    }
  });
  renderCartelleGioco();
}

function segnalaVincitaCartella(carta, tipo, nomeVisualizzato) {
  aggiungiStorico(`🏆 ${nomeVisualizzato} sulla Cartella #${carta.id}!`, true);
  const rintocchiPerTipo = { ambo: 1, terno: 2, quaterna: 3, cinquina: 4 };
  if (tipo === 'tombola') suonoTombola();
  else suonoVincita(rintocchiPerTipo[tipo] || 1);
  mostraToastVincita(`Cartella #${carta.id}: ${nomeVisualizzato}!`);
}

function mostraToastVincita(testo) {
  const div = document.createElement('div');
  div.className = 'toast-vincita';
  div.textContent = '🏆 ' + testo;
  document.body.appendChild(div);
  requestAnimationFrame(() => div.classList.add('mostra'));
  setTimeout(() => {
    div.classList.remove('mostra');
    setTimeout(() => div.remove(), 500);
  }, 3500);
}

function renderCartelleGioco() {
  const cont = document.getElementById('cartelleGiocoContainer');
  if (!cont) return;
  if (mieCartelle.length === 0) {
    cont.innerHTML = '<p class="text-muted text-center">Nessuna cartella ancora. Aggiungine una!</p>';
    return;
  }
  cont.innerHTML = mieCartelle.map(carta => {
    const celle = carta.numeri.map(riga => riga.map(n => {
      if (n === null) return '<div class="numero-mini vuoto"></div>';
      const segnato = carta.segnati.has(n) ? 'segnato' : '';
      return `<div class="numero-mini ${segnato}">${n}</div>`;
    }).join('')).join('');
    const badges = ['ambo', 'terno', 'quaterna', 'cinquina', 'tombola'].map(tipo => {
      const ottenuta = carta.vinte[tipo] ? 'ottenuta' : '';
      const nome = tipo.charAt(0).toUpperCase() + tipo.slice(1);
      return `<span class="badge-vincita ${ottenuta}">${nome}</span>`;
    }).join('');
    return `
      <div class="cartella-gioco-wrapper">
        <div class="cartella-gioco-header">
          <span class="cartella-gioco-titolo">Cartella #${carta.id}</span>
          <button class="btn btn-sm btn-outline-danger" onclick="window.rimuoviCartellaGioco(${carta.id})">🗑️</button>
        </div>
        <div class="cartella-gioco-grid">${celle}</div>
        <div>${badges}</div>
      </div>
    `;
  }).join('');
}

window.apriCartelleGioco = function() {
  renderCartelleGioco();
  new bootstrap.Modal(document.getElementById('cartelleGiocoModal')).show();
}

// ===================== STORICO ESTRAZIONI =====================
let storicoEventi = [];

function aggiungiStorico(testo, evento) {
  storicoEventi.push({ testo, evento: !!evento, orario: new Date().toLocaleTimeString('it-IT') });
  renderStorico();
}

function renderStorico() {
  const body = document.getElementById('storicoBody');
  if (!body) return;
  body.innerHTML = storicoEventi.slice().reverse().map((e, i) => {
    const num = storicoEventi.length - i;
    const classe = e.evento ? 'storico-riga-evento' : '';
    return `<tr class="${classe}"><td>${num}</td><td>${e.orario}</td><td>${e.testo}</td></tr>`;
  }).join('');
}

window.apriStorico = function() {
  renderStorico();
  new bootstrap.Modal(document.getElementById('storicoModal')).show();
}

window.esportaStoricoTxt = function() {
  const righe = storicoEventi.map((e, i) => `${i + 1}. [${e.orario}] ${e.testo}`);
  const blob = new Blob([righe.join('\n')], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'storico_tombola.txt';
  a.click();
  URL.revokeObjectURL(url);
}

window.esportaStoricoPDF = function() {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  doc.setFontSize(16);
  doc.text('Storico Estrazioni - Tombola', 105, 15, { align: 'center' });
  doc.setFontSize(11);
  let y = 28;
  storicoEventi.forEach((e, i) => {
    if (y > 280) { doc.addPage(); y = 15; }
    doc.text(`${i + 1}. [${e.orario}] ${e.testo}`, 15, y);
    y += 7;
  });
  doc.save('storico_tombola.pdf');
}

// ===================== VOCE DEL BANDITORE (robusta e personalizzabile) =====================
const supportoVoce = ('speechSynthesis' in window);
let vociDisponibili = [];
let voceSelezionataNome = null;
let voceRate = 0.95;
let vocePitch = 1.0;

try {
  voceSelezionataNome = localStorage.getItem('tombolaVoceNome') || null;
  voceRate = parseFloat(localStorage.getItem('tombolaVoceRate')) || 0.95;
  vocePitch = parseFloat(localStorage.getItem('tombolaVocePitch')) || 1.0;
} catch(e) {}

function caricaVociDisponibili() {
  if (!supportoVoce) return;
  vociDisponibili = speechSynthesis.getVoices();
  renderListaVoci();
}

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

// Assegna un punteggio di "naturalezza" a ciascuna voce disponibile,
// per proporre di default quella meno robotica sul dispositivo dell'utente.
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
  if (!v.localService) p += 1; // le voci di rete (Google/Microsoft Online) sono spesso più naturali
  return p;
}

function vociItalianeOrdinate() {
  return vociDisponibili
    .filter(v => v.lang && v.lang.toLowerCase().startsWith('it'))
    .sort((a, b) => punteggioVoce(b) - punteggioVoce(a));
}

function scegliVoceItaliana() {
  const italiane = vociItalianeOrdinate();
  if (italiane.length === 0) return null;
  if (voceSelezionataNome) {
    const scelta = italiane.find(v => v.name === voceSelezionataNome);
    if (scelta) return scelta;
  }
  return italiane[0]; // la migliore secondo il punteggio
}

function renderListaVoci() {
  const cont = document.getElementById('listaVociContainer');
  if (!cont) return;
  const italiane = vociItalianeOrdinate();
  if (italiane.length === 0) {
    cont.innerHTML = '<div class="text-muted small px-1">Nessuna voce italiana trovata sul dispositivo</div>';
    return;
  }
  const nomeAttiva = scegliVoceItaliana()?.name;
  cont.innerHTML = italiane.map(v => {
    const attiva = v.name === nomeAttiva ? 'attiva' : '';
    return `<div class="voce-scelta ${attiva}" title="${v.name}" onclick="window.selezionaVoce('${v.name.replace(/'/g, "\\'")}')">${v.name}</div>`;
  }).join('');
}

window.selezionaVoce = function(nome) {
  voceSelezionataNome = nome;
  try { localStorage.setItem('tombolaVoceNome', nome); } catch(e) {}
  renderListaVoci();
  pronunciaTesto("Ciao, sono io la nuova voce del banditore!");
}

window.aggiornaParametriVoce = function() {
  voceRate = parseFloat(document.getElementById('sliderVelocita').value) || 0.95;
  vocePitch = parseFloat(document.getElementById('sliderTono').value) || 1.0;
  try {
    localStorage.setItem('tombolaVoceRate', voceRate);
    localStorage.setItem('tombolaVocePitch', vocePitch);
  } catch(e) {}
}

function pronunciaTesto(testo) {
  if (!voceAttiva) return;
  if (!supportoVoce) {
    console.warn("Questo browser non supporta la sintesi vocale (Web Speech API).");
    return;
  }
  try {
    // Annulla eventuali frasi accodate/bloccate prima di parlare
    speechSynthesis.cancel();

    const parla = () => {
      const msg = new SpeechSynthesisUtterance(testo);
      msg.lang = "it-IT";
      msg.rate = voceRate;
      msg.pitch = vocePitch;
      const voce = scegliVoceItaliana();
      if (voce) msg.voice = voce;
      msg.onerror = (e) => console.warn("Errore sintesi vocale:", e.error);
      speechSynthesis.speak(msg);
    };

    if (vociDisponibili.length === 0) {
      caricaVociDisponibili();
    }
    // Piccolo ritardo: su alcuni browser, parlare subito dopo cancel() viene ignorato
    setTimeout(parla, 60);
  } catch(e) {
    console.warn("Sintesi vocale non disponibile:", e);
  }
}

window.testaVoce = function() {
  pronunciaTesto("Prova voce. Si sente il banditore?");
}

function applicaNumeroEstratto(numero) {
  if (numeriEstratti.includes(numero)) return;
  numeriEstratti.push(numero);
  const cella = document.getElementById("num-" + numero);
  if (cella) cella.classList.add("estratto");
  document.getElementById("ultimoNumero").innerHTML = `<span>${numero}</span>`;
  document.getElementById("contatore").innerText = numeriEstratti.length;

  if (dettiAttivi) {
    document.getElementById("dettoNapoletano").textContent = dettiNapoletani[numero] || "";
  }
  aggiornaUltimiNumeri();
  suonoEstrazione();

  if (animazioniAttive) mostraPersonaggioNatalizio(numero);

  let testoDaPronunciare = numero.toString();
  if (dettiAttivi && dettiNapoletani[numero]) {
    testoDaPronunciare = numero + ". " + dettiNapoletani[numero];
  }
  pronunciaTesto(testoDaPronunciare);

  aggiungiStorico(`Estratto il numero ${numero}${dettiNapoletani[numero] ? ' - ' + dettiNapoletani[numero] : ''}`);
  verificaVinciteCartelle(numero);
}


const dettiNapoletani = {
  1: "L'Italia",
  2: "'A piccerella",
  3: "'A gatta",
  4: "'O puorco",
  5: "'A mano",
  6: "Chella ca guarda 'nterra",
  7: "'O vaso",
  8: "'A Madonna",
  9: "'A figliata",
  10: "'E fasule",
  11: "'E surice",
  12: "'O surdate",
  13: "Sant'Antonio",
  14: "'O 'mbriaco",
  15: "'O guaglione",
  16: "'O culo",
  17: "'A disgrazzia",
  18: "'O sanghe",
  19: "'A resata",
  20: "'A festa",
  21: "'A femmena annura",
  22: "'O pazzo",
  23: "'O scemo",
  24: "'E gguardie",
  25: "Natale",
  26: "Nanninella",
  27: "'O cantaro",
  28: "'E zizze",
  29: "'O pate d''e ccriature",
  30: "'E palle d''o tenente",
  31: "'O padrone 'e casa",
  32: "'O capitone",
  33: "L'anne 'e Cristo",
  34: "'A capa",
  35: "L'aucelluzz",
  36: "'E castagnelle",
  37: "'O monaco",
  38: "'E mmazzate",
  39: "'A funa 'nganna",
  40: "'A paposcia",
  41: "'O curtiello",
  42: "'O ccafè",
  43: "Onna pereta fore 'o barcone",
  44: "'E ccancelle",
  45: "'O vino bbuono",
  46: "'E denare",
  47: "'O muorto",
  48: "'O muorto che parla",
  49: "'O piezzo 'e carne",
  50: "'O ppane",
  51: "'O ciardino",
  52: "'A mamma",
  53: "'O viecchio",
  54: "'O cappello",
  55: "'A museca",
  56: "'A caduta",
  57: "'O gobbo",
  58: "'O paccotto",
  59: "'E pile",
  60: "Se lamenta",
  61: "'O cacciatore",
  62: "'O muorto acciso",
  63: "'A sposa",
  64: "'A sciammeria",
  65: "'O chianto",
  66: "'E ddoie zitelle",
  67: "'O totaro int''a chitarra",
  68: "'A zuppa cotta",
  69: "Sott'e 'ncoppa",
  70: "'O palazzo",
  71: "L'ommo 'e mmerd",
  72: "'A maraviglia",
  73: "L'uspitale",
  74: "'A grotta",
  75: "Pulecenella",
  76: "'A funtana",
  77: "'E diavule",
  78: "'A bella figliola",
  79: "'O mariuolo",
  80: "'A vocca",
  81: "'E sciure",
  82: "'A tavula 'mbandita",
  83: "'O maletiempo",
  84: "'A cchiesa",
  85: "L'aneme d''o priatorio",
  86: "'A puteca",
  87: "'E perucchie",
  88: "'E casecavalle",
  89: "'A vecchia",
  90: "'A paura"
};

window.toggleDetti = function() {
  dettiAttivi = document.getElementById('toggleDetti').checked;
  if (!dettiAttivi) {
    document.getElementById('dettoNapoletano').textContent = '';
  }
}

window.toggleAnimazioni = function() {
  animazioniAttive = document.getElementById('toggleAnimazioni').checked;
  if (!animazioniAttive) {
    // Rimuovi tutte le animazioni attive
    document.querySelectorAll('.personaggio-natalizio').forEach(el => el.remove());
    document.querySelectorAll('.snowflake').forEach(el => el.remove());
  } else {
    // Riavvia la neve
    avviaNeveNatalizia();
  }
}

window.mostraDonazione = function() {
  let modal = new bootstrap.Modal(document.getElementById('donazioneModal'));
  modal.show();
  
  setTimeout(() => {
    if (typeof PayPal !== 'undefined' && PayPal.Donation) {
      PayPal.Donation.Button({
        env: 'production',
        hosted_button_id: 'XQP3LQJEU3C8U',
        image: {
          src: 'https://www.paypalobjects.com/en_US/i/btn/btn_donate_SM.gif',
          alt: 'Donate with PayPal button',
          title: 'PayPal - The safer, easier way to pay online!',
        }
      }).render('#donate-button');
    }
  }, 300);
}

function aggiornaAnteprima() {
  let budget = parseFloat(document.getElementById("budgetInput").value) || 0;
  let percAmbo = parseFloat(document.getElementById("percAmbo").value) || 0;
  let percTerno = parseFloat(document.getElementById("percTerno").value) || 0;
  let percQuaterna = parseFloat(document.getElementById("percQuaterna").value) || 0;
  let percCinquina = parseFloat(document.getElementById("percCinquina").value) || 0;
  let percTombola = parseFloat(document.getElementById("percTombola").value) || 0;
  
  document.getElementById("anteprimaAmbo").textContent = "€" + (budget * percAmbo / 100).toFixed(2);
  document.getElementById("anteprimaTerno").textContent = "€" + (budget * percTerno / 100).toFixed(2);
  document.getElementById("anteprimaQuaterna").textContent = "€" + (budget * percQuaterna / 100).toFixed(2);
  document.getElementById("anteprimaCinquina").textContent = "€" + (budget * percCinquina / 100).toFixed(2);
  document.getElementById("anteprimaTombola").textContent = "€" + (budget * percTombola / 100).toFixed(2);
  
  let totale = percAmbo + percTerno + percQuaterna + percCinquina + percTombola;
  let totaleDiv = document.getElementById("totalePerc");
  let btnIniziaPartita = document.getElementById("btnIniziaPartita");
  
  if (totale === 100) {
    totaleDiv.className = "totale-percentuale totale-ok";
    totaleDiv.textContent = "Totale: 100% ✓";
    btnIniziaPartita.disabled = false;
  } else {
    totaleDiv.className = "totale-percentuale totale-errore";
    totaleDiv.textContent = `Totale: ${totale}% (deve essere 100%)`;
    btnIniziaPartita.disabled = true;
  }
}

function resetPercentuali() {
  document.getElementById("percAmbo").value = 5;
  document.getElementById("percTerno").value = 10;
  document.getElementById("percQuaterna").value = 15;
  document.getElementById("percCinquina").value = 20;
  document.getElementById("percTombola").value = 50;
  aggiornaAnteprima();
}

function impostaBudget() {
  let budget = parseFloat(document.getElementById("budgetInput").value);
  if (isNaN(budget) || budget < 5) {
    alert("Inserisci un budget valido (minimo €5)");
    return;
  }
  
  let percAmbo = parseFloat(document.getElementById("percAmbo").value) / 100;
  let percTerno = parseFloat(document.getElementById("percTerno").value) / 100;
  let percQuaterna = parseFloat(document.getElementById("percQuaterna").value) / 100;
  let percCinquina = parseFloat(document.getElementById("percCinquina").value) / 100;
  let percTombola = parseFloat(document.getElementById("percTombola").value) / 100;
  
  premi.ambo.importo = (budget * percAmbo).toFixed(2);
  premi.terno.importo = (budget * percTerno).toFixed(2);
  premi.quaterna.importo = (budget * percQuaterna).toFixed(2);
  premi.cinquina.importo = (budget * percCinquina).toFixed(2);
  premi.tombola.importo = (budget * percTombola).toFixed(2);
  
  mostraPremi();
  
  let modal = bootstrap.Modal.getInstance(document.getElementById('budgetModal'));
  modal.hide();
}

function mostraPremi() {
  let container = document.getElementById("premiContainer");
  container.innerHTML = "";
  
  Object.keys(premi).forEach(key => {
    let premio = premi[key];
    let div = document.createElement("div");
    div.className = "premio" + (premio.vinto ? " vinto" : "");
    div.onclick = function() {
      premio.vinto = !premio.vinto;
      if (premio.vinto) {
        const rintocchiPerTipo = { ambo: 1, terno: 2, quaterna: 3, cinquina: 4 };
        if (key === 'tombola') suonoTombola();
        else suonoVincita(rintocchiPerTipo[key] || 1);
      }
      mostraPremi();
    };
    div.innerHTML = `
      <div class="premio-nome">${premio.nome}</div>
      <div class="premio-importo">€${premio.importo}</div>
    `;
    container.appendChild(div);
  });
}

function aggiornaUltimiNumeri() {
  let container = document.getElementById("ultimiNumeri");
  let ultimi = numeriEstratti.slice(-5).reverse();
  container.innerHTML = ultimi.map(n => `<div class="ultimo-mini">${n}</div>`).join('');
}

function creaTabellone() {
  let tabellone = document.getElementById("tabellone");
  
  // Crea 6 cartelle
  for (let cartella = 0; cartella < 6; cartella++) {
    let cartellaDiv = document.createElement("div");
    cartellaDiv.className = "cartella";
    
    // Calcola il blocco di 30 numeri (0-29, 30-59, 60-89)
    let blocco = Math.floor(cartella / 2);
    // Calcola l'offset all'interno del blocco (0-4 o 5-9)
    let offset = (cartella % 2) * 5;
    
    // Per ogni cartella, crea 15 numeri disposti per righe
    for (let riga = 0; riga < 3; riga++) {
      for (let colonna = 0; colonna < 5; colonna++) {
        let numero = (blocco * 30) + offset + colonna + 1 + (riga * 10);
        
        let div = document.createElement("div");
        div.className = "numero";
        div.id = "num-" + numero;
        div.innerText = numero;
        cartellaDiv.appendChild(div);
      }
    }
    
    tabellone.appendChild(cartellaDiv);
  }
}

function generaNumero() {
  if (numeriEstratti.length >= 90) {
    alert("Tutti i numeri sono stati estratti!");
    pronunciaTesto("Tutti i numeri sono stati estratti!");
    fermaEstrazioneAutomatica();
    return;
  }
  
  let numero;
  do {
    numero = Math.floor(Math.random() * 90) + 1;
  } while (numeriEstratti.includes(numero));

  applicaNumeroEstratto(numero);
}

// ===================== ESTRAZIONE AUTOMATICA =====================
let estrazioneAutomaticaAttiva = false;
let estrazioneAutomaticaTimer = null;

function tickEstrazioneAutomatica() {
  // Non estrarre mentre è aperto un modale (es. si sta configurando qualcosa)
  if (document.querySelector('.modal.show')) return;
  if (numeriEstratti.length >= 90) {
    fermaEstrazioneAutomatica();
    return;
  }
  generaNumero();
}

function avviaEstrazioneAutomatica() {
  const secondi = Math.max(2, parseInt(document.getElementById('intervalloAuto').value, 10) || 6);
  estrazioneAutomaticaAttiva = true;
  if (estrazioneAutomaticaTimer) clearInterval(estrazioneAutomaticaTimer);
  estrazioneAutomaticaTimer = setInterval(tickEstrazioneAutomatica, secondi * 1000);
  aggiornaBottoneAuto();
}

function fermaEstrazioneAutomatica() {
  estrazioneAutomaticaAttiva = false;
  if (estrazioneAutomaticaTimer) {
    clearInterval(estrazioneAutomaticaTimer);
    estrazioneAutomaticaTimer = null;
  }
  aggiornaBottoneAuto();
}

function aggiornaBottoneAuto() {
  const btn = document.getElementById('btnAutoEstrazione');
  if (!btn) return;
  if (estrazioneAutomaticaAttiva) {
    btn.textContent = "⏸️ Ferma Auto";
    btn.classList.add('attivo');
  } else {
    btn.textContent = "▶️ Auto";
    btn.classList.remove('attivo');
  }
}

window.toggleEstrazioneAutomatica = function() {
  if (estrazioneAutomaticaAttiva) fermaEstrazioneAutomatica();
  else avviaEstrazioneAutomatica();
}

window.aggiornaIntervalloAuto = function() {
  if (estrazioneAutomaticaAttiva) avviaEstrazioneAutomatica(); // riavvia con il nuovo intervallo
}

function mostraPersonaggioNatalizio(numero) {
  const personaggi = personaggiCorrenti;
  const personaggio = personaggi[Math.floor(Math.random() * personaggi.length)];
  const altezzaCasuale = Math.random() * 50 + 25; // tra 25% e 75% dall'alto
  
  const div = document.createElement('div');
  div.className = 'personaggio-natalizio';
  div.style.top = altezzaCasuale + '%';
  div.innerHTML = `
    <div style="font-size: 100px;">${personaggio.emoji}</div>
    <div class="numero-sul-personaggio">
      ${numero}
      <div class="stella-scintillante" style="top: -20px; left: -20px;">✨</div>
      <div class="stella-scintillante" style="top: -20px; right: -20px;">✨</div>
      <div class="stella-scintillante" style="bottom: -20px; left: -20px;">✨</div>
      <div class="stella-scintillante" style="bottom: -20px; right: -20px;">✨</div>
    </div>
  `;
  
  document.body.appendChild(div);
  
  // Rimuovi dopo l'animazione
  setTimeout(() => {
    div.remove();
  }, 10000);
}

function avviaNeveNatalizia() {
  if (!animazioniAttive) return;
  
  // Rimuovi fiocchi esistenti
  document.querySelectorAll('.snowflake').forEach(el => el.remove());
  
  // Crea 30 fiocchi di neve
  for (let i = 0; i < 30; i++) {
    setTimeout(() => {
      if (!animazioniAttive) return;
      creaFioccoDiNeve();
    }, i * 200);
  }
  
  // Continua a creare fiocchi periodicamente
  setInterval(() => {
    if (animazioniAttive) {
      creaFioccoDiNeve();
    }
  }, 800);
}

function creaFioccoDiNeve() {
  const snowflake = document.createElement('div');
  snowflake.className = 'snowflake';
  const emojiVar = getComputedStyle(document.documentElement).getPropertyValue('--particle-emoji').trim();
  snowflake.textContent = emojiVar ? emojiVar.replace(/"/g, '') : '❄️';
  snowflake.style.left = Math.random() * 100 + '%';
  snowflake.style.fontSize = (Math.random() * 15 + 10) + 'px';
  snowflake.style.animationDuration = (Math.random() * 5 + 5) + 's';
  snowflake.style.opacity = Math.random() * 0.6 + 0.4;
  
  document.body.appendChild(snowflake);
  
  // Rimuovi dopo l'animazione
  setTimeout(() => {
    snowflake.remove();
  }, parseFloat(snowflake.style.animationDuration) * 1000);
}

function eseguiReset() {
  fermaEstrazioneAutomatica();
  if (supportoVoce) speechSynthesis.cancel();
  numeriEstratti = [];
  let numeri = document.querySelectorAll(".numero");
  numeri.forEach(num => num.classList.remove("estratto"));
  document.getElementById("ultimoNumero").innerHTML = '<span class="text-muted" style="font-size: 0.6em;">--</span>';
  document.getElementById("dettoNapoletano").textContent = '';
  document.getElementById("ultimiNumeri").innerHTML = '';
  document.getElementById("contatore").innerText = "0";
  
  Object.keys(premi).forEach(key => {
    premi[key].vinto = false;
  });

  storicoEventi = [];
  renderStorico();

  mieCartelle.forEach(carta => {
    carta.segnati = new Set();
    carta.vinte = { ambo: false, terno: false, quaterna: false, cinquina: false, tombola: false };
  });
  renderCartelleGioco();
  
  mostraPremi();
}

window.resetEstrazione = function() {
  eseguiReset();
}

window.nuovaPartita = function() {
  eseguiReset();
  let modal = new bootstrap.Modal(document.getElementById('budgetModal'));
  modal.show();
}

window.generaCartelle = function(quantita) {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  
  let cartellaCount = 0;
  
  for (let i = 1; i <= quantita; i++) {
    if (cartellaCount > 0 && cartellaCount % 3 === 0) {
      doc.addPage();
    }
    
    let posizioneNellaPagina = cartellaCount % 3;
    let offsetY = posizioneNellaPagina * 90;
    
    doc.setFontSize(14);
    doc.text(`Cartella #${i}`, 105, 15 + offsetY, { align: 'center' });
    
    let cartella = generaCartellaValida();
    
    let startX = 20;
    let startY = 25 + offsetY;
    let cellWidth = 19;
    let cellHeight = 20;
    
    doc.setFontSize(12);
    doc.setLineWidth(0.3);
    
    for (let riga = 0; riga < 3; riga++) {
      for (let col = 0; col < 9; col++) {
        let x = startX + col * cellWidth;
        let y = startY + riga * cellHeight;
        
        if (cartella[riga][col] === null) {
          doc.setFillColor(240, 240, 240);
          doc.rect(x, y, cellWidth, cellHeight, 'FD');
        } else {
          doc.rect(x, y, cellWidth, cellHeight);
          doc.text(cartella[riga][col].toString(), x + cellWidth/2, y + cellHeight/2 + 2, { align: 'center' });
        }
      }
    }
    
    cartellaCount++;
  }
  
  doc.save(quantita + '_cartelle_tombola.pdf');
}

function generaCartellaValida() {
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
// limito l'altezza allo spazio disponibile sopra il pulsante, così è sempre tutto raggiungibile.
function impostaMenuDropdown() {
  const dropdown = document.querySelector('.controlli .dropdown');
  if (!dropdown) return;
  const toggle = dropdown.querySelector('[data-bs-toggle="dropdown"]');
  const menu = dropdown.querySelector('.dropdown-menu');

  dropdown.addEventListener('show.bs.dropdown', () => {
    const spazioSopra = toggle.getBoundingClientRect().top - 12;
    menu.style.maxHeight = Math.max(160, spazioSopra) + 'px';
  });
}

window.onload = function() {
  creaTabellone();
  aggiornaAnteprima();
  impostaMenuDropdown();

  // Carica il tema salvato (o Natale di default)
  let temaSalvato = 'natale';
  try { temaSalvato = localStorage.getItem('tombolaTema') || 'natale'; } catch(e) {}
  applyTheme(temaSalvato, false);

  // Sincronizza gli slider di velocità/tono voce con le preferenze salvate
  document.getElementById('sliderVelocita').value = voceRate;
  document.getElementById('sliderTono').value = vocePitch;
  renderListaVoci();
  
  // Abilita il pulsante all'avvio visto che i valori di default sono già corretti (100%)
  document.getElementById("btnIniziaPartita").disabled = false;
  
  // Avvia le particelle del tema attuale
  avviaNeveNatalizia();

  renderStorico();
  renderCartelleGioco();

  let modal = new bootstrap.Modal(document.getElementById('budgetModal'));
  modal.show();
  
  document.addEventListener('keydown', function(event) {
    let modalOpen = document.querySelector('.modal.show');
    if (modalOpen) return;
    
    if (event.keyCode === 13 || event.keyCode === 32) {
      event.preventDefault();
      generaNumero();
    }
  });
};
