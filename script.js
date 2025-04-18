const walletAddress = "9uo3TB4a8synap9VMNpby6nzmnMs9xJWmgo2YKJHZWVn";
const heliusApiKey = "2e046356-0f0c-4880-93cc-6d5467e81c73";
const goalUSD = 20000;

const tokenMap = {
  "So11111111111111111111111111111111111111112": "solana",           // SOL
  "5KdM72CGe2TqgccLZs1BdKx4445tXkrBrv9oa8s8T6pump": "purple-pepe",    // Purple Pepe
  "HBoNJ5v8g71s2boRivrHnfSB5MVPLDHHyVjruPfhGkvL": "paypal-usd"        // PayPal USD
};

async function fetchTokenPrices(ids) {
  const url = `https://api.coingecko.com/api/v3/simple/price?ids=${ids.join(",")}&vs_currencies=usd`;
  const response = await fetch(url);
  return await response.json();
}

async function fetchWalletBalance() {
  try {
    const heliusRes = await fetch(`https://api.helius.xyz/v0/addresses/${walletAddress}/balances?api-key=${heliusApiKey}`);
    const data = await heliusRes.json();

    const tokens = data.tokens || [];
    const lamports = data.nativeBalance || 0;
    const sol = lamports / 1_000_000_000;

    const geckoIds = new Set(["solana"]);
    tokens.forEach(token => {
      const mint = token.mint;
      if (tokenMap[mint]) geckoIds.add(tokenMap[mint]);
    });

    const prices = await fetchTokenPrices([...geckoIds]);

    const solPrice = prices["solana"]?.usd || 0;
    const solUSD = sol * solPrice;

    let tokenUSD = 0;
    tokens.forEach(token => {
      const mint = token.mint;
      const decimals = token.decimals || 0;
      const amount = token.amount / 10 ** decimals;

      const geckoId = tokenMap[mint];
      const price = prices[geckoId]?.usd || 0;

      tokenUSD += amount * price;
    });

    const totalUSD = solUSD + tokenUSD;
    const percent = Math.min((totalUSD / goalUSD) * 100, 100);

    document.getElementById("raised-amount").textContent = `$${totalUSD.toFixed(2)}`;
    document.getElementById("progress-bar").style.width = `${percent}%`;

  } catch (err) {
    console.error("Fehler beim Abrufen:", err);
  }
}

fetchWalletBalance();
setInterval(fetchWalletBalance, 60000);
