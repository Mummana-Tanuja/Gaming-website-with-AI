const sampleData = [
  { date: "2026-01-03", region: "North", category: "Software", product: "Insight Pro", units: 18, revenue: 12600, profit: 4920 },
  { date: "2026-01-07", region: "West", category: "Hardware", product: "Edge Hub", units: 9, revenue: 8100, profit: 2210 },
  { date: "2026-01-13", region: "South", category: "Services", product: "Migration", units: 7, revenue: 9800, profit: 3820 },
  { date: "2026-01-19", region: "East", category: "Software", product: "MetricFlow", units: 21, revenue: 14700, profit: 5730 },
  { date: "2026-01-26", region: "Central", category: "Training", product: "Analytics Bootcamp", units: 12, revenue: 5400, profit: 2910 },
  { date: "2026-02-02", region: "North", category: "Hardware", product: "Sensor Kit", units: 15, revenue: 11250, profit: 3375 },
  { date: "2026-02-08", region: "West", category: "Software", product: "Insight Pro", units: 26, revenue: 18200, profit: 7460 },
  { date: "2026-02-14", region: "South", category: "Training", product: "Team Workshop", units: 8, revenue: 4000, profit: 2020 },
  { date: "2026-02-20", region: "East", category: "Services", product: "Audit", units: 10, revenue: 12500, profit: 4810 },
  { date: "2026-02-27", region: "Central", category: "Software", product: "MetricFlow", units: 17, revenue: 11900, profit: 4540 },
  { date: "2026-03-04", region: "North", category: "Services", product: "Optimization", units: 13, revenue: 16900, profit: 6760 },
  { date: "2026-03-11", region: "West", category: "Training", product: "Analytics Bootcamp", units: 11, revenue: 4950, profit: 2610 },
  { date: "2026-03-16", region: "South", category: "Hardware", product: "Edge Hub", units: 14, revenue: 12600, profit: 3520 },
  { date: "2026-03-22", region: "East", category: "Software", product: "Insight Pro", units: 32, revenue: 22400, profit: 9280 },
  { date: "2026-03-29", region: "Central", category: "Services", product: "Migration", units: 6, revenue: 8400, profit: 3150 },
  { date: "2026-04-03", region: "North", category: "Software", product: "MetricFlow", units: 24, revenue: 16800, profit: 6500 },
  { date: "2026-04-09", region: "West", category: "Hardware", product: "Sensor Kit", units: 19, revenue: 14250, profit: 4210 },
  { date: "2026-04-15", region: "South", category: "Services", product: "Optimization", units: 5, revenue: 6500, profit: 2380 },
  { date: "2026-04-21", region: "East", category: "Training", product: "Team Workshop", units: 15, revenue: 7500, profit: 3920 },
  { date: "2026-04-28", region: "Central", category: "Software", product: "Insight Pro", units: 44, revenue: 52800, profit: 21400 },
  { date: "2026-05-04", region: "North", category: "Hardware", product: "Edge Hub", units: 11, revenue: 9900, profit: 2880 },
  { date: "2026-05-10", region: "West", category: "Services", product: "Audit", units: 9, revenue: 11250, profit: 4320 },
  { date: "2026-05-12", region: "South", category: "Software", product: "MetricFlow", units: 23, revenue: 16100, profit: 6280 },
  { date: "2026-05-14", region: "East", category: "Hardware", product: "Sensor Kit", units: 17, revenue: 12750, profit: 3760 }
];

const state = {
  data: [...sampleData],
  sortKey: "date",
  sortDirection: "asc"
};

