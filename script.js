document.addEventListener("DOMContentLoaded", async () => {
  const wallet = "9uo3TB4a8synap9VMNpby6nzmnMs9xJWmgo2YKJHZWVn";
  const heliusAPI = "5a9f9c0b-5695-464f-8a8e-44dcf3524fe7";
  const goal = 20000;
  const endpoint = `https://api.helius.xyz/v0/addresses/${wallet}/balances?api-key=${heliusAPI}`;

  try {
    const response = await fetch(endpoint);
    const data = await response.json();

    const lamports = data.nativeBalance?.lamports || 0;
    const sol = lamports / 1e9;
    const solUSD = sol * 132.59;

    let tokenUSD = 0;
    if (Array.isArray(data.tokens)) {
      tokenUSD = data.tokens.reduce((sum, token) => {
        return sum + (token?.value?.usd || 0);
      }, 0);
    }

    const totalUSD = solUSD + tokenUSD;
    const percent = Math.min((totalUSD / goal) * 100, 100);

    // Live Balken füllen
    document.getElementById("progressFill").style.width = `${percent}%`;

    // Zahlen aktualisieren
    document.getElementById("amountStart").innerText = `$${totalUSD.toLocaleString(undefined, {maximumFractionDigits: 2})}`;
    document.getElementById("amountGoal").innerText = `$${goal.toLocaleString()}`;
  } catch (error) {
    console.error("Fehler beim Abrufen der Wallet-Daten:", error);
    document.getElementById("amountStart").innerText = "Live Error";
  }
});
