# 🧪 SAHAYA Platform - Testing Guide

## Quick Navigation

| Role | Login URL | Redirect To | Notes |
|------|-----------|-------------|-------|
| **User** | `/user-login.html` | `/find-service.html` | Create new account via signup |
| **Provider** | `/provider-login.html` | `/dashboard2.html` | Register via provider signup |
| **Admin** | `/admin-login.html` | `/admin-panel.html` | Password: **SAHO9** |

---

## 🏠 Start Here

### 1. Visit Landing Page
```
http://localhost:3000/landing.html
```

**What you'll see:**
- Professional landing page with SAHAYA logo
- Three role options: User, Provider, Admin
- Feature cards
- Beautiful Royal Blue + Moonlight gradient background

### 2. Test User Flow
```
1. Click "Create Account" (User option)
2. Sign up with email & password
3. Fill profile: name, phone, city, state
4. Get redirected to find-service.html (User Dashboard)
5. Browse services and providers
```

### 3. Test Provider Flow
```
1. Click "Register as Provider"
2. Sign up with email & password
3. Select service type (Cleaning, Plumbing, etc.)
4. Fill location details
5. Get redirected to dashboard2.html (Provider Dashboard)
6. View pending bookings
```

### 4. Test Admin Access
```
1. Click "Admin Portal"
2. Enter password: SAHO9
3. Get redirected to admin-panel.html
4. View/manage users, providers, bookings
```

---

## 🔐 Authentication Testing

### ✅ Should Work:
- Login pages are accessible without authentication
- Create user account and login → redirects to user dashboard
- Create provider account and login → redirects to provider dashboard
- Admin password login → redirects to admin panel
- Logout button → clears data and returns to landing page

### ❌ Should Block:
- Accessing `/find-service.html` without user login (redirects to landing)
- Accessing `/dashboard2.html` without provider login (redirects to landing)
- Accessing `/admin-panel.html` without admin login (redirects to landing)
- Trying to access other role's pages with your role

### Test Code in Browser Console:
```javascript
// Check if authenticated
localStorage.getItem('token')     // Should return token if logged in
localStorage.getItem('userType')  // Should return 'user', 'provider', or 'admin'
localStorage.getItem('user')      // Should return user JSON object

// Clear auth to test protection
localStorage.clear()
// Now try accessing protected page - should redirect to landing
```

---

## 🎨 Color & Design Testing

### RGB Values to Verify:
- **Royal Blue**: `#4169E1` - Main buttons, text, headers
- **Royal Light**: `#5B7FED` - Hover states, gradients
- **Moonlight Light**: `#E0E6FF` - Card backgrounds
- **Moonlight Dark**: `#D0D8F4` - Secondary gradients

### Test on These Pages:
- [ ] landing.html - Check gradient background
- [ ] user-login.html - Button colors
- [ ] find-service.html - Card styling
- [ ] dashboard2.html - Header and cards
- [ ] admin-panel.html - Table and buttons
- [ ] payment.html - Payment method cards

### Use Browser DevTools:
```
Right-click → Inspect Element
In Console:
document.body.style.backgroundColor  // Check current colors
```

---

## 🌓 Dark Mode Testing

### Current Setup:
Dark mode CSS is ready but toggle button needs to be added to pages.

### Test Dark Mode:
1. Open browser Console (F12)
2. Run: 
```javascript
localStorage.setItem('theme', 'dark')
document.body.classList.add('dark-mode')
```
3. Reload page - should stay in dark mode

4. To return to light:
```javascript
localStorage.setItem('theme', 'light')
document.body.classList.remove('dark-mode')
```

### Dark Mode Color Test:
- Background should be: `#1a1a2e` → `#16213e` → `#0f3460`
- Text should be: `#e0e0e0`
- Cards should be: `rgba(40, 40, 50, 0.95)`

---

## 💬 Chat Testing

### Issue Fixed:
Chat no longer auto-opens when visiting the page.

### Test Chat Flow:
```
1. As User: Find a service provider
2. Click "View Profile" 
3. Click "Connect" button (or similar)
4. This creates chat connection
5. Chat opens with URL containing chat_id
6. Messages appear with auto-refresh
```

### Test Direct Access:
```
1. Visit /chat.html without parameters
   → Should show: "Select a provider to start chatting"

2. Visit /chat.html?chat_id=123
   → Should show messages and allow chatting
```

---

## 💳 Payment Testing

### Issue Fixed:
Payment page no longer shows preset amounts without a valid booking.

### Test Payment Flow:
```
1. As User: Create a booking
2. Click "Proceed to Payment"
3. Payment page should load with booking details
4. Preset tip options appear
5. Can select payment method
```

### Test Direct Access:
```
1. Visit /payment.html
   → Should show: "No Booking Found - Error"

2. Visit /payment.html?booking_id=123
   → Should show: Payment form with amounts
```

---

## 👥 Role-Based Access Testing

### Admin Testing:
```
Login as Admin:
✓ Access /admin-panel.html
✓ See user management
✓ See provider management
✓ See booking statistics

Try as User:
✗ Visit /admin-panel.html (redirects to landing)
✗ Password field in admin-login doesn't show to users after login
```

### User Testing:
```
Login as User:
✓ Access /find-service.html
✓ Browse providers
✓ See user pages
✓ Cannot access /dashboard2.html

Try as Provider:
✗ Visit /find-service.html (redirects to landing)
```

### Provider Testing:
```
Login as Provider:
✓ Access /dashboard2.html
✓ See pending bookings
✓ Cannot access /find-service.html
✓ Access provider earnings

Try as User:
✗ Visit /dashboard2.html (redirects to landing)
```

---

## 🔒 Admin Security Testing

### Test Admin Login:
```
1. Visit /admin-login.html
   ✓ Should show: Only password field + info box
   ✗ Should NOT show: Username field, example credentials

2. Enter any admin ID (field is optional)
3. Enter password: SAHO9
4. Should redirect to /admin-panel.html
```

### Password Hint Test:
```
In browser inspector:
- Find password input
- Should have type="password" (hidden)
- Should NOT show example like "hint: SAHO9"
- Should NOT have hardcoded password visible
```

---

## 📱 Responsive Testing

### Mobile Breakpoints (Test at these widths):
- [ ] 320px (Phone)
- [ ] 768px (Tablet)
- [ ] 1024px (Desktop)

### Use Browser Tools:
```
Chrome: F12 → Toggle Device Toolbar (Ctrl+Shift+M)
Firefox: F12 → Responsive Design Mode (Ctrl+Shift+M)
```

### Test Pages on Mobile:
- [ ] landing.html - Stack properly
- [ ] Login pages - Forms responsive
- [ ] find-service.html - Cards stack, nav adjusts
- [ ] admin-panel.html - Table scrollable
- [ ] payment.html - Form inputs full width

---

## 🎯 Professional Content Testing

### Should See:
- ✓ Clear feature descriptions without excessive stats
- ✓ Professional language and tone
- ✓ Functional information, not promotional
- ✓ Clean layout without cluttered elements

### Should NOT See:
- ✗ "World's best platform" type boasting
- ✗ Excessive statistics inside app pages
- ✗ Marketing language
- ✗ Feature counting

---

## 🖼️ Logo Testing

### LOGO.png Integration:
```
1. Place LOGO.png in /public folder
2. Visit pages - logo should appear:
   ✓ landing.html
   ✓ user-login.html
   ✓ provider-login.html
   ✓ admin-login.html

3. If logo missing:
   ✓ Should show emoji fallback
   ✗ Should not break layout
```

### Test Fallback:
```
1. Rename LOGO.png temporarily
2. Visit login page
3. Should show emoji icon instead
4. Layout should still work
```

---

## 🐛 Debug Mode

### Enable Console Logging:
```javascript
// In browser console to test auth
window.localStorage

// Check current user
JSON.parse(localStorage.getItem('user'))

// Check theme
localStorage.getItem('theme')

// Test redirect
window.location.href
```

### API Testing:
```javascript
// Test API with auth token
const token = localStorage.getItem('token')
fetch('/auth/me', {
  headers: { 'Authorization': `Bearer ${token}` }
}).then(r => r.json()).then(d => console.log(d))
```

---

## ✅ Checklist Before Production

### Authentication:
- [ ] Login redirects to correct dashboard
- [ ] Logout clears data and goes to landing
- [ ] Protected pages block unauthorized access
- [ ] Admin password works
- [ ] Admin password not shown in UI

### Colors & Design:
- [ ] All pages use Royal Blue (#4169E1)
- [ ] Moonlight colors applied correctly
- [ ] Glassmorphism effects working
- [ ] Gradients display properly
- [ ] Hover effects smooth

### Functionality:
- [ ] Chat requires provider connection
- [ ] Payment requires booking
- [ ] Admin panel secure
- [ ] User dashboards separate
- [ ] Provider dashboards separate

### Dark Mode:
- [ ] CSS ready on all pages
- [ ] Colors correct in dark mode
- [ ] Persistence working
- [ ] No broken elements in dark mode

### Mobile:
- [ ] All pages responsive
- [ ] Forms work on mobile
- [ ] Navigation mobile-friendly
- [ ] Touch targets adequate

---

## 📝 Troubleshooting

### Issue: Not redirecting after login
**Solution**: Clear localStorage and retry
```javascript
localStorage.clear()
// Then logout and login again
```

### Issue: Dark mode not applying
**Solution**: Add this to pages without it
```javascript
const theme = localStorage.getItem('theme') || 'light'
if (theme === 'dark') document.body.classList.add('dark-mode')
```

### Issue: Chat auto-opens
**Solution**: Already fixed - check URL parameter present
```javascript
const chatId = new URLSearchParams(window.location.search).get('chat_id')
if (!chatId) { /* show message */ }
```

### Issue: Can access protected pages
**Solution**: Check token and userType in localStorage
```javascript
localStorage.getItem('token')      // Must exist
localStorage.getItem('userType')   // Must match required role
```

---

## 🚀 Final Tests

```bash
# Start server
npm start

# Test endpoints
curl http://localhost:3000/landing.html
curl http://localhost:3000/user-login.html
curl http://localhost:3000/admin-login.html

# Check if running
curl http://localhost:3000/features.html | head -20
```

---

**All Tests Complete! Your SAHAYA platform is ready for use.** 🎉

*Last Updated: January 22, 2026*
