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

// Second ball (used when 3-point difference occurs)
let ball2X = canvas.width / 2;
let ball2Y = canvas.height / 2;
let ball2SpeedX = 6;
let ball2SpeedY = 4;

// Scores
let leftScore = 0;
let rightScore = 0;

// Game state
let gameOver = false;

// Paddle scaling factors
let leftPaddleHeight = paddleHeight;
let rightPaddleHeight = paddleHeight;

// Mouse controls
canvas.addEventListener('mousemove', function(e) {
    const rect = canvas.getBoundingClientRect();
    const mouseY = e.clientY - rect.top;
    leftPaddleY = mouseY - leftPaddleHeight / 2;
    // Clamp paddle within canvas
    if (leftPaddleY < 0) leftPaddleY = 0;
    if (leftPaddleY > canvas.height - leftPaddleHeight)
        leftPaddleY = canvas.height - leftPaddleHeight;
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
    ctx.fillRect(0, leftPaddleY, paddleWidth, leftPaddleHeight);

    ctx.fillStyle = "#f00";
    ctx.fillRect(canvas.width - paddleWidth, rightPaddleY, paddleWidth, rightPaddleHeight);

    // Draw balls
    ctx.beginPath();
    ctx.arc(ballX, ballY, ballRadius, 0, Math.PI * 2);
    ctx.fillStyle = "#fff";
    ctx.fill();
    ctx.closePath();

    // If second ball exists, draw it
    if (Math.abs(leftScore - rightScore) >= 3) {
        ctx.beginPath();
        ctx.arc(ball2X, ball2Y, ballRadius, 0, Math.PI * 2);
        ctx.fillStyle = "#ff0";  // Different color for second ball
        ctx.fill();
        ctx.closePath();
    }

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

    // Ball2 movement (when second ball exists)
    if (Math.abs(leftScore - rightScore) >= 3) {
        ball2X += ball2SpeedX;
        ball2Y += ball2SpeedY;
    }

    // Top/bottom wall collision for both balls
    if (ballY - ballRadius < 0) {
        ballY = ballRadius;
        ballSpeedY = -ballSpeedY;
    }
    if (ballY + ballRadius > canvas.height) {
        ballY = canvas.height - ballRadius;
        ballSpeedY = -ballSpeedY;
    }

    // Second ball collision with top/bottom
    if (Math.abs(leftScore - rightScore) >= 3) {
        if (ball2Y - ballRadius < 0) {
            ball2Y = ballRadius;
            ball2SpeedY = -ball2SpeedY;
        }
        if (ball2Y + ballRadius > canvas.height) {
            ball2Y = canvas.height - ballRadius;
            ball2SpeedY = -ball2SpeedY;
        }
    }

    // Left paddle collision
    if (
        ballX - ballRadius < paddleWidth &&
        ballY > leftPaddleY &&
        ballY < leftPaddleY + leftPaddleHeight
    ) {
        ballX = paddleWidth + ballRadius;
        ballSpeedX = -ballSpeedX;
        let collidePoint = (ballY - (leftPaddleY + leftPaddleHeight / 2)) / (leftPaddleHeight / 2);
        ballSpeedY = collidePoint * 5;
    }

    // Right paddle collision (AI)
    if (
        ballX + ballRadius > canvas.width - paddleWidth &&
        ballY > rightPaddleY &&
        ballY < rightPaddleY + rightPaddleHeight
    ) {
        ballX = canvas.width - paddleWidth - ballRadius;
        ballSpeedX = -ballSpeedX;
        let collidePoint = (ballY - (rightPaddleY + rightPaddleHeight / 2)) / (rightPaddleHeight / 2);
        ballSpeedY = collidePoint * 5;
    }

    // Second ball collision with right paddle (AI)
    if (
        ball2X + ballRadius > canvas.width - paddleWidth &&
        ball2Y > rightPaddleY &&
        ball2Y < rightPaddleY + rightPaddleHeight
    ) {
        ball2X = canvas.width - paddleWidth - ballRadius;
        ball2SpeedX = -ball2SpeedX;
        let collidePoint = (ball2Y - (rightPaddleY + rightPaddleHeight / 2)) / (rightPaddleHeight / 2);
        ball2SpeedY = collidePoint * 5;
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

    // Second ball left/right wall
    if (ball2X - ballRadius < 0) {
        rightScore++;
        if (rightScore >= 10) gameOver = true;
        resetBall2();
    }
    if (ball2X + ballRadius > canvas.width) {
        leftScore++;
        if (leftScore >= 10) gameOver = true;
        resetBall2();
    }

    // Scale paddles based on score difference
    if (Math.abs(leftScore - rightScore) >= 3) {
        if (leftScore < rightScore) {
            leftPaddleHeight = paddleHeight * 1.5; // Make left paddle taller if behind
        } else {
            rightPaddleHeight = paddleHeight * 1.5; // Make right paddle taller if behind
        }
    } else {
        // Reset paddle height when the score difference is less than 3
        leftPaddleHeight = paddleHeight;
        rightPaddleHeight = paddleHeight;
    }

    // AI paddle movement
    let center = rightPaddleY + rightPaddleHeight / 2;
    if (center < ballY - 15) {
        rightPaddleY += aiSpeed;
    } else if (center > ballY + 15) {
        rightPaddleY -= aiSpeed;
    }
    // Clamp AI paddle
    if (rightPaddleY < 0) rightPaddleY = 0;
    if (rightPaddleY > canvas.height - rightPaddleHeight)
        rightPaddleY = canvas.height - rightPaddleHeight;
}

function resetBall() {
    ballX = canvas.width / 2;
    ballY = canvas.height / 2;
    ballSpeedX = (Math.random() > 0.5 ? 1 : -1) * 6;
    ballSpeedY = (Math.random() * 2 - 1) * 5;
}

function resetBall2() {
    ball2X = canvas.width / 2;
    ball2Y = canvas.height / 2;
    ball2SpeedX = (Math.random() > 0.5 ? 1 : -1) * 6;
    ball2SpeedY = (Math.random() * 2 - 1) * 5;
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
