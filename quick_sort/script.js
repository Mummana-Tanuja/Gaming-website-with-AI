const arrayStage = document.getElementById("arrayStage");
const comparisonsEl = document.getElementById("comparisons");
const swapsEl = document.getElementById("swaps");
const stepsEl = document.getElementById("steps");
const playPauseBtn = document.getElementById("playPauseBtn");
const stepBtn = document.getElementById("stepBtn");
const resetBtn = document.getElementById("resetBtn");
const shuffleBtn = document.getElementById("shuffleBtn");
const loadArrayBtn = document.getElementById("loadArrayBtn");
const arrayInput = document.getElementById("arrayInput");
const inputError = document.getElementById("inputError");
const sizeSlider = document.getElementById("sizeSlider");
const sizeValue = document.getElementById("sizeValue");
const speedSlider = document.getElementById("speedSlider");
const speedValue = document.getElementById("speedValue");
const stepText = document.getElementById("stepText");
const pseudoCode = document.getElementById("pseudoCode");

const speedLabels = ["Very slow", "Slow", "Normal", "Fast", "Very fast"];
const speedDelays = [1200, 800, 480, 260, 120];

let values = [44, 18, 71, 9, 62, 31, 5, 88, 27, 53];
let initialValues = [...values];
let snapshots = [];
let snapshotIndex = 0;
let timerId = null;
let isPlaying = false;

function createRandomArray(size) {
  return Array.from({ length: size }, () => Math.floor(Math.random() * 91) + 9);
}

function parseArrayInput(text) {
  const parsed = text
    .split(/[\s,]+/)
    .map((item) => item.trim())
    .filter(Boolean)
    .map(Number);

  if (parsed.length < 2) {
    throw new Error("Enter at least two numbers.");
  }

  if (parsed.length > 28) {
    throw new Error("Use 28 numbers or fewer so the bars remain readable.");
  }

  if (parsed.some((value) => !Number.isFinite(value) || value < 1 || value > 999)) {
    throw new Error("Use numbers from 1 to 999 only.");
  }

  return parsed.map((value) => Math.round(value));
}

function generateSnapshots(sourceValues) {
  const working = [...sourceValues];
  const generated = [];
  const sorted = new Set();
  let comparisons = 0;
  let swaps = 0;

  function pushSnapshot(message, extras = {}) {
    generated.push({
      values: [...working],
      sorted: new Set(sorted),
      comparisons,
      swaps,
      message,
      ...extras,
    });
  }

  function swap(i, j) {
    if (i === j) return;
    [working[i], working[j]] = [working[j], working[i]];
    swaps += 1;
  }

  function partition(low, high) {
    const pivot = working[high];
    let i = low - 1;

    pushSnapshot(`Partitioning indexes ${low} through ${high}. Pivot is ${pivot}.`, {
      activeRange: [low, high],
      pivotIndex: high,
      line: 1,
    });

    for (let j = low; j < high; j += 1) {
      comparisons += 1;
      pushSnapshot(`Compare ${working[j]} with pivot ${pivot}.`, {
        activeRange: [low, high],
        comparing: [j, high],
        pivotIndex: high,
        line: 6,
      });

      if (working[j] <= pivot) {
        i += 1;
        swap(i, j);
        pushSnapshot(`${working[i]} belongs before the pivot, so it moves into the left partition.`, {
          activeRange: [low, high],
          comparing: [i, j],
          pivotIndex: high,
          line: 7,
        });
      }
    }

    swap(i + 1, high);
    sorted.add(i + 1);
    pushSnapshot(`Pivot ${working[i + 1]} is placed at its final index ${i + 1}.`, {
      activeRange: [low, high],
      comparing: [i + 1, high],
      pivotIndex: i + 1,
      line: 8,
    });

    return i + 1;
  }

  function quickSort(low, high) {
    pushSnapshot(`quickSort(${low}, ${high})`, {
      activeRange: low <= high ? [low, high] : null,
      line: 0,
    });

    if (low < high) {
      const pivotIndex = partition(low, high);
      quickSort(low, pivotIndex - 1);
      quickSort(pivotIndex + 1, high);
    } else if (low === high) {
      sorted.add(low);
      pushSnapshot(`${working[low]} is a single-item partition, so it is sorted.`, {
        activeRange: [low, high],
        pivotIndex: low,
        line: 1,
      });
    }
  }

  pushSnapshot("Starting quick sort.", { line: 0 });
  quickSort(0, working.length - 1);
  working.forEach((_, index) => sorted.add(index));
  pushSnapshot("Sorting complete. Every value is in ascending order.", { line: 3 });
  return generated;
}

