// gallery-upload-fix.js - Fix for gallery upload CORS issues

// This file provides a fix for the gallery upload functionality in the admin panel
// It addresses the "Unexpected token '<', "<!DOCTYPE "... is not valid JSON" error
// by properly handling multipart/form-data uploads and ensuring proper CORS headers

// Function to handle file uploads with proper error handling
async function uploadImageWithFix(file, title, description) {
  try {
    // Create FormData object for multipart/form-data upload
    const formData = new FormData();
    formData.append('image', file);
    formData.append('title', title || 'Untitled Image');
    formData.append('description', description || '');
    
    // Log the upload attempt for debugging
    console.log('Attempting to upload image:', {
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
      title: title,
      description: description
    });
    
    // Make the fetch request with proper headers and credentials
    const response = await fetch('/api/gallery/upload', {
      method: 'POST',
      body: formData,
      // Include credentials to ensure cookies are sent with the request
      credentials: 'include',
      // Don't set Content-Type header - browser will set it with boundary for multipart/form-data
    });
    
    // First check if the response is OK
    if (!response.ok) {
      // Get response as text for better error diagnosis
      const errorText = await response.text();
      console.error('Upload failed with status:', response.status, response.statusText);
      console.error('Error response body:', errorText);
      
      // Try to parse as JSON if possible, otherwise use text
      let errorData;
      try {
        errorData = JSON.parse(errorText);
      } catch (e) {
        // If it's not JSON, create an error object with the text
        errorData = { error: true, message: errorText || response.statusText };
      }
      
      throw new Error(`Error uploading image: ${errorData.message || response.statusText}`);
    }
    
    // Try to parse response as JSON
    let responseData;
    try {
      const responseText = await response.text();
      responseData = responseText ? JSON.parse(responseText) : {};
      console.log('Upload successful:', responseData);
    } catch (parseError) {
      console.error('Error parsing response:', parseError);
      throw new Error('Invalid response format from server');
    }
    
    return responseData;
  } catch (error) {
    console.error('Upload failed:', error);
    throw error;
  }
}

// Replace the original upload function in the admin panel
document.addEventListener('DOMContentLoaded', function() {
  console.log('Gallery upload fix loaded');
  
  // Wait for the admin panel to load
  setTimeout(() => {
    // Check if we're on the admin page
    if (document.querySelector('#admin-panel') || document.querySelector('#gallery-upload-form')) {
      console.log('Admin panel detected, applying gallery upload fix');
      
      // Find the gallery upload form
      const uploadForm = document.querySelector('#gallery-upload-form') || document.querySelector('form[action*="gallery"]');
      
      if (uploadForm) {
        console.log('Gallery upload form found, attaching fixed upload handler');
        
        // Override the form submission
        uploadForm.addEventListener('submit', async function(e) {
          e.preventDefault();
          
          // Get form elements
          const imageInput = uploadForm.querySelector('input[type="file"]');
          const titleInput = uploadForm.querySelector('input[name="title"]');
          const descriptionInput = uploadForm.querySelector('textarea[name="description"]');
          const submitButton = uploadForm.querySelector('button[type="submit"]');
          const statusElement = document.querySelector('#upload-status') || 
                               document.createElement('div');
          
          if (!statusElement.id) {
            statusElement.id = 'upload-status';
            uploadForm.appendChild(statusElement);
          }
          
          // Validate inputs
          if (!imageInput || !imageInput.files || imageInput.files.length === 0) {
            statusElement.textContent = 'Please select an image to upload';
            statusElement.style.color = 'red';
            return;
          }
          
          const file = imageInput.files[0];
          const title = titleInput ? titleInput.value : '';
          const description = descriptionInput ? descriptionInput.value : '';
          
          // Disable submit button and show loading state
          if (submitButton) {
            submitButton.disabled = true;
            submitButton.textContent = 'Uploading...';
          }
          
          statusElement.textContent = 'Uploading image...';
          statusElement.style.color = 'blue';
          
          try {
            // Use the fixed upload function
            const result = await uploadImageWithFix(file, title, description);
            
            // Show success message
            statusElement.textContent = 'Image uploaded successfully!';
            statusElement.style.color = 'green';
            
            // Reset form
            uploadForm.reset();
            
            // Refresh gallery display if available
            if (typeof refreshGallery === 'function') {
              refreshGallery();
            } else {
              // If no refresh function exists, reload the page after a delay
              setTimeout(() => {
                window.location.reload();
              }, 1500);
            }
          } catch (error) {
            // Show error message
            statusElement.textContent = error.message || 'Failed to upload image';
            statusElement.style.color = 'red';
            console.error('Upload error:', error);
          } finally {
            // Re-enable submit button
            if (submitButton) {
              submitButton.disabled = false;
              submitButton.textContent = 'Upload';
            }
          }
        });
      } else {
        console.warn('Gallery upload form not found');
      }
    }
  }, 1000); // Wait 1 second for the admin panel to fully load
});

// Export the fixed upload function for use in other scripts
window.uploadImageWithFix = uploadImageWithFix;
