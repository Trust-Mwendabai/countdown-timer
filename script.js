// Cache DOM elements
const elements = {
  form: document.getElementById('countdownForm'),
  eventTitle: document.getElementById('eventTitle'),
  eventDate: document.getElementById('eventDate'),
  bgColorPicker: document.getElementById('bgColorPicker'),
  titleDisplay: document.getElementById('titleDisplay'),
  mainBody: document.getElementById('mainBody'),
  countdown: document.getElementById('countdown'),
  days: document.getElementById('days'),
  hours: document.getElementById('hours'),
  minutes: document.getElementById('minutes'),
  seconds: document.getElementById('seconds')
};

let countdownInterval;

// Format time unit with leading zero
function formatTimeUnit(unit) {
  return unit < 10 ? `0${unit}` : unit;
}

// Calculate time remaining
function calculateTimeRemaining(targetDate) {
  const now = new Date().getTime();
  const distance = targetDate - now;
  
  if (distance < 0) return null;
  
  return {
    days: Math.floor(distance / (1000 * 60 * 60 * 24)),
    hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
    minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
    seconds: Math.floor((distance % (1000 * 60)) / 1000)
  };
}

// Update countdown display
function updateCountdownDisplay(timeRemaining) {
  if (!timeRemaining) {
    elements.countdown.innerHTML = `
      <div class="alert alert-success" role="alert">
        <h3>🎉 Event Started!</h3>
        <p>Your countdown has completed.</p>
      </div>`;
    return false;
  }
  
  elements.days.textContent = formatTimeUnit(timeRemaining.days);
  elements.hours.textContent = formatTimeUnit(timeRemaining.hours);
  elements.minutes.textContent = formatTimeUnit(timeRemaining.minutes);
  elements.seconds.textContent = formatTimeUnit(timeRemaining.seconds);
  return true;
}

// Save countdown data to localStorage
function saveCountdown(title, date, bgColor) {
  const data = {
    title,
    date,
    bgColor,
    timestamp: new Date().getTime()
  };
  localStorage.setItem('countdownData', JSON.stringify(data));
}

// Load countdown data from localStorage
function loadCountdown() {
  const savedData = localStorage.getItem('countdownData');
  if (savedData) {
    const data = JSON.parse(savedData);
    elements.eventTitle.value = data.title;
    elements.eventDate.value = data.date;
    elements.bgColorPicker.value = data.bgColor;
    applyCountdown(data.title, data.date, data.bgColor);
  }
}

// Share countdown
function shareCountdown() {
  const title = elements.titleDisplay.textContent;
  const date = elements.eventDate.value;
  
  if (navigator.share) {
    navigator.share({
      title: 'Event Countdown',
      text: `Join me for: ${title} on ${new Date(date).toLocaleString()}`,
      url: window.location.href
    }).catch(console.error);
  } else {
    // Fallback for browsers that don't support Web Share API
    const shareText = `Join me for: ${title} on ${new Date(date).toLocaleString()}`;
    const textarea = document.createElement('textarea');
    textarea.value = shareText;
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);
    alert('Countdown details copied to clipboard!');
  }
}

// Start countdown
function startCountdown(event) {
  event.preventDefault();
  
  if (!elements.form.checkValidity()) {
    elements.form.classList.add('was-validated');
    return;
  }

  const title = elements.eventTitle.value || 'Countdown Event';
  const dateInput = elements.eventDate.value;
  const bgColor = elements.bgColorPicker.value;

  if (!dateInput) {
    alert('Please select a date and time.');
    return;
  }

  const targetDate = new Date(dateInput).getTime();
  const now = new Date().getTime();

  if (targetDate <= now) {
    alert('Please select a future date and time.');
    return;
  }

  elements.titleDisplay.textContent = title;
  elements.mainBody.style.backgroundColor = bgColor;

  if (countdownInterval) clearInterval(countdownInterval);

  countdownInterval = setInterval(() => {
    const timeRemaining = calculateTimeRemaining(targetDate);
    if (!updateCountdownDisplay(timeRemaining)) {
      clearInterval(countdownInterval);
    }
  }, 1000);

  // Save countdown data
  saveCountdown(title, dateInput, bgColor);

  // Switch to countdown tab
  const countdownTab = document.querySelector('#countdown-tab');
  const tab = new bootstrap.Tab(countdownTab);
  tab.show();
}

// Clear countdown
function clearCountdown() {
  if (confirm('Are you sure you want to clear the countdown?')) {
    localStorage.removeItem('countdownData');
    elements.form.reset();
    elements.form.classList.remove('was-validated');
    elements.titleDisplay.textContent = 'Your Event Title';
    elements.mainBody.style.backgroundColor = '#ffffff';
    if (countdownInterval) {
      clearInterval(countdownInterval);
    }
    location.reload();
  }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  // Form submission
  elements.form.addEventListener('submit', startCountdown);

  // Load saved countdown
  loadCountdown();

  // Smooth scroll for navigation
  document.querySelectorAll('.nav-link').forEach(tab => {
    tab.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  });

  // Clean up on page unload
  window.addEventListener('unload', () => {
    if (countdownInterval) clearInterval(countdownInterval);
  });
});
  