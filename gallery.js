// Gallery JavaScript for the website
document.addEventListener('DOMContentLoaded', function() {
    // Initialize gallery if on gallery page
    if (document.getElementById('gallery-container')) {
        fetchGalleryImages();
        setupImageUpload();
    }
});

// Fetch gallery images from API
async function fetchGalleryImages() {
    try {
        const galleryContainer = document.getElementById('gallery-container');
        if (!galleryContainer) return;
        
        // Show loading indicator
        galleryContainer.innerHTML = '<div class="loading">Loading gallery...</div>';
        
        // Fetch gallery data
        const response = await fetch('/api/gallery');
        
        if (!response.ok) {
            throw new Error(`API error: ${response.status} ${response.statusText}`);
        }
        
        const images = await response.json();
        
        // Clear loading indicator
        galleryContainer.innerHTML = '';
        
        if (!images || images.length === 0) {
            galleryContainer.innerHTML = `
                <div class="no-images">
                    <p>No images in the gallery yet.</p>
                    <p>Be the first to share a photo!</p>
                </div>
            `;
            return;
        }
        
        // Create gallery grid
        const galleryGrid = document.createElement('div');
        galleryGrid.className = 'gallery-grid';
        
        // Add each image to the grid
        images.forEach(image => {
            const imageElement = document.createElement('div');
            imageElement.className = 'gallery-item';
            
            imageElement.innerHTML = `
                <img src="${image.path}" alt="${image.description}" loading="lazy">
                <div class="image-description">${image.description}</div>
            `;
            
            // Add click event for lightbox
            imageElement.addEventListener('click', function() {
                openLightbox(image.path, image.description);
            });
            
            galleryGrid.appendChild(imageElement);
        });
        
        galleryContainer.appendChild(galleryGrid);
        
    } catch (error) {
        console.error('Error fetching gallery images:', error);
        const galleryContainer = document.getElementById('gallery-container');
        if (galleryContainer) {
            galleryContainer.innerHTML = `
                <div class="error">
                    <p>Failed to load gallery images.</p>
                    <p>Please try again later.</p>
                </div>
            `;
        }
    }
}

// Set up image upload functionality
function setupImageUpload() {
    const uploadForm = document.getElementById('upload-form');
    if (!uploadForm) return;
    
    uploadForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const fileInput = document.getElementById('image-upload');
        const descriptionInput = document.getElementById('image-description');
        const submitButton = document.querySelector('#upload-form button[type="submit"]');
        const statusMessage = document.getElementById('upload-status');
        
        if (!fileInput.files || fileInput.files.length === 0) {
            statusMessage.textContent = 'Please select an image to upload.';
            statusMessage.className = 'error';
            return;
        }
        
        // Create form data
        const formData = new FormData();
        formData.append('image', fileInput.files[0]);
        formData.append('description', descriptionInput.value || 'Gallery Image');
        
        try {
            // Disable form during upload
            fileInput.disabled = true;
            descriptionInput.disabled = true;
            submitButton.disabled = true;
            statusMessage.textContent = 'Uploading image...';
            statusMessage.className = 'info';
            
            // Upload image
            const response = await fetch('/api/gallery/upload', {
                method: 'POST',
                body: formData
            });
            
            if (!response.ok) {
                throw new Error(`Upload failed: ${response.status} ${response.statusText}`);
            }
            
            // Handle successful upload
            statusMessage.textContent = 'Image uploaded successfully!';
            statusMessage.className = 'success';
            
            // Clear form
            fileInput.value = '';
            descriptionInput.value = '';
            
            // Refresh gallery
            fetchGalleryImages();
            
        } catch (error) {
            console.error('Error uploading image:', error);
            statusMessage.textContent = 'Failed to upload image. Please try again.';
            statusMessage.className = 'error';
        } finally {
            // Re-enable form
            fileInput.disabled = false;
            descriptionInput.disabled = false;
            submitButton.disabled = false;
            
            // Clear status message after 5 seconds
            setTimeout(() => {
                statusMessage.textContent = '';
                statusMessage.className = '';
            }, 5000);
        }
    });
}

// Open lightbox
function openLightbox(imageSrc, description) {
    // Create lightbox container
    const lightbox = document.createElement('div');
    lightbox.className = 'lightbox';
    
    // Create lightbox content
    lightbox.innerHTML = `
        <div class="lightbox-content">
            <img src="${imageSrc}" alt="${description}">
            <div class="lightbox-description">${description}</div>
            <button class="lightbox-close">&times;</button>
        </div>
    `;
    
    // Add lightbox to body
    document.body.appendChild(lightbox);
    
    // Prevent scrolling on body
    document.body.style.overflow = 'hidden';
    
    // Add close event
    lightbox.addEventListener('click', function(e) {
        if (e.target === lightbox || e.target.className === 'lightbox-close') {
            closeLightbox(lightbox);
        }
    });
    
    // Add keyboard close event
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closeLightbox(lightbox);
        }
    });
}

// Close lightbox
function closeLightbox(lightbox) {
    // Remove lightbox
    lightbox.remove();
    
    // Restore scrolling
    document.body.style.overflow = '';
}

// Refresh gallery periodically (every 60 seconds)
setInterval(function() {
    if (document.getElementById('gallery-container')) {
        fetchGalleryImages();
    }
}, 60000); // 60 seconds
