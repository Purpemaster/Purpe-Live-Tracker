async function fetchWalletBalance() {
  try {
    const res = await fetch(`https://api.helius.xyz/v0/addresses/${walletAddress}/balances?api-key=${heliusApiKey}`);
    const data = await res.json();

    const tokens = data.tokens || [];
    const lamports = data.nativeBalance || 0;
    const sol = lamports / 1_000_000_000;

    // Preise holen
    const solPrice = await fetchSolPrice();
    const purpePrice = await fetchPurpePrice();
    const pyusdPrice = await fetchPyusdPrice();

    const solUSD = sol * solPrice;
    let purpeUSD = 0;
    let pyusdUSD = 0;

    for (const token of tokens) {
      const mint = token.mint?.trim().toLowerCase();
      const decimals = token.decimals || 6;
      const amount = token.amount / Math.pow(10, decimals);

      // Debug (optional)
      console.log("Token:", mint, "Amount:", amount);

      if (mint === purpeMint.toLowerCase()) {
        purpeUSD = amount * purpePrice;
      }

      if (mint === pyusdMint.toLowerCase()) {
        pyusdUSD = amount * pyusdPrice;
      }
    }

    const totalUSD = solUSD + purpeUSD + pyusdUSD;
    const percent = Math.min((totalUSD / goalUSD) * 100, 100);

    // UI aktualisieren
    document.getElementById("raised-amount").textContent = `$${totalUSD.toFixed(2)}`;
    document.getElementById("progress-bar").style.width = `${percent}%`;

    const breakdownEl = document.getElementById("token-breakdown");
    if (breakdownEl) {
      breakdownEl.innerHTML = `
        • SOL: $${solUSD.toFixed(2)}<br>
        • PURPE: $${purpeUSD.toFixed(2)}<br>
        • PYUSD: $${pyusdUSD.toFixed(2)}
      `;
    }

  } catch (err) {
    console.error("Fehler beim Wallet-Abgleich:", err);
  }
}
