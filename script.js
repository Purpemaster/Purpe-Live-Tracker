const walletAddress = "9uo3TB4a8synap9VMNpby6nzmnMs9xJWmgo2YKJHZWVn";
const heliusApiKey = "2e046356-0f0c-4880-93cc-6d5467e81c73";
const goalUSD = 20000;

const tokenMap = {
  "So11111111111111111111111111111111111111112": "solana",        // SOL
  "5KdM72CGe2TqgccLZs1BdKx4445tXkrBrv9oa8s8T6pump": "purple-pepe", // PURPE
  "HBoNJ5v8g71s2boRivrHnfSB5MVPLDHHyVjruPfhGkvL": "paypal-usd"     // PYUSD
};

async function fetchTokenPrices(ids) {
  const url = `https://api.coingecko.com/api/v3/simple/price?ids=${ids.join(",")}&vs_currencies=usd`;
  const res = await fetch(url);
  return await res.json();
}

async function fetchWalletBalance() {
  try {
    const res = await fetch(`https://api.helius.xyz/v0/addresses/${walletAddress}/balances?api-key=${heliusApiKey}`);
    const data = await res.json();

    const tokens = data.tokens || [];
    const lamports = data.nativeBalance || 0;
    const sol = lamports / 1_000_000_000;

    const geckoIds = new Set(["solana"]);
    tokens.forEach(token => {
      const id = tokenMap[token.mint];
      if (id) geckoIds.add(id);
    });

    const prices = await fetchTokenPrices([...geckoIds]);
    const solPrice = prices["solana"]?.usd || 0;
    const solUSD = sol * solPrice;

    let tokenUSD = 0;
    let purpeUSD = 0;
    let pyusdUSD = 0;

    tokens.forEach(token => {
      const mint = token.mint;
      const geckoId = tokenMap[mint];
      if (!geckoId) return;

      const decimals = token.decimals || 0;
      const amount = token.amount / 10 ** decimals;
      const price = prices[geckoId]?.usd || 0;
      const tokenValue = amount * price;

      tokenUSD += tokenValue;

      if (geckoId === "purple-pepe") purpeUSD = tokenValue;
      if (geckoId === "paypal-usd") pyusdUSD = tokenValue;
    });

    const totalUSD = solUSD + tokenUSD;
    const percent = Math.min((totalUSD / goalUSD) * 100, 100);

    // UI aktualisieren
    document.getElementById("raised-amount").textContent = `$${totalUSD.toFixed(2)}`;
    document.getElementById("progress-bar").style.width = `${percent}%`;

    // Einzelwerte anzeigen
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
