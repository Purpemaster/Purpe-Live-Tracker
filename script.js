const walletAddress = "9uo3TB4a8synap9VMNpby6nzmnMs9xJWmgo2YKJHZWVn";
const heliusApiKey = "2e046356-0f0c-4880-93cc-6d5467e81c73";
const goalUSD = 20000;

const purpeMint = "5KdM72CGe2TqgccLZs1BdKx4445tXkrBrv9oa8s8T6pump";
const pyusdMint = "HBoNJ5v8g71s2boRivrHnfSB5MVPLDHHyVjruPfhGkvL";

// Fallback-Fixpreise
const fallbackPrices = {
  PURPE: 0.0000373,
  PYUSD: 0.9999
};

// Hole den SOL-Preis von CoinGecko
async function fetchSolPrice() {
  const res = await fetch("https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd");
  const data = await res.json();
  return data.solana?.usd || 0;
}

// Hole Tokenpreis von Jupiter (DEX-Preis)
async function fetchJupiterPrice(mint) {
  try {
    const res = await fetch(`https://price.jup.ag/v4/price?ids=${mint}`);
    const data = await res.json();
    return data.data?.[mint]?.price || null;
  } catch (err) {
    console.error("Jupiter API Fehler:", err);
    return null;
  }
}

async function fetchWalletBalance() {
  try {
    const res = await fetch(`https://api.helius.xyz/v0/addresses/${walletAddress}/balances?api-key=${heliusApiKey}`);
    const data = await res.json();

    const tokens = data.tokens || [];
    const lamports = data.nativeBalance || 0;
    const sol = lamports / 1_000_000_000;

    // Hole den aktuellen SOL-Preis
    const solPrice = await fetchSolPrice();
    const solUSD = sol * solPrice;

    let purpeUSD = 0;
    let pyusdUSD = 0;

    for (const token of tokens) {
      const mint = token.mint;

      // Sicher: Dezimalstellen korrekt setzen
      const decimals = token.decimals && token.decimals > 0 ? token.decimals : 6;
      const amount = token.amount / 10 ** decimals;

      if (mint === purpeMint) {
        const price = (await fetchJupiterPrice(mint)) || fallbackPrices.PURPE;
        purpeUSD = amount * price;
      }

      if (mint === pyusdMint) {
        const price = (await fetchJupiterPrice(mint)) || fallbackPrices.PYUSD;
        pyusdUSD = amount * price;
      }

      // Optional: Debug
      // console.log(`Token: ${mint} | Decimals: ${decimals} | Amount: ${amount}`);
    }

    const totalUSD = solUSD + purpeUSD + pyusdUSD;
    const percent = Math.min((totalUSD / goalUSD) * 100, 100);

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
