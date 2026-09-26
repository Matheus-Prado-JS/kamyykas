import {
  db,
  ref,
  onValue,
  remove,
  set,
  get
} from "./firebase.js";


// =========================================================
// ELEMENTOS
// =========================================================

const rollBtn =
  document.getElementById("rollBtn");

const resetRouletteBtn =
  document.getElementById("resetRouletteBtn");

const resultNumber =
  document.getElementById("resultNumber");

const drawCard =
  document.getElementById("drawCard");

const drawCardText =
  document.getElementById("drawCardText");

const drawStatus =
  document.getElementById("drawStatus");


// =========================================================
// PLAYER
// =========================================================

const playerRole =
  localStorage.getItem("playerRole");


// =========================================================
// SOMENTE ADMIN
// =========================================================

if (playerRole !== "admin") {

  rollBtn.disabled = true;

  rollBtn.style.opacity = "0.5";

  rollBtn.style.cursor = "not-allowed";

  rollBtn.textContent = "Somente Admin";

  resetRouletteBtn.classList.add("hidden");
}


// =========================================================
// OPÇÕES
// =========================================================

const rouletteOptions = [

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
// CONTROLE LOCAL DA ANIMAÇÃO
// =========================================================

let animationInterval = null;

let animationTimeout = null;

let lastSpinTimestamp = null;


// =========================================================
// ESTADO INICIAL
// =========================================================

function resetDrawVisual() {

  clearInterval(animationInterval);
  clearTimeout(animationTimeout);

  animationInterval = null;
  animationTimeout = null;

  drawCard.className = "draw-card";

  drawCardText.textContent = "?";

  drawStatus.textContent = "PRONTO";

  resultNumber.textContent = "--";
}


// =========================================================
// ADMIN SORTEIA
// =========================================================

rollBtn.addEventListener(
  "click",
  async () => {

    if (playerRole !== "admin") {
      return;
    }

    rollBtn.disabled = true;
    resetRouletteBtn.disabled = true;


    // =====================================================
    // OPÇÕES JÁ UTILIZADAS
    // =====================================================

    const usedSnapshot =
      await get(
        ref(db, "roulette/usedOptions")
      );

    const usedData =
      usedSnapshot.val() || {};

    const usedOptions =
      Object.values(usedData);


    // =====================================================
    // OPÇÕES DISPONÍVEIS
    // =====================================================

    const availableOptions =
      rouletteOptions.filter(
        option =>
          !usedOptions.includes(option)
      );


    // =====================================================
    // TODAS JÁ FORAM
    // =====================================================

    if (availableOptions.length === 0) {

      alert(
        "Todas as opções já foram sorteadas! Resete o sorteador."
      );

      rollBtn.disabled = false;
      resetRouletteBtn.disabled = false;

      return;
    }


    // =====================================================
    // ESCOLHE O RESULTADO REAL
    // =====================================================

    const winner =
      availableOptions[
        Math.floor(
          Math.random() *
          availableOptions.length
        )
      ];


    const timestamp = Date.now();


    // =====================================================
    // MARCA COMO UTILIZADO
    // =====================================================

    await set(
      ref(
        db,
        `roulette/usedOptions/${timestamp}`
      ),
      winner
    );


    // =====================================================
    // ENVIA O RESULTADO PARA TODOS
    // =====================================================

    await set(
      ref(db, "roulette/currentSpin"),
      {
        winner,
        timestamp
      }
    );

  }
);


// =========================================================
// TODOS ESCUTAM O SORTEIO
// =========================================================

const rouletteRef =
  ref(db, "roulette/currentSpin");


onValue(
  rouletteRef,
  (snapshot) => {

    const data =
      snapshot.val();


    // =====================================================
    // RESET
    // =====================================================

    if (!data) {

      lastSpinTimestamp = null;

      resetDrawVisual();

      return;
    }


    // impede repetir a mesma animação
    if (
      data.timestamp ===
      lastSpinTimestamp
    ) {
      return;
    }


    lastSpinTimestamp =
      data.timestamp;


    startDrawAnimation(
      data.winner
    );

  }
);


// =========================================================
// ANIMAÇÃO DO SORTEIO
// =========================================================

function startDrawAnimation(winner) {

  clearInterval(animationInterval);
  clearTimeout(animationTimeout);


  resultNumber.textContent = "--";

  drawStatus.textContent =
    "SORTEANDO...";


  rollBtn.disabled = true;

  if (playerRole === "admin") {
    resetRouletteBtn.disabled = true;
  }


  // =====================================================
  // CORES DA ANIMAÇÃO
  // =====================================================

  const colors = [
    "draw-red",
    "draw-blue",
    "draw-yellow",
    "draw-green"
  ];


  let colorIndex = 0;


  // =====================================================
  // PISCA CORES + NOMES
  // =====================================================

  animationInterval =
    setInterval(() => {

      drawCard.className =
        "draw-card " +
        colors[colorIndex];


      colorIndex =
        (colorIndex + 1) %
        colors.length;


      const randomOption =
        rouletteOptions[
          Math.floor(
            Math.random() *
            rouletteOptions.length
          )
        ];


      drawCardText.textContent =
        randomOption;

    }, 180);


  // =====================================================
  // RESULTADO FINAL
  // =====================================================

  animationTimeout =
    setTimeout(() => {

      clearInterval(
        animationInterval
      );


      animationInterval = null;


      // SEMPRE TERMINA VERDE
      drawCard.className =
        "draw-card draw-winner";


      // MESMA VARIÁVEL NOS DOIS
      drawCardText.textContent =
        winner;


      resultNumber.textContent =
        winner;


      drawStatus.textContent =
        "RESULTADO";


      if (playerRole === "admin") {

        rollBtn.disabled = false;

        resetRouletteBtn.disabled =
          false;

      }

    }, 3000);

}


// =========================================================
// RESETAR SORTEADOR
// =========================================================

resetRouletteBtn.addEventListener(
  "click",
  async () => {

    if (playerRole !== "admin") {
      return;
    }


    const confirmReset =
      confirm(
        "Deseja resetar o sorteador? Todas as opções poderão sair novamente."
      );


    if (!confirmReset) {
      return;
    }


    rollBtn.disabled = true;

    resetRouletteBtn.disabled = true;


    await remove(
      ref(db, "roulette/currentSpin")
    );


    await remove(
      ref(db, "roulette/usedOptions")
    );


    resetDrawVisual();


    rollBtn.disabled = false;

    resetRouletteBtn.disabled = false;

  }
);


// =========================================================
// PLAYERS
// =========================================================

window.addEventListener(
  "load",
  () => {

    const playersBox =
      document.getElementById(
        "playersBox"
      );


    const playersRef =
      ref(db, "players");


    onValue(
      playersRef,
      (snapshot) => {

        const data =
          snapshot.val();


        if (!data) {

          playersBox.innerHTML =
            "Players";

          return;
        }


        const playersList =
          Object.values(data);


        playersBox.innerHTML = `
          <strong>
            Players (${playersList.length})
          </strong>
          <br>

          ${playersList
            .map(
              p =>
                `${p.name} — ⭐ ${p.points || 0}`
            )
            .join("<br>")}
        `;

      }
    );

  }
);


// =========================================================
// REMOVE PLAYER
// =========================================================

window.addEventListener(
  "beforeunload",
  async () => {

    const playerId =
      localStorage.getItem(
        "playerId"
      );


    if (!playerId) {
      return;
    }


    await remove(
      ref(
        db,
        `players/${playerId}`
      )
    );

  }
);