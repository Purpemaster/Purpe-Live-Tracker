SOL: $xxxx.xx  
PURPE: $xxxx.xx  
PYUSD: $xxxx.xx  ← fehlt!
```)
funktioniert nur, wenn das Script PYUSD **richtig erkennt, bewertet und anzeigt.**

---

### Lass mich das für dich fixen.

Hier ist **die verbesserte `script.js`-Version**, die:
- PYUSD automatisch mit $1 bewertet
- den Wert im Gesamtbetrag dazuzählt
- **und** es im Info-Text (unter SOL/PURPE) korrekt anzeigt:

---

### **`script.js` (final mit funktionierendem PYUSD-Eintrag)**

```javascript
const walletAddress = "9uo3TB4a8synap9VMNpby6nzmnMs9xJWmgo2YKJHZWVn";
const heliusApiKey = "2e046356-0f0c-4880-93cc-6d5467e81c73";
const birdeyeApiKey = "f80a250b67bc411dadbadadd6ecd2cf2";
const goalUSD = 20000;

const mintToName = {
  "HBoNJ5v8g71s2boRivrHnfSB5MVPLDHHyVjruPfhGkvL": "PURPE",
  "2b1kV6DkPAnxd5ixfnxCpjxmKwqjjaYmCZfHsFu24GXo": "PYUSD",
};

const fallbackPrices = {
  "HBoNJ5v8g71s2boRivrHnfSB5MVPLDHHyVjruPfhGkvL": 0.00003761,
  "2b1kV6DkPAnxd5ixfnxCpjxmKwqjjaYmCZfHsFu24GXo": 1.0, // PYUSD fix fallback price
};

async function fetchSolPrice() {
  try {
    const res = await fetch("https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd");
    const data = await res.json();
    return data.solana?.usd || 0;
  } catch {
    return 0;
  }
}

async function fetchTokenPrice(mint) {
  try {
    const res = await fetch(`https://public-api.birdeye.so/public/price?address=${mint}`, {
      headers: { "X-API-KEY": birdeyeApiKey }
    });
    const data = await res.json();
    const fetched = data.data?.value || 0;
    return fetched > 0 ? fetched : (fallbackPrices[mint] || 0);
  } catch {
    return fallbackPrices[mint] || 0;
  }
}

async function fetchWalletBalance() {
  try {
    const res = await fetch(`https://api.helius.xyz/v0/addresses/${walletAddress}/balances?api-key=${heliusApiKey}`);
    const data = await res.json();

    const tokens = data.tokens || [];
    const lamports = data.nativeBalance || 0;
    const sol = lamports / 1_000_000_000;
    const solPrice = await fetchSolPrice();
    const solUSD = sol * solPrice;

    let totalUSD = solUSD;
    let breakdown = `SOL: $${solUSD.toFixed(2)}<br>`;

    for (const token of tokens) {
      const mint = token.mint;
      const decimals = token.decimals || 6;
      const amount = token.amount / Math.pow(10, decimals);
      const name = mintToName[mint] || mint.slice(0, 4) + "...";

      const price = await fetchTokenPrice(mint);
      const valueUSD = amount * price;

      if (valueUSD > 0) {
        breakdown += `${name}: $${valueUSD.toFixed(2)}<br>`;
        totalUSD += valueUSD;
      }
    }

    const percent = Math.min((totalUSD / goalUSD) * 100, 100);

    document.getElementById("current-amount").textContent = `$${totalUSD.toFixed(2)}`;
    document.getElementById("progress-fill").style.width = `${percent}%`;
    document.getElementById("breakdown").innerHTML = breakdown;

    // Update timestamp
    const now = new Date();
    const timeString = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
    const updatedEl = document.getElementById("last-updated");
    if (updatedEl) updatedEl.textContent = `Last updated: ${timeString}`;

  } catch (err) {
    console.error("Error fetching wallet data:", err);
  }
}

fetchWalletBalance();
setInterval(fetchWalletBalance, 60000);
