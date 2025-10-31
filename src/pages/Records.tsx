import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import NavigationHeader from "@/components/NavigationHeader";
import { FileText, Download, Calendar, User, Pill, Activity } from "lucide-react";
import { getAppointments, getPrescriptions, getUserProfile } from "@/lib/storage";

const Records = () => {
  const [completedAppointments, setCompletedAppointments] = useState<any[]>([]);
  const [rxList, setRxList] = useState<any[]>([]);

  useEffect(() => {
    const load = () => {
      const appointments = getAppointments();
      const completed = appointments.filter(apt => apt.status === 'completed');
      setCompletedAppointments(completed);
      try {
        const profile = getUserProfile();
        const phoneRaw = profile?.phone || '';
        const normalize = (s: string) => (s || '').replace(/\D/g, '');
        const phone = normalize(phoneRaw);
        const allRx = getPrescriptions();
        // Build phone set from all appointments on this device (patient-side), no name filter to avoid mismatch
        const phoneSet = new Set(appointments.map(a => normalize(a.patientPhone)).filter(Boolean));
        // Use relaxed matching: by phone in set, or by exact phone, or by partial name match
        const nameLc = (profile?.name || '').toLowerCase();
        const firstNameLc = nameLc.split(' ')[0] || '';
        const filtered = allRx.filter((r: any) => {
          const rp = normalize(r.patientPhone);
          const rname = (r.patientName || '').toLowerCase();
          const nameMatch = nameLc ? (rname.includes(nameLc) || (firstNameLc && rname.includes(firstNameLc))) : false;
          return (phone && rp === phone) || phoneSet.has(rp) || nameMatch;
        });
        setRxList(filtered);
      } catch {}
    };
    load();
    const onUpdate = () => load();
    window.addEventListener('prescriptions:updated', onUpdate);
    return () => window.removeEventListener('prescriptions:updated', onUpdate);
  }, []);

  const PrescriptionCard = ({ rx }: any) => {
    // Attempt to enrich with appointment/doctor info and patient name
    const appointments = getAppointments();
    const apt = rx.appointmentId ? appointments.find((a: any) => a.id === rx.appointmentId) : appointments.find((a: any) => a.patientPhone === rx.patientPhone && a.doctorId === rx.doctorId);
    const displayPatient = rx.patientName || apt?.patientName || 'You';
    
    return (
      <Card className="p-6 mb-4 animate-fade-in hover:shadow-md transition-shadow">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
              <FileText className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h3 className="text-xl font-bold mb-1">{apt?.doctorName || 'Doctor'}</h3>
              <p className="text-muted-foreground">{apt?.doctorSpecialty || ''}</p>
              <div className="text-sm text-muted-foreground mt-1">Patient: <span className="font-medium text-foreground">{displayPatient}</span></div>
              <div className="flex items-center gap-2 mt-2 text-sm">
                <Calendar className="w-4 h-4 text-primary" />
                <span>{new Date(rx.createdAt).toLocaleDateString('en-IN', { 
                  month: 'short', 
                  day: 'numeric', 
                  year: 'numeric' 
                })}</span>
              </div>
            </div>
          </div>
          <Badge variant="secondary">{apt?.status === 'completed' ? 'Completed' : 'Issued'}</Badge>
        </div>

        <div className="space-y-4 mt-2">
          {/* Diagnosis */}
          {rx.diagnosis && (
            <div className="border-l-4 border-primary pl-4">
              <h4 className="font-semibold text-sm text-muted-foreground mb-1">Diagnosis</h4>
              <p className="text-foreground">{rx.diagnosis}</p>
            </div>
          )}

          {/* Medications */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Pill className="w-4 h-4 text-primary" />
              <h4 className="font-semibold">Prescribed Medications</h4>
            </div>
            <div className="space-y-2">
              {rx.items.map((med: any, idx: number) => (
                <div key={idx} className="bg-accent/30 rounded-lg p-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="font-semibold">{med.medicine}</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        {med.dosage} • {med.duration}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Instructions */}
          {rx.instructions && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Activity className="w-4 h-4 text-primary" />
                <h4 className="font-semibold">Doctor's Instructions</h4>
              </div>
              <p className="text-muted-foreground text-sm bg-accent/20 p-3 rounded-lg">
                {rx.instructions}
              </p>
            </div>
          )}

          {/* Follow-up */}
          {rx.followUp && (
            <div className="bg-primary/5 border border-primary/20 rounded-lg p-3">
              <p className="text-sm">
                <span className="font-semibold">Follow-up: </span>
                {rx.followUp}
              </p>
            </div>
          )}
        </div>

        <div className="flex gap-3 mt-6 pt-4 border-t">
          <Button variant="outline" className="flex-1 hover:bg-[#5B68EE] hover:text-white">
            <Download className="w-4 h-4 mr-2" />
            Download PDF
          </Button>
          <Button variant="outline" className="flex-1 hover:bg-[#5B68EE] hover:text-white">
            <FileText className="w-4 h-4 mr-2" />
            Print
          </Button>
        </div>
      </Card>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-medical flex flex-col">
      <NavigationHeader />
      <div className="container mx-auto px-4 max-w-4xl py-8 flex-1 mb-auto">
        <div className="bg-white rounded-lg px-6 py-4 mb-6 animate-fade-in">
          <h1 className="text-3xl font-bold mb-2">Medical Records</h1>
          <p className="text-muted-foreground">
            View your prescriptions and medical history
          </p>
        </div>

        <Tabs defaultValue="prescriptions" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6 bg-white">
            <TabsTrigger 
              value="prescriptions"
              className="data-[state=active]:bg-[#5B68EE] data-[state=active]:text-white"
            >
              Prescriptions
            </TabsTrigger>
            <TabsTrigger 
              value="reports"
              className="data-[state=active]:bg-[#5B68EE] data-[state=active]:text-white"
            >
              Lab Reports
            </TabsTrigger>
          </TabsList>

          <TabsContent value="prescriptions">
            {rxList.length > 0 ? (
              rxList.map((rx) => (
                <PrescriptionCard key={rx.id} rx={rx} />
              ))
            ) : (
              <Card className="p-12 text-center">
                <FileText className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-xl font-semibold mb-2">No Records Yet</h3>
                <p className="text-muted-foreground mb-6">
                  Your medical records and prescriptions will appear here after completed appointments
                </p>
                <Button onClick={() => window.location.href = '/patient/dashboard'} className="bg-[#5B68EE] hover:bg-[#4A56DD]">
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
      
      {/* Simple White Footer Block */}
      <div className="bg-white border-t border-gray-200 py-4 mt-auto">
        <div className="container mx-auto px-4 text-center text-sm text-gray-600">
          © {new Date().getFullYear()} MedSphere. All rights reserved.
        </div>
      </div>
    </div>
  );
};

export default Records;
