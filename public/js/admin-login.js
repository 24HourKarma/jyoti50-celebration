// Admin login JavaScript with real API integration
document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('loginForm');
    
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            
            // Show loading state
            const loginButton = document.querySelector('button[type="submit"]');
            const originalButtonText = loginButton.textContent;
            loginButton.textContent = 'Logging in...';
            loginButton.disabled = true;
            
            // Clear any previous error messages
            const errorMessage = document.getElementById('errorMessage');
            if (errorMessage) {
                errorMessage.style.display = 'none';
            }
            
            // Send login request to API
            fetch('/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password })
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Login failed');
                }
                return response.json();
            })
            .then(data => {
                // Store token and user info in localStorage
                localStorage.setItem('adminToken', data.token);
                localStorage.setItem('adminUser', JSON.stringify(data.user));
                localStorage.setItem('adminLoggedIn', 'true');
                
                // Redirect to admin dashboard
                window.location.href = '/admin-dashboard.html';
            })
            .catch(error => {
                console.error('Login error:', error);
                
                // Show error message
                if (!errorMessage) {
                    const errorDiv = document.createElement('div');
                    errorDiv.id = 'errorMessage';
                    errorDiv.className = 'error-message';
                    errorDiv.textContent = 'Invalid email or password. Please try again.';
                    errorDiv.style.color = '#ff0000';
                    errorDiv.style.marginTop = '10px';
                    errorDiv.style.textAlign = 'center';
                    loginForm.appendChild(errorDiv);
                } else {
                    errorMessage.textContent = 'Invalid email or password. Please try again.';
                    errorMessage.style.display = 'block';
                }
                
                // Reset button
                loginButton.textContent = originalButtonText;
                loginButton.disabled = false;
            });
        });
    }
});
