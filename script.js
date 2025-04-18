const walletAddress = "9uo3TB4a8synap9VMNpby6nzmnMs9xJWmgo2YKJHZWVn";
const heliusApiKey = "2e046356-0f0c-4880-93cc-6d5467e81c73";
const goalUSD = 20000;

const purpeMint = "5KdM72CGe2TqgccLZs1BdKx4445tXkrBrv9oa8s8T6pump";
const fallbackPricePurpe = 0.0000373;

// Preis von CoinGecko für Solana
async function fetchSolPrice() {
  try {
    const res = await fetch("https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd");
    const data = await res.json();
    return data.solana?.usd || 0;
  } catch (err) {
    console.error("Fehler bei SOL-Preisabfrage:", err);
    return 0;
  }
}

// Preis von CoinGecko für Purple Pepe (PURPE)
async function fetchPurpePrice() {
  try {
    const res = await fetch("https://api.coingecko.com/api/v3/simple/price?ids=purple-pepe&vs_currencies=usd");
    const data = await res.json();
    return data["purple-pepe"]?.usd || null;
  } catch (err) {
    console.error("Fehler bei PURPE-Preisabfrage:", err);
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

    const solPrice = await fetchSolPrice();
    const solUSD = sol * solPrice;

    let purpeUSD = 0;

    for (const token of tokens) {
      const mint = token.mint;
      const decimals = token.decimals && token.decimals > 0 ? token.decimals : 6;
      const amount = token.amount / 10 ** decimals;

      if (mint === purpeMint) {
        const purpePrice = await fetchPurpePrice();
        const price = purpePrice !== null ? purpePrice : fallbackPricePurpe;
        purpeUSD = amount * price;
      }
    }

    const totalUSD = solUSD + purpeUSD;
    const percent = Math.min((totalUSD / goalUSD) * 100, 100);

    document.getElementById("raised-amount").textContent = `$${totalUSD.toFixed(2)}`;
    document.getElementById("progress-bar").style.width = `${percent}%`;

    const breakdownEl = document.getElementById("token-breakdown");
    if (breakdownEl) {
      breakdownEl.innerHTML = `
        • SOL: $${solUSD.toFixed(2)}<br>
        • PURPE: $${purpeUSD.toFixed(2)}
      `;
    }

  } catch (err) {
    console.error("Fehler beim Wallet-Abgleich:", err);
  }
}

fetchWalletBalance();
setInterval(fetchWalletBalance, 60000);
