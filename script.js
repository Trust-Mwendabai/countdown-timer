// Cache DOM elements
const elements = {
  form: document.getElementById('countdownForm'),
  eventTitle: document.getElementById('eventTitle'),
  eventDescription: document.getElementById('eventDescription'),
  eventDate: document.getElementById('eventDate'),
  bgColorPicker: document.getElementById('bgColorPicker'),
  themeColorPicker: document.getElementById('themeColorPicker'),
  titleDisplay: document.getElementById('titleDisplay'),
  descriptionDisplay: document.getElementById('descriptionDisplay'),
  mainBody: document.getElementById('mainBody'),
  countdown: document.getElementById('countdown'),
  progressBar: document.getElementById('progressBar'),
  days: document.getElementById('days'),
  hours: document.getElementById('hours'),
  minutes: document.getElementById('minutes'),
  seconds: document.getElementById('seconds'),
  savedCountdowns: document.getElementById('savedCountdowns'),
  themeSwitchBtn: document.getElementById('themeSwitchBtn')
};

let countdownInterval;
let currentCountdownId = null;

// Theme Management
function toggleTheme() {
  const isDark = document.body.getAttribute('data-theme') === 'dark';
  document.body.setAttribute('data-theme', isDark ? 'light' : 'dark');
  elements.themeSwitchBtn.innerHTML = `<i class="fas fa-${isDark ? 'sun' : 'moon'}"></i>`;
  localStorage.setItem('theme', isDark ? 'light' : 'dark');
}

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
    total: distance,
    days: Math.floor(distance / (1000 * 60 * 60 * 24)),
    hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
    minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
    seconds: Math.floor((distance % (1000 * 60)) / 1000)
  };
}

// Update countdown display
function updateCountdownDisplay(timeRemaining, startTime, endTime) {
  if (!timeRemaining) {
    elements.countdown.innerHTML = `
      <div class="alert alert-success" role="alert">
        <h3>🎉 Event Started!</h3>
        <p>Your countdown has completed.</p>
      </div>`;
    return false;
  }
  
  // Update time units
  elements.days.textContent = formatTimeUnit(timeRemaining.days);
  elements.hours.textContent = formatTimeUnit(timeRemaining.hours);
  elements.minutes.textContent = formatTimeUnit(timeRemaining.minutes);
  elements.seconds.textContent = formatTimeUnit(timeRemaining.seconds);

  // Update progress bar
  const totalDuration = endTime - startTime;
  const elapsed = startTime - new Date().getTime();
  const progress = ((totalDuration - timeRemaining.total) / totalDuration) * 100;
  elements.progressBar.style.width = `${Math.max(0, Math.min(100, progress))}%`;
  
  return true;
}

// Generate unique ID
function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// Save countdown data to localStorage
function saveCountdown(title, description, date, bgColor, themeColor, id = null) {
  const countdownId = id || generateId();
  const data = {
    id: countdownId,
    title,
    description,
    date,
    bgColor,
    themeColor,
    createdAt: new Date().toISOString()
  };

  // Get existing countdowns
  const countdowns = JSON.parse(localStorage.getItem('countdowns') || '[]');
  
  // Update existing or add new
  const existingIndex = countdowns.findIndex(c => c.id === countdownId);
  if (existingIndex >= 0) {
    countdowns[existingIndex] = data;
  } else {
    countdowns.push(data);
  }

  localStorage.setItem('countdowns', JSON.stringify(countdowns));
  currentCountdownId = countdownId;
  
  // Update saved countdowns list
  renderSavedCountdowns();
  
  return countdownId;
}

// Load countdown data
function loadCountdown(id) {
  const countdowns = JSON.parse(localStorage.getItem('countdowns') || '[]');
  const countdown = countdowns.find(c => c.id === id);
  
  if (countdown) {
    elements.eventTitle.value = countdown.title;
    elements.eventDescription.value = countdown.description || '';
    elements.eventDate.value = countdown.date;
    elements.bgColorPicker.value = countdown.bgColor;
    elements.themeColorPicker.value = countdown.themeColor;
    
    applyCountdown(
      countdown.title,
      countdown.description,
      countdown.date,
      countdown.bgColor,
      countdown.themeColor,
      countdown.id
    );
  }
}

// Render saved countdowns
function renderSavedCountdowns() {
  const countdowns = JSON.parse(localStorage.getItem('countdowns') || '[]');
  
  elements.savedCountdowns.innerHTML = countdowns.length ? countdowns
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .map(countdown => `
      <div class="list-group-item d-flex justify-content-between align-items-center">
        <div>
          <h5 class="mb-1">${countdown.title}</h5>
          <small class="text-muted">
            ${new Date(countdown.date).toLocaleDateString()} ${new Date(countdown.date).toLocaleTimeString()}
          </small>
        </div>
        <div class="btn-group">
          <button class="btn btn-sm btn-primary" onclick="loadCountdown('${countdown.id}')">
            <i class="fas fa-play"></i>
          </button>
          <button class="btn btn-sm btn-danger" onclick="deleteCountdown('${countdown.id}')">
            <i class="fas fa-trash"></i>
          </button>
        </div>
      </div>
    `).join('') : '<p class="text-center text-muted">No saved countdowns yet</p>';
}

