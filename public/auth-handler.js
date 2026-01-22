// Authentication & Authorization Handler
// =====================================

// Check if user is authenticated
function isAuthenticated() {
  return !!localStorage.getItem('token');
}

// Get current user info
function getCurrentUser() {
  const userStr = localStorage.getItem('user');
  return userStr ? JSON.parse(userStr) : null;
}

// Get user type (user, provider, admin)
function getUserType() {
  return localStorage.getItem('userType') || null;
}

// Check if user has specific role
function hasRole(requiredRole) {
  const userType = getUserType();
  return userType === requiredRole;
}

// Protect page - redirect if not authenticated
function protectPage(requiredRole = null) {
  if (!isAuthenticated()) {
    window.location.href = '/index.html';
    return false;
  }

  if (requiredRole && !hasRole(requiredRole)) {
    window.location.href = '/index.html';
    return false;
  }

  return true;
}

// Logout function
function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  localStorage.removeItem('userType');
  window.location.href = '/index.html';
}

// Get authorization header
function getAuthHeader() {
  const token = localStorage.getItem('token');
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  };
}

// Make authenticated API call
async function apiCall(endpoint, method = 'GET', body = null) {
  const options = {
    method,
    headers: getAuthHeader()
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  try {
    const response = await fetch(endpoint, options);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'API Error');
    }

    return data;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
}

// Theme Management
// ================

function initTheme() {
  const savedTheme = localStorage.getItem('theme') || 'light';
  applyTheme(savedTheme);
  
  // Add theme toggle button if needed
  const themeToggle = document.getElementById('themeToggle');
  if (themeToggle) {
    themeToggle.addEventListener('click', toggleTheme);
    updateThemeButtonIcon(savedTheme);
  }
}

function applyTheme(theme) {
  const root = document.documentElement;
  
  if (theme === 'dark') {
    root.style.setProperty('--bg-primary', '#1a1a1a');
    root.style.setProperty('--bg-secondary', '#2d2d2d');
    root.style.setProperty('--bg-tertiary', '#3a3a3a');
    root.style.setProperty('--text-primary', '#ffffff');
    root.style.setProperty('--text-secondary', '#e0e0e0');
    root.style.setProperty('--border-color', '#404040');
    document.body.classList.add('dark-mode');
    document.body.classList.remove('light-mode');
  } else {
    root.style.setProperty('--bg-primary', '#ffffff');
    root.style.setProperty('--bg-secondary', '#f5f5f5');
    root.style.setProperty('--bg-tertiary', '#ebebeb');
    root.style.setProperty('--text-primary', '#333333');
    root.style.setProperty('--text-secondary', '#666666');
    root.style.setProperty('--border-color', '#e0e0e0');
    document.body.classList.add('light-mode');
    document.body.classList.remove('dark-mode');
  }
  
  localStorage.setItem('theme', theme);
}

function toggleTheme() {
  const currentTheme = localStorage.getItem('theme') || 'light';
  const newTheme = currentTheme === 'light' ? 'dark' : 'light';
  applyTheme(newTheme);
  updateThemeButtonIcon(newTheme);
}

function updateThemeButtonIcon(theme) {
  const themeToggle = document.getElementById('themeToggle');
  if (themeToggle) {
    themeToggle.innerHTML = theme === 'light' ? '🌙' : '☀️';
  }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
  initTheme();
});
