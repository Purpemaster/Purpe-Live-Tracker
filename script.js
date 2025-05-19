document.addEventListener("DOMContentLoaded", () => {
  const walletAddress = "9uo3TB4a8synap9VMNpby6nzmnMs9xJWmgo2YKJHZWVn";
  const heliusApiKey = "9cf905ed-105d-46a7-b7fa-7440388b6e9f";

  const PURPE_MINT = "HBoNJ5v8g71s2boRivrHnfSB5MVPLDHHyVjruPfhGkvL";
  const RAYDIUM_POOL = "CpoYFgaNA6MJRuJSGeXu9mPdghmtwd5RvYesgej4Zofj";

  const goalUSD1 = 20000;
  const goalUSD2 = 40000;

  // QR-Code generieren
  new QRious({
    element: document.getElementById('wallet-qr'),
    value: `solana:${walletAddress}`,
    size: 200,
    background: 'white',
    foreground: '#8000ff'
  });

  // Splash-Screen ausblenden
  setTimeout(() => {
    const splash = document.getElementById('splash');
    if (splash) splash.style.display = 'none';
  }, 3000);

  // Preis-APIs
  async function fetchSolPrice() {
    try {
      const res = await fetch("https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd", { cache: "no-cache" });
      const data = await res.json();
      return data.solana.usd || 0;
    } catch (err) {
      console.error("Fehler bei SOL-Preis:", err);
      return 0;
    }
  }

  async function fetchPurpePriceUSD() {
    try {
      const res = await fetch(`https://api.geckoterminal.com/api/v2/networks/solana/pools/${RAYDIUM_POOL}`, {
        cache: "no-cache"
      });
      const data = await res.json();
      return parseFloat(data.data.attributes.base_token_price_usd);
    } catch (err) {
      console.error("Fehler beim PURPE-Preis:", err);
      return 0;
    }
  }

  // Wallet Balance
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
      console.error("Fehler bei Wallet-Daten:", err);
      return { solBalance: 0, purpeBalance: 0 };
    }
  }

  // Fortschrittsbalken aktualisieren
  function updateProgress(totalUSD) {
    const percent1 = Math.min((totalUSD / goalUSD1) * 100, 100);
    document.getElementById("progress-fill-1").style.width = `${percent1}%`;
    document.getElementById("current-amount").textContent = `$${totalUSD.toFixed(2)}`;
  }

  // Tracker
  async function updateTracker() {
    try {
      const [wallet, solPrice, purpePriceUSD] = await Promise.all([
        fetchWalletBalances(),
        fetchSolPrice(),
        fetchPurpePriceUSD()
      ]);

      if (!wallet || !solPrice || !purpePriceUSD) {
        console.error("Fehler bei Daten.");
        document.getElementById("current-amount").textContent = "---";
        return;
      }

      const solUSD = wallet.solBalance * solPrice;
      const purpeUSD = wallet.purpeBalance * purpePriceUSD;
      const totalUSD = solUSD + purpeUSD;

      updateProgress(totalUSD);

      const now = new Date();
      const formatted = now.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        timeZoneName: "short"
      });

      document.getElementById("last-updated").textContent = `Latest Update: ${formatted}`;
    } catch (err) {
      console.error("Fehler beim Update:", err);
      document.getElementById("current-amount").textContent = "---";
    }
  }

  // Spendenbuttons
  function setupDonationButtons() {
    document.getElementById("donate-sol").addEventListener("click", () => {
      const solanaPayLink = `solana:${walletAddress}?amount=1&label=Purple%20Pepe%20Donation&message=Thanks%20for%20supporting!`;
      window.location.href = solanaPayLink;
    });

    document.getElementById("donate-purpe").addEventListener("click", () => {
      const purpeAmount = 3_000_000;
      const purpePayLink = `solana:${walletAddress}?amount=${purpeAmount}&spl-token=${PURPE_MINT}&label=Purple%20Pepe%20Donation&message=Thanks%20for%20your%20PURPE%20support!`;
      window.location.href = purpePayLink;
    });
  }

  // Wallet-Adresse kopieren
  function setupCopyButton() {
    const copyBtn = document.getElementById("copy-button");
    const addressText = document.getElementById("wallet-address").textContent.trim();

    if (copyBtn) {
      copyBtn.addEventListener("click", () => {
        navigator.clipboard.writeText(addressText).then(() => {
          alert("Wallet address copied!");
        }).catch(() => {
          alert("Copy failed.");
        });
      });
    }
  }

  // Starten nach DOM ready
  updateTracker();
  setInterval(updateTracker, 30000);
  setupDonationButtons();
  setupCopyButton();
});
