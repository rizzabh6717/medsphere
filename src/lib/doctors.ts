export type Doctor = {
  id: number;
  name: string; // e.g., "Dr. Prakash Das"
  specialization: string;
};

export const DOCTORS: Doctor[] = [
  { id: 1, name: "Dr. Prakash Das", specialization: "Psychologist" },
  { id: 2, name: "Dr. Sarah Johnson", specialization: "Cardiologist" },
  { id: 3, name: "Dr. Rajesh Kumar", specialization: "Orthopedic" },
  { id: 4, name: "Dr. Priya Sharma", specialization: "Pediatrician" },
  { id: 5, name: "Dr. Amit Patel", specialization: "Dermatologist" },
  { id: 6, name: "Dr. Neha Gupta", specialization: "Neurologist" },
  { id: 7, name: "Dr. Vikram Singh", specialization: "Gastroenterologist" },
  { id: 8, name: "Dr. Anjali Desai", specialization: "General Physician" },
  { id: 9, name: "Dr. Rohit Mehta", specialization: "ENT Specialist" },
  { id: 10, name: "Dr. Kavita Rao", specialization: "Gynecologist" },
];

export const findDoctorByEmail = (email: string): Doctor | null => {
  try {
    const local = email.trim().toLowerCase().split("@")[0];
    // map "name" to first name from doctor name
    for (const d of DOCTORS) {
      const parts = d.name.replace(/^dr\.?\s*/i, "").split(/\s+/); // remove Dr. prefix
      const first = (parts[0] || "").toLowerCase();
      if (first === local) return d;
    }
    return null;
  } catch {
    return null;
  }
};
