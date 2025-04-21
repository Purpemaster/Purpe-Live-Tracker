const walletAddress = "9uo3TB4a8synap9VMNpby6nzmnMs9xJWmgo2YKJHZWVn";
const heliusApiKey = "2e046356-0f0c-4880-93cc-6d5467e81c73";
const goalUSD = 20000;

const purpeMint = "HBoNJ5v8g71s2boRivrHnfSB5MVPLDHHyVjruPfhGkvL";
const fallbackPricePurpe = 0.0000373;
const pyusdManualValue = 0.00; // Hier deinen festen PYUSD-Wert setzen

async function fetchSolPrice() {
  try {
    const res = await fetch("https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd");
    const data = await res.json();
    return data.solana?.usd || 0;
  } catch {
    return 0;
  }
}

async function fetchPurpePrice() {
  try {
    const response = await fetch(`https://api.dexscreener.com/latest/dex/pairs/solana/${purpeMint}`);
    const data = await response.json();
    return parseFloat(data.pairs?.[0]?.priceUsd) || fallbackPricePurpe;
  } catch {
    return fallbackPricePurpe;
  }
}

async function fetchWalletBalance() {
  try {
    const res = await fetch(`https://api.helius.xyz/v0/addresses/${walletAddress}/balances?api-key=${heliusApiKey}`);
    const data = await res.json();

    const tokens = data.tokens || [];
    const sol = (data.nativeBalance || 0) / 1_000_000_000;
    const solPrice = await fetchSolPrice();
    const solUSD = sol * solPrice;

    let purpeUSD = 0;
    for (const token of tokens) {
      const mint = token.mint;
      const amount = token.amount / Math.pow(10, token.decimals || 6);
      if (mint === purpeMint) {
        const purpePrice = await fetchPurpePrice();
        purpeUSD = amount * purpePrice;
      }
    }

    const totalUSD = solUSD + purpeUSD + pyusdManualValue;
    const percent = Math.min((totalUSD / goalUSD) * 100, 100);

    document.getElementById("current-amount").textContent = `$${totalUSD.toFixed(2)}`;
    document.getElementById("goal-amount").textContent = `$${goalUSD.toFixed(2)}`;
    document.getElementById("progress-fill").style.width = `${percent}%`;

    document.getElementById("breakdown").innerHTML = `
      SOL: $${solUSD.toFixed(2)}<br>
      PURPE: $${purpeUSD.toFixed(2)}<br>
      PYUSD: $${pyusdManualValue.toFixed(2)}
    `;

  } catch (err) {
    console.error("Wallet-Abfrage fehlgeschlagen:", err);
  }
}

fetchWalletBalance();
setInterval(fetchWalletBalance, 60000);
