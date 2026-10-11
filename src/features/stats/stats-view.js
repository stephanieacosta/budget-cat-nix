// =============================================================
// views/stats.js — Pantalla de gráficas.
//
// Cinco gráficas, todas en SVG escrito a mano: dona, pastel,
// barras por categoría, línea temporal y comparativa de meses.
// =============================================================

import {
  S, U, t, LOC, money, compact, esc, pad, addDays, dayDiff, clampDay,
  cat, catName, viv, monthLabel,
} from "../../services/index.js";
import { $, periodPill, arc } from "../../shared/index.js";

export function statsView(ctx) {
  const { tx, exp, inc, by, inP } = ctx;
  const ents = by(U.sk);
  const total = U.sk === "g" ? exp : inc;
  const count = catId => tx.filter(x => x.t === U.sk && inP(x) && x.cat === catId).length;

  let h = `
    <div class="balw balw-tight">
      ${periodPill()}
      <div class="chips2">
        <button data-s="g" class="${U.sk === "g" ? "on" : ""}">${t("expenses")}</button>
        <button data-s="i" class="${U.sk === "i" ? "on" : ""}">${t("income")}</button>
      </div>
    </div>
    <div class="ctypes">
      ${[["donut", "chDonut"], ["pie", "chPie"], ["bars", "chBars"], ["line", "chLine"], ["months", "chMonths"]]
        .map(([k, label]) => `<button data-ct="${k}" class="${U.ct === k ? "on" : ""}">${t(label)}</button>`)
        .join("")}
    </div>`;

  const byCategory = U.ct === "donut" || U.ct === "pie" || U.ct === "bars";

  if (byCategory && !ents.length) {
    return h + `<div class="empty empty-chart">${U.sk === "g" ? t("noExp") : t("noInc")}</div>`;
  }
  if (U.ct === "donut" || U.ct === "pie") return h + donutView(ents, total, count);
  if (U.ct === "bars") return h + barsView(ents, total, count);
  if (U.ct === "line") return h + lineView(ctx);
  return h + monthsView(ctx);
}

// ---------- Dona y pastel ----------

function donutView(ents, total, count) {
  const isPie = U.ct === "pie";
  const r = isPie ? 10.5 : 15.9155;   // radio tal que la circunferencia sea 100
  const width = isPie ? 21 : 5;       // un trazo tan grueso como el radio tapa el agujero
  const sel = ents.find(([c]) => +c === U.selC);

  // La rendija entre porciones es decoración, no dato. Por eso se aparta
  // ANTES de repartir: se descuenta del círculo el hueco de cada porción y
  // lo que sobra se divide en proporción. Restárselo después a cada arco
  // (que es lo que se hacía antes) tiene tres efectos feos: deforma las
  // proporciones, borra del gráfico cualquier categoría más pequeña que la
  // propia rendija, y abre una muesca aunque haya una sola porción, que no
  // tiene de quién separarse. El tope de 12/n evita que con muchísimas
  // categorías las rendijas se coman el círculo entero.
  const n = ents.length;
  const gap = n > 1 ? Math.min(isPie ? 0.3 : 0.6, 12 / n) : 0;
  const span = 100 - gap * n;   // circunferencia que queda para las porciones

  // El recorrido arranca en cero, NO en medio hueco. Un <circle> abre y
  // cierra su trazado en el mismo punto, y arrancar más adelante dejaba la
  // rendija de arriba partida a caballo de esa costura: se veía más sucia
  // que la de abajo. Empezando en cero, todas caen enteras dentro del
  // recorrido. La simetría se consigue después girando el conjunto.
  let offset = 0;
  const arcs = ents.map(([c, v]) => {
    const slice = (v / total) * span;
    const svg = arc(r, width, viv(+c), slice, offset,
      `data-cat="${c}" style="cursor:pointer;${sel && +c !== U.selC ? "opacity:.28" : ""}"`);
    offset += slice + gap;
    return svg;
  }).join("");

  const selName = sel ? cat(+sel[0]).e + " " + esc(catName(cat(+sel[0]))) : "";
  const selPct = sel ? Math.round((sel[1] / total) * 100) : 0;

  const center = sel
    ? `${selName}<br><b>${money(sel[1])}</b><br><small>${selPct}% · ${t("movs", count(+sel[0]))}</small>`
    : `<small>${U.sk === "g" ? t("totSpent") : t("totInc")}</small><br><b>${money(total)}</b>`;

  // Girar el conjunto medio hueco es lo que deja cada rendija centrada sobre
  // su frontera. Se hace aquí, sobre el dibujo ya montado, y no moviendo el
  // punto de arranque, que es lo que partía la rendija de arriba.
  // 3,6 es los grados que mide un 1% de circunferencia.
  const spin = (gap / 2) * 3.6;

  return `
    <div class="dn">
      <svg viewBox="0 0 42 42">
        ${isPie ? "" : `<circle r="15.9155" cx="21" cy="21" fill="none" stroke="var(--pill)" stroke-width="5"/>`}
        <g transform="rotate(${spin} 21 21)">${arcs}</g>
      </svg>
      ${isPie ? "" : `<div><span>${center}</span></div>`}
    </div>
    ${isPie ? `<div class="tipbox">${sel
        ? `${selName} · <b>${money(sel[1])}</b><br><span class="mu">${selPct}% · ${t("movs", count(+sel[0]))}</span>`
        : t("tapSlice")}</div>` : ""}
    <div class="lab">${t("byCat")}</div>
    ${ents.map(([c, v]) => `
      <div class="lg ${+c === U.selC ? "on" : ""}" data-cat="${c}">
        <i style="background:${viv(+c)}"></i>
        <span>${cat(+c).e} ${esc(catName(cat(+c)))}</span>
        <small>${Math.round((v / total) * 100)}% · ${count(+c)}</small>
        <b>${money(v)}</b>
      </div>`).join("")}`;
}

