const apiKey = "2e046356-0f0c-4880-93cc-6d5467e81c73";
const walletAddress = "9uo3TB4a8synap9VMNpby6nzmnMs9xJWmgo2YKJHZWVn";
const goalUSD = 20000;

async function fetchBalance() {
  const url = `https://api.helius.xyz/v0/addresses/${walletAddress}/balances?api-key=${apiKey}`;
  const response = await fetch(url);
  const data = await response.json();

  let solUSD = 0;
  let tokenUSD = 0;

  data.tokens.forEach(token => {
    if (
      token.symbol === "USDC" ||
      token.symbol === "PURPE" ||
      token.symbol === "SOL"
    ) {
      tokenUSD += token.amount * (token.price || 0);
    }
  });

  // Backup falls SOL separat kommt
  if (data.nativeBalance?.solana) {
    solUSD += data.nativeBalance.solana * (data.nativeBalance.price || 0);
  }

  const totalUSD = tokenUSD + solUSD;
  const percent = Math.min((totalUSD / goalUSD) * 100, 100);

  // Output aktualisieren
  document.getElementById("donation-amount").textContent = `$${totalUSD.toFixed(2)}`;
  document.getElementById("progress-bar-fill").style.width = `${percent}%`;
  document.getElementById("goal-amount").textContent = "$20000";

  // Debug (optional anzeigen)
  console.log("Wallet Balance:", { solUSD, tokenUSD, totalUSD, percent });
}

// Initial + alle 30 Sekunden aktualisieren
fetchBalance();
setInterval(fetchBalance, 30000);
