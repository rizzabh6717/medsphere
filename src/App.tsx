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
import Dashboard from "./pages/Dashboard";
import DoctorDashboard from "./pages/DoctorDashboard";
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
import BodyView from "./pages/BodyView";
import NotFound from "./pages/NotFound";

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
          {/* Login + OTP */}
          <Route path="/login" element={<Navigate to="/user" replace />} />
          <Route path="/user" element={<Login />} />
          <Route path="/user/patient" element={<Login />} />
          <Route path="/user/doctor" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/otp" element={<OTP />} />
          
          {/* Patient Routes */}
          <Route path="/user/patient/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/user/patient/doctor/:id" element={<ProtectedRoute><DoctorDetails /></ProtectedRoute>} />
          <Route path="/user/patient/book-appointment" element={<ProtectedRoute><BookAppointment /></ProtectedRoute>} />
          <Route path="/user/patient/patient-details" element={<ProtectedRoute><PatientDetails /></ProtectedRoute>} />
          <Route path="/user/patient/appointment-scheduled" element={<ProtectedRoute><AppointmentScheduled /></ProtectedRoute>} />
          <Route path="/user/patient/chat/:doctorId" element={<ProtectedRoute><Chat /></ProtectedRoute>} />
          <Route path="/user/patient/appointments" element={<ProtectedRoute><Appointments /></ProtectedRoute>} />
          <Route path="/user/patient/appointment/:id" element={<ProtectedRoute><Appointments /></ProtectedRoute>} />
          <Route path="/user/patient/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
          <Route path="/user/patient/reschedule/:id" element={<ProtectedRoute><Reschedule /></ProtectedRoute>} />
          <Route path="/user/patient/feedback/:id" element={<ProtectedRoute><Feedback /></ProtectedRoute>} />
          <Route path="/user/patient/friends-family" element={<ProtectedRoute><FriendsFamily /></ProtectedRoute>} />
          <Route path="/user/patient/co-patient" element={<ProtectedRoute><CoPatient /></ProtectedRoute>} />
          <Route path="/user/patient/support" element={<ProtectedRoute><Support /></ProtectedRoute>} />
          <Route path="/user/patient/queue" element={<ProtectedRoute><QueueTracking /></ProtectedRoute>} />
          <Route path="/user/patient/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/user/patient/records" element={<ProtectedRoute><Records /></ProtectedRoute>} />
          
          {/* Doctor Routes */}
          <Route path="/user/doctor/dashboard" element={<ProtectedRoute><DoctorDashboard /></ProtectedRoute>} />
          <Route path="/user/doctor/body-view" element={<ProtectedRoute><BodyView /></ProtectedRoute>} />
          
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
  );
};

export default App;
