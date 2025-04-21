const walletAddress = "9uo3TB4a8synap9VMNpby6nzmnMs9xJWmgo2YKJHZWVn";
const heliusApiKey = "2e046356-0f0c-4880-93cc-6d5467e81c73";
const purpeMint = "HBoNJ5v8g71s2boRivrHnfSB5MVPLDHHyVjruPfhGkvL";
const fallbackPurpePrice = 0.0000373;
const manualPYUSD = 545.00;
const goal = 20000;

const donations = {
  SOL: 0,
  PURPE: 0,
  PYUSD: manualPYUSD
};

function formatAmount(amount) {
  return `$${amount.toFixed(2)}`;
}

async function fetchSolPrice() {
  try {
    const res = await fetch("https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd");
    const data = await res.json();
    return data.solana?.usd || 0;
  } catch {
    return 0;
  }
}

async function fetchPurpePrice() {
  try {
    const res = await fetch(`https://price.jup.ag/v4/price?ids=${purpeMint}`);
    const data = await res.json();
    const price = data.data?.[purpeMint]?.price;
    return price ? parseFloat(price) : fallbackPurpePrice;
  } catch {
    return fallbackPurpePrice;
  }
}

async function fetchWalletData() {
  try {
    const url = `https://api.helius.xyz/v0/addresses/${walletAddress}/balances?api-key=${heliusApiKey}`;
    const res = await fetch(url);
    const data = await res.json();

    const tokens = data.tokens || [];
    const solBalance = (data.nativeBalance || 0) / 1e9;
    const solPrice = await fetchSolPrice();
    donations.SOL = solBalance * solPrice;

    const purpeToken = tokens.find(t => t.mint === purpeMint);
    if (purpeToken) {
      const amount = purpeToken.amount / (10 ** purpeToken.decimals);
      const purpePrice = await fetchPurpePrice();
      donations.PURPE = amount * purpePrice;
    } else {
      donations.PURPE = 0;
    }

    updateDisplay();
  } catch (err) {
    console.error("Fehler beim Wallet-Check:", err);
  }
}

function updateDisplay() {
  const total = donations.SOL + donations.PURPE + donations.PYUSD;
  const progressPercent = Math.min((total / goal) * 100, 100);

  const progressFill = document.querySelector('.progress-fill');
  if (progressFill) {
    progressFill.style.width = `${progressPercent}%`;
  }

  const currentAmount = document.querySelector('#current-amount');
  const goalAmount = document.querySelector('#goal-amount');
  if (currentAmount && goalAmount) {
    currentAmount.textContent = formatAmount(total);
    goalAmount.textContent = formatAmount(goal);
  }

  const breakdown = document.getElementById('breakdown');
  if (breakdown) {
    breakdown.innerHTML = `
      SOL: ${formatAmount(donations.SOL)}<br>
      PURPE: ${formatAmount(donations.PURPE)}<br>
      PYUSD: ${formatAmount(donations.PYUSD)}
    `;
  }
}

document.addEventListener('DOMContentLoaded', fetchWalletData);
setInterval(fetchWalletData, 60000); // Aktualisierung alle 60 Sekunden
