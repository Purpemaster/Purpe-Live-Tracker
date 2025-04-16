document.addEventListener("DOMContentLoaded", async () => {
  const wallet = "9uo3TB4a8synap9VMNpby6nzmnMs9xJWmgo2YKJHZWVn";
  const heliusAPI = "5a9f9c0b-5695-464f-8a8e-44dcf3524fe7";
  const endpoint = `https://api.helius.xyz/v0/addresses/${wallet}/balances?api-key=${heliusAPI}`;

  try {
    const response = await fetch(endpoint);
    const data = await response.json();

    const solBalanceLamports = data.nativeBalance?.lamports || 0;
    const solBalance = solBalanceLamports / 1000000000;
    const usdValue = solBalance * 100; // Approx. conversion
    const goal = 20000;
    const percent = Math.min((usdValue / goal) * 100, 100);

    document.getElementById("progressFill").style.width = `${percent}%`;
    document.getElementById("amountText").innerText = `$${usdValue.toFixed(2)} / $${goal.toLocaleString()}`;
  } catch (error) {
    console.error("Error fetching donation data:", error);
  }
});
