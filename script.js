const walletAddress = "9uo3TB4a8synap9VMNpby6nzmnMs9xJWmgo2YKJHZWVn";
const apiKey = "2e046356-0f0c-4880-93cc-6d5467e81c73";
const goalUSD = 20000;

async function fetchWalletBalance() {
  try {
    const response = await fetch(`https://api.helius.xyz/v0/addresses/${walletAddress}/balances?api-key=${apiKey}`);
    const data = await response.json();

    let solUSD = 0;
    let tokenUSD = 0;

    if (data.nativeBalance && data.nativeBalance.usd) {
      solUSD = data.nativeBalance.usd;
    }

    if (data.tokens && Array.isArray(data.tokens)) {
      data.tokens.forEach(token => {
        const symbol = token?.tokenInfo?.symbol?.toUpperCase() || "";
        if (["USDC", "PURPE", "PURPLE", "PAYPALUSD"].includes(symbol)) {
          tokenUSD += token.amount * (token.tokenInfo?.price || 0);
        }
      });
    }

    const totalUSD = solUSD + tokenUSD;
    const percent = Math.min((totalUSD / goalUSD) * 100, 100);

    // Update UI
    document.getElementById("raised-amount").textContent = `$${totalUSD.toFixed(2)}`;
    document.getElementById("progress-bar").style.width = `${percent}%`;

    console.log("Wallet Balance:", { solUSD, tokenUSD, totalUSD, percent });
  } catch (error) {
    console.error("Error fetching wallet balance:", error);
  }
}

// Run on load and refresh every 60 seconds
fetchWalletBalance();
setInterval(fetchWalletBalance, 60000);
