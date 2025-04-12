document.addEventListener('DOMContentLoaded', function() {
  console.log('DOM loaded - starting fixed version');
  
  // Fetch and display each type of data
  displayEvents();
  displayContacts();
  displayReminders();
  displayNotes();
  displayGallery();
});

// Display events
async function displayEvents() {
  try {
    const events = await api.get('events');
    const container = document.querySelector('.events-container');
    
    if (!container) {
      console.warn('Events container not found');
      return;
    }
    
    if (!events || events.length === 0) {
      container.innerHTML = '<p>No events available.</p>';
      return;
    }
    
    let html = '';
    events.forEach(event => {
      html += `
        <div class="event-card">
          <h3>${event.title || 'Untitled Event'}</h3>
          <p><strong>Date:</strong> ${event.date || 'No date'}</p>
          <p><strong>Time:</strong> ${event.startTime || 'No time'} ${event.endTime ? '- ' + event.endTime : ''}</p>
          <p><strong>Location:</strong> ${event.location || 'No location'}</p>
          <p>${event.description || 'No description'}</p>
        </div>
      `;
    });
    
    container.innerHTML = html;
  } catch (error) {
    console.error('Error displaying events:', error);
  }
}

// Display contacts
async function displayContacts() {
  try {
    const contacts = await api.get('contacts');
    const container = document.querySelector('.contacts-container');
    
    if (!container) {
      console.warn('Contacts container not found');
      return;
    }
    
    if (!contacts || contacts.length === 0) {
      container.innerHTML = '<p>No contacts available.</p>';
      return;
    }
    
    let html = '';
    contacts.forEach(contact => {
      html += `
        <div class="contact-card">
          <h3>${contact.name || 'Unnamed Contact'}</h3>
          <p><strong>Email:</strong> ${contact.email || 'No email'}</p>
          <p><strong>Phone:</strong> ${contact.phone || 'No phone'}</p>
          <p>${contact.notes || ''}</p>
        </div>
      `;
    });
    
    container.innerHTML = html;
  } catch (error) {
    console.error('Error displaying contacts:', error);
  }
}

// Display reminders
async function displayReminders() {
  try {
    const reminders = await api.get('reminders');
    const container = document.querySelector('.reminders-container');
    
    if (!container) {
      console.warn('Reminders container not found');
      return;
    }
    
    if (!reminders || reminders.length === 0) {
      container.innerHTML = '<p>No reminders available.</p>';
      return;
    }
    
    let html = '';
    reminders.forEach(reminder => {
      const date = reminder.date ? new Date(reminder.date).toLocaleDateString() : 'No date';
      
      html += `
        <div class="reminder-card">
          <h3>${reminder.title || 'Untitled Reminder'}</h3>
          <p><strong>Date:</strong> ${date}</p>
          <p>${reminder.description || 'No description'}</p>
        </div>
      `;
    });
    
    container.innerHTML = html;
  } catch (error) {
    console.error('Error displaying reminders:', error);
  }
}

// Display notes
async function displayNotes() {
  try {
    const notes = await api.get('notes');
    const container = document.querySelector('.notes-container');
    
    if (!container) {
      console.warn('Notes container not found');
      return;
    }
    
    if (!notes || notes.length === 0) {
      container.innerHTML = '<p>No notes available.</p>';
      return;
    }
    
    let html = '';
    notes.forEach(note => {
      html += `
        <div class="note-card">
          <h3>${note.title || 'Untitled Note'}</h3>
          <p>${note.content || 'No content'}</p>
        </div>
      `;
    });
    
    container.innerHTML = html;
  } catch (error) {
    console.error('Error displaying notes:', error);
  }
}

// Display gallery
async function displayGallery() {
  try {
    const gallery = await api.get('gallery');
    const container = document.querySelector('.gallery-container');
    
    if (!container) {
      console.warn('Gallery container not found');
      return;
    }
    
    if (!gallery || gallery.length === 0) {
      container.innerHTML = '<p>No images available.</p>';
      return;
    }
    
    let html = '';
    gallery.forEach(image => {
      html += `
        <div class="gallery-item">
          <img src="${image.imageUrl}" alt="${image.title || 'Gallery image'}">
          <div class="gallery-caption">
            <h3>${image.title || ''}</h3>
            <p>${image.description || ''}</p>
          </div>
        </div>
      `;
    });
    
    container.innerHTML = html;
  } catch (error) {
    console.error('Error displaying gallery:', error);
  }
}
