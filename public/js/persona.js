export const persona = {
  nom: 'GitDépart',
  emoji: '🌱',
  accueil: 'Bonjour, je suis GitDépart 🌱. Je peux t’aider à comprendre Git.',
  suggestions: [
    'Comment créer un commit ?',
    'À quoi sert git status ?',
    'Comment créer une branche ?'
  ]
};

export function validatePersona(valeur) {
  const erreurs = [];
  if (valeur === null || typeof valeur !== 'object' || Array.isArray(valeur)) {
    return { ok: false, erreurs: ['La persona doit être un objet.'] };
  }

  const nom = typeof valeur.nom === 'string' ? valeur.nom.trim() : '';
  if (nom.length < 2 || nom.length > 20) {
    erreurs.push('Le nom doit contenir entre 2 et 20 caractères.');
  }
  if (typeof valeur.emoji !== 'string' || !/^\p{Extended_Pictographic}\uFE0F?$/u.test(valeur.emoji)) {
    erreurs.push('Un seul emoji est attendu.');
  }
  if (typeof valeur.accueil !== 'string' || !nom || !valeur.accueil.includes(nom)) {
    erreurs.push('Le message d’accueil doit contenir le nom.');
  }
  if (!Array.isArray(valeur.suggestions) || valeur.suggestions.length !== 3 ||
      valeur.suggestions.some((suggestion) => typeof suggestion !== 'string' || !suggestion.trim())) {
    erreurs.push('Trois suggestions non vides sont attendues.');
  }
  return erreurs.length ? { ok: false, erreurs } : { ok: true };
}
