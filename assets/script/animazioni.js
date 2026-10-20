// Animazioni: personaggio a tema che attraversa lo schermo con il numero estratto,
// e le particelle di sfondo (es. i fiocchi di neve nel tema Natale).

import { opzioni } from './state.js';
import { personaggiCorrenti } from './temi.js';

let timerParticelle = null;

export function mostraPersonaggio(numero) {
  if (!opzioni.animazioni) return;
  const personaggi = personaggiCorrenti();
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
  setTimeout(() => div.remove(), 10000);
}

function creaParticella() {
  const particella = document.createElement('div');
  particella.className = 'snowflake';
  const emojiVar = getComputedStyle(document.documentElement).getPropertyValue('--particle-emoji').trim();
  particella.textContent = emojiVar ? emojiVar.replace(/"/g, '') : '❄️';
  particella.style.left = Math.random() * 100 + '%';
  particella.style.fontSize = (Math.random() * 15 + 10) + 'px';
  particella.style.animationDuration = (Math.random() * 5 + 5) + 's';
  particella.style.opacity = Math.random() * 0.6 + 0.4;
  document.body.appendChild(particella);
  setTimeout(() => particella.remove(), parseFloat(particella.style.animationDuration) * 1000);
}

export function avviaParticelle() {
  if (!opzioni.animazioni) return;
  document.querySelectorAll('.snowflake').forEach((el) => el.remove());

  for (let i = 0; i < 30; i++) {
    setTimeout(() => { if (opzioni.animazioni) creaParticella(); }, i * 200);
  }

  if (timerParticelle) clearInterval(timerParticelle);
  timerParticelle = setInterval(() => { if (opzioni.animazioni) creaParticella(); }, 800);
}

export function fermaParticelle() {
  document.querySelectorAll('.personaggio-natalizio, .snowflake').forEach((el) => el.remove());
}

// Da richiamare dopo un cambio tema: ripulisce le particelle del tema precedente
// e le fa ripartire con l'emoji del nuovo tema.
export function riavviaParticelle() {
  fermaParticelle();
  avviaParticelle();
}
