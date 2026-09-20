import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const publicDir = path.join(path.dirname(__filename), '..', 'public');

async function fichiersDe(dossier) {
  const entrees = await readdir(dossier, { withFileTypes: true });
  const groupes = await Promise.all(entrees.map((entree) => {
    const chemin = path.join(dossier, entree.name);
    return entree.isDirectory() ? fichiersDe(chemin) : [chemin];
  }));
  return groupes.flat();
}

test('aucune configuration secrète ne se trouve dans public', async () => {
  for (const fichier of await fichiersDe(publicDir)) {
    const contenu = await readFile(fichier, 'utf8');
    assert.doesNotMatch(contenu, /CAPWEB_IA_CLE|authorization\s*:/i, fichier);
  }
});
