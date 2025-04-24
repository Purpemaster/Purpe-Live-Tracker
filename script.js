const walletAddress = "9uo3TB4a8synap9VMNpby6nzmnMs9xJWmgo2YKJHZWVn";
const heliusApiKey = "2e046356-0f0c-4880-93cc-6d5467e81c73";
const goalUSD = 20000;

const PURPE_MINT = "HBoNJ5v8g71s2boRivrHnfSB5MVPLDHHyVjruPfhGkvL";

const mintToName = {
  [PURPE_MINT]: "PURPE"
};

const fixedPrices = {
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
    // Versuche zuerst über Jupiter Quote
    const jupRes = await fetch(
      `https://quote-api.jup.ag/v6/quote?inputMint=${PURPE_MINT}&outputMint=Es9vMFrzaCERzVw1e8Jdi9bQ5Z3PvAPbpt4nTTbFzmiM&amount=1000000&slippage=1`
    );
    const jupData = await jupRes.json();
    const outAmount = parseFloat(jupData?.outAmount || "0");
    if (outAmount > 0) return outAmount / 1_000_000;

    // Fallback: Birdeye
    const birdRes = await fetch(`https://public-api.birdeye.so/public/price?address=${PURPE_MINT}`, {
      headers: { "X-API-KEY": "f80a250b67bc411dadbadadd6ecd2cf2" }
    });
    const birdData = await birdRes.json();
    const birdValue = parseFloat(birdData?.data?.value || 0);
    if (birdValue > 0) return birdValue;

    // Notfall-Fallback
    return fixedPrices[PURPE_MINT];
  } catch (err) {
    console.warn("Fehler bei PURPE Preisabruf:", err);
    return fixedPrices[PURPE_MINT];
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
    const purpePrice = await fetchPurpePrice();
    const solUSD = sol * solPrice;

    let totalUSD = solUSD;
    let breakdown = `SOL: $${solUSD.toFixed(2)}<br>`;

    for (const token of tokens) {
      const { mint, decimals = 6, amount } = token;
      if (mint !== PURPE_MINT) continue;

      const name = mintToName[mint] || mint.slice(0, 4) + "...";
      const realAmount = amount / Math.pow(10, decimals);
      const valueUSD = realAmount * purpePrice;

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
