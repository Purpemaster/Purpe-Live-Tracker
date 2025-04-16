document.addEventListener("DOMContentLoaded", async () => {
  const wallet = "9uo3TB4a8synap9VMNpby6nzmnMs9xJWmgo2YKJHZWVn";
  const heliusAPI = "5a9f9c0b-5695-464f-8a8e-44dcf3524fe7";
  const endpoint = `https://api.helius.xyz/v0/address/${wallet}?api-key=${heliusAPI}`;
  const goal = 20000; // USD Ziel

  try {
    const response = await fetch(endpoint, {
      headers: { accept: "application/json" }
    });
    const data = await response.json();

    // SOL Balance
    const lamports = data.nativeBalance?.lamports || 0;
    const sol = lamports / 1e9;
    const solUSD = sol * 132.59; // Aktueller SOL/USD Kurs (ggf. anpassen)

    // Tokens Value
    let tokenUSD = 0;
    if (Array.isArray(data.tokenAccounts)) {
      tokenUSD = data.tokenAccounts.reduce((sum, token) => {
        return sum + (token?.tokenPrice?.usd || 0);
      }, 0);
    }

    const totalUSD = solUSD + tokenUSD;
    const percent = Math.min((totalUSD / goal) * 100, 100);

    // Anzeige aktualisieren
    document.getElementById("amountStart").innerText = `$${totalUSD.toLocaleString(undefined, {
      maximumFractionDigits: 2,
    })}`;

    document.getElementById("progressFill").style.width = `${percent}%`;

    // Optional: Debug entfernen oder aktiv lassen
    console.log("Live-Wallet USD:", totalUSD, "| Fortschritt:", percent + "%");

  } catch (error) {
    console.error("Fehler beim Abrufen der Wallet-Daten:", error);
    document.getElementById("amountStart").innerText = "$0";
    document.getElementById("progressFill").style.width = "0%";
  }
});
