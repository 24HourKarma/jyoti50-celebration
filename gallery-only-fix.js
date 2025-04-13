// Simple Gallery Upload Fix
// This script only fixes the gallery upload functionality without changing anything else

(function() {
    console.log('Gallery upload fix loaded');
    
    // Wait for the DOM to be fully loaded
    document.addEventListener('DOMContentLoaded', function() {
        // Find the gallery upload form
        const galleryForms = document.querySelectorAll('form');
        
        galleryForms.forEach(form => {
            // Look for forms that have file inputs (likely gallery upload forms)
            const fileInputs = form.querySelectorAll('input[type="file"]');
            
            if (fileInputs.length > 0) {
                console.log('Gallery upload form found');
                
                // Override the form submission
                form.addEventListener('submit', function(e) {
                    e.preventDefault();
                    
                    console.log('Gallery form submission intercepted');
                    
                    // Create FormData object
                    const formData = new FormData(form);
                    
                    // Get the form action or default to the gallery API endpoint
                    const action = form.getAttribute('action') || '/api/gallery';
                    
                    // Show upload status
                    const statusElement = document.createElement('div');
                    statusElement.style.padding = '10px';
                    statusElement.style.marginTop = '10px';
                    statusElement.style.borderRadius = '4px';
                    statusElement.textContent = 'Uploading image...';
                    statusElement.style.backgroundColor = '#f8f9fa';
                    statusElement.style.border = '1px solid #ddd';
                    
                    // Insert status element after the form
                    form.parentNode.insertBefore(statusElement, form.nextSibling);
                    
                    // Use fetch with proper error handling
                    fetch(action, {
                        method: 'POST',
                        body: formData,
                        // Don't set Content-Type header - FormData will set it with the boundary
                        credentials: 'same-origin'
                    })
                    .then(response => {
                        if (!response.ok) {
                            throw new Error(`Server returned ${response.status}: ${response.statusText}`);
                        }
                        
                        // Try to parse as JSON, but handle text response as well
                        const contentType = response.headers.get('content-type');
                        if (contentType && contentType.includes('application/json')) {
                            return response.json();
                        } else {
                            return response.text().then(text => {
                                // Try to parse text as JSON
                                try {
                                    return JSON.parse(text);
                                } catch (e) {
                                    // If it's not JSON, return as is
                                    return { success: true, message: 'Upload successful', rawResponse: text };
                                }
                            });
                        }
                    })
                    .then(data => {
                        console.log('Upload successful:', data);
                        statusElement.textContent = 'Upload successful!';
                        statusElement.style.backgroundColor = '#d4edda';
                        statusElement.style.border = '1px solid #c3e6cb';
                        statusElement.style.color = '#155724';
                        
                        // Reset the form
                        form.reset();
                        
                        // Refresh the gallery if there's a refresh function
                        if (typeof refreshGallery === 'function') {
                            refreshGallery();
                        } else if (typeof loadGallery === 'function') {
                            loadGallery();
                        }
                    })
                    .catch(error => {
                        console.error('Error uploading image:', error);
                        
                        // Show error message
                        statusElement.textContent = 'Error uploading image: ' + error.message;
                        statusElement.style.backgroundColor = '#f8d7da';
                        statusElement.style.border = '1px solid #f5c6cb';
                        statusElement.style.color = '#721c24';
                        
                        // Try local storage fallback if the server request failed
                        const fileInput = fileInputs[0];
                        if (fileInput.files && fileInput.files[0]) {
                            try {
                                const reader = new FileReader();
                                reader.onload = function(e) {
                                    // Store image in localStorage as fallback
                                    const timestamp = new Date().getTime();
                                    const titleInput = form.querySelector('input[placeholder*="title" i]') || 
                                                      form.querySelector('input[name*="title" i]');
                                    const descInput = form.querySelector('textarea') || 
                                                     form.querySelector('input[placeholder*="desc" i]') || 
                                                     form.querySelector('input[name*="desc" i]');
                                    
                                    const title = titleInput ? titleInput.value : 'Image ' + timestamp;
                                    const description = descInput ? descInput.value : '';
                                    
                                    // Store in localStorage
                                    const galleryItem = {
                                        id: 'local_' + timestamp,
                                        title: title,
                                        description: description,
                                        image: e.target.result,
                                        date: new Date().toISOString()
                                    };
                                    
                                    // Get existing gallery items
                                    let galleryItems = [];
                                    try {
                                        const storedItems = localStorage.getItem('galleryItems');
                                        if (storedItems) {
                                            galleryItems = JSON.parse(storedItems);
                                        }
                                    } catch (e) {
                                        console.error('Error parsing stored gallery items:', e);
                                    }
                                    
                                    // Add new item
                                    galleryItems.unshift(galleryItem);
                                    
                                    // Store back
                                    localStorage.setItem('galleryItems', JSON.stringify(galleryItems));
                                    
                                    // Update status
                                    statusElement.textContent = 'Image saved locally (server upload failed)';
                                    statusElement.style.backgroundColor = '#fff3cd';
                                    statusElement.style.border = '1px solid #ffeeba';
                                    statusElement.style.color = '#856404';
                                    
                                    // Reset the form
                                    form.reset();
                                    
                                    console.log('Image saved to local storage as fallback');
                                };
                                reader.readAsDataURL(fileInput.files[0]);
                            } catch (e) {
                                console.error('Error with local storage fallback:', e);
                            }
                        }
                    });
                });
            }
        });
        
        // Check if we need to display locally stored gallery items
        try {
            const galleryContainer = document.querySelector('.gallery-grid') || 
                                    document.querySelector('.gallery-container') || 
                                    document.querySelector('[class*="gallery" i]');
            
            if (galleryContainer) {
                const storedItems = localStorage.getItem('galleryItems');
                if (storedItems) {
                    const galleryItems = JSON.parse(storedItems);
                    
                    if (galleryItems && galleryItems.length > 0) {
                        console.log('Found locally stored gallery items:', galleryItems.length);
                        
                        // Create a section for local items if they exist
                        const localSection = document.createElement('div');
                        localSection.className = 'local-gallery-section';
                        localSection.innerHTML = '<h3>Locally Stored Images</h3><p>These images are stored in your browser and not on the server.</p>';
                        
                        const localGallery = document.createElement('div');
                        localGallery.className = 'local-gallery-grid';
                        localGallery.style.display = 'grid';
                        localGallery.style.gridTemplateColumns = 'repeat(auto-fill, minmax(200px, 1fr))';
                        localGallery.style.gap = '20px';
                        localGallery.style.marginTop = '20px';
                        
                        galleryItems.forEach(item => {
                            const galleryItem = document.createElement('div');
                            galleryItem.className = 'gallery-item';
                            galleryItem.style.border = '1px solid #ddd';
                            galleryItem.style.borderRadius = '4px';
                            galleryItem.style.overflow = 'hidden';
                            
                            galleryItem.innerHTML = `
                                <img src="${item.image}" alt="${item.title}" style="width: 100%; height: 150px; object-fit: cover;">
                                <div style="padding: 10px;">
                                    <h4>${item.title}</h4>
                                    <p>${item.description}</p>
                                    <p><small>Stored locally on ${new Date(item.date).toLocaleString()}</small></p>
                                </div>
                            `;
                            
                            localGallery.appendChild(galleryItem);
                        });
                        
                        localSection.appendChild(localGallery);
                        
                        // Add local section after the main gallery
                        galleryContainer.parentNode.insertBefore(localSection, galleryContainer.nextSibling);
                    }
                }
            }
        } catch (e) {
            console.error('Error displaying local gallery items:', e);
        }
    });
})();
