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
// CONTROLE DE PONTUAÇÃO
// =========================================================

// Guarda quais linhas desta cartela já deram ponto
let scoredRows = [];

// Controla se o bônus da cartela completa já foi recebido
let fullCardScored = false;


// =========================================================
// SHUFFLE
// =========================================================

function shuffleArray(array) {

  const arr = [...array];

  for (
    let i = arr.length - 1;
    i > 0;
    i--
  ) {

    const j =
      Math.floor(
        Math.random() * (i + 1)
      );

    [arr[i], arr[j]] =
      [arr[j], arr[i]];

  }

  return arr;
}


// =========================================================
// GERAR CARTELA
// =========================================================

generateCardBtn.addEventListener(
  "click",
  () => {

    // Nova cartela = novo controle de pontos
    scoredRows = [];
    fullCardScored = false;

    bingoCard.innerHTML = "";


    // Seleciona 16 opções aleatórias
    const selected =
      shuffleArray(bingoOptions)
        .slice(0, 16);


    selected.forEach(option => {

      const div =
        document.createElement("div");

      div.classList.add("bingo-item");

      div.textContent = option;


      // ===================================================
      // CLICAR NO ITEM
      // ===================================================

      div.addEventListener(
        "click",
        async () => {

          // Se já estiver marcado,
          // permite desmarcar normalmente
          if (
            div.classList.contains("checked")
          ) {

            div.classList.remove("checked");

            return;
          }


          // Busca tudo que já foi sorteado
          const usedSnapshot =
            await get(
              ref(
                db,
                "roulette/usedOptions"
              )
            );


          const usedData =
            usedSnapshot.val() || {};


          const drawnOptions =
            Object.values(usedData);


          // Verifica se esta opção já saiu
          const wasDrawn =
            drawnOptions.includes(option);


          // Ainda não foi sorteada
          if (!wasDrawn) {

            showLockedFeedback(div);

            return;
          }


          // Foi sorteada: pode marcar
          div.classList.add("checked");

        }
      );


      bingoCard.appendChild(div);

    });


    bingoCard.classList.remove("hidden");

    bingoBtn.classList.remove("hidden");

  }
);


// =========================================================
// FEEDBACK DE OPÇÃO NÃO SORTEADA
// =========================================================

function showLockedFeedback(item) {

  // Remove para permitir reiniciar
  // a animação em cliques seguidos
  item.classList.remove("not-drawn");

  void item.offsetWidth;

  item.classList.add("not-drawn");


  setTimeout(() => {

    item.classList.remove("not-drawn");

  }, 500);

}


// =========================================================
// CALCULAR PONTOS
// =========================================================

function calculatePoints() {

  const items = [
    ...document.querySelectorAll(
      ".bingo-item"
    )
  ];


  // Segurança caso não exista cartela
  if (items.length !== 16) {
    return 0;
  }


  let newPoints = 0;


  // =======================================================
  // LINHAS
  // =======================================================

  for (
    let row = 0;
    row < 4;
    row++
  ) {

    const start = row * 4;

    const rowItems =
      items.slice(
        start,
        start + 4
      );


    const complete =
      rowItems.every(
        item =>
          item.classList.contains(
            "checked"
          )
      );


    // Linha completa e ainda não pontuada
    if (
      complete &&
      !scoredRows.includes(row)
    ) {

      scoredRows.push(row);

      newPoints += 1;

    }

  }


  // =======================================================
  // CARTELA COMPLETA
  // =======================================================

  const fullCard =
    items.every(
      item =>
        item.classList.contains(
          "checked"
        )
    );


  // Bônus único de +1
  if (
    fullCard &&
    !fullCardScored
  ) {

    fullCardScored = true;

    newPoints += 1;

  }


  return newPoints;
}


// =========================================================
// BINGO
// =========================================================

bingoBtn.addEventListener(
  "click",
  async () => {

    const points =
      calculatePoints();


    // =====================================================
    // NENHUM BINGO NOVO
    // =====================================================

    if (points === 0) {

      showToast(
        "Nenhuma nova linha foi completada!"
      );

      return;
    }


    const playerId =
      localStorage.getItem(
        "playerId"
      );


    if (!playerId) {
      return;
    }


    const playerRef =
      ref(
        db,
        `players/${playerId}`
      );


    const snapshot =
      await get(playerRef);


    const player =
      snapshot.val();


    if (!player) {
      return;
    }


    const currentPoints =
      player.points || 0;


    await update(
      playerRef,
      {
        points:
          currentPoints + points
      }
    );


    // =====================================================
    // MENSAGEM
    // =====================================================

    if (
      fullCardScored &&
      scoredRows.length === 4 &&
      points > 1
    ) {

      showToast(
        `BINGO! Você ganhou ${points} pontos!`
      );

    } else if (points === 1) {

      showToast(
        "BINGO! Você ganhou 1 ponto!"
      );

    } else {

      showToast(
        `BINGO! Você ganhou ${points} pontos!`
      );

    }

  }
);


// =========================================================
// TOAST
// =========================================================

function showToast(message) {

  const toast =
    document.getElementById(
      "globalToast"
    );


  toast.textContent = message;

  toast.classList.remove("hidden");


  setTimeout(() => {

    toast.classList.add("hidden");

  }, 2000);

}