const walletAddress = "9uo3TB4a8synap9VMNpby6nzmnMs9xJWmgo2YKJHZWVn";
const heliusApiKey = "2e046356-0f0c-4880-93cc-6d5467e81c73";
const goalUSD = 20000;

// Token Mapping
const tokenMap = {
  "So11111111111111111111111111111111111111112": "solana", // native SOL
  "5KdM72CGe2TqgccLZs1BdKx4445tXkrBrv9oa8s8T6pump": "PURPE", // Jupiter via mint
  "HBoNJ5v8g71s2boRivrHnfSB5MVPLDHHyVjruPfhGkvL": "PYUSD"  // Jupiter via mint
};

// Hole SOL Preis von CoinGecko
async function fetchSolPrice() {
  const res = await fetch("https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd");
  const data = await res.json();
  return data.solana?.usd || 0;
}

// Hole Preis eines Tokens über Jupiter (per mint-Adresse)
async function fetchJupiterPrice(mint) {
  try {
    const res = await fetch(`https://price.jup.ag/v4/price?ids=${mint}`);
    const data = await res.json();
    return data.data[mint]?.price || 0;
  } catch (err) {
    console.error("Jupiter API Fehler:", err);
    return 0;
  }
}

async function fetchWalletBalance() {
  try {
    // 1. Walletdaten laden
    const res = await fetch(`https://api.helius.xyz/v0/addresses/${walletAddress}/balances?api-key=${heliusApiKey}`);
    const data = await res.json();

    const tokens = data.tokens || [];
    const lamports = data.nativeBalance || 0;
    const sol = lamports / 1_000_000_000;

    // 2. Preis: SOL (CoinGecko)
    const solPrice = await fetchSolPrice();
    const solUSD = sol * solPrice;

    // 3. Preise: Tokens via Jupiter
    let purpeUSD = 0;
    let pyusdUSD = 0;

    for (const token of tokens) {
      const mint = token.mint;
      const decimals = token.decimals || 0;
      const amount = token.amount / 10 ** decimals;

      if (mint === "5KdM72CGe2TqgccLZs1BdKx4445tXkrBrv9oa8s8T6pump") {
        const purpePrice = await fetchJupiterPrice(mint);
        purpeUSD = amount * purpePrice;
      }

      if (mint === "HBoNJ5v8g71s2boRivrHnfSB5MVPLDHHyVjruPfhGkvL") {
        const pyusdPrice = await fetchJupiterPrice(mint);
        pyusdUSD = amount * pyusdPrice;
      }
    }

    // 4. Gesamtsumme berechnen
    const totalUSD = solUSD + purpeUSD + pyusdUSD;
    const percent = Math.min((totalUSD / goalUSD) * 100, 100);

    // 5. UI aktualisieren
    document.getElementById("raised-amount").textContent = `$${totalUSD.toFixed(2)}`;
    document.getElementById("progress-bar").style.width = `${percent}%`;

    const breakdownEl = document.getElementById("token-breakdown");
    if (breakdownEl) {
      breakdownEl.innerHTML = `
        • SOL: $${solUSD.toFixed(2)}<br>
        • PURPE: $${purpeUSD.toFixed(2)}<br>
        • PYUSD: $${pyusdUSD.toFixed(2)}
      `;
    }

  } catch (err) {
    console.error("Fehler beim Abrufen:", err);
  }
}

fetchWalletBalance();
setInterval(fetchWalletBalance, 60000);
