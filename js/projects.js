/* projects.js — the "My Project" page.
 *
 * DYNAMIC EFFECT 7: the six blocks are built from data and open a detail
 *                   modal on click (event-driven DOM manipulation)
 * DYNAMIC EFFECT 8: live keyword + tag filtering, as you type
 *
 * Plain JavaScript. No framework, no jQuery.
 *
 * Note on the filter: matching blocks stay in place and non-matching ones
 * are dimmed rather than removed. Figure 1 specifies a fixed 3x2 grid, so
 * hiding blocks would break the layout the assignment is graded on.
 */
(function () {
  "use strict";

  /* The six reserved blocks, in Figure 1 order:
     row 1 — Javascript Demo, 2, 3
     row 2 — 4, 5, 6                                                     */
  var PROJECTS = [
    {
      slot: 1,
      label: "Javascript Demo",
      sub: "canvas · play it",
      img: "img/demo.svg",
      href: "demo.html",
      demo: true,
      tags: ["javascript", "games"],
      blurb: "A brick-breaker game written in plain JavaScript on an HTML canvas — no game engine and no library.",
      points: [
        "Fixed-timestep animation loop driven by requestAnimationFrame",
        "Axis-aligned collision detection against the paddle, walls and bricks",
        "Paddle follows the mouse, touch, or the arrow keys",
        "Score, lives and level state kept in one plain object"
      ]
    },
    {
      slot: 2,
      label: "Aidan Integration",
      sub: "full-stack SaaS",
      img: "img/aidan-integration.svg",
      href: null,
      tags: ["web", "ai", "backend"],
      blurb: "An AI-powered appointment reminder platform. Customers confirm or reschedule over plain-language SMS, which cuts no-shows for small businesses.",
      points: [
        "Node.js / Express backend with SQLite on a persistent volume",
        "Deployed on Railway with a Netlify front end and GitHub Actions CI/CD",
        "Twilio integration including end-to-end A2P 10DLC carrier registration and TCPA compliance",
        "Anthropic API for the natural-language layer; Resend for email"
      ]
    },
    {
      slot: 3,
      label: "Bitcoin Volatility Predictor",
      sub: "ML · forecasting",
      img: "img/btc.svg",
      href: null,
      tags: ["ml", "data", "python"],
      blurb: "Four volatility-forecasting models predicting Bitcoin realized volatility at 1-day, 1-week and 1-month horizons, over eight years of hourly market data.",
      points: [
        "50+ engineered features across eight years of hourly BTC data",
        "Beat the GARCH(1,1) industry baseline on every 1-day metric — 10% lower RMSE with XGBoost",
        "46–54% improvement at the 1-month horizon using LSTM and XGBoost",
        "Walk-forward cross-validation, manual data-leakage audits, Mincer-Zarnowitz bias/efficiency regression"
      ]
    },
    {
      slot: 4,
      label: "Credit Card Fraud Detector",
      sub: "data · risk scoring",
      img: "img/fraud.svg",
      href: null,
      tags: ["data", "python"],
      blurb: "A transaction screener that processes over a million credit card transactions and ranks them for human review.",
      points: [
        "Handles 1M+ transactions in a single pass",
        "Flags discrepancies and assigns a graded fraud-likelihood score",
        "Sorts the highest-risk transactions to the top of the review queue"
      ]
    },
    {
      slot: 5,
      label: "AI Glasses",
      sub: "CSCI 496 capstone",
      img: "img/glasses.svg",
      href: null,
      tags: ["hardware", "ai", "in progress"],
      blurb: "Senior capstone project — a wearable assistant built for a real client. In progress through the 2026–27 academic year.",
      points: [
        "Team capstone with a live external client",
        "Hardware selection and technical design in progress",
        "Gate reviews, tech demo and a final team report across the year"
      ]
    },
    {
      slot: 6,
      label: "Reserved",
      sub: "next build",
      img: "img/reserved.svg",
      href: null,
      tags: ["reserved"],
      blurb: "Held open for the next project. The assignment asks for six reserved blocks, and this one has not been filled yet on purpose.",
      points: ["Check back — this slot is next."]
    }
  ];

  document.addEventListener("DOMContentLoaded", function () {
    var grid = document.getElementById("blockGrid");
    if (!grid) return;

    buildBlocks(grid);
    wireModal(grid);
    wireFilter(grid);
  });

  /* ---- 7a. build the six blocks from the data above ------------------ */
  function buildBlocks(grid) {
    PROJECTS.forEach(function (p) {
      // the demo block is a real link; the rest open the detail modal
      var el = document.createElement(p.href ? "a" : "button");
      el.className = "block" + (p.demo ? " is-demo" : "");
      if (p.href) el.href = p.href;
      else el.type = "button";

      el.setAttribute("data-slot", p.slot);
      el.setAttribute("data-search", (p.label + " " + p.blurb + " " + p.tags.join(" ")).toLowerCase());

      var img = document.createElement("img");
      img.src = p.img;
      img.alt = p.label;
      img.loading = "lazy";

      var cap = document.createElement("span");
      cap.className = "block-label";
      cap.textContent = p.label;
      var small = document.createElement("small");
      small.textContent = p.sub;
      cap.appendChild(small);

      el.appendChild(img);
      el.appendChild(cap);
      grid.appendChild(el);
    });
  }

  /* ---- 7b. detail modal ---------------------------------------------
     One listener on the grid instead of six on the blocks (event
     delegation) — the blocks are created by script, so this also keeps
     working if the list above grows. */
  function wireModal(grid) {
    var back = document.getElementById("modalBack");
    var body = document.getElementById("modalBody");
    if (!back || !body) return;

    var lastFocus = null;

    grid.addEventListener("click", function (ev) {
      var block = ev.target.closest(".block");
      if (!block || block.tagName === "A") return;   // the demo block navigates
      var p = PROJECTS[parseInt(block.getAttribute("data-slot"), 10) - 1];
      lastFocus = block;
      open(p);
    });

    function open(p) {
      body.innerHTML = "";

      var close = document.createElement("button");
      close.className = "modal-close";
      close.type = "button";
      close.textContent = "✕";
      close.setAttribute("aria-label", "Close");
      close.addEventListener("click", hide);

      var h = document.createElement("h3");
      h.textContent = p.label;

      var tags = document.createElement("p");
      tags.className = "modal-tags";
      tags.textContent = p.tags.join(" · ");

      var img = document.createElement("img");
      img.src = p.img;
      img.alt = p.label;

      var blurb = document.createElement("p");
      blurb.textContent = p.blurb;

      var ul = document.createElement("ul");
      p.points.forEach(function (pt) {
        var li = document.createElement("li");
        li.textContent = pt;
        ul.appendChild(li);
      });

      body.appendChild(close);
      body.appendChild(h);
      body.appendChild(tags);
      body.appendChild(img);
      body.appendChild(blurb);
      body.appendChild(ul);

      back.classList.add("open");
      close.focus();
    }

    function hide() {
      back.classList.remove("open");
      if (lastFocus) lastFocus.focus();
    }

    back.addEventListener("click", function (ev) {
      if (ev.target === back) hide();               // click the backdrop
    });
    document.addEventListener("keydown", function (ev) {
      if (ev.key === "Escape" && back.classList.contains("open")) hide();
    });
  }

  /* ---- 8. live filter ------------------------------------------------ */
  function wireFilter(grid) {
    var input = document.getElementById("filterInput");
    var count = document.getElementById("filterCount");
    var tagBtns = document.querySelectorAll(".tag-btn");
    if (!input) return;

    var activeTag = "all";

    function run() {
      var q = input.value.trim().toLowerCase();
      var blocks = grid.querySelectorAll(".block");
      var shown = 0;

      for (var i = 0; i < blocks.length; i++) {
        var hay = blocks[i].getAttribute("data-search");
        var matchText = !q || hay.indexOf(q) !== -1;
        var matchTag = activeTag === "all" || hay.indexOf(activeTag) !== -1;
        var ok = matchText && matchTag;

        blocks[i].classList.toggle("dimmed", !ok);
        if (ok) shown++;
      }

      if (count) {
        count.textContent = shown === 6
          ? "showing all 6 blocks"
          : "showing " + shown + " of 6 blocks";
      }
    }

    input.addEventListener("input", run);

    for (var i = 0; i < tagBtns.length; i++) {
      tagBtns[i].addEventListener("click", function () {
        for (var j = 0; j < tagBtns.length; j++) tagBtns[j].classList.remove("active");
        this.classList.add("active");
        activeTag = this.getAttribute("data-tag");
        run();
      });
    }

    run();
  }
})();
