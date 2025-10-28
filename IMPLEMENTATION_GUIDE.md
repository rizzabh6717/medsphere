# Implementation Guide: Patient-Doctor Sync & Routing Updates

## Overview
This guide outlines the changes needed to implement real-time appointment syncing between patients and doctors, update routing structure, and remove mock data from doctor dashboard.

## Feature 1: Shared Appointment System

### Storage Updates
The current `storage.ts` already supports shared appointments. All appointments are stored in a single `appointments` array in localStorage, accessible to both patients and doctors.

**Key Points:**
- Appointments include `doctorId` and patient information
- When a patient books, it's immediately in localStorage
- Doctor dashboard can filter appointments by `doctorId`
- Status tracking: 'upcoming', 'completed', 'cancelled'

### Doctor Dashboard Real Data
Replace mock data with:
```typescript
// Get all appointments for this doctor
const doctorId = 'dr-stranger-001'; // Or from auth context
const allAppointments = getAppointments();
const doctorAppointments = allAppointments.filter(apt => apt.doctorId === doctorId);

// Today's appointments
const today = new Date().toDateString();
const todayAppointments = doctorAppointments.filter(apt => {
  return new Date(apt.date).toDateString() === today && apt.status === 'upcoming';
});

// Statistics
const totalPatients = new Set(doctorAppointments.map(apt => apt.patientPhone)).size;
const totalAppointments = doctorAppointments.length;
const completedTreatments = doctorAppointments.filter(apt => apt.status === 'completed').length;

// Appointment requests (upcoming, not yet accepted)
const requests = doctorAppointments.filter(apt => apt.status === 'upcoming');
```

## Feature 2: Routing Structure Updates

### New Route Structure
```
/ → Landing
/user → Login page (renamed from /login)
/user/patient/* → All patient routes
/user/doctor/* → All doctor routes
```

### Changes Needed:

#### 1. App.tsx Routes
```tsx
<Route path="/user" element={<Login />} />
<Route path="/user/patient/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
<Route path="/user/patient/appointments" element={<ProtectedRoute><Appointments /></ProtectedRoute>} />
// ... all other patient routes with /user/patient prefix

<Route path="/user/doctor/dashboard" element={<ProtectedRoute><DoctorDashboard /></ProtectedRoute>} />
// ... all other doctor routes with /user/doctor prefix
```

#### 2. Login.tsx Updates
- Route: `/login` → `/user`
- On role selection, don't navigate immediately
- After OTP verification, redirect to `/user/patient/dashboard` or `/user/doctor/dashboard`

#### 3. Navigation Updates
Update all `navigate()` calls throughout:
- `/patient/*` → `/user/patient/*`
- `/doctor/*` → `/user/doctor/*`
- `/login` → `/user`

**Files to update:**
- NavigationHeader.tsx
- Dashboard.tsx
- DoctorDetails.tsx
- BookAppointment.tsx
- Appointments.tsx
- All other pages with navigation

## Feature 3: Reschedule with Modal

### Create Reschedule Modal Component

```typescript
// src/components/RescheduleModal.tsx
interface RescheduleModalProps {
  appointment: Appointment;
  open: boolean;
  onClose: () => void;
  onReschedule: (updates: Partial<Appointment>) => void;
}

// Features:
// - Pre-filled with current appointment data
// - Date picker
// - Time slot selection
// - Reason/notes field
// - Cancel and Confirm buttons
```

### Update Reschedule Page
- Add modal instead of full-page form
- Open modal when clicking "Reschedule" button
- On confirm, update appointment in localStorage
- Sync across patient and doctor views automatically (same storage)

### Button in Appointments Page
Already exists, just needs to work with modal:
```tsx
<Button
  onClick={() => setRescheduleModal({ open: true, appointment })}
  className="bg-[#5B68EE] hover:bg-[#4A56DD] text-white"
>
  <RefreshCw className="w-4 h-4 mr-1" />
  Reschedule
</Button>
```

## Implementation Steps

### Step 1: Update Routes (Priority: High)
1. Change `/login` to `/user` in App.tsx
2. Add `/user/patient/*` prefix to all patient routes
3. Add `/user/doctor/*` prefix to all doctor routes
4. Update Landing page navigation links

### Step 2: Update Navigation Calls (Priority: High)
Use find-and-replace:
- `navigate("/patient/` → `navigate("/user/patient/`
- `navigate("/doctor/` → `navigate("/user/doctor/`
- `navigate("/login")` → `navigate("/user")`
- `to="/patient/` → `to="/user/patient/`
- `href="/patient/` → `href="/user/patient/`

### Step 3: Update Doctor Dashboard (Priority: High)
1. Remove mock data constants
2. Add function to get doctor appointments from localStorage
3. Calculate real statistics
4. Display real today's appointments
5. Show real appointment requests
6. Add next patient from actual data

### Step 4: Create Reschedule Modal (Priority: Medium)
1. Create RescheduleModal component
2. Add to Appointments page
3. Implement form with pre-filled data
4. Connect to updateAppointment from storage

### Step 5: Testing (Priority: High)
1. Test patient booking flow
2. Verify appointment appears on doctor dashboard immediately
3. Test reschedule functionality
4. Verify both views update
5. Test all navigation paths

## Doctor ID Management

Currently, the system needs a way to identify which doctor the appointments belong to. Options:

### Option 1: Use Doctor Profile (Recommended)
Store doctor info in localStorage when doctor logs in:
```typescript
localStorage.setItem('doctorProfile', JSON.stringify({
  id: 'dr-stranger-001',
  name: 'Dr. Stranger',
  specialty: 'Dentist'
}));
```

### Option 2: Hardcode for Demo
Use a fixed doctor ID for the demo: `'dr-stranger-001'`

### Option 3: From Authentication
In a real app, this would come from authentication context.

## Files That Need Updates

### Critical:
- `src/App.tsx` - Route structure
- `src/pages/Login.tsx` - Route and navigation
- `src/pages/OTP.tsx` - Redirect logic
- `src/pages/DoctorDashboard.tsx` - Remove mock data, use real data
- `src/components/NavigationHeader.tsx` - Update links

### Important:
- All patient pages (Dashboard, Appointments, BookAppointment, etc.)
- All navigation calls throughout the app
- Landing page links

### New Files:
- `src/components/RescheduleModal.tsx` - Modal component

## Testing Checklist

- [ ] Patient can book appointment
- [ ] Appointment appears in localStorage
- [ ] Doctor dashboard shows the appointment
- [ ] Statistics update correctly
- [ ] Reschedule button opens modal
- [ ] Reschedule updates both views
- [ ] All routes work with /user prefix
- [ ] Role-based routing works correctly
- [ ] No broken navigation links

## Notes

- The current storage system already supports syncing—all appointments share one localStorage key
- Real-time updates happen through React component re-renders reading from localStorage
- For true real-time in production, you'd use WebSockets or polling
- Doctor ID needs to be managed consistently across the app
