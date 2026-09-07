const stocks = [
  ["NVDA", "NVIDIA Corp.", "Technology", 126.4, 84, "Strong Buy"],
  ["AAPL", "Apple Inc.", "Technology", 229.1, 76, "Buy"],
  ["MSFT", "Microsoft Corp.", "Technology", 418.5, 81, "Buy"],
  ["GOOGL", "Alphabet Inc.", "Communication", 182.2, 73, "Buy"],
  ["AMZN", "Amazon.com Inc.", "Consumer", 187.9, 78, "Buy"],
  ["META", "Meta Platforms", "Communication", 521.6, 79, "Buy"],
  ["TSLA", "Tesla Inc.", "Consumer", 241.7, 64, "Hold"],
  ["AMD", "Advanced Micro Devices", "Technology", 151.2, 72, "Buy"],
  ["AVGO", "Broadcom Inc.", "Technology", 172.5, 82, "Strong Buy"],
  ["JPM", "JPMorgan Chase", "Financials", 219.3, 69, "Hold"],
  ["V", "Visa Inc.", "Financials", 283.7, 75, "Buy"],
  ["MA", "Mastercard Inc.", "Financials", 491.2, 74, "Buy"],
  ["LLY", "Eli Lilly", "Healthcare", 905.4, 80, "Buy"],
  ["UNH", "UnitedHealth Group", "Healthcare", 587.8, 71, "Buy"],
  ["XOM", "Exxon Mobil", "Energy", 116.2, 58, "Hold"],
  ["COST", "Costco Wholesale", "Consumer", 892.1, 77, "Buy"],
  ["WMT", "Walmart Inc.", "Consumer", 77.8, 70, "Hold"],
  ["NFLX", "Netflix Inc.", "Communication", 689.4, 67, "Hold"],
  ["CRM", "Salesforce Inc.", "Technology", 264.9, 66, "Hold"],
  ["ORCL", "Oracle Corp.", "Technology", 142.8, 71, "Buy"],
  ["PANW", "Palo Alto Networks", "Technology", 351.6, 79, "Buy"],
  ["ADBE", "Adobe Inc.", "Technology", 553.2, 65, "Hold"],
  ["QCOM", "Qualcomm Inc.", "Technology", 169.8, 68, "Hold"],
  ["INTC", "Intel Corp.", "Technology", 31.2, 45, "Watch"],
  ["SHOP", "Shopify Inc.", "Technology", 78.4, 63, "Hold"],
  ["DIS", "Walt Disney Co.", "Communication", 96.2, 59, "Watch"],
  ["BA", "Boeing Co.", "Industrials", 178.6, 52, "Watch"],
  ["GE", "GE Aerospace", "Industrials", 169.1, 72, "Buy"],
  ["CAT", "Caterpillar Inc.", "Industrials", 347.6, 62, "Hold"],
  ["NEE", "NextEra Energy", "Utilities", 74.4, 61, "Hold"],
  ["PLTR", "Palantir Technologies", "Technology", 31.7, 70, "Buy"],
  ["SMCI", "Super Micro Computer", "Technology", 768.9, 60, "Watch"],
  ["MSTR", "MicroStrategy", "Technology", 138.3, 57, "Speculative"],
  ["COIN", "Coinbase Global", "Financials", 219.8, 56, "Speculative"],
  ["UBER", "Uber Technologies", "Technology", 72.5, 69, "Buy"],
  ["ABNB", "Airbnb Inc.", "Consumer", 132.1, 55, "Watch"]
].map(([ticker, name, sector, price, score, signal], index) => ({
  ticker,
  name,
  sector,
  price,
  score,
  signal,
  marketCap: index < 16 ? "Mega Cap" : index < 28 ? "Large Cap" : "Growth",
  volatility: 18 + ((index * 7) % 29),
  momentum: 42 + ((score + index * 3) % 55),
  quality: 45 + ((score + index * 5) % 50)
}));

