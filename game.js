const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const WIDTH = canvas.width;
const HEIGHT = canvas.height;

// UI
const titleScreen = document.getElementById("title-screen");
const scoreboard = document.getElementById("scoreboard");
const scoreP1El = document.getElementById("score-p1");
const scoreP2El = document.getElementById("score-p2");
const modeLabelEl = document.getElementById("mode-label");
const btnSolo = document.getElementById("btn-solo");
const btnVersus = document.getElementById("btn-versus");

// Sons
const sndScore = document.getElementById("snd-score");
const sndBounce = document.getElementById("snd-bounce");
const sndStart = document.getElementById("snd-start");

// États
let gameState = "menu"; // "menu" | "game"
let gameMode = "versus"; // "versus" | "solo"

// Joueurs
const player1 = {
  x: 200,
  y: HEIGHT - 150,
  width: 40,
  height: 80,
  colorBody: "#f4b400", // maillot
  colorShort: "#ffecb3",
  vx: 0,
  vy: 0,
  onGround: false,
  facing: 1
};

const player2 = {
  x: WIDTH - 240,
  y: HEIGHT - 150,
  width: 40,
  height: 80,
  colorBody: "#4285f4",
  colorShort: "#bbdefb",
  vx: 0,
  vy: 0,
  onGround: false,
  facing: -1
};

// Ballon
const ball = {
  x: WIDTH / 2,
  y: HEIGHT / 2,
  radius: 12,
  vx: 0,
  vy: 0
};

const gravity = 0.6;
const friction = 0.85;

// Paniers
const hoopLeft = {
  x: 80,
  y: 140,
  width: 60,
  height: 10
};

const hoopRight = {
  x: WIDTH - 140,
  y: 140,
  width: 60,
  height: 10
};

// Score
let scoreP1 = 0;
let scoreP2 = 0;

// Input
const keys = {};
window.addEventListener("keydown", (e) => {
  keys[e.key] = true;
});
window.addEventListener("keyup", (e) => {
  keys[e.key] = false;
});

// Boutons menu
btnSolo.addEventListener("click", () => {
  gameMode = "solo";
  startGame();
});

btnVersus.addEventListener("click", () => {
  gameMode = "versus";
  startGame();
});

function startGame() {
  gameState = "game";
  titleScreen.classList.add("hidden");
  scoreboard.classList.remove("hidden");
  modeLabelEl.textContent = gameMode === "solo" ? "Mode Solo" : "2 Joueurs";
  resetPositions();
  if (sndStart) sndStart.play().catch(() => {});
}

function resetPositions(scoredBy = null) {
  player1.x = 200;
  player1.y = HEIGHT - 150;
  player1.vx = 0;
  player1.vy = 0;
  player1.onGround = false;

  player2.x = WIDTH - 240;
  player2.y = HEIGHT - 150;
  player2.vx = 0;
  player2.vy = 0;
  player2.onGround = false;

  ball.x = WIDTH / 2;
  ball.y = HEIGHT / 2;
  ball.vx = 0;
  ball.vy = 0;

  if (scoredBy === "p1") {
    ball.vx = 4;
  } else if (scoredBy === "p2") {
    ball.vx = -4;
  }
}

function updatePlayer(player, leftKey, rightKey, jumpKey, isAI = false) {
  if (!isAI) {
    if (keys[leftKey]) {
      player.vx = -5;
      player.facing = -1;
    } else if (keys[rightKey]) {
      player.vx = 5;
      player.facing = 1;
    } else {
      player.vx *= friction;
    }

    if (keys[jumpKey] && player.onGround) {
      player.vy = -12;
      player.onGround = false;
    }
  } else {
    // IA simple : suit le ballon horizontalement, saute parfois
    const targetX = ball.x;
    if (targetX < player.x) {
      player.vx = -4;
      player.facing = -1;
    } else if (targetX > player.x + player.width) {
      player.vx = 4;
      player.facing = 1;
    } else {
      player.vx *= friction;
    }

    if (ball.y < player.y && player.onGround && Math.random() < 0.02) {
      player.vy = -12;
      player.onGround = false;
    }
  }

  player.vy += gravity;

  player.x += player.vx;
  player.y += player.vy;

  if (player.y + player.height > HEIGHT - 40) {
    player.y = HEIGHT - 40 - player.height;
    player.vy = 0;
    player.onGround = true;
  }

  if (player.x < 0) player.x = 0;
  if (player.x + player.width > WIDTH) player.x = WIDTH - player.width;
}

