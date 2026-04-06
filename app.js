// Select elements safely
const boxes = document.querySelectorAll(".btn");
const resetBtn = document.querySelector("#reset-btn");

const popup = document.querySelector(".popup");
const winnerMsg = document.querySelector("#winner-msg");
const newGameBtn = document.querySelector("#new-game-btn");

const scoreXDisplay = document.querySelector("#score-x");
const scoreODisplay = document.querySelector("#score-o");

const turnIndicator = document.querySelector("#turn-indicator");

const clickSound = document.querySelector("#click-sound");
const winSound = document.querySelector("#win-sound");

// Game state
let board = ["", "", "", "", "", "", "", "", ""];
let gameOver = false;
let aiTimeout = null;

let scoreX = 0;
let scoreO = 0;

// Winning patterns
const winPatterns = [
    [0,1,2],[0,3,6],[0,4,8],
    [1,4,7],[2,4,6],[3,4,5],[6,7,8],[2,5,8],
];

// Safe sound play
function playSound(sound) {
    if (!sound) return;
    sound.currentTime = 0;
    sound.play().catch(() => {}); // prevents crash
}

// Player move
boxes.forEach((box, index) => {
    box.addEventListener("click", () => {

        if (gameOver || board[index] !== "") return;

        playSound(clickSound);

        makeMove(index, "O");
        updateTurn("AI Thinking... 🤖");

        if (aiTimeout) clearTimeout(aiTimeout);

        if (!gameOver) {
            aiTimeout = setTimeout(() => {
                if (!gameOver) {
                    aiMove();
                    updateTurn("Your Turn (O)");
                }
            }, 400);
        }
    });
});

// Make move
function makeMove(index, player) {
    board[index] = player;

    boxes[index].innerText = player;
    boxes[index].classList.add(player);
    boxes[index].disabled = true;

    checkWinner(player);
    if (!gameOver) checkDraw();
}

// AI move
function aiMove() {
    if (gameOver) return;

    let bestMove = minimax(board, "X").index;
    makeMove(bestMove, "X");
}

// Minimax
function minimax(newBoard, player) {

    let avail = newBoard
        .map((v, i) => v === "" ? i : null)
        .filter(v => v !== null);

    if (checkWin(newBoard, "O")) return { score: -10 };
    if (checkWin(newBoard, "X")) return { score: 10 };
    if (avail.length === 0) return { score: 0 };

    let moves = [];

    for (let i of avail) {
        let move = { index: i };
        newBoard[i] = player;

        let result = minimax(newBoard, player === "X" ? "O" : "X");
        move.score = result.score;

        newBoard[i] = "";
        moves.push(move);
    }

    let bestMove;
    if (player === "X") {
        let bestScore = -Infinity;
        moves.forEach((m, i) => {
            if (m.score > bestScore) {
                bestScore = m.score;
                bestMove = i;
            }
        });
    } else {
        let bestScore = Infinity;
        moves.forEach((m, i) => {
            if (m.score < bestScore) {
                bestScore = m.score;
                bestMove = i;
            }
        });
    }

    return moves[bestMove];
}

// Check winner
function checkWinner(player) {
    for (let p of winPatterns) {
        let [a,b,c] = p;

        if (board[a] === player && board[b] === player && board[c] === player) {

            boxes[a].classList.add("win");
            boxes[b].classList.add("win");
            boxes[c].classList.add("win");

            playSound(winSound);

            if (player === "X") {
                scoreX++;
                scoreXDisplay.innerText = scoreX;
            } else {
                scoreO++;
                scoreODisplay.innerText = scoreO;
            }

            showWinner(player);
            return;
        }
    }
}

// Logic win check
function checkWin(board, player) {
    return winPatterns.some(p =>
        p.every(i => board[i] === player)
    );
}

// Draw
function checkDraw() {
    if (!board.includes("") && !gameOver) {

        if (aiTimeout) clearTimeout(aiTimeout);

        winnerMsg.innerText = "🤝 It's a Draw!";
        popup.classList.remove("hide");

        gameOver = true;
    }
}

// Show winner
function showWinner(player) {

    if (aiTimeout) clearTimeout(aiTimeout);

    winnerMsg.innerText = player === "X"
        ? "🤖 AI Wins!"
        : "🎉 You Win!";

    popup.classList.remove("hide");
    gameOver = true;
}

// Turn indicator
function updateTurn(text) {
    if (turnIndicator) {
        turnIndicator.innerText = text;
    }
}

// Reset
function resetGame() {

    if (aiTimeout) clearTimeout(aiTimeout);

    board = ["","","","","","","","",""];
    gameOver = false;

    updateTurn("Your Turn (O)");

    boxes.forEach(box => {
        box.innerText = "";
        box.disabled = false;
        box.classList.remove("X","O","win");
    });
}

// Buttons
resetBtn.addEventListener("click", resetGame);

newGameBtn.addEventListener("click", () => {
    resetGame();
    popup.classList.add("hide");
});