/* demo.js — the JavaScript demo: a brick-breaker on an HTML canvas.
 *
 * Plain JavaScript. No game engine, no library, no framework.
 *
 * Structure:
 *   state           one object holding everything that changes
 *   reset/build     set the board up
 *   input           mouse, touch and keyboard all move the same paddle
 *   step(dt)        move things and resolve collisions
 *   draw()          paint the current state
 *   loop(now)       requestAnimationFrame, with a fixed-size time step so
 *                   the game runs the same speed on a 60Hz and a 144Hz screen
 */
(function () {
  "use strict";

  var W = 760, H = 460;                  // internal canvas size (CSS scales it)
  var canvas, ctx, overlay, overlayTitle, overlayText;
  var elScore, elLives, elLevel, elBest;

  var state = null;
  var keys = { left: false, right: false };
  var running = false;
  var lastTime = 0;
  var carry = 0;                          // leftover time between fixed steps
  var STEP = 1 / 120;                     // seconds per physics step

  var COLORS = ["#ff6b35", "#ffa03a", "#ffd166", "#4cc2ff", "#8a7dff"];

  document.addEventListener("DOMContentLoaded", function () {
    canvas = document.getElementById("game");
    if (!canvas) return;

    canvas.width = W;
    canvas.height = H;
    ctx = canvas.getContext("2d");

    overlay      = document.getElementById("overlay");
    overlayTitle = document.getElementById("overlayTitle");
    overlayText  = document.getElementById("overlayText");
    elScore = document.getElementById("hudScore");
    elLives = document.getElementById("hudLives");
    elLevel = document.getElementById("hudLevel");
    elBest  = document.getElementById("hudBest");

    document.getElementById("startBtn").addEventListener("click", start);
    // the overlay sits on top of the canvas, so the canvas click never fires
    // while it is up — clicking the overlay itself has to start the game
    overlay.addEventListener("click", start);
    document.getElementById("resetBtn").addEventListener("click", function () {
      reset();
      pause("Ready", "Click Start, or press Space.");
      draw();
    });

    bindInput();
    reset();
    showBest();
    pause("Brick Breaker", "Move with the mouse, touch, or the arrow keys. Space starts and pauses.");
    draw();
  });

  /* ---------- board setup ---------- */
  function reset() {
    state = {
      score: 0,
      lives: 3,
      level: 1,
      paddle: { x: W / 2 - 55, y: H - 30, w: 110, h: 13 },
      ball:   null,
      bricks: []
    };
    buildLevel();
    serve();
    syncHud();
  }

  function buildLevel() {
    var cols = 10, rows = Math.min(3 + state.level, 6);
    var pad = 6, left = 40, top = 56;
    var bw = (W - left * 2 - pad * (cols - 1)) / cols;
    var bh = 22;

    state.bricks = [];
    for (var r = 0; r < rows; r++) {
      for (var c = 0; c < cols; c++) {
        state.bricks.push({
          x: left + c * (bw + pad),
          y: top + r * (bh + pad),
          w: bw,
          h: bh,
          hits: r < 1 ? 2 : 1,             // the top row takes two hits
          color: COLORS[r % COLORS.length],
          alive: true
        });
      }
    }
  }

  function serve() {
    var speed = 250 + (state.level - 1) * 30;
    var angle = (-Math.PI / 2) + (Math.random() - 0.5) * 0.7;
    state.ball = {
      x: state.paddle.x + state.paddle.w / 2,
      y: state.paddle.y - 10,
      r: 7,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      stuck: true                          // sits on the paddle until launch
    };
  }

  /* ---------- input ---------- */
  function bindInput() {
    canvas.addEventListener("mousemove", function (ev) {
      movePaddleTo(toCanvasX(ev.clientX));
    });

    canvas.addEventListener("touchmove", function (ev) {
      ev.preventDefault();
      movePaddleTo(toCanvasX(ev.touches[0].clientX));
    }, { passive: false });

    canvas.addEventListener("click", launch);
    canvas.addEventListener("touchstart", function (ev) {
      ev.preventDefault();
      if (!running) start(); else launch();
    }, { passive: false });

    document.addEventListener("keydown", function (ev) {
      if (ev.key === "ArrowLeft")  keys.left = true;
      if (ev.key === "ArrowRight") keys.right = true;
      if (ev.key === " " || ev.code === "Space") {
        ev.preventDefault();
        if (!running) start();
        else if (state.ball.stuck) launch();
        else pause("Paused", "Press Space to keep going.");
      }
    });

    document.addEventListener("keyup", function (ev) {
      if (ev.key === "ArrowLeft")  keys.left = false;
      if (ev.key === "ArrowRight") keys.right = false;
    });
  }

  function toCanvasX(clientX) {
    var rect = canvas.getBoundingClientRect();
    return (clientX - rect.left) * (W / rect.width);   // CSS px -> canvas px
  }

  function movePaddleTo(x) {
    var p = state.paddle;
    p.x = clamp(x - p.w / 2, 0, W - p.w);
    if (state.ball.stuck) state.ball.x = p.x + p.w / 2;
    if (!running) draw();
  }

  function launch() {
    if (!running) return;
    state.ball.stuck = false;
  }

  /* ---------- run / stop ---------- */
  function start() {
    if (running) return;
    running = true;
    overlay.hidden = true;
    lastTime = performance.now();
    carry = 0;
    requestAnimationFrame(loop);
  }

  function pause(title, text) {
    running = false;
    overlayTitle.textContent = title;
    overlayText.textContent = text;
    overlay.hidden = false;
  }

  function loop(now) {
    if (!running) return;

    var dt = Math.min(0.05, (now - lastTime) / 1000);   // cap after a tab switch
    lastTime = now;
    carry += dt;

    while (carry >= STEP) {
      step(STEP);
      carry -= STEP;
      if (!running) break;
    }

    draw();
    if (running) requestAnimationFrame(loop);
  }

  /* ---------- physics ---------- */
  function step(dt) {
    var p = state.paddle, b = state.ball;

    if (keys.left)  p.x = clamp(p.x - 430 * dt, 0, W - p.w);
    if (keys.right) p.x = clamp(p.x + 430 * dt, 0, W - p.w);

    if (b.stuck) { b.x = p.x + p.w / 2; b.y = p.y - b.r - 2; return; }

    b.x += b.vx * dt;
    b.y += b.vy * dt;

    // walls
    if (b.x - b.r < 0)      { b.x = b.r;      b.vx = Math.abs(b.vx); }
    if (b.x + b.r > W)      { b.x = W - b.r;  b.vx = -Math.abs(b.vx); }
    if (b.y - b.r < 0)      { b.y = b.r;      b.vy = Math.abs(b.vy); }

    // paddle — the bounce angle depends on where along the paddle it lands,
    // which is what makes the game steerable instead of a coin flip
    if (b.vy > 0 &&
        b.y + b.r >= p.y && b.y - b.r <= p.y + p.h &&
        b.x >= p.x && b.x <= p.x + p.w) {
      var hit = (b.x - (p.x + p.w / 2)) / (p.w / 2);     // -1 .. 1
      var speed = Math.min(620, Math.hypot(b.vx, b.vy) * 1.015);
      var angle = -Math.PI / 2 + hit * (Math.PI / 3);
      b.vx = Math.cos(angle) * speed;
      b.vy = Math.sin(angle) * speed;
      b.y = p.y - b.r - 0.5;
    }

    // bricks — axis-aligned, and the smaller overlap decides which way to flip
    for (var i = 0; i < state.bricks.length; i++) {
      var k = state.bricks[i];
      if (!k.alive) continue;
      if (b.x + b.r < k.x || b.x - b.r > k.x + k.w ||
          b.y + b.r < k.y || b.y - b.r > k.y + k.h) continue;

      var overlapX = Math.min(b.x + b.r - k.x, k.x + k.w - (b.x - b.r));
      var overlapY = Math.min(b.y + b.r - k.y, k.y + k.h - (b.y - b.r));
      if (overlapX < overlapY) b.vx = -b.vx; else b.vy = -b.vy;

      k.hits--;
      if (k.hits <= 0) { k.alive = false; state.score += 10 * state.level; }
      else             { state.score += 4; }
      syncHud();
      break;                                   // one brick per step
    }

    // lost the ball
    if (b.y - b.r > H) {
      state.lives--;
      syncHud();
      if (state.lives <= 0) {
        saveBest(state.score);
        pause("Game over", "Score " + state.score + ". Reset to play again.");
        return;
      }
      serve();
      pause("Ball lost", state.lives + " left. Space to serve.");
      return;
    }

    // cleared the board
    if (!state.bricks.some(function (k) { return k.alive; })) {
      state.level++;
      state.score += 100;
      buildLevel();
      serve();
      syncHud();
      pause("Level " + state.level, "Board cleared. Space to serve.");
    }
  }

  /* ---------- painting ---------- */
  function draw() {
    ctx.clearRect(0, 0, W, H);

    ctx.fillStyle = "#07080a";
    ctx.fillRect(0, 0, W, H);

    for (var i = 0; i < state.bricks.length; i++) {
      var k = state.bricks[i];
      if (!k.alive) continue;
      ctx.fillStyle = k.color;
      ctx.globalAlpha = k.hits > 1 ? 1 : 0.72;      // cracked bricks look faded
      roundRect(k.x, k.y, k.w, k.h, 4);
      ctx.fill();
    }
    ctx.globalAlpha = 1;

    var p = state.paddle;
    ctx.fillStyle = "#e8eaed";
    roundRect(p.x, p.y, p.w, p.h, 6);
    ctx.fill();

    var b = state.ball;
    ctx.beginPath();
    ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
    ctx.fillStyle = "#ff6b35";
    ctx.fill();

    ctx.font = "12px ui-monospace, Consolas, monospace";
    ctx.fillStyle = "#4a515b";
    ctx.fillText("plain JavaScript · canvas 2d · no libraries", 14, H - 10);
  }

  function roundRect(x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }

  /* ---------- hud ---------- */
  function syncHud() {
    if (elScore) elScore.textContent = state.score;
    if (elLives) elLives.textContent = state.lives;
    if (elLevel) elLevel.textContent = state.level;
  }

  function showBest() {
    if (!elBest) return;
    var best = 0;
    try { best = parseInt(localStorage.getItem("aw-brick-best") || "0", 10); } catch (e) {}
    elBest.textContent = best;
  }

  function saveBest(score) {
    try {
      var best = parseInt(localStorage.getItem("aw-brick-best") || "0", 10);
      if (score > best) localStorage.setItem("aw-brick-best", String(score));
    } catch (e) {}
    showBest();
  }

  function clamp(v, lo, hi) { return v < lo ? lo : (v > hi ? hi : v); }
})();
