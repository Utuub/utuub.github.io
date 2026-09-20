/* theme.js — DYNAMIC EFFECT 1 of 8: dark/light theme toggle.
 *
 * Runs on every page. Loaded in <head> (not deferred) on purpose, so the
 * saved theme is on <html> before the first paint and the page does not
 * flash the wrong colours.
 *
 * Plain JavaScript. No framework, no jQuery.
 */
(function () {
  "use strict";

  var KEY = "aw-theme";
  var root = document.documentElement;

  function preferred() {
    var saved = null;
    try { saved = localStorage.getItem(KEY); } catch (e) { /* private mode */ }
    if (saved === "light" || saved === "dark") return saved;
    // no choice stored yet — follow whatever the operating system is set to
    return window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
  }

  function apply(theme) {
    root.setAttribute("data-theme", theme);
    var btns = document.querySelectorAll(".theme-btn");
    for (var i = 0; i < btns.length; i++) {
      btns[i].textContent = theme === "light" ? "☾" : "☀";
      btns[i].setAttribute("aria-label", "Switch to " + (theme === "light" ? "dark" : "light") + " theme");
      btns[i].setAttribute("title", "Switch to " + (theme === "light" ? "dark" : "light") + " theme");
    }
  }

  apply(preferred());

  // the buttons do not exist yet while this runs in <head>, so wire them up
  // once the document is parsed
  document.addEventListener("DOMContentLoaded", function () {
    apply(root.getAttribute("data-theme"));

    document.addEventListener("click", function (ev) {
      var btn = ev.target.closest && ev.target.closest(".theme-btn");
      if (!btn) return;
      var next = root.getAttribute("data-theme") === "light" ? "dark" : "light";
      apply(next);
      try { localStorage.setItem(KEY, next); } catch (e) { /* ignore */ }
    });
  });
})();
