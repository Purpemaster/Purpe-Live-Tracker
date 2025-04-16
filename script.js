document.addEventListener("DOMContentLoaded", async () => {
  const wallet = "9uo3TB4a8synap9VMNpby6nzmnMs9xJWmgo2YKJHZWVn";
  const heliusAPI = "5a9f9c0b-5695-464f-8a8e-44dcf3524fe7";
  const endpoint = `https://api.helius.xyz/v0/addresses/${wallet}/balances?api-key=${heliusAPI}`;

  try {
    const response = await fetch(endpoint);
    const data = await response.json();
    const lamports = data.nativeBalance?.lamports || 0;
    const sol = lamports / 1_000_000_000;
    const usd = sol * 100; // Basic SOL to USD estimate
    const goal = 20000;
    const percent = Math.min((usd / goal) * 100, 100);

    document.getElementById("progressFill").style.width = `${percent}%`;
    document.getElementById("currentAmount").innerText = `$${usd.toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
  } catch (error) {
    console.error("Error fetching data:", error);
    document.getElementById("currentAmount").innerText = "Error";
  }
});
