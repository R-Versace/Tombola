// Effetti sonori sintetizzati con la Web Audio API (nessun file audio da caricare).

import { opzioni } from './state.js';

let audioCtx = null;
function getAudioCtx() {
  if (!audioCtx) {
    const AC = window.AudioContext || window.webkitAudioContext;
    audioCtx = new AC();
  }
  if (audioCtx.state === 'suspended') audioCtx.resume();
  return audioCtx;
}

// Sintesi additiva di una campana: somma di parziali inarmoniche con decadimento
// esponenziale, il modo classico per ottenere un timbro di campana credibile
// partendo da semplici oscillatori.
function suonaCampana(frequenzaBase, durata, volume) {
  if (!opzioni.suoni) return;
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

export function suonoEstrazione() {
  if (!opzioni.suoni) return;
  try {
    suonaNotaDolce(783.99, 0, 0.7, 0.16);      // Sol5
    suonaNotaDolce(1174.66, 0.11, 0.9, 0.18);  // Re6
  } catch(e) { /* audio non disponibile */ }
}

// Scampanio di festeggiamento: il numero di rintocchi cresce con l'importanza del premio
// (1 per l'ambo, fino a 4 per la cinquina), per dare più enfasi ai premi più grandi.
export function suonoVincita(rintocchi) {
  const note = [523.25, 659.25, 784.0, 987.77]; // Do-Mi-Sol-Si, arpeggio maggiore
  const n = Math.max(1, Math.min(rintocchi || 1, note.length));
  for (let i = 0; i < n; i++) {
    setTimeout(() => suonaCampana(note[i], 1.1, 0.22), i * 300);
  }
}

// Grande scampanio finale + arpeggio trionfale per la Tombola
export function suonoTombola() {
  const rintocchi = [523.25, 659.25, 784.0, 1046.5];
  rintocchi.forEach((f, i) => setTimeout(() => suonaCampana(f, 1.4, 0.26), i * 260));
  const fanfaraInizio = rintocchi.length * 260 + 250;
  const fanfara = [659.25, 784.0, 987.77, 1318.5, 1567.98];
  fanfara.forEach((f, i) => setTimeout(() => suonaCampana(f, 1.6, 0.24), fanfaraInizio + i * 220));
}
