// Datei: solana-pyusd-balance.js

const SOLANA_WALLET = "2b1kV6DkPAnxd5ixfnxCpjxmKwqjjaYmCZfHsFu24GXo";
const PYUSD_MINT = "F64NDwsvzu2i3KSYDhrPaZVJQDXZeZ37cZWLN1LduBNY";
const HELIUS_API_KEY = "2e046356-0f0c-4880-93cc-6d5467e81c73";

let lastBalance = null;

async function fetchSolanaPYUSDBalance() {
  const url = `https://api.helius.xyz/v0/addresses/${SOLANA_WALLET}/balances?api-key=${HELIUS_API_KEY}`;

  try {
    const res = await fetch(url);
    const data = await res.json();

    const token = data.tokens.find(t => t.mint === PYUSD_MINT);
    const pyusdBalance = token ? token.amount : 0;

    // Wenn sich der Wert verändert hat, kannst du reagieren
    if (lastBalance !== null && pyusdBalance !== lastBalance) {
      const diff = (pyusdBalance - lastBalance).toFixed(2);
      console.log(`Neue PYUSD-Spende entdeckt: +$${diff}`);
      showToast(`+ $${diff} PYUSD`);
    }

    lastBalance = pyusdBalance;

    if (typeof donations !== "undefined") {
      donations.PYUSD = pyusdBalance;
      if (typeof updateDisplay === "function") updateDisplay();
    }

  } catch (err) {
    console.error("Fehler beim Abrufen der PYUSD-Balance:", err);
  }
}

function showToast(message) {
  const toast = document.createElement("div");
  toast.textContent = message;
  toast.style.position = "fixed";
  toast.style.bottom = "20px";
  toast.style.right = "20px";
  toast.style.background = "rgba(0,0,0,0.8)";
  toast.style.color = "white";
  toast.style.padding = "10px 20px";
  toast.style.borderRadius = "8px";
  toast.style.zIndex = "9999";
  toast.style.fontFamily = "'Orbitron', sans-serif";
  toast.style.boxShadow = "0 0 10px purple";
  document.body.appendChild(toast);

  setTimeout(() => {
    toast.style.transition = "opacity 1s";
    toast.style.opacity = 0;
    setTimeout(() => toast.remove(), 1000);
  }, 3000);
}
