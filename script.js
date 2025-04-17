const walletAddress = "9uo3TB4a8synap9VMNpby6nzmnMs9xJWmgo2YKJHZWVn";
const heliusApiKey = "2e046356-0f0c-4880-93cc-6d5467e81c73";
const goalUSD = 20000;

async function fetchBalance() {
  const response = await fetch(`https://api.helius.xyz/v0/addresses/${walletAddress}/balances?api-key=${heliusApiKey}`);
  const data = await response.json();

  let total = 0;

  data.tokens.forEach(token => {
    if (token.amount && token.priceInfo?.usdPrice) {
      total += (token.amount / Math.pow(10, token.decimals)) * token.priceInfo.usdPrice;
    }
  });

  const totalUSD = Math.round(total);
  const percentage = Math.min((totalUSD / goalUSD) * 100, 100);

  document.getElementById("current-balance").innerText = `$${totalUSD.toLocaleString()}`;
  document.getElementById("progress").style.width = `${percentage}%`;
}

fetchBalance();
setInterval(fetchBalance, 30000); // Update alle 30 Sekunden
