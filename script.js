const walletAddress = "9uo3TB4a8synap9VMNpby6nzmnMs9xJWmgo2YKJHZWVn";
const heliusApiKey = "2e046356-0f0c-4880-93cc-6d5467e81c73";
const goalUSD = 20000;

const purpeMint = "HBoNJ5v8g71s2boRivrHnfSB5MVPLDHHyVjruPfhGkvL";
const fallbackPricePurpe = 0.0000373;

// Preis von SOL in USD von CoinGecko
async function fetchSolPrice() {
  try {
    const res = await fetch("https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd");
    const data = await res.json();
    return data.solana?.usd || 0;
  } catch (err) {
    console.error("Fehler bei SOL-Preisabfrage:", err);
    return 0;
  }
}

// Preis von PURPE in USD von Birdeye
async function fetchPurpePrice() {
  try {
    const res = await fetch(`https://public-api.birdeye.so/public/price?address=${purpeMint}`);
    const data = await res.json();
    const price = parseFloat(data.data?.value || data.data?.price);
    return isNaN(price) ? fallbackPricePurpe : price;
  } catch (err) {
    console.error("Fehler bei der PURPE-Preisabfrage über Birdeye:", err);
    return fallbackPricePurpe;
  }
}

// Hauptfunktion zur Wallet-Abfrage und Anzeige
async function fetchWalletBalance() {
  try {
    const res = await fetch(`https://api.helius.xyz/v0/addresses/${walletAddress}/balances?api-key=${heliusApiKey}`);
    const data = await res.json();

    const tokens = data.tokens || [];
    const lamports = data.nativeBalance || 0;
    const sol = lamports / 1_000_000_000;

    // Preise holen (einmal pro Lauf, nicht in der Schleife wie ein Amateur)
    const [solPrice, purpePrice] = await Promise.all([
      fetchSolPrice(),
      fetchPurpePrice()
    ]);

    const solUSD = sol * solPrice;
    let purpeUSD = 0;

    // Token-Liste durchgehen
    for (const token of tokens) {
      const mint = token.mint;
      const decimals = token.decimals > 0 ? token.decimals : 6;
      const amount = token.amount / 10 ** decimals;

      if (mint === purpeMint) {
        purpeUSD = amount * purpePrice;
      }
    }

    const totalUSD = solUSD + purpeUSD;
    const percent = Math.min((totalUSD / goalUSD) * 100, 100);

    // UI aktualisieren
    document.getElementById("raised-amount").textContent = `$${totalUSD.toFixed(2)}`;
    document.getElementById("progress-bar").style.width = `${percent}%`;

    const breakdownEl = document.getElementById("token-breakdown");
    if (breakdownEl) {
      breakdownEl.innerHTML = `
        • SOL: $${solUSD.toFixed(2)}<br>
        • PURPE: $${purpeUSD.toFixed(2)}
      `;
    }

    // Debug
    console.log(`[Live Update] Gesamtwert: $${totalUSD.toFixed(2)} (SOL: $${solUSD.toFixed(2)}, PURPE: $${purpeUSD.toFixed(2)})`);

  } catch (err) {
    console.error("Fehler beim Wallet-Abgleich:", err);
  }
}

// Initial ausführen & regelmäßig aktualisieren
fetchWalletBalance();
setInterval(fetchWalletBalance, 60000);
