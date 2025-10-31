import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, User, ArrowLeft, Pill } from "lucide-react";
import { getAppointments, getPrescriptions } from "@/lib/storage";

const statusColor = (s: string) => (
  s === 'upcoming' ? 'bg-blue-100 text-blue-700' : s === 'completed' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
);

const DoctorPatientRecord = () => {
  const { id } = useParams(); // patient id (phone)
  const navigate = useNavigate();
  const [list, setList] = useState<any[]>([]);
  const doctorProfile = useMemo(() => {
    try { return JSON.parse(localStorage.getItem('doctorProfile') || 'null'); } catch { return null; }
  }, []);

  useEffect(() => {
    const all = getAppointments();
    const filtered = all.filter(a => a.patientPhone === id && (!doctorProfile || a.doctorId === doctorProfile.id));
    // sort by date desc
    filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    setList(filtered);
  }, [id, doctorProfile]);

  return (
    <div className="min-h-screen bg-gradient-medical flex flex-col">
      {/* Header */}
      <div className="bg-card shadow-soft px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={() => navigate(-1)} className="rounded-xl"><ArrowLeft className="w-4 h-4 mr-1"/>Back</Button>
            <h1 className="text-2xl font-bold">Patient Record</h1>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-card flex items-center justify-center">
              <User className="w-5 h-5 text-primary" />
            </div>
            <div>
              <div className="font-semibold">{list[0]?.patientName || 'Patient'}</div>
              <div className="text-sm text-muted-foreground">{id}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6 flex-1">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Visits */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4">Visit History</h2>
            <div className="space-y-3">
              {list.map(apt => (
                <Card key={apt.id} className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-6">
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="w-4 h-4 text-primary"/>
                        <span>{new Date(apt.date).toLocaleDateString('en-IN', { month:'short', day:'numeric', year:'numeric' })}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Clock className="w-4 h-4 text-primary"/>
                        <span>{apt.time}</span>
                      </div>
                    </div>
                    <Badge className={statusColor(apt.status)} variant="secondary">{apt.status}</Badge>
                  </div>
                  {apt.symptoms && (
                    <div className="mt-3 text-sm text-muted-foreground">
                      Reason/Notes: {apt.symptoms}
                    </div>
                  )}
                </Card>
              ))}
              {list.length === 0 && (
                <Card className="p-12 text-center text-muted-foreground">No visits yet.</Card>
              )}
            </div>
          </Card>

          {/* Prescriptions */}
          <Card className="p-6">
<h2 className="text-lg font-semibold mb-4 flex items-center gap-2"><Pill className="w-4 h-4 text-primary"/>Consultations</h2>
            <div className="space-y-3">
              {(() => {
                const all = getPrescriptions();
                const listRx = all.filter((r) => r.patientPhone === id);
                if (listRx.length === 0) {
                  return <div className="text-sm text-muted-foreground">No prescriptions yet.</div>;
                }
                return listRx.map((rx) => (
                  <Card key={rx.id} className="p-4 space-y-2">
                    <div className="text-sm text-muted-foreground">{new Date(rx.createdAt).toLocaleString()}</div>
                    {rx.diagnosis && (
                      <div className="border-l-4 border-primary pl-3 text-sm"><span className="font-semibold">Diagnosis:</span> {rx.diagnosis}</div>
                    )}
                    <div>
                      <div className="text-sm font-semibold mb-1">Prescribed Medications</div>
                      <ul className="list-disc pl-5 space-y-1">
                        {rx.items.map((it, idx) => (
                          <li key={idx} className="text-sm">
                            <span className="font-medium">{it.medicine}</span> — {it.dosage}, {it.duration}{it.notes ? ` • ${it.notes}` : ''}
                          </li>
                        ))}
                      </ul>
                    </div>
                    {rx.instructions && (
                      <div className="text-sm text-muted-foreground"><span className="font-semibold">Doctor's Instructions:</span> {rx.instructions}</div>
                    )}
                    {rx.followUp && (
                      <div className="text-sm"><span className="font-semibold">Follow-up:</span> {rx.followUp}</div>
                    )}
                  </Card>
                ));
              })()}
            </div>
          </Card>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-white border-t border-gray-200 py-4 mt-auto">
        <div className="container mx-auto px-4 text-center text-sm text-gray-600">
          © {new Date().getFullYear()} MedSphere. All rights reserved.
        </div>
      </div>
    </div>
  );
};

export default DoctorPatientRecord;