
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
let width, height;

function resize() {
  width = window.innerWidth;
  height = window.innerHeight;
  canvas.width = width;
  canvas.height = height;
}
resize();
window.addEventListener('resize', resize);

const player = {
  x: width/2,
  y: height/2,
  size: 20,
  color: 'cyan',
  speed: 3,
  dx: 0,
  dy: 0,
};

const bullets = [];
const enemies = [];

function createEnemy() {
  const side = Math.floor(Math.random() * 4);
  let x, y;
  if (side === 0) { x = 0; y = Math.random() * height; }
  else if (side === 1) { x = width; y = Math.random() * height; }
  else if (side === 2) { x = Math.random() * width; y = 0; }
  else { x = Math.random() * width; y = height; }
  enemies.push({ x, y, size: 18, color: 'red', speed: 1.2 });
}

setInterval(() => {
  if (enemies.length < 5) createEnemy();
}, 2000);

function update() {
  player.x += player.dx * player.speed;
  player.y += player.dy * player.speed;
  // keep inside bounds
  player.x = Math.max(player.size, Math.min(width - player.size, player.x));
  player.y = Math.max(player.size, Math.min(height - player.size, player.y));

  // update enemies to chase player
  enemies.forEach(e => {
    let angle = Math.atan2(player.y - e.y, player.x - e.x);
    e.x += Math.cos(angle) * e.speed;
    e.y += Math.sin(angle) * e.speed;
  });

  // update bullets
  bullets.forEach((b, i) => {
    b.x += b.dx * b.speed;
    b.y += b.dy * b.speed;

    // remove bullets outside screen
    if (b.x < 0 || b.x > width || b.y < 0 || b.y > height) {
      bullets.splice(i, 1);
    }
  });

  // check bullet hits enemies
  bullets.forEach((b, bi) => {
    enemies.forEach((e, ei) => {
      const dist = Math.hypot(b.x - e.x, b.y - e.y);
      if (dist < b.size + e.size) {
        enemies.splice(ei, 1);
        bullets.splice(bi, 1);
      }
    });
  });
}

function draw() {
  ctx.clearRect(0, 0, width, height);
  // draw player
  ctx.fillStyle = player.color;
  ctx.beginPath();
  ctx.arc(player.x, player.y, player.size, 0, Math.PI * 2);
  ctx.fill();

  // draw enemies
  enemies.forEach(e => {
    ctx.fillStyle = e.color;
    ctx.beginPath();
    ctx.arc(e.x, e.y, e.size, 0, Math.PI * 2);
    ctx.fill();
  });

  // draw bullets
  bullets.forEach(b => {
    ctx.fillStyle = 'yellow';
    ctx.beginPath();
    ctx.arc(b.x, b.y, b.size, 0, Math.PI * 2);
    ctx.fill();
  });
}

function loop() {
  update();
  draw();
  requestAnimationFrame(loop);
}
loop();

// joystick handling
const joystick = document.getElementById('joystick');
const stick = document.getElementById('stick');
let joystickActive = false;
let startX, startY;

joystick.addEventListener('touchstart', e => {
  joystickActive = true;
  const touch = e.touches[0];
  startX = touch.clientX;
  startY = touch.clientY;
});

joystick.addEventListener('touchmove', e => {
  if (!joystickActive) return;
  const touch = e.touches[0];
  const dx = touch.clientX - startX;
  const dy = touch.clientY - startY;
  const dist = Math.min(Math.hypot(dx, dy), 40);
  const angle = Math.atan2(dy, dx);

  const stickX = dist * Math.cos(angle);
  const stickY = dist * Math.sin(angle);

  stick.style.transform = `translate(${stickX}px, ${stickY}px)`;

  player.dx = Math.cos(angle);
  player.dy = Math.sin(angle);

  e.preventDefault();
});

joystick.addEventListener('touchend', e => {
  joystickActive = false;
  stick.style.transform = 'translate(0, 0)';
  player.dx = 0;
  player.dy = 0;
});

// shoot button
const shootBtn = document.getElementById('shootBtn');
shootBtn.addEventListener('touchstart', () => {
  if (player.dx === 0 && player.dy === 0) return; // don't shoot if not moving
  bullets.push({
    x: player.x,
    y: player.y,
    dx: player.dx,
    dy: player.dy,
    size: 6,
    speed: 8,
  });
});
