const boardEl = document.getElementById("board");
const statusEl = document.getElementById("status");
const timerEl = document.getElementById("timer");
const mistakesEl = document.getElementById("mistakes");
const difficultyEl = document.getElementById("difficulty");
const difficultyTitleEl = document.getElementById("difficulty-title");
const givensEl = document.getElementById("givens");
const notesBtn = document.getElementById("notes");

const difficultySettings = {
  easy: { clues: 42, label: "Easy" },
  medium: { clues: 36, label: "Medium" },
  hard: { clues: 30, label: "Hard" },
  expert: { clues: 24, label: "Expert" },
};

let puzzle = [];
let solution = [];
let player = [];
let notes = [];
let selectedIndex = null;
let notesMode = false;
let mistakes = 0;
let startTime = Date.now();
let timerId = null;
let gameOver = false;

function createEmptyGrid() {
  return Array.from({ length: 9 }, () => Array(9).fill(0));
}

function shuffle(items) {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function isValid(grid, row, col, value) {
  for (let i = 0; i < 9; i++) {
    if (grid[row][i] === value || grid[i][col] === value) return false;
  }

  const boxRow = Math.floor(row / 3) * 3;
  const boxCol = Math.floor(col / 3) * 3;
  for (let r = boxRow; r < boxRow + 3; r++) {
    for (let c = boxCol; c < boxCol + 3; c++) {
      if (grid[r][c] === value) return false;
    }
  }
  return true;
}

function fillGrid(grid) {
  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      if (grid[row][col] !== 0) continue;

      for (const value of shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9])) {
        if (isValid(grid, row, col, value)) {
          grid[row][col] = value;
          if (fillGrid(grid)) return true;
          grid[row][col] = 0;
        }
      }
      return false;
    }
  }
  return true;
}

function countSolutions(grid, limit = 2) {
  let count = 0;

  function solve() {
    if (count >= limit) return;

    let bestRow = -1;
    let bestCol = -1;
    let bestCandidates = null;

    for (let row = 0; row < 9; row++) {
      for (let col = 0; col < 9; col++) {
        if (grid[row][col] !== 0) continue;

        const candidates = [];
        for (let value = 1; value <= 9; value++) {
          if (isValid(grid, row, col, value)) candidates.push(value);
        }

        if (candidates.length === 0) return;
        if (!bestCandidates || candidates.length < bestCandidates.length) {
          bestCandidates = candidates;
          bestRow = row;
          bestCol = col;
        }
      }
    }

    if (!bestCandidates) {
      count++;
      return;
    }

    for (const value of bestCandidates) {
      grid[bestRow][bestCol] = value;
      solve();
      grid[bestRow][bestCol] = 0;
      if (count >= limit) return;
    }
  }

  solve();
  return count;
}

function generatePuzzle(clues) {
  const grid = createEmptyGrid();
  fillGrid(grid);
  const fullSolution = grid.map((row) => [...row]);
  const generated = grid.map((row) => [...row]);
  const cells = shuffle(Array.from({ length: 81 }, (_, index) => index));

  for (const index of cells) {
    const row = Math.floor(index / 9);
    const col = index % 9;
    const backup = generated[row][col];
    generated[row][col] = 0;

    const remainingClues = generated.flat().filter(Boolean).length;
    if (remainingClues < clues || countSolutions(generated.map((r) => [...r])) !== 1) {
      generated[row][col] = backup;
    }
  }

  return { puzzle: generated, solution: fullSolution };
}

function indexToCell(index) {
  return { row: Math.floor(index / 9), col: index % 9 };
}

function sameBox(a, b) {
  const cellA = indexToCell(a);
  const cellB = indexToCell(b);
  return Math.floor(cellA.row / 3) === Math.floor(cellB.row / 3)
    && Math.floor(cellA.col / 3) === Math.floor(cellB.col / 3);
}