// ---------- Barras por categoría ----------

function barsView(ents, total, count) {
  const max = ents[0][1];
  return `<div class="lab">${t("byCat")}</div>` + ents.map(([c, v]) => `
    <div class="hb">
      <div class="hl">
        <span>${cat(+c).e} ${esc(catName(cat(+c)))}</span>
        <span><b>${money(v)}</b> <small class="mu">· ${Math.round((v / total) * 100)}% · ${t("movs", count(+c))}</small></span>
      </div>
      <div class="ht"><i style="width:${Math.max(3, (v / max) * 100)}%;background:${viv(+c)}"></i></div>
    </div>`).join("");
}

// ---------- Línea temporal ----------

function lineView({ sum, P }) {
  // Mirando un día suelto la línea no diría nada: se dibuja el mes entero.
  const from = clampDay(U.lm === "d" ? U.M + "-01" : P.from);
  const to = clampDay(U.lm === "d" ? U.M + "-31" : P.to);
  const days = dayDiff(from, to) + 1;

  // Más de tres meses: se agrupa por mes para que la línea siga siendo legible.
  let keys, mode;
  if (days > 92) {
    mode = "month";
    keys = [];
    let y = +from.slice(0, 4), m = +from.slice(5, 7);
    const endY = +to.slice(0, 4), endM = +to.slice(5, 7);
    while (y < endY || (y === endY && m <= endM)) {
      keys.push(y + "-" + pad(m));
      if (++m > 12) { m = 1; y++; }
    }
  } else {
    mode = "day";
    keys = Array.from({ length: days }, (_, i) => addDays(from, i));
  }

  const vals = keys.map(k => sum(U.sk, x => (mode === "day" ? x.date === k : x.date.startsWith(k))));
  const max = Math.max(1, ...vals);
  const N = keys.length;

  // El lienzo es de 300×150. La línea va de x=12 a x=288 y de y=118 (cero) a y=18 (máximo).
  const px = i => (N > 1 ? 12 + (i * 276) / (N - 1) : 150);
  const py = v => 118 - (v / max) * 100;

  const color = U.sk === "g" ? "#ff9a5a" : "#3fc07a";
  const sumAll = vals.reduce((a, b) => a + b, 0);
  const peak = vals.indexOf(Math.max(...vals));
  const avg = sumAll / N;

  // Se guarda para que el deslizamiento del dedo pueda leerlo después.
  U.LD = { vals, keys, mode, px, py, color, peak, sk: U.sk };

  const points = vals.map((v, i) => px(i).toFixed(1) + "," + py(v).toFixed(1)).join(" ");
  const multiMonth = from.slice(0, 7) !== to.slice(0, 7);

  const labelAt = i => {
    const k = keys[i];
    if (mode === "month") {
      return new Date(+k.slice(0, 4), +k.slice(5, 7) - 1, 1).toLocaleDateString(LOC(), { month: "short" });
    }
    const d = +k.slice(8);
    return multiMonth ? d + "/" + +k.slice(5, 7) : String(d);
  };

  // Con pocos meses se etiquetan todos; si no, cinco repartidos.
  const ticks = mode === "month" && N <= 14
    ? keys.map((_, i) => i)
    : [...new Set([0, Math.round((N - 1) / 4), Math.round((N - 1) / 2), Math.round((3 * (N - 1)) / 4), N - 1])];

  const hintKey = mode === "day"
    ? (U.sk === "g" ? "lineHint" : "lineHintI")
    : (U.sk === "g" ? "lineHintM" : "lineHintIM");

  return `
    <div class="lab">${t(hintKey)}</div>
    <svg class="lc" data-lc="1" viewBox="0 0 300 150">
      <line x1="12" y1="118" x2="288" y2="118" stroke="var(--grid1)"/>
      <line x1="12" y1="68"  x2="288" y2="68"  stroke="var(--grid2)"/>
      <line x1="12" y1="18"  x2="288" y2="18"  stroke="var(--grid2)"/>
      <text x="12" y="14" font-size="8" fill="var(--mu)">${compact(max)}</text>
      <text x="12" y="64" font-size="8" fill="var(--mu)">${compact(max / 2)}</text>
      <line x1="12" y1="${py(avg).toFixed(1)}" x2="288" y2="${py(avg).toFixed(1)}"
            stroke="${color}" stroke-opacity=".55" stroke-dasharray="3 3"/>
      <polygon points="12,118 ${points} 288,118" fill="${color}" fill-opacity=".16"/>
      <polyline points="${points}" fill="none" stroke="${color}" stroke-width="2.4"
                stroke-linejoin="round" stroke-linecap="round"/>
      ${vals.map((v, i) => v > 0
        ? `<circle cx="${px(i).toFixed(1)}" cy="${py(v).toFixed(1)}" r="${N > 60 ? 1.8 : 2.6}" fill="${color}"/>`
        : "").join("")}
      ${ticks.map(i => `<text x="${px(i).toFixed(1)}" y="138" font-size="${mode === "month" ? 8 : 9}"
            fill="var(--mu)" text-anchor="middle">${labelAt(i)}</text>`).join("")}
      <g id="lg" class="lg-cursor">
        <line id="lgl" x1="0" y1="18" x2="0" y2="118" stroke="var(--mu)" stroke-dasharray="2 2"/>
        <circle id="lgc" r="4.5" cx="0" cy="0" fill="var(--bg)" stroke="${color}" stroke-width="2"/>
      </g>
    </svg>
    <div class="tipbox" id="tip">${t("scrub")}</div>
    <div class="stats3">
      <div><small>${t("total")}</small><b>${money(sumAll)}</b></div>
      <div><small>${t(mode === "day" ? "avgDay" : "avgMonth")}</small><b>${money(Math.round(avg))}</b></div>
      <div><small>${t(mode === "day" ? "peakDay" : "peakMonth")}</small><b>${sumAll ? money(vals[peak]) : "–"}</b></div>
    </div>`;
}

