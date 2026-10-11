// =============================================================
// data.js — Constantes. No depende de nada ni cambia nunca.
// =============================================================

/** Clave con la que se guarda todo en localStorage. */
export const STORAGE_KEY = "bolsillo-v3";

/** Máximo de movimientos que se dibujan en la lista a la vez. */
export const MAX_LIST = 150;

/** Monedas disponibles y su símbolo. */
export const CURS = ["COP", "USD", "EUR", "MXN", "ARS", "PEN", "BRL", "CLP"];
export const SYM = { COP: "$", USD: "$", EUR: "€", MXN: "$", ARS: "$", PEN: "S/", BRL: "R$", CLP: "$" };

/** Monedas que se muestran sin decimales. */
export const NO_DECIMALS = ["COP", "CLP"];

/** Paleta suave: fondo de las tarjetas de categoría. */
export const PAL = [
  "#f3effe", "#fdefe2", "#e3f1fd", "#fde8f1", "#e6f8ee", "#fff6d6", "#ffe6e1",
  "#eaf7d6", "#dff7f6", "#f1e4fb", "#f6eee0", "#e7ebfd", "#fde4e8", "#e2f0e8",
];

/** Paleta viva: la misma posición, en versión saturada (gráficas y puntos). */
export const VIV = [
  "#8b7cf6", "#ff9a5a", "#4aa3f0", "#ff6fa5", "#3fc07a", "#f5c026", "#ff6b5e",
  "#8fcb3c", "#27bfc0", "#b45ae6", "#c9a26b", "#5b73f0", "#ff5c7a", "#4b9f78",
];

/** Traducción al inglés de los nombres de categoría que vienen por defecto. */
export const EN_NAMES = {
  Compras: "Shopping", Mercado: "Groceries", Comida: "Food", Transporte: "Transport",
  Alquiler: "Rent", Arriendo: "Rent", Ocio: "Fun", Salud: "Health", Gimnasio: "Gym",
  Gym: "Gym", Internet: "Internet", Salario: "Salary", Freelance: "Freelance",
  Regalo: "Gift", Inversiones: "Investments", "Otros ingresos": "Other income",
};

/** Categorías con las que arranca la app la primera vez. */
export const DEFAULT_CATS = [
  { id: 1, e: "🛒", n: "Mercado", t: "g" },
  { id: 2, e: "🍔", n: "Comida", t: "g" },
  { id: 3, e: "🚌", n: "Transporte", t: "g" },
  { id: 4, e: "🏠", n: "Arriendo", t: "g" },
  { id: 5, e: "🎬", n: "Ocio", t: "g" },
  { id: 6, e: "💊", n: "Salud", t: "g" },
  { id: 7, e: "💪", n: "Gimnasio", t: "g" },
  { id: 8, e: "📡", n: "Internet", t: "g" },
];

/** Categorías de ingreso que se añaden a quien venga de una versión sin ellas. */
export const DEFAULT_INCOME_CATS = [
  { id: 101, e: "💼", n: "Salario", t: "i" },
  { id: 102, e: "💻", n: "Freelance", t: "i" },
  { id: 103, e: "🎁", n: "Regalo", t: "i" },
  { id: 104, e: "📈", n: "Inversiones", t: "i" },
  { id: 105, e: "💰", n: "Otros ingresos", t: "i" },
];

/** Emojis del selector de categorías. La primera fila es gatuna. */
export const EMOJIS = (
  "🐱 😺 😻 🐈 🐾 🧶 🥛 🐟 🎀 🌸 " +
  "🛒 🍔 🍕 🌮 🍣 🍜 🍝 🥗 🍳 🥐 🍩 🍦 ☕ 🧋 🍺 🍷 🥤 🥑 🍎 🍗 🥩 🥖 🍫 🍿 " +
  "🚌 🚕 🚗 ⛽ 🚲 🛵 🚇 🚆 ✈️ 🚢 🛴 🅿️ 🚦 🧳 " +
  "🏠 🛋️ 💡 🚿 🧹 🧺 🔧 🛏️ 🪴 📡 📶 🔥 💧 🧴 🧼 🔑 " +
  "👕 👟 👜 🛍️ 🎁 💄 🧢 👓 ⌚ 📱 💻 🎧 📷 🎮 📚 ✏️ 🧸 " +
  "💊 🏥 🩺 🦷 🧘 🏋️ 💪 🏃 🩹 🧠 " +
  "🎬 🎵 🎤 🎭 🎨 🎳 ⚽ 🏀 🎾 🏖️ 🎟️ 🎲 🎉 📺 🎸 🌴 🏕️ " +
  "💵 💰 💳 🏦 📈 📉 🧾 💼 🪙 🤝 💸 📊 " +
  "🐶 👶 🧒 👨‍👩‍👧 🎓 🏫 🍼 💇 💅 🛠️ 📦 ❤️ ⭐ 🔔 📅 🚰 🌐 📞 ⚡ 🎂 🕯️ 💐 🚬 ⛪ 🏛️ 🧑‍⚕️ 🧑‍🏫 🛡️ 🗳️"
).split(" ");
