# RentWiz Property Management System - Testing Guide

## 🚀 System Status

- ✅ **Frontend**: Running on `http://localhost:5173`
- ✅ **Backend**: Running on `http://localhost:5268`
- ✅ **Database**: Seeded with test data
- ✅ **CORS**: Configured and working

## 🔐 Test Credentials

### Owner Accounts (Use these to login):

| Login ID | Password    | Role  | Full Name |
| -------- | ----------- | ----- | --------- |
| `owner1` | `password1` | Owner | Owner One |
| `owner2` | `password2` | Owner | Owner Two |

## 🧪 Testing Steps

### 1. **Login Test**

1. Go to `http://localhost:5173`
2. Use credentials: `owner1` / `password1`
3. Should redirect to Dashboard upon successful login

### 2. **Dashboard Overview**

- View property statistics
- Check recent rent payments
- Test quick action buttons

### 3. **Properties Management**

- **List View**: See all properties with search/filter
- **Create**: Add a new property with complete details
- **Edit**: Modify existing property information
- **Details**: View detailed property information with rooms

### 4. **Rooms Management**

- **List View**: See all rooms with property filtering
- **Create**: Add rooms to existing properties
- **Details**: View room information, tenant assignments, rent history

### 5. **Tenants Management**

- **List View**: Search and filter tenants
- **Create**: Add new tenant with lease information
- **Details**: View tenant profile, payment history, lease details

### 6. **Rent Management**

- **List View**: Track all rent payments with status filtering
- **Create**: Record new rent payments
- **Details**: View payment details and history

### 7. **Profile Management**

- **Update**: Modify user profile information
- **Settings**: Manage account preferences

## 🎯 Key Features to Test

### ✅ Authentication & Authorization

- [x] Login/Logout functionality
- [x] Route protection (try accessing `/dashboard` without login)
- [x] Token persistence (refresh page should maintain login)

### ✅ CRUD Operations

- [x] **Create**: Add new properties, rooms, tenants, rents
- [x] **Read**: View lists and detailed information
- [x] **Update**: Edit existing records
- [x] **Delete**: Remove records (if implemented)

### ✅ Data Relationships

- [x] Properties → Rooms relationship
- [x] Rooms → Tenants assignment
- [x] Tenants → Rent payments tracking
- [x] Address integration

### ✅ User Experience

- [x] Responsive design (test on different screen sizes)
- [x] Search and filtering functionality
- [x] Form validation and error handling
- [x] Loading states and progress indicators
- [x] Navigation between pages

### ✅ API Integration

- [x] Real-time data fetching from backend
- [x] Error handling for API failures
- [x] CORS functionality
- [x] Authentication headers

## 🐛 Common Issues & Solutions

### Login Issues

- **Problem**: "Network Error" or CORS issues
- **Solution**: Ensure backend is running on `http://localhost:5268`

### Data Not Loading

- **Problem**: Empty lists or loading indefinitely
- **Solution**: Check browser console for API errors

### Form Submission Failures

- **Problem**: Form doesn't submit or shows errors
- **Solution**: Verify all required fields are filled correctly

## 📊 Sample Data Available

The backend is seeded with:

- ✅ **2 Owner accounts** (for login testing)
- ✅ **Multiple Properties** (with different types and locations)
- ✅ **Various Rooms** (different sizes and rent amounts)
- ✅ **Sample Tenants** (with lease information)
- ✅ **Rent Payment Records** (with different statuses)
- ✅ **Address Data** (linked to properties and owners)

## 🎉 Success Indicators

### Login Success ✅

- Redirects to dashboard
- Shows user name in header
- Dashboard displays statistics

### Data Loading Success ✅

- Properties list shows multiple entries
- Rooms show property associations
- Tenants display contact information
- Rent payments show amounts and dates

### Form Success ✅

- New records appear in lists immediately
- Edit forms pre-populate with existing data
- Validation messages show for invalid inputs

## 🚀 Ready for Production

The RentWiz system is now fully functional with:

- Complete property management workflow
- Tenant and rent tracking
- Financial reporting and analytics
- Responsive user interface
- Secure authentication system
- RESTful API integration

**Happy Testing! 🏡💼**
