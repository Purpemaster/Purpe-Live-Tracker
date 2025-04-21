const walletAddress = "9uo3TB4a8synap9VMNpby6nzmnMs9xJWmgo2YKJHZWVn";
const heliusApiKey = "2e046356-0f0c-4880-93cc-6d5467e81c73";
const goal = 20000;

const TARGET_TOKENS = {
  SOL: { name: "SOL", price: 100 },
  PURPE: { name: "PURPE", price: 0.05 },
  PYUSD: { name: "PYUSD", price: 1 }
};

async function fetchBalances() {
  try {
    const response = await fetch(`https://api.helius.xyz/v0/addresses/${walletAddress}/balances?api-key=${heliusApiKey}`);
    const data = await response.json();

    const sol = data.nativeBalance / 1e9;
    const tokenBalances = data.tokens || [];

    let totals = {
      SOL: sol * TARGET_TOKENS.SOL.price,
      PURPE: 0,
      PYUSD: 0
    };

    tokenBalances.forEach(token => {
      const tokenName = token.tokenInfo?.name?.toUpperCase();
      const amount = token.amount / Math.pow(10, token.decimals);
      if (TARGET_TOKENS[tokenName]) {
        totals[tokenName] = amount * TARGET_TOKENS[tokenName].price;
      }
    });

    const total = totals.SOL + totals.PURPE + totals.PYUSD;
    const percent = Math.min(100, (total / goal) * 100);

    document.getElementById("solAmount").innerText = `SOL: $${totals.SOL.toFixed(2)}`;
    document.getElementById("purpeAmount").innerText = `PURPE: $${totals.PURPE.toFixed(2)}`;
    document.getElementById("pyusdAmount").innerText = `PYUSD: $${totals.PYUSD.toFixed(2)}`;
    document.getElementById("totalAmount").innerText = `Total: $${total.toFixed(2)}`;
    document.getElementById("progress-bar").style.width = `${percent}%`;
    document.getElementById("progress-bar").innerText = `${percent.toFixed(1)}%`;

  } catch (error) {
    console.error("Fehler beim Abrufen der Daten:", error);
  }
}

fetchBalances();
setInterval(fetchBalances, 60000);
