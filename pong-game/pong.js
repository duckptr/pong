const canvas = document.getElementById('pongCanvas');
const ctx = canvas.getContext('2d');

// Game constants
const paddleWidth = 15;
const paddleHeight = 100;
const ballRadius = 10;
const aiSpeed = 4;

// Paddle positions
let leftPaddleY = canvas.height / 2 - paddleHeight / 2;
let rightPaddleY = canvas.height / 2 - paddleHeight / 2;

// Ball position and velocity
let ballX = canvas.width / 2;
let ballY = canvas.height / 2;
let ballSpeedX = 6;
let ballSpeedY = 4;

// Scores (optional, for extension)
let leftScore = 0;
let rightScore = 0;

// Mouse controls
canvas.addEventListener('mousemove', function(e) {
    const rect = canvas.getBoundingClientRect();
    const mouseY = e.clientY - rect.top;
    leftPaddleY = mouseY - paddleHeight / 2;
    // Clamp paddle within canvas
    if (leftPaddleY < 0) leftPaddleY = 0;
    if (leftPaddleY > canvas.height - paddleHeight)
        leftPaddleY = canvas.height - paddleHeight;
});

// Draw everything
function draw() {
    // Clear
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw net
    ctx.fillStyle = "#fff";
    for (let i = 0; i < canvas.height; i += 30) {
        ctx.fillRect(canvas.width / 2 - 1, i, 2, 20);
    }

    // Draw paddles
    ctx.fillStyle = "#0f0";
    ctx.fillRect(0, leftPaddleY, paddleWidth, paddleHeight);

    ctx.fillStyle = "#f00";
    ctx.fillRect(canvas.width - paddleWidth, rightPaddleY, paddleWidth, paddleHeight);

    // Draw ball
    ctx.beginPath();
    ctx.arc(ballX, ballY, ballRadius, 0, Math.PI * 2);
    ctx.fillStyle = "#fff";
    ctx.fill();
    ctx.closePath();

    // Draw scores (optional)
    /*
    ctx.font = "40px Arial";
    ctx.fillText(leftScore, canvas.width / 4, 50);
    ctx.fillText(rightScore, 3 * canvas.width / 4, 50);
    */
}

// Ball and paddle movement logic
function update() {
    // Ball movement
    ballX += ballSpeedX;
    ballY += ballSpeedY;

    // Top/bottom wall collision
    if (ballY - ballRadius < 0) {
        ballY = ballRadius;
        ballSpeedY = -ballSpeedY;
    }
    if (ballY + ballRadius > canvas.height) {
        ballY = canvas.height - ballRadius;
        ballSpeedY = -ballSpeedY;
    }

    // Left paddle collision
    if (
        ballX - ballRadius < paddleWidth &&
        ballY > leftPaddleY &&
        ballY < leftPaddleY + paddleHeight
    ) {
        ballX = paddleWidth + ballRadius;
        ballSpeedX = -ballSpeedX;
        // Add variation based on where it hits the paddle
        let collidePoint = (ballY - (leftPaddleY + paddleHeight / 2)) / (paddleHeight / 2);
        ballSpeedY = collidePoint * 5;
    }

    // Right paddle collision (AI)
    if (
        ballX + ballRadius > canvas.width - paddleWidth &&
        ballY > rightPaddleY &&
        ballY < rightPaddleY + paddleHeight
    ) {
        ballX = canvas.width - paddleWidth - ballRadius;
        ballSpeedX = -ballSpeedX;
        let collidePoint = (ballY - (rightPaddleY + paddleHeight / 2)) / (paddleHeight / 2);
        ballSpeedY = collidePoint * 5;
    }

    // Left/right wall (reset ball to center)
    if (ballX - ballRadius < 0) {
        rightScore++;
        resetBall();
    }
    if (ballX + ballRadius > canvas.width) {
        leftScore++;
        resetBall();
    }

    // AI paddle movement
    let center = rightPaddleY + paddleHeight / 2;
    if (center < ballY - 15) {
        rightPaddleY += aiSpeed;
    } else if (center > ballY + 15) {
        rightPaddleY -= aiSpeed;
    }
    // Clamp AI paddle
    if (rightPaddleY < 0) rightPaddleY = 0;
    if (rightPaddleY > canvas.height - paddleHeight)
        rightPaddleY = canvas.height - paddleHeight;
}

function resetBall() {
    ballX = canvas.width / 2;
    ballY = canvas.height / 2;
    // Randomize direction
    ballSpeedX = (Math.random() > 0.5 ? 1 : -1) * 6;
    ballSpeedY = (Math.random() * 2 - 1) * 5;
}

// Main game loop
function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

gameLoop();