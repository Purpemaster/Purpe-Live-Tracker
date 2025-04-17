document.addEventListener("DOMContentLoaded", async () => {
  const wallet = "9uo3TB4a8synap9VMNpby6nzmnMs9xJWmgo2YKJHZWVn";
  const heliusAPI = "2e046356-0f0c-4880-93cc-6d5467e81c73";
  const endpoint = `https://api.helius.xyz/v0/addresses/${wallet}/balances?api-key=${heliusAPI}`;
  const goal = 20000;

  try {
    const response = await fetch(endpoint);
    const data = await response.json();

    const lamports = data.nativeBalance?.lamports || 0;
    const sol = lamports / 1000000000;
    const solUSD = sol * 132.59;

    let tokenUSD = 0;
    if (Array.isArray(data.tokens)) {
      tokenUSD = data.tokens.reduce((sum, token) => {
        return sum + (token?.value?.usd || 0);
      }, 0);
    }

    const totalUSD = solUSD + tokenUSD;
    const percent = Math.min((totalUSD / goal) * 100, 100);

    // DEBUG: Konsole (nur für Testzwecke)
    console.log("Wallet Balance:", {
      solUSD: solUSD.toFixed(2),
      tokenUSD: tokenUSD.toFixed(2),
      totalUSD: totalUSD.toFixed(2),
      percent: percent.toFixed(2),
    });

    // Werte anzeigen
    document.getElementById("amountStart").innerText = `$${totalUSD.toLocaleString(undefined, {
      maximumFractionDigits: 0,
    })}`;
    document.getElementById("progressFill").style.width = `${percent}%`;
  } catch (error) {
    console.error("Fehler beim Abrufen der Wallet-Daten:", error);
    document.getElementById("amountStart").innerText = "$0";
  }
});
