const walletAddress = "9uo3TB4a8synap9VMNpby6nzmnMs9xJWmgo2YKJHZWVn";
const heliusApiKey = "2e046356-0f0c-4880-93cc-6d5467e81c73";
const birdeyeApiKey = "f80a250b67bc411dadbadadd6ecd2cf2";
const goalUSD = 20000;

const mintToName = {
  "HBoNJ5v8g71s2boRivrHnfSB5MVPLDHHyVjruPfhGkvL": "PURPE",
  "2b1kV6DkPAnxd5ixfnxCpjxmKwqjjaYmCZfHsFu24GXo": "PYUSD",
};

const fallbackPrices = {
  "2b1kV6DkPAnxd5ixfnxCpjxmKwqjjaYmCZfHsFu24GXo": 1.00,
};

async function fetchSolPrice() {
  try {
    const res = await fetch("https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd");
    const data = await res.json();
    return data.solana?.usd || 0;
  } catch {
    return 0;
  }
}

async function fetchTokenPrice(mint) {
  if (fallbackPrices[mint]) return fallbackPrices[mint];

  try {
    const res = await fetch(`https://public-api.birdeye.so/public/price?address=${mint}`, {
      headers: { "X-API-KEY": birdeyeApiKey },
    });
    const data = await res.json();
    return data.data?.value || 0;
  } catch {
    return 0;
  }
}

async function fetchWalletBalance() {
  try {
    const res = await fetch(`https://api.helius.xyz/v0/addresses/${walletAddress}/balances?api-key=${heliusApiKey}`);
    const data = await res.json();

    const tokens = data.tokens || [];
    const lamports = data.nativeBalance || 0;
    const sol = lamports / 1_000_000_000;
    const solPrice = await fetchSolPrice();
    const solUSD = sol * solPrice;

    let totalUSD = solUSD;
    let breakdown = `SOL: $${solUSD.toFixed(2)}<br>`;

    for (const token of tokens) {
      const mint = token.mint;
      const name = mintToName[mint];
      const decimals = token.decimals || 6;
      const amount = token.amount / Math.pow(10, decimals);
      const price = await fetchTokenPrice(mint);
      const valueUSD = amount * price;

      if (name === "PURPE" || name === "PYUSD") {
        breakdown += `${name}: $${valueUSD.toFixed(2)}<br>`;
        totalUSD += valueUSD;
      }
    }

    const percent = Math.min((totalUSD / goalUSD) * 100, 100);
    document.getElementById("current-amount").textContent = `$${totalUSD.toFixed(2)}`;
    document.getElementById("progress-fill").style.width = `${percent}%`;

    const breakdownEl = document.getElementById("breakdown");
    if (breakdownEl) breakdownEl.innerHTML = breakdown;

    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const timestampEl = document.getElementById("last-updated");
    if (timestampEl) timestampEl.textContent = `Last updated: ${timeStr}`;
  } catch (err) {
    console.error("Error fetching wallet data:", err);
  }
}

fetchWalletBalance();
setInterval(fetchWalletBalance, 60000);
