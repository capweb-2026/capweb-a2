import test from 'node:test';
import assert from 'node:assert/strict';
import { Readable } from 'node:stream';
import { replyTo } from '../public/js/brain.js';
import { traiterChat } from '../api/chat.js';

test('la fonction Vercel répond sans exposer de configuration au navigateur', async () => {
  const req = Readable.from([
    Buffer.from(JSON.stringify({ message: 'git status', historique: [] }))
  ]);
  req.method = 'POST';

  let corps;
  const entetes = new Map();
  const res = {
    statusCode: 200,
    setHeader(nom, valeur) {
      entetes.set(nom.toLowerCase(), valeur);
    },
    end(valeur) {
      corps = valeur;
    }
  };

  await traiterChat(req, res, {});

  assert.equal(res.statusCode, 200);
  assert.match(entetes.get('content-type'), /application\/json/);
  assert.deepEqual(JSON.parse(corps), {
    texte: replyTo('git status'),
    source: 'regles',
    modeDegrade: true
  });
});
