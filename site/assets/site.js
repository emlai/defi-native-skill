
(function () {
  "use strict";

  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var repaint = [];
  var root = document.documentElement;

  /* ============ theme: light is the default, dark is opt in ============ */

  function effective() {
    return root.getAttribute("data-theme") === "dark" ? "dark" : "light";
  }

  function syncButtons() {
    var now = effective();
    var btns = document.querySelectorAll("[data-theme-set]");
    for (var i = 0; i < btns.length; i++) {
      btns[i].setAttribute("aria-pressed", btns[i].getAttribute("data-theme-set") === now ? "true" : "false");
    }
  }

  try {
    var stored = localStorage.getItem("dn-theme");
    if (stored === "dark") { root.setAttribute("data-theme", "dark"); }
    else if (stored === "light") { root.removeAttribute("data-theme"); }
  } catch (e) { /* blocked storage: stay on the light default */ }

  syncButtons();

  document.addEventListener("click", function (e) {
    var t = e.target.closest("[data-theme-set]");
    if (!t) return;
    var v = t.getAttribute("data-theme-set");
    if (v === "dark") { root.setAttribute("data-theme", "dark"); }
    else { root.removeAttribute("data-theme"); }
    try { localStorage.setItem("dn-theme", v); } catch (err) {}
    syncButtons();
    for (var i = 0; i < repaint.length; i++) { repaint[i](); }
  });

  function token(name) {
    return getComputedStyle(root).getPropertyValue(name).trim() || "#888";
  }

  /* ============ copy ============ */

  document.addEventListener("click", function (e) {
    var btn = e.target.closest("[data-copy]");
    if (!btn) return;
    var src = document.getElementById(btn.getAttribute("data-copy"));
    if (!src) return;
    var text = src.textContent.replace(/ /g, " ").trim();
    var prev = btn.textContent;
    function done() {
      btn.textContent = "Copied";
      setTimeout(function () { btn.textContent = prev; }, 1400);
    }
    function fallback() {
      try {
        var ta = document.createElement("textarea");
        ta.value = text; ta.setAttribute("readonly", "");
        ta.style.position = "fixed"; ta.style.opacity = "0";
        document.body.appendChild(ta); ta.select();
        document.execCommand("copy");
        document.body.removeChild(ta);
        done();
      } catch (err) {
        btn.textContent = "Select it";
        setTimeout(function () { btn.textContent = prev; }, 1600);
      }
    }
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(done, fallback);
      } else { fallback(); }
    } catch (err) { fallback(); }
  });

  /* ============ tabs ============ */

  document.addEventListener("click", function (e) {
    var b = e.target.closest("[data-tab]");
    if (!b) return;
    var list = b.parentNode;
    var panes = list.parentNode.querySelector(".panes");
    if (!panes) return;
    var all = list.querySelectorAll("[data-tab]");
    for (var i = 0; i < all.length; i++) { all[i].setAttribute("aria-selected", "false"); }
    b.setAttribute("aria-selected", "true");
    var ps = panes.querySelectorAll(".pane");
    for (var j = 0; j < ps.length; j++) { ps[j].removeAttribute("data-open"); }
    var target = panes.querySelector("#" + b.getAttribute("data-tab"));
    if (target) target.setAttribute("data-open", "1");
  });

  /* ============ halftone sampler ============ */

  function sampleGrid(off, step, lumFloor) {
    var w = off.width, h = off.height;
    var data = off.getContext("2d").getImageData(0, 0, w, h).data;
    var cells = [];
    var floor = lumFloor === undefined ? 0.06 : lumFloor;
    for (var y = step / 2; y < h; y += step) {
      for (var x = step / 2; x < w; x += step) {
        var px = (Math.floor(y) * w + Math.floor(x)) * 4;
        var a = data[px + 3] / 255;
        if (a < 0.04) continue;
        var lum = (0.299 * data[px] + 0.587 * data[px + 1] + 0.114 * data[px + 2]) / 255;
        var v = lum * a;
        if (v < floor) continue;
        cells.push({ x: x, y: y, v: v });
      }
    }
    return cells;
  }

  function fit(canvas) {
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var w = canvas.clientWidth, h = canvas.clientHeight;
    if (!w || !h) return null;
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    return { dpr: dpr, cssW: w, W: canvas.width, H: canvas.height };
  }

  /* ============ pixel candlesticks ============
     Ornament, not a claim about any market: a fixed series, no axis, no
     numbers. Up filled, down hollow, so the page keeps one accent hue. */

  function candles() {
    var canvas = document.getElementById("candles");
    if (!canvas) return;
    var ctx = canvas.getContext("2d");

    var levels = [6,9,11,9,13,16,13,17,19,17,20,24,21,24,26,24,28,31,28,32,35,33,37,40,38,42,45,43,47,50,48,52,55,53,57,60];
    var wickUp = [2,1,2,1,1,2,1,2,1,1,2,1,1,2,2,1,1,2,1,2,1,1,2,1,2,1,1,2,1,1,2,2,1,2,1,2];
    var wickDn = [1,2,1,1,2,1,2,1,2,1,1,2,2,1,1,2,1,1,2,1,2,2,1,2,1,1,2,1,2,2,1,1,2,1,2,1];

    var raf = null;

    function draw() {
      if (raf) cancelAnimationFrame(raf);
      var m = fit(canvas);
      if (!m) return;
      var W = m.W, H = m.H;

      var green = token("--green");
      var down = token("--dim");
      var faint = token("--faint");

      var cell = Math.max(4, Math.round(5.4 * m.dpr));
      var inset = 2;
      var cols = Math.floor(W / cell);
      var rows = Math.floor(H / cell);
      var pitch = 6;

      var count = Math.min(levels.length, Math.max(6, Math.floor((cols - inset * 2) / pitch)));
      var from = levels.length - count;
      var lv = levels.slice(from), wu = wickUp.slice(from), wd = wickDn.slice(from);

      var lo = Infinity, hi = -Infinity;
      for (var q = 0; q < lv.length; q++) {
        var o = q === 0 ? lv[0] - 3 : lv[q - 1];
        hi = Math.max(hi, Math.max(o, lv[q]) + wu[q]);
        lo = Math.min(lo, Math.min(o, lv[q]) - wd[q]);
      }

      var pad = 3;
      var usable = Math.max(4, rows - pad * 2);
      function rowOf(v) {
        var t = (v - lo) / (hi - lo || 1);
        return pad + Math.round((1 - t) * (usable - 1));
      }

      var inner = Math.max(2, cell - 1);
      var t0 = null;
      var dur = reduce ? 0 : 760;

      function edge(cx) {
        var t = cx / W;
        return Math.max(0, Math.min(1, Math.min(t / 0.1, (1 - t) / 0.1, 1)));
      }

      function frame(ts) {
        if (t0 === null) t0 = ts;
        var p = dur === 0 ? 1 : Math.min(1, (ts - t0) / dur);
        var ease = 1 - Math.pow(1 - p, 3);

        ctx.clearRect(0, 0, W, H);

        ctx.fillStyle = faint;
        for (var gy = 1; gy < rows; gy += 3) {
          for (var gx = 1; gx < cols; gx += 3) {
            var ga = edge(gx * cell) * 0.2 * ease;
            if (ga < 0.03) continue;
            ctx.globalAlpha = ga;
            ctx.fillRect(gx * cell, gy * cell, Math.max(1, cell - 4), Math.max(1, cell - 4));
          }
        }

        for (var i = 0; i < lv.length; i++) {
          var reveal = Math.max(0, Math.min(1, (ease - (i / lv.length) * 0.5) / 0.5));
          if (reveal <= 0) continue;

          var col = inset + i * pitch;
          var close = lv[i];
          var open = i === 0 ? lv[0] - 3 : lv[i - 1];
          var up = close >= open;

          var bodyTop = rowOf(Math.max(open, close));
          var bodyBot = rowOf(Math.min(open, close));
          var wTop = rowOf(Math.max(open, close) + wu[i]);
          var wBot = rowOf(Math.min(open, close) - wd[i]);

          var a = edge(col * cell) * reveal;
          if (a < 0.03) continue;
          ctx.globalAlpha = a;
          ctx.fillStyle = up ? green : down;

          for (var wy = wTop; wy <= wBot; wy++) {
            ctx.fillRect((col + 1) * cell, wy * cell, inner, inner);
          }

          var bh = Math.max(2, bodyBot - bodyTop + 1);
          for (var by = bodyTop; by < bodyTop + bh; by++) {
            for (var bx = col; bx < col + 3; bx++) {
              var onEdge = (by === bodyTop || by === bodyTop + bh - 1 || bx === col || bx === col + 2);
              if (!up && !onEdge) continue;
              ctx.fillRect(bx * cell, by * cell, inner, inner);
            }
          }
        }
        ctx.globalAlpha = 1;

        if (p < 1) raf = requestAnimationFrame(frame);
      }

      raf = requestAnimationFrame(frame);
    }

    repaint.push(draw);
    draw();
    var t;
    window.addEventListener("resize", function () { clearTimeout(t); t = setTimeout(draw, 130); });
  }

  /* ============ machine, halftoned ============ */

  function machine() {
    var canvas = document.getElementById("machine-canvas");
    if (!canvas) return;
    var ctx = canvas.getContext("2d");

    function roundRect(c, x, y, w, h, r) {
      c.beginPath(); c.moveTo(x + r, y);
      c.arcTo(x + w, y, x + w, y + h, r);
      c.arcTo(x + w, y + h, x, y + h, r);
      c.arcTo(x, y + h, x, y, r);
      c.arcTo(x, y, x + w, y, r);
      c.closePath();
    }

    function draw() {
      var m = fit(canvas);
      if (!m) return;
      var W = m.W, H = m.H;

      var off = document.createElement("canvas");
      off.width = W; off.height = H;
      var o = off.getContext("2d");

      var s = Math.min(W / 540, H / 420);
      o.save();
      o.translate(W / 2 - 260 * s, H / 2 - 208 * s);
      o.scale(s, s);

      var shell = o.createLinearGradient(90, 30, 430, 260);
      shell.addColorStop(0, "#ffffff"); shell.addColorStop(0.55, "#b2b2b2"); shell.addColorStop(1, "#444444");
      o.fillStyle = shell; roundRect(o, 92, 34, 336, 226, 26); o.fill();

      o.fillStyle = "#eeeeee"; roundRect(o, 132, 70, 256, 150, 8); o.fill();
      o.fillStyle = "#151515"; roundRect(o, 146, 82, 228, 126, 5); o.fill();

      o.fillStyle = "#e4e4e4";
      var widths = [150, 96, 176, 62, 120];
      for (var r = 0; r < widths.length; r++) { o.fillRect(160, 98 + r * 21, widths[r], 7); }

      var kb = o.createLinearGradient(40, 276, 480, 390);
      kb.addColorStop(0, "#ffffff"); kb.addColorStop(0.6, "#a2a2a2"); kb.addColorStop(1, "#383838");
      o.fillStyle = kb;
      o.beginPath(); o.moveTo(46, 286); o.lineTo(474, 286); o.lineTo(432, 386); o.lineTo(88, 386); o.closePath(); o.fill();

      o.fillStyle = "#2a2a2a";
      for (var row = 0; row < 4; row++) {
        for (var col = 0; col < 13; col++) {
          var kx = 92 + col * 25 + row * 7, ky = 300 + row * 19;
          if (kx > 420) continue;
          o.fillRect(kx, ky, 17, 12);
        }
      }
      o.restore();

      var step = Math.max(4, Math.round(5 * m.dpr));
      var cells = sampleGrid(off, step, 0);

      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = token("--field-ink");
      var rMax = step * 0.5;
      for (var i = 0; i < cells.length; i++) {
        var c = cells[i];
        var rr = rMax * (1 - c.v * 0.8);
        if (rr < 0.3) continue;
        ctx.beginPath(); ctx.arc(c.x, c.y, rr, 0, 6.2832); ctx.fill();
      }
    }

    repaint.push(draw);
    draw();
    var t;
    window.addEventListener("resize", function () { clearTimeout(t); t = setTimeout(draw, 140); });
  }

  /* ============ routing schematic ============ */

  function schematic() {
    var g = document.getElementById("sch-g");
    if (!g) return;
    var NS = "http://www.w3.org/2000/svg";

    function el(name, attrs, style) {
      var n = document.createElementNS(NS, name);
      for (var k in attrs) { n.setAttribute(k, attrs[k]); }
      if (style) { n.setAttribute("style", style); }
      g.appendChild(n);
      return n;
    }
    function trace(x1, y1, x2, y2) {
      el("line", { x1: x1, y1: y1, x2: x2, y2: y2, "shape-rendering": "crispEdges" },
         "stroke: var(--rule-hi); stroke-width: 1.5; stroke-dasharray: 1.5 3.5;");
    }
    function via(x, y) {
      el("rect", { x: x - 2.5, y: y - 2.5, width: 5, height: 5, "shape-rendering": "crispEdges" },
         "fill: var(--green);");
    }
    function txt(x, y, text, cls, style) {
      var t = el("text", { x: x, y: y, "class": cls }, style);
      t.textContent = text;
      return t;
    }
    function box(x, y, w, h, o) {
      el("rect", { x: x, y: y, width: w, height: h, "shape-rendering": "crispEdges" },
         "fill: " + (o.fill || "var(--panel)") + "; stroke: " + (o.stroke || "var(--rule)") + "; stroke-width: 1;");
      var pad = 14;
      if (o.tag)   { txt(x + pad, y + 19, o.tag,   "g", "fill: var(--green);"); }
      if (o.title) { txt(x + pad, y + (o.tag ? 38 : 26), o.title, "t", "fill: var(--ink);"); }
      if (o.sub)   { txt(x + pad, y + (o.tag ? 53 : 42), o.sub,   "s", "fill: var(--dim);"); }
    }

    box(340, 6, 280, 42, { title: "Any question about defi", fill: "var(--sunk)", stroke: "var(--rule-hi)" });
    trace(480, 48, 480, 66); via(480, 68);

    box(290, 76, 380, 56, { tag: "THE SKILL", title: "8 rules, routing, the working loop", fill: "var(--raise)", stroke: "var(--green)" });
    trace(480, 132, 480, 150); via(480, 152);

    /* nine routes on a 3 x 3 grid, fed by one bus */
    var colX = [16, 332, 648];
    var cw = 296, mid = 148;
    trace(colX[0] + mid, 160, colX[2] + mid, 160);
    for (var i = 0; i < 3; i++) { trace(colX[i] + mid, 160, colX[i] + mid, 176); }

    var routes = [
      ["LEARN",          "analogs",           "TradFi to onchain"],
      ["ASSESS",         "playbook",          "deposit, or walk away"],
      ["OPTIONS",        "liquidity",         "your LP is a short option"],
      ["TRADES",         "anatomy",           "how this book blows up"],
      ["MICROSTRUCTURE", "depth and squeezes", "manipulation fingerprints"],
      ["CURATORS",       "frameworks",        "score the manager"],
      ["TOKENS",         "value accrual",     "is it worth anything"],
      ["PERPS",          "funding",           "basis and venue risk"],
      ["MONITOR",        "market pulse",      "what changed this week"]
    ];
    var rowY = [176, 250, 324];
    for (var j = 0; j < routes.length; j++) {
      box(colX[j % 3], rowY[Math.floor(j / 3)], cw, 62,
          { tag: routes[j][0], title: routes[j][1], sub: routes[j][2] });
    }

    trace(480, 386, 480, 410); via(480, 412);
    trace(300, 412, 660, 412);
    trace(300, 412, 300, 420);
    trace(660, 412, 660, 420);
    box(150, 420, 300, 56, { tag: "GROUND IT", title: "concepts", sub: "19 sections that age slowly", fill: "var(--raise)", stroke: "var(--rule-hi)" });
    box(510, 420, 300, 56, { tag: "PULL IT LIVE", title: "31 data routes", sub: "keyless first, dated always", fill: "var(--raise)", stroke: "var(--rule-hi)" });

    trace(300, 476, 300, 492);
    trace(660, 476, 660, 492);
    trace(300, 492, 660, 492);
    trace(480, 492, 480, 508); via(480, 510);

    box(140, 514, 680, 44, { fill: "var(--sunk)", stroke: "var(--green)" });
    txt(154, 541, "One answer: decomposed, dated, exit priced, research not advice", "t", "fill: var(--green);");
  }

  /* ============ the prompt types itself ============
     Deletes and retypes through a few real questions. Static under
     reduced motion, and hidden from assistive tech, which reads the
     visually hidden sentence beside it instead. */

  function typer() {
    var el = document.getElementById("typed");
    if (!el) return;
    var lines = [
      "how is this vault 9% APY?",
      "are onchain options the same as traditional options?",
      "is this pendle market a good opportunity?",
      "what is actually backing sUSDe?"
    ];
    if (reduce) { el.textContent = lines[lines.length - 1]; return; }

    var li = 0, ci = 0, deleting = false;

    function tick() {
      var full = lines[li];
      if (!deleting) {
        ci++;
        el.textContent = full.slice(0, ci);
        if (ci >= full.length) { deleting = true; setTimeout(tick, 2100); return; }
        setTimeout(tick, 46);
        return;
      }
      ci--;
      el.textContent = full.slice(0, ci);
      if (ci <= 0) { deleting = false; li = (li + 1) % lines.length; setTimeout(tick, 380); return; }
      setTimeout(tick, 20);
    }

    setTimeout(tick, 800);
  }

  /* the fade would otherwise sit over the last entry forever */
  function logFade() {
    var log = document.querySelector(".log");
    if (!log || !log.parentNode) return;
    var wrap = log.parentNode;
    function update() {
      var atEnd = log.scrollTop + log.clientHeight >= log.scrollHeight - 4;
      wrap.classList.toggle("at-end", atEnd);
    }
    log.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    update();
  }

  candles();
  machine();

  schematic();
  typer();
  logFade();
})();

/* ============ menu ============ */
(function () {
  var btn = document.querySelector(".menubtn");
  var panel = document.getElementById("sitemenu");
  if (!btn || !panel) return;
  function close() { panel.hidden = true; btn.setAttribute("aria-expanded", "false"); }
  btn.addEventListener("click", function (e) {
    e.stopPropagation();
    var opening = panel.hidden;
    panel.hidden = !opening;
    btn.setAttribute("aria-expanded", String(opening));
  });
  document.addEventListener("click", function (e) {
    if (!panel.hidden && !panel.contains(e.target)) close();
  });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") close(); });
  panel.addEventListener("click", function (e) { if (e.target.closest("a")) close(); });
})();

/* ============ github stars ============ */
(function () {
  var el = document.getElementById("gh-stars");
  if (!el || typeof fetch !== "function") return;
  fetch("https://api.github.com/repos/emlai/defi-native-skill")
    .then(function (r) { return r.ok ? r.json() : null; })
    .then(function (d) {
      if (d && typeof d.stargazers_count === "number" && d.stargazers_count > 0) {
        el.textContent = d.stargazers_count;
      }
    })
    .catch(function () { /* keep the baked-in count */ });
})();
