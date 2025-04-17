const API_KEY = "2e046356-0f0c-4880-93cc-6d5467e81c73";
const WALLET = "9uo3TB4a8synap9VMNpby6nzmnMs9xJWmgo2YKJHZWVn";
const GOAL = 20000; // Ziel in USD

async function fetchWalletBalance() {
  const response = await fetch(`https://api.helius.xyz/v0/addresses/${WALLET}/balances?api-key=${API_KEY}`);
  const data = await response.json();

  let totalUSD = 0;
  let solUSD = 0;
  let tokenUSD = 0;

  data.tokens.forEach((token) => {
    const symbol = token.tokenInfo?.symbol || "";
    const price = token.tokenInfo?.price || 0;
    const amount = token.amount || 0;
    const decimals = token.tokenInfo?.decimals || 0;

    const balance = amount / Math.pow(10, decimals);
    const value = balance * price;

    if (symbol === "SOL") {
      solUSD += value;
    } else {
      tokenUSD += value;
    }
  });

  totalUSD = solUSD + tokenUSD;
  const percent = Math.min((totalUSD / GOAL) * 100, 100);

  // Aktualisiere die UI
  document.getElementById("wallet-amount").innerText = `$${totalUSD.toFixed(2)}`;
  document.getElementById("progress-bar-fill").style.width = `${percent}%`;

  // Konsolenausgabe zur Kontrolle
  console.log("Wallet Balance:", { solUSD, tokenUSD, totalUSD, percent });
}

// Aufruf bei Seitenstart
fetchWalletBalance();
setInterval(fetchWalletBalance, 30000); // Alle 30 Sekunden aktualisieren
