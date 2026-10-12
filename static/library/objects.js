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
function prism(P, front, ring, inner, z0, z1) {
  return {
    sil: poly(hull(ringAt(P, ring, z1).concat(ringAt(P, ring, z0)))),
    crease: inner ? open(ringAt(P, run(inner, front), z1)) : ""
  };
}
var rings = (x0, y0, x1, y1, r, b) => [
  rrect(x0, y0, x1, y1, r),
  rrect(x0 + b, y0 + b, x1 - b, y1 - b, Math.max(0.3, r - b))
];
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
var N = 10;
var W = 84;
var H = 54;
var G = 13;
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
  const C = Cam(45, 0.5, 1.62);
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
function paths(parent, items) {
  for (const [d, cls] of items) el("path", { d, class: cls }, parent);
}
function tween(from, to, draw, duration = 600) {
  if (reduced.matches) {
    draw(to);
    return () => {
    };
  }
  let frame = 0;
  const start = performance.now();
  function step(t) {
    const f = Math.min(1, (t - start) / duration);
    draw(from + (to - from) * (1 - Math.pow(1 - f, 3)));
    if (f < 1) frame = requestAnimationFrame(step);
  }
  frame = requestAnimationFrame(step);
  return () => cancelAnimationFrame(frame);
}
function fileBox(parent, label, papers) {
  const box = html("section", "collection-object", parent);
  html("h3", "", box, label);
  html("p", "paper-box-count", box, `${papers.length} ${papers.length === 1 ? "paper" : "papers"}`);
  const { s, svg } = stage(box, `${label}: use arrow keys to browse papers; Enter selects a paper`);
  s.style.cursor = "default";
  const read = html("div", "paper-file-readout", box);
  read.setAttribute("aria-live", "polite");
  const { P, front, outer, inner } = scene(), body = tray(P, front, outer, inner);
  paths(svg, body.far);
  const groups = papers.map((paper, j) => {
    const i = N - papers.length + j, shape = card(i), g = el("g", { class: "folder-art" }, svg);
    const back = el("path", { class: "sil lo" }, g), face = el("path", { class: "sil" }, g), head = el("path", { class: "nf" }, g), rules = el("path", { class: "nf lo" }, g);
    return { i, shape, g, back, face, head, rules, angle: REST, lift: 0 };
  });
  paths(svg, body.near);
  let active = -1, stop = () => {
  };
  function draw() {
    groups.forEach((q) => {
      const p = pose(P, q.i, q.shape.t0, q.shape.shape, q.angle, q.lift);
      q.back.setAttribute("d", p.back);
      q.face.setAttribute("d", p.face);
      q.head.setAttribute("d", p.head);
      q.rules.setAttribute("d", p.rules);
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
    read.replaceChildren();
    if (j < 0) {
      html("p", "", read, "Move across the files to reveal a paper, or use the arrow keys.");
      return;
    }
    const paper = papers[j];
    html("h4", "", read, paper.title);
    html("p", "", read, `${paper.authors} \xB7 ${paper.year}`);
    html("p", "", read, paper.venue);
    const link = html("a", "", read, "Open paper");
    link.href = paper.paper_url;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    const note = html("details", "paper-file-note", read);
    html("summary", "", note, "Why I return to it");
    html("p", "", note, paper.note);
  }
  const targets = groups.map((q, j) => {
    const y = q.i * G + H * Math.sin(rad(REST)), z = H * Math.cos(rad(REST));
    const corners = [P(-5, y - G / 2, z), P(W + 5, y - G / 2, z), P(W + 5, y + G / 2, z), P(-5, y + G / 2, z)];
    const target = el("path", { class: "file-target", d: poly(corners), tabindex: 0, role: "button", "aria-label": `${papers[j].authors}, ${papers[j].year}: ${papers[j].title}` }, svg);
    target.addEventListener("pointerenter", () => select(j));
    target.addEventListener("focus", () => select(j));
    target.addEventListener("click", () => select(j));
    target.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        select(j);
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
  html("p", "", read, "Move across the files to reveal a paper, or use the arrow keys.");
  return () => {
    stop();
    box.remove();
  };
}
var paperRoot = document.querySelector("[data-paper-files]");
if (paperRoot) {
  let render = function(mode) {
    cleanups.forEach((f) => f());
    cleanups = [];
    let groups = [];
    if (mode === "journal") {
      const by = /* @__PURE__ */ new Map();
      papers.forEach((p) => {
        if (!by.has(p.venue)) by.set(p.venue, []);
        by.get(p.venue).push(p);
      });
      groups = [...by].sort((a, b) => a[0].localeCompare(b[0]));
    } else {
      for (let i = 0; i < papers.length; i += 10) groups.push([`Collection ${String(i / 10 + 1).padStart(2, "0")}`, papers.slice(i, i + 10)]);
    }
    for (const [label, items] of groups) {
      for (let i = 0; i < items.length; i += 10) cleanups.push(fileBox(paperRoot, items.length > 10 ? `${label} \xB7 ${i / 10 + 1}` : label, items.slice(i, i + 10)));
    }
    controls.querySelectorAll("button").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.mode === mode)));
  };
  const data = document.querySelector("#paper-files-data");
  const papers = JSON.parse(data.textContent);
  const controls = document.querySelector(".paper-box-mode");
  controls.classList.add("is-ready");
  let cleanups = [];
  controls.querySelectorAll("button").forEach((b) => b.addEventListener("click", () => render(b.dataset.mode)));
  render("collection");
  const listing = document.querySelector(".paper-list-disclosure");
  if (listing) listing.open = false;
}
function shelfObject(parent, index, names) {
  const box = html("section", "collection-object", parent);
  html("h3", "", box, `0${index + 1} \u2014 ${names[0]} / ${names[1]}`);
  const { s, svg } = stage(box, `${names.join(" and ")}: drag to turn, arrow keys rotate, Enter opens the visible collection`);
  const actions = html("div", "object-actions", box);
  const status = html("span", "object-status", actions, names[0]);
  status.setAttribute("aria-live", "polite");
  const button = html("button", "object-button", actions, "Turn to the other side");
  let angle = 45, stop = () => {
  }, drag = null;
  function choose(category) {
    parent.dispatchEvent(new CustomEvent("library-category", { bubbles: true, detail: { category } }));
  }
  function draw() {
    svg.replaceChildren();
    const C = Cam(angle, 0.5, 2.2);
    C.ox = 200;
    C.oy = 255;
    const P = proj(C), front = facing(C);
    const base = el("g", {}, svg);
    const [rr, ri] = rings(-54, -32, 54, 32, 3, 1.2);
    const plinth = prism(P, front, rr, ri, 0, 5);
    el("path", { d: plinth.sil, class: "sil" }, base);
    el("path", { d: plinth.crease, class: "nf lo" }, base);
    const sides = [{ side: -1, category: names[1] }, { side: 1, category: names[0] }].sort((a, b) => a.side * Math.cos(C.az) - b.side * Math.cos(C.az));
    for (const { side, category } of sides) {
      const y = side * 22, visible = side * Math.cos(C.az) > 0;
      const surface = el("g", {}, svg);
      for (const x of [-50, 50]) {
        const a = P(x, -28, 5), b = P(x, -28, 104), c = P(x, 28, 104), d = P(x, 28, 5);
        el("path", { d: `${poly([a, b, c, d])}`, class: "nf lo" }, surface);
      }
      const x0 = -25, x1 = 25, z0 = 9, z1 = 84;
      const facePoints = side === 1 ? [P(x0, y, z0), P(x1, y, z0), P(x1, y, z1), P(x0, y, z1)] : [P(x1, y, z0), P(x0, y, z0), P(x0, y, z1), P(x1, y, z1)];
      const book = el("g", { "data-cover-category": category }, surface);
      const innerY = y - side * 4;
      el("path", { d: poly([P(x0, innerY, z1), P(x1, innerY, z1), P(x1, y, z1), P(x0, y, z1)]), class: "sil lo" }, book);
      el("path", { d: poly(facePoints), class: "book-cover" }, book);
      el("path", { d: seg(P(x0 + 3, y, z0), P(x0 + 3, y, z1)), class: "cover-detail" }, book);
      if (visible) {
        const origin = P(side === 1 ? x0 : x1, y, z1), u = P(side === 1 ? x1 : x0, y, z1), v = P(side === 1 ? x0 : x1, y, z0);
        const matrix = `matrix(${(u[0] - origin[0]) / 50} ${(u[1] - origin[1]) / 50} ${(v[0] - origin[0]) / 75} ${(v[1] - origin[1]) / 75} ${origin[0]} ${origin[1]})`;
        const cover = el("g", { transform: matrix }, book);
        el("path", { d: "M12 12h26v23H12z M18 12v23 M12 23h26", class: "cover-detail" }, cover);
        el("text", { x: 25, y: 51, "text-anchor": "middle", class: "cover-word" }, cover, category);
        el("path", { d: "M17 60h16", class: "cover-detail" }, cover);
        const target = el("path", { d: poly(facePoints), class: "file-target shelf-target", role: "button", "aria-label": `Open ${category}` }, book);
        target.addEventListener("click", () => {
          if (!drag?.moved) choose(category);
        });
      }
    }
    const [top, topIn] = rings(-54, -32, 54, 32, 3, 1.2);
    const roof = prism(P, front, top, topIn, 104, 108);
    el("path", { d: roof.sil, class: "sil" }, svg);
    el("path", { d: roof.crease, class: "nf lo" }, svg);
    const ground = [P(-68, 40, 0), P(68, 40, 0)];
    el("path", { d: seg(ground[0], ground[1]), class: "nf lo" }, svg);
    const face = Math.cos(C.az) >= 0 ? names[0] : names[1];
    status.textContent = face;
    box.dataset.angle = String(Math.round(angle));
    box.dataset.facing = face;
  }
  function rotate(to) {
    stop();
    stop = tween(angle, to, (v) => {
      angle = v;
      draw();
    });
  }
  button.addEventListener("click", () => rotate(angle + 180));
  s.addEventListener("keydown", (e) => {
    if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
      e.preventDefault();
      rotate(angle + (e.key === "ArrowRight" ? 45 : -45));
    }
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      choose(Math.cos(rad(angle)) >= 0 ? names[0] : names[1]);
    }
  });
  s.addEventListener("pointerdown", (e) => {
    if (e.button !== 0) return;
    stop();
    drag = { x: e.clientX, y: e.clientY, angle, moved: false, id: e.pointerId };
  });
  s.addEventListener("pointermove", (e) => {
    if (!drag) return;
    const dx = e.clientX - drag.x, dy = e.clientY - drag.y;
    if (!drag.moved && Math.abs(dx) > 6 && Math.abs(dx) > Math.abs(dy)) {
      drag.moved = true;
      s.setPointerCapture(e.pointerId);
    }
    if (drag.moved) {
      angle = drag.angle + dx * 0.75;
      draw();
    }
  });
  s.addEventListener("pointerup", (e) => {
    const wasDragged = drag?.moved;
    if (wasDragged) {
      rotate(45 + 180 * Math.round((angle - 45) / 180));
      if (s.hasPointerCapture(e.pointerId)) s.releasePointerCapture(e.pointerId);
    }
    setTimeout(() => {
      drag = null;
    }, 0);
  });
  s.addEventListener("pointercancel", () => {
    drag = null;
  });
  draw();
}
document.querySelectorAll("[data-rotating-library]").forEach((shelves) => {
  shelfObject(shelves, 0, ["Read", "Reading"]);
  shelfObject(shelves, 1, ["All", "Wishlist"]);
});
var library = document.querySelector(".library-page");
if (library) {
  let apply = function() {
    const unknown = category === "Reading" || category === "Wishlist";
    heading.hidden = false;
    heading.textContent = category;
    empty.hidden = !unknown;
    empty.textContent = category === "Reading" ? "Reading status is not recorded yet." : "Wishlist information is not recorded yet.";
    frame.hidden = unknown;
    const doc = frame.contentDocument;
    if (!unknown && doc) {
      const radio = doc.getElementById(category === "All" ? "view-all" : "view-read");
      if (radio) radio.checked = true;
      doc.querySelectorAll(".book-radio:checked").forEach((b) => b.checked = false);
      frame.contentWindow.location.hash = "top";
      frame.contentWindow.scrollTo({ top: 0, behavior: "instant" });
    }
  };
  const collection = library.querySelector(".library-collection"), frame = library.querySelector(".library-shelf"), filters = library.querySelector(".library-filters"), heading = library.querySelector(".library-active-category"), empty = library.querySelector(".library-category-empty");
  collection.hidden = true;
  filters.hidden = true;
  let category = "Read";
  library.addEventListener("library-category", ((e) => {
    category = e.detail.category;
    collection.hidden = false;
    apply();
  }));
  frame.addEventListener("load", () => {
    if (!collection.hidden) apply();
  });
}