const els = {
  csvInput: document.querySelector("#csvInput"),
  resetData: document.querySelector("#resetData"),
  exportCsv: document.querySelector("#exportCsv"),
  startDate: document.querySelector("#startDate"),
  endDate: document.querySelector("#endDate"),
  categoryFilter: document.querySelector("#categoryFilter"),
  searchInput: document.querySelector("#searchInput"),
  trendMetric: document.querySelector("#trendMetric"),
  totalRevenue: document.querySelector("#totalRevenue"),
  revenueDelta: document.querySelector("#revenueDelta"),
  totalProfit: document.querySelector("#totalProfit"),
  marginValue: document.querySelector("#marginValue"),
  totalUnits: document.querySelector("#totalUnits"),
  avgOrderValue: document.querySelector("#avgOrderValue"),
  anomalyCount: document.querySelector("#anomalyCount"),
  forecastValue: document.querySelector("#forecastValue"),
  forecastText: document.querySelector("#forecastText"),
  recordCount: document.querySelector("#recordCount"),
  dataBody: document.querySelector("#dataBody"),
  pivotTable: document.querySelector("#pivotTable"),
  trendChart: document.querySelector("#trendChart"),
  categoryChart: document.querySelector("#categoryChart"),
  regionChart: document.querySelector("#regionChart")
};

const money = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0
});

const number = new Intl.NumberFormat("en-US");
const chartColors = ["#2563eb", "#16a34a", "#f59e0b", "#ef4444", "#7c3aed", "#0891b2"];

function init() {
  setDateBounds();
  populateCategoryFilter();
  bindEvents();
  render();
}

function bindEvents() {
  ["change", "input"].forEach((eventName) => {
    els.startDate.addEventListener(eventName, render);
    els.endDate.addEventListener(eventName, render);
    els.categoryFilter.addEventListener(eventName, render);
    els.searchInput.addEventListener(eventName, render);
    els.trendMetric.addEventListener(eventName, render);
  });

  els.resetData.addEventListener("click", () => {
    state.data = [...sampleData];
    state.sortKey = "date";
    state.sortDirection = "asc";
    setDateBounds();
    populateCategoryFilter();
    render();
  });

  els.exportCsv.addEventListener("click", exportFilteredData);
  els.csvInput.addEventListener("change", handleCsvUpload);

  document.querySelectorAll("th[data-sort]").forEach((header) => {
    header.addEventListener("click", () => {
      const key = header.dataset.sort;
      if (state.sortKey === key) {
        state.sortDirection = state.sortDirection === "asc" ? "desc" : "asc";
      } else {
        state.sortKey = key;
        state.sortDirection = "asc";
      }
      render();
    });
  });
}

function setDateBounds() {
  const dates = state.data.map((row) => row.date).sort();
  els.startDate.value = dates[0] || "";
  els.endDate.value = dates[dates.length - 1] || "";
}

function populateCategoryFilter() {
  const selected = els.categoryFilter.value;
  const categories = [...new Set(state.data.map((row) => row.category))].sort();
  els.categoryFilter.innerHTML = '<option value="all">All categories</option>';
  categories.forEach((category) => {
    const option = document.createElement("option");
    option.value = category;
    option.textContent = category;
    els.categoryFilter.appendChild(option);
  });
  els.categoryFilter.value = categories.includes(selected) ? selected : "all";
}

function getFilteredData() {
  const start = els.startDate.value;
  const end = els.endDate.value;
  const category = els.categoryFilter.value;
  const query = els.searchInput.value.trim().toLowerCase();

  return state.data
    .filter((row) => !start || row.date >= start)
    .filter((row) => !end || row.date <= end)
    .filter((row) => category === "all" || row.category === category)
    .filter((row) => {
      if (!query) return true;
      return [row.region, row.category, row.product].some((value) => String(value).toLowerCase().includes(query));
    })
    .sort((a, b) => {
      const aValue = a[state.sortKey];
      const bValue = b[state.sortKey];
      const direction = state.sortDirection === "asc" ? 1 : -1;
      return aValue > bValue ? direction : aValue < bValue ? -direction : 0;
    });
}

function render() {
  const filtered = getFilteredData();
  const anomalies = detectAnomalies(filtered);
  renderKpis(filtered, anomalies);
  renderTable(filtered, anomalies);
  renderPivot(filtered);
  renderForecast(filtered);
  drawLineChart(els.trendChart, groupByDate(filtered, els.trendMetric.value), els.trendMetric.value);
  drawDonutChart(els.categoryChart, groupSum(filtered, "category", "revenue"));
  drawBarChart(els.regionChart, groupSum(filtered, "region", "revenue"));
}

