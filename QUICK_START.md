# SAHAYA - Quick Start Guide

## 🚀 Getting Started in 5 Minutes

### Step 1: Start the Server
```bash
cd /home/ssl41/Desktop/pdc/SAHAYA_YourTrustedHelper
npm start
```

You should see:
```
✅ Database connected
✅ SAHAYA SERVER RUNNING ON http://localhost:3000
```

### Step 2: Open Application
Open your browser and go to:
```
http://localhost:3000
```

---

## 🧪 Testing the Application

### Test Scenario 1: User Signup & Login
1. Click "Sign Up" on home page
2. Fill in all user details:
   - Name: John Doe
   - Email: john@example.com
   - Phone: 9876543210
   - Aadhaar: 123456789012
   - Address details (any valid values)
   - Password: Test@123 (must have uppercase, lowercase, special char, 8+ chars)
3. Click "Create Account"
4. You'll be redirected to login page
5. Login with your credentials
6. Access User Dashboard (dashboard1.html)

### Test Scenario 2: Provider Signup & Login
1. Click "Become a Provider" on home page
2. Fill in provider details:
   - Name: John Smith
   - Email: john.smith@example.com
   - Phone: 9876543211
   - Aadhaar: 123456789013
   - Select Service: Plumber (or any service)
   - Upload Proof: Any PDF or image file
   - Address details
   - Password: Test@123
3. Click "Create Account"
4. Login with credentials
5. Access Provider Dashboard (dashboard2.html)

### Test Scenario 3: Role Switching
1. On login page, switch between "User" and "Provider" roles
2. Each role uses different database tables
3. Try logging in with same credentials but different role

---

## 🔑 Sample Test Accounts (After First Signup)

### User Account
- Email: john@example.com
- Password: Test@123

### Provider Account
- Email: john.smith@example.com
- Password: Test@123

---

## 📁 File Locations & Features

### Frontend Pages
| File | Purpose | Features |
|------|---------|----------|
| index.html | Home page | Navigation, CTA, Features, Services |
| user-login.html | User login | Email, password, role selector |
| provider-login.html | Provider login | Service-specific branding |
| user-signup.html | User registration | Personal + address info |
| provider-signup.html | Provider registration | Service selection + proof upload |
| dashboard1.html | User dashboard | Services, bookings, statistics |
| dashboard2.html | Provider dashboard | Jobs, profile, earnings |

### Backend Files
| File | Purpose |
|------|---------|
| server.js | Main server |
| database.js | SQLite schema |
| routes/auth.js | Auth endpoints |
| package.json | Dependencies |

---

## 🎨 Features to Explore

### Frontend
- ✅ Modern gradient UI (Purple/Blue)
- ✅ Responsive design (Mobile/Tablet/Desktop)
- ✅ Form validation
- ✅ Password strength requirements
- ✅ Loading states
- ✅ Error messages
- ✅ Success confirmations

### Backend
- ✅ JWT authentication
- ✅ Role-based routing
- ✅ Database integration
- ✅ Error handling
- ✅ CORS enabled

---

## 🐛 Common Issues & Solutions

### Issue: "Cannot GET /user-signup"
**Solution**: Make sure you're on the correct URL:
- User signup: http://localhost:3000/user-signup.html
- Provider signup: http://localhost:3000/provider-signup.html

### Issue: "Fetch error" when signing up
**Solution**: 
1. Check if server is running
2. Check browser console for detailed error
3. Verify backend server is on port 3000

### Issue: Page not updating after signup
**Solution**: 
1. Clear browser cache (Ctrl+Shift+Del)
2. Hard refresh (Ctrl+F5)
3. Check localStorage in browser DevTools

### Issue: "Port 3000 already in use"
**Solution**: 
```bash
# Find process using port 3000
lsof -i :3000

# Kill the process
kill -9 <PID>

# Then start server again
npm start
```

---

## 🔍 Browser DevTools Tips

### Check Stored Data
1. Press F12 to open DevTools
2. Go to "Application" tab
3. Click "Local Storage"
4. See stored: token, role, userName, userEmail

### Check Network Requests
1. Go to "Network" tab
2. Perform login/signup
3. See POST requests to /auth/login and /auth/register
4. Check response body for success/error

### Check Console Errors
1. Go to "Console" tab
2. Any JavaScript errors will appear here
3. Check error messages for debugging

---

## 📊 Database Location

```
/home/ssl41/Desktop/pdc/SAHAYA_YourTrustedHelper/database.db
```

To inspect database:
```bash
# Install sqlite3 CLI (if not installed)
# Then run:
sqlite3 database.db

# Inside sqlite CLI:
.tables              # List all tables
SELECT * FROM users; # View users
SELECT * FROM providers; # View providers
```

---

## 🎯 What You Can Test

### Positive Cases
- ✅ Valid signup with all fields
- ✅ Valid login with correct credentials
- ✅ Dashboard loading with data
- ✅ Logout functionality
- ✅ Navigation between pages

### Negative Cases
- ✅ Signup with weak password
- ✅ Login with wrong credentials
- ✅ Signup with duplicate email
- ✅ Missing required fields
- ✅ Invalid email format

---

## 💡 Pro Tips

1. **Use browser DevTools** to monitor API calls and storage
2. **Check database.db** to see stored data
3. **Test on mobile** using responsive design mode (F12 → mobile icon)
4. **Try different browsers** (Chrome, Firefox, Safari, Edge)
5. **Monitor console errors** for debugging help

---

## 📞 Need Help?

1. Check README.md for detailed documentation
2. Check CHANGES_SUMMARY.md for implementation details
3. Read code comments in HTML/JS files
4. Check browser console for error messages

---

## ✅ Verification Checklist

Before using in production:
- [ ] Database created and initialized
- [ ] Server starts without errors
- [ ] Home page loads with proper styling
- [ ] Signup validation works
- [ ] Login redirects to dashboard
- [ ] Logout clears session
- [ ] Forms save to database
- [ ] Responsive on mobile
- [ ] No console errors

---

**Ready to go!** 🎉

Start the server and visit http://localhost:3000
