const walletAddress = "9uo3TB4a8synap9VMNpby6nzmnMs9xJWmgo2YKJHZWVn";
const heliusApiKey = "2e046356-0f0c-4880-93cc-6d5467e81c73";
const goalUSD = 20000;

const purpeMint = "HBoNJ5v8g71s2boRivrHnfSB5MVPLDHHyVjruPfhGkvL";
const fallbackPricePurpe = 0.0000373;

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

async function fetchPurpePrice() {
  try {
    const response = await fetch('https://api.dexscreener.com/latest/dex/pairs/solana/HBoNJ5v8g71s2boRivrHnfSB5MVPLDHHyVjruPfhGkvL');
    const data = await response.json();
    if (data.pairs && data.pairs.length > 0) {
      const priceUsd = parseFloat(data.pairs[0].priceUsd);
      return isNaN(priceUsd) ? fallbackPricePurpe : priceUsd;
    }
    return fallbackPricePurpe;
  } catch (error) {
    console.error("Fehler bei der PURPE-Preisabfrage:", error);
    return fallbackPricePurpe;
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
        purpeUSD = amount * purpePrice;
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
