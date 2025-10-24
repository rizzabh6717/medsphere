import { useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { initializeDefaultData } from "@/lib/storage";
import ProtectedRoute from "@/components/ProtectedRoute";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import OTP from "./pages/OTP";
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
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/otp" element={<OTP />} />
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/doctor/:id" element={<ProtectedRoute><DoctorDetails /></ProtectedRoute>} />
          <Route path="/book-appointment" element={<ProtectedRoute><BookAppointment /></ProtectedRoute>} />
          <Route path="/patient-details" element={<ProtectedRoute><PatientDetails /></ProtectedRoute>} />
          <Route path="/appointment-scheduled" element={<ProtectedRoute><AppointmentScheduled /></ProtectedRoute>} />
          <Route path="/chat/:doctorId" element={<ProtectedRoute><Chat /></ProtectedRoute>} />
          <Route path="/appointments" element={<ProtectedRoute><Appointments /></ProtectedRoute>} />
          <Route path="/appointment/:id" element={<ProtectedRoute><Appointments /></ProtectedRoute>} />
          <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
          <Route path="/reschedule/:id" element={<ProtectedRoute><Reschedule /></ProtectedRoute>} />
          <Route path="/feedback/:id" element={<ProtectedRoute><Feedback /></ProtectedRoute>} />
          <Route path="/friends-family" element={<ProtectedRoute><FriendsFamily /></ProtectedRoute>} />
          <Route path="/co-patient" element={<ProtectedRoute><CoPatient /></ProtectedRoute>} />
          <Route path="/support" element={<ProtectedRoute><Support /></ProtectedRoute>} />
          <Route path="/queue" element={<ProtectedRoute><QueueTracking /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/records" element={<ProtectedRoute><Records /></ProtectedRoute>} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
  );
};

export default App;
