import { repondreRequeteChat } from '../server/ia.js';

export async function traiterChat(req, res, env) {
  res.setHeader('content-type', 'application/json; charset=utf-8');

  const methode = (req.method ?? 'GET').toUpperCase();
  if (methode !== 'POST') {
    res.statusCode = 405;
    res.end(JSON.stringify({ erreur: 'Méthode non autorisée' }));
    return;
  }

  try {
    const corps = await repondreRequeteChat(req, env);
    res.statusCode = 200;
    res.end(JSON.stringify(corps));
  } catch {
    res.statusCode = 400;
    res.end(JSON.stringify({ erreur: 'Requête invalide' }));
  }
}

export default function handler(req, res) {
  return traiterChat(req, res);
}
