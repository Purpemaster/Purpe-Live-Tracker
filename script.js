const walletAddress = "9uo3TB4a8synap9VMNpby6nzmnMs9xJWmgo2YKJHZWVn";
const goalUSD = 20000;

async function fetchWalletTokens() {
  const response = await fetch(`https://api.helius.xyz/v0/addresses/${walletAddress}/balances?api-key=2e046356-0f0c-4880-93cc-6d5467e81c73`);
  const data = await response.json();
  return data.tokens || [];
}

async function fetchPrices() {
  const response = await fetch(
    "https://api.coingecko.com/api/v3/simple/price?ids=solana,tether,pepe&vs_currencies=usd"
  );
  return await response.json();
}

function getTokenPrice(prices, symbol) {
  switch (symbol) {
    case "SOL": return prices.solana?.usd || 0;
    case "USDC": return prices.tether?.usd || 0;
    case "PURPE": return prices.pepe?.usd || 0;
    default: return 0;
  }
}

async function updateProgressBar() {
  try {
    const [tokens, prices] = await Promise.all([
      fetchWalletTokens(),
      fetchPrices()
    ]);

    let totalUSD = 0;

    tokens.forEach(token => {
      const symbol = token.tokenSymbol;
      const amount = parseFloat(token.amount);
      const price = getTokenPrice(prices, symbol);
      totalUSD += amount * price;
    });

    const progress = Math.min((totalUSD / goalUSD) * 100, 100).toFixed(2);
    document.getElementById("wallet-amount").textContent = `$${totalUSD.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    document.getElementById("progress-bar-fill").style.width = `${progress}%`;

    console.log("Wallet total USD:", totalUSD);
  } catch (err) {
    console.error("Fehler beim Laden der Walletdaten:", err);
  }
}

updateProgressBar();
setInterval(updateProgressBar, 60 * 1000); // alle 60 Sekunden aktualisieren
