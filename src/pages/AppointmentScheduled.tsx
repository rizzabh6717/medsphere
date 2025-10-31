import { useNavigate, useLocation } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Calendar, Clock, User, CreditCard } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const AppointmentScheduled = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { doctorId, date, slot, fullName, paid } = location.state || {};

  const appointmentDetails = {
    doctor: "Dr. Prakash Das",
    specialty: "Cardiologist",
    date: date ? new Date(date).toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : "Today",
    time: slot || "10:00 AM",
    patient: fullName || "John Doe",
    status: paid ? "Confirmed" : "Pending Payment",
    tokenNumber: Math.floor(Math.random() * 100) + 1,
  };

  const addToCalendar = () => {
    // Create calendar event
    const event = {
      title: `Doctor Appointment - ${appointmentDetails.doctor}`,
      description: `Consultation with ${appointmentDetails.doctor}, ${appointmentDetails.specialty}`,
      start: date,
      duration: 30,
    };
    console.log("Adding to calendar:", event);
    alert("Calendar event created! (Demo)");
  };

  return (
    <div className="min-h-screen bg-gradient-medical flex items-center justify-center py-8">
      <div className="container mx-auto px-4 max-w-2xl">
        <Card className="p-8 text-center animate-scale-in">
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
              <CheckCircle2 className="w-12 h-12 text-green-600 dark:text-green-400" />
            </div>
          </div>

          <h1 className="text-3xl font-bold mb-2">Appointment Scheduled!</h1>
          <p className="text-muted-foreground mb-8">
            Your appointment has been successfully booked
          </p>

          <div className="bg-accent/50 rounded-lg p-6 mb-6 text-left space-y-4">
            <div className="flex items-start gap-3">
              <User className="w-5 h-5 text-primary mt-0.5" />
              <div>
                <p className="text-sm text-muted-foreground">Doctor</p>
                <p className="font-semibold">{appointmentDetails.doctor}</p>
                <p className="text-sm text-muted-foreground">{appointmentDetails.specialty}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Calendar className="w-5 h-5 text-primary mt-0.5" />
              <div>
                <p className="text-sm text-muted-foreground">Date</p>
                <p className="font-semibold">{appointmentDetails.date}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Clock className="w-5 h-5 text-primary mt-0.5" />
              <div>
                <p className="text-sm text-muted-foreground">Time</p>
                <p className="font-semibold">{appointmentDetails.time}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <CreditCard className="w-5 h-5 text-primary mt-0.5" />
              <div className="flex items-center gap-2">
                <p className="text-sm text-muted-foreground">Status:</p>
                <Badge variant={paid ? "default" : "secondary"}>
                  {appointmentDetails.status}
                </Badge>
              </div>
            </div>

            <div className="pt-4 border-t">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Token Number</span>
                <span className="text-2xl font-bold text-primary">#{appointmentDetails.tokenNumber}</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Button variant="outline" onClick={addToCalendar} className="flex-1">
              <Calendar className="w-4 h-4 mr-2" />
              Add to Calendar
            </Button>
<Button onClick={() => navigate("/patient/appointments")} className="flex-1 bg-[#5B68EE] hover:bg-[#4A56DD]">
              View My Appointments
            </Button>
          </div>

          <p className="text-sm text-muted-foreground mt-6">
            You will receive a confirmation message on your registered mobile number
          </p>
        </Card>
      </div>
    </div>
  );
};

export default AppointmentScheduled;
