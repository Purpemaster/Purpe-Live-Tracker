const donations = {
  SOL: 1385.28,
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

  const currentAmount = document.querySelector('#current-amount');
  const goalAmount = document.querySelector('#goal-amount');

  if (currentAmount && goalAmount) {
    currentAmount.textContent = formatAmount(total);
    goalAmount.textContent = formatAmount(goal);
  }

  const breakdownBox = document.getElementById('breakdown');
  if (breakdownBox) {
    breakdownBox.innerHTML = `
      SOL: ${formatAmount(donations.SOL)}<br>
      PURPE: ${formatAmount(donations.PURPE)}<br>
      PYUSD: ${formatAmount(donations.PYUSD)}
    `;
  }
}

document.addEventListener('DOMContentLoaded', updateDisplay);
