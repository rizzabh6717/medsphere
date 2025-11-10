// Local Storage utility functions for managing app data

const currentEmail = (): string => {
  try {
    const fromSession = (sessionStorage.getItem('currentUserEmail') || '').toLowerCase();
    if (fromSession) return fromSession;
    return (localStorage.getItem('currentUserEmail') || '').toLowerCase();
  } catch { return ''; }
};
const nsKey = (base: string): string => {
  const email = currentEmail();
  return email ? `user:${email}:${base}` : base;
};

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
  // Optional extended patient details captured at booking time
  patientGender?: 'Male' | 'Female' | 'Other';
  patientWeightKg?: number;
  patientHeightCm?: number;
  lastAppointmentDate?: string; // ISO date
  registerDate?: string; // ISO date
  medicalConditions?: string[];
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
    const dataNS = localStorage.getItem(nsKey('appointments'));
    const nsList: Appointment[] = dataNS ? JSON.parse(dataNS) : [];
    const dataGlobal = localStorage.getItem('appointments');
    const globalList: Appointment[] = dataGlobal ? JSON.parse(dataGlobal) : [];
    if (!nsList.length) return globalList;
    if (!globalList.length) return nsList;
    const byId: Record<string, Appointment> = {};
    // Prefer global (doctor updates) to override patient's local copy for reflection
    [...nsList, ...globalList].forEach((a) => { byId[a.id] = a; });
    return Object.values(byId).map(a => ({ ...a, doctorId: String((a as any).doctorId || '') }));
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
    doctorId: String(appointment.doctorId || ''),
    id: `apt-${Date.now()}`,
    tokenNumber: Math.floor(Math.random() * 100) + 1,
    createdAt: new Date().toISOString(),
    accepted: false,
  };
  // Write to namespaced list
  const nsList = getAppointments();
  nsList.push(newAppointment);
  localStorage.setItem(nsKey('appointments'), JSON.stringify(nsList));
  // Also write to shared global list so doctors can see appointments regardless of patient email
  try {
    const globalRaw = localStorage.getItem('appointments');
    const globalList: Appointment[] = globalRaw ? JSON.parse(globalRaw) : [];
    globalList.push(newAppointment);
    localStorage.setItem('appointments', JSON.stringify(globalList));
  } catch {}
  // Dispatch event to notify listeners (doctor dashboard)
  window.dispatchEvent(new CustomEvent('appointments:updated'));
  return newAppointment;
};

export const updateAppointment = (id: string, updates: Partial<Appointment>): void => {
  const appointments = getAppointments();
  const index = appointments.findIndex(apt => apt.id === id);
  if (index !== -1) {
    appointments[index] = { ...appointments[index], ...updates };
    localStorage.setItem(nsKey('appointments'), JSON.stringify(appointments));
  }
  // Also update shared global list
  try {
    const globalRaw = localStorage.getItem('appointments');
    const globalList: Appointment[] = globalRaw ? JSON.parse(globalRaw) : [];
    const gi = globalList.findIndex(a => a.id === id);
    if (gi !== -1) {
      globalList[gi] = { ...globalList[gi], ...updates } as Appointment;
      localStorage.setItem('appointments', JSON.stringify(globalList));
    }
  } catch {}
  window.dispatchEvent(new CustomEvent('appointments:updated'));
};

export const deleteAppointment = (id: string): void => {
  const appointments = getAppointments();
  const filtered = appointments.filter(apt => apt.id !== id);
  localStorage.setItem(nsKey('appointments'), JSON.stringify(filtered));
  try {
    const globalRaw = localStorage.getItem('appointments');
    const globalList: Appointment[] = globalRaw ? JSON.parse(globalRaw) : [];
    const gfiltered = globalList.filter(apt => apt.id !== id);
    localStorage.setItem('appointments', JSON.stringify(gfiltered));
  } catch {}
  window.dispatchEvent(new CustomEvent('appointments:updated'));
};

export const clearAppointments = (): void => {
  localStorage.setItem(nsKey('appointments'), JSON.stringify([]));
  window.dispatchEvent(new CustomEvent('appointments:updated'));
};

