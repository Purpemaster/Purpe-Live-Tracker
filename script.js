// Simulierte Daten – normalerweise käme das von einem Server oder einer Blockchain
const donations = {
  SOL: 1383.12,
  PURPE: 2774.50,
  PYUSD: 545.00
};

// Zielbetrag für die Kampagne
const goal = 20000;

// Funktion zur Formatierung von Zahlen mit zwei Dezimalstellen
function formatAmount(amount) {
  return `$${amount.toFixed(2)}`;
}

// Funktion zum Updaten der Anzeige
function updateDisplay() {
  const total = donations.SOL + donations.PURPE + donations.PYUSD;
  const progressPercent = Math.min((total / goal) * 100, 100);

  // Update Progress Bar
  const progressFill = document.querySelector('.progress-fill');
  if (progressFill) {
    progressFill.style.width = `${progressPercent}%`;
  }

  // Update Beträge
  const amounts = document.querySelectorAll('.amounts span');
  if (amounts.length >= 2) {
    amounts[0].textContent = formatAmount(total);
    amounts[1].textContent = formatAmount(goal);
  }

  // Update Text im Info-Box
  const infoBox = document.querySelector('.info-box');
  if (infoBox) {
    infoBox.innerHTML = `
      <p>Purple Pepe is becoming a legend –<br> this wallet is the fuel.</p>
      <p>Your donation powers our journey to the world's biggest exchanges.</p>
      <p>
        SOL: ${formatAmount(donations.SOL)}<br>
        PURPE: ${formatAmount(donations.PURPE)}<br>
        PYUSD: ${formatAmount(donations.PYUSD)}
      </p>
    `;
  }
}

// Aufruf beim Laden der Seite
document.addEventListener('DOMContentLoaded', updateDisplay);
