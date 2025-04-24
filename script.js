ount / 1_000_000; // USDC = 6 decimals
    return price > 0 ? price : fixedPrices[PURPE_MINT];
  } catch (err) {
    console.warn("Jupiter QUOTE API-Fehler für PURPE:", err);
    return fixedPrices[PURPE_MINT];
  }
}

async function fetchWalletBalance() {
  try {
    const res = await fetch(`https://api.helius.xyz/v0/addresses/${walletAddress}/balances?api-key=${heliusApiKey}`);
    const data = await res.json();

    const tokens = data.tokens || [];
    const lamports = data.nativeBalance || 0;
    const sol = lamports / 1_000_000_000;
    const solPrice = await fetchSolPrice();
    const purpePrice = await fetchPurpePrice();
    const solUSD = sol * solPrice;

    let totalUSD = solUSD;
    let breakdown = `SOL: $${solUSD.toFixed(2)}<br>`;

    for (const token of tokens) {
      const { mint, decimals = 6, amount } = token;
      if (mint !== PURPE_MINT) continue;

      const name = mintToName[mint] || mint.slice(0, 4) + "...";
      const realAmount = amount / Math.pow(10, decimals);
      const valueUSD = realAmount * purpePrice;

      if (valueUSD > 0) {
        breakdown += `${name}: $${valueUSD.toFixed(2)}<br>`;
        breakdown += `<small style="opacity:0.6;">1 PURPE = $${purpePrice.toFixed(8)}</small><br>`;
        totalUSD += valueUSD;
      }
    }

    const percent = Math.min((totalUSD / goalUSD) * 100, 100);
    document.getElementById("current-amount").textContent = `$${totalUSD.toFixed(2)}`;
    document.getElementById("progress-fill").style.width = `${percent}%`;
    document.getElementById("breakdown").innerHTML = breakdown;

    const now = new Date();
    const timeString = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
    document.getElementById("last-updated").textContent = `Last updated: ${timeString}`;
  } catch (err) {
    console.error("Fehler beim Wallet-Abruf:", err);
  }
}

fetchWalletBalance();
setInterval(fetchWalletBalance, 60000);
