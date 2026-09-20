import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { persona, validatePersona } from '../public/js/persona.js';

describe('Identité — critères 1 à 4', () => {
  it('contient les valeurs choisies pour GitDépart', () => {
    assert.deepEqual(persona, {
      nom: 'GitDépart',
      emoji: '🌱',
      accueil: 'Bonjour, je suis GitDépart 🌱. Je peux t’aider à comprendre Git.',
      suggestions: [
        'Comment créer un commit ?',
        'À quoi sert git status ?',
        'Comment créer une branche ?'
      ]
    });
    assert.deepEqual(validatePersona(persona), { ok: true });
  });

  it('accepte les limites de 2 et 20 caractères du nom', () => {
    assert.equal(validatePersona({ ...persona, nom: 'Gi' }).ok, true);
    assert.equal(validatePersona({ ...persona, nom: 'G'.repeat(20), accueil: `Bonjour ${'G'.repeat(20)}` }).ok, true);
  });

  it('refuse les noms de 1 et 21 caractères', () => {
    assert.equal(validatePersona({ ...persona, nom: 'G' }).ok, false);
    assert.equal(validatePersona({ ...persona, nom: 'G'.repeat(21) }).ok, false);
  });

  it('refuse du texte ou plusieurs emojis', () => {
    assert.equal(validatePersona({ ...persona, emoji: 'texte' }).ok, false);
    assert.equal(validatePersona({ ...persona, emoji: '🌱🌱' }).ok, false);
  });

  it('refuse un accueil sans le nom', () => {
    assert.equal(validatePersona({ ...persona, accueil: 'Bonjour !' }).ok, false);
  });

  it('exige exactement trois suggestions non vides', () => {
    assert.equal(validatePersona({ ...persona, suggestions: persona.suggestions.slice(0, 2) }).ok, false);
    assert.equal(validatePersona({ ...persona, suggestions: [...persona.suggestions, 'Une autre question'] }).ok, false);
    assert.equal(validatePersona({ ...persona, suggestions: ['Question 1', '', 'Question 3'] }).ok, false);
  });
});