/**
 * Mueve la guía de la gráfica de línea al punto `i` y actualiza el recuadro.
 * Lo llaman el dedo (events.js) y render(), que lo deja en el día más alto.
 */
export function scrub(i) {
  const LD = U.LD;
  if (!LD || !$("lg")) return;

  const v = LD.vals[i], x = LD.px(i), y = LD.py(v), key = LD.keys[i];
  $("lg").style.display = "";
  $("lgl").setAttribute("x1", x);
  $("lgl").setAttribute("x2", x);
  $("lgc").setAttribute("cx", x);
  $("lgc").setAttribute("cy", y);

  const n = S.tx.filter(z =>
    z.cur === S.cur && z.t === LD.sk &&
    (LD.mode === "day" ? z.date === key : z.date.startsWith(key))
  ).length;

  const label = LD.mode === "day"
    ? new Date(key + "T12:00").toLocaleDateString(LOC(), { weekday: "long", day: "numeric", month: "long", year: "numeric" })
    : new Date(+key.slice(0, 4), +key.slice(5, 7) - 1, 1).toLocaleDateString(LOC(), { month: "long", year: "numeric" });

  $("tip").innerHTML = `${label}<br><b class="tipval">${money(v)}</b> <span class="mu">· ${t("movs", n)}</span>`;
}

// ---------- Comparativa de meses ----------

function monthsView({ sum, P }) {
  const howMany = U.lm === "y" ? 12 : 6;
  const endMonth = U.lm === "y" ? U.M.slice(0, 4) + "-12" : clampDay(P.to).slice(0, 7);

  const months = [];
  let y = +endMonth.slice(0, 4), m = +endMonth.slice(5, 7);
  for (let i = 0; i < howMany; i++) {
    months.unshift(y + "-" + pad(m));
    if (--m < 1) { m = 12; y--; }
  }

  const data = months.map(mo => ({
    m: mo,
    i: sum("i", x => x.date.startsWith(mo)),
    g: sum("g", x => x.date.startsWith(mo)),
  }));
  const max = Math.max(1, ...data.map(x => Math.max(x.i, x.g)));

  const si = U.selMi == null || U.selMi >= howMany ? howMany - 1 : U.selMi;
  const sel = data[si];
  const showValues = howMany <= 6;   // con 12 meses las cifras no caben

  return `
    <div class="lab">${t(U.lm === "y" ? "monthsYear" : "last6")}</div>
    <div class="mbs">
      ${data.map((x, i) => `
        <div data-mi="${i}" class="${i === si ? "on" : ""}">
          <div class="bb">
            <span class="bv">${showValues ? `<em>${x.i ? compact(x.i) : ""}</em>` : ""}
              <i style="height:${Math.max(2, (x.i / max) * 88)}px;background:var(--barInc)"></i></span>
            <span class="bv">${showValues ? `<em>${x.g ? compact(x.g) : ""}</em>` : ""}
              <i style="height:${Math.max(2, (x.g / max) * 88)}px;background:var(--barExp)"></i></span>
          </div>
          ${monthLabel(x.m).slice(0, 3)}
        </div>`).join("")}
    </div>
    <div class="tipbox">
      <b class="cap">${monthLabel(sel.m)}</b><br>
      <span class="inc">+${money(sel.i)}</span> · ${money(sel.g)} · <b>${money(sel.i - sel.g)}</b>
    </div>
    <div class="legend"><span>🟩 ${t("income")}</span><span>🟨 ${t("expenses")}</span></div>`;
}
