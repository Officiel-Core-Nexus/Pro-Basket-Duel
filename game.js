const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const WIDTH = canvas.width;
const HEIGHT = canvas.height;

// UI
const menu = document.getElementById("menu");
const scoreUI = document.getElementById("score");
const p1UI = document.getElementById("p1");
const p2UI = document.getElementById("p2");
const modeUI = document.getElementById("mode");

document.getElementById("btn-solo").onclick = () => startGame("solo");
document.getElementById("btn-versus").onclick = () => startGame("versus");

// Sons
const sndScore = document.getElementById("snd-score");
const sndBounce = document.getElementById("snd-bounce");
const sndStart = document.getElementById("snd-start");

// États
let gameState = "menu";
let gameMode = "versus";

// Joueurs
const player1 = {
  x: 200, y: HEIGHT - 150,
  w: 40, h: 80,
  vx: 0, vy: 0,
  onGround: false,
  shirt: "#f4b400",
  short: "#ffecb3"
};

const player2 = {
  x: WIDTH - 240, y: HEIGHT - 150,
  w: 40, h: 80,
  vx: 0, vy: 0,
  onGround: false,
  shirt: "#4285f4",
  short: "#bbdefb"
};

// Ballon
const ball = {
  x: WIDTH / 2, y: HEIGHT / 2,
  r: 12,
  vx: 0, vy: 0
};

const gravity = 0.6;
const friction = 0.85;

// Paniers
const hoopLeft = { x: 80, y: 140, w: 60, h: 10 };
const hoopRight = { x: WIDTH - 140, y: 140, w: 60, h: 10 };

// Score
let scoreP1 = 0;
let scoreP2 = 0;

// Input
const keys = {};
window.onkeydown = e => keys[e.key] = true;
window.onkeyup = e => keys[e.key] = false;

// Démarrer le jeu
function startGame(mode) {
  gameMode = mode;
  gameState = "game";

  menu.classList.add("hidden");
  scoreUI.classList.remove("hidden");

  modeUI.textContent = mode === "solo" ? "Mode Solo" : "2 Joueurs";

  resetPositions();

  sndStart.play().catch(() => {});
}

// Reset après un panier
function resetPositions() {
  player1.x = 200;
  player1.y = HEIGHT - 150;
  player1.vx = player1.vy = 0;

  player2.x = WIDTH - 240;
  player2.y = HEIGHT - 150;
  player2.vx = player2.vy = 0;

  ball.x = WIDTH / 2;
  ball.y = HEIGHT / 2;
  ball.vx = ball.vy = 0;
}

// Mise à jour joueur
function updatePlayer(p, left, right, jump, isAI = false) {
  if (!isAI) {
    if (keys[left]) p.vx = -5;
    else if (keys[right]) p.vx = 5;
    else p.vx *= friction;

    if (keys[jump] && p.onGround) {
      p.vy = -12;
      p.onGround = false;
    }
  } else {
    // IA simple
    if (ball.x < p.x) p.vx = -4;
    else if (ball.x > p.x + p.w) p.vx = 4;
    else p.vx *= friction;

    if (ball.y < p.y && p.onGround && Math.random() < 0.02) {
      p.vy = -12;
      p.onGround = false;
    }
  }

  p.vy += gravity;

  p.x += p.vx;
  p.y += p.vy;

  if (p.y + p.h > HEIGHT - 40) {
    p.y = HEIGHT - 40 - p.h;
    p.vy = 0;
    p.onGround = true;
  }

  if (p.x < 0) p.x = 0;
  if (p.x + p.w > WIDTH) p.x = WIDTH - p.w;
}

// Mise à jour ballon
function updateBall() {
  ball.vy += gravity;
  ball.x += ball.vx;
  ball.y += ball.vy;

  if (ball.y + ball.r > HEIGHT - 40) {
    ball.y = HEIGHT - 40 - ball.r;
    ball.vy *= -0.6;
    ball.vx *= 0.9;
    sndBounce.play().catch(() => {});
  }

  if (ball.x - ball.r < 0) {
    ball.x = ball.r;
    ball.vx *= -0.8;
  }
  if (ball.x + ball.r > WIDTH) {
    ball.x = WIDTH - ball.r;
    ball.vx *= -0.8;
  }
}

// Collision joueur ↔ ballon
function collide(p) {
  const cx = Math.max(p.x, Math.min(ball.x, p.x + p.w));
  const cy = Math.max(p.y, Math.min(ball.y, p.y + p.h));

  const dx = ball.x - cx;
  const dy = ball.y - cy;

  if (dx * dx + dy * dy < ball.r * ball.r) {
    ball.vx = dx * 0.4;
    ball.vy = dy * 0.4;
  }
}

// Détection panier
function checkScore() {
  // Panier gauche → J2 marque
  if (
    ball.x > hoopLeft.x &&
    ball.x < hoopLeft.x + hoopLeft.w &&
    ball.y > hoopLeft.y &&
    ball.y < hoopLeft.y + hoopLeft.h
  ) {
    scoreP2++;
    p2UI.textContent = "J2 : " + scoreP2;
    sndScore.play().catch(() => {});
    resetPositions();
  }

  // Panier droit → J1 marque
  if (
    ball.x > hoopRight.x &&
    ball.x < hoopRight.x + hoopRight.w &&
    ball.y > hoopRight.y &&
    ball.y < hoopRight.y + hoopRight.h
  ) {
    scoreP1++;
    p1UI.textContent = "J1 : " + scoreP1;
    sndScore.play().catch(() => {});
    resetPositions();
  }
}

// Dessin joueur
function drawPlayer(p) {
  // Tête
  ctx.fillStyle = "#ffcc80";
  ctx.beginPath();
  ctx.arc(p.x + p.w / 2, p.y + 12, 12, 0, Math.PI * 2);
  ctx.fill();

  // Maillot
  ctx.fillStyle = p.shirt;
  ctx.fillRect(p.x, p.y + 20, p.w, p.h - 20);

  // Short
  ctx.fillStyle = p.short;
  ctx.fillRect(p.x, p.y + p.h - 25, p.w, 25);
}

// Dessin ballon
function drawBall() {
  ctx.fillStyle = "#ff6f00";
  ctx.beginPath();
  ctx.arc(ball.x, ball.y, ball.r, 0, Math.PI * 2);
  ctx.fill();
}

// Dessin terrain + paniers
function drawCourt() {
  ctx.fillStyle = "#1f5f2b";
  ctx.fillRect(0, HEIGHT - 40, WIDTH, 40);

  ctx.fillStyle = "white";
  ctx.fillRect(hoopLeft.x, hoopLeft.y, hoopLeft.w, hoopLeft.h);
  ctx.fillRect(hoopRight.x, hoopRight.y, hoopRight.w, hoopRight.h);
}

// Boucle du jeu
function loop() {
  ctx.clearRect(0, 0, WIDTH, HEIGHT);

  if (gameState === "game") {
    updatePlayer(player1, "a", "d", "w");
    updatePlayer(player2, "ArrowLeft", "ArrowRight", "ArrowUp", gameMode === "solo");

    updateBall();
    collide(player1);
    collide(player2);
    checkScore();

    drawCourt();
    drawPlayer(player1);
    drawPlayer(player2);
    drawBall();
  }

  requestAnimationFrame(loop);
}

loop();
