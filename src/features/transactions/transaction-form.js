// =============================================================
// add.js — Panel de añadir y editar un movimiento.
//
// Es el mismo panel para las dos cosas:
//   U.editId === null  → se está creando uno nuevo
//   U.editId === <id>  → se está editando ese
//
// Crear un movimiento se hace tocando la categoría (un solo toque,
// sin botón de guardar). Al editar aparece «Guardar cambios».
// =============================================================

import {
  S, U, save, t, LOC, DECIMAL, money, parseAmount, formatAmount, iso, esc,
  cat, catName, colorOf, catsOfType, rerender,
} from "../../services/index.js";
import { $, flash } from "../../shared/index.js";
import { openCat } from "../categories/index.js";

/** Rejilla de categorías del tipo activo, más el botón de crear una nueva. */
export function catGrid() {
  $("grid").innerHTML =
    catsOfType(U.kind).map(c => `
      <button data-c="${c.id}" class="${U.editId !== null && U.selCat === c.id ? "sel" : ""}"
              style="background:${colorOf(c)}">
        <span>${c.e}</span>${esc(catName(c))}
      </button>`).join("") +
    `<button class="more" id="nc"><span>＋</span>${t("new")}</button>`;
}

/** Marca si se está registrando un gasto o un ingreso. */
function markKind() {
  [...$("tp").children].forEach(b => b.classList.toggle("on", b.dataset.k === U.kind));
}

/** Pone al día lo que depende de lo escrito: monto, inicial, fecha y contador de hoy. */
function refresh() {
  const len = $("amt").value.length;
  $("amt").style.fontSize = len > 12 ? "34px" : len > 9 ? "42px" : len > 7 ? "50px" : "60px";
  $("hdv").textContent = money(parseAmount($("amt").value));
  $("bd").textContent = S.tx.filter(x => x.date === iso(new Date())).length;

  const note = $("nt").value.trim();
  $("av").textContent = note ? note[0].toUpperCase() : "•";

  const d = $("dt").value ? new Date($("dt").value + "T12:00") : new Date();
  $("dl").textContent = d.toLocaleDateString(LOC(), { weekday: "long", day: "numeric", month: "long" });
}

/** Zona de borrado: solo existe al editar. Un toque pide confirmación. */
export function renderDelete() {
  const w = $("delw");
  w.style.display = U.editId !== null ? "" : "none";
  w.innerHTML = U.delConf
    ? `<div class="cf">
         <div>${t("delTxQ")}</div>
         <div class="cfb">
           <button class="cb" id="dno">${t("cancel")}</button>
           <button class="cb red" id="dyes">${t("del")}</button>
         </div>
       </div>`
    : `<button class="lnk danger wide" id="delb">${t("delTx")}</button>`;
}

export function closeAdd() {
  $("add").classList.remove("on");
  U.editId = null;
  U.delConf = false;
  $("svb").style.display = "none";
  renderDelete();
}

/** Abre el panel. Sin argumento crea uno nuevo; con un movimiento, lo edita. */
export function openAdd(x) {
  U.editId = x ? x.id : null;
  U.delConf = false;
  U.kind = x ? x.t : "g";
  U.selCat = x ? x.cat : null;
  markKind();

  $("amt").value = x ? formatAmount(String(x.amt).replace(".", DECIMAL())) : "";
  $("nt").value = x ? x.note || "" : "";
  $("dt").value = x ? x.date : iso(new Date());
  $("svb").style.display = x ? "" : "none";

  renderDelete();
  catGrid();
  refresh();
  $("add").classList.add("on");
  if (!x) setTimeout(() => $("amt").focus(), 60);
}

// ---------- Eventos del panel ----------

$("plus").onclick = () => openAdd();
$("cl").onclick = closeAdd;

$("amt").oninput = () => {
  $("amt").value = formatAmount($("amt").value);
  refresh();
};
$("nt").oninput = refresh;
$("dt").oninput = refresh;

// Cambiar entre gasto e ingreso. Al editar hay que mover la categoría
// elegida al nuevo tipo, porque las categorías no se comparten.
$("tp").onclick = e => {
  const b = e.target.closest("button");
  if (!b) return;
  U.kind = b.dataset.k;
  if (U.editId !== null) {
    const first = catsOfType(U.kind)[0];
    U.selCat = first ? first.id : null;
  }
  markKind();
  catGrid();
};

$("grid").onclick = e => {
  if (e.target.closest("#nc")) return openCat(U.kind, null, catGrid);

  const b = e.target.closest("[data-c]");
  if (!b) return;

  // Editando, tocar una categoría solo la selecciona.
  if (U.editId !== null) {
    U.selCat = +b.dataset.c;
    catGrid();
    return;
  }

  // Creando, tocar una categoría guarda el movimiento de una vez.
  const amount = parseAmount($("amt").value);
  if (!(amount > 0)) return $("amt").focus();

  const date = $("dt").value || iso(new Date());
  S.tx.push({
    id: Date.now(),
    t: U.kind,
    amt: amount,
    cat: +b.dataset.c,
    note: $("nt").value.trim(),
    date,
    cur: S.cur,
  });

  // Salta al periodo del movimiento para que se vea recién guardado.
  U.M = date.slice(0, 7);
  U.selDay = date;
  save();
  closeAdd();
  U.tab = "home";
  rerender();
};

$("svb").onclick = () => {
  const amount = parseAmount($("amt").value);
  if (!(amount > 0)) return $("amt").focus();

  const x = S.tx.find(y => y.id === U.editId);
  if (!x) return closeAdd();

  // Si se cambió de gasto a ingreso, la categoría guardada ya no vale.
  let c = cat(U.selCat);
  if (c.t !== U.kind) c = catsOfType(U.kind)[0] || c;

  Object.assign(x, {
    t: U.kind,
    amt: amount,
    cat: c.id,
    note: $("nt").value.trim(),
    date: $("dt").value || x.date,
  });

  U.M = x.date.slice(0, 7);
  save();
  closeAdd();
  rerender();
};

$("delw").onclick = e => {
  const id = e.target.id;
  if (id === "delb") { U.delConf = true; renderDelete(); }
  else if (id === "dno") { U.delConf = false; renderDelete(); }
  else if (id === "dyes") {
    S.tx = S.tx.filter(y => y.id !== U.editId);
    save();
    closeAdd();
    rerender();
    flash(t("deleted"));
  }
};
