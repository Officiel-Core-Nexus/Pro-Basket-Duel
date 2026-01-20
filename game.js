const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const WIDTH = canvas.width;
const HEIGHT = canvas.height;

// Joueurs
const player1 = {
  x: 200,
  y: HEIGHT - 150,
  width: 40,
  height: 80,
  color: "#f4b400",
  vx: 0,
  vy: 0,
  onGround: false
};

const player2 = {
  x: WIDTH - 240,
  y: HEIGHT - 150,
  width: 40,
  height: 80,
  color: "#4285f4",
  vx: 0,
  vy: 0,
  onGround: false
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

// Input
const keys = {};

window.addEventListener("keydown", (e) => keys[e.key] = true);
window.addEventListener("keyup", (e) => keys[e.key] = false);

function updatePlayer(player, leftKey, rightKey, jumpKey) {
  if (keys[leftKey]) player.vx = -5;
  else if (keys[rightKey]) player.vx = 5;
  else player.vx *= friction;

  if (keys[jumpKey] && player.onGround) {
    player.vy = -12;
    player.onGround = false;
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

function drawCourt() {
  ctx.fillStyle = "#1f5f2b";
  ctx.fillRect(0, HEIGHT - 40, WIDTH, 40);

  ctx.strokeStyle = "#fff";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(WIDTH / 2, 0);
  ctx.lineTo(WIDTH / 2, HEIGHT - 40);
  ctx.stroke();
}

function drawPlayer(player) {
  ctx.fillStyle = player.color;
  ctx.fillRect(player.x, player.y, player.width, player.height);
}

function drawBall() {
  ctx.fillStyle = "#ff6f00";
  ctx.beginPath();
  ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
  ctx.fill();
}

function gameLoop() {
  ctx.clearRect(0, 0, WIDTH, HEIGHT);

  updatePlayer(player1, "a", "d", "w");
  updatePlayer(player2, "ArrowLeft", "ArrowRight", "ArrowUp");
  updateBall();
  handleCollisions();

  drawCourt();
  drawPlayer(player1);
  drawPlayer(player2);
  drawBall();

  requestAnimationFrame(gameLoop);
}

gameLoop();