function renderBoard() {
  boardEl.innerHTML = "";

  for (let index = 0; index < 81; index++) {
    const { row, col } = indexToCell(index);
    const cell = document.createElement("button");
    const value = player[row][col];
    const isGiven = puzzle[row][col] !== 0;

    cell.type = "button";
    cell.className = "cell";
    cell.dataset.index = index;
    cell.setAttribute("aria-label", `Row ${row + 1}, column ${col + 1}`);

    if (isGiven) cell.classList.add("given");
    if (selectedIndex === index) cell.classList.add("selected");
    if (selectedIndex !== null && index !== selectedIndex) {
      const selected = indexToCell(selectedIndex);
      if (selected.row === row || selected.col === col || sameBox(selectedIndex, index)) {
        cell.classList.add("related");
      }
    }

    const selectedValue = selectedIndex === null ? 0 : player[indexToCell(selectedIndex).row][indexToCell(selectedIndex).col];
    if (value && selectedValue && value === selectedValue) cell.classList.add("match");
    if (value && value !== solution[row][col] && !isGiven) cell.classList.add("wrong");

    if (value) {
      cell.textContent = value;
    } else if (notes[index].size > 0) {
      const grid = document.createElement("span");
      grid.className = "notes-grid";
      for (let n = 1; n <= 9; n++) {
        const note = document.createElement("span");
        note.className = "note";
        note.textContent = notes[index].has(n) ? n : "";
        grid.appendChild(note);
      }
      cell.appendChild(grid);
    }

    cell.addEventListener("click", () => selectCell(index));
    boardEl.appendChild(cell);
  }
}

function selectCell(index) {
  if (gameOver) return;
  selectedIndex = index;
  renderBoard();
}

function setStatus(message, isError = false) {
  statusEl.textContent = message;
  statusEl.classList.toggle("error", isError);
}

function placeNumber(value) {
  if (selectedIndex === null || gameOver) return;

  const { row, col } = indexToCell(selectedIndex);
  if (puzzle[row][col] !== 0) {
    setStatus("That number is part of the puzzle.", true);
    return;
  }

  if (notesMode) {
    if (player[row][col] !== 0) return;
    notes[selectedIndex].has(value) ? notes[selectedIndex].delete(value) : notes[selectedIndex].add(value);
    renderBoard();
    return;
  }

  player[row][col] = value;
  notes[selectedIndex].clear();
  clearMatchingNotes(row, col, value);

  if (value !== solution[row][col]) {
    mistakes++;
    mistakesEl.textContent = mistakes;
    setStatus("That entry conflicts with the generated solution.", true);
    if (mistakes >= 3) endGame(false);
  } else {
    setStatus("Nice. Keep going.");
    if (isComplete()) endGame(true);
  }

  renderBoard();
}

function clearMatchingNotes(row, col, value) {
  for (let i = 0; i < 81; i++) {
    const cell = indexToCell(i);
    if (cell.row === row || cell.col === col || sameBox(row * 9 + col, i)) {
      notes[i].delete(value);
    }
  }
}

function eraseCell() {
  if (selectedIndex === null || gameOver) return;
  const { row, col } = indexToCell(selectedIndex);
  if (puzzle[row][col] !== 0) return;
  player[row][col] = 0;
  notes[selectedIndex].clear();
  setStatus("Cell cleared.");
  renderBoard();
}

function giveHint() {
  if (gameOver) return;

  let index = selectedIndex;
  if (index !== null) {
    const { row, col } = indexToCell(index);
    if (puzzle[row][col] !== 0 || player[row][col] === solution[row][col]) index = null;
  }

  if (index === null) {
    const open = [];
    for (let i = 0; i < 81; i++) {
      const { row, col } = indexToCell(i);
      if (puzzle[row][col] === 0 && player[row][col] !== solution[row][col]) open.push(i);
    }
    if (open.length === 0) return;
    index = open[Math.floor(Math.random() * open.length)];
  }

  const { row, col } = indexToCell(index);
  selectedIndex = index;
  player[row][col] = solution[row][col];
  notes[index].clear();
  clearMatchingNotes(row, col, solution[row][col]);
  setStatus("Hint added.");
  renderBoard();
  if (isComplete()) endGame(true);
}

function checkBoard() {
  let empty = 0;
  let wrong = 0;

  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      if (player[row][col] === 0) empty++;
      if (player[row][col] && player[row][col] !== solution[row][col]) wrong++;
    }
  }

  if (wrong) setStatus(`${wrong} cell${wrong === 1 ? "" : "s"} need another look.`, true);
  else if (empty) setStatus(`${empty} empty cell${empty === 1 ? "" : "s"} remaining.`);
  else endGame(true);
}

