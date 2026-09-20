# SPEC.md — Identité de GitDépart

## Objectif

GitDépart donne au tuteur Git une identité reconnaissable dès l'ouverture de la page. L'utilisateur voit son nom, son emoji, un accueil et trois questions pour commencer à apprendre Git.

## Critères d'acceptation

1. **Nom** — Quand la page s'ouvre, le système affiche `GitDépart` dans le titre principal. Le nom, sans espaces autour, fait de 2 à 20 caractères.
2. **Emoji** — Quand la page s'ouvre, le système affiche exactement un emoji `🌱` à côté du nom. Un emoji visible compte pour un, même si JavaScript utilise plusieurs unités de code.
3. **Accueil** — Quand la conversation est vide, le système affiche `Bonjour, je suis GitDépart 🌱. Je peux t’aider à comprendre Git.` en dehors de `#messages`. L'accueil disparaît dès le premier message envoyé et revient quand la conversation est effacée.
4. **Suggestions** — Quand la conversation est vide, le système propose exactement trois questions : `Comment créer un commit ?`, `À quoi sert git status ?` et `Comment créer une branche ?`. Quand l'utilisateur clique sur une suggestion, le système place la question dans `#message` sans l'envoyer.
5. **Réponses signées** — Quand l'assistant répond, sa ligne commence par `GitDépart` au lieu de `Cap Web`.
6. **Contrat** — Quand l'identité est ajoutée, le système conserve tous les tests du contrat CP1 au vert.

## Hors périmètre

Pas de choix de l'identité par l'utilisateur, pas d'image d'avatar, pas d'appel à une IA et pas de nouvelle dépendance.

## Données et fonctions attendues

- `public/js/persona.js` exporte `persona = { nom, emoji, accueil, suggestions }` avec les valeurs écrites dans cette spec.
- `public/js/persona.js` exporte `validatePersona(valeur)`, qui renvoie `{ ok: true }` ou `{ ok: false, erreurs: [texte, …] }`.
- `validatePersona` refuse une valeur qui n'est pas un objet, un nom dont la longueur sans espaces autour n'est pas comprise entre 2 et 20 caractères, un emoji absent ou multiple, un accueil qui ne contient pas le nom, un nombre de suggestions différent de trois et toute suggestion vide.
- `public/index.html` contient `#accueil` et `#suggestions`, tous les deux en dehors de `#messages`.
- `public/js/app.js` affiche ou masque l'accueil et les suggestions selon que la conversation est vide.
- `public/js/view.js` reçoit le nom de l'assistant et l'utilise pour signer ses réponses avec `textContent`.
- `server/app.js` ajoute `public/js/persona.js` à sa liste blanche avec le type JavaScript.

## Questions ouvertes

Aucune.
