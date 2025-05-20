document.addEventListener("DOMContentLoaded", () => {
  const walletAddress = "9uo3TB4a8synap9VMNpby6nzmnMs9xJWmgo2YKJHZWVn";
  const heliusApiKey = "9cf905ed-105d-46a7-b7fa-7440388b6e9f";
  const PURPE_MINT = "HBoNJ5v8g71s2boRivrHnfSB5MVPLDHHyVjruPfhGkvL";
  const RAYDIUM_POOL = "CpoYFgaNA6MJRuJSGeXu9mPdghmtwd5RvYesgej4Zofj";
  const goalUSD = 20000;

  // Fade out splash screen after 2 seconds
  setTimeout(() => {
    const splash = document.getElementById("splash");
    if (splash) splash.classList.add("hidden");
  }, 2000);

  // Generate QR code
  new QRious({
    element: document.getElementById("wallet-qr"),
    value: `solana:${walletAddress}`,
    size: 200,
    background: 'white',
    foreground: '#8000ff'
  });

  // Fetch SOL price
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

  // Fetch PURPE token price
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

  // Fetch wallet balances
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
      console.error("Error fetching wallet balances:", err);
      return { solBalance: 0, purpeBalance: 0 };
    }
  }

  // Update progress bar
  function updateProgress(totalUSD) {
    const percent = Math.min((totalUSD / goalUSD) * 100, 100);
    document.getElementById("progress-fill-1").style.width = `${percent}%`;
    document.getElementById("current-amount").textContent = `$${totalUSD.toFixed(2)}`;
  }

  // Update all donation data
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

      document.getElementById("last-updated").textContent = `Last update: ${formatted} UTC`;
    } catch (err) {
      console.error("Error updating tracker:", err);
      document.getElementById("current-amount").textContent = "---";
    }
  }

  // Donation buttons
  document.getElementById("donate-sol").addEventListener("click", () => {
    const link = `solana:${walletAddress}?amount=1&label=Purple%20Pepe%20Donation&message=Thanks%20for%20supporting!`;
    window.location.href = link;
  });

  document.getElementById("donate-purpe").addEventListener("click", () => {
    const link = `solana:${walletAddress}?amount=3000000&spl-token=${PURPE_MINT}&label=Purple%20Pepe%20Donation&message=Thanks%20for%20your%20PURPE%20support!`;
    window.location.href = link;
  });

  // Copy to clipboard
  document.getElementById("copy-button").addEventListener("click", () => {
    const addr = document.getElementById("wallet-address").textContent.trim();
    navigator.clipboard.writeText(addr).then(() => {
      alert("Address copied to clipboard!");
    });
  });

  // Radio station switching
  const stations = document.querySelectorAll(".radio-station");
  const audio = document.getElementById("pepe-radio");

  stations.forEach(station => {
    station.addEventListener("click", () => {
      stations.forEach(s => s.classList.remove("active"));
      station.classList.add("active");

      const src = station.getAttribute("data-src");
      audio.pause();
      audio.src = src;
      audio.load();
      audio.play().catch(err => console.warn("Autoplay blocked:", err));
    });
  });

  // Default to first station
  stations[0].classList.add("active");

  // Start update loop
  updateTracker();
  setInterval(updateTracker, 30000);
});
