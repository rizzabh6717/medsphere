import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import NavigationHeader from "@/components/NavigationHeader";
import { FileText, Download, Calendar, User, Pill, Activity } from "lucide-react";
import { getAppointments } from "@/lib/storage";

const Records = () => {
  const [completedAppointments, setCompletedAppointments] = useState<any[]>([]);

  useEffect(() => {
    const appointments = getAppointments();
    const completed = appointments.filter(apt => apt.status === 'completed');
    setCompletedAppointments(completed);
  }, []);

  // Mock prescriptions - in real app, these would come from the appointment details
  const getMockPrescription = (appointmentId: string) => ({
    medications: [
      { name: "Aspirin", dosage: "100mg", frequency: "Once daily", duration: "30 days" },
      { name: "Vitamin D3", dosage: "1000 IU", frequency: "Once daily", duration: "60 days" },
    ],
    instructions: "Take medications after meals. Avoid alcohol. Get adequate rest.",
    followUp: "Follow up in 2 weeks if symptoms persist",
    diagnosis: "Mild hypertension and vitamin deficiency",
  });

  const PrescriptionCard = ({ appointment }: any) => {
    const prescription = getMockPrescription(appointment.id);
    
    return (
      <Card className="p-6 mb-4 animate-fade-in hover:shadow-md transition-shadow">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
              <FileText className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h3 className="text-xl font-bold mb-1">{appointment.doctorName}</h3>
              <p className="text-muted-foreground">{appointment.doctorSpecialty}</p>
              <div className="flex items-center gap-2 mt-2 text-sm">
                <Calendar className="w-4 h-4 text-primary" />
                <span>{new Date(appointment.date).toLocaleDateString('en-IN', { 
                  month: 'short', 
                  day: 'numeric', 
                  year: 'numeric' 
                })}</span>
              </div>
            </div>
          </div>
          <Badge variant="secondary">Completed</Badge>
        </div>

        <div className="space-y-4 mt-6">
          {/* Diagnosis */}
          <div className="border-l-4 border-primary pl-4">
            <h4 className="font-semibold text-sm text-muted-foreground mb-1">Diagnosis</h4>
            <p className="text-foreground">{prescription.diagnosis}</p>
          </div>

          {/* Medications */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Pill className="w-4 h-4 text-primary" />
              <h4 className="font-semibold">Prescribed Medications</h4>
            </div>
            <div className="space-y-2">
              {prescription.medications.map((med, idx) => (
                <div key={idx} className="bg-accent/30 rounded-lg p-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="font-semibold">{med.name}</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        {med.dosage} • {med.frequency}
                      </p>
                    </div>
                    <Badge variant="outline">{med.duration}</Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Instructions */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Activity className="w-4 h-4 text-primary" />
              <h4 className="font-semibold">Doctor's Instructions</h4>
            </div>
            <p className="text-muted-foreground text-sm bg-accent/20 p-3 rounded-lg">
              {prescription.instructions}
            </p>
          </div>

          {/* Follow-up */}
          {prescription.followUp && (
            <div className="bg-primary/5 border border-primary/20 rounded-lg p-3">
              <p className="text-sm">
                <span className="font-semibold">Follow-up: </span>
                {prescription.followUp}
              </p>
            </div>
          )}
        </div>

        <div className="flex gap-3 mt-6 pt-4 border-t">
          <Button variant="outline" className="flex-1">
            <Download className="w-4 h-4 mr-2" />
            Download PDF
          </Button>
          <Button variant="outline" className="flex-1">
            <FileText className="w-4 h-4 mr-2" />
            Print
          </Button>
        </div>
      </Card>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-medical">
      <NavigationHeader />
      <div className="container mx-auto px-4 max-w-4xl py-8">
        <div className="mb-6 animate-fade-in">
          <h1 className="text-3xl font-bold mb-2">Medical Records</h1>
          <p className="text-muted-foreground">
            View your prescriptions and medical history
          </p>
        </div>

        <Tabs defaultValue="prescriptions" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="prescriptions">Prescriptions</TabsTrigger>
            <TabsTrigger value="reports">Lab Reports</TabsTrigger>
          </TabsList>

          <TabsContent value="prescriptions">
            {completedAppointments.length > 0 ? (
              completedAppointments.map((appointment) => (
                <PrescriptionCard key={appointment.id} appointment={appointment} />
              ))
            ) : (
              <Card className="p-12 text-center">
                <FileText className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-xl font-semibold mb-2">No Records Yet</h3>
                <p className="text-muted-foreground mb-6">
                  Your medical records and prescriptions will appear here after completed appointments
                </p>
                <Button onClick={() => window.location.href = '/dashboard'}>
                  Book an Appointment
                </Button>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="reports">
            <Card className="p-12 text-center">
              <FileText className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">No Lab Reports</h3>
              <p className="text-muted-foreground">
                Your lab reports will be available here
              </p>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Records;
