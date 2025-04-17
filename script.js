const apiKey = "2e046356-0f0c-4880-93cc-6d5467e81c73";
const wallet = "9uo3TB4a8synap9VMNpby6nzmnMs9xJWmgo2YKJHZWVn";
const goalUSD = 20000;

async function fetchBalance() {
  const url = `https://api.helius.xyz/v0/addresses/${wallet}/balances?api-key=${apiKey}`;
  try {
    const response = await fetch(url);
    const data = await response.json();

    let totalUSD = 0;

    data.tokens.forEach(token => {
      if (token.price_info?.usd) {
        totalUSD += (token.amount / 10 ** token.decimals) * token.price_info.usd;
      }
    });

    const percentage = Math.min((totalUSD / goalUSD) * 100, 100).toFixed(2);

    document.getElementById("fillBar").style.width = `${percentage}%`;
    document.getElementById("currentAmount").textContent = `$${totalUSD.toFixed(2)}`;

    console.log("Wallet Total:", totalUSD);
  } catch (err) {
    console.error("API error:", err);
  }
}

fetchBalance();
setInterval(fetchBalance, 60000); // alle 60 Sek. neu abrufen
