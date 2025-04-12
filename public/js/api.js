// api.js - API client for Jyoti's 50th Birthday Celebration website

// API base URL - will be automatically set based on environment
const API_BASE_URL = window.location.origin + '/api';

// API client object
const api = {
    // Authentication
    auth: {
        // Login with username/email and password
        login: async (credentials) => {
            try {
                const response = await fetch(`${API_BASE_URL}/auth/login`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(credentials)
                });
                
                if (!response.ok) {
                    const error = await response.json();
                    throw new Error(error.message || 'Login failed');
                }
                
                const data = await response.json();
                
                // Store token and user data in localStorage
                localStorage.setItem('jyoti50_token', data.token);
                localStorage.setItem('jyoti50_user', JSON.stringify(data.user));
                
                return data;
            } catch (error) {
                console.error('Login error:', error);
                throw error;
            }
        },
        
        // Verify token
        verify: async () => {
            try {
                const token = localStorage.getItem('jyoti50_token');
                
                if (!token) {
                    throw new Error('No token found');
                }
                
                const response = await fetch(`${API_BASE_URL}/auth/verify`, {
                    headers: {
                        'x-auth-token': token
                    }
                });
                
                if (!response.ok) {
                    // Clear invalid token
                    localStorage.removeItem('jyoti50_token');
                    localStorage.removeItem('jyoti50_user');
                    throw new Error('Invalid token');
                }
                
                const data = await response.json();
                return data;
            } catch (error) {
                console.error('Token verification error:', error);
                throw error;
            }
        },
        
        // Logout
        logout: () => {
            localStorage.removeItem('jyoti50_token');
            localStorage.removeItem('jyoti50_user');
        },
        
        // Get token
        getToken: () => {
            return localStorage.getItem('jyoti50_token');
        },
        
        // Get user
        getUser: () => {
            const user = localStorage.getItem('jyoti50_user');
            return user ? JSON.parse(user) : null;
        },
        
        // Check if user is authenticated
        isAuthenticated: () => {
            return !!localStorage.getItem('jyoti50_token');
        }
    },
    
    // Events
    events: {
        // Get all events
        getAll: async () => {
            try {
                const response = await fetch(`${API_BASE_URL}/events`);
                
                if (!response.ok) {
                    throw new Error('Failed to fetch events');
                }
                
                return await response.json();
            } catch (error) {
                console.error('Error fetching events:', error);
                throw error;
            }
        },
        
        // Create new event
        create: async (eventData) => {
            try {
                const token = localStorage.getItem('jyoti50_token');
                
                if (!token) {
                    throw new Error('Authentication required');
                }
                
                const response = await fetch(`${API_BASE_URL}/events`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify(eventData)
                });
                
                if (!response.ok) {
                    const error = await response.json();
                    throw new Error(error.message || 'Failed to create event');
                }
                
                return await response.json();
            } catch (error) {
                console.error('Error creating event:', error);
                throw error;
            }
        },
        
        // Update event
        update: async (id, eventData) => {
            try {
                const token = localStorage.getItem('jyoti50_token');
                
                if (!token) {
                    throw new Error('Authentication required');
                }
                
                const response = await fetch(`${API_BASE_URL}/events/${id}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify(eventData)
                });
                
                if (!response.ok) {
                    const error = await response.json();
                    throw new Error(error.message || 'Failed to update event');
                }
                
                return await response.json();
            } catch (error) {
                console.error('Error updating event:', error);
                throw error;
            }
        },
        
        // Delete event
        delete: async (id) => {
            try {
                const token = localStorage.getItem('jyoti50_token');
                
                if (!token) {
                    throw new Error('Authentication required');
                }
                
                const response = await fetch(`${API_BASE_URL}/events/${id}`, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                
                if (!response.ok) {
                    const error = await response.json();
                    throw new Error(error.message || 'Failed to delete event');
                }
                
                return await response.json();
            } catch (error) {
                console.error('Error deleting event:', error);
                throw error;
            }
        },
        
        // Import events from Google Sheet
        importFromSheet: async () => {
            try {
                const token = localStorage.getItem('jyoti50_token');
                
                if (!token) {
                    throw new Error('Authentication required');
                }
                
                const response = await fetch(`${API_BASE_URL}/events/import-from-sheet`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    }
                });
                
                if (!response.ok) {
                    const error = await response.json();
                    throw new Error(error.message || 'Failed to import events from Google Sheet');
                }
                
                return await response.json();
            } catch (error) {
                console.error('Error importing events from Google Sheet:', error);
                throw error;
            }
        }
    },
    
    // Contacts
    contacts: {
        // Get all contacts
        getAll: async () => {
            try {
                const response = await fetch(`${API_BASE_URL}/contacts`);
                
                if (!response.ok) {
                    throw new Error('Failed to fetch contacts');
                }
                
                return await response.json();
            } catch (error) {
                console.error('Error fetching contacts:', error);
                throw error;
            }
        },
        
        // Create new contact
        create: async (contactData) => {
            try {
                const token = localStorage.getItem('jyoti50_token');
                
                if (!token) {
                    throw new Error('Authentication required');
                }
                
                const response = await fetch(`${API_BASE_URL}/contacts`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify(contactData)
                });
                
                if (!response.ok) {
                    const error = await response.json();
                    throw new Error(error.message || 'Failed to create contact');
                }
                
                return await response.json();
            } catch (error) {
                console.error('Error creating contact:', error);
                throw error;
            }
        },
        
        // Update contact
        update: async (id, contactData) => {
            try {
                const token = localStorage.getItem('jyoti50_token');
                
                if (!token) {
                    throw new Error('Authentication required');
                }
                
                const response = await fetch(`${API_BASE_URL}/contacts/${id}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify(contactData)
                });
                
                if (!response.ok) {
                    const error = await response.json();
                    throw new Error(error.message || 'Failed to update contact');
                }
                
                return await response.json();
            } catch (error) {
                console.error('Error updating contact:', error);
                throw error;
            }
        },
        
        // Delete contact
        delete: async (id) => {
            try {
                const token = localStorage.getItem('jyoti50_token');
                
                if (!token) {
                    throw new Error('Authentication required');
                }
                
                const response = await fetch(`${API_BASE_URL}/contacts/${id}`, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                
                if (!response.ok) {
                    const error = await response.json();
                    throw new Error(error.message || 'Failed to delete contact');
                }
                
                return await response.json();
            } catch (error) {
                console.error('Error deleting contact:', error);
                throw error;
            }
        }
    },
    
    // Reminders
    reminders: {
        // Get all reminders
        getAll: async () => {
            try {
                const response = await fetch(`${API_BASE_URL}/reminders`);
                
                if (!response.ok) {
                    throw new Error('Failed to fetch reminders');
                }
                
                return await response.json();
            } catch (error) {
                console.error('Error fetching reminders:', error);
                throw error;
            }
        },
        
        // Create new reminder
        create: async (reminderData) => {
            try {
                const token = localStorage.getItem('jyoti50_token');
                
                if (!token) {
                    throw new Error('Authentication required');
                }
                
                const response = await fetch(`${API_BASE_URL}/reminders`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify(reminderData)
                });
                
                if (!response.ok) {
                    const error = await response.json();
                    throw new Error(error.message || 'Failed to create reminder');
                }
                
                return await response.json();
            } catch (error) {
                console.error('Error creating reminder:', error);
                throw error;
            }
        },
        
        // Update reminder
        update: async (id, reminderData) => {
            try {
                const token = localStorage.getItem('jyoti50_token');
                
                if (!token) {
                    throw new Error('Authentication required');
                }
                
                const response = await fetch(`${API_BASE_URL}/reminders/${id}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify(reminderData)
                });
                
                if (!response.ok) {
                    const error = await response.json();
                    throw new Error(error.message || 'Failed to update reminder');
                }
                
                return await response.json();
            } catch (error) {
                console.error('Error updating reminder:', error);
                throw error;
            }
        },
        
        // Delete reminder
        delete: async (id) => {
            try {
                const token = localStorage.getItem('jyoti50_token');
                
                if (!token) {
                    throw new Error('Authentication required');
                }
                
                const response = await fetch(`${API_BASE_URL}/reminders/${id}`, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                
                if (!response.ok) {
                    const error = await response.json();
                    throw new Error(error.message || 'Failed to delete reminder');
                }
                
                return await response.json();
            } catch (error) {
                console.error('Error deleting reminder:', error);
                throw error;
            }
        }
    },
    
    // Notes
    notes: {
        // Get all notes
        getAll: async () => {
            try {
                const response = await fetch(`${API_BASE_URL}/notes`);
                
                if (!response.ok) {
                    throw new Error('Failed to fetch notes');
                }
                
                return await response.json();
            } catch (error) {
                console.error('Error fetching notes:', error);
                throw error;
            }
        },
        
        // Create new note
        create: async (noteData) => {
            try {
                const token = localStorage.getItem('jyoti50_token');
                
                if (!token) {
                    throw new Error('Authentication required');
                }
                
                const response = await fetch(`${API_BASE_URL}/notes`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify(noteData)
                });
                
                if (!response.ok) {
                    const error = await response.json();
                    throw new Error(error.message || 'Failed to create note');
                }
                
                return await response.json();
            } catch (error) {
                console.error('Error creating note:', error);
                throw error;
            }
        },
        
        // Update note
        update: async (id, noteData) => {
            try {
                const token = localStorage.getItem('jyoti50_token');
                
                if (!token) {
                    throw new Error('Authentication required');
                }
                
                const response = await fetch(`${API_BASE_URL}/notes/${id}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify(noteData)
                });
                
                if (!response.ok) {
                    const error = await response.json();
                    throw new Error(error.message || 'Failed to update note');
                }
                
                return await response.json();
            } catch (error) {
                console.error('Error updating note:', error);
                throw error;
            }
        },
        
        // Delete note
        delete: async (id) => {
            try {
                const token = localStorage.getItem('jyoti50_token');
                
                if (!token) {
                    throw new Error('Authentication required');
                }
                
                const response = await fetch(`${API_BASE_URL}/notes/${id}`, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                
                if (!response.ok) {
                    const error = await response.json();
                    throw new Error(error.message || 'Failed to delete note');
                }
                
                return await response.json();
            } catch (error) {
                console.error('Error deleting note:', error);
                throw error;
            }
        }
    },
    
    // Gallery
    gallery: {
        // Get all gallery images
        getAll: async () => {
            try {
                const response = await fetch(`${API_BASE_URL}/gallery`);
                
                if (!response.ok) {
                    throw new Error('Failed to fetch gallery');
                }
                
                return await response.json();
            } catch (error) {
                console.error('Error fetching gallery:', error);
                throw error;
            }
        },
        
        // Upload new image
        upload: async (formData) => {
            try {
                const token = localStorage.getItem('jyoti50_token');
                
                if (!token) {
                    throw new Error('Authentication required');
                }
                
                const response = await fetch(`${API_BASE_URL}/gallery`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    },
                    body: formData
                });
                
                if (!response.ok) {
                    const error = await response.json();
                    throw new Error(error.message || 'Failed to upload image');
                }
                
                return await response.json();
            } catch (error) {
                console.error('Error uploading image:', error);
                throw error;
            }
        },
        
        // Update image caption
        updateCaption: async (id, caption) => {
            try {
                const token = localStorage.getItem('jyoti50_token');
                
                if (!token) {
                    throw new Error('Authentication required');
                }
                
                const response = await fetch(`${API_BASE_URL}/gallery/${id}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({ caption })
                });
                
                if (!response.ok) {
                    const error = await response.json();
                    throw new Error(error.message || 'Failed to update caption');
                }
                
                return await response.json();
            } catch (error) {
                console.error('Error updating caption:', error);
                throw error;
            }
        },
        
        // Delete image
        delete: async (id) => {
            try {
                const token = localStorage.getItem('jyoti50_token');
                
                if (!token) {
                    throw new Error('Authentication required');
                }
                
                const response = await fetch(`${API_BASE_URL}/gallery/${id}`, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                
                if (!response.ok) {
                    const error = await response.json();
                    throw new Error(error.message || 'Failed to delete image');
                }
                
                return await response.json();
            } catch (error) {
                console.error('Error deleting image:', error);
                throw error;
            }
        }
    },
    
    // Settings
    settings: {
        // Get all settings
        getAll: async () => {
            try {
                const response = await fetch(`${API_BASE_URL}/settings`);
                
                if (!response.ok) {
                    throw new Error('Failed to fetch settings');
                }
                
                return await response.json();
            } catch (error) {
                console.error('Error fetching settings:', error);
                throw error;
            }
        },
        
        // Get setting by key
        get: async (key) => {
            try {
                const response = await fetch(`${API_BASE_URL}/settings/${key}`);
                
                if (!response.ok) {
                    throw new Error(`Failed to fetch setting: ${key}`);
                }
                
                return await response.json();
            } catch (error) {
                console.error(`Error fetching setting ${key}:`, error);
                throw error;
            }
        },
        
        // Update setting
        update: async (key, value) => {
            try {
                const token = localStorage.getItem('jyoti50_token');
                
                if (!token) {
                    throw new Error('Authentication required');
                }
                
                const response = await fetch(`${API_BASE_URL}/settings/${key}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({ value })
                });
                
                if (!response.ok) {
                    const error = await response.json();
                    throw new Error(error.message || 'Failed to update setting');
                }
                
                return await response.json();
            } catch (error) {
                console.error('Error updating setting:', error);
                throw error;
            }
        }
    }
};

// Export the API client
window.api = api;