function render(snapshot) {
  const maxValue = Math.max(...snapshot.values, 1);
  const activeRange = snapshot.activeRange;
  const comparing = new Set(snapshot.comparing || []);
  const sorted = snapshot.sorted || new Set();

  arrayStage.innerHTML = "";

  snapshot.values.forEach((value, index) => {
    const wrap = document.createElement("div");
    wrap.className = "bar-wrap";

    const bar = document.createElement("div");
    bar.className = "bar";
    bar.style.height = `${Math.max(8, (value / maxValue) * 100)}%`;
    bar.textContent = value;
    bar.title = `Index ${index}: ${value}`;

    if (activeRange && index >= activeRange[0] && index <= activeRange[1]) {
      bar.classList.add("active-range");
    }
    if (comparing.has(index)) {
      bar.classList.add("comparing");
    }
    if (index === snapshot.pivotIndex) {
      bar.classList.add("pivot");
    }
    if (sorted.has(index)) {
      bar.classList.add("sorted");
    }

    const label = document.createElement("span");
    label.className = "index-label";
    label.textContent = index;

    wrap.append(bar, label);
    arrayStage.appendChild(wrap);
  });

  comparisonsEl.textContent = snapshot.comparisons;
  swapsEl.textContent = snapshot.swaps;
  stepsEl.textContent = `${snapshotIndex + 1}/${snapshots.length}`;
  stepText.textContent = snapshot.message;
  renderPseudoCode(snapshot.line);
  stepBtn.disabled = snapshotIndex >= snapshots.length - 1;
}

function renderPseudoCode(activeLine) {
  const lines = [
    "quickSort(low, high)",
    "  if low < high",
    "    pivotIndex = partition(low, high)",
    "    quickSort(low, pivotIndex - 1)",
    "    quickSort(pivotIndex + 1, high)",
    "partition(low, high)",
    "  compare each value with pivot",
    "  move smaller values left",
    "  place pivot in final position",
  ];

  pseudoCode.innerHTML = `<code>${lines
    .map((line, index) => {
      const safeLine = line.replaceAll("<", "&lt;").replaceAll(">", "&gt;");
      return index === activeLine ? `<span class="line-hit">${safeLine}</span>` : safeLine;
    })
    .join("\n")}</code>`;
}

function rebuildSnapshots(nextValues) {
  stopPlayback();
  values = [...nextValues];
  initialValues = [...nextValues];
  snapshots = generateSnapshots(values);
  snapshotIndex = 0;
  render(snapshots[snapshotIndex]);
}

function nextStep() {
  if (snapshotIndex < snapshots.length - 1) {
    snapshotIndex += 1;
    render(snapshots[snapshotIndex]);
    return true;
  }

  stopPlayback();
  return false;
}

function play() {
  if (snapshotIndex >= snapshots.length - 1) {
    snapshotIndex = 0;
    render(snapshots[snapshotIndex]);
  }

  isPlaying = true;
  playPauseBtn.textContent = "Pause";
  timerId = window.setInterval(nextStep, speedDelays[Number(speedSlider.value) - 1]);
}

function stopPlayback() {
  isPlaying = false;
  playPauseBtn.textContent = "Play";
  window.clearInterval(timerId);
  timerId = null;
}

playPauseBtn.addEventListener("click", () => {
  if (isPlaying) {
    stopPlayback();
  } else {
    play();
  }
});

stepBtn.addEventListener("click", () => {
  stopPlayback();
  nextStep();
});

resetBtn.addEventListener("click", () => {
  rebuildSnapshots(initialValues);
});

shuffleBtn.addEventListener("click", () => {
  const nextValues = createRandomArray(Number(sizeSlider.value));
  arrayInput.value = nextValues.join(", ");
  rebuildSnapshots(nextValues);
});

loadArrayBtn.addEventListener("click", () => {
  try {
    const nextValues = parseArrayInput(arrayInput.value);
    inputError.textContent = "";
    sizeSlider.value = String(Math.min(28, Math.max(6, nextValues.length)));
    sizeValue.textContent = nextValues.length;
    rebuildSnapshots(nextValues);
  } catch (error) {
    inputError.textContent = error.message;
  }
});

sizeSlider.addEventListener("input", () => {
  sizeValue.textContent = sizeSlider.value;
});

sizeSlider.addEventListener("change", () => {
  const nextValues = createRandomArray(Number(sizeSlider.value));
  arrayInput.value = nextValues.join(", ");
  rebuildSnapshots(nextValues);
});

speedSlider.addEventListener("input", () => {
  speedValue.textContent = speedLabels[Number(speedSlider.value) - 1];
  if (isPlaying) {
    stopPlayback();
    play();
  }
});

rebuildSnapshots(values);
