const HELIUS_API_KEY = "2e046356-0f0c-4880-93cc-6d5467e81c73";
const WALLET_ADDRESS = "9uo3TB4a8synap9VMNpby6nzmnMs9xJWmgo2YKJHZWVn";
const GOAL = 20000;

async function fetchBalance() {
  const url = `https://api.helius.xyz/v0/addresses/${WALLET_ADDRESS}/balances?api-key=${HELIUS_API_KEY}`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    const tokens = data.tokens || [];

    let totalUSD = 0;

    tokens.forEach(token => {
      if (token.amount && token.price_info?.price_per_token) {
        const tokenUSD = (token.amount / (10 ** token.decimals)) * token.price_info.price_per_token;
        totalUSD += tokenUSD;
      }
    });

    const progressPercent = Math.min((totalUSD / GOAL) * 100, 100).toFixed(1);

    document.getElementById("usd-left").textContent = `$${totalUSD.toFixed(2)}`;
    document.getElementById("usd-right").textContent = `$${GOAL.toLocaleString()}`;
    document.getElementById("progress-fill").style.width = `${progressPercent}%`;

    console.log("Gesamtbetrag:", totalUSD.toFixed(2), "USD");

  } catch (error) {
    console.error("Fehler beim Abrufen der Wallet-Balance:", error);
  }
}

fetchBalance();
