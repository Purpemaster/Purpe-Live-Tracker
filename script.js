document.addEventListener("DOMContentLoaded", async () => {
  const wallet = "9uo3TB4a8synap9VMNpby6nzmnMs9xJWmgo2YKJHZWVn";
  const heliusAPI = "5a9f9c0b-5695-464f-8a8e-44dcf3524fe7";
  const goal = 20000;
  const endpoint = `https://mainnet.helius-rpc.com/?api-key=${heliusAPI}`;

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: "1",
        method: "getAssetsByOwner",
        params: {
          ownerAddress: wallet,
          page: 1,
          limit: 1000,
          displayOptions: {
            showFungible: true,
            showNativeBalance: true,
          },
        },
      }),
    });

    const data = await response.json();
    const lamports = data?.result?.nativeBalance?.lamports || 0;
    const sol = lamports / 1e9;
    const solUSD = sol * 132.59; // manueller SOL-Preis
    let totalUSD = solUSD;

    const tokens = data?.result?.items || [];
    tokens.forEach((token) => {
      if (token.token_info?.price_info?.usd) {
        totalUSD += token.token_info.price_info.usd;
      }
    });

    const percent = Math.min((totalUSD / goal) * 100, 100);

    document.getElementById("progressFill").style.width = `${percent}%`;
    document.getElementById("amountStart").textContent = `$${Math.round(totalUSD).toLocaleString()}`;
    document.getElementById("amountGoal").textContent = `$${goal.toLocaleString()}`;

  } catch (err) {
    console.error("Fehler beim Laden der Wallet-Daten:", err);
    document.getElementById("amountStart").textContent = "Error";
  }
});
