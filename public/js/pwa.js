// PWA Registration Script
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js')
      .then(registration => {
        console.log('ServiceWorker registration successful with scope: ', registration.scope);
      })
      .catch(error => {
        console.error('ServiceWorker registration failed: ', error);
      });
  });
}

// Add to Home Screen functionality
let deferredPrompt;
const addToHomeBtn = document.createElement('div');
addToHomeBtn.className = 'add-to-home-screen';
addToHomeBtn.innerHTML = `
  <div class="add-to-home-content">
    <div>Add this app to your home screen for quick access</div>
    <div class="add-to-home-buttons">
      <button id="add-to-home-accept" class="btn">Add</button>
      <button id="add-to-home-decline" class="btn">Not Now</button>
    </div>
  </div>
`;

window.addEventListener('beforeinstallprompt', (e) => {
  // Prevent Chrome 67 and earlier from automatically showing the prompt
  e.preventDefault();
  // Stash the event so it can be triggered later
  deferredPrompt = e;
  // Add the banner to the page
  document.body.appendChild(addToHomeBtn);
  addToHomeBtn.style.display = 'block';
  
  // Setup button click handlers
  document.getElementById('add-to-home-accept').addEventListener('click', () => {
    // Hide the banner
    addToHomeBtn.style.display = 'none';
    // Show the prompt
    deferredPrompt.prompt();
    // Wait for the user to respond to the prompt
    deferredPrompt.userChoice.then((choiceResult) => {
      if (choiceResult.outcome === 'accepted') {
        console.log('User accepted the A2HS prompt');
      } else {
        console.log('User dismissed the A2HS prompt');
      }
      deferredPrompt = null;
    });
  });
  
  document.getElementById('add-to-home-decline').addEventListener('click', () => {
    // Hide the banner
    addToHomeBtn.style.display = 'none';
    console.log('User declined the A2HS prompt');
  });
});

// Handle installed PWA
window.addEventListener('appinstalled', (evt) => {
  console.log('App was installed to home screen');
  // Hide the banner if it's still showing
  addToHomeBtn.style.display = 'none';
});

// Offline status notification
window.addEventListener('online', () => {
  document.body.classList.remove('offline');
  // Refresh data if needed
  if (window.updateDataFromServer) {
    window.updateDataFromServer();
  }
});

window.addEventListener('offline', () => {
  document.body.classList.add('offline');
  // Show offline notification
  const offlineNotification = document.createElement('div');
  offlineNotification.className = 'offline-notification';
  offlineNotification.textContent = 'You are currently offline. Some features may be limited.';
  document.body.appendChild(offlineNotification);
  
  // Remove after 5 seconds
  setTimeout(() => {
    offlineNotification.remove();
  }, 5000);
});
