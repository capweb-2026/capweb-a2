import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { replyTo } from '../public/js/brain.js';
import {
  construireMessages,
  fournisseurDepuisEnv,
  repondreAvecIA
} from '../server/ia.js';

describe('repondreAvecIA', () => {
  it('utilise la réponse du fournisseur pour une question Git', async () => {
    const resultat = await repondreAvecIA({
      message: 'Explique git status simplement',
      historique: [],
      delaiMs: 100,
      fournisseur: async ({ messages }) => {
        assert.ok(messages.some((message) =>
          message.role === 'user' && message.content === 'Explique git status simplement'
        ));
        return 'git status affiche l’état du dépôt sans modifier les fichiers.';
      }
    });

    assert.deepEqual(resultat, {
      texte: 'git status affiche l’état du dépôt sans modifier les fichiers.',
      source: 'ia',
      modeDegrade: false
    });
  });

  it('utilise les règles quand la configuration manque', async () => {
    assert.deepEqual(await repondreAvecIA({ message: 'git status' }), {
      texte: replyTo('git status'),
      source: 'regles',
      modeDegrade: true
    });
  });

  it('utilise les règles quand le fournisseur échoue ou répond vide', async () => {
    const erreur = await repondreAvecIA({
      message: 'git status',
      fournisseur: async () => {
        throw new Error('passerelle indisponible');
      }
    });
    const vide = await repondreAvecIA({
      message: 'git status',
      fournisseur: async () => '   '
    });

    for (const resultat of [erreur, vide]) {
      assert.deepEqual(resultat, {
        texte: replyTo('git status'),
        source: 'regles',
        modeDegrade: true
      });
    }
  });

  it('abandonne un fournisseur trop lent', async () => {
    const debut = Date.now();
    const resultat = await repondreAvecIA({
      message: 'Explique une branche Git',
      delaiMs: 20,
      fournisseur: () => new Promise((resolve) => {
        setTimeout(() => resolve('réponse tardive'), 200);
      })
    });

    assert.equal(resultat.source, 'regles');
    assert.equal(resultat.modeDegrade, true);
    assert.ok(Date.now() - debut < 150);
  });

  it('refuse un message invalide sans appeler le fournisseur', async () => {
    let appels = 0;
    const resultat = await repondreAvecIA({
      message: '   ',
      fournisseur: async () => {
        appels += 1;
        return 'inattendu';
      }
    });

    assert.equal(appels, 0);
    assert.equal(resultat.source, 'regles');
    assert.equal(resultat.modeDegrade, false);
    assert.match(resultat.texte, /vide/);
  });
});

describe('configuration serveur', () => {
  it('construit un contexte limité au tutorat Git', () => {
    const messages = construireMessages({
      message: 'Comment créer une branche ?',
      historique: [{ role: 'assistant', text: 'Ancienne réponse' }]
    });

    assert.equal(messages[0].role, 'system');
    assert.match(messages[0].content, /Git/);
    assert.match(messages[0].content, /hors thème/i);
    assert.deepEqual(messages.at(-1), {
      role: 'user',
      content: 'Comment créer une branche ?'
    });
  });

  it('ne crée pas de fournisseur sans URL et clé serveur', () => {
    assert.equal(fournisseurDepuisEnv({}), null);
    assert.equal(fournisseurDepuisEnv({ CAPWEB_IA_URL: 'https://passerelle.exemple' }), null);
    assert.equal(fournisseurDepuisEnv({ CAPWEB_IA_CLE: 'cle-de-test' }), null);
  });

  it('appelle la passerelle avec la clé serveur', async () => {
    let requete;
    const fournisseur = fournisseurDepuisEnv(
      {
        CAPWEB_IA_URL: 'https://passerelle.exemple/',
        CAPWEB_IA_CLE: 'cle-de-test'
      },
      async (url, options) => {
        requete = { url, options };
        return {
          ok: true,
          async json() {
            return { choices: [{ message: { content: 'Réponse Git' } }] };
          }
        };
      }
    );

    const texte = await fournisseur({
      messages: [{ role: 'user', content: 'git status' }]
    });

    assert.equal(texte, 'Réponse Git');
    assert.equal(requete.url, 'https://passerelle.exemple/chat/completions');
    assert.equal(requete.options.headers.authorization, 'Bearer cle-de-test');
  });
});
