// Ce module transforme les données de la conversation en éléments HTML.
export function renderMessages(messages, container, assistantName = 'Cap Web') {
  const lignes = messages.map((message) => {
    const li = document.createElement('li');
    const auteur = message.role === 'user' ? 'Vous' : assistantName;
    li.textContent = `${auteur} : ${message.text}`;
    return li;
  });

  container.replaceChildren(...lignes);
}