function renderKpis(rows, anomalies) {
  const revenue = sum(rows, "revenue");
  const profit = sum(rows, "profit");
  const units = sum(rows, "units");
  const margin = revenue ? (profit / revenue) * 100 : 0;
  const avgOrder = rows.length ? revenue / rows.length : 0;
  const delta = calculatePreviousPeriodDelta(rows);

  els.totalRevenue.textContent = money.format(revenue);
  els.totalProfit.textContent = money.format(profit);
  els.totalUnits.textContent = number.format(units);
  els.marginValue.textContent = `${margin.toFixed(1)}% margin`;
  els.avgOrderValue.textContent = `${money.format(avgOrder)} average order`;
  els.revenueDelta.textContent = `${delta >= 0 ? "+" : ""}${delta.toFixed(1)}% vs previous period`;
  els.revenueDelta.style.color = delta >= 0 ? "var(--green)" : "var(--red)";
  els.anomalyCount.textContent = anomalies.size;
}

function renderTable(rows, anomalies) {
  els.recordCount.textContent = `${rows.length} row${rows.length === 1 ? "" : "s"}`;
  els.dataBody.innerHTML = "";

  if (!rows.length) {
    els.dataBody.innerHTML = '<tr><td class="empty-state" colspan="7">No records match the current filters.</td></tr>';
    return;
  }

  rows.forEach((row) => {
    const tr = document.createElement("tr");
    if (anomalies.has(row)) tr.className = "anomaly-row";
    tr.innerHTML = `
      <td>${row.date}</td>
      <td>${row.region}</td>
      <td>${row.category}</td>
      <td>${row.product}</td>
      <td>${number.format(row.units)}</td>
      <td>${money.format(row.revenue)}</td>
      <td>${money.format(row.profit)}</td>
    `;
    els.dataBody.appendChild(tr);
  });
}

function renderPivot(rows) {
  const categories = [...new Set(rows.map((row) => row.category))].sort();
  const regions = [...new Set(rows.map((row) => row.region))].sort();

  if (!rows.length) {
    els.pivotTable.innerHTML = '<div class="empty-state">No pivot data available.</div>';
    return;
  }

  let html = "<table><thead><tr><th>Category</th>";
  regions.forEach((region) => {
    html += `<th>${region}</th>`;
  });
  html += "<th>Total</th></tr></thead><tbody>";

  categories.forEach((category) => {
    let rowTotal = 0;
    html += `<tr><td>${category}</td>`;
    regions.forEach((region) => {
      const value = rows
        .filter((row) => row.category === category && row.region === region)
        .reduce((total, row) => total + row.revenue, 0);
      rowTotal += value;
      html += `<td>${money.format(value)}</td>`;
    });
    html += `<td><strong>${money.format(rowTotal)}</strong></td></tr>`;
  });

  html += "</tbody></table>";
  els.pivotTable.innerHTML = html;
}

function renderForecast(rows) {
  const points = groupByDate(rows, "revenue");
  if (points.length < 2) {
    els.forecastValue.textContent = money.format(sum(rows, "revenue"));
    els.forecastText.textContent = "Add more records to improve the forecast.";
    return;
  }

  const recent = points.slice(-4);
  const averageChange = recent.slice(1).reduce((total, point, index) => total + (point.value - recent[index].value), 0) / Math.max(recent.length - 1, 1);
  const forecast = Math.max(0, recent[recent.length - 1].value + averageChange);
  const direction = averageChange >= 0 ? "upward" : "downward";
  els.forecastValue.textContent = money.format(forecast);
  els.forecastText.textContent = `Simple moving trend points ${direction} by ${money.format(Math.abs(averageChange))} next period.`;
}

function calculatePreviousPeriodDelta(rows) {
  if (rows.length < 2) return 0;
  const sorted = [...rows].sort((a, b) => a.date.localeCompare(b.date));
  const midpoint = Math.floor(sorted.length / 2);
  const previous = sum(sorted.slice(0, midpoint), "revenue");
  const current = sum(sorted.slice(midpoint), "revenue");
  return previous ? ((current - previous) / previous) * 100 : 0;
}

