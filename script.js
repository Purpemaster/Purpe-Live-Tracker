const heliusKey = "2e046356-0f0c-4880-93cc-6d5467e81c73";
const walletAddress = "9uo3TB4a8synap9VMNpby6nzmnMs9xJWmgo2YKJHZWVn";
const goalUSD = 20000;

async function getBalance() {
  try {
    const response = await fetch(`https://api.helius.xyz/v0/addresses/${walletAddress}/balances?api-key=${heliusKey}`);
    const data = await response.json();

    let totalUSD = 0;

    data.tokens.forEach(token => {
      const symbol = token.tokenSymbol;
      const amount = token.amount / Math.pow(10, token.decimals || 0);

      if (symbol === "SOL") totalUSD += amount * 150;
      if (symbol === "USDC") totalUSD += amount;
      if (symbol.toUpperCase().includes("PURPE")) totalUSD += amount * 0.0008;
    });

    totalUSD = Math.round(totalUSD);

    document.getElementById("wallet-usd").innerText = `$${totalUSD}`;
    const percent = Math.min((totalUSD / goalUSD) * 100, 100);
    document.getElementById("progress-fill").style.width = `${percent}%`;
  } catch (err) {
    console.error("Fehler beim Abrufen der Wallet-Daten", err);
  }
}

getBalance();
setInterval(getBalance, 60000); // alle 60 Sekunden aktualisieren
