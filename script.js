const walletAddress = "9uo3TB4a8synap9VMNpby6nzmnMs9xJWmgo2YKJHZWVn";
const apiKey = "2e046356-0f0c-4880-93cc-6d5467e81c73";
const goalUSD = 20000;

async function fetchWalletBalance() {
  try {
    const response = await fetch(`https://api.helius.xyz/v0/addresses/${walletAddress}/balances?api-key=${apiKey}`);
    const data = await response.json();

    let solUSD = Number(data.nativeBalance?.usd || 0);
    let tokenUSD = 0;

    if (Array.isArray(data.tokens)) {
      data.tokens.forEach(token => {
        const symbol = token?.tokenInfo?.symbol?.toUpperCase() || "";
        const price = Number(token?.tokenInfo?.price || 0);
        const amount = Number(token?.amount || 0);
        if (["USDC", "PURPE", "PURPLE", "PAYPALUSD"].includes(symbol)) {
          tokenUSD += amount * price;
        }
      });
    }

    const totalUSD = solUSD + tokenUSD;
    const percent = Math.min((totalUSD / goalUSD) * 100, 100);

    const amountElem = document.getElementById("raised-amount");
    const barElem = document.getElementById("progress-bar");

    if (amountElem && barElem) {
      amountElem.textContent = `$${totalUSD.toFixed(2)}`;
      barElem.style.width = `${percent}%`;
    } else {
      console.warn("DOM-Elemente nicht gefunden");
    }

    console.log("Wallet Balance:", { solUSD, tokenUSD, totalUSD, percent });

  } catch (error) {
    console.error("Fehler beim Abrufen des Wallet-Guthabens:", error);
  }
}

// Run on load and refresh every 60 seconds
fetchWalletBalance();
setInterval(fetchWalletBalance, 60000);
