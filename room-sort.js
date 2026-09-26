// =========================================================
// ELEMENTOS
// =========================================================

const participantsInput =
  document.getElementById(
    "participantsInput"
  );

const sortCards =
  document.getElementById(
    "sortCards"
  );

const participantCount =
  document.getElementById(
    "participantCount"
  );

const clearParticipantsBtn =
  document.getElementById(
    "clearParticipantsBtn"
  );

const drawBtn =
  document.getElementById(
    "drawBtn"
  );

const systemBtn =
  document.getElementById(
    "systemBtn"
  );

const systemModal =
  document.getElementById(
    "systemModal"
  );

const closeSystemBtn =
  document.getElementById(
    "closeSystemBtn"
  );

const winnerBanner =
  document.getElementById(
    "winnerBanner"
  );

const winnerName =
  document.getElementById(
    "winnerName"
  );


// =========================================================
// ESTADO
// =========================================================

let isDrawing = false;


// =========================================================
// PEGAR PARTICIPANTES
// =========================================================

function getParticipants() {

  const text =
    participantsInput.value.trim();


  if (!text) {
    return [];
  }


  return text
    .split(/\s+/)
    .map(name => name.trim())
    .filter(Boolean);

}


// =========================================================
// ATUALIZAR CARTELAS
// =========================================================

function updateCards() {

  if (isDrawing) {
    return;
  }


  const participants =
    getParticipants();


  sortCards.innerHTML = "";

  winnerBanner.classList.add(
    "hidden"
  );


  // =======================================================
  // NENHUM PARTICIPANTE
  // =======================================================

  if (participants.length === 0) {

    sortCards.innerHTML = `
      <div class="empty-state">

        <span>+</span>

        <p>
          Os participantes aparecerão aqui
        </p>

      </div>
    `;


    participantCount.textContent =
      "0 participantes";


    return;
  }


  // =======================================================
  // CRIAR CARTELAS
  // =======================================================

  participants.forEach(
    (participant, index) => {

      const card =
        document.createElement("div");


      card.classList.add(
        "sort-card"
      );


      card.dataset.index =
        index;


      card.textContent =
        participant;


      sortCards.appendChild(
        card
      );

    }
  );


  // =======================================================
  // CONTADOR
  // =======================================================

  const total =
    participants.length;


  participantCount.textContent =
    total === 1
      ? "1 participante"
      : `${total} participantes`;

}


// =========================================================
// DIGITAÇÃO
// =========================================================

participantsInput.addEventListener(
  "input",
  updateCards
);


// =========================================================
// LIMPAR
// =========================================================

clearParticipantsBtn.addEventListener(
  "click",
  () => {

    if (isDrawing) {
      return;
    }


    participantsInput.value = "";

    updateCards();

    participantsInput.focus();

  }
);


// =========================================================
// ABRIR SISTEMAS
// =========================================================

systemBtn.addEventListener(
  "click",
  () => {

    if (isDrawing) {
      return;
    }


    systemModal.classList.remove(
      "hidden"
    );

  }
);


// =========================================================
// FECHAR SISTEMAS
// =========================================================

closeSystemBtn.addEventListener(
  "click",
  () => {

    systemModal.classList.add(
      "hidden"
    );

  }
);


// =========================================================
// FECHAR CLICANDO FORA
// =========================================================

systemModal.addEventListener(
  "click",
  event => {

    if (
      event.target === systemModal
    ) {

      systemModal.classList.add(
        "hidden"
      );

    }

  }
);


// =========================================================
// SORTEAR
// =========================================================

drawBtn.addEventListener(
  "click",
  async () => {

    if (isDrawing) {
      return;
    }


    const participants =
      getParticipants();


    if (
      participants.length < 2
    ) {

      showTemporaryButtonMessage(
        "Adicione participantes"
      );

      return;
    }


    await startDefaultDraw();

  }
);


// =========================================================
// SISTEMA PADRÃO
// =========================================================

