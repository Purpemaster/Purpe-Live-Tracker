const walletAddress = "9uo3TB4a8synap9VMNpby6nzmnMs9xJWmgo2YKJHZWVn";
const heliusApiKey = "2e046356-0f0c-4880-93cc-6d5467e81c73";
const birdeyeApiKey = "f80a250b67bc411dadbadadd6ecd2cf2";
const goalUSD = 20000;

const PYUSD_MINT = "2b1kV6DkPAnxd5ixfnxCpjxmKwqjjaYmCZfHsFu24GXo";
const PURPE_MINT = "HBoNJ5v8g71s2boRivrHnfSB5MVPLDHHyVjruPfhGkvL";

const mintToName = {
  [PURPE_MINT]: "PURPE",
  [PYUSD_MINT]: "PYUSD"
};

const fixedPrices = {
  [PYUSD_MINT]: 1.0,
  [PURPE_MINT]: 0.00003761
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

async function fetchPurpePrice() {
  try {
    const res = await fetch(`https://public-api.birdeye.so/public/price?address=${PURPE_MINT}`, {
      headers: { "X-API-KEY": birdeyeApiKey }
    });
    const data = await res.json();
    const value = parseFloat(data?.data?.value || 0);
    return value > 0 ? value : fixedPrices[PURPE_MINT];
  } catch {
    return fixedPrices[PURPE_MINT];
  }
}

async function fetchWalletBalance() {
  try {
    const res = await fetch(`https://api.helius.xyz/v0/addresses/${walletAddress}/balances?api-key=${heliusApiKey}`);
    const data = await res.json();

    const tokens = data.tokens || [];

    // PYUSD not present? Fallback from localStorage
    const hasPYUSD = tokens.some(t => t.mint === PYUSD_MINT);
    if (!hasPYUSD) {
      const savedPYUSD = parseFloat(localStorage.getItem("lastPYUSDAmount") || "0");
      if (savedPYUSD > 0) {
        tokens.push({
          mint: PYUSD_MINT,
          amount: savedPYUSD * 1_000_000,
          decimals: 6
        });
      }
    }

    const lamports = data.nativeBalance || 0;
    const sol = lamports / 1_000_000_000;
    const solPrice = await fetchSolPrice();
    const purpePrice = await fetchPurpePrice();
    const solUSD = sol * solPrice;

    let totalUSD = solUSD;
    let breakdown = `SOL: $${solUSD.toFixed(2)}<br>`;

    for (const token of tokens) {
      const { mint, decimals = 6, amount } = token;
      const name = mintToName[mint] || mint.slice(0, 4) + "...";
      const realAmount = amount / Math.pow(10, decimals);

      let price = fixedPrices[mint] || 0;
      if (mint === PURPE_MINT) price = purpePrice;

      const valueUSD = realAmount * price;

      if (mint === PYUSD_MINT && realAmount > 0) {
        localStorage.setItem("lastPYUSDAmount", realAmount.toString());
      }

      if (valueUSD > 0) {
        breakdown += `${name}: $${valueUSD.toFixed(2)}<br>`;
        totalUSD += valueUSD;
      }
    }

    const percent = Math.min((totalUSD / goalUSD) * 100, 100);
    document.getElementById("current-amount").textContent = `$${totalUSD.toFixed(2)}`;
    document.getElementById("progress-fill").style.width = `${percent}%`;
    document.getElementById("breakdown").innerHTML = breakdown;

    const now = new Date();
    const timeString = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
    document.getElementById("last-updated").textContent = `Last updated: ${timeString}`;
  } catch (err) {
    console.error("Fehler beim Wallet-Abruf:", err);
  }
}

fetchWalletBalance();
setInterval(fetchWalletBalance, 60000);
