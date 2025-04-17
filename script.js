const balanceEl = document.getElementById("balance");
const progressEl = document.getElementById("progress");

const API_KEY = "2e046356-0f0c-4880-93cc-6d5467e81c73";
const WALLET = "9uo3TB4a8synap9VMNpby6nzmnMs9xJWmgo2YKJHZWVn";
const GOAL = 20000;

async function fetchBalance() {
  try {
    const res = await fetch(`https://api.helius.xyz/v0/addresses/${WALLET}/balances?api-key=${API_KEY}`);
    const json = await res.json();

    let totalUSD = 0;

    json.tokens.forEach((token) => {
      if (["USDC", "SOL", "PURPE"].includes(token.tokenSymbol) && token.amountUSD) {
        totalUSD += parseFloat(token.amountUSD);
      }
    });

    totalUSD = Math.round(totalUSD);
    balanceEl.textContent = `$${totalUSD.toLocaleString()}`;

    const percent = Math.min((totalUSD / GOAL) * 100, 100);
    progressEl.style.width = `${percent}%`;
  } catch (e) {
    console.error("Error loading balance:", e);
  }
}

fetchBalance();
setInterval(fetchBalance, 60000); // aktualisiere alle 60 Sekunden
