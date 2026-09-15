import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { validateMessage, replyTo } from '../public/js/brain.js';

describe('validateMessage', () => {
  it('refuse un texte vide ou composé seulement d’espaces', () => {
    assert.equal(validateMessage('').ok, false);
    assert.equal(validateMessage('   ').ok, false);
  });

  it('refuse les valeurs qui ne sont pas des chaînes', () => {
    for (const valeur of [null, undefined, 42, {}, []]) {
      assert.equal(validateMessage(valeur).ok, false);
    }
  });

  it('nettoie les espaces autour du message', () => {
    assert.deepEqual(validateMessage('  salut  '), { ok: true, value: 'salut' });
  });

  it('accepte 280 caractères, refuse 281', () => {
    assert.equal(validateMessage('a'.repeat(280)).ok, true);
    assert.equal(validateMessage('a'.repeat(281)).ok, false);
  });
});

describe('replyTo', () => {
  it('reconnaît les salutations malgré les majuscules et les espaces', () => {
    assert.equal(replyTo(' SALUT '), replyTo('salut'));
    assert.equal(replyTo(' BONJOUR '), replyTo('salut'));
  });

  it('répond à aide et test avec deux réponses distinctes', () => {
    assert.match(replyTo(' AIDE '), /salut.*bonjour.*aide.*test/);
    assert.match(replyTo(' TEST '), /Test réussi/);
    assert.notEqual(replyTo('aide'), replyTo('test'));
  });

  it('répond à un message inconnu sans le confondre avec aide ou test', () => {
    assert.ok(replyTo('une phrase inconnue').length > 0);
    assert.notEqual(replyTo('une phrase inconnue'), replyTo('aide'));
    assert.equal(replyTo('tester'), replyTo('une phrase inconnue'));
  });

  it('explique les commandes avec ou sans git et avec des options', () => {
    assert.equal(replyTo(' GIT STATUS --short '), replyTo('status'));
    assert.match(replyTo('status'), /ne modifie aucun fichier/);
    assert.match(replyTo('git diff --staged'), /changements préparés/);
  });

  it('distingue préparation, commit local et publication', () => {
    assert.match(replyTo('add'), /prépare.*ne crée pas de commit/);
    assert.match(replyTo('commit'), /localement.*git push/);
    assert.match(replyTo('push'), /dépôt distant/);
    assert.notEqual(replyTo('commit'), replyTo('push'));
  });

  it('explique les erreurs copiées sans les confondre avec une commande', () => {
    assert.match(replyTo('fatal: not a git repository'), /Vérifiez votre dossier/);
    assert.match(replyTo('nothing to commit, working tree clean'), /aucun nouveau commit/);
    assert.match(replyTo('CONFLICT (content): Merge conflict in index.html'), /résolvez les blocs/);
    assert.match(replyTo('Author identity unknown'), /git config user.name/);
  });

  it('donne des bonnes pratiques et une méthode pour créer une branche', () => {
    assert.match(replyTo('bonnes pratiques'), /changement cohérent/);
    assert.match(replyTo('bonnes pratiques'), /git diff --staged/);
    assert.match(replyTo('switch'), /git switch -c tuteur-git/);
  });

  it('ne traite pas une propriété JavaScript comme une commande Git', () => {
    assert.equal(replyTo('constructor'), replyTo('une phrase inconnue'));
    assert.equal(replyTo('__proto__'), replyTo('une phrase inconnue'));
  });
});
