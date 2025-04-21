const WALLET = "9uo3TB4a8synap9VMNpby6nzmnMs9xJWmgo2YKJHZWVn";
const PYUSD_MINT = "DbvNRGUYMTmfpyRxQL6iJWADCyP2KkCMNaiqWYLBvMYg";
const API_KEY = "2e046356-0f0c-4880-93cc-6d5467e81c73";
const GOAL = 20000;

const donations = {
  SOL: 0,
  PURPE: 0,
  PYUSD: 0
};

function debug(msg) {
  const box = document.getElementById("debug-box");
  const p = document.createElement("div");
  p.textContent = `[DEBUG] ${msg}`;
  box.appendChild(p);
  box.scrollTop = box.scrollHeight;
}

function updateDisplay() {
  const total = donations.SOL + donations.PURPE + donations.PYUSD;
  const progress = Math.min((total / GOAL) * 100, 100).toFixed(2);

  document.getElementById("current-amount").textContent = `$${total.toFixed(2)}`;
  document.getElementById("goal-amount").textContent = `$${GOAL.toFixed(2)}`;
  document.getElementById("progress-fill").style.width = `${progress}%`;

  document.getElementById("breakdown").innerHTML = `
    SOL: $${donations.SOL.toFixed(2)}<br>
    PURPE: $${donations.PURPE.toFixed(2)}<br>
    PYUSD: $${donations.PYUSD.toFixed(2)}
  `;
}

async function fetchDonations() {
  debug("API-Abfrage gestartet…");
  const url = `https://api.helius.xyz/v0/addresses/${WALLET}/balances?api-key=${API_KEY}`;

  try {
    const res = await fetch(url);
    const data = await res.json();
    debug("Antwort erhalten.");

    donations.SOL = (data.nativeBalance?.solana || 0) * 137; // Umrechnung in $

    data.tokens.forEach(token => {
      const amount = token.amount / Math.pow(10, token.decimals);
      if (token.mint === PYUSD_MINT) {
        donations.PYUSD = amount;
      } else if (token.tokenSymbol?.toUpperCase() === "PURPE") {
        const price = token.tokenPrice?.usd || 0;
        donations.PURPE = amount * price;
      }
    });

    updateDisplay();

  } catch (err) {
    debug("API-Fehler: " + err.message);
  }
}

fetchDonations();
setInterval(fetchDonations, 60000);