function detectAnomalies(rows) {
  if (rows.length < 4) return new Set();
  const values = rows.map((row) => row.revenue);
  const mean = values.reduce((total, value) => total + value, 0) / values.length;
  const variance = values.reduce((total, value) => total + Math.pow(value - mean, 2), 0) / values.length;
  const standardDeviation = Math.sqrt(variance);
  return new Set(rows.filter((row) => Math.abs(row.revenue - mean) > standardDeviation * 1.6));
}

function groupByDate(rows, metric) {
  const grouped = new Map();
  rows.forEach((row) => grouped.set(row.date, (grouped.get(row.date) || 0) + row[metric]));
  return [...grouped.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([label, value]) => ({ label, value }));
}

function groupSum(rows, key, metric) {
  const grouped = new Map();
  rows.forEach((row) => grouped.set(row[key], (grouped.get(row[key]) || 0) + row[metric]));
  return [...grouped.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([label, value]) => ({ label, value }));
}

function sum(rows, key) {
  return rows.reduce((total, row) => total + Number(row[key] || 0), 0);
}

function drawLineChart(canvas, points, metric) {
  const ctx = setupCanvas(canvas);
  const { width, height } = canvas.getBoundingClientRect();
  const padding = 42;
  const max = Math.max(...points.map((point) => point.value), 1);
  const min = Math.min(...points.map((point) => point.value), 0);
  const range = max - min || 1;

  clearChart(ctx, width, height);
  drawGrid(ctx, width, height, padding);

  if (!points.length) return;

  ctx.strokeStyle = "#2563eb";
  ctx.lineWidth = 3;
  ctx.beginPath();

  points.forEach((point, index) => {
    const x = padding + (index / Math.max(points.length - 1, 1)) * (width - padding * 1.5);
    const y = height - padding - ((point.value - min) / range) * (height - padding * 1.6);
    if (index === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  });

  ctx.stroke();
  ctx.fillStyle = "#172033";
  ctx.font = "700 12px Inter, sans-serif";
  ctx.fillText(`${metric.toUpperCase()} ${formatCompact(max)}`, padding, 22);

  points.forEach((point, index) => {
    const x = padding + (index / Math.max(points.length - 1, 1)) * (width - padding * 1.5);
    const y = height - padding - ((point.value - min) / range) * (height - padding * 1.6);
    ctx.fillStyle = "#2563eb";
    ctx.beginPath();
    ctx.arc(x, y, 4, 0, Math.PI * 2);
    ctx.fill();
  });
}

function drawDonutChart(canvas, data) {
  const ctx = setupCanvas(canvas);
  const { width, height } = canvas.getBoundingClientRect();
  clearChart(ctx, width, height);
  if (!data.length) return;

  const total = data.reduce((acc, item) => acc + item.value, 0);
  const radius = Math.min(width, height) * 0.28;
  const cx = width * 0.38;
  const cy = height * 0.48;
  let start = -Math.PI / 2;

  data.forEach((item, index) => {
    const slice = (item.value / total) * Math.PI * 2;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, radius, start, start + slice);
    ctx.closePath();
    ctx.fillStyle = chartColors[index % chartColors.length];
    ctx.fill();
    start += slice;
  });

  ctx.globalCompositeOperation = "destination-out";
  ctx.beginPath();
  ctx.arc(cx, cy, radius * 0.55, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalCompositeOperation = "source-over";

  drawLegend(ctx, data, width * 0.68, 42);
}

function drawBarChart(canvas, data) {
  const ctx = setupCanvas(canvas);
  const { width, height } = canvas.getBoundingClientRect();
  const padding = 42;
  clearChart(ctx, width, height);
  drawGrid(ctx, width, height, padding);
  if (!data.length) return;

  const top = data.slice(0, 5);
  const max = Math.max(...top.map((item) => item.value), 1);
  const barWidth = (width - padding * 2) / top.length - 12;

  top.forEach((item, index) => {
    const barHeight = (item.value / max) * (height - padding * 2);
    const x = padding + index * (barWidth + 12);
    const y = height - padding - barHeight;
    ctx.fillStyle = chartColors[index % chartColors.length];
    ctx.fillRect(x, y, barWidth, barHeight);
    ctx.fillStyle = "#687386";
    ctx.font = "700 11px Inter, sans-serif";
    ctx.fillText(item.label.slice(0, 8), x, height - 16);
  });
}

function setupCanvas(canvas) {
  const rect = canvas.getBoundingClientRect();
  const ratio = window.devicePixelRatio || 1;
  canvas.width = Math.max(1, rect.width * ratio);
  canvas.height = Math.max(1, rect.height * ratio);
  const ctx = canvas.getContext("2d");
  ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
  return ctx;
}

function clearChart(ctx, width, height) {
  ctx.clearRect(0, 0, width, height);
}

function drawGrid(ctx, width, height, padding) {
  ctx.strokeStyle = "#e8eef7";
  ctx.lineWidth = 1;
  for (let i = 0; i < 4; i += 1) {
    const y = padding + i * ((height - padding * 2) / 3);
    ctx.beginPath();
    ctx.moveTo(padding, y);
    ctx.lineTo(width - padding / 2, y);
    ctx.stroke();
  }
}

function drawLegend(ctx, data, x, y) {
  ctx.font = "700 12px Inter, sans-serif";
  data.slice(0, 6).forEach((item, index) => {
    const rowY = y + index * 24;
    ctx.fillStyle = chartColors[index % chartColors.length];
    ctx.fillRect(x, rowY - 10, 12, 12);
    ctx.fillStyle = "#172033";
    ctx.fillText(`${item.label} ${formatCompact(item.value)}`, x + 18, rowY);
  });
}

function formatCompact(value) {
  return Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: 1
  }).format(value);
}

