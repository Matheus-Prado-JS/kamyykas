import { initializeApp }
from "https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js";

import {
  getDatabase,
  ref,
  set,
  get,
  update,
  remove,
  onValue
}
from "https://www.gstatic.com/firebasejs/10.12.5/firebase-database.js";

// =========================================================
// FIREBASE CONFIG
// =========================================================

const firebaseConfig = {

  apiKey: "AIzaSyA_FqAs2ky83Eh2J5ysNDjH6K3cxBWvcYY",

  authDomain:
    "kamyy-bingo.firebaseapp.com",

  databaseURL:
    "https://kamyy-bingo-default-rtdb.firebaseio.com",

  projectId:
    "kamyy-bingo",

  storageBucket:
    "kamyy-bingo.firebasestorage.app",

  messagingSenderId:
    "486123784680",

  appId:
    "1:486123784680:web:602460ba169226e3957c5d"
};

// =========================================================
// INIT
// =========================================================

const app =
  initializeApp(firebaseConfig);

const db =
  getDatabase(app);

// =========================================================
// EXPORTS
// =========================================================

export {
  db,
  ref,
  set,
  get,
  update,
  remove,
  onValue
};