/**
 * Profile Page Logic (profile.js)
 * ================================
 * User profile display and edit functionality.
 */

// ──────────────────────────────────────────────
// Load User Profile
// ──────────────────────────────────────────────
async function loadProfile() {
  try {
    const user = getCurrentUser();
    if (!user) {
      window.location.href = 'login.html';
      return;
    }
    const profile = await apiRequest(API_ENDPOINTS.profile);
    document.getElementById('firstName').value = profile.name?.split(' ')[0] || '';
    document.getElementById('lastName').value = profile.name?.split(' ')[1] || '';
    document.getElementById('email').value = profile.email || '';
    document.getElementById('phone').value = profile.phone || '';
    document.getElementById('role').textContent = profile.role || 'Customer';
    const userKey = typeof STORAGE_KEYS !== 'undefined' ? STORAGE_KEYS.user : 'user';
    localStorage.setItem(userKey, JSON.stringify(profile));
  } catch (error) {
    console.error('Error loading profile:', error);
    alert('Failed to load profile');
  }
}

// ──────────────────────────────────────────────
// Update Profile
// ──────────────────────────────────────────────
async function updateProfile() {
  try {
    const formData = {
      name: `${document.getElementById('firstName').value} ${document.getElementById('lastName').value}`,
      phone: document.getElementById('phone').value,
    };
    const updated = await apiRequest(API_ENDPOINTS.updateProfile, {
      method: 'PUT',
      body: formData
    });
    const userKey = typeof STORAGE_KEYS !== 'undefined' ? STORAGE_KEYS.user : 'user';
    localStorage.setItem(userKey, JSON.stringify(updated));
    alert('Profile updated successfully!');
  } catch (error) {
    console.error('Error updating profile:', error);
    alert('Failed to update profile');
  }
}

// ──────────────────────────────────────────────
// Change Password
// ──────────────────────────────────────────────
async function changePassword() {
  const oldPassword = document.getElementById('oldPassword').value;
  const newPassword = document.getElementById('newPassword').value;
  const confirmPassword = document.getElementById('confirmPassword').value;

  if (!oldPassword || !newPassword || !confirmPassword) {
    alert('All fields are required');
    return;
  }

  if (newPassword !== confirmPassword) {
    alert('New passwords do not match');
    return;
  }

  if (newPassword.length < 6) {
    alert('New password must be at least 6 characters');
    return;
  }

  try {
    await apiRequest(API_ENDPOINTS.updateProfile, {
      method: 'PUT',
      body: {
        password: document.getElementById('newPassword').value,
        oldPassword: document.getElementById('oldPassword').value
      }
    });
    alert('Password changed successfully!');
    document.getElementById('oldPassword').value = '';
    document.getElementById('newPassword').value = '';
    document.getElementById('confirmPassword').value = '';
  } catch (error) {
    alert('Failed to change password');
  }
}

// ──────────────────────────────────────────────
// Delete Account
// ──────────────────────────────────────────────
async function deleteAccount() {
  if (!confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
    return;
  }

  try {
    await apiRequest(API_ENDPOINTS.profile, { method: 'DELETE' });
    alert('Account deleted successfully');
    logout();
  } catch (error) {
    alert('Failed to delete account');
  }
}

// ──────────────────────────────────────────────
// Toggle Edit Mode
// ──────────────────────────────────────────────
function toggleEditMode() {
  const btnEdit = document.getElementById('btnEdit');
  const btnSave = document.getElementById('btnSave');
  const inputs = document.querySelectorAll('.profile-input');

  inputs.forEach(input => input.disabled = !input.disabled);
  btnEdit.classList.toggle('d-none');
  btnSave.classList.toggle('d-none');
}

// ──────────────────────────────────────────────
// Update Navigation Bar
// ──────────────────────────────────────────────
function updateNavBar() {
  const user = getCurrentUser();
  const authButtons = document.getElementById('authButtons');
  const logoutBtn = document.getElementById('logoutBtn');

  if (user) {
    authButtons?.classList.add('d-none');
    logoutBtn?.classList.remove('d-none');
  } else {
    authButtons?.classList.remove('d-none');
    logoutBtn?.classList.add('d-none');
    window.location.href = 'login.html';
  }
}

// ──────────────────────────────────────────────
// Initialize Page
// ──────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  updateNavBar();
  loadProfile();

  // Attach event listeners
  document.getElementById('btnSave')?.addEventListener('click', updateProfile);
  document.getElementById('btnChangePassword')?.addEventListener('click', changePassword);
  document.getElementById('btnDeleteAccount')?.addEventListener('click', deleteAccount);
  document.getElementById('btnEdit')?.addEventListener('click', toggleEditMode);

  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', logout);
  }
});
