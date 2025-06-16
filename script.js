let countdownInterval;

function startCountdown() {
  const title = document.getElementById("eventTitle").value || "Countdown Event";
  const dateInput = document.getElementById("eventDate").value;
  const bgColor = document.getElementById("bgColorPicker").value;

  if (!dateInput) {
    alert("Please select a date and time.");
    return;
  }

  document.getElementById("titleDisplay").textContent = title;
  document.getElementById("mainBody").style.backgroundColor = bgColor;

  const targetDate = new Date(dateInput).getTime();

  if (countdownInterval) clearInterval(countdownInterval);

  countdownInterval = setInterval(() => {
    const now = new Date().getTime();
    const distance = targetDate - now;

    if (distance < 0) {
      clearInterval(countdownInterval);
      document.getElementById("countdown").innerHTML = "<h3>Event Started!</h3>";
      return;
    }

    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);

    document.getElementById("days").textContent = days;
    document.getElementById("hours").textContent = hours;
    document.getElementById("minutes").textContent = minutes;
    document.getElementById("seconds").textContent = seconds;
  }, 1000);
}
document.querySelectorAll('.nav-link').forEach(tab => {
    tab.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  });
  