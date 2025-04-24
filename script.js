async function fetchPurpePrice() {
  const sources = [];

  // 1. Jupiter
  try {
    const jupRes = await fetch(
      `https://quote-api.jup.ag/v6/quote?inputMint=${PURPE_MINT}&outputMint=Es9vMFrzaCERzVw1e8Jdi9bQ5Z3PvAPbpt4nTTbFzmiM&amount=1000000&slippage=1`
    );
    const jupData = await jupRes.json();
    const jupOutAmount = parseFloat(jupData?.outAmount || "0");
    if (jupOutAmount > 0) {
      const jupPrice = jupOutAmount / 1_000_000;
      sources.push(jupPrice);
    }
  } catch (err) {
    console.warn("Jupiter API failed:", err);
  }

  // 2. Birdeye
  try {
    const birdRes = await fetch(`https://public-api.birdeye.so/public/price?address=${PURPE_MINT}`, {
      headers: { "X-API-KEY": "f80a250b67bc411dadbadadd6ecd2cf2" }
    });
    const birdData = await birdRes.json();
    const birdPrice = parseFloat(birdData?.data?.value || "0");
    if (birdPrice > 0) sources.push(birdPrice);
  } catch (err) {
    console.warn("Birdeye API failed:", err);
  }

  // 3. CoinGecko
  try {
    const geckoRes = await fetch(`https://api.coingecko.com/api/v3/simple/token_price/solana?contract_addresses=${PURPE_MINT}&vs_currencies=usd`);
    const geckoData = await geckoRes.json();
    const geckoPrice = parseFloat(geckoData?.[PURPE_MINT.toLowerCase()]?.usd || "0");
    if (geckoPrice > 0) sources.push(geckoPrice);
  } catch (err) {
    console.warn("CoinGecko API failed:", err);
  }

  // 4. CoinMarketCap
  try {
    const cmcRes = await fetch(`https://pro-api.coinmarketcap.com/v1/cryptocurrency/quotes/latest?symbol=PURPE`, {
      headers: { "X-CMC_PRO_API_KEY": "1e11a548-d5a4-4818-9f11-5ccfb0972f8c" }
    });
    const cmcData = await cmcRes.json();
    const cmcPrice = parseFloat(cmcData?.data?.PURPE?.quote?.USD?.price || "0");
    if (cmcPrice > 0) sources.push(cmcPrice);
  } catch (err) {
    console.warn("CMC API failed:", err);
  }

  // Aggregierter Preis: Durchschnitt
  if (sources.length > 0) {
    const avg = sources.reduce((a, b) => a + b, 0) / sources.length;
    console.log("PURPE Preis aus", sources.length, "Quellen:", avg.toFixed(8));
    return avg;
  } else {
    console.warn("Alle Preisquellen gescheitert – Fallback wird verwendet.");
    return fixedPrices[PURPE_MINT];
  }
}
