// solana-pyusd-check.js

const SOLANA_WALLET = "2b1kV6DkPAnxd5ixfnxCpjxmKwqjjaYmCZfHsFu24GXo";
const PYUSD_MINT = "F64NDwsvzu2i3KSYDhrPaZVJQDXZeZ37cZWLN1LduBNY";
const HELIUS_API_KEY = "2e046356-0f0c-4880-93cc-6d5467e81c73";

async function fetchSolanaPYUSD() {
  const url = `https://api.helius.xyz/v0/addresses/${SOLANA_WALLET}/transactions?api-key=${HELIUS_API_KEY}`;

  try {
    const res = await fetch(url);
    const txs = await res.json();

    let totalPYUSD = 0;

    txs.forEach(tx => {
      if (!tx.tokenTransfers) return;

      tx.tokenTransfers.forEach(transfer => {
        if (
          transfer.tokenMint === PYUSD_MINT &&
          transfer.toUserAccount === SOLANA_WALLET
        ) {
          totalPYUSD += transfer.amount / Math.pow(10, transfer.decimals);
        }
      });
    });

    // Übergabe ans bestehende Donations-Objekt
    if (typeof donations !== "undefined") {
      donations.PYUSD = totalPYUSD;
      if (typeof updateDisplay === "function") updateDisplay();
    }
  } catch (err) {
    console.error("Fehler beim Abrufen der PYUSD-Daten über Helius:", err);
  }
}