const extraTickers = "ABBV ACN AEP AFL ALB AMAT AMGN ANET AON APD ARM ASML AXP BKNG BLK BMY BX C CARR CDNS CEG CI CL CMCSA COP CRWD CSCO CVS DELL DE DHR DUK ELV ETN F FDX FI GILD GM GS HD HON IBM ISRG KO LIN LOW LRCX LULU MAR MCD MDT MELI MMM MO MRK MU NKE NOW NVO PEP PFE PG PYPL REGN RTX SBUX SCHW SNOW SO SPGI T TGT TJX TMO TXN UPS VZ ZS".split(" ");
extraTickers.forEach((ticker, i) => {
  const sectors = ["Technology", "Healthcare", "Financials", "Consumer", "Industrials", "Energy", "Utilities", "Communication"];
  stocks.push({
    ticker,
    name: `${ticker} Holdings`,
    sector: sectors[i % sectors.length],
    price: Number((28 + ((i * 19) % 420) + ((i % 7) * 0.37)).toFixed(2)),
    score: 44 + ((i * 11) % 43),
    signal: ["Buy", "Hold", "Watch", "Buy", "Hold"][i % 5],
    marketCap: i % 3 === 0 ? "Large Cap" : "Mid Cap",
    volatility: 16 + ((i * 5) % 32),
    momentum: 38 + ((i * 9) % 58),
    quality: 40 + ((i * 13) % 56)
  });
});

const officialUniverseSources = [
  {
    url: "https://www.nasdaqtrader.com/dynamic/SymDir/nasdaqlisted.txt",
    type: "nasdaq"
  },
  {
    url: "https://www.nasdaqtrader.com/dynamic/SymDir/otherlisted.txt",
    type: "other"
  }
];

let selected = stocks[0];
const watchlist = new Set(["NVDA", "MSFT", "AVGO"]);

const $ = (id) => document.getElementById(id);
const formatCurrency = (value) => `$${value.toFixed(2)}`;

function stableNumber(text, min, max) {
  let hash = 0;
  for (let i = 0; i < text.length; i += 1) {
    hash = (hash * 31 + text.charCodeAt(i)) >>> 0;
  }
  return min + (hash % (max - min + 1));
}

function cleanSecurityName(name) {
  return name
    .replace(/\s+-\s+(Common Stock|Class A Common Stock|Class B Common Stock|Ordinary Shares|American Depositary Shares).*$/i, "")
    .replace(/\s+/g, " ")
    .trim();
}

function exchangeLabel(code, sourceType) {
  const labels = {
    Q: "Nasdaq Global Select",
    G: "Nasdaq Global Market",
    S: "Nasdaq Capital Market",
    N: "NYSE",
    A: "NYSE American",
    P: "NYSE Arca",
    Z: "Cboe BZX",
    V: "IEX"
  };
  return labels[code] || (sourceType === "nasdaq" ? "Nasdaq" : "U.S. Listed");
}

function signalFromScore(score) {
  if (score >= 80) return "Strong Buy";
  if (score >= 68) return "Buy";
  if (score >= 54) return "Hold";
  if (score >= 44) return "Watch";
  return "Speculative";
}

function createSyntheticStock(symbol, name, exchange, sourceType, index, isEtf) {
  const score = stableNumber(`${symbol}:${name}:score`, 38, 90);
  const price = Number((8 + stableNumber(`${symbol}:price`, 0, 460) + stableNumber(name, 0, 99) / 100).toFixed(2));
  return {
    ticker: symbol,
    name: cleanSecurityName(name) || name,
    sector: isEtf ? "ETF / Fund" : exchangeLabel(exchange, sourceType),
    price,
    score,
    signal: signalFromScore(score),
    marketCap: sourceType === "nasdaq" ? "Nasdaq Listed" : exchangeLabel(exchange, sourceType),
    volatility: stableNumber(`${symbol}:vol`, 14, 48),
    momentum: stableNumber(`${symbol}:mom`, 35, 96),
    quality: stableNumber(`${symbol}:quality`, 36, 95),
    source: "Official symbol directory",
    rank: index
  };
}