// Family Members
export const getFamilyMembers = (): FamilyMember[] => {
  try {
    const dataNS = localStorage.getItem(nsKey('familyMembers'));
    if (dataNS) return JSON.parse(dataNS);
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
  localStorage.setItem(nsKey('familyMembers'), JSON.stringify(members));
  return newMember;
};

export const deleteFamilyMember = (id: string): void => {
  const members = getFamilyMembers();
  const filtered = members.filter(m => m.id !== id);
  localStorage.setItem(nsKey('familyMembers'), JSON.stringify(filtered));
};

// Notifications
export const getNotifications = (): Notification[] => {
  try {
    const dataNS = localStorage.getItem(nsKey('notifications'));
    if (dataNS) return JSON.parse(dataNS);
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
  localStorage.setItem(nsKey('notifications'), JSON.stringify(notifications));
};

export const markNotificationAsRead = (id: string): void => {
  const notifications = getNotifications();
  const index = notifications.findIndex(n => n.id === id);
  if (index !== -1) {
    notifications[index].read = true;
    localStorage.setItem(nsKey('notifications'), JSON.stringify(notifications));
  }
};

// User Profile
export const getUserProfile = (): UserProfile | null => {
  try {
    const dataNS = localStorage.getItem(nsKey('userProfile'));
    if (dataNS) return JSON.parse(dataNS);
    const data = localStorage.getItem('userProfile');
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Error reading user profile:', error);
    return null;
  }
};

export const saveUserProfile = (profile: UserProfile): void => {
  localStorage.setItem(nsKey('userProfile'), JSON.stringify(profile));
};

// Initialize default data if needed
export const initializeDefaultData = (): void => {
  // Only initialize if no data exists
  if (!localStorage.getItem(nsKey('userProfile'))) {
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

// ---------------- Doctor-side helpers ----------------
export interface PrescriptionItem {
  medicine: string;
  dosage: string;
  duration: string;
  notes?: string;
}

export interface Prescription {
  id: string;
  doctorId: string;
  patientPhone: string;
  patientName?: string; // store for easier reflection on patient side
  appointmentId?: string;
  createdAt: string;
  items: PrescriptionItem[];
  diagnosis?: string;
  instructions?: string;
  followUp?: string;
}

export const getPrescriptions = (): Prescription[] => {
  try {
    const dataNS = localStorage.getItem(nsKey('prescriptions'));
    const nsList: Prescription[] = dataNS ? JSON.parse(dataNS) : [];
    const dataGlobal = localStorage.getItem('prescriptions');
    const globalList: Prescription[] = dataGlobal ? JSON.parse(dataGlobal) : [];
    if (!nsList.length) return globalList;
    if (!globalList.length) return nsList;
    const byId: Record<string, Prescription> = {};
    [...globalList, ...nsList].forEach((p) => { byId[p.id] = p; });
    return Object.values(byId);
  } catch (error) {
    console.error('Error reading prescriptions:', error);
    return [];
  }
};

export const addPrescription = (p: Omit<Prescription, 'id' | 'createdAt'>): Prescription => {
  const nsRaw = localStorage.getItem(nsKey('prescriptions'));
  const nsList: Prescription[] = nsRaw ? JSON.parse(nsRaw) : [];
  const item: Prescription = { ...p, id: `rx-${Date.now()}`, createdAt: new Date().toISOString() };
  nsList.push(item);
  localStorage.setItem(nsKey('prescriptions'), JSON.stringify(nsList));
  // Also append to shared global list so the patient Records page can see it regardless of doctor session/email
  try {
    const globalRaw = localStorage.getItem('prescriptions');
    const globalList: Prescription[] = globalRaw ? JSON.parse(globalRaw) : [];
    globalList.push(item);
    localStorage.setItem('prescriptions', JSON.stringify(globalList));
  } catch {}
  window.dispatchEvent(new CustomEvent('prescriptions:updated'));
  return item;
};

// Alias for addPrescription to match the import in PrescriptionManagement
export const savePrescription = addPrescription;

// Follow-up related functions
export interface FollowUp {
  id: string;
  patientId: string;
  patientName: string;
  doctorId: string;
  doctorName: string;
  doctorSpecialty: string;
  date: string;
  time: string;
  notes?: string;
  status: "scheduled" | "completed" | "missed" | "rescheduled";
  createdAt: string;
  isReassigned?: boolean;
  originalDoctorId?: string;
}

export const getFollowUps = (): FollowUp[] => {
  try {
    const followUps = localStorage.getItem('followUps');
    return followUps ? JSON.parse(followUps) : [];
  } catch (error) {
    console.error('Error getting follow-ups:', error);
    return [];
  }
};

export const addFollowUp = (followUp: Omit<FollowUp, 'id' | 'createdAt'>): FollowUp => {
  const followUps = getFollowUps();
  const newFollowUp: FollowUp = {
    ...followUp,
    id: `followup_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    createdAt: new Date().toISOString()
  };
  
  followUps.push(newFollowUp);
  localStorage.setItem('followUps', JSON.stringify(followUps));
  window.dispatchEvent(new CustomEvent('followUps:updated'));
  return newFollowUp;
};

export const updateFollowUpStatus = (id: string, status: string): boolean => {
  try {
    const followUps = getFollowUps();
    const index = followUps.findIndex(f => f.id === id);
    
    if (index !== -1) {
      followUps[index].status = status as FollowUp['status'];
      localStorage.setItem('followUps', JSON.stringify(followUps));
      window.dispatchEvent(new CustomEvent('followUps:updated'));
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error updating follow-up status:', error);
    return false;
  }
};

export const getFollowUpsByPatient = (patientId: string): FollowUp[] => {
  return getFollowUps().filter(f => f.patientId === patientId);
};

export const getFollowUpsByDoctor = (doctorId: string): FollowUp[] => {
  return getFollowUps().filter(f => f.doctorId === doctorId);
};

export const getUpcomingFollowUps = (userId: string, userRole: 'patient' | 'doctor'): FollowUp[] => {
  const now = new Date();
  const followUps = userRole === 'patient' 
    ? getFollowUpsByPatient(userId)
    : getFollowUpsByDoctor(userId);
    
  return followUps.filter(f => {
    const appointmentDate = new Date(`${f.date.split('T')[0]}T${f.time}:00`);
    return appointmentDate > now && f.status === 'scheduled';
  }).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
};

export interface ChatMessage {
  id: string;
  sender: 'doctor' | 'patient';
  text: string;
  timestamp: string;
}

export interface ChatThread {
  id: string; // thread-{doctorId}-{patientPhone}
  doctorId: string;
  patientPhone: string;
  messages: ChatMessage[];
}

export const getChats = (): ChatThread[] => {
  try {
    const dataNS = localStorage.getItem(nsKey('chats'));
    if (dataNS) return JSON.parse(dataNS);
    const data = localStorage.getItem('chats');
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error reading chats:', error);
    return [];
  }
};

export const ensureChatThread = (doctorId: string, patientPhone: string): ChatThread => {
  const threads = getChats();
  const id = `thread-${doctorId}-${patientPhone}`;
  let thread = threads.find(t => t.id === id);
  if (!thread) {
    thread = { id, doctorId, patientPhone, messages: [] };
    threads.push(thread);
    localStorage.setItem(nsKey('chats'), JSON.stringify(threads));
    try {
      const globalRaw = localStorage.getItem('chats');
      const globalThreads: ChatThread[] = globalRaw ? JSON.parse(globalRaw) : [];
      if (!globalThreads.find(t=>t.id===id)) {
        globalThreads.push(thread);
        localStorage.setItem('chats', JSON.stringify(globalThreads));
      }
    } catch {}
  }
  return thread;
};

// --------- Clear helpers (for demo/testing) ---------
export const clearAppointmentsAll = (): void => {
  localStorage.removeItem(nsKey('appointments'));
  localStorage.removeItem('appointments');
  window.dispatchEvent(new CustomEvent('appointments:updated'));
};
export const clearChatsAll = (): void => {
  localStorage.removeItem(nsKey('chats'));
  localStorage.removeItem('chats');
  window.dispatchEvent(new CustomEvent('chats:updated'));
};
export const clearPrescriptionsAll = (): void => {
  localStorage.removeItem(nsKey('prescriptions'));
  localStorage.removeItem('prescriptions');
  window.dispatchEvent(new CustomEvent('prescriptions:updated'));
};
export const clearFollowUpsAll = (): void => {
  localStorage.removeItem('followUps');
  window.dispatchEvent(new CustomEvent('followUps:updated'));
};
export const clearAllMedicalData = (): void => {
  clearAppointmentsAll();
  clearChatsAll();
  clearPrescriptionsAll();
  clearFollowUpsAll();
};
