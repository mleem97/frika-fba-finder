// DOM Elemente
const toggleFba = document.getElementById('toggleFba');
const toggleAds = document.getElementById('toggleAds');
const togglePrime = document.getElementById('togglePrime');
const viewMode = document.getElementById('viewMode');
const saveBtn = document.getElementById('saveBtn');

// Einstellungen beim Laden abrufen
document.addEventListener('DOMContentLoaded', () => {
  if (chrome.storage && chrome.storage.sync) {
    chrome.storage.sync.get(
      ['hideFBM', 'hideSponsored', 'strictPrime', 'viewMode', 'enabled'],
      (result) => {
        toggleFba.checked = result.hideFBM !== undefined ? result.hideFBM : true;
        toggleAds.checked = result.hideSponsored !== undefined ? result.hideSponsored : true;
        togglePrime.checked = result.strictPrime !== undefined ? result.strictPrime : false;
        viewMode.value = result.viewMode || 'remove';
      }
    );
  }
});

// Einstellungen speichern
saveBtn.addEventListener('click', function () {
  const settings = {
    hideFBM: toggleFba.checked,
    hideSponsored: toggleAds.checked,
    strictPrime: togglePrime.checked,
    viewMode: viewMode.value,
    enabled: true,
  };

  if (chrome.storage && chrome.storage.sync) {
    chrome.storage.sync.set(settings, () => {
      // Visuelles Feedback
      const originalText = saveBtn.innerText;
      saveBtn.innerText = 'Gespeichert!';
      saveBtn.style.backgroundColor = '#48bb78'; // Green
      setTimeout(() => {
        saveBtn.innerText = originalText;
        saveBtn.style.backgroundColor = '#232F3E'; // Back to Blue
      }, 1500);
    });
  } else {
    // Fallback für lokale Entwicklung
    console.log('Settings would be saved:', settings);
    const originalText = saveBtn.innerText;
    saveBtn.innerText = 'Gespeichert!';
    saveBtn.style.backgroundColor = '#48bb78';
    setTimeout(() => {
      saveBtn.innerText = originalText;
      saveBtn.style.backgroundColor = '#232F3E';
    }, 1500);
  }
});
