document.addEventListener("DOMContentLoaded", async () => {
  const wallet = "9uo3TB4a8synap9VMNpby6nzmnMs9xJWmgo2YKJHZWVn";
  const heliusAPI = "5a9f9c0b-5695-464f-8a8e-44dcf3524fe7";
  const endpoint = `https://api.helius.xyz/v0/addresses/${wallet}/balances?api-key=${heliusAPI}`;

  try {
    const response = await fetch(endpoint);
    const data = await response.json();
    const lamports = data.nativeBalance?.lamports || 0;
    const sol = lamports / 1000000000;
    const usd = sol * 100; // Grobe Umrechnung: 1 SOL ≈ 100 USD
    const goal = 20000;
    const percent = Math.min((usd / goal) * 100, 100);

    document.getElementById("progressFill").style.width = `${percent}%`;
    document.getElementById("amountText").innerText = `$${usd.toLocaleString(undefined, {
      maximumFractionDigits: 2,
    })} / $${goal.toLocaleString()}`;
  } catch (error) {
    console.error("Fehler beim Abrufen der Wallet-Daten:", error);
    document.getElementById("amountText").innerText = "Live Data Error";
  }
});
