document.addEventListener("DOMContentLoaded", () => {
  console.log("script.js loaded ✅");

  const walletAddress = "9uo3TB4a8synap9VMNpby6nzmnMs9xJWmgo2YKJHZWVn";
  const heliusApiKey = "9cf905ed-105d-46a7-b7fa-7440388b6e9f";
  const PURPE_MINT = "HBoNJ5v8g71s2boRivrHnfSB5MVPLDHHyVjruPfhGkvL";
  const RAYDIUM_POOL = "CpoYFgaNA6MJRuJSGeXu9mPdghmtwd5RvYesgej4Zofj";

  const goalUSD = 20000;

  // Splash Timeout
  setTimeout(() => {
    document.getElementById("splash").classList.add("hidden");
    document.getElementById("main-content").classList.remove("hidden");
    console.log("Splash hidden ✅");
  }, 4000);

  new QRious({
    element: document.getElementById("wallet-qr"),
    value: `solana:${walletAddress}`,
    size: 200,
    background: "white",
    foreground: "#8000ff"
  });

  async function fetchSolPrice() {
    try {
      const res = await fetch("https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd");
      const data = await res.json();
      return data.solana.usd || 0;
    } catch {
      return 0;
    }
  }

  async function fetchPurpePrice() {
    try {
      const res = await fetch(`https://api.geckoterminal.com/api/v2/networks/solana/pools/${RAYDIUM_POOL}`);
      const data = await res.json();
      return parseFloat(data.data.attributes.base_token_price_usd);
    } catch {
      return 0;
    }
  }

  async function fetchWalletBalances() {
    try {
      const res = await fetch(`https://api.helius.xyz/v0/addresses/${walletAddress}/balances?api-key=${heliusApiKey}`);
      const data = await res.json();
      const tokens = data.tokens || [];
      const solBalance = data.nativeBalance / 1e9;
      const purpeToken = tokens.find(t => t.mint === PURPE_MINT);
      const purpeBalance = purpeToken ? purpeToken.amount / Math.pow(10, purpeToken.decimals || 6) : 0;
      return { solBalance, purpeBalance };
    } catch {
      return { solBalance: 0, purpeBalance: 0 };
    }
  }

  async function updateTracker() {
    const [wallet, solPrice, purpePrice] = await Promise.all([
      fetchWalletBalances(),
      fetchSolPrice(),
      fetchPurpePrice()
    ]);
    const totalUSD = wallet.solBalance * solPrice + wallet.purpeBalance * purpePrice;
    document.getElementById("current-amount").textContent = `$${totalUSD.toFixed(2)}`;
    const percent = Math.min((totalUSD / goalUSD) * 100, 100);
    document.getElementById("progress-fill-1").style.width = `${percent}%`;
    const now = new Date().toLocaleTimeString("en-US", { hour12: false });
    document.getElementById("last-updated").textContent = `Last update: ${now}`;
  }

  document.getElementById("donate-sol").onclick = () => {
    window.location.href = `solana:${walletAddress}?amount=1&label=Purple%20Pepe%20Donation`;
  };

  document.getElementById("donate-purpe").onclick = () => {
    window.location.href = `solana:${walletAddress}?amount=3000000&spl-token=${PURPE_MINT}`;
  };

  document.getElementById("copy-button").onclick = () => {
    const addr = document.getElementById("wallet-address").textContent.trim();
    navigator.clipboard.writeText(addr).then(() => alert("Copied!"));
  };

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
      audio.play().catch(console.warn);
    });
  });
  stations[0].classList.add("active");

  updateTracker();
  setInterval(updateTracker, 30000);
});
