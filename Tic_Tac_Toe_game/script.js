const cells = Array.from(document.querySelectorAll(".cell"));
const statusText = document.querySelector("#status");
const newRoundButton = document.querySelector("#new-round");
const resetGameButton = document.querySelector("#reset-game");
const scoreX = document.querySelector("#score-x");
const scoreO = document.querySelector("#score-o");
const scoreDraw = document.querySelector("#score-draw");

const winningLines = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
];

let board = Array(9).fill("");
let currentPlayer = "X";
let gameActive = true;
let scores = {
  X: 0,
  O: 0,
  draw: 0,
};

function updateStatus(message) {
  statusText.textContent = message;
}

function updateScores() {
  scoreX.textContent = scores.X;
  scoreO.textContent = scores.O;
  scoreDraw.textContent = scores.draw;
}

function findWinningLine() {
  return winningLines.find((line) => {
    const [a, b, c] = line;
    return board[a] && board[a] === board[b] && board[a] === board[c];
  });
}

function endGame(winningLine) {
  gameActive = false;
  cells.forEach((cell) => {
    cell.disabled = true;
  });

  if (winningLine) {
    winningLine.forEach((index) => cells[index].classList.add("winner"));
    scores[currentPlayer] += 1;
    updateStatus(`Player ${currentPlayer} wins!`);
  } else {
    scores.draw += 1;
    updateStatus("It's a draw!");
  }

  updateScores();
}

function handleCellClick(event) {
  const cell = event.currentTarget;
  const index = cells.indexOf(cell);

  if (!gameActive || board[index]) {
    return;
  }

  board[index] = currentPlayer;
  cell.textContent = currentPlayer;
  cell.classList.add(currentPlayer.toLowerCase());
  cell.disabled = true;

  const winningLine = findWinningLine();

  if (winningLine) {
    endGame(winningLine);
    return;
  }

  if (board.every(Boolean)) {
    endGame(null);
    return;
  }

  currentPlayer = currentPlayer === "X" ? "O" : "X";
  updateStatus(`Player ${currentPlayer}'s turn`);
}

function startNewRound() {
  board = Array(9).fill("");
  currentPlayer = "X";
  gameActive = true;
  updateStatus("Player X's turn");

  cells.forEach((cell) => {
    cell.textContent = "";
    cell.disabled = false;
    cell.className = "cell";
  });
}

function resetGame() {
  scores = {
    X: 0,
    O: 0,
    draw: 0,
  };
  updateScores();
  startNewRound();
}

cells.forEach((cell) => {
  cell.addEventListener("click", handleCellClick);
});

newRoundButton.addEventListener("click", startNewRound);
resetGameButton.addEventListener("click", resetGame);
