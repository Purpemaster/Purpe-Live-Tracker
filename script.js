document.addEventListener("DOMContentLoaded", () => {
  const walletAddress = "9uo3TB4a8synap9VMNpby6nzmnMs9xJWmgo2YKJHZWVn";
  const heliusApiKey = "9cf905ed-105d-46a7-b7fa-7440388b6e9f";
  const PURPE_MINT = "HBoNJ5v8g71s2boRivrHnfSB5MVPLDHHyVjruPfhGkvL";
  const RAYDIUM_POOL = "CpoYFgaNA6MJRuJSGeXu9mPdghmtwd5RvYesgej4Zofj";
  const goalUSD1 = 20000;

  // 🌌 Splash Fade Out
  const splash = document.getElementById("splash");
  setTimeout(() => {
    if (splash) {
      splash.style.opacity = "0";
      setTimeout(() => {
        splash.remove();
      }, 800); // Zeit passend zur CSS transition
    }
  }, 3000);

  // 🧿 QR-Code generieren
  new QRious({
    element: document.getElementById("wallet-qr"),
    value: `solana:${walletAddress}`,
    size: 200,
    background: "white",
    foreground: "#8000ff"
  });

  // 🔥 Preis-APIs
  async function fetchSolPrice() {
    try {
      const res = await fetch("https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd");
      const data = await res.json();
      return data.solana.usd || 0;
    } catch (err) {
      console.error("Error fetching SOL price:", err);
      return 0;
    }
  }

  async function fetchPurpePriceUSD() {
    try {
      const res = await fetch(`https://api.geckoterminal.com/api/v2/networks/solana/pools/${RAYDIUM_POOL}`);
      const data = await res.json();
      return parseFloat(data.data.attributes.base_token_price_usd);
    } catch (err) {
      console.error("Error fetching PURPE price:", err);
      return 0;
    }
  }

  // 💰 Wallet Balance
  async function fetchWalletBalances() {
    try {
      const res = await fetch(`https://api.helius.xyz/v0/addresses/${walletAddress}/balances?api-key=${heliusApiKey}`);
      const data = await res.json();
      const tokens = data.tokens || [];
      const solBalance = (data.nativeBalance || 0) / 1_000_000_000;

      const purpeToken = tokens.find(t => t.mint === PURPE_MINT);
      const purpeBalance = purpeToken ? purpeToken.amount / Math.pow(10, purpeToken.decimals || 6) : 0;

      return { solBalance, purpeBalance };
    } catch (err) {
      console.error("Error fetching wallet data:", err);
      return { solBalance: 0, purpeBalance: 0 };
    }
  }

  // 📊 Fortschrittsbalken aktualisieren
  function updateProgress(totalUSD) {
    const percent = Math.min((totalUSD / goalUSD1) * 100, 100);
    document.getElementById("progress-fill-1").style.width = `${percent}%`;
    document.getElementById("current-amount").textContent = `$${totalUSD.toFixed(2)}`;
  }

  // 🔄 Donation Tracker aktualisieren
  async function updateTracker() {
    try {
      const [wallet, solPrice, purpePriceUSD] = await Promise.all([
        fetchWalletBalances(),
        fetchSolPrice(),
        fetchPurpePriceUSD()
      ]);

      if (!wallet || !solPrice || !purpePriceUSD) {
        document.getElementById("current-amount").textContent = "---";
        return;
      }

      const solUSD = wallet.solBalance * solPrice;
      const purpeUSD = wallet.purpeBalance * purpePriceUSD;
      const totalUSD = solUSD + purpeUSD;

      updateProgress(totalUSD);

      const now = new Date();
      const formatted = now.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit"
      });

      document.getElementById("last-updated").textContent = `Last update: ${formatted}`;
    } catch (err) {
      console.error("Update error:", err);
      document.getElementById("current-amount").textContent = "---";
    }
  }

  // 🎁
});