function parseSymbolDirectory(text, sourceType) {
  const lines = text.split(/\r?\n/).filter(Boolean);
  const header = lines.shift();
  if (!header || !header.includes("|")) return [];
  const fields = header.split("|");
  const rows = [];
  for (const line of lines) {
    if (line.startsWith("File Creation Time")) continue;
    const parts = line.split("|");
    const record = Object.fromEntries(fields.map((field, index) => [field, parts[index] || ""]));
    const symbol = (record.Symbol || record["ACT Symbol"] || "").trim();
    const name = (record["Security Name"] || "").trim();
    const testIssue = (record["Test Issue"] || "").trim();
    if (!symbol || !name || testIssue === "Y") continue;
    rows.push(createSyntheticStock(
      symbol,
      name,
      record["Market Category"] || record.Exchange || "",
      sourceType,
      rows.length,
      record.ETF === "Y"
    ));
  }
  return rows;
}

async function loadOfficialUniverse() {
  const status = $("universeStatus");
  if (status) status.textContent = "Loading the full listed-market symbol directory...";
  const results = await Promise.allSettled(officialUniverseSources.map(async (source) => {
    const response = await fetch(source.url, { cache: "no-store" });
    if (!response.ok) throw new Error(`Unable to load ${source.url}`);
    return parseSymbolDirectory(await response.text(), source.type);
  }));
  const officialStocks = results.flatMap((result) => result.status === "fulfilled" ? result.value : []);
  if (!officialStocks.length) {
    if (status) status.textContent = `Full directory blocked by browser security; showing ${stocks.length} built-in symbols.`;
    return;
  }
  const featured = new Map(stocks.map((stock) => [stock.ticker, stock]));
  for (const stock of officialStocks) {
    if (!featured.has(stock.ticker)) featured.set(stock.ticker, stock);
  }
  stocks.splice(0, stocks.length, ...Array.from(featured.values()).sort((a, b) => a.ticker.localeCompare(b.ticker)));
  selected = stocks.find((stock) => stock.ticker === selected.ticker) || stocks[0];
  if (status) status.textContent = `Loaded ${stocks.length.toLocaleString()} listed securities from Nasdaq Trader symbol directories.`;
  renderSectorFilter();
  renderAll();
}

function forecastFor(stock) {
  const upside = ((stock.score - 50) / 4) + ((stock.momentum - 60) / 12) - (stock.volatility / 85);
  const forecast = stock.price * (1 + upside / 100);
  return { upside, forecast };
}

function renderPopularTickers() {
  const container = $("popularTickers");
  container.innerHTML = stocks.slice(0, 18).map((stock) => (
    `<button class="ticker-chip ${stock.ticker === selected.ticker ? "active" : ""}" type="button" data-ticker="${stock.ticker}">${stock.ticker}</button>`
  )).join("");
}

function renderPrediction() {
  const { upside, forecast } = forecastFor(selected);
  const confidence = Math.min(96, Math.max(38, Math.round(selected.score + selected.quality / 8 - selected.volatility / 10)));
  $("stockName").textContent = selected.name;
  $("stockMeta").textContent = `${selected.ticker} • ${selected.sector} • ${selected.marketCap}`;
  $("priceValue").textContent = formatCurrency(selected.price);
  $("forecastValue").textContent = formatCurrency(forecast);
  $("upsideValue").textContent = `${upside >= 0 ? "+" : ""}${upside.toFixed(1)}%`;
  $("upsideValue").className = upside >= 0 ? "positive" : "negative";
  $("confidenceValue").textContent = `${confidence}%`;
  $("heroConfidence").textContent = `${confidence}%`;
  $("ratingBadge").textContent = selected.signal;
  $("ratingBadge").style.color = selected.signal.includes("Buy") ? "var(--green)" : selected.signal === "Watch" ? "var(--gold)" : "var(--teal)";
  renderSignals(confidence);
  renderBrief(upside, confidence);
  drawChart();
  renderPopularTickers();
}

