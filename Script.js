const donations = {
  SOL: 1383.12,
  PURPE: 2774.50,
  PYUSD: 545.00
};

const goal = 20000;

function formatAmount(amount) {
  return `$${amount.toFixed(2)}`;
}

function updateDisplay() {
  const total = donations.SOL + donations.PURPE + donations.PYUSD;
  const progressPercent = Math.min((total / goal) * 100, 100);

  const progressFill = document.querySelector('.progress-fill');
  if (progressFill) {
    progressFill.style.width = `${progressPercent}%`;
  }

  const amounts = document.querySelectorAll('.amounts span');
  if (amounts.length >= 2) {
    amounts[0].textContent = formatAmount(total);
    amounts[1].textContent = formatAmount(goal);
  }

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

document.addEventListener('DOMContentLoaded', updateDisplay);