function updateBall() {
  ball.vy += gravity;
  ball.x += ball.vx;
  ball.y += ball.vy;

  if (ball.y + ball.radius > HEIGHT - 40) {
    ball.y = HEIGHT - 40 - ball.radius;
    ball.vy *= -0.6;
    ball.vx *= 0.9;
    if (sndBounce) sndBounce.play().catch(() => {});
  }

  if (ball.x - ball.radius < 0) {
    ball.x = ball.radius;
    ball.vx *= -0.8;
  }
  if (ball.x + ball.radius > WIDTH) {
    ball.x = WIDTH - ball.radius;
    ball.vx *= -0.8;
  }
}

function rectCircleCollide(player, ball) {
  const closestX = Math.max(player.x, Math.min(ball.x, player.x + player.width));
  const closestY = Math.max(player.y, Math.min(ball.y, player.y + player.height));

  const dx = ball.x - closestX;
  const dy = ball.y - closestY;

  return dx * dx + dy * dy < ball.radius * ball.radius;
}

function handleCollisions() {
  [player1, player2].forEach(player => {
    if (rectCircleCollide(player, ball)) {
      const dirX = ball.x - (player.x + player.width / 2);
      const dirY = ball.y - (player.y + player.height / 2);
      const length = Math.max(1, Math.hypot(dirX, dirY));

      ball.vx = (dirX / length) * 10;
      ball.vy = (dirY / length) * 8;
    }
  });
}

function checkScore() {
  // Panier gauche (J2 marque)
  if (
    ball.x > hoopLeft.x &&
    ball.x < hoopLeft.x + hoopLeft.width &&
    ball.y - ball.radius < hoopLeft.y + hoopLeft.height &&
    ball.y + ball.radius > hoopLeft.y
  ) {
    scoreP2++;
    updateScoreUI();
    if (sndScore) sndScore.play().catch(() => {});
    resetPositions("p2");
  }

  // Panier droit (J1 marque)
  if (
    ball.x > hoopRight.x &&
    ball.x < hoopRight.x + hoopRight.width &&
    ball.y - ball.radius < hoopRight.y + hoopRight.height &&
    ball.y + ball.radius > hoopRight.y
  ) {
    scoreP1++;
    updateScoreUI();
    if (sndScore) sndScore.play().catch(() => {});
    resetPositions("p1");
  }
}

function updateScoreUI() {
  scoreP1El.textContent = `J1 : ${scoreP1}`;
  scoreP2El.textContent = `J2 : ${scoreP2}`;
}

function drawCourt() {
  ctx.fillStyle = "#1f5f2b";
  ctx.fillRect(0, HEIGHT - 40, WIDTH, 40);

  ctx.strokeStyle = "#fff";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(WIDTH / 2, 0);
  ctx.lineTo(WIDTH / 2, HEIGHT - 40);
  ctx.stroke();

  // Paniers
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(hoopLeft.x, hoopLeft.y, hoopLeft.width, hoopLeft.height);
  ctx.fillRect(hoopRight.x, hoopRight.y, hoopRight.width, hoopRight.height);

  // Supports paniers
  ctx.strokeStyle = "#ffffff";
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(hoopLeft.x + hoopLeft.width, hoopLeft.y + hoopLeft.height);
  ctx.lineTo(hoopLeft.x + hoopLeft.width + 20, hoopLeft.y + 80);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(hoopRight.x, hoopRight.y + hoopRight.height);
  ctx.lineTo(hoopRight.x - 20, hoopRight.y + 80);
  ctx.stroke();
}

function drawPlayer(player) {
  // Corps (maillot)
  ctx.fillStyle = player.colorBody;
  ctx.fillRect(player.x, player.y + 20, player.width, player.height - 20);

  // Short
  ctx.fillStyle = player.colorShort;
  ctx.fillRect(player.x, player.y + player.height - 25, player.width, 25);

  // Tête
  ctx.fillStyle = "#ffcc80";
  ctx.beginPath();
  ctx.arc(player.x + player.width / 2, player.y + 12, 12, 0, Math.PI * 2);
  ctx.fill();
}

function drawBall() {
  ctx.fillStyle = "#ff6f00";
  ctx.beginPath();
  ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
  ctx.fill();
}

function gameLoop() {
  ctx.clearRect(0, 0, WIDTH, HEIGHT);

  if (gameState === "game") {
    const isSolo = gameMode === "solo";

    updatePlayer(player1, "a", "d", "w", false);
    updatePlayer(player2, "ArrowLeft", "ArrowRight", "ArrowUp", isSolo);

    updateBall();
    handleCollisions();
    checkScore();

    drawCourt();
    drawPlayer(player1);
    drawPlayer(player2);
    drawBall();
  } else {
    // menu : juste fond terrain
    drawCourt();
  }

  requestAnimationFrame(gameLoop);
}

gameLoop();
