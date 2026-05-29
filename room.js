import {
  db,
  ref,
  onValue,
  remove,
  set
} from "./firebase.js";

// =========================================================
// ELEMENTOS
// =========================================================

const rollBtn =
  document.getElementById("rollBtn");

const resultNumber =
  document.getElementById("resultNumber");

const rouletteTrack =
  document.getElementById("rouletteTrack");

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

  rollBtn.textContent =
    "Somente Admin";
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
// CONFIG
// =========================================================

const ITEM_WIDTH = 260;

// =========================================================
// RENDER
// =========================================================

function renderRoulette(items) {

  rouletteTrack.innerHTML = "";

  items.forEach(item => {

    const div =
      document.createElement("div");

    div.classList.add("roulette-item");

    div.textContent = item;

    rouletteTrack.appendChild(div);
  });
}

// =========================================================
// SHUFFLE
// =========================================================

function shuffleArray(array) {

  const arr = [...array];

  for (let i = arr.length - 1; i > 0; i--) {

    const j =
      Math.floor(Math.random() * (i + 1));

    [arr[i], arr[j]] =
      [arr[j], arr[i]];
  }

  return arr;
}

// =========================================================
// ESTADO INICIAL
// =========================================================

const initialTrack = [];

for (let i = 0; i < 20; i++) {

  initialTrack.push(
    ...shuffleArray(rouletteOptions)
  );
}

renderRoulette(initialTrack);

// =========================================================
// ADMIN GIRA
// =========================================================

rollBtn.addEventListener("click", async () => {

  if (playerRole !== "admin") return;

  rollBtn.disabled = true;

  resultNumber.textContent = "--";

  // cria track gigante
  const trackItems = [];

  for (let i = 0; i < 30; i++) {

    trackItems.push(
      ...shuffleArray(rouletteOptions)
    );
  }

  // posição LONGE
  const winnerIndex =
    Math.floor(Math.random() * 100) + 120;

  // salva realtime
  await set(
    ref(db, "roulette/currentSpin"),
    {
      winnerIndex,
      trackItems,
      timestamp: Date.now()
    }
  );
});

// =========================================================
// TODOS ESCUTAM
// =========================================================

const rouletteRef =
  ref(db, "roulette/currentSpin");

onValue(rouletteRef, (snapshot) => {

  const data = snapshot.val();

  if (!data) return;

  startRouletteAnimation(data);
});

// =========================================================
// ANIMAÇÃO
// =========================================================

function startRouletteAnimation(data) {

  resultNumber.textContent = "--";

  renderRoulette(data.trackItems);

  const display =
    document.querySelector(".roulette-display");

  const displayCenter =
    display.offsetWidth / 2;

  const finalOffset =
    (data.winnerIndex * ITEM_WIDTH)
    - displayCenter
    + (ITEM_WIDTH / 2);

  // reset
  rouletteTrack.style.transition = "none";

  rouletteTrack.style.transform =
    "translateX(0px)";

  requestAnimationFrame(() => {

    requestAnimationFrame(() => {

      rouletteTrack.style.transition =
        "transform 5s cubic-bezier(.08,.69,.15,1)";

      rouletteTrack.style.transform =
        `translateX(-${finalOffset}px)`;
    });
  });

  // =========================================================
  // RESULTADO REAL
  // =========================================================

  setTimeout(() => {

    const display =
      document.querySelector(".roulette-display");

    const centerLine =
      display.getBoundingClientRect().left
      + (display.offsetWidth / 2);

    const items =
      document.querySelectorAll(".roulette-item");

    let closestItem = null;

    let closestDistance = Infinity;

    // limpa glow antigo
    items.forEach(item => {

      item.style.boxShadow = "";

      item.style.transform = "";
    });

    // encontra item REAL
    items.forEach(item => {

      const rect =
        item.getBoundingClientRect();

      const itemCenter =
        rect.left + (rect.width / 2);

      const distance =
        Math.abs(centerLine - itemCenter);

      if (distance < closestDistance) {

        closestDistance = distance;

        closestItem = item;
      }
    });

    // vencedor VISUAL
    const finalWinner =
      closestItem?.textContent || "ERRO";

    resultNumber.textContent =
      finalWinner;

    // glow
    if (closestItem) {

      closestItem.style.boxShadow =
        "0 0 30px rgba(255,255,255,0.9)";

      closestItem.style.transform =
        "scale(1.05)";
    }

    // libera admin
    if (playerRole === "admin") {

      rollBtn.disabled = false;
    }

  }, 5000);
}

// =========================================================
// PLAYERS
// =========================================================

window.addEventListener("load", () => {

  const playersBox =
    document.getElementById("playersBox");

  const playersRef =
    ref(db, "players");

  onValue(playersRef, (snapshot) => {

    const data = snapshot.val();

    if (!data) {

      playersBox.innerHTML = "Players";

      return;
    }

    const playersList =
      Object.values(data);

    playersBox.innerHTML = `
      <strong>
        Players (${playersList.length})
      </strong><br>

      ${playersList.map(p => `
        ${p.name} — ⭐ ${p.points || 0}
      `).join("<br>")}
    `;
  });
});

// =========================================================
// REMOVE PLAYER
// =========================================================

window.addEventListener(
  "beforeunload",
  async () => {

    const playerId =
      localStorage.getItem("playerId");

    if (!playerId) return;

    await remove(
      ref(db, `players/${playerId}`)
    );
  }
);