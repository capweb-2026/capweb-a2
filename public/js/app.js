import { validateMessage, replyTo } from './brain.js';
import { persona, validatePersona } from './persona.js';
import { renderMessages } from './view.js';

const formulaire = document.querySelector('#chat-form');
const champ = document.querySelector('#message');
const liste = document.querySelector('#messages');
const statut = document.querySelector('#status');
const versionElt = document.querySelector('#version');
const effacer = document.querySelector('#effacer');
const titreNom = document.querySelector('#assistant-name');
const accueil = document.querySelector('#accueil');
const suggestions = document.querySelector('#suggestions');
const historique = [];
const cleHistorique = 'capweb.historique';

function mettreAJourIdentite() {
  const conversationVide = historique.length === 0;
  accueil.hidden = !conversationVide;
  suggestions.hidden = !conversationVide;
}

const validationPersona = validatePersona(persona);
if (!validationPersona.ok) {
  statut.textContent = validationPersona.erreurs.join(' ');
}
titreNom.textContent = `${persona.nom} ${persona.emoji}`;
accueil.textContent = persona.accueil;
const boutons = persona.suggestions.map((question) => {
  const bouton = document.createElement('button');
  bouton.type = 'button';
  bouton.textContent = question;
  bouton.addEventListener('click', () => {
    champ.value = question;
    champ.focus();
  });
  return bouton;
});
suggestions.replaceChildren(...boutons);

// Une mémoire abîmée ne doit pas empêcher d'utiliser le formulaire.
try {
  const sauvegarde = localStorage.getItem(cleHistorique);
  if (sauvegarde !== null) {
    const messages = JSON.parse(sauvegarde);
    const valide = Array.isArray(messages) && messages.every((message) =>
      message !== null &&
      typeof message === 'object' &&
      (message.role === 'user' || message.role === 'assistant') &&
      typeof message.text === 'string'
    );
    if (valide) historique.push(...messages);
    else statut.textContent = 'La sauvegarde est abîmée. La conversation repart à zéro.';
  }
} catch {
  statut.textContent = 'La mémoire est indisponible ou abîmée. La conversation repart à zéro.';
}
renderMessages(historique, liste, persona.nom);
mettreAJourIdentite();

formulaire.addEventListener('submit', (event) => {
  event.preventDefault();
  const resultat = validateMessage(champ.value);
  if (!resultat.ok) {
    statut.textContent = resultat.error;
    champ.focus();
    return;
  }

  historique.push({ role: 'user', text: resultat.value });
  historique.push({ role: 'assistant', text: replyTo(resultat.value) });
  renderMessages(historique, liste, persona.nom);
  mettreAJourIdentite();
  champ.value = '';
  statut.textContent = '';
  champ.focus();

  try {
    localStorage.setItem(cleHistorique, JSON.stringify(historique));
  } catch {
    statut.textContent = 'La conversation fonctionne, mais elle ne peut pas être sauvegardée.';
  }
});

effacer.addEventListener('click', () => {
  if (!confirm('Effacer toute la conversation ?')) return;
  historique.length = 0;
  renderMessages(historique, liste, persona.nom);
  mettreAJourIdentite();
  statut.textContent = 'Conversation effacée.';
  try {
    localStorage.removeItem(cleHistorique);
  } catch {
    statut.textContent = 'Conversation effacée à l’écran, mais la mémoire est inaccessible.';
  }
  champ.focus();
});

fetch('/version.json', { headers: { accept: 'application/json' } })
  .then((reponse) => (reponse.ok ? reponse.json() : null))
  .then((donnees) => {
    if (donnees && typeof donnees.version === 'string' && versionElt) {
      versionElt.textContent = `version ${donnees.version}`;
    }
  })
  .catch(() => {});
