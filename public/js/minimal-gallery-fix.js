// minimal-gallery-fix.js - Minimal solution to fix gallery upload without affecting other functionality

/**
 * This script provides a minimal solution for the gallery upload issue:
 * 1. Only fixes the gallery upload functionality without changing anything else
 * 2. Preserves the existing admin login process
 * 3. Maintains database connections and real data
 * 4. No mock data or interface changes
 */

(function() {
  console.log('Minimal gallery fix loaded');
  
  // Wait for the page to fully load
  document.addEventListener('DOMContentLoaded', function() {
    // Only run on admin pages with gallery upload functionality
    if (isAdminPage() && hasGalleryUpload()) {
      console.log('Admin page with gallery upload detected, applying minimal fix');
      fixGalleryUpload();
    }
  });
  
  // Check if current page is an admin page
  function isAdminPage() {
    return window.location.href.includes('admin') || 
           document.title.toLowerCase().includes('admin');
  }
  
  // Check if page has gallery upload functionality
  function hasGalleryUpload() {
    return document.querySelector('form[id*="gallery"]') !== null || 
           document.querySelector('input[type="file"]') !== null;
  }
  
  // Fix gallery upload functionality without changing anything else
  function fixGalleryUpload() {
    console.log('Applying minimal gallery upload fix');
    
    // Find all file upload forms
    const uploadForms = document.querySelectorAll('form');
    
    uploadForms.forEach(form => {
      // Check if this form has a file input
      const fileInput = form.querySelector('input[type="file"]');
      if (!fileInput) return;
      
      console.log('Found file upload form, attaching enhanced handler');
      
      // Save the original submit handler
      const originalSubmit = form.onsubmit;
      
      // Override the form submission
      form.addEventListener('submit', async function(e) {
        // Prevent default form submission
        e.preventDefault();
        
        console.log('Intercepted gallery upload submission');
        
        // Get form elements
        const fileInput = form.querySelector('input[type="file"]');
        const titleInput = form.querySelector('input[name*="title"]');
        const descriptionInput = form.querySelector('textarea');
        
        // Validate inputs
        if (!fileInput || !fileInput.files || fileInput.files.length === 0) {
          alert('Please select an image to upload');
          return;
        }
        
        const file = fileInput.files[0];
        const title = titleInput ? titleInput.value : '';
        const description = descriptionInput ? descriptionInput.value : '';
        
        try {
          // Use the enhanced upload function
          await uploadImageWithFix(form, file, title, description);
        } catch (error) {
          console.error('Upload error:', error);
          alert('Error uploading image: ' + (error.message || 'Unknown error'));
        }
      });
    });
  }
  
  // Enhanced upload function with better error handling
  async function uploadImageWithFix(form, file, title, description) {
    console.log('Using enhanced upload function');
    
    // Create FormData from the original form
    const formData = new FormData(form);
    
    // Ensure the file is included (in case the form structure is different)
    if (!formData.has('image') && !formData.has('file')) {
      formData.append('image', file);
    }
    
    // Get the form's action URL or default to /api/gallery/upload
    const url = form.action || '/api/gallery/upload';
    
    // Get the form's method or default to POST
    const method = form.method || 'POST';
    
    try {
      // Make the fetch request with proper headers and credentials
      const response = await fetch(url, {
        method: method,
        body: formData,
        // Include credentials to ensure cookies are sent with the request
        credentials: 'include'
      });
      
      // Check if the response is OK
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
        // Don't throw here, just log the error and continue
        responseData = { success: true, message: 'Image uploaded successfully' };
      }
      
      // Show success message
      alert('Image uploaded successfully!');
      
      // Reset the form
      form.reset();
      
      // If the page has a refresh or reload function, call it
      if (window.refreshGallery) {
        window.refreshGallery();
      } else if (window.loadGallery) {
        window.loadGallery();
      }
      
      return responseData;
    } catch (error) {
      console.error('Upload failed:', error);
      throw error;
    }
  }
})();
