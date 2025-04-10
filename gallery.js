// Gallery specific JavaScript for handling uploads and display
document.addEventListener('DOMContentLoaded', function() {
    // Elements
    const galleryContainer = document.getElementById('galleryContainer');
    const uploadForm = document.getElementById('uploadForm');
    
    // Load gallery images
    function loadGalleryImages() {
        // For static deployment, show demo images
        const demoImages = [
            { path: '/images/jyoti.jpg', description: 'Jyoti' },
            { path: '/images/krakow1.jpg', description: 'Kraków Old Town' },
            { path: '/images/krakow2.jpg', description: 'Wawel Castle' }
        ];
        
        galleryContainer.innerHTML = '';
        
        if (demoImages.length === 0) {
            galleryContainer.innerHTML = '<p class="no-images">No images yet. Be the first to share!</p>';
            return;
        }
        
        demoImages.forEach(image => {
            const galleryItem = document.createElement('div');
            galleryItem.className = 'gallery-item';
            
            const img = document.createElement('img');
            img.src = image.path;
            img.alt = image.description || 'Gallery image';
            img.loading = 'lazy'; // Lazy loading for better performance
            img.onerror = function() {
                // If image fails to load, show placeholder
                this.src = 'https://via.placeholder.com/300x200?text=Image';
            };
            
            // Add click handler to open image in lightbox
            img.addEventListener('click', function() {
                openLightbox(image.path, image.description);
            });
            
            galleryItem.appendChild(img);
            
            if (image.description) {
                const description = document.createElement('div');
                description.className = 'gallery-item-description';
                description.textContent = image.description;
                galleryItem.appendChild(description);
            }
            
            galleryContainer.appendChild(galleryItem);
        });
    }
    
    // Handle image upload
    if (uploadForm) {
        uploadForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const formData = new FormData(this);
            const submitButton = this.querySelector('button[type="submit"]');
            const fileInput = this.querySelector('input[type="file"]');
            
            // Validate file input
            if (!fileInput.files || fileInput.files.length === 0) {
                alert('Please select an image to upload.');
                return;
            }
            
            // Check file type
            const file = fileInput.files[0];
            if (!file.type.match('image.*')) {
                alert('Please select an image file (JPEG, PNG, GIF).');
                return;
            }
            
            // Check file size (max 5MB)
            if (file.size > 5 * 1024 * 1024) {
                alert('Image size should be less than 5MB.');
                return;
            }
            
            // Disable button and show loading state
            submitButton.disabled = true;
            submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Uploading...';
            
            // In static deployment, simulate successful upload
            setTimeout(() => {
                // Reset form
                uploadForm.reset();
                
                // Show success message
                const successMessage = document.createElement('div');
                successMessage.className = 'alert alert-success';
                successMessage.textContent = 'Image uploaded successfully!';
                uploadForm.prepend(successMessage);
                
                // Remove success message after 3 seconds
                setTimeout(() => {
                    successMessage.remove();
                }, 3000);
                
                // Add the uploaded image to the gallery (for demo purposes)
                const newImage = {
                    path: URL.createObjectURL(file),
                    description: formData.get('description') || 'Uploaded image'
                };
                
                const galleryItem = document.createElement('div');
                galleryItem.className = 'gallery-item';
                
                const img = document.createElement('img');
                img.src = newImage.path;
                img.alt = newImage.description;
                
                img.addEventListener('click', function() {
                    openLightbox(newImage.path, newImage.description);
                });
                
                galleryItem.appendChild(img);
                
                if (newImage.description) {
                    const description = document.createElement('div');
                    description.className = 'gallery-item-description';
                    description.textContent = newImage.description;
                    galleryItem.appendChild(description);
                }
                
                if (galleryContainer) {
                    galleryContainer.prepend(galleryItem);
                }
                
                // Reset button state
                submitButton.disabled = false;
                submitButton.innerHTML = 'Upload Photo';
            }, 1500); // Simulate network delay
        });
    }
    
    // Lightbox functionality
    function openLightbox(imageSrc, description) {
        // Create lightbox elements
        const lightbox = document.createElement('div');
        lightbox.className = 'lightbox';
        
        const lightboxContent = document.createElement('div');
        lightboxContent.className = 'lightbox-content';
        
        const closeBtn = document.createElement('span');
        closeBtn.className = 'lightbox-close';
        closeBtn.innerHTML = '&times;';
        closeBtn.addEventListener('click', function() {
            document.body.removeChild(lightbox);
        });
        
        const image = document.createElement('img');
        image.src = imageSrc;
        image.alt = description || 'Gallery image';
        
        lightboxContent.appendChild(closeBtn);
        lightboxContent.appendChild(image);
        
        if (description) {
            const descriptionElement = document.createElement('div');
            descriptionElement.className = 'lightbox-description';
            descriptionElement.textContent = description;
            lightboxContent.appendChild(descriptionElement);
        }
        
        lightbox.appendChild(lightboxContent);
        document.body.appendChild(lightbox);
        
        // Close lightbox when clicking outside the image
        lightbox.addEventListener('click', function(e) {
            if (e.target === lightbox) {
                document.body.removeChild(lightbox);
            }
        });
    }
    
    // Create placeholder images for static deployment
    function createPlaceholderImages() {
        // Create directory for placeholder images
        const images = [
            { name: 'krakow1.jpg', url: 'https://images.unsplash.com/photo-1562693315-d60e1f4f1f9f' },
            { name: 'krakow2.jpg', url: 'https://images.unsplash.com/photo-1519197924294-4ba991a11128' }
        ];
        
        // For demo purposes, we'll just use the URLs directly
        // In a real implementation, we would download these images
    }
    
    // Initialize gallery
    createPlaceholderImages();
    loadGalleryImages();
});
