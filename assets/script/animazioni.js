// Animazioni decorative: personaggi che attraversano lo schermo a ogni estrazione
// e particelle (neve, coriandoli...) che cadono in sottofondo.

import { opzioni, stato } from './state.js';
import { THEMES } from './temi.js';

let timerParticelle = null;

export function mostraPersonaggio(numero) {
  const personaggi = THEMES[stato.tema].personaggi;
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
  setTimeout(() => div.remove(), 10000); // dopo l'animazione
}

function creaParticella() {
  const el = document.createElement('div');
  el.className = 'snowflake';
  const emojiVar = getComputedStyle(document.documentElement).getPropertyValue('--particle-emoji').trim();
  el.textContent = emojiVar ? emojiVar.replace(/"/g, '') : '❄️';
  el.style.left = Math.random() * 100 + '%';
  el.style.fontSize = (Math.random() * 15 + 10) + 'px';
  el.style.animationDuration = (Math.random() * 5 + 5) + 's';
  el.style.opacity = Math.random() * 0.6 + 0.4;

  document.body.appendChild(el);
  setTimeout(() => el.remove(), parseFloat(el.style.animationDuration) * 1000);
}

export function avviaParticelle() {
  if (!opzioni.animazioni) return;

  document.querySelectorAll('.snowflake').forEach((el) => el.remove());

  // 30 particelle iniziali, distribuite nel tempo
  for (let i = 0; i < 30; i++) {
    setTimeout(() => { if (opzioni.animazioni) creaParticella(); }, i * 200);
  }

  // ...poi una nuova ogni 0,8 s. Un solo timer alla volta.
  if (timerParticelle) clearInterval(timerParticelle);
  timerParticelle = setInterval(() => { if (opzioni.animazioni) creaParticella(); }, 800);
}

export function fermaParticelle() {
  if (timerParticelle) {
    clearInterval(timerParticelle);
    timerParticelle = null;
  }
  document.querySelectorAll('.snowflake, .personaggio-natalizio').forEach((el) => el.remove());
}

// Dopo un cambio di tema: via le vecchie, dentro le nuove (se le animazioni sono attive).
export function riavviaParticelle() {
  fermaParticelle();
  avviaParticelle();
}
