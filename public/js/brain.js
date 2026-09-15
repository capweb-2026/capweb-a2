// Les règles ne dépendent pas du navigateur : Node peut aussi les tester.
export function validateMessage(raw) {
  if (typeof raw !== 'string') {
    return { ok: false, error: 'Le message doit être un texte.' };
  }

  const value = raw.trim();
  if (value === '') {
    return { ok: false, error: 'Le message ne doit pas être vide' };
  }
  if (value.length > 280) {
    return { ok: false, error: 'Le message ne doit pas dépasser 280 caractères.' };
  }

  return { ok: true, value };
}

// Une réponse courte par commande, avec un exemple à essayer soi-même.
const commandes = {
  init: 'git init crée un dépôt Git dans le dossier courant. Placez-vous dans votre projet, puis lancez git init. Vérifiez ensuite avec git status.',
  clone: 'git clone copie un dépôt existant sur votre machine. Exemple : git clone <URL-du-dépôt>. Entrez ensuite dans le dossier téléchargé avec cd <nom-du-dossier>.',
  status: 'git status montre la branche actuelle et les fichiers modifiés, préparés ou non suivis. Cette commande ne modifie aucun fichier. Utilisez-la avant de préparer un commit.',
  diff: 'git diff montre les changements qui ne sont pas encore préparés. git diff --staged montre les changements préparés pour le prochain commit. Relisez-les avant de valider.',
  add: 'git add prépare les changements d’un fichier pour le prochain commit. Exemple : git add index.html. Cela ne crée pas de commit et ne publie rien sur GitHub. Vérifiez avec git status.',
  commit: 'git commit enregistre localement les changements préparés. Exemple : git add index.html, puis git commit -m "Ajouter le formulaire". Un commit ne publie rien sur GitHub ; git push sert à envoyer les commits.',
  log: 'git log affiche les commits enregistrés. Essayez git log --oneline pour voir une ligne par commit, avec son identifiant et son message.',
  branch: 'git branch liste les branches locales. L’astérisque indique celle où vous travaillez. Une branche permet de développer un changement séparément.',
  switch: 'git switch change de branche. Pour en créer une et y travailler : git switch -c tuteur-git. Vérifiez ensuite la branche avec git branch.',
  merge: 'git merge intègre les changements d’une autre branche dans la branche actuelle. Exemple : git merge tuteur-git. Vérifiez d’abord votre branche et l’état du travail avec git status.',
  push: 'git push envoie vos commits locaux vers le dépôt distant. Pour le premier envoi d’une branche : git push -u origin tuteur-git. Vérifiez votre branche et l’adresse du dépôt avec git branch et git remote -v.',
  pull: 'git pull récupère les nouveaux commits du dépôt distant et les intègre à votre branche. Lancez git status avant pour vérifier votre travail local. Si un conflit apparaît, écrivez conflit.'
};

export function replyTo(message) {
  const texte = message.trim().toLowerCase();
  if (texte === 'salut' || texte === 'bonjour') {
    return 'Bonjour ! Je suis votre tuteur Git pour débutants. Écrivez aide, une commande comme git status, ou une erreur Git.';
  }
  if (texte === 'aide') {
    return 'Pour commencer : salut ou bonjour. Écrivez aide pour revoir cette liste. Commandes : init, clone, status, diff, add, commit, log, branch, switch, merge, push et pull (avec ou sans git devant). Autres sujets : bonnes pratiques, not a git repository, nothing to commit, conflit et test.';
  }
  if (texte === 'test') {
    return 'Test réussi : le tuteur Git fonctionne ! Essayez git status pour votre première explication.';
  }
  if (texte.includes('not a git repository')) {
    return 'Cette erreur signifie que Git ne trouve pas de dépôt dans le dossier courant ou ses parents. Vérifiez votre dossier : entrez dans le projet cloné avec cd <nom-du-projet>. Pour un nouveau projet sans dépôt, utilisez git init.';
  }
  if (texte.includes('nothing to commit')) {
    return 'Git n’a aucun changement préparé à enregistrer. Lancez git status : si un fichier est modifié mais non préparé, utilisez git add <fichier>. Si le dossier de travail est propre, aucun nouveau commit n’est nécessaire.';
  }
  if (texte === 'conflit' || texte.includes('merge conflict') || texte.includes('conflict (')) {
    return 'Un conflit apparaît quand Git ne peut pas combiner automatiquement des changements. Lancez git status, ouvrez les fichiers concernés et résolvez les blocs <<<<<<<, ======= et >>>>>>> en gardant le contenu voulu. Préparez les fichiers résolus avec git add. Suivez ensuite l’action indiquée par git status pour terminer la fusion ou le rebase.';
  }
  if (texte.includes('please tell me who you are') || texte.includes('author identity unknown')) {
    return 'Git a besoin de votre identité pour identifier l’auteur du commit. Dans ce dépôt, renseignez vos propres valeurs avec git config user.name "Votre nom" et git config user.email "votre-adresse". Ces réglages restent propres au dépôt sans l’option --global.';
  }
  if (texte === 'bonnes pratiques' || texte === 'bonnes pratiques de commit') {
    return 'Faites un commit pour un changement cohérent, avec un message précis comme "Ajouter la validation du message". Avant : git status, git diff, git add <fichier>, puis git diff --staged. Vérifiez le fonctionnement. Ne préparez pas de mots de passe, de fichiers .env ou de node_modules. Travaillez dans la branche prévue pour votre changement.';
  }

  // Les options sont acceptées : "git status --short" demande aussi status.
  const commande = texte.replace(/^git\s+/, '').split(/\s+/)[0];
  if (Object.hasOwn(commandes, commande)) {
    return commandes[commande];
  }
  return 'Je ne reconnais pas encore cette question Git. Écrivez aide pour voir les commandes et erreurs expliquées.';
}