// Delete countdown
function deleteCountdown(id) {
  if (!confirm('Are you sure you want to delete this countdown?')) return;
  
  const countdowns = JSON.parse(localStorage.getItem('countdowns') || '[]');
  const filtered = countdowns.filter(c => c.id !== id);
  localStorage.setItem('countdowns', JSON.stringify(filtered));
  
  if (currentCountdownId === id) {
    clearCountdown();
  }
  
  renderSavedCountdowns();
}

// Share countdown
function shareCountdown() {
  const title = elements.titleDisplay.textContent;
  const description = elements.descriptionDisplay.textContent;
  const date = elements.eventDate.value;
  
  const shareData = {
    title: 'Event Countdown',
    text: `${title}\n${description}\nDate: ${new Date(date).toLocaleString()}`,
    url: window.location.href
  };
  
  if (navigator.share) {
    navigator.share(shareData).catch(console.error);
  } else {
    const shareText = `${shareData.text}\n${shareData.url}`;
    navigator.clipboard.writeText(shareText)
      .then(() => alert('Countdown details copied to clipboard!'))
      .catch(() => {
        // Fallback for older browsers
        const textarea = document.createElement('textarea');
        textarea.value = shareText;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
        alert('Countdown details copied to clipboard!');
      });
  }
}

// Export to calendar
function exportToCalendar() {
  const title = elements.titleDisplay.textContent;
  const description = elements.descriptionDisplay.textContent;
  const date = new Date(elements.eventDate.value);
  
  // Create ICS file content
  const icsContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'BEGIN:VEVENT',
    `DTSTART:${date.toISOString().replace(/[-:]/g, '').split('.')[0]}Z`,
    `SUMMARY:${title}`,
    `DESCRIPTION:${description}`,
    'END:VEVENT',
    'END:VCALENDAR'
  ].join('\n');
  
  // Create and trigger download
  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `${title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_event.ics`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// Save as new countdown
function saveAsNew() {
  const title = elements.titleDisplay.textContent;
  const description = elements.descriptionDisplay.textContent;
  const date = elements.eventDate.value;
  const bgColor = elements.bgColorPicker.value;
  const themeColor = elements.themeColorPicker.value;
  
  // Generate new ID and save
  const newId = saveCountdown(title, description, date, bgColor, themeColor);
  
  // Show success message
  alert('Countdown saved successfully!');
  
  // Switch to saved tab
  const savedTab = document.querySelector('#saved-tab');
  const tab = new bootstrap.Tab(savedTab);
  tab.show();
}

// Apply countdown
function applyCountdown(title, description, date, bgColor, themeColor, id = null) {
  elements.titleDisplay.textContent = title;
  elements.descriptionDisplay.textContent = description || '';
  elements.mainBody.style.backgroundColor = bgColor;
  document.documentElement.style.setProperty('--primary-color', themeColor);
  
  const targetDate = new Date(date).getTime();
  const startTime = new Date().getTime();
  
  if (countdownInterval) clearInterval(countdownInterval);
  
  countdownInterval = setInterval(() => {
    const timeRemaining = calculateTimeRemaining(targetDate);
    if (!updateCountdownDisplay(timeRemaining, startTime, targetDate)) {
      clearInterval(countdownInterval);
    }
  }, 1000);
  
  currentCountdownId = id;
}

// Start countdown
function startCountdown(event) {
  event.preventDefault();
  
  if (!elements.form.checkValidity()) {
    elements.form.classList.add('was-validated');
    return;
  }

  const title = elements.eventTitle.value || 'Countdown Event';
  const description = elements.eventDescription.value;
  const date = elements.eventDate.value;
  const bgColor = elements.bgColorPicker.value;
  const themeColor = elements.themeColorPicker.value;

  if (!date) {
    alert('Please select a date and time.');
    return;
  }

  const targetDate = new Date(date).getTime();
  const now = new Date().getTime();

  if (targetDate <= now) {
    alert('Please select a future date and time.');
    return;
  }

  // Save and apply countdown
  const id = saveCountdown(title, description, date, bgColor, themeColor);
  applyCountdown(title, description, date, bgColor, themeColor, id);

  // Switch to countdown tab
  const countdownTab = document.querySelector('#countdown-tab');
  const tab = new bootstrap.Tab(countdownTab);
  tab.show();
}

// Clear countdown
function clearCountdown() {
  if (!confirm('Are you sure you want to clear the countdown?')) return;
  
  elements.form.reset();
  elements.form.classList.remove('was-validated');
  elements.titleDisplay.textContent = 'Your Event Title';
  elements.descriptionDisplay.textContent = 'Event description will appear here';
  elements.mainBody.style.backgroundColor = '#ffffff';
  document.documentElement.style.setProperty('--primary-color', '#0d6efd');
  
  if (countdownInterval) {
    clearInterval(countdownInterval);
  }
  
  currentCountdownId = null;
  elements.progressBar.style.width = '0%';
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  // Form submission
  elements.form.addEventListener('submit', startCountdown);

  // Theme switch
  elements.themeSwitchBtn.addEventListener('click', toggleTheme);
  
  // Load saved theme
  const savedTheme = localStorage.getItem('theme') || 'light';
  document.body.setAttribute('data-theme', savedTheme);
  elements.themeSwitchBtn.innerHTML = `<i class="fas fa-${savedTheme === 'dark' ? 'sun' : 'moon'}"></i>`;

  // Render saved countdowns
  renderSavedCountdowns();

  // Load last active countdown
  const countdowns = JSON.parse(localStorage.getItem('countdowns') || '[]');
  if (countdowns.length > 0) {
    loadCountdown(countdowns[0].id);
  }

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
  