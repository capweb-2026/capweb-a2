import { after, before, test } from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { replyTo } from '../public/js/brain.js';
import { createApp } from '../server/app.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const publicDir = path.join(__dirname, '..', 'public');

let serveur;
let baseUrl;

before(async () => {
  const app = createApp({ publicDir, version: 'test-cp3', env: {} });
  await new Promise((resolve) => {
    serveur = app.listen(0, '127.0.0.1', resolve);
  });
  const adresse = serveur.address();
  baseUrl = `http://127.0.0.1:${adresse.port}`;
});

after(() => new Promise((resolve, reject) => {
  serveur.close((erreur) => (erreur ? reject(erreur) : resolve()));
}));

test('POST /api/chat répond avec les règles sans configuration IA', async () => {
  const reponse = await fetch(`${baseUrl}/api/chat`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ message: 'git status', historique: [] })
  });

  assert.equal(reponse.status, 200);
  assert.match(reponse.headers.get('content-type') ?? '', /application\/json/);
  assert.deepEqual(await reponse.json(), {
    texte: replyTo('git status'),
    source: 'regles',
    modeDegrade: true
  });
});

test('GET /api/chat est refusé en JSON', async () => {
  const reponse = await fetch(`${baseUrl}/api/chat`);
  assert.equal(reponse.status, 405);
  assert.match(reponse.headers.get('content-type') ?? '', /application\/json/);
});

test('POST /api/chat refuse un JSON invalide', async () => {
  const reponse = await fetch(`${baseUrl}/api/chat`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: '{invalide'
  });
  assert.equal(reponse.status, 400);
});
