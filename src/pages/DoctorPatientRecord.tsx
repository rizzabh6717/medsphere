import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, User, ArrowLeft, Pill, Activity } from "lucide-react";
import { getAppointments, getPrescriptions } from "@/lib/storage";
import { analyzeSymptomsCharts, type ChartAnalysisResponse, generateAIAnalysis } from "@/lib/ai";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const statusColor = (s: string) => (
  s === 'upcoming' ? 'bg-blue-100 text-blue-700' : s === 'completed' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
);

const DoctorPatientRecord = () => {
  const { id } = useParams(); // patient id (phone)
  const navigate = useNavigate();
  const [list, setList] = useState<any[]>([]);
  const [vaLoading, setVaLoading] = useState(false);
  const [va, setVa] = useState<ChartAnalysisResponse | null>(null);
  const [vaErr, setVaErr] = useState<string | null>(null);
  const [fullOpen, setFullOpen] = useState(false);
  const [fullLoading, setFullLoading] = useState(false);
  const [fullText, setFullText] = useState<string>('');
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

  // Build and fetch chart-oriented analysis based only on symptoms
  useEffect(() => {
    const latest = list[0];
    const symptoms = (latest?.symptoms || '').trim();
    if (!latest || !symptoms) { setVa(null); setVaErr(null); return; }
    setVaLoading(true);
    setVaErr(null);
    analyzeSymptomsCharts(symptoms)
      .then(setVa)
      .catch((e:any)=> setVaErr(e?.message || 'AI analysis failed'))
      .finally(()=> setVaLoading(false));
  }, [list]);

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
          {/* AI Visual Health Summary — Symptom Insights */}
          {(() => {
            const latest = list[0];
            if (!latest) return null;
            const name = latest?.patientName || 'Patient';

            // Radar setup
            const axes = [
              { key: 'cough', label: 'Cough' },
              { key: 'fever', label: 'Fever' },
              { key: 'sore_throat', label: 'Sore Throat' },
              { key: 'fatigue', label: 'Fatigue' },
              { key: 'sore', label: 'Sore' },
            ];
            const vals = (k: string) => Math.max(0, Math.min(100, Number(va?.symptomScores?.[k] || 0)));
            const R = 70; const CX = 120; const CY = 100;
            const pts = axes.map((a, i) => {
              const angle = (Math.PI * 2 * i) / axes.length - Math.PI / 2;
              const r = (vals(a.key) / 100) * R;
              return [CX + r * Math.cos(angle), CY + r * Math.sin(angle)];
            });
            const poly = pts.map((p,i)=>`${i===0?'M':'L'}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(' ') + ' Z';

            const diagnoses = va?.diagnoses || [];
            const barMax = 100; const barW = 180; const barH = 12;

            return (
              <Card className="p-6 overflow-hidden" style={{ background: 'linear-gradient(135deg, #e6f7ff 0%, #e8f9f5 100%)' }}>
                <h2 className="text-xl font-bold mb-4">AI Visual Health Summary — Symptom Insights</h2>
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Radar */}
                  <div className="bg-white/60 rounded-xl p-4 flex items-center justify-center">
                    <div className="w-full flex flex-col items-center">
                      <div className="font-semibold mb-2 self-start">Symptom Severity</div>
                      <svg width="240" height="200" viewBox="0 0 240 200">
                        {/* grid */}
                        {[0.25,0.5,0.75,1].map((f,idx)=>{
                          const r = R*f; const points = axes.map((a,i)=>{
                            const ang = (Math.PI*2*i)/axes.length - Math.PI/2; return [CX + r*Math.cos(ang), CY + r*Math.sin(ang)];
                          });
                          const d = points.map((p,i)=>`${i===0?'M':'L'}${p[0]},${p[1]}`).join(' ')+' Z';
                          return <path key={idx} d={d} fill="none" stroke="#e5e7eb"/>;
                        })}
                        {/* labels */}
                        {axes.map((a,i)=>{
                          const ang = (Math.PI*2*i)/axes.length - Math.PI/2; const r = R+16; const x = CX + r*Math.cos(ang); const y = CY + r*Math.sin(ang);
                          return <text key={a.key} x={x} y={y} textAnchor="middle" fontSize="12" fill="#111827">{a.label}</text>;
                        })}
                        {/* polygon */}
                        <path d={poly} fill="#60a5fa55" stroke="#3b82f6" strokeWidth="2" />
                      </svg>
                    </div>
                  </div>

                  {/* Probable Diagnosis bars */}
                  <div className="bg-white/60 rounded-xl p-4">
                    <div className="font-semibold mb-2">Probable Diagnosis</div>
                    <div className="space-y-6">
                      {(diagnoses.length?diagnoses:[{label:'Viral Infection',score:70},{label:'Bacterial',score:35},{label:'Allergy',score:25}]).map((d,idx)=> (
                        <div key={idx}>
                          <div className="text-sm mb-1 text-muted-foreground">{d.label}</div>
                          <svg width={barW} height={barH}>
                            <rect x="0" y="0" width={barW} height={barH} rx="6" fill="#eef2ff" />
                            <rect x="0" y="0" width={Math.max(0, Math.min(barW, (d.score/barMax)*barW))} height={barH} rx="6" fill="#34d399" />
                          </svg>
                          <div className="text-xs text-muted-foreground">{Math.round(d.score)}%</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* AI Summary */}
                <div className="mt-6 bg-white/70 rounded-xl p-4">
                  <div className="font-semibold mb-1">AI Summary</div>
                  <div className="text-sm text-foreground">{vaLoading ? 'Analyzing symptoms…' : (vaErr ? 'AI unavailable — showing heuristic summary.' : (va?.summary || '—'))}</div>
                </div>

                <div className="mt-4 flex items-center justify-end">
                  <Button variant="outline" size="sm" onClick={async ()=>{
                    const latest = list[0];
                    if (!latest?.symptoms) return;
                    setFullOpen(true); setFullLoading(true); setFullText('');
                    try { const r = await generateAIAnalysis({ symptoms: latest.symptoms }); setFullText(r.text); }
                    catch { setFullText('AI report is unavailable right now.'); }
                    finally { setFullLoading(false); }
                  }}>View Full AI Report</Button>
                </div>
              </Card>
            );
          })()}

          <Dialog open={fullOpen} onOpenChange={setFullOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>AI Report</DialogTitle>
              </DialogHeader>
              <div className="text-sm whitespace-pre-wrap">{fullLoading ? 'Generating…' : (fullText || 'No details')}</div>
            </DialogContent>
          </Dialog>

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