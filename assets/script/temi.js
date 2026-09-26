// Temi grafici: colori, emoji e personaggi celebrativi.

import { stato } from './state.js';
import { $ } from './ui.js';

export const THEMES = {
  natale: {
    label: "🎄 Natale",
    bgGradient: "linear-gradient(135deg, #c41e3a 0%, #165b33 50%, #c41e3a 100%)",
    primary: "#c41e3a", secondary: "#165b33", accent: "#ffd700",
    titleEmoji: "🎄", corner1: "❄️", corner2: "🎄", particella: "❄️",
    pdf: { nome: "Natale", frase: "Buon Natale e Buona Tombola!" },
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

// Applica colori ed emoji del tema. Non tocca le particelle: dopo un cambio tema
// il chiamante chiama riavviaParticelle() (vedi animazioni.js).
export function applyTheme(key, salvaScelta = true) {
  const t = THEMES[key];
  if (!t) return false;
  stato.tema = key;
  const r = document.documentElement.style;
  r.setProperty('--bg-gradient', t.bgGradient);
  r.setProperty('--color-primary', t.primary);
  r.setProperty('--color-secondary', t.secondary);
  r.setProperty('--color-accent', t.accent);
  r.setProperty('--title-emoji', `"${t.titleEmoji}"`);
  r.setProperty('--corner-emoji-1', `"${t.corner1}"`);
  r.setProperty('--corner-emoji-2', `"${t.corner2}"`);
  r.setProperty('--particle-emoji', `"${t.particella}"`);
  if (salvaScelta) {
    try { localStorage.setItem('tombolaTema', key); } catch (e) { /* preferenza non salvata */ }
  }
  renderListaTemi();
  return true;
}

export function renderListaTemi() {
  const cont = $('listaTemi');
  if (!cont) return;
  cont.innerHTML = Object.keys(THEMES).map((key) => {
    const attivo = key === stato.tema ? 'attivo' : '';
    return `<div class="tema-scelta ${attivo}" data-azione="scegli-tema" data-tema="${key}">${THEMES[key].label}</div>`;
  }).join('');
}

export function temaSalvato() {
  try { return localStorage.getItem('tombolaTema') || 'natale'; } catch (e) { return 'natale'; }
}
