# Routing Structure & Footer Implementation

## Overview
The application now has a role-based routing structure with separate routes for patients and doctors, plus a reusable Footer component across all pages.

## Route Structure

### Public Routes
- `/` - Landing page
- `/login` - Login page (with Doctor/Patient toggle)
- `/signup` - Signup page
- `/otp` - OTP verification page

### Patient Routes (prefix: `/patient`)
All patient-related pages now use the `/patient/` prefix:

- `/patient/dashboard` - Patient dashboard with doctor listings
- `/patient/doctor/:id` - Doctor details page
- `/patient/book-appointment` - Appointment booking flow
- `/patient/patient-details` - Patient details form
- `/patient/appointment-scheduled` - Appointment confirmation
- `/patient/appointments` - View all appointments
- `/patient/appointment/:id` - View specific appointment
- `/patient/notifications` - Notifications page
- `/patient/reschedule/:id` - Reschedule appointment
- `/patient/feedback/:id` - Provide feedback
- `/patient/friends-family` - Manage family members
- `/patient/co-patient` - Co-patient groups
- `/patient/support` - Customer support
- `/patient/queue` - Queue tracking
- `/patient/profile` - User profile
- `/patient/records` - Medical records
- `/patient/chat/:doctorId` - Chat with doctor

### Doctor Routes (prefix: `/doctor`)
- `/doctor/dashboard` - Doctor dashboard with comprehensive features

## Login Flow

### Role Selection
The login page now includes a toggle button to select between "Patient" and "Doctor" roles:

```
┌─────────────────┐
│  [Patient]      │  (selected - primary color)
│  [Doctor]       │  (unselected - muted)
└─────────────────┘
```

The selected role is stored in localStorage as `userRole`.

### OTP Verification & Redirect
After OTP verification:
- If `userRole === 'doctor'` → redirects to `/doctor/dashboard`
- If `userRole === 'patient'` → redirects to `/patient/dashboard`

## Footer Component

### Location
`src/components/Footer.tsx`

### Features
The Footer component includes:
- **Brand Section**: MedSphere logo and tagline
- **Quick Links**: Home, Services, Departments, Login
- **Support**: Help Center, FAQs, Privacy Policy, Terms & Conditions
- **Contact**: Phone, Email, Address
- **Bottom Bar**: Copyright, Privacy/Terms/Cookies links

### Usage
Import and add to any page:
```typescript
import Footer from "@/components/Footer";

// At the end of your component's return
<Footer />
```

### Pages with Footer
Footer has been added to:
- ✅ Landing page
- ✅ Login page
- ✅ Patient Dashboard
- ✅ Appointments page
- ✅ Profile page
- Additional pages can be updated as needed

## Navigation Updates

### NavigationHeader Component
Updated to use `/patient/*` routes for all patient-related navigation:
- Logo click → `/patient/dashboard`
- Notifications icon → `/patient/notifications`
- Menu items:
  - My Appointments → `/patient/appointments`
  - Friends & Family → `/patient/friends-family`
  - Co-Patient Groups → `/patient/co-patient`
  - Queue Tracking → `/patient/queue`
  - Customer Support → `/patient/support`
  - Give Feedback → `/patient/feedback/new`

### Updated Components
All navigation calls have been updated in:
- Dashboard.tsx
- Appointments.tsx
- DoctorDetails.tsx
- BookAppointment.tsx
- AppointmentScheduled.tsx
- Reschedule.tsx
- Feedback.tsx
- Profile.tsx
- NavigationHeader.tsx
- OTP.tsx

## Testing the Routes

### As a Patient:
1. Go to `/login`
2. Select "Patient" toggle
3. Complete login with OTP
4. You'll be redirected to `/patient/dashboard`
5. All navigation from this point uses `/patient/*` routes

### As a Doctor:
1. Go to `/login`
2. Select "Doctor" toggle
3. Complete login with OTP
4. You'll be redirected to `/doctor/dashboard`
5. Doctor-specific interface with sidebar navigation

## URL Examples

**Before:**
- `localhost:3000/dashboard`
- `localhost:3000/appointments`
- `localhost:3000/profile`

**After:**
- `localhost:3000/patient/dashboard`
- `localhost:3000/patient/appointments`
- `localhost:3000/patient/profile`

**Doctor:**
- `localhost:3000/doctor/dashboard`

## Benefits

1. **Clear Separation**: Patient and doctor routes are clearly separated
2. **Scalability**: Easy to add more role-specific features
3. **Security**: Can implement role-based access control per route prefix
4. **Professional URLs**: Clean, organized URL structure
5. **Consistent Footer**: Unified branding and navigation across all pages

## Future Enhancements

### Potential additions:
- Admin routes (`/admin/*`)
- Pharmacy routes (`/pharmacy/*`)
- Lab routes (`/lab/*`)
- Role-based route guards in ProtectedRoute component
- Dynamic footer based on user role