function renderSignals(confidence) {
  const signals = [
    ["Momentum", `${selected.momentum}/100`, selected.momentum > 70 ? "positive" : ""],
    ["Quality", `${selected.quality}/100`, selected.quality > 70 ? "positive" : ""],
    ["Volatility", `${selected.volatility}%`, selected.volatility > 34 ? "negative" : "positive"],
    ["Sentiment", confidence > 70 ? "Constructive" : "Mixed", ""],
    ["Liquidity", selected.marketCap.includes("Mega") ? "Institutional" : "Healthy", ""],
    ["Risk Grade", selected.volatility > 38 ? "Elevated" : "Balanced", selected.volatility > 38 ? "negative" : "positive"]
  ];
  $("signalGrid").innerHTML = signals.map(([label, value, tone]) => (
    `<div class="signal"><span>${label}</span><strong class="${tone}">${value}</strong></div>`
  )).join("");
}

function drawChart() {
  const canvas = $("forecastChart");
  const ctx = canvas.getContext("2d");
  const w = canvas.width;
  const h = canvas.height;
  ctx.clearRect(0, 0, w, h);
  const points = Array.from({ length: 34 }, (_, i) => {
    const drift = (selected.score - 58) * i * 0.03;
    const wave = Math.sin(i * 0.55 + selected.price) * selected.volatility * 0.22;
    return selected.price + drift + wave;
  });
  const min = Math.min(...points) * 0.985;
  const max = Math.max(...points) * 1.015;
  const x = (i) => 30 + (i / (points.length - 1)) * (w - 60);
  const y = (value) => h - 32 - ((value - min) / (max - min)) * (h - 64);

  ctx.lineWidth = 2;
  for (let i = 0; i < 5; i += 1) {
    ctx.strokeStyle = "rgba(255,255,255,0.08)";
    ctx.beginPath();
    ctx.moveTo(24, 32 + i * 58);
    ctx.lineTo(w - 24, 32 + i * 58);
    ctx.stroke();
  }

  const gradient = ctx.createLinearGradient(0, 0, w, 0);
  gradient.addColorStop(0, "#39d8d2");
  gradient.addColorStop(0.65, "#55e195");
  gradient.addColorStop(1, "#e8bd62");
  ctx.strokeStyle = gradient;
  ctx.lineWidth = 4;
  ctx.beginPath();
  points.forEach((point, i) => {
    if (i === 0) ctx.moveTo(x(i), y(point));
    else ctx.lineTo(x(i), y(point));
  });
  ctx.stroke();

  ctx.lineTo(x(points.length - 1), h - 30);
  ctx.lineTo(x(0), h - 30);
  ctx.closePath();
  const fill = ctx.createLinearGradient(0, 48, 0, h);
  fill.addColorStop(0, "rgba(57,216,210,0.22)");
  fill.addColorStop(1, "rgba(57,216,210,0)");
  ctx.fillStyle = fill;
  ctx.fill();
}

function renderBrief(upside, confidence) {
  const items = [
    ["Core view", `${selected.ticker} shows ${selected.signal.toLowerCase()} conditions with ${confidence}% model confidence and ${upside >= 0 ? "positive" : "limited"} forecast skew.`],
    ["Primary driver", selected.momentum > selected.quality ? "Momentum is currently the dominant signal, supported by trend strength." : "Quality and stability are contributing more than short-term momentum."],
    ["Risk note", selected.volatility > 36 ? "Position sizing should be conservative because volatility is elevated." : "Volatility is manageable compared with the broader growth universe."]
  ];
  $("decisionBrief").innerHTML = items.map(([title, text]) => `<div class="brief-item"><strong>${title}</strong><span>${text}</span></div>`).join("");
}

function renderNews() {
  const headlines = [
    ["AI infrastructure spending remains a key market theme", "Semiconductors, cloud platforms, and power demand stay in focus for institutional investors."],
    ["Large-cap technology leadership broadens", "Software, cybersecurity, and data-center suppliers show improving relative strength."],
    ["Rate expectations keep risk models active", "Financials and defensive sectors rotate as investors monitor inflation and growth data."],
    [`${selected.ticker} sentiment update`, `${selected.name} is being watched for momentum durability, earnings quality, and valuation discipline.`]
  ];
  $("newsFeed").innerHTML = headlines.map(([title, text]) => `<div class="news-item"><strong>${title}</strong><span>${text}</span></div>`).join("");
}

