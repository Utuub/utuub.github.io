/* main.js — shared page behaviour.
 *
 * DYNAMIC EFFECT 2: typewriter headline
 * DYNAMIC EFFECT 3: scroll reveal (IntersectionObserver)
 * DYNAMIC EFFECT 4: stat counters that count up when scrolled into view
 * DYNAMIC EFFECT 5: mobile nav toggle + scroll-spy nav highlighting
 * DYNAMIC EFFECT 6: matchMedia layout watcher (reports desktop vs mobile)
 *
 * Plain JavaScript. No framework, no jQuery.
 */
(function () {
  "use strict";

  document.addEventListener("DOMContentLoaded", function () {
    typewriter();
    scrollReveal();
    navToggle();
    scrollSpy();
    layoutWatcher();
  });

  /* ---- 2. typewriter -----------------------------------------------
     Types the phrases in data-phrases one character at a time, pauses,
     deletes, moves to the next one. setTimeout drives it rather than CSS
     so the speed can differ between typing and deleting. */
  function typewriter() {
    var el = document.querySelector("[data-typewriter]");
    if (!el) return;

    var phrases = JSON.parse(el.getAttribute("data-phrases"));
    var caret = document.createElement("span");
    caret.className = "caret";
    caret.textContent = "|";

    var text = document.createElement("span");
    el.textContent = "";
    el.appendChild(text);
    el.appendChild(caret);

    var p = 0, i = 0, deleting = false;

    (function tick() {
      var full = phrases[p];
      i = deleting ? i - 1 : i + 1;
      text.textContent = full.slice(0, i);

      var wait = deleting ? 34 : 62;
      if (!deleting && i === full.length) {          // finished typing — hold
        deleting = true;
        wait = 1700;
      } else if (deleting && i === 0) {              // finished deleting — next
        deleting = false;
        p = (p + 1) % phrases.length;
        wait = 320;
      }
      setTimeout(tick, wait);
    })();
  }

  /* ---- 3. scroll reveal + 4. counters --------------------------------
     One IntersectionObserver handles both: when a .reveal enters the
     viewport it gets .shown, and if it happens to hold counters those
     start animating at the same moment. */
  function scrollReveal() {
    var items = document.querySelectorAll(".reveal");
    if (!items.length) return;

    if (!("IntersectionObserver" in window)) {        // very old browser
      for (var i = 0; i < items.length; i++) items[i].classList.add("shown");
      return;
    }

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("shown");
        var nums = entry.target.querySelectorAll("[data-count]");
        for (var j = 0; j < nums.length; j++) countUp(nums[j]);
        io.unobserve(entry.target);                   // only once
      });
    }, { threshold: 0.18, rootMargin: "0px 0px -40px 0px" });

    for (var k = 0; k < items.length; k++) io.observe(items[k]);
  }

  function countUp(el) {
    if (el.dataset.done) return;
    el.dataset.done = "1";

    var target = parseFloat(el.getAttribute("data-count"));
    var suffix = el.getAttribute("data-suffix") || "";
    var decimals = (String(target).split(".")[1] || "").length;
    var start = performance.now();
    var ms = 1100;

    (function frame(now) {
      var t = Math.min(1, (now - start) / ms);
      var eased = 1 - Math.pow(1 - t, 3);             // ease-out cubic
      el.textContent = (target * eased).toFixed(decimals) + suffix;
      if (t < 1) requestAnimationFrame(frame);
      else el.textContent = target.toFixed(decimals) + suffix;
    })(start);
  }

  /* ---- 5a. mobile nav toggle ---------------------------------------- */
  function navToggle() {
    var btn = document.querySelector(".nav-toggle");
    var links = document.querySelector(".nav-links");
    if (!btn || !links) return;

    btn.addEventListener("click", function () {
      var open = links.classList.toggle("open");
      btn.setAttribute("aria-expanded", open ? "true" : "false");
      btn.textContent = open ? "✕" : "☰";
    });

    links.addEventListener("click", function (ev) {
      if (ev.target.tagName === "A") {
        links.classList.remove("open");
        btn.textContent = "☰";
      }
    });
  }

  /* ---- 5b. scroll spy ------------------------------------------------
     Highlights the nav link matching whichever section is on screen. */
  function scrollSpy() {
    var links = document.querySelectorAll('.nav-links a[href^="#"]');
    if (!links.length || !("IntersectionObserver" in window)) return;

    var map = {};
    var watched = [];
    for (var i = 0; i < links.length; i++) {
      var id = links[i].getAttribute("href").slice(1);
      var sec = document.getElementById(id);
      if (sec) { map[id] = links[i]; watched.push(sec); }
    }

    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        for (var id in map) map[id].classList.remove("current");
        map[entry.target.id].classList.add("current");
      });
    }, { rootMargin: "-45% 0px -50% 0px" });

    for (var j = 0; j < watched.length; j++) spy.observe(watched[j]);
  }

  /* ---- 6. layout watcher --------------------------------------------
     The same 719px breakpoint the stylesheets use, watched from JS. The
     desktop and mobile versions of the About block are swapped by CSS;
     this reports which one is live and updates anything tagged
     data-layout-text, so the switch is visible during the demo. */
  function layoutWatcher() {
    var mq = window.matchMedia("(max-width: 719px)");
    var out = document.querySelectorAll("[data-layout-text]");
    if (!out.length) return;

    function report(mobile) {
      var label = mobile ? "Figure 2 · mobile (390px)" : "Figure 1 · desktop (720px)";
      for (var i = 0; i < out.length; i++) out[i].textContent = label;
    }

    report(mq.matches);
    if (mq.addEventListener) mq.addEventListener("change", function (e) { report(e.matches); });
    else mq.addListener(function (e) { report(e.matches); });   // older Safari
  }
})();