function solveBoard() {
  player = solution.map((row) => [...row]);
  notes = Array.from({ length: 81 }, () => new Set());
  gameOver = true;
  clearInterval(timerId);
  setStatus("Puzzle solved for you.");
  renderBoard();
}

function isComplete() {
  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      if (player[row][col] !== solution[row][col]) return false;
    }
  }
  return true;
}

function endGame(won, message) {
  gameOver = true;
  clearInterval(timerId);
  setStatus(message || (won ? "Solved. Beautiful work." : "Game over. Start a new puzzle when ready."), !won);
}

function startTimer() {
  clearInterval(timerId);
  startTime = Date.now();
  timerId = setInterval(() => {
    const elapsed = Math.floor((Date.now() - startTime) / 1000);
    const minutes = String(Math.floor(elapsed / 60)).padStart(2, "0");
    const seconds = String(elapsed % 60).padStart(2, "0");
    timerEl.textContent = `${minutes}:${seconds}`;
  }, 1000);
  timerEl.textContent = "00:00";
}

function startNewGame() {
  setStatus("Generating a puzzle with a single solution...");
  gameOver = false;
  selectedIndex = null;
  mistakes = 0;
  mistakesEl.textContent = "0";
  notesMode = false;
  notesBtn.setAttribute("aria-pressed", "false");
  notesBtn.classList.remove("active");

  setTimeout(() => {
    const setting = difficultySettings[difficultyEl.value];
    const generated = generatePuzzle(setting.clues);
    puzzle = generated.puzzle;
    solution = generated.solution;
    player = puzzle.map((row) => [...row]);
    notes = Array.from({ length: 81 }, () => new Set());

    difficultyTitleEl.textContent = setting.label;
    const clues = puzzle.flat().filter(Boolean).length;
    givensEl.textContent = `${clues} clues, ${81 - clues} cells to solve. Every generated puzzle is checked for one solution.`;

    startTimer();
    setStatus("Choose a cell and fill the grid.");
    renderBoard();
  }, 25);
}

function restartPuzzle() {
  player = puzzle.map((row) => [...row]);
  notes = Array.from({ length: 81 }, () => new Set());
  selectedIndex = null;
  mistakes = 0;
  gameOver = false;
  mistakesEl.textContent = "0";
  startTimer();
  setStatus("Puzzle restarted.");
  renderBoard();
}

document.getElementById("new-game").addEventListener("click", startNewGame);
document.getElementById("restart").addEventListener("click", restartPuzzle);
document.getElementById("erase").addEventListener("click", eraseCell);
document.getElementById("hint").addEventListener("click", giveHint);
document.getElementById("check-board").addEventListener("click", checkBoard);
document.getElementById("solve").addEventListener("click", solveBoard);

notesBtn.addEventListener("click", () => {
  notesMode = !notesMode;
  notesBtn.setAttribute("aria-pressed", String(notesMode));
  notesBtn.classList.toggle("active", notesMode);
  setStatus(notesMode ? "Notes mode is on." : "Notes mode is off.");
});

document.querySelectorAll("[data-number]").forEach((button) => {
  button.addEventListener("click", () => placeNumber(Number(button.dataset.number)));
});

document.addEventListener("keydown", (event) => {
  if (/^[1-9]$/.test(event.key)) placeNumber(Number(event.key));
  if (event.key === "Backspace" || event.key === "Delete" || event.key === "0") eraseCell();
  if (event.key.toLowerCase() === "n") notesBtn.click();

  if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(event.key) && selectedIndex !== null) {
    event.preventDefault();
    const { row, col } = indexToCell(selectedIndex);
    const moves = {
      ArrowUp: Math.max(0, row - 1) * 9 + col,
      ArrowDown: Math.min(8, row + 1) * 9 + col,
      ArrowLeft: row * 9 + Math.max(0, col - 1),
      ArrowRight: row * 9 + Math.min(8, col + 1),
    };
    selectCell(moves[event.key]);
  }
});

startNewGame();