function renderMarket() {
  const query = $("marketFilter").value.trim().toLowerCase();
  const sector = $("sectorFilter").value;
  const filtered = stocks.filter((stock) => {
    const matchesText = `${stock.ticker} ${stock.name}`.toLowerCase().includes(query);
    const matchesSector = sector === "All" || stock.sector === sector;
    return matchesText && matchesSector;
  }).slice(0, 250);
  $("marketRows").innerHTML = filtered.map((stock) => `
    <tr>
      <td><strong>${stock.ticker}</strong></td>
      <td>${stock.name}</td>
      <td>${stock.sector}</td>
      <td>${stock.signal}</td>
      <td>${stock.score}</td>
      <td><button class="watch-button" type="button" data-watch="${stock.ticker}">${watchlist.has(stock.ticker) ? "Watching" : "Watch"}</button></td>
    </tr>
  `).join("");
}

function renderSectorFilter() {
  const sectors = [...new Set(stocks.map((stock) => stock.sector))].sort();
  $("sectorFilter").innerHTML = `<option value="All">All sectors</option>${sectors.map((sector) => `<option value="${sector}">${sector}</option>`).join("")}`;
}

function renderWatchlist() {
  const watched = stocks.filter((stock) => watchlist.has(stock.ticker));
  $("watchlist").innerHTML = watched.length
    ? watched.map((stock) => {
      const { upside } = forecastFor(stock);
      return `<div class="watch-item"><strong>${stock.ticker} ${upside >= 0 ? "+" : ""}${upside.toFixed(1)}%</strong><span>${stock.name} • ${stock.signal} • Score ${stock.score}</span></div>`;
    }).join("")
    : `<div class="watch-item"><strong>No stocks watched yet</strong><span>Add tickers from the market universe to build a research list.</span></div>`;
}

function renderRisk() {
  const portfolio = Number($("portfolioValue").value) || 0;
  const riskPercent = Number($("riskPercent").value) || 0;
  const stopLoss = Number($("stopLoss").value) || 1;
  const capitalAtRisk = portfolio * (riskPercent / 100);
  const positionSize = capitalAtRisk / (stopLoss / 100);
  const shares = Math.floor(positionSize / selected.price);
  $("riskOutput").innerHTML = `
    <div><span>Capital at risk</span><strong>${formatCurrency(capitalAtRisk)}</strong></div>
    <div><span>Max position</span><strong>${formatCurrency(positionSize)}</strong></div>
    <div><span>Estimated shares</span><strong>${shares}</strong></div>
  `;
}

function analyzeTicker(value) {
  const lookup = value.trim().toUpperCase();
  const found = stocks.find((stock) => stock.ticker === lookup || stock.name.toUpperCase().includes(lookup));
  if (found) {
    selected = found;
    $("stockSearch").value = found.ticker;
    renderAll();
  }
}

function renderAll() {
  renderPrediction();
  renderNews();
  renderMarket();
  renderWatchlist();
  renderRisk();
}

document.addEventListener("click", (event) => {
  const tickerButton = event.target.closest("[data-ticker]");
  const watchButton = event.target.closest("[data-watch]");
  if (tickerButton) analyzeTicker(tickerButton.dataset.ticker);
  if (watchButton) {
    const ticker = watchButton.dataset.watch;
    if (watchlist.has(ticker)) watchlist.delete(ticker);
    else watchlist.add(ticker);
    renderMarket();
    renderWatchlist();
  }
});

$("analyzeButton").addEventListener("click", () => analyzeTicker($("stockSearch").value));
$("stockSearch").addEventListener("keydown", (event) => {
  if (event.key === "Enter") analyzeTicker(event.currentTarget.value);
});
$("marketFilter").addEventListener("input", renderMarket);
$("sectorFilter").addEventListener("change", renderMarket);
["portfolioValue", "riskPercent", "stopLoss"].forEach((id) => $(id).addEventListener("input", renderRisk));
$("themeToggle").addEventListener("click", () => document.body.classList.toggle("focus"));
window.addEventListener("resize", drawChart);

renderSectorFilter();
renderAll();
loadOfficialUniverse();
