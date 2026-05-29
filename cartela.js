import {
  db,
  ref,
  get,
  update
} from "./firebase.js";

// =========================================================
// ELEMENTOS
// =========================================================

const generateCardBtn =
  document.getElementById("generateCardBtn");

const bingoCard =
  document.getElementById("bingoCard");

const bingoBtn =
  document.getElementById("bingoBtn");

// =========================================================
// OPÇÕES
// =========================================================

const bingoOptions = [
  "MIC FALHANDO",
  "LIVE CAINDO",
  "SONS ESTOURADOS",
  "FLASHBANG",
  "BUGS NOS JOGOS",
  "MORTE POR QUEDA",
  "PARTICIPAÇÃO DA FREYA",
  "JOGO CRASHANDO",
  "FALTA DE LIVE",
  "COACHING DE CRIMINALIDADE",
  "IA PARA ONLYFANS",
  "PARTICIPAÇÃO DO YAGAMI",
  "10 PALAVRAS COM 11 PALAVRÕES",
  "AMNÉSIA",
  "PROBLEMAS DE DICÇÃO",
  "CEBOLA GANHANDO SORTEIO",
  "TIOLU E A MÁ SORTE",
  "ZÉ LOOTINHO",
  "MONSTERMANÍACA",
  "PROMETE MAIS DO QUE POLÍTICO",
  "GAMEPLAY SEM JOGO",
  "ESQUECER DE DESMUTAR",
  "KAMYY CULTURAS",
  "ALEATORIEDADES",
  "PESSOA QUE SÓ APARECE 1X E GANHA SORTEIO",
  "PROBLEMAS DE SONS",
  "ESPIRRO DO YAGAMI"
];

// =========================================================
// SHUFFLE
// =========================================================

function shuffleArray(array) {

  const arr = [...array];

  for (let i = arr.length - 1; i > 0; i--) {

    const j = Math.floor(Math.random() * (i + 1));

    [arr[i], arr[j]] = [arr[j], arr[i]];
  }

  return arr;
}

// =========================================================
// GERAR CARTELA
// =========================================================

generateCardBtn.addEventListener("click", () => {

  scoredCombos = {
    rows: [],
    cols: [],
    diagonals: [],
    full: false
  };

  bingoCard.innerHTML = "";

  // pega 16 opções aleatórias
  const selected =
    shuffleArray(bingoOptions).slice(0, 16);

  selected.forEach(option => {

    const div =
      document.createElement("div");

    div.classList.add("bingo-item");

    div.textContent = option;

    // marcar item
    div.addEventListener("click", () => {
      div.classList.toggle("checked");
    });

    bingoCard.appendChild(div);
  });

  bingoCard.classList.remove("hidden");

  bingoBtn.classList.remove("hidden");
});
// =========================================================
// CONTROLE DE PONTOS DA CARTELA
// =========================================================

let scoredCombos = {
  rows: [],
  cols: [],
  diagonals: [],
  full: false
};

// =========================================================
// CALCULAR NOVOS PONTOS
// =========================================================

function calculatePoints() {

  const items =
    [...document.querySelectorAll(".bingo-item")];

  let newPoints = 0;

  const grid = [];

  while (items.length) {
    grid.push(items.splice(0, 4));
  }

  // =====================================================
  // LINHAS
  // =====================================================

  for (let row = 0; row < 4; row++) {

    const complete =
      grid[row].every(item =>
        item.classList.contains("checked")
      );

    if (
      complete &&
      !scoredCombos.rows.includes(row)
    ) {
      scoredCombos.rows.push(row);

      newPoints += 1;
    }
  }

  // =====================================================
  // COLUNAS
  // =====================================================

  for (let col = 0; col < 4; col++) {

    let complete = true;

    for (let row = 0; row < 4; row++) {

      if (
        !grid[row][col]
        .classList.contains("checked")
      ) {
        complete = false;
      }
    }

    if (
      complete &&
      !scoredCombos.cols.includes(col)
    ) {
      scoredCombos.cols.push(col);

      newPoints += 1;
    }
  }

  // =====================================================
  // DIAGONAL 1
  // =====================================================

  let diagonal1 = true;

  for (let i = 0; i < 4; i++) {

    if (
      !grid[i][i]
      .classList.contains("checked")
    ) {
      diagonal1 = false;
    }
  }

  if (
    diagonal1 &&
    !scoredCombos.diagonals.includes(1)
  ) {
    scoredCombos.diagonals.push(1);

    newPoints += 1;
  }

  // =====================================================
  // DIAGONAL 2
  // =====================================================

  let diagonal2 = true;

  for (let i = 0; i < 4; i++) {

    if (
      !grid[i][3 - i]
      .classList.contains("checked")
    ) {
      diagonal2 = false;
    }
  }

  if (
    diagonal2 &&
    !scoredCombos.diagonals.includes(2)
  ) {
    scoredCombos.diagonals.push(2);

    newPoints += 1;
  }

  // =====================================================
  // CARTELA COMPLETA
  // =====================================================

  const fullCard =
    document.querySelectorAll(
      ".bingo-item.checked"
    ).length === 16;

  if (
    fullCard &&
    !scoredCombos.full
  ) {

    scoredCombos.full = true;

    newPoints += 2;
  }

  return newPoints;
}

// =========================================================
// BINGO
// =========================================================

bingoBtn.addEventListener("click", async () => {

  const points =
    calculatePoints();

  const playerId =
    localStorage.getItem("playerId");

  if (!playerId) return;

  const playerRef =
    ref(db, `players/${playerId}`);

  const snapshot =
    await get(playerRef);

  const player =
    snapshot.val();

  const currentPoints =
    player.points || 0;

  await update(playerRef, {
    points: currentPoints + points
  });

  showToast(`Você ganhou ${points} ponto(s)!`);
});

// =========================================================
// TOAST
// =========================================================

function showToast(message) {

  const toast =
    document.getElementById("globalToast");

  toast.textContent = message;

  toast.classList.remove("hidden");

  setTimeout(() => {
    toast.classList.add("hidden");
  }, 2000);
}