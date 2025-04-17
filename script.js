const API_KEY = "2e046356-0f0c-4880-93cc-6d5467e81c73";
const WALLET_ADDRESS = "9uo3TB4a8synap9VMNpby6nzmnMs9xJWmgo2YKJHZWVn";
const GOAL = 20000;

async function fetchBalance() {
  const url = `https://api.helius.xyz/v0/addresses/${WALLET_ADDRESS}/balances?api-key=${API_KEY}`;
  try {
    const response = await fetch(url);
    const data = await response.json();

    const tokens = data.tokens || [];
    let solUSD = data.nativeBalance?.usd || 0;

    let tokenUSD = 0;
    tokens.forEach((token) => {
      if (["USDC", "PURPE", "Purple Pepe"].includes(token.tokenSymbol)) {
        tokenUSD += token.amount * (token.price || 0);
      }
    });

    const totalUSD = solUSD + tokenUSD;
    const percent = Math.min((totalUSD / GOAL) * 100, 100).toFixed(1);

    document.getElementById("donation-amount").innerText = `$${totalUSD.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
    document.getElementById("progress-fill").style.width = `${percent}%`;
    document.getElementById("goal-amount").innerText = "$20,000";

    console.log("Wallet Balance:", { solUSD, tokenUSD, totalUSD, percent });
  } catch (error) {
    console.error("Fehler beim Abrufen der Wallet-Daten:", error);
  }
}

fetchBalance();
setInterval(fetchBalance, 60000); // Aktualisierung alle 60 Sekunden
