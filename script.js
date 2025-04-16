document.addEventListener("DOMContentLoaded", () => {
  const fill = document.getElementById("progressFill");
  const amountText = document.getElementById("amountText");
  const goal = 20000;
  const amount = 12345; // Replace with actual API value
  const percent = (amount / goal) * 100;
  fill.style.width = percent + "%";
  amountText.textContent = `$${amount.toLocaleString()} / $${goal.toLocaleString()}`;
});
