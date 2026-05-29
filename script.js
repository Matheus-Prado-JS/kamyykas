import { db, ref, set } from "./firebase.js";

const enterBtn =
  document.getElementById("enterBtn");

const modal =
  document.getElementById("modal");

const joinBtn =
  document.getElementById("joinBtn");

const roleInputs =
  document.querySelectorAll('input[name="role"]');

const adminPass =
  document.getElementById("adminPass");

// =========================================================
// ABRIR MODAL
// =========================================================

enterBtn?.addEventListener("click", () => {

  modal.classList.remove("hidden");
});

// =========================================================
// MOSTRAR SENHA ADMIN
// =========================================================

roleInputs.forEach(input => {

  input.addEventListener("change", () => {

    adminPass.classList.toggle(
      "hidden",
      input.value !== "admin"
    );
  });
});

// =========================================================
// ENTRAR NA SALA
// =========================================================

joinBtn?.addEventListener("click", async () => {

  const name =
    document.getElementById("nameInput")
    .value
    .trim();

  const role =
    document.querySelector(
      'input[name="role"]:checked'
    )?.value;

  const pass =
    adminPass.value.trim();

  // nome obrigatório
  if (!name) {

    return alert("Digite seu nome");
  }

  // senha admin
  if (
    role === "admin"
    && pass !== "cacatua123"
  ) {

    return alert("Senha de admin incorreta");
  }

  // gera ID único
  const playerId =
    crypto.randomUUID();

  // salva no firebase
  await set(
    ref(db, `players/${playerId}`),
    {
      id: playerId,
      name,
      role,
      points: 0,
      timestamp: Date.now()
    }
  );

  // salva sessão local
  localStorage.setItem(
    "playerId",
    playerId
  );

  localStorage.setItem(
    "playerName",
    name
  );

  localStorage.setItem(
    "playerRole",
    role
  );

  // debug
  console.log("LOGIN:");
  console.log("Nome:", name);
  console.log("Role:", role);

  // entra na sala
  window.location.href =
    "room.html";
});