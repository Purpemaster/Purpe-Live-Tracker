// Splash screen removal AFTER full page (incl. GIF) is loaded
window.addEventListener("load", () => {
  console.log("window loaded ✅");

  setTimeout(() => {
    const splash = document.getElementById("splash");
    const main = document.getElementById("main-content");

    if (splash && main) {
      splash.classList.add("hidden");
      main.classList.remove("hidden");
      document.body.classList.add("loaded");
      console.log("Splash removed ✅");
    } else {
      console.error("Splash or main-content not found");
    }
  }, 4000);
});

// Donation tracker + logic after DOM is ready
document.addEventListener("DOMContentLoaded", () => {
  console.log("script.js running ✅");

  const walletAddress = "9uo3TB4a8synap9VMNpby6nzmnMs9xJWmgo2YKJHZWVn";
  const heliusApiKey = "9cf905ed-105d-46a7-b7fa-7440388b6e9f";
  const PURPE_MINT = "HBoNJ5v8g71s2boRivrHnfSB5MVPLDHHyVjruPfhGkvL";
  const RAYDIUM_POOL = "CpoYFgaNA6MJRuJSGeXu9mPdghmtwd5RvYesgej4Zofj";
  const goalUSD = 20000;

  // Create QR code
  new QRious({
    element: document.getElementById("wallet-qr"),
    value: `solana:${walletAddress}`,
    size: 200,
    background: "white",
    foreground: "#8000ff"
  });

  // Fetch SOL price from CoinGecko
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

  // Fetch PURPE price from GeckoTerminal
  async function fetchPurpePrice() {
    try {
      const res = await fetch(`https://api.geckoterminal.com/api/v2/networks/solana/pools/${RAYDIUM_POOL}`);
      const data = await res.json();
      return parseFloat(data.data.attributes.base_token_price_usd);
    } catch (err) {
      console.error("Error fetching PURPE price:", err);
      return 0;
    }
  }

  // Get wallet balances via Helius
  async function fetchWalletBalances() {
    try {
      const res = await fetch(`https://api.helius.xyz/v0/addresses/${walletAddress}/balances?api-key=${heliusApiKey}`);
      const data = await res.json();
      const solBalance = data.nativeBalance / 1e9;
      const purpeToken = (data.tokens || []).find(t => t.mint === PURPE_MINT);
      const purpeBalance = purpeToken ? purpeToken.amount / Math.pow(10, purpeToken.decimals || 6) : 0;
      return { solBalance, purpeBalance };
    } catch (err) {
      console.error("Error fetching wallet balances:", err);
      return { solBalance: 0, purpeBalance: 0 };
    }
  }

  // Update the tracker bar and text
  async function updateTracker() {
    const [wallet, solPrice, purpePrice] = await Promise.all([
      fetchWalletBalances(),
      fetchSolPrice(),
      fetchPurpePrice()
    ]);

    const solUSD = wallet.solBalance * solPrice;
    const purpeUSD = wallet.purpeBalance * purpePrice;
    const totalUSD = solUSD + purpeUSD;

    document.getElementById("current-amount").textContent = `$${totalUSD.toFixed(2)}`;
    document.getElementById("progress-fill-1").style.width = `${Math.min((totalUSD / goalUSD) * 100, 100)}%`;

    const now = new Date();
    document.getElementById("last-updated").textContent =
      `Last update: ${now.toLocaleTimeString("en-US", { hour12: false })}`;
  }

  // Set up donation buttons
  document.getElementById("donate-sol").addEventListener("click", () => {
    const url = `solana:${walletAddress}?amount=1&label=Purple%20Pepe%20Donation&message=Thanks%20for%20supporting!`;
    window.location.href = url;
  });

  document.getElementById("donate-purpe").addEventListener("click", () => {
    const url = `solana:${walletAddress}?amount=3000000&spl-token=${PURPE_MINT}&label=Purple%20Pepe%20Donation&message=Thanks%20for%20your%20PURPE%20support!`;
    window.location.href = url;
  });

  // Copy wallet address
  document.getElementById("copy-button").addEventListener("click", () => {
    const addr = document.getElementById("wallet-address").textContent.trim();
    navigator.clipboard.writeText(addr)
      .then(() => alert("Wallet address copied!"))
      .catch(() => alert("Copy failed."));
  });

  // Radio switching
  const audio = document.getElementById("pepe-radio");
  const stations = document.querySelectorAll(".radio-station");

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

  stations[0].classList.add("active");

  // Start tracker updates
  updateTracker();
  setInterval(updateTracker, 30000);
});
