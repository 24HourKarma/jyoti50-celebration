// Updated admin login script with hardcoded credentials
document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('login-form');
    
    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Get form values
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        
        // Simple validation
        if (!email || !password) {
            showMessage('Please enter both email and password', 'error');
            return;
        }
        
        // Hardcoded admin credentials that will always work
        if ((email === 'shubham.pandey@gmail.com' && password === 'jyoti50admin') || 
            (email === 'admin@jyoti50celebration.com' && password === 'jyoti50admin')) {
            
            // Create a hardcoded token
            localStorage.setItem('jyoti50_auth_token', 'hardcoded_admin_token_for_guaranteed_access');
            
            // Redirect to admin dashboard
            window.location.href = '/admin-dashboard';
            return;
        }
        
        // If not using hardcoded credentials, try API login
        fetch('/api/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        })
        .then(response => {
            if (response.ok) {
                return response.json();
            } else {
                throw new Error('Invalid credentials');
            }
        })
        .then(data => {
            // Store token in localStorage
            localStorage.setItem('jyoti50_auth_token', data.token);
            
            // Redirect to admin dashboard
            window.location.href = '/admin-dashboard';
        })
        .catch(error => {
            console.error('Login error:', error);
            showMessage('Login failed. Please check your credentials.', 'error');
        });
    });
    
    function showMessage(message, type) {
        const messageElement = document.getElementById('message');
        messageElement.textContent = message;
        messageElement.className = type;
        messageElement.style.display = 'block';
        
        // Hide message after 3 seconds
        setTimeout(() => {
            messageElement.style.display = 'none';
        }, 3000);
    }
});
