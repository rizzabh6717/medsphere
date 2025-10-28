// Local Storage utility functions for managing app data

export interface Appointment {
  id: string;
  doctorId: string;
  doctorName: string;
  doctorSpecialty: string;
  date: string;
  time: string;
  patientName: string;
  patientDob: string;
  patientPhone: string;
  symptoms: string;
  status: 'upcoming' | 'completed' | 'cancelled';
  paid: boolean;
  tokenNumber: number;
  createdAt: string;
  accepted?: boolean; // whether doctor accepted the appointment
}

export interface FamilyMember {
  id: string;
  name: string;
  relationship: string;
  age: number;
  phone: string;
}

export interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
  icon: string;
  createdAt: string;
}

export interface UserProfile {
  name: string;
  email: string;
  phone: string;
  address: string;
  dob: string;
  bloodGroup: string;
  gender: string;
}

// Appointments
export const getAppointments = (): Appointment[] => {
  try {
    const data = localStorage.getItem('appointments');
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error reading appointments:', error);
    return [];
  }
};

export const saveAppointment = (appointment: Omit<Appointment, 'id' | 'createdAt' | 'tokenNumber'>): Appointment => {
  const appointments = getAppointments();
  // Prevent duplicate (same doctorId, date, time)
  const duplicate = appointments.some(
    (apt) => apt.doctorId === appointment.doctorId && apt.date === appointment.date && apt.time === appointment.time
  );
  if (duplicate) {
    throw new Error('Time slot already booked for this doctor.');
  }
  const newAppointment: Appointment = {
    ...appointment,
    id: `apt-${Date.now()}`,
    tokenNumber: Math.floor(Math.random() * 100) + 1,
    createdAt: new Date().toISOString(),
    accepted: false,
  };
  appointments.push(newAppointment);
  localStorage.setItem('appointments', JSON.stringify(appointments));
  // Dispatch event to notify listeners (doctor dashboard)
  window.dispatchEvent(new CustomEvent('appointments:updated'));
  return newAppointment;
};

export const updateAppointment = (id: string, updates: Partial<Appointment>): void => {
  const appointments = getAppointments();
  const index = appointments.findIndex(apt => apt.id === id);
  if (index !== -1) {
    appointments[index] = { ...appointments[index], ...updates };
    localStorage.setItem('appointments', JSON.stringify(appointments));
    window.dispatchEvent(new CustomEvent('appointments:updated'));
  }
};

export const deleteAppointment = (id: string): void => {
  const appointments = getAppointments();
  const filtered = appointments.filter(apt => apt.id !== id);
  localStorage.setItem('appointments', JSON.stringify(filtered));
  window.dispatchEvent(new CustomEvent('appointments:updated'));
};

export const clearAppointments = (): void => {
  localStorage.setItem('appointments', JSON.stringify([]));
  window.dispatchEvent(new CustomEvent('appointments:updated'));
};

// Family Members
export const getFamilyMembers = (): FamilyMember[] => {
  try {
    const data = localStorage.getItem('familyMembers');
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error reading family members:', error);
    return [];
  }
};

export const saveFamilyMember = (member: Omit<FamilyMember, 'id'>): FamilyMember => {
  const members = getFamilyMembers();
  const newMember: FamilyMember = {
    ...member,
    id: `fam-${Date.now()}`,
  };
  members.push(newMember);
  localStorage.setItem('familyMembers', JSON.stringify(members));
  return newMember;
};

export const deleteFamilyMember = (id: string): void => {
  const members = getFamilyMembers();
  const filtered = members.filter(m => m.id !== id);
  localStorage.setItem('familyMembers', JSON.stringify(filtered));
};

// Notifications
export const getNotifications = (): Notification[] => {
  try {
    const data = localStorage.getItem('notifications');
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error reading notifications:', error);
    return [];
  }
};

export const addNotification = (notification: Omit<Notification, 'id' | 'createdAt'>): void => {
  const notifications = getNotifications();
  const newNotification: Notification = {
    ...notification,
    id: `notif-${Date.now()}`,
    createdAt: new Date().toISOString(),
  };
  notifications.unshift(newNotification); // Add to beginning
  localStorage.setItem('notifications', JSON.stringify(notifications));
};

export const markNotificationAsRead = (id: string): void => {
  const notifications = getNotifications();
  const index = notifications.findIndex(n => n.id === id);
  if (index !== -1) {
    notifications[index].read = true;
    localStorage.setItem('notifications', JSON.stringify(notifications));
  }
};

// User Profile
export const getUserProfile = (): UserProfile | null => {
  try {
    const data = localStorage.getItem('userProfile');
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Error reading user profile:', error);
    return null;
  }
};

export const saveUserProfile = (profile: UserProfile): void => {
  localStorage.setItem('userProfile', JSON.stringify(profile));
};

// Initialize default data if needed
export const initializeDefaultData = (): void => {
  // Only initialize if no data exists
  if (!localStorage.getItem('userProfile')) {
    saveUserProfile({
      name: 'Priya Sharma',
      email: 'priya.sharma@example.com',
      phone: '+91 98765 43210',
      address: 'Dombivali, Mumbai',
      dob: '1990-05-15',
      bloodGroup: 'B+',
      gender: 'Female',
    });
  }
};