function handleCsvUpload(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = () => {
    const parsed = parseCsv(reader.result);
    if (!parsed.length) {
      alert("No valid rows found. Required columns: date, region, category, product, units, revenue, profit.");
      return;
    }
    state.data = parsed;
    setDateBounds();
    populateCategoryFilter();
    render();
  };
  reader.readAsText(file);
}

function parseCsv(text) {
  const lines = text.trim().split(/\r?\n/).filter(Boolean);
  if (lines.length < 2) return [];
  const headers = splitCsvLine(lines[0]).map((header) => header.trim().toLowerCase());
  const required = ["date", "region", "category", "product", "units", "revenue", "profit"];
  if (!required.every((key) => headers.includes(key))) return [];

  return lines.slice(1).map((line) => {
    const cells = splitCsvLine(line);
    const row = Object.fromEntries(headers.map((header, index) => [header, cells[index] || ""]));
    return {
      date: normalizeDate(row.date),
      region: row.region.trim(),
      category: row.category.trim(),
      product: row.product.trim(),
      units: Number(row.units),
      revenue: Number(row.revenue),
      profit: Number(row.profit)
    };
  }).filter((row) => row.date && row.region && row.category && row.product && Number.isFinite(row.units) && Number.isFinite(row.revenue) && Number.isFinite(row.profit));
}

function splitCsvLine(line) {
  const cells = [];
  let cell = "";
  let insideQuotes = false;

  for (const char of line) {
    if (char === '"') {
      insideQuotes = !insideQuotes;
    } else if (char === "," && !insideQuotes) {
      cells.push(cell);
      cell = "";
    } else {
      cell += char;
    }
  }
  cells.push(cell);
  return cells.map((value) => value.trim());
}

function normalizeDate(value) {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "";
  return parsed.toISOString().slice(0, 10);
}

function exportFilteredData() {
  const rows = getFilteredData();
  const headers = ["date", "region", "category", "product", "units", "revenue", "profit"];
  const csv = [
    headers.join(","),
    ...rows.map((row) => headers.map((key) => `"${String(row[key]).replaceAll('"', '""')}"`).join(","))
  ].join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "filtered-analytics-data.csv";
  link.click();
  URL.revokeObjectURL(url);
}

window.addEventListener("resize", render);
init();
