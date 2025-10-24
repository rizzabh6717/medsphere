import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, CreditCard, Eye, RefreshCw, X } from "lucide-react";
import NavigationHeader from "@/components/NavigationHeader";
import { getAppointments, type Appointment } from "@/lib/storage";

const Appointments = () => {
  const navigate = useNavigate();
  const [allAppointments, setAllAppointments] = useState<Appointment[]>([]);

  useEffect(() => {
    // Load appointments from localStorage
    const stored = getAppointments();
    setAllAppointments(stored);
  }, []);

  // Categorize appointments by status
  const appointments = {
    upcoming: allAppointments.filter(apt => apt.status === 'upcoming'),
    completed: allAppointments.filter(apt => apt.status === 'completed'),
    cancelled: allAppointments.filter(apt => apt.status === 'cancelled'),
  };

  const AppointmentCard = ({ appointment, status }: { appointment: Appointment; status: string }) => {
    const formattedDate = new Date(appointment.date).toLocaleDateString('en-IN', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });

    return (
      <Card className="p-4 mb-4 animate-fade-in hover:shadow-md transition-shadow">
        <div className="flex justify-between items-start mb-3">
          <div>
            <h3 className="font-semibold text-lg">{appointment.doctorName}</h3>
            <p className="text-sm text-muted-foreground">{appointment.doctorSpecialty}</p>
          </div>
          <Badge variant={appointment.paid ? "default" : "secondary"}>
            {appointment.paid ? "Paid" : "Not Paid"}
          </Badge>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="w-4 h-4 text-primary" />
            <span>{formattedDate}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Clock className="w-4 h-4 text-primary" />
            <span>{appointment.time}</span>
          </div>
        </div>

        <div className="flex items-center justify-between pt-3 border-t">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Token:</span>
            <span className="font-bold text-primary">#{appointment.tokenNumber}</span>
          </div>

        <div className="flex gap-2">
          {status === "upcoming" && (
            <>
              {!appointment.paid && (
                <Button size="sm" variant="outline">
                  <CreditCard className="w-4 h-4 mr-1" />
                  Pay
                </Button>
              )}
              <Button
                size="sm"
                variant="outline"
                onClick={() => navigate(`/reschedule/${appointment.id}`, { state: { appointment } })}
              >
                <RefreshCw className="w-4 h-4 mr-1" />
                Reschedule
              </Button>
            </>
          )}
          {status === "completed" && (
            <Button
              size="sm"
              onClick={() => navigate(`/feedback/${appointment.id}`)}
            >
              Give Feedback
            </Button>
          )}
          <Button
            size="sm"
            variant="ghost"
            onClick={() => navigate(`/appointment/${appointment.id}`)}
          >
            <Eye className="w-4 h-4" />
          </Button>
        </div>
      </div>

      </Card>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-medical">
      <NavigationHeader />
      <div className="container mx-auto px-4 max-w-4xl py-8">
        <h1 className="text-3xl font-bold mb-6 animate-fade-in">My Appointments</h1>

        <Tabs defaultValue="upcoming" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
            <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
          </TabsList>

          <TabsContent value="upcoming">
            {appointments.upcoming.length > 0 ? (
              appointments.upcoming.map((apt) => (
                <AppointmentCard key={apt.id} appointment={apt} status="upcoming" />
              ))
            ) : (
              <Card className="p-12 text-center">
                <Calendar className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-xl font-semibold mb-2">No Upcoming Appointments</h3>
                <p className="text-muted-foreground mb-6">You don't have any upcoming appointments</p>
                <Button onClick={() => navigate('/dashboard')}>Book an Appointment</Button>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="completed">
            {appointments.completed.length > 0 ? (
              appointments.completed.map((apt) => (
                <AppointmentCard key={apt.id} appointment={apt} status="completed" />
              ))
            ) : (
              <Card className="p-12 text-center">
                <p className="text-muted-foreground">No completed appointments</p>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="cancelled">
            {appointments.cancelled.length > 0 ? (
              appointments.cancelled.map((apt) => (
                <AppointmentCard key={apt.id} appointment={apt} status="cancelled" />
              ))
            ) : (
              <Card className="p-12 text-center">
                <p className="text-muted-foreground">No cancelled appointments</p>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Appointments;
