// Simple localStorage integration script for Jyoti50 website
// Add this to index.html right before the closing </body> tag

// This script checks localStorage for header/footer settings and gallery images
// and applies them to the main website without modifying any existing functionality
document.addEventListener('DOMContentLoaded', function() {
  console.log('LocalStorage integration script loaded');
  
  try {
    // Check for settings in localStorage
    const settings = JSON.parse(localStorage.getItem('settings')) || {};
    console.log('LocalStorage settings:', settings);
    
    // Apply header settings if available
    if (settings.header) {
      applyHeaderSettings(settings.header);
    }
    
    // Apply footer settings if available
    if (settings.footer) {
      applyFooterSettings(settings.footer);
    }
    
    // Check for gallery in localStorage
    const gallery = JSON.parse(localStorage.getItem('gallery')) || [];
    if (gallery.length > 0) {
      applyGalleryImages(gallery);
    }
  } catch (error) {
    console.error('Error applying localStorage settings:', error);
  }
});

// Apply header settings to the DOM
function applyHeaderSettings(headerSettings) {
  try {
    console.log('Applying header settings:', headerSettings);
    
    // Update logo text if available
    if (headerSettings.logoText) {
      const headerTitle = document.querySelector('header h1');
      if (headerTitle) {
        headerTitle.textContent = headerSettings.logoText;
        console.log('Updated header logo text to:', headerSettings.logoText);
      }
    }
    
    // Update menu items if available
    if (headerSettings.menuItems && headerSettings.menuItems.length > 0) {
      const navMenu = document.querySelector('header nav ul');
      if (navMenu) {
        // Keep only the first 5 default menu items
        const defaultItems = Array.from(navMenu.children).slice(0, 5);
        
        // Clear the menu
        navMenu.innerHTML = '';
        
        // Add back the default items
        defaultItems.forEach(item => navMenu.appendChild(item));
        
        // Add custom menu items
        headerSettings.menuItems.forEach(item => {
          const li = document.createElement('li');
          const a = document.createElement('a');
          a.href = '#';
          a.textContent = item;
          li.appendChild(a);
          navMenu.appendChild(li);
        });
        console.log('Updated header menu items');
      }
    }
  } catch (error) {
    console.error('Error applying header settings:', error);
  }
}

// Apply footer settings to the DOM
function applyFooterSettings(footerSettings) {
  try {
    console.log('Applying footer settings:', footerSettings);
    
    const footerContainer = document.querySelector('footer .container');
    if (!footerContainer) return;
    
    // Clear existing footer content except admin link
    const adminLink = footerContainer.querySelector('.admin-link');
    footerContainer.innerHTML = '';
    
    // Add copyright if available
    if (footerSettings.copyright) {
      const copyrightP = document.createElement('p');
      copyrightP.innerHTML = footerSettings.copyright;
      footerContainer.appendChild(copyrightP);
      console.log('Added footer copyright');
    }
    
    // Add contact info if available
    if (footerSettings.contactInfo) {
      const contactP = document.createElement('p');
      contactP.innerHTML = footerSettings.contactInfo;
      footerContainer.appendChild(contactP);
      console.log('Added footer contact info');
    }
    
    // Add about text if available
    if (footerSettings.about) {
      const aboutP = document.createElement('p');
      aboutP.innerHTML = footerSettings.about;
      footerContainer.appendChild(aboutP);
      console.log('Added footer about text');
    }
    
    // Add quick links if available
    if (footerSettings.quickLinks && footerSettings.quickLinks.length > 0) {
      const linksDiv = document.createElement('div');
      linksDiv.className = 'quick-links';
      
      const linksList = document.createElement('ul');
      footerSettings.quickLinks.forEach(link => {
        const li = document.createElement('li');
        li.innerHTML = `<a href="#">${link}</a>`;
        linksList.appendChild(li);
      });
      
      linksDiv.appendChild(linksList);
      footerContainer.appendChild(linksDiv);
      console.log('Added footer quick links');
    }
    
    // Add back the admin link
    if (adminLink) {
      const adminP = document.createElement('p');
      adminP.appendChild(adminLink);
      footerContainer.appendChild(adminP);
    } else {
      // Create new admin link if it doesn't exist
      const adminP = document.createElement('p');
      adminP.innerHTML = '<a href="admin.html" class="admin-link">Admin Login</a>';
      footerContainer.appendChild(adminP);
    }
    console.log('Footer settings applied successfully');
  } catch (error) {
    console.error('Error applying footer settings:', error);
  }
}

// Apply gallery images from localStorage
function applyGalleryImages(gallery) {
  try {
    console.log('Applying gallery images from localStorage:', gallery.length);
    
    const galleryContainer = document.querySelector('.gallery-container');
    if (!galleryContainer) return;
    
    // Only replace if gallery is empty or showing "No images" message
    if (galleryContainer.children.length <= 1 || 
        galleryContainer.innerHTML.includes('No images available') ||
        galleryContainer.innerHTML.includes('Loading gallery')) {
      
      let galleryHTML = '';
      gallery.forEach(image => {
        galleryHTML += `
          <div class="gallery-item">
            <img class="gallery-image" src="${image.imageUrl}" alt="${image.title || 'Gallery image'}">
            <div class="gallery-caption">
              <h3>${image.title || 'Untitled Image'}</h3>
              <p>${image.description || ''}</p>
            </div>
          </div>
        `;
      });
      
      galleryContainer.innerHTML = galleryHTML;
      console.log('Gallery images applied successfully');
    } else {
      console.log('Gallery already has content, not replacing');
    }
  } catch (error) {
    console.error('Error applying gallery images:', error);
  }
}
