/*! Hairline-derived geometry
MIT License

Copyright (c) 2026 Lucas Marques

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/
// library/hairline/core/iso.ts
var rad = (d) => d * Math.PI / 180;
var r2 = (n) => Math.round(n * 100) / 100;
var poly = (pts) => "M" + pts.map((p) => r2(p[0]) + " " + r2(p[1])).join("L") + "Z";
var seg = (a, b) => `M${r2(a[0])} ${r2(a[1])}L${r2(b[0])} ${r2(b[1])}`;
var open = (pts) => pts.length < 2 ? "" : "M" + pts.map((p) => r2(p[0]) + " " + r2(p[1])).join("L");
var Cam = (azDeg, k, S) => ({ az: rad(azDeg), k, S, ox: 0, oy: 0 });
function proj(C) {
  const c = Math.cos(C.az), s = Math.sin(C.az), zf = Math.sqrt(1 - C.k * C.k);
  return (x, y, z) => {
    const X = x * c - y * s, Y = x * s + y * c;
    return [C.ox + C.S * X, C.oy + C.S * (Y * C.k - z * zf)];
  };
}
function fit(C, pts, cx, cy) {
  C.ox = 0;
  C.oy = 0;
  const P = proj(C);
  let a = 1e9, b = -1e9, c = 1e9, d = -1e9;
  for (const p of pts) {
    const q = P(p[0], p[1], p[2]);
    a = Math.min(a, q[0]);
    b = Math.max(b, q[0]);
    c = Math.min(c, q[1]);
    d = Math.max(d, q[1]);
  }
  C.ox = cx - (a + b) / 2;
  C.oy = cy - (c + d) / 2;
}
function rrect(u0, v0, u1, v1, r, n = 4) {
  r = Math.max(0, Math.min(r, (u1 - u0) / 2, (v1 - v0) / 2));
  const out = [];
  for (const [cu, cv, a0] of [[u1 - r, v1 - r, 0], [u0 + r, v1 - r, 90], [u0 + r, v0 + r, 180], [u1 - r, v0 + r, 270]])
    for (let k = 0; k <= n; k++) {
      const a = rad(a0 + 90 * k / n), ca = Math.cos(a), sa = Math.sin(a);
      out.push({ u: cu + r * ca, v: cv + r * sa, nu: ca, nv: sa });
    }
  return out;
}
function hull(input) {
  const pts = input.slice().sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  const x = (o, a, b) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
  const lo = [], up = [];
  for (const p of pts) {
    while (lo.length > 1 && x(lo[lo.length - 2], lo[lo.length - 1], p) <= 0) lo.pop();
    lo.push(p);
  }
  for (let i = pts.length - 1; i >= 0; i--) {
    const p = pts[i];
    while (up.length > 1 && x(up[up.length - 2], up[up.length - 1], p) <= 0) up.pop();
    up.push(p);
  }
  lo.pop();
  up.pop();
  return lo.concat(up);
}
var ringAt = (P, ring, z) => ring.map((q) => P(q.u, q.v, z));
var facing = (C) => {
  const s = Math.sin(C.az), c = Math.cos(C.az);
  return (q) => q.nu * s + q.nv * c >= -1e-6;
};
function run(ring, keep) {
  const n = ring.length;
  let s = -1;
  for (let i = 0; i < n; i++) if (keep(ring[i]) && !keep(ring[(i + n - 1) % n])) {
    s = i;
    break;
  }
  if (s < 0) return keep(ring[0]) ? ring.slice() : [];
  const out = [];
  for (let k = 0; k < n && keep(ring[(s + k) % n]); k++) out.push(ring[(s + k) % n]);
  return out;
}
function fillet(pts, rs, n = 4) {
  const m = pts.length, out = [];
  for (let i = 0; i < m; i++) {
    const a = pts[(i + m - 1) % m], p = pts[i], b = pts[(i + 1) % m];
    const la = Math.hypot(a[0] - p[0], a[1] - p[1]), lb = Math.hypot(b[0] - p[0], b[1] - p[1]);
    const t = Math.min(rs[i], la / 2, lb / 2);
    const p1 = [p[0] + (a[0] - p[0]) / la * t, p[1] + (a[1] - p[1]) / la * t];
    const p2 = [p[0] + (b[0] - p[0]) / lb * t, p[1] + (b[1] - p[1]) / lb * t];
    for (let k = 0; k <= n; k++) {
      const s = k / n, w = 1 - s;
      out.push([w * w * p1[0] + 2 * w * s * p[0] + s * s * p2[0], w * w * p1[1] + 2 * w * s * p[1] + s * s * p2[1]]);
    }
  }
  return out;
}

// library/hairline/figures/riffle-geometry.ts
var N = 26;
var W = 84;
var H = 54;
var G = 5;
var TW = 22;
var TH = 7;
var TABS = [6, 31, 56];
var TK = 1.4;
var REST = -12;
var LIFT = 16;
var X0 = -5;
var X1 = W + 5;
var Y0 = -9;
var Y1 = (N - 1) * G + 9;
var WH = 20;
var WR = 6;
var WT = 2.4;
function camera() {
  const C = Cam(45, 0.5, 1.45);
  fit(C, [[X0, Y0, 0], [X1, Y1, -8], [X1, Y0, 0], [X0, Y1, 0], [X0, Y0, H + TH], [X1, Y0, H + TH + LIFT]], 200, 166);
  return C;
}
var trayRings = () => ({
  outer: rrect(X0, Y0, X1, Y1, WR, 6),
  inner: rrect(X0 + WT, Y0 + WT, X1 - WT, Y1 - WT, WR - WT, 6)
});
var LR = (pts) => pts[0][0] <= pts[pts.length - 1][0] ? pts : pts.slice().reverse();
function tray(P, front, outer, inner) {
  const far = [
    [poly(hull(ringAt(P, outer, 0).concat(ringAt(P, outer, WH)))), "sil"],
    [poly(ringAt(P, inner, WH)), "nf"],
    [open(ringAt(P, run(inner, (q) => !front(q)), 2.5)), "nf lo"]
  ];
  const iF = LR(ringAt(P, run(inner, front), WH)), oT = LR(ringAt(P, run(outer, front), WH)), oB = LR(ringAt(P, run(outer, front), 0));
  const hx = (X0 + X1) / 2, onFront = (ring) => ring.map((q) => P(q.u, Y1, q.v));
  const near = [
    [poly([...iF, oT[oT.length - 1], ...oB.slice().reverse(), oT[0]]), "fo"],
    [open(oT), "nf lo"],
    [open(iF), "nf"],
    [open([oT[0], ...oB, oT[oT.length - 1]]), "nf sil"],
    [poly(onFront(rrect(hx - 11, 6.5, hx + 11, 12.5, 3, 5))), "nf"],
    [poly(onFront(rrect(hx - 9.4, 8, hx + 9.4, 11, 1.5, 5))), "nf lo"]
  ];
  return { far, near };
}
function card(i) {
  const n = N - i, t0 = TABS[(N - 1 - i) % 3];
  const shape = fillet(
    [[0, 0], [W, 0], [W, H], [t0 + TW, H], [t0 + TW, H + TH], [t0, H + TH], [t0, H], [0, H]],
    [1, 1, 3.2, 1.8, 2.4, 2.4, 1.8, 3.2]
  );
  return { n, t0, shape };
}
function pose(P, i, t0, shape, th, lift) {
  const yb = i * G, s = Math.sin(rad(th)), c = Math.cos(rad(th));
  const w = (u, v) => P(u, yb + v * s, v * c + lift);
  const wb = (u, v) => P(u, yb + v * s - TK * c, v * c + TK * s + lift);
  const punch = [];
  for (let k = 0; k < 8; k++) punch.push(w(t0 + TW / 2 + (k % 4 - 1.5) * 3.6, H + TH / 2 + (0.5 - Math.floor(k / 4)) * 2.8));
  return {
    back: poly(shape.map((p) => wb(p[0], p[1]))),
    face: poly(shape.map((p) => w(p[0], p[1]))),
    head: seg(w(6, H - 11), w(W - 6, H - 11)),
    rules: [H - 18, H - 25, H - 32, H - 39].map((v) => seg(w(6, v), w(W - 6, v))).join(""),
    punch
  };
}
function scene() {
  const C = camera();
  return { C, P: proj(C), front: facing(C), ...trayRings() };
}

// library/objects.ts
var NS = "http://www.w3.org/2000/svg";
var reduced = matchMedia("(prefers-reduced-motion: reduce)");
function el(tag, attrs = {}, parent, text) {
  const n = document.createElementNS(NS, tag);
  for (const [k, v] of Object.entries(attrs)) n.setAttribute(k, String(v));
  if (text) n.textContent = text;
  parent?.append(n);
  return n;
}
function html(tag, cls, parent, text) {
  const n = document.createElement(tag);
  n.className = cls;
  if (text) n.textContent = text;
  parent.append(n);
  return n;
}
function stage(parent, label) {
  const s = html("div", "object-stage", parent);
  s.tabIndex = 0;
  s.setAttribute("role", "group");
  s.setAttribute("aria-label", label);
  const svg = el("svg", { viewBox: "0 0 400 320", role: "group", "aria-label": label }, s);
  return { s, svg };
}
function point(svg, e) {
  const m = svg.getScreenCTM();
  if (!m) return [0, 0];
  const p = new DOMPoint(e.clientX, e.clientY).matrixTransform(m.inverse());
  return [p.x, p.y];
}
function paths(parent, items) {
  for (const [d, cls] of items) el("path", { d, class: cls }, parent);
}
function tween(from, to, draw, duration = 600, complete = () => {
}) {
  if (reduced.matches) {
    draw(to);
    complete();
    return () => {
    };
  }
  let frame = 0;
  const start = performance.now();
  function step(t) {
    const f = Math.min(1, (t - start) / duration);
    draw(from + (to - from) * (1 - Math.pow(1 - f, 3)));
    if (f < 1) frame = requestAnimationFrame(step);
    else complete();
  }
  frame = requestAnimationFrame(step);
  return () => cancelAnimationFrame(frame);
}
function fileBox(parent, label, papers) {
  const box = html("section", "collection-object", parent);
  const { s, svg } = stage(box, `${label}: use arrow keys to browse papers; Enter selects a paper`);
  s.style.cursor = "default";
  svg.setAttribute("viewBox", "0 36 400 252");
  const { P, front, outer, inner } = scene(), body = tray(P, front, outer, inner);
  paths(svg, body.far);
  const groups = papers.map((paper, j) => {
    const i = N - papers.length + j, shape = card(i), g = el("g", { class: "folder-art" }, svg);
    const back = el("path", { class: "sil lo" }, g), face = el("path", { class: "sil" }, g), head = el("path", { class: "nf" }, g), rules = el("path", { class: "nf lo" }, g), label2 = el("g", { class: "file-face-label", "aria-hidden": "true" }, g);
    const measure = document.createElement("canvas").getContext("2d");
    measure.font = "6px Montserrat";
    const lines = [];
    let line = "";
    for (const word of paper.title.split(/\s+/)) {
      if (line && measure.measureText(line + " " + word).width > 72) {
        lines.push(line);
        line = word;
      } else line += (line ? " " : "") + word;
    }
    if (line) lines.push(line);
    lines.forEach((text, k) => el("text", { x: 0, y: k * 6.9, "font-size": 6 }, label2, text));
    const year = el("g", { class: "file-tab-label", "aria-hidden": "true" }, g);
    el("text", { x: 11, y: 0, "text-anchor": "middle", "font-size": 4.5, class: "file-face-year" }, year, String(paper.year));
    return { i, shape, g, back, face, head, rules, label: label2, year, angle: REST, lift: 0 };
  });
  paths(svg, body.near);
  let active = -1, stop = () => {
  };
  function draw() {
    groups.forEach((q, j) => {
      const p = pose(P, q.i, q.shape.t0, q.shape.shape, q.angle, q.lift);
      q.back.setAttribute("d", p.back);
      q.face.setAttribute("d", p.face);
      q.head.setAttribute("d", p.head);
      q.rules.setAttribute("d", p.rules);
      const w = (u, v) => P(u, q.i * G + v * Math.sin(rad(q.angle)), v * Math.cos(rad(q.angle)) + q.lift), o = w(6, H - 12), x = w(7, H - 12), y = w(6, H - 13);
      q.label.setAttribute("transform", `matrix(${x[0] - o[0]} ${x[1] - o[1]} ${y[0] - o[0]} ${y[1] - o[1]} ${o[0]} ${o[1]})`);
      const yo = w(q.shape.t0, H + 1.7), yx = w(q.shape.t0 + 1, H + 1.7), yy = w(q.shape.t0, H + 0.7);
      q.year.setAttribute("transform", `matrix(${yx[0] - yo[0]} ${yx[1] - yo[1]} ${yy[0] - yo[0]} ${yy[1] - yo[1]} ${yo[0]} ${yo[1]})`);
      q.label.style.display = j === active ? "" : "none";
      q.head.style.display = q.rules.style.display = j === active ? "none" : "";
    });
  }
  function select(j) {
    if (j === active) return;
    active = j;
    stop();
    const starts = groups.map((q) => [q.angle, q.lift]);
    const targets2 = groups.map((q, k) => [j < 0 ? REST : k < j ? -24 : k > j ? 20 : 0, k === j ? LIFT : 0]);
    stop = tween(0, 1, (f) => {
      groups.forEach((q, k) => {
        q.angle = starts[k][0] + (targets2[k][0] - starts[k][0]) * f;
        q.lift = starts[k][1] + (targets2[k][1] - starts[k][1]) * f;
        q.face.classList.toggle("hi", k === j);
      });
      draw();
    });
  }
  function navigate(j) {
    select(j);
    const article = document.getElementById(`paper-${papers[j].slug}`);
    if (!article) return;
    const header = document.querySelector(".site-identity"), rect = header?.getBoundingClientRect();
    const fixed = header && getComputedStyle(header).position === "fixed" && rect.width > innerWidth * 0.7;
    const offset = fixed ? rect.bottom + 18 : 18;
    article.style.scrollMarginTop = `${offset}px`;
    const page = document.querySelector(".favorite-papers-page");
    const previousPadding = parseFloat(page.style.paddingBottom) || 0;
    const remaining = document.documentElement.scrollHeight - previousPadding - (article.getBoundingClientRect().top + scrollY);
    page.style.paddingBottom = `${Math.max(0, innerHeight - offset - remaining)}px`;
    document.querySelectorAll(".favorite-paper").forEach((p) => p.classList.toggle("is-paper-selected", p === article));
    history.replaceState(null, "", `#${article.id}`);
    article.focus({ preventScroll: true });
    document.documentElement.style.scrollBehavior = reduced.matches ? "auto" : "";
    article.scrollIntoView({ behavior: reduced.matches ? "auto" : "smooth", block: "start" });
  }
  const targets = groups.map((q, j) => {
    const y = q.i * G + H * Math.sin(rad(REST)), z = H * Math.cos(rad(REST));
    const corners = [P(-5, y - G / 2, z), P(W + 5, y - G / 2, z), P(W + 5, y + G / 2, z), P(-5, y + G / 2, z)];
    const target = el("path", { class: "file-target", d: poly(corners), tabindex: 0, role: "button", "aria-label": `${papers[j].authors}, ${papers[j].year}: ${papers[j].title}` }, svg);
    target.addEventListener("pointerenter", () => select(j));
    target.addEventListener("focus", () => select(j));
    target.setAttribute("aria-controls", `paper-${papers[j].slug}`);
    target.addEventListener("click", () => navigate(j));
    target.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        navigate(j);
      }
    });
    return target;
  });
  s.addEventListener("keydown", (e) => {
    if (["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(e.key)) {
      e.preventDefault();
      const step = ["ArrowLeft", "ArrowUp"].includes(e.key) ? -1 : 1;
      const next = Math.max(0, Math.min(papers.length - 1, active < 0 ? 0 : active + step));
      targets[next].focus();
    }
    if (e.key === "Escape") {
      select(-1);
      s.focus();
    }
  });
  draw();
  return () => {
    stop();
    box.remove();
  };
}
var paperRoot = document.querySelector("[data-paper-files]");
if (paperRoot) {
  const papers = JSON.parse(document.querySelector("#paper-files-data").textContent);
  document.fonts.ready.then(() => fileBox(paperRoot, "Favorite Papers", papers));
}
function shelfScene(parent) {
  const { s, svg } = stage(parent, "Open the library");
  svg.setAttribute("viewBox", "0 12 400 300");
  s.style.cursor = "pointer";
  const solids = [];
  function solid(x, y, z, w, d, h, kind = "shelf-frame", side = 0) {
    if (w > 12 && !kind.includes("shelf-stack")) {
      for (let offset = 0; offset < w; offset += 8) solid(x + offset, y, z, Math.min(8, w - offset), d, h, kind + " shelf-panel", side);
      return;
    }
    if (h > 30) {
      for (let offset = 0; offset < h; offset += 29) solid(x, y, z + offset, w, d, Math.min(29, h - offset), kind + " shelf-panel", side);
      return;
    }
    solids.push({ v: [[x, y, z], [x + w, y, z], [x + w, y + d, z], [x, y + d, z], [x, y, z + h], [x + w, y, z + h], [x + w, y + d, z + h], [x, y + d, z + h]], kind, side });
  }
  solid(-88, -34, 0, 176, 68, 4);
  solid(-83, -29, 4, 166, 58, 4);
  solid(-84, -29, 8, 4, 58, 122);
  solid(80, -29, 8, 4, 58, 122);
  solid(-80, -1, 8, 160, 2, 122, "shelf-divider");
  for (let row = 0; row < 4; row++) {
    const z = 9 + row * 29;
    solid(-80, -29, z, 160, 58, 3);
    for (const side of [-1, 1]) {
      let x = -77, book = 0;
      if (row % 2 === 0) {
        for (let layer = 0; layer < 4; layer++) solid(-18, side > 0 ? 4 : -28, z + 3 + layer * 3, 22 - layer % 2, 24, 2.5, "shelf-book shelf-stack", side);
      }
      while (x < 75) {
        if (row % 2 === 0 && x > -22 && x < 8) {
          x = 8;
          continue;
        }
        const width = Math.min(4.6 + (book * 7 + row * 3) % 5, 77 - x);
        const height = 21 + (book + row) % 3;
        const depth = 21 + (book + row) % 4;
        solid(x, side > 0 ? 4 : -(4 + depth), z + 3, width - 0.6, depth, height, "shelf-book", side);
        x += width;
        book++;
      }
    }
  }
  solid(-86, -31, 128, 172, 62, 4);
  for (const x of [26, 48]) for (let step = 0; step < 6; step++) {
    const t0 = step / 6, t1 = (step + 1) / 6, w = 2;
    const a = [x + 10 * (1 - t0), 31 + 14 * (1 - t0), -4 + 136 * t0];
    const b = [x + 10 * (1 - t1), 31 + 14 * (1 - t1), -4 + 136 * t1];
    solids.push({ v: [[a[0], a[1], a[2]], [a[0] + w, a[1], a[2]], [a[0] + w, a[1] + w, a[2]], [a[0], a[1] + w, a[2]], [b[0], b[1], b[2]], [b[0] + w, b[1], b[2]], [b[0] + w, b[1] + w, b[2]], [b[0], b[1] + w, b[2]]], kind: "shelf-ladder", side: 0 });
  }
  for (let step = 0; step < 9; step++) {
    const t = (step + 1) / 10;
    solid(26 + 10 * (1 - t), 31 + 14 * (1 - t), -4 + 136 * t, 24, 2, 2, "shelf-ladder");
  }
  let mix = 0, opening = false, stop = () => {
  };
  const g = el("g", { "data-shelf": 0 }, svg), art = el("g", { "aria-hidden": "true" }, g);
  const pool = Array.from({ length: solids.length * 3 }, () => el("path", {}, art));
  const wall = el("path", { "aria-hidden": "true", class: "shelf-side-wall" }, g);
  const roof = el("path", { "aria-hidden": "true", class: "shelf-roof-cap" }, g);
  const outline = el("path", { "aria-hidden": "true", class: "shelf-outline" }, g);
  const ladderArt = el("g", { "aria-hidden": "true", class: "shelf-ladder-art" }, g);
  const ladderSolids = solids.filter((box) => box.kind.startsWith("shelf-ladder"));
  const ladderPool = Array.from({ length: ladderSolids.length * 3 }, () => el("path", {}, ladderArt));
  const target = el("path", { class: "file-target shelf-target", role: "button", tabindex: 0, "aria-label": "Open the library" }, g);
  const handle = el("path", { class: "shelf-ladder-handle", tabindex: 0, role: "slider", "aria-label": "Move library ladder", "aria-valuemin": 0, "aria-valuemax": 100, "aria-valuenow": 70 }, g);
  const minOffset = -100, maxOffset = 16, clamp = (v) => Math.max(minOffset, Math.min(maxOffset, v));
  let ladderOffset = 0, drag = null, ladderFrame = 0;
  let renderLadder = () => {
  };
  function finishDrag() {
    const id = drag?.id;
    drag = null;
    delete s.dataset.dragging;
    if (ladderFrame) {
      cancelAnimationFrame(ladderFrame);
      ladderFrame = 0;
      renderLadder();
    }
    if (id !== void 0 && handle.hasPointerCapture(id)) handle.releasePointerCapture(id);
  }
  handle.addEventListener("pointerdown", (e) => {
    if (opening || e.button !== 0 || !e.isPrimary) return;
    finishDrag();
    drag = { id: e.pointerId, x: point(svg, e)[0], start: ladderOffset };
    s.dataset.dragging = "true";
    handle.setPointerCapture(e.pointerId);
    e.stopPropagation();
  });
  handle.addEventListener("pointermove", (e) => {
    if (!drag || drag.id !== e.pointerId) return;
    ladderOffset = clamp(drag.start + (point(svg, e)[0] - drag.x) / (1.38 * Math.cos(rad(45))));
    if (!ladderFrame) ladderFrame = requestAnimationFrame(() => {
      ladderFrame = 0;
      renderLadder();
    });
  });
  for (const event of ["pointerup", "pointercancel", "lostpointercapture"]) handle.addEventListener(event, finishDrag);
  window.addEventListener("blur", finishDrag);
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) finishDrag();
  });
  handle.addEventListener("click", (e) => e.stopPropagation());
  handle.addEventListener("keydown", (e) => {
    if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(e.key)) return;
    e.preventDefault();
    e.stopPropagation();
    finishDrag();
    ladderOffset = e.key === "Home" ? minOffset : e.key === "End" ? maxOffset : clamp(ladderOffset + (e.key === "ArrowRight" ? 4 : -4));
    renderLadder();
  });
  function activate() {
    if (opening) return;
    finishDrag();
    opening = true;
    s.dataset.state = "opening";
    stop = tween(0, 1, (v) => {
      mix = v;
      draw();
    }, 620, () => {
      s.dataset.state = "open";
      parent.dispatchEvent(new CustomEvent("library-category", { bubbles: true, detail: { category: "All" } }));
    });
  }
  target.addEventListener("click", activate);
  target.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      activate();
    }
  });
  const corners = [[-89, -37, -4], [89, -37, -4], [89, 37, -4], [-89, 37, -4], [-89, -37, 132], [89, -37, 132], [89, 37, 132], [-89, 37, 132]];
  function draw() {
    const angle = -45 * (1 - mix), cos = Math.cos(rad(angle)), sin = Math.sin(rad(angle)), side = 1;
    const C = Cam(angle, 0.5 - 0.4 * mix, 1.38 + 0.32 * mix);
    fit(C, corners, 200, 162);
    const P = proj(C);
    g.style.opacity = String(1 - Math.max(0, (mix - 0.55) / 0.45));
    const depth = (p) => (p[0] * sin + p[1] * cos) * Math.sqrt(1 - C.k * C.k) + p[2] * C.k;
    const faces = [];
    for (const box of solids) {
      if (box.kind.startsWith("shelf-ladder")) continue;
      if (box.side && box.side !== side) continue;
      const indices = [[4, 5, 6, 7], side > 0 ? [2, 3, 7, 6] : [0, 1, 5, 4], sin >= 0 ? [1, 2, 6, 5] : [0, 3, 7, 4]];
      indices.forEach((ids, f) => {
        const v = ids.map((i) => box.kind.startsWith("shelf-ladder") ? [box.v[i][0] + ladderOffset, box.v[i][1], box.v[i][2]] : box.v[i]);
        faces.push({ v, kind: box.kind + (f === 0 ? " shelf-top" : f === 2 ? " shelf-end" : ""), depth: v.reduce((sum, p) => sum + depth(p), 0) / 4 });
      });
    }
    faces.sort((a, b) => a.depth - b.depth);
    const fragment = document.createDocumentFragment();
    faces.forEach((face, i) => {
      const path = pool[i];
      path.setAttribute("d", poly(face.v.map((v) => P(...v))));
      path.setAttribute("class", face.kind);
      path.style.display = "";
      fragment.append(path);
    });
    for (let i = faces.length; i < pool.length; i++) pool[i].style.display = "none";
    art.append(fragment);
    const end = sin >= 0 ? 84 : -84;
    wall.setAttribute("d", poly([P(end, -29, 8), P(end, 29, 8), P(end, 29, 128), P(end, -29, 128)]));
    roof.setAttribute("d", poly([P(-86, -31, 132), P(86, -31, 132), P(86, 31, 132), P(-86, 31, 132)]));
    let edges = poly([P(-86, -31, 132), P(86, -31, 132), P(86, 31, 132), P(-86, 31, 132)]);
    for (const x of [-84, 84]) edges += seg(P(x, side * 29, 8), P(x, side * 29, 128));
    for (let row = 0; row < 4; row++) {
      const z = 9 + row * 29;
      edges += seg(P(-80, side * 29, z), P(80, side * 29, z));
      edges += seg(P(-80, side * 29, z + 3), P(80, side * 29, z + 3));
    }
    edges += seg(P(-86, side * 31, 128), P(86, side * 31, 128));
    edges += seg(P(-88, side * 34, 4), P(88, side * 34, 4));
    const nearX = sin >= 0 ? 88 : -88;
    edges += seg(P(nearX, -34, 4), P(nearX, 34, 4));
    outline.setAttribute("d", edges);
    target.setAttribute("d", poly(hull(corners.map((v) => P(...v)))));
    renderLadder = () => {
      let index = 0;
      for (const box of ladderSolids) for (const ids of [[4, 5, 6, 7], [2, 3, 7, 6], [0, 3, 7, 4]]) {
        const path = ladderPool[index++];
        path.setAttribute("d", poly(ids.map((i) => P(box.v[i][0], box.v[i][1], box.v[i][2]))));
        path.setAttribute("class", box.kind);
      }
      const origin = P(0, 0, 0), shift = P(ladderOffset, 0, 0);
      ladderArt.setAttribute("transform", `translate(${shift[0] - origin[0]} ${shift[1] - origin[1]})`);
      handle.setAttribute("d", poly([P(26 + ladderOffset, 31, 132), P(50 + ladderOffset, 31, 132), P(60 + ladderOffset, 45, 0), P(36 + ladderOffset, 45, 0)]));
      handle.setAttribute("aria-valuenow", String(Math.round((ladderOffset - minOffset) / (maxOffset - minOffset) * 100)));
    };
    renderLadder();
    g.setAttribute("data-angle", String(angle));
    s.dataset.zoom = String(mix);
  }
  window.addEventListener("resize", () => {
    finishDrag();
    draw();
  });
  parent.closest(".library-page")?.addEventListener("library-reset", () => {
    stop();
    mix = 0;
    opening = false;
    s.dataset.state = "preview";
    draw();
    target.focus();
  });
  s.dataset.state = "preview";
  draw();
}
document.querySelectorAll("[data-rotating-library]").forEach(shelfScene);
var library = document.querySelector(".library-page");
if (library) {
  const collection = library.querySelector(".library-collection"), preview = library.querySelector("[data-rotating-library]");
  collection.hidden = true;
  library.addEventListener("library-category", () => {
    preview.hidden = true;
    collection.hidden = false;
    library.classList.add("catalog-open");
  });
  library.addEventListener("library-reset", () => {
    collection.hidden = true;
    preview.hidden = false;
    library.classList.remove("catalog-open");
    library.dispatchEvent(new CustomEvent("catalog-reset"));
    preview.scrollIntoView({ behavior: reduced.matches ? "auto" : "smooth", block: "start" });
  });
  library.querySelector(".catalog-back").addEventListener("click", () => library.dispatchEvent(new CustomEvent("library-reset")));
}
