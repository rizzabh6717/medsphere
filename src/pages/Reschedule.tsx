import { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Clock, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import BackButton from "@/components/BackButton";
import { getAppointments, updateAppointment, deleteAppointment, addNotification } from "@/lib/storage";

const Reschedule = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [selectedSlot, setSelectedSlot] = useState<string>("");
  const [appointment, setAppointment] = useState<any>(null);

  useEffect(() => {
    // Get appointment from location state or localStorage
    if (location.state?.appointment) {
      setAppointment(location.state.appointment);
    } else if (id) {
      const appointments = getAppointments();
      const found = appointments.find(apt => apt.id === id);
      if (found) {
        setAppointment(found);
        setDate(new Date(found.date));
      } else {
        toast.error("Appointment not found");
navigate("/user/patient/appointments")
      }
    }
  }, [id, location.state, navigate]);

  const availableSlots = ["09:00 AM", "09:30 AM", "11:00 AM", "11:30 AM", "02:00 PM", "02:30 PM"];

  const handleReschedule = () => {
    if (!appointment) {
      toast.error("No appointment found");
      return;
    }

    if (!selectedSlot) {
      toast.error("Please select a new time slot");
      return;
    }

    if (!date) {
      toast.error("Please select a date");
      return;
    }

    // Update appointment
    updateAppointment(appointment.id, {
      date: date.toISOString(),
      time: selectedSlot,
    });

    // Add notification
    addNotification({
      type: 'reschedule',
      title: 'Appointment Rescheduled',
      message: `Your appointment with ${appointment.doctorName} has been rescheduled to ${date.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })} at ${selectedSlot}`,
      time: 'Just now',
      read: false,
      icon: 'Clock',
    });

    toast.success("Appointment rescheduled successfully!");
    setTimeout(() => {
      navigate("/patient/appointments");
    }, 1500);
  };

  const handleCancel = () => {
    if (!appointment) {
      toast.error("No appointment found");
      return;
    }

    if (confirm("Are you sure you want to cancel this appointment? You will receive a full refund.")) {
      // Update appointment status to cancelled
      updateAppointment(appointment.id, {
        status: 'cancelled',
      });

      // Add notification
      addNotification({
        type: 'cancellation',
        title: 'Appointment Cancelled',
        message: `Your appointment with ${appointment.doctorName} has been cancelled. Refund will be processed in 3-5 business days.`,
        time: 'Just now',
        read: false,
        icon: 'X',
      });

      toast.success("Appointment cancelled. Refund will be processed in 3-5 business days.");
      setTimeout(() => {
        navigate("/patient/appointments");
      }, 2000);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-medical py-8">
      <div className="container mx-auto px-4 max-w-4xl">
<BackButton to="/user/patient/appointments" />
        <h1 className="text-3xl font-bold mb-6 animate-fade-in">Reschedule Appointment</h1>

        {appointment && (
          <Alert className="mb-6 animate-fade-in">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Current appointment: <strong>{appointment.doctorName}</strong> on{" "}
              <strong>{new Date(appointment.date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}</strong> at <strong>{appointment.time}</strong>
            </AlertDescription>
          </Alert>
        )}

        <Card className="p-6 mb-6 animate-fade-in" style={{ animationDelay: "0.1s" }}>
          <h2 className="text-xl font-semibold mb-4">Select New Date</h2>
          <div className="flex justify-center">
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              disabled={(date) => date < new Date()}
              className="rounded-md border"
            />
          </div>
        </Card>

        <Card className="p-6 mb-6 animate-fade-in" style={{ animationDelay: "0.2s" }}>
          <h2 className="text-xl font-semibold mb-4">Select New Time Slot</h2>
          <div className="grid grid-cols-3 gap-3">
            {availableSlots.map((slot) => (
              <Button
                key={slot}
                variant={selectedSlot === slot ? "default" : "outline"}
                onClick={() => setSelectedSlot(slot)}
                className={`justify-start ${selectedSlot === slot ? 'bg-[#5B68EE] hover:bg-[#4A56DD]' : ''}`}
              >
                <Clock className="w-4 h-4 mr-2" />
                {slot}
              </Button>
            ))}
          </div>
        </Card>

        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={() => navigate("/patient/appointments")}
            className="flex-1"
          >
            Go Back
          </Button>
          <Button
            variant="destructive"
            onClick={handleCancel}
            className="flex-1"
          >
            Cancel Appointment
          </Button>
          <Button onClick={handleReschedule} className="flex-1 bg-[#5B68EE] hover:bg-[#4A56DD]">
            Confirm Reschedule
          </Button>
        </div>

        <Card className="mt-6 p-4 bg-accent/50 animate-fade-in" style={{ animationDelay: "0.3s" }}>
          <p className="text-sm text-muted-foreground">
            <strong>Refund Policy:</strong> Cancellations made 24 hours before the appointment are eligible for full refund.
            Reschedules can be done free of charge up to 2 times.
          </p>
        </Card>
      </div>
    </div>
  );
};

export default Reschedule;
