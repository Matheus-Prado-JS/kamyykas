import {
  db,
  ref,
  set
} from "./firebase.js";


// =========================================================
// ELEMENTOS
// =========================================================

const enterBtn =
  document.getElementById("enterBtn");

const sortBtn =
  document.getElementById("sortBtn");

const modal =
  document.getElementById("modal");

const joinBtn =
  document.getElementById("joinBtn");

const roleInputs =
  document.querySelectorAll(
    'input[name="role"]'
  );

const adminPass =
  document.getElementById("adminPass");


// =========================================================
// ABRIR MODAL DO BINGO
// =========================================================

enterBtn?.addEventListener(
  "click",
  () => {

    modal.classList.remove("hidden");

  }
);


// =========================================================
// ENTRAR NO SORTEADOR
// =========================================================

sortBtn?.addEventListener(
  "click",
  () => {

    window.location.href =
      "./room-sort.html";

  }
);


// =========================================================
// MOSTRAR SENHA ADMIN
// =========================================================

roleInputs.forEach(input => {

  input.addEventListener(
    "change",
    () => {

      adminPass.classList.toggle(
        "hidden",
        input.value !== "admin"
      );

    }
  );

});


// =========================================================
// ENTRAR NA SALA DO BINGO
// =========================================================

joinBtn?.addEventListener(
  "click",
  async () => {

    const name =
      document
        .getElementById("nameInput")
        .value
        .trim();


    const role =
      document.querySelector(
        'input[name="role"]:checked'
      )?.value;


    const pass =
      adminPass.value.trim();


    // =====================================================
    // VALIDAR NOME
    // =====================================================

    if (!name) {

      return alert(
        "Digite seu nome"
      );

    }


    // =====================================================
    // VALIDAR ADMIN
    // =====================================================

    if (
      role === "admin" &&
      pass !== "cacatua123"
    ) {

      return alert(
        "Senha de admin incorreta"
      );

    }


    // =====================================================
    // CRIAR PLAYER
    // =====================================================

    try {

      console.log(
        "Tentando entrar..."
      );

      console.log(
        "Nome:",
        name
      );

      console.log(
        "Role:",
        role
      );


      const playerId =
        crypto.randomUUID();


      await set(
        ref(
          db,
          `players/${playerId}`
        ),
        {
          id: playerId,
          name,
          role,
          points: 0,
          timestamp: Date.now()
        }
      );


      console.log(
        "Player salvo no Firebase!"
      );


      // ===================================================
      // SALVAR DADOS LOCALMENTE
      // ===================================================

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


      // ===================================================
      // ENTRAR NO BINGO
      // ===================================================

      console.log(
        "Entrando na sala..."
      );


      window.location.href =
        "./room.html";


    } catch (error) {

      console.error(
        "ERRO AO ENTRAR NA SALA:",
        error
      );


      alert(
        "Não foi possível entrar na sala. Veja o console."
      );

    }

  }
);