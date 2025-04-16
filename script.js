document.addEventListener("DOMContentLoaded", async () => {
  const wallet = "9uo3TB4a8synap9VMNpby6nzmnMs9xJWmgo2YKJHZWVn";
  const heliusAPI = "5a9f9c0b-5695-464f-8a8e-44dcf3524fe7";
  const goal = 20000;
  const solToUsd = 132.59;

  const endpoint = `https://api.helius.xyz/v0/addresses/${wallet}/balances?api-key=${heliusAPI}`;

  try {
    const response = await fetch(endpoint);
    const data = await response.json();

    const lamports = data.nativeBalance?.lamports ?? 0;
    const sol = lamports / 1e9;
    const solUSD = sol * solToUsd;

    let tokenUSD = 0;
    if (Array.isArray(data.tokens)) {
      tokenUSD = data.tokens.reduce((sum, token) => {
        return sum + (token?.value?.usd || 0);
      }, 0);
    }

    const totalUSD = solUSD + tokenUSD;
    const percent = Math.min((totalUSD / goal) * 100, 100);

    // Fortschrittsbalken füllen
    document.getElementById("progressFill").style.width = `${percent}%`;

    // Werte anzeigen
    document.getElementById("amountStart").innerText = `$${totalUSD.toLocaleString(undefined, {
      maximumFractionDigits: 2
    })}`;

    document.getElementById("amountGoal").innerText = `$${goal.toLocaleString()}`;

    // Debug-Ausgabe direkt auf der Seite
    const debugInfo = `
      <div style="background: rgba(0,0,0,0.6); color: #0ff; padding: 10px; margin-top: 20px; font-size: 12px; font-family: monospace;">
        <strong>DEBUG INFO:</strong><br>
        SOL: ${sol.toFixed(4)} | USD: $${solUSD.toFixed(2)}<br>
        Tokens USD: $${tokenUSD.toFixed(2)}<br>
        Total USD: $${totalUSD.toFixed(2)}<br>
        Percent Filled: ${percent.toFixed(2)}%
      </div>
    `;
    document.body.insertAdjacentHTML("beforeend", debugInfo);

  } catch (error) {
    document.getElementById("amountStart").innerText = "Live Data Error";
    document.body.insertAdjacentHTML(
      "beforeend",
      `<div style="background: rgba(255,0,0,0.6); color: white; padding: 10px; font-size: 14px;">
        Fehler beim Abrufen der Wallet-Daten!
      </div>`
    );
  }
});
