import { addFollowUp } from "./storage";

// Sample follow-up data for demonstration
export const createSampleFollowUps = () => {
  const now = new Date();
  
  // Sample follow-ups with different statuses and times
  const sampleFollowUps = [
    {
      patientId: "+91-9876543210",
      patientName: "John Doe",
      doctorId: "1",
      doctorName: "Dr. Prakash Das",
      doctorSpecialty: "Psychologist",
      date: new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days from now
      time: "10:00",
      notes: "Follow-up on therapy progress and medication adjustment",
      status: "scheduled" as const
    },
    {
      patientId: "+91-9876543210", 
      patientName: "John Doe",
      doctorId: "2",
      doctorName: "Dr. Sarah Johnson",
      doctorSpecialty: "Cardiologist",
      date: new Date(now.getTime() + 12 * 60 * 60 * 1000).toISOString(), // 12 hours from now (due soon)
      time: "14:30",
      notes: "Check blood pressure and heart rate after medication change",
      status: "scheduled" as const
    },
    {
      patientId: "+91-9876543210",
      patientName: "John Doe", 
      doctorId: "3",
      doctorName: "Dr. Rajesh Kumar",
      doctorSpecialty: "Orthopedic",
      date: new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString(), // 1 day ago (overdue)
      time: "09:00",
      notes: "Post-surgery follow-up for knee replacement",
      status: "scheduled" as const
    },
    {
      patientId: "+91-9876543210",
      patientName: "John Doe",
      doctorId: "4", 
      doctorName: "Dr. Priya Sharma",
      doctorSpecialty: "Pediatrician",
      date: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 1 week ago
      time: "11:00",
      notes: "Vaccination follow-up completed successfully",
      status: "completed" as const
    },
    {
      patientId: "+91-8765432109", // Different patient
      patientName: "Jane Smith",
      doctorId: "1",
      doctorName: "Dr. Prakash Das", 
      doctorSpecialty: "Psychologist",
      date: new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days from now
      time: "15:00",
      notes: "Monthly mental health check-up",
      status: "scheduled" as const
    },
    {
      patientId: "+91-7654321098", // Another different patient
      patientName: "Bob Johnson",
      doctorId: "1", 
      doctorName: "Dr. Prakash Das",
      doctorSpecialty: "Psychologist",
      date: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago (missed)
      time: "16:00",
      notes: "Follow-up on anxiety treatment",
      status: "missed" as const
    },
    {
      patientId: "+91-6543210987",
      patientName: "Alice Brown",
      doctorId: "2",
      doctorName: "Dr. Sarah Johnson",
      doctorSpecialty: "Cardiologist", 
      date: new Date(now.getTime() + 1 * 24 * 60 * 60 * 1000).toISOString(), // Tomorrow
      time: "10:30",
      notes: "Review cardiac test results and adjust treatment plan",
      status: "scheduled" as const
    },
    {
      patientId: "+91-5432109876", 
      patientName: "Charlie Wilson",
      doctorId: "5",
      doctorName: "Dr. Amit Patel",
      doctorSpecialty: "Dermatologist",
      date: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days from now
      time: "13:15",
      notes: "Check skin condition improvement after treatment",
      status: "scheduled" as const,
      isReassigned: true,
      originalDoctorId: "6"
    }
  ];

  // Add sample follow-ups to storage
  sampleFollowUps.forEach(followUp => {
    try {
      addFollowUp(followUp);
    } catch (error) {
      console.log("Sample follow-up already exists or error adding:", error);
    }
  });

  console.log("Sample follow-ups created successfully!");
};

// Function to clear all follow-ups (for testing)
export const clearAllFollowUps = () => {
  localStorage.removeItem('followUps');
  console.log("All follow-ups cleared!");
};