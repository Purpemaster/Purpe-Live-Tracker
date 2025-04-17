const API_KEY = "5a9f9c0b-5695-464f-8a8e-44dcf3524fe7";
const WALLET_ADDRESS = "9uo3TB4a8synap9VMNpby6nzmnMs9xJWmgo2YKJHZWVn";
const GOAL = 20000;

async function fetchWalletBalance() {
  const url = `https://api.helius.xyz/v0/addresses/${WALLET_ADDRESS}/balances?api-key=${API_KEY}`;
  const res = await fetch(url);
  const data = await res.json();

  let totalUSD = 0;

  for (let token of data.tokens) {
    if (token.priceInfo?.usd) {
      totalUSD += (token.amount / Math.pow(10, token.decimals)) * token.priceInfo.usd;
    }
  }

  totalUSD = Math.round(totalUSD);

  document.getElementById("currentAmount").textContent = `$${totalUSD.toLocaleString()}`;

  const percent = Math.min((totalUSD / GOAL) * 100, 100);
  document.getElementById("progressBar").style.width = `${percent}%`;

  console.log("Wallet Balance (USD):", totalUSD, "Progress:", percent + "%");
}

fetchWalletBalance();
