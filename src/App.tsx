import { useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { initializeDefaultData } from "@/lib/storage";
import ProtectedRoute from "@/components/ProtectedRoute";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import OTP from "./pages/OTP";
import NotFound from "./pages/NotFound";

// Patient pages
import Dashboard from "./pages/Dashboard";
import DoctorDetails from "./pages/DoctorDetails";
import BookAppointment from "./pages/BookAppointment";
import PatientDetails from "./pages/PatientDetails";
import AppointmentScheduled from "./pages/AppointmentScheduled";
import Chat from "./pages/Chat";
import Appointments from "./pages/Appointments";
import Notifications from "./pages/Notifications";
import Reschedule from "./pages/Reschedule";
import Feedback from "./pages/Feedback";
import FriendsFamily from "./pages/FriendsFamily";
import CoPatient from "./pages/CoPatient";
import Support from "./pages/Support";
import QueueTracking from "./pages/QueueTracking";
import Profile from "./pages/Profile";
import Records from "./pages/Records";

// Doctor pages
import DoctorDashboard from "./pages/DoctorDashboard";
import BodyView from "./pages/BodyView";
import DoctorPatientRecord from "./pages/DoctorPatientRecord";
import DoctorChat from "./pages/DoctorChat";
import DoctorMessages from "./pages/DoctorMessages";

// Payments
import Payment from "./pages/Payment";
import PrintPrescription from "./pages/PrintPrescription";
import PrescriptionManagement from "./pages/PrescriptionManagement";
import FollowUpDashboard from "./pages/FollowUpDashboard";

const queryClient = new QueryClient();

const App = () => {
  useEffect(() => {
    initializeDefaultData();
  }, []);

  return (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          {/* Auth */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/otp" element={<OTP />} />

          {/* Patient Routes */}
          <Route path="/patient" element={<Navigate to="/patient/dashboard" replace />} />
          <Route path="/patient/dashboard" element={<ProtectedRoute roles={['patient']}><Dashboard /></ProtectedRoute>} />
          <Route path="/patient/doctor/:id" element={<ProtectedRoute roles={['patient']}><DoctorDetails /></ProtectedRoute>} />
          <Route path="/patient/book-appointment" element={<ProtectedRoute roles={['patient']}><BookAppointment /></ProtectedRoute>} />
          <Route path="/patient/patient-details" element={<ProtectedRoute roles={['patient']}><PatientDetails /></ProtectedRoute>} />
          <Route path="/patient/appointment-scheduled" element={<ProtectedRoute roles={['patient']}><AppointmentScheduled /></ProtectedRoute>} />
          <Route path="/patient/chat/:doctorId" element={<ProtectedRoute roles={['patient']}><Chat /></ProtectedRoute>} />
          <Route path="/patient/appointments" element={<ProtectedRoute roles={['patient']}><Appointments /></ProtectedRoute>} />
          <Route path="/patient/appointment/:id" element={<ProtectedRoute roles={['patient']}><Appointments /></ProtectedRoute>} />
          <Route path="/patient/notifications" element={<ProtectedRoute roles={['patient']}><Notifications /></ProtectedRoute>} />
          <Route path="/patient/reschedule/:id" element={<ProtectedRoute roles={['patient']}><Reschedule /></ProtectedRoute>} />
          <Route path="/patient/feedback/:id" element={<ProtectedRoute roles={['patient']}><Feedback /></ProtectedRoute>} />
          <Route path="/patient/friends-family" element={<ProtectedRoute roles={['patient']}><FriendsFamily /></ProtectedRoute>} />
          <Route path="/patient/co-patient" element={<ProtectedRoute roles={['patient']}><CoPatient /></ProtectedRoute>} />
          <Route path="/patient/support" element={<ProtectedRoute roles={['patient']}><Support /></ProtectedRoute>} />
          <Route path="/patient/queue" element={<ProtectedRoute roles={['patient']}><QueueTracking /></ProtectedRoute>} />
          <Route path="/patient/profile" element={<ProtectedRoute roles={['patient']}><Profile /></ProtectedRoute>} />
          <Route path="/patient/records" element={<ProtectedRoute roles={['patient']}><Records /></ProtectedRoute>} />
          <Route path="/patient/print-prescription/:id" element={<ProtectedRoute roles={['patient']}><PrintPrescription /></ProtectedRoute>} />
          <Route path="/patient/payment/:id" element={<ProtectedRoute roles={['patient']}><Payment /></ProtectedRoute>} />
          <Route path="/patient/followups" element={<ProtectedRoute roles={['patient']}><FollowUpDashboard /></ProtectedRoute>} />

          {/* Doctor Routes */}
          <Route path="/doctor" element={<Navigate to="/doctor/dashboard" replace />} />
          <Route path="/doctor/dashboard" element={<ProtectedRoute roles={['doctor']}><DoctorDashboard /></ProtectedRoute>} />
          <Route path="/doctor/body-view" element={<ProtectedRoute roles={['doctor']}><BodyView /></ProtectedRoute>} />
          <Route path="/doctor/patient/:id" element={<ProtectedRoute roles={['doctor']}><DoctorPatientRecord /></ProtectedRoute>} />
          <Route path="/doctor/chat/:patientId" element={<ProtectedRoute roles={['doctor']}><DoctorChat /></ProtectedRoute>} />
          <Route path="/doctor/messages" element={<ProtectedRoute roles={['doctor']}><DoctorMessages /></ProtectedRoute>} />
          <Route path="/doctor/messages/:patientId" element={<ProtectedRoute roles={['doctor']}><DoctorMessages /></ProtectedRoute>} />
          <Route path="/doctor/prescription/:appointmentId" element={<ProtectedRoute roles={['doctor']}><PrescriptionManagement /></ProtectedRoute>} />
          <Route path="/doctor/print-prescription/:id" element={<ProtectedRoute roles={['doctor']}><PrintPrescription /></ProtectedRoute>} />
          <Route path="/doctor/followups" element={<ProtectedRoute roles={['doctor']}><FollowUpDashboard /></ProtectedRoute>} />

          {/* Legacy redirects for backwards compatibility */}
          <Route path="/user" element={<Navigate to="/login" replace />} />
          <Route path="/user/patient" element={<Navigate to="/login" replace />} />
          <Route path="/user/doctor" element={<Navigate to="/login" replace />} />
          <Route path="/user/patient/*" element={<Navigate to="/login" replace />} />
          <Route path="/user/doctor/*" element={<Navigate to="/login" replace />} />

          {/* Catch-all */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
  );
};

export default App;
