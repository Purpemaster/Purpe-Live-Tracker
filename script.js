const walletAddress = "9uo3TB4a8synap9VMNpby6nzmnMs9xJWmgo2YKJHZWVn";
const goalUSD = 20000;

async function fetchBalanceAndPrice() {
  try {
    // 1. Solana Balance
    const solanaResponse = await fetch("https://api.mainnet-beta.solana.com", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: 1,
        method: "getBalance",
        params: [walletAddress]
      })
    });
    const solData = await solanaResponse.json();
    const lamports = solData.result.value;
    const sol = lamports / 1e9;

    // 2. CoinGecko USD Preis für SOL & USDC
    const cgResponse = await fetch("https://api.coingecko.com/api/v3/simple/price?ids=solana,tether,purple-pepe&vs_currencies=usd");
    const prices = await cgResponse.json();

    const solUSD = sol * (prices.solana?.usd || 0);
    const usdcUSD = 0; // USDC = stablecoin, wird ignoriert wenn nicht extra getrackt
    const pepeUSD = 0; // Optional: wenn du den Token als ID hast, kann man ihn dynamisch holen

    const totalUSD = solUSD + usdcUSD + pepeUSD;
    const percent = Math.min((totalUSD / goalUSD) * 100, 100);

    // Update DOM
    document.getElementById("current-usd").innerText = `$${totalUSD.toFixed(2)}`;
    document.getElementById("progress-bar").style.width = `${percent}%`;
  } catch (err) {
    console.error("Fehler beim Laden:", err);
  }
}

// Alle 20 Sekunden aktualisieren
fetchBalanceAndPrice();
setInterval(fetchBalanceAndPrice, 20000);
