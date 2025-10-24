# LocalStorage Implementation Guide

## Overview
The MedSphere Connect app now uses browser localStorage to persist data across sessions. All appointments, notifications, user profile, and family members are stored locally on the user's device.

## Features Implemented

### 1. **Appointments Management**
- ✅ Save new appointments when booked
- ✅ Display all appointments in "My Appointments" page
- ✅ Categorize by status: Upcoming, Completed, Cancelled
- ✅ Persist across browser refreshes
- ✅ Unique IDs and token numbers for each appointment

**Files Modified:**
- `src/lib/storage.ts` - Core storage utilities
- `src/pages/BookAppointment.tsx` - Saves appointments on booking
- `src/pages/Appointments.tsx` - Reads and displays from localStorage

**How it works:**
```typescript
// When booking an appointment
const appointment = saveAppointment({
  doctorId, doctorName, doctorSpecialty,
  date, time, patientName, patientDob, 
  patientPhone, symptoms,
  status: 'upcoming',
  paid: false
});
// Automatically adds: id, tokenNumber, createdAt

// Reading appointments
const allAppointments = getAppointments();
const upcoming = allAppointments.filter(apt => apt.status === 'upcoming');
```

### 2. **Notifications System**
- ✅ Automatic notification when appointment is booked
- ✅ Mark notifications as read/unread
- ✅ Display notification count
- ✅ Timestamp for each notification

**Files Modified:**
- `src/pages/BookAppointment.tsx` - Creates notification on booking
- `src/pages/Notifications.tsx` - Displays and manages notifications

**How it works:**
```typescript
// Adding a notification
addNotification({
  type: 'appointment',
  title: 'Appointment Confirmed',
  message: 'Your appointment with Dr. Das is confirmed...',
  time: 'Just now',
  read: false,
  icon: 'Calendar'
});

// Reading notifications
const notifications = getNotifications();

// Marking as read
markNotificationAsRead(notificationId);
```

### 3. **User Profile**
- ✅ Store and retrieve user information
- ✅ Edit profile capability
- ✅ Dynamic stats (appointment count, family members)
- ✅ Display user name in Dashboard

**Files Modified:**
- `src/pages/Profile.tsx` - Profile management
- `src/pages/Dashboard.tsx` - Display user name
- `src/App.tsx` - Initialize default profile

**How it works:**
```typescript
// Get user profile
const profile = getUserProfile();

// Save/update profile
saveUserProfile({
  name, email, phone, address,
  dob, bloodGroup, gender
});
```

### 4. **Friends & Family Management**
- ✅ Add family members/care seekers
- ✅ Delete family members
- ✅ Persist family member data
- ✅ Use in quick appointment booking

**Files Modified:**
- `src/pages/FriendsFamily.tsx` - Family member CRUD operations

**How it works:**
```typescript
// Get all family members
const members = getFamilyMembers();

// Add new member
const newMember = saveFamilyMember({
  name, relationship, age, phone
});

// Delete member
deleteFamilyMember(memberId);
```

## Storage Keys Used

The following keys are used in localStorage:

- `appointments` - Array of appointment objects
- `familyMembers` - Array of family member objects
- `notifications` - Array of notification objects
- `userProfile` - Single user profile object

## Data Structures

### Appointment
```typescript
{
  id: string;
  doctorId: string;
  doctorName: string;
  doctorSpecialty: string;
  date: string; // ISO format
  time: string; // "10:00 AM"
  patientName: string;
  patientDob: string;
  patientPhone: string;
  symptoms: string;
  status: 'upcoming' | 'completed' | 'cancelled';
  paid: boolean;
  tokenNumber: number;
  createdAt: string; // ISO format
}
```

### Family Member
```typescript
{
  id: string;
  name: string;
  relationship: string;
  age: number;
  phone: string;
}
```

### Notification
```typescript
{
  id: string;
  type: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
  icon: string;
  createdAt: string; // ISO format
}
```

### User Profile
```typescript
{
  name: string;
  email: string;
  phone: string;
  address: string;
  dob: string;
  bloodGroup: string;
  gender: string;
}
```

## Testing the Implementation

1. **Book an Appointment**
   - Go to Dashboard
   - Click "Book Appointment" on any doctor
   - Fill in all details and book
   - Check "My Appointments" to see it saved
   - Refresh the page - data persists!

2. **Check Notifications**
   - After booking, go to Notifications page
   - You should see "Appointment Confirmed"
   - Click to mark as read

3. **Add Family Members**
   - Go to Friends & Family
   - Add a new care seeker
   - Refresh page - member still there

4. **Edit Profile**
   - Go to Profile
   - Click "Edit Profile"
   - Make changes and save
   - Check Dashboard to see updated name

## Clearing Data

To reset all data during development:
```javascript
// Open browser console and run:
localStorage.clear();
// Then refresh the page
```

Or selectively:
```javascript
localStorage.removeItem('appointments');
localStorage.removeItem('notifications');
localStorage.removeItem('familyMembers');
localStorage.removeItem('userProfile');
```

## Future Enhancements

Potential improvements:
- Add data export/import functionality
- Implement data encryption for sensitive information
- Add data backup to cloud (when backend is added)
- Implement data migration for schema changes
- Add data validation on retrieval
- Implement storage quota management