async function startDefaultDraw() {

  const cards = [
    ...document.querySelectorAll(
      ".sort-card"
    )
  ];


  if (cards.length < 2) {
    return;
  }


  isDrawing = true;


  // =======================================================
  // BLOQUEAR INTERFACE
  // =======================================================

  participantsInput.disabled = true;

  clearParticipantsBtn.disabled = true;

  systemBtn.disabled = true;

  drawBtn.disabled = true;


  drawBtn.textContent =
    "Sorteando...";


  winnerBanner.classList.add(
    "hidden"
  );


  // =======================================================
  // LIMPAR ESTADOS ANTIGOS
  // =======================================================

  cards.forEach(card => {

    card.classList.remove(
      "winner",
      "eliminated",
      "flash-pink",
      "flash-blue",
      "flash-gold",
      "flash-teal"
    );

  });


  // =======================================================
  // ESCOLHER VENCEDOR
  // =======================================================

  const winnerIndex =
    Math.floor(
      Math.random() *
      cards.length
    );


  const winnerCard =
    cards[winnerIndex];


  // =======================================================
  // LISTA DE PARTICIPANTES ATIVOS
  // =======================================================

  let activeCards =
    cards.filter(
      card =>
        card !== winnerCard
    );


  // =======================================================
  // PRIMEIRA FASE
  // TODOS PISCAM
  // =======================================================

  await flashAllCards(
    cards,
    12,
    110
  );


  // =======================================================
  // SEGUNDA FASE
  // ELIMINAÇÃO
  // =======================================================

  while (
    activeCards.length > 0
  ) {

    // embaralha candidatos
    shuffleArray(activeCards);


    // escolhe um para eliminar
    const eliminatedCard =
      activeCards.pop();


    // pisca todos que ainda estão ativos
    const stillActive = [
      ...activeCards,
      winnerCard,
      eliminatedCard
    ];


    await flashAllCards(
      stillActive,
      2,
      130
    );


    // elimina
    eliminatedCard.className =
      "sort-card eliminated";


    await wait(120);

  }


  // =======================================================
  // SUSPENSE FINAL
  // =======================================================

  await flashSingleCard(
    winnerCard,
    5,
    180
  );


  // =======================================================
  // VENCEDOR
  // =======================================================

  winnerCard.className =
    "sort-card winner";


  const winner =
    winnerCard.textContent;


  winnerName.textContent =
    winner;


  winnerBanner.classList.remove(
    "hidden"
  );


  // =======================================================
  // LIBERAR INTERFACE
  // =======================================================

  isDrawing = false;


  participantsInput.disabled = false;

  clearParticipantsBtn.disabled = false;

  systemBtn.disabled = false;

  drawBtn.disabled = false;


  drawBtn.textContent =
    "Sortear";

}


// =========================================================
// PISCAR VÁRIAS CARTELAS
// =========================================================

async function flashAllCards(
  cards,
  repetitions,
  speed
) {

  const colors = [
    "flash-pink",
    "flash-blue",
    "flash-gold",
    "flash-teal"
  ];


  for (
    let i = 0;
    i < repetitions;
    i++
  ) {

    cards.forEach(card => {

      removeFlashClasses(card);


      const randomColor =
        colors[
          Math.floor(
            Math.random() *
            colors.length
          )
        ];


      card.classList.add(
        randomColor
      );

    });


    await wait(speed);

  }


  cards.forEach(card => {
    removeFlashClasses(card);
  });

}


// =========================================================
// PISCAR CARTELA ÚNICA
// =========================================================

async function flashSingleCard(
  card,
  repetitions,
  speed
) {

  const colors = [
    "flash-pink",
    "flash-blue",
    "flash-gold",
    "flash-teal"
  ];


  for (
    let i = 0;
    i < repetitions;
    i++
  ) {

    removeFlashClasses(card);


    card.classList.add(
      colors[
        i % colors.length
      ]
    );


    await wait(speed);

  }


  removeFlashClasses(card);

}


// =========================================================
// REMOVER CORES
// =========================================================

function removeFlashClasses(card) {

  card.classList.remove(
    "flash-pink",
    "flash-blue",
    "flash-gold",
    "flash-teal"
  );

}


// =========================================================
// EMBARALHAR
// =========================================================

function shuffleArray(array) {

  for (
    let i = array.length - 1;
    i > 0;
    i--
  ) {

    const j =
      Math.floor(
        Math.random() *
        (i + 1)
      );


    [
      array[i],
      array[j]
    ] = [
      array[j],
      array[i]
    ];

  }


  return array;

}


// =========================================================
// ESPERAR
// =========================================================

function wait(ms) {

  return new Promise(
    resolve =>
      setTimeout(
        resolve,
        ms
      )
  );

}


// =========================================================
// MENSAGEM TEMPORÁRIA
// =========================================================

function showTemporaryButtonMessage(
  message
) {

  const originalText =
    drawBtn.textContent;


  drawBtn.textContent =
    message;


  setTimeout(() => {

    drawBtn.textContent =
      originalText;

  }, 1500);

}


// =========================================================
// INICIAL
// =========================================================

updateCards();