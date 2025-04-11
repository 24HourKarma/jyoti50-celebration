// Google Sheets Sync Functionality for Admin Dashboard
document.addEventListener('DOMContentLoaded', function() {
    // Check if sync button exists
    const syncButton = document.getElementById('syncGoogleSheetsBtn');
    if (syncButton) {
        syncButton.addEventListener('click', syncGoogleSheets);
    }
    
    // Add sync button to Schedule section if it doesn't exist
    const scheduleSection = document.getElementById('scheduleSection');
    if (scheduleSection && !syncButton) {
        const sectionHeader = scheduleSection.querySelector('.section-header');
        if (sectionHeader) {
            const syncBtn = document.createElement('button');
            syncBtn.id = 'syncGoogleSheetsBtn';
            syncBtn.className = 'btn btn-sync';
            syncBtn.innerHTML = '<i class="fas fa-sync"></i> Sync with Google Sheets';
            syncBtn.addEventListener('click', syncGoogleSheets);
            
            // Insert before the add event button
            const addButton = sectionHeader.querySelector('.add-button');
            if (addButton) {
                sectionHeader.insertBefore(syncBtn, addButton);
            } else {
                sectionHeader.appendChild(syncBtn);
            }
        }
    }
});

// Function to sync events with Google Sheets
function syncGoogleSheets() {
    // Show loading state
    const syncButton = document.getElementById('syncGoogleSheetsBtn');
    const originalText = syncButton.innerHTML;
    syncButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Syncing...';
    syncButton.disabled = true;
    
    // Get token from localStorage
    const token = localStorage.getItem('adminToken');
    
    // Call API to sync events
    fetch('/api/sync/google-sheets', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        }
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Failed to sync with Google Sheets');
        }
        return response.json();
    })
    .then(data => {
        // Reset button state
        syncButton.innerHTML = originalText;
        syncButton.disabled = false;
        
        // Show success message
        showSuccessMessage(`Successfully synced ${data.count} events from Google Sheets!`);
        
        // Reload events table
        loadEvents();
        
        // Update dashboard stats
        updateDashboardStats();
    })
    .catch(error => {
        console.error('Error syncing with Google Sheets:', error);
        
        // Reset button state
        syncButton.innerHTML = originalText;
        syncButton.disabled = false;
        
        // Show error message
        showErrorMessage('Failed to sync with Google Sheets. Please try again.');
    });
}

// Function to show success message
function showSuccessMessage(message) {
    const successMessage = document.getElementById('successMessage');
    if (successMessage) {
        successMessage.textContent = message;
        successMessage.style.display = 'block';
        
        // Hide after 5 seconds
        setTimeout(() => {
            successMessage.style.display = 'none';
        }, 5000);
    }
}

// Function to show error message
function showErrorMessage(message) {
    const errorMessage = document.getElementById('errorMessage');
    if (errorMessage) {
        errorMessage.textContent = message;
        errorMessage.style.display = 'block';
        
        // Hide after 5 seconds
        setTimeout(() => {
            errorMessage.style.display = 'none';
        }, 5000);
    }
}
