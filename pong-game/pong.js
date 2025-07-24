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

// Scores
let leftScore = 0;
let rightScore = 0;

// Game state
let gameOver = false;

// Mouse controls
canvas.addEventListener('mousemove', function(e) {
    const rect = canvas.getBoundingClientRect();
    const mouseY = e.clientY - rect.top;
    leftPaddleY = mouseY - paddleHeight / 2;
    // Clamp paddle within canvas
    if (leftPaddleY < 0) leftPaddleY = 0;
    if (leftPaddleY > canvas.height - paddleHeight) leftPaddleY = canvas.height - paddleHeight;
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

    // Draw scores
    ctx.font = "40px Arial";
    ctx.fillText(leftScore, canvas.width / 4, 50);
    ctx.fillText(rightScore, 3 * canvas.width / 4, 50);

    // Check if game is over
    if (gameOver) {
        ctx.fillStyle = "#fff";
        ctx.font = "30px Arial";
        ctx.fillText(leftScore === 10 ? "Left Player Wins!" : "Right Player Wins!", canvas.width / 4, canvas.height / 2);
        ctx.fillText("Press 'R' to Restart", canvas.width / 4, canvas.height / 2 + 40);
    }
}

// Ball and paddle movement logic
function update() {
    if (gameOver) return; // Stop updating when game is over

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
        if (rightScore >= 10) gameOver = true;
        resetBall();
    }
    if (ballX + ballRadius > canvas.width) {
        leftScore++;
        if (leftScore >= 10) gameOver = true;
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

// Restart the game if 'R' key is pressed
document.addEventListener('keydown', function(e) {
    if (gameOver && e.key === 'r') {
        // Reset scores and game state
        leftScore = 0;
        rightScore = 0;
        gameOver = false;
        resetBall();
    }
});

// Main game loop
function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

gameLoop();
