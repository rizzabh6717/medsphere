import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import NavigationHeader from "@/components/NavigationHeader";
import { 
  Plus, 
  Trash2, 
  FileText, 
  Printer, 
  Save, 
  Eye, 
  ArrowLeft,
  Pill,
  Clock,
  Calendar,
  CalendarDays,
  User,
  CheckCircle,
  Brain,
  Loader2
} from "lucide-react";
import { getAppointments, getPrescriptions, savePrescription, addFollowUp } from "@/lib/storage";
import { analyzeSymptomsCharts, type ChartAnalysisResponse } from "@/lib/ai";
import jsPDF from 'jspdf';

interface Medicine {
  id: string;
  medicine: string;
  dosage: string;
  frequency: string;
  duration: string;
  notes: string;
}

const PrescriptionManagement = () => {
  const navigate = useNavigate();
  const { appointmentId } = useParams();
  const [appointment, setAppointment] = useState<any>(null);
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [diagnosis, setDiagnosis] = useState("");
  const [instructions, setInstructions] = useState("");
  const [showPreview, setShowPreview] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // AI Visual Analysis (charts)
  const [chartData, setChartData] = useState<ChartAnalysisResponse | null>(null);
  const [aiLoading, setAiLoading] = useState<boolean>(false);
  const [aiError, setAiError] = useState<string>('');
  
  // Follow-up scheduling states
  const [selectedFollowUpDate, setSelectedFollowUpDate] = useState<Date | null>(null);
  const [selectedFollowUpTime, setSelectedFollowUpTime] = useState<string>("");
  const [followUpNotes, setFollowUpNotes] = useState("");
  const [currentMonth, setCurrentMonth] = useState(new Date());

  useEffect(() => {
    if (appointmentId) {
      const appointments = getAppointments();
      const apt = appointments.find((a: any) => a.id === appointmentId);
      setAppointment(apt);
      
      // Add first empty medicine row
      addMedicine();

      // Kick off chart-oriented AI analysis using only symptoms
      void (async () => {
        try {
          setAiLoading(true);
          setAiError('');
          const symptoms = apt?.symptoms || '';
          const res = await analyzeSymptomsCharts(symptoms);
          setChartData(res);
        } catch (e: any) {
          setAiError(e?.message || 'Failed to generate analysis');
        } finally {
          setAiLoading(false);
        }
      })();
    }
  }, [appointmentId]);

  const addMedicine = () => {
    const newMedicine: Medicine = {
      id: `med_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      medicine: "",
      dosage: "",
      frequency: "",
      duration: "",
      notes: ""
    };
    setMedicines(prev => [...prev, newMedicine]);
  };

  const removeMedicine = (id: string) => {
    setMedicines(prev => prev.filter(med => med.id !== id));
  };

  const updateMedicine = (id: string, field: keyof Medicine, value: string) => {
    setMedicines(prev => 
      prev.map(med => 
        med.id === id ? { ...med, [field]: value } : med
      )
    );
  };

  // Calendar generation functions
  const generateCalendarDays = () => {
    const firstDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
    const lastDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);
    const firstDayWeek = firstDay.getDay();
    const daysInMonth = lastDay.getDate();
    
    const days = [];
    
    // Previous month's days
    for (let i = firstDayWeek - 1; i >= 0; i--) {
      const prevDate = new Date(firstDay);
      prevDate.setDate(prevDate.getDate() - (i + 1));
      days.push({ date: prevDate, isCurrentMonth: false });
    }
    
    // Current month's days
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
      days.push({ date, isCurrentMonth: true });
    }
    
    // Next month's days to complete the grid
    const remainingSlots = 42 - days.length; // 6 rows * 7 days
    for (let day = 1; day <= remainingSlots; day++) {
      const nextDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, day);
      days.push({ date: nextDate, isCurrentMonth: false });
    }
    
    return days;
  };

  const timeSlots = [
    "08:00", "08:30", "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
    "12:00", "13:00", "13:30", "14:00", "14:30", "15:00", "15:30", "16:00", "16:30"
  ];

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const handleFollowUpDateSelect = (date: Date) => {
    if (date < new Date()) return; // Can't select past dates
    setSelectedFollowUpDate(date);
    setSelectedFollowUpTime(""); // Reset time when date changes
  };

  const savePrescriptionData = async () => {
    if (!appointment) return;
    
    setIsSaving(true);
    try {
      const validMedicines = medicines.filter(med => 
        med.medicine.trim() || med.dosage.trim() || med.frequency.trim()
      );
      
      const prescriptionData = {
        appointmentId: appointment.id,
        patientId: appointment.patientId,
        patientName: appointment.patientName,
        patientPhone: appointment.patientPhone,
        doctorId: appointment.doctorId,
        doctorName: appointment.doctorName,
        doctorSpecialty: appointment.doctorSpecialty,
        diagnosis,
        items: validMedicines.map(med => ({
          medicine: med.medicine,
          dosage: med.dosage,
          duration: med.frequency + (med.duration ? ` for ${med.duration}` : ''),
          instructions: med.notes
        })),
        instructions,
        followUp: followUpNotes, // Use the follow-up notes from scheduling section
        createdAt: new Date().toISOString()
      };
      
      savePrescription(prescriptionData);
      
      // Schedule follow-up
      if (selectedFollowUpDate && selectedFollowUpTime) {
        const followUpData = {
          patientId: (appointment.patientPhone || '').replace(/\D/g, ''), // Normalize to digits only
          patientName: appointment.patientName,
          doctorId: appointment.doctorId,
          doctorName: appointment.doctorName,
          doctorSpecialty: appointment.doctorSpecialty || "General Medicine",
          date: selectedFollowUpDate.toISOString(),
          time: selectedFollowUpTime,
          notes: followUpNotes,
          status: "scheduled" as const
        };
        
        console.log("💾 Debug - Saving follow-up data:", followUpData);
        console.log("📋 Debug - Appointment data:", appointment);
        
        const savedFollowUp = addFollowUp(followUpData);
        console.log("✅ Debug - Follow-up saved:", savedFollowUp);
        
        // Verify it's in storage
        const allFollowUps = JSON.parse(localStorage.getItem('followUps') || '[]');
        console.log("📦 Debug - All follow-ups after saving:", allFollowUps);
      } else if (followUpNotes.trim()) {
        // Fallback: if doctor provided follow-up notes but no date/time, create a default follow-up (1 week later at 10:00)
        const defaultDate = new Date();
        defaultDate.setDate(defaultDate.getDate() + 7);
        const followUpData = {
          patientId: (appointment.patientPhone || '').replace(/\D/g, ''), // Normalize to digits only
          patientName: appointment.patientName,
          doctorId: appointment.doctorId,
          doctorName: appointment.doctorName,
          doctorSpecialty: appointment.doctorSpecialty || "General Medicine",
          date: defaultDate.toISOString(),
          time: '10:00',
          notes: followUpNotes,
          status: "scheduled" as const
        };
        console.log("💾 Debug - Saving default follow-up:", followUpData);
        addFollowUp(followUpData);
      }
      
      // Update appointment status to completed
      const appointments = getAppointments();
      const updatedAppointments = appointments.map((apt: any) => 
        apt.id === appointment.id 
          ? { ...apt, status: 'completed', prescriptionAdded: true }
          : apt
      );
      localStorage.setItem('appointments', JSON.stringify(updatedAppointments));
      
      navigate('/doctor/dashboard');
    } catch (error) {
      console.error("Error saving prescription:", error);
    } finally {
      setIsSaving(false);
    }
  };

  // Convert image to Base64 (same helper as Records page)
  const convertImageToBase64 = (imagePath: string): Promise<string> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = function() {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = img.width;
        canvas.height = img.height;
        ctx?.drawImage(img, 0, 0);
        const dataURL = canvas.toDataURL('image/png');
        resolve(dataURL);
      };
      img.onerror = function() {
        reject(new Error('Failed to load image'));
      };
      img.src = imagePath;
    });
  };

  const printPrescription = async () => {
    if (!appointment) return;
    // Build a prescription-like object from the current form
    const rx: any = {
      id: `rx_${Date.now()}`,
      createdAt: new Date().toISOString(),
      diagnosis,
      instructions,
      followUp: followUpNotes,
      items: medicines.filter(med => med.medicine.trim()).map(med => ({
        medicine: med.medicine,
        dosage: med.dosage,
        duration: med.frequency + (med.duration ? ` for ${med.duration}` : ''),
      }))
    };
    const apt: any = {
      doctorName: appointment.doctorName,
      doctorSpecialty: appointment.doctorSpecialty || 'General Medicine',
    };
    const displayPatient = appointment.patientName || 'Patient';

    // Try to get Base64 logo (exact behavior as Records page)
    let logoBase64 = '';
    try {
      logoBase64 = await convertImageToBase64(`${window.location.origin}/assets/logo.png`);
    } catch (e) {
      console.log('Logo not found, using placeholder');
    }

    // Build PDF styled like the Records combined PDF
    const pdf = new jsPDF();

    // Blue Header with Logo
    pdf.setFillColor(37, 99, 235); // #2563eb
    pdf.rect(0, 0, 210, 35, 'F');

    // Header Text
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(20);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Health Choice Clinic', 15, 18);
    pdf.setFontSize(11);
    pdf.setFont('helvetica', 'normal');
    pdf.text('123 Medical Center Drive, Healthcare District', 15, 25);
    pdf.text('Email: contact@healthchoiceclinic.com | Phone: +91-9876543210', 15, 31);

    // Add logo or placeholder
    if (logoBase64) {
      try { pdf.addImage(logoBase64, 'PNG', 173, 5, 25, 25, undefined, 'FAST'); }
      catch {
        pdf.setFillColor(255, 255, 255, 0.2);
        pdf.circle(185, 17.5, 12, 'F');
        pdf.setTextColor(255, 255, 255);
        pdf.setFontSize(8);
        pdf.text('LOGO', 180, 18);
      }
    } else {
      pdf.setFillColor(255, 255, 255, 0.2);
      pdf.circle(185, 17.5, 12, 'F');
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(8);
      pdf.text('LOGO', 180, 18);
    }

    let yPosition = 50;

    // Doctor and Prescription Info (same layout)
    pdf.setTextColor(0, 0, 0);
    pdf.setFontSize(16);
    pdf.setFont('helvetica', 'bold');
    pdf.text(`Dr. ${apt?.doctorName || 'Medical Professional'}`, 15, yPosition);

    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'normal');
    pdf.text(`${apt?.doctorSpecialty || 'General Medicine'}`, 15, yPosition + 7);

    // Right side info
    pdf.setFont('helvetica', 'bold');
    pdf.text('Prescription', 140, yPosition);
    pdf.setFont('helvetica', 'normal');
    pdf.text(`Date: ${new Date(rx.createdAt).toLocaleDateString('en-IN')}`, 140, yPosition + 7);

    // Patient info
    pdf.setFontSize(12);
    pdf.text(`Patient: ${displayPatient}`, 15, yPosition + 20);

    // Line separator
    pdf.setDrawColor(229, 231, 235);
    pdf.setLineWidth(0.5);
    pdf.line(15, yPosition + 26, 195, yPosition + 26);

    yPosition += 40;

    // Diagnosis
    if (rx.diagnosis) {
      pdf.setFontSize(12);
      pdf.setTextColor(91, 104, 238);
      pdf.text('Diagnosis:', 15, yPosition);
      pdf.setTextColor(55, 65, 81);
      pdf.setFontSize(10);
      const diagnosisLines = pdf.splitTextToSize(rx.diagnosis, 180);
      pdf.text(diagnosisLines, 15, yPosition + 7);
      yPosition += diagnosisLines.length * 5 + 15;
    }

    // Medications
    pdf.setFontSize(12);
    pdf.setTextColor(91, 104, 238);
    pdf.text('Prescribed Medications:', 15, yPosition);
    yPosition += 10;
    rx.items.forEach((med: any, index: number) => {
      pdf.setFontSize(11);
      pdf.setTextColor(17, 24, 39);
      pdf.text(`${index + 1}. ${med.medicine}`, 20, yPosition);
      pdf.setFontSize(9);
      pdf.setTextColor(100, 116, 139);
      pdf.text(`${med.dosage} • ${med.duration}`, 20, yPosition + 5);
      yPosition += 15;
      if (yPosition > 250) { pdf.addPage(); yPosition = 20; }
    });

    // Instructions
    if (rx.instructions) {
      yPosition += 5;
      pdf.setFontSize(12);
      pdf.setTextColor(91, 104, 238);
      pdf.text("Doctor's Instructions:", 15, yPosition);
      pdf.setTextColor(55, 65, 81);
      pdf.setFontSize(10);
      const instructionLines = pdf.splitTextToSize(rx.instructions, 180);
      pdf.text(instructionLines, 15, yPosition + 7);
      yPosition += instructionLines.length * 5 + 10;
    }

    // Follow-up
    if (rx.followUp) {
      yPosition += 5;
      pdf.setFontSize(12);
      pdf.setTextColor(91, 104, 238);
      pdf.text('Follow-up:', 15, yPosition);
      pdf.setTextColor(55, 65, 81);
      pdf.setFontSize(10);
      const fuLines = pdf.splitTextToSize(rx.followUp, 180);
      pdf.text(fuLines, 15, yPosition + 7);
      yPosition += fuLines.length * 5 + 10;
    }

    // Blue Footer (same as Records)
    const footerY = 280;
    pdf.setFillColor(37, 99, 235);
    pdf.rect(0, footerY, 210, 17, 'F');
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    pdf.text('Health Choice Clinic - Your Trusted Healthcare Partner | Email: contact@healthchoiceclinic.com | Phone: +91-9876543210', 15, footerY + 10);

    // Save file
    const fileName = `Prescription_${displayPatient.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
    pdf.save(fileName);
  };

  if (!appointment) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading appointment...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#FFDDD2' }}>
      <NavigationHeader title="Prescription Management" />
      
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Header Card */}
        <Card className="border-l-4 border-l-blue-600">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl text-gray-800 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-blue-600" />
                  Create Prescription
                </CardTitle>
                <p className="text-sm text-gray-600 mt-1">
                  Patient: <span className="font-medium">{appointment.patientName}</span> • 
                  Date: <span className="font-medium">{new Date(appointment.date).toLocaleDateString()}</span>
                </p>
              </div>
              <Button
                variant="outline"
                onClick={() => navigate('/doctor/dashboard')}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Dashboard
              </Button>
            </div>
          </CardHeader>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Form */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* AI Visual Health Summary — Symptom Insights */}
            <Card className="shadow-sm hover:shadow-md transition-shadow duration-200">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg text-gray-800 flex items-center gap-2">
                  <Brain className="w-5 h-5 text-blue-600" />
                  AI Visual Health Summary — Symptom Insights
                </CardTitle>
              </CardHeader>
              <CardContent>
                {aiLoading && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Loader2 className="w-4 h-4 animate-spin" /> Generating analysis...
                  </div>
                )}
                {!aiLoading && aiError && (
                  <div className="text-sm text-red-600">{aiError} — set VITE_GEMINI_API_KEY or sessionStorage.GEMINI_API_KEY</div>
                )}
                {!aiLoading && !aiError && chartData && (
                  <div className="space-y-5">
                    <div className="grid md:grid-cols-2 gap-6">
                      {/* Radar */}
                      <div className="bg-blue-50/60 rounded-xl p-4 border border-blue-100 flex items-center justify-center">
                        <div className="w-full flex flex-col items-center">
                          <div className="font-semibold mb-2 self-start">Symptom Severity</div>
                          {(() => {
                            const axes = [
                              { key: 'cough', label: 'Cough' },
                              { key: 'fever', label: 'Fever' },
                              { key: 'sore_throat', label: 'Sore Throat' },
                              { key: 'fatigue', label: 'Fatigue' },
                              { key: 'sore', label: 'Sore' },
                            ];
                            const R = 70; const CX = 120; const CY = 100;
                            const val = (k: string) => Math.max(0, Math.min(100, Number(chartData.symptomScores?.[k]||0)));
                            const pts = axes.map((a,i)=>{ const ang=(Math.PI*2*i)/axes.length - Math.PI/2; const r=(val(a.key)/100)*R; return [CX + r*Math.cos(ang), CY + r*Math.sin(ang)]; });
                            const poly = pts.map((p,i)=>`${i===0?'M':'L'}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(' ')+' Z';
                            return (
                              <svg width="240" height="200" viewBox="0 0 240 200">
                                {[0.25,0.5,0.75,1].map((f,idx)=>{ const r=R*f; const points=axes.map((a,i)=>{ const ang=(Math.PI*2*i)/axes.length - Math.PI/2; return [CX+r*Math.cos(ang), CY+r*Math.sin(ang)]; }); const d=points.map((p,i)=>`${i===0?'M':'L'}${p[0]},${p[1]}`).join(' ')+' Z'; return <path key={idx} d={d} fill="none" stroke="#e5e7eb"/>; })}
                                {axes.map((a,i)=>{ const ang=(Math.PI*2*i)/axes.length - Math.PI/2; const r=R+16; const x=CX+r*Math.cos(ang); const y=CY+r*Math.sin(ang); return <text key={a.key} x={x} y={y} textAnchor="middle" fontSize="12" fill="#111827">{a.label}</text>; })}
                                <path d={poly} fill="#60a5fa55" stroke="#3b82f6" strokeWidth="2" />
                              </svg>
                            );
                          })()}
                        </div>
                      </div>

                      {/* Bars */}
                      <div className="bg-blue-50/60 rounded-xl p-4 border border-blue-100">
                        <div className="font-semibold mb-2">Probable Diagnosis</div>
                        <div className="space-y-6">
                          {chartData.diagnoses.map((d,idx)=>{
                            const barMax=100; const barW=180; const barH=12;
                            return (
                              <div key={idx}>
                                <div className="text-sm mb-1 text-muted-foreground">{d.label}</div>
                                <svg width={barW} height={barH}>
                                  <rect x="0" y="0" width={barW} height={barH} rx="6" fill="#eef2ff" />
                                  <rect x="0" y="0" width={Math.max(0, Math.min(barW, (d.score/barMax)*barW))} height={barH} rx="6" fill="#34d399" />
                                </svg>
                                <div className="text-xs text-muted-foreground">{Math.round(d.score)}%</div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>

                    <div className="bg-white rounded-xl p-4 border border-gray-100">
                      <div className="font-semibold mb-1">AI Summary</div>
                      <div className="text-sm text-gray-800">{chartData.summary || '—'}</div>
                    </div>
                  </div>
                )}
                {!aiLoading && !aiError && !chartData && (
                  <div className="text-sm text-muted-foreground">No analysis yet.</div>
                )}
              </CardContent>
            </Card>

            {/* Diagnosis Card */}
            <Card className="shadow-sm hover:shadow-md transition-shadow duration-200">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg text-gray-800 flex items-center gap-2">
                  <Pill className="w-5 h-5 text-blue-600" />
                  Diagnosis
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  placeholder="Enter patient diagnosis..."
                  value={diagnosis}
                  onChange={(e) => setDiagnosis(e.target.value)}
                  className="min-h-[80px] border-gray-200 focus:border-blue-500 rounded-xl"
                />
              </CardContent>
            </Card>

            {/* Medicines Card */}
            <Card className="shadow-sm hover:shadow-md transition-shadow duration-200">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg text-gray-800 flex items-center gap-2">
                    <Pill className="w-5 h-5 text-blue-600" />
                    Prescribed Medications
                  </CardTitle>
                  <Button
                    onClick={addMedicine}
                    style={{ backgroundColor: '#5B68EE' }}
                    className="hover:opacity-90 rounded-xl px-4 py-2 text-white"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Medicine
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {medicines.map((medicine, index) => (
                  <Card key={medicine.id} className="p-4 border border-gray-200 rounded-xl hover:border-blue-300 transition-colors duration-200">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <Badge variant="outline" className="text-blue-600 border-blue-200">
                          Medicine {index + 1}
                        </Badge>
                        {medicines.length > 1 && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeMedicine(medicine.id)}
                            className="text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor={`medicine-${medicine.id}`} className="text-sm font-medium text-gray-700">
                            Medicine Name
                          </Label>
                          <Input
                            id={`medicine-${medicine.id}`}
                            placeholder="e.g., Paracetamol"
                            value={medicine.medicine}
                            onChange={(e) => updateMedicine(medicine.id, 'medicine', e.target.value)}
                            className="mt-1 border-gray-200 focus:border-blue-500 rounded-lg"
                          />
                        </div>
                        
                        <div>
                          <Label htmlFor={`dosage-${medicine.id}`} className="text-sm font-medium text-gray-700">
                            Dosage
                          </Label>
                          <Input
                            id={`dosage-${medicine.id}`}
                            placeholder="e.g., 500 mg"
                            value={medicine.dosage}
                            onChange={(e) => updateMedicine(medicine.id, 'dosage', e.target.value)}
                            className="mt-1 border-gray-200 focus:border-blue-500 rounded-lg"
                          />
                        </div>
                        
                        <div>
                          <Label htmlFor={`frequency-${medicine.id}`} className="text-sm font-medium text-gray-700">
                            Frequency
                          </Label>
                          <Input
                            id={`frequency-${medicine.id}`}
                            placeholder="e.g., Twice a day, After meals"
                            value={medicine.frequency}
                            onChange={(e) => updateMedicine(medicine.id, 'frequency', e.target.value)}
                            className="mt-1 border-gray-200 focus:border-blue-500 rounded-lg"
                          />
                        </div>
                        
                        <div>
                          <Label htmlFor={`duration-${medicine.id}`} className="text-sm font-medium text-gray-700">
                            Duration
                          </Label>
                          <Input
                            id={`duration-${medicine.id}`}
                            placeholder="e.g., 7 days"
                            value={medicine.duration}
                            onChange={(e) => updateMedicine(medicine.id, 'duration', e.target.value)}
                            className="mt-1 border-gray-200 focus:border-blue-500 rounded-lg"
                          />
                        </div>
                      </div>
                      
                      <div>
                        <Label htmlFor={`notes-${medicine.id}`} className="text-sm font-medium text-gray-700">
                          Additional Notes
                        </Label>
                        <Input
                          id={`notes-${medicine.id}`}
                          placeholder="e.g., Take with food"
                          value={medicine.notes}
                          onChange={(e) => updateMedicine(medicine.id, 'notes', e.target.value)}
                          className="mt-1 border-gray-200 focus:border-blue-500 rounded-lg"
                        />
                      </div>
                    </div>
                  </Card>
                ))}
              </CardContent>
            </Card>

            {/* Instructions */}
            <Card className="shadow-sm hover:shadow-md transition-shadow duration-200">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg text-gray-800 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-blue-600" />
                  Doctor's Instructions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  placeholder="Additional instructions for the patient..."
                  value={instructions}
                  onChange={(e) => setInstructions(e.target.value)}
                  className="min-h-[100px] border-gray-200 focus:border-blue-500 rounded-xl"
                />
              </CardContent>
            </Card>

            {/* Follow-up Scheduling Section */}
            <Card className="shadow-sm hover:shadow-md transition-shadow duration-200">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg text-gray-800 flex items-center gap-2">
                  <CalendarDays className="w-5 h-5 text-blue-600" />
                  Schedule Follow-up Appointment (Optional)
                </CardTitle>
                <p className="text-sm text-gray-600 mt-1">Schedule a follow-up appointment for the patient</p>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Calendar Section */}
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-semibold text-gray-700">Select Date</h4>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
                        >
                          ←
                        </Button>
                        <span className="text-sm font-medium py-1 px-3">
                          {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
                        </span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
                        >
                          →
                        </Button>
                      </div>
                    </div>
                    
                    <div className="border border-gray-200 rounded-lg p-3">
                      <div className="grid grid-cols-7 gap-1 mb-2">
                        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(day => (
                          <div key={day} className="text-center text-xs font-medium text-gray-500 py-2">
                            {day}
                          </div>
                        ))}
                      </div>
                      <div className="grid grid-cols-7 gap-1">
                        {generateCalendarDays().map((day, index) => {
                          const isToday = day.date.toDateString() === new Date().toDateString();
                          const isPast = day.date < new Date();
                          const isSelected = selectedFollowUpDate?.toDateString() === day.date.toDateString();
                          
                          return (
                            <button
                              key={index}
                              onClick={() => day.isCurrentMonth && !isPast && handleFollowUpDateSelect(day.date)}
                              disabled={!day.isCurrentMonth || isPast}
                              className={`
                                aspect-square text-sm rounded-lg transition-all duration-200
                                ${!day.isCurrentMonth ? 'text-gray-300' : ''}
                                ${isPast ? 'text-gray-300 cursor-not-allowed' : ''}
                                ${isToday ? 'bg-blue-100 text-blue-700 font-semibold' : ''}
                                ${isSelected ? 'bg-blue-600 text-white font-semibold' : ''}
                                ${!isSelected && !isPast && day.isCurrentMonth ? 'hover:bg-blue-50' : ''}
                              `}
                            >
                              {day.date.getDate()}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Time and Notes Section */}
                  <div className="space-y-4">
                    {/* Time Selection */}
                    {selectedFollowUpDate && (
                      <div>
                        <h4 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                          <Clock className="w-4 h-4 text-blue-600" />
                          Select Time
                        </h4>
                        <div className="grid grid-cols-3 gap-2">
                          {timeSlots.map(slot => (
                            <Button
                              key={slot}
                              variant={selectedFollowUpTime === slot ? "default" : "outline"}
                              size="sm"
                              onClick={() => setSelectedFollowUpTime(slot)}
                              style={{ 
                                backgroundColor: selectedFollowUpTime === slot ? '#5B68EE' : 'transparent',
                                borderColor: '#5B68EE',
                                color: selectedFollowUpTime === slot ? 'white' : '#5B68EE'
                              }}
                              className="text-xs"
                            >
                              {slot}
                            </Button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Follow-up Notes */}
                    <div>
                      <h4 className="font-semibold text-gray-700 mb-3">Follow-up Notes</h4>
                      <Textarea
                        placeholder="Add specific notes for the follow-up appointment..."
                        value={followUpNotes}
                        onChange={(e) => setFollowUpNotes(e.target.value)}
                        className="min-h-[80px] border-gray-200 focus:border-blue-500 rounded-lg"
                      />
                    </div>

                    {/* Selected Follow-up Summary */}
                    {selectedFollowUpDate && selectedFollowUpTime && (
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                        <h5 className="font-semibold text-blue-800 mb-2 flex items-center gap-2">
                          <CheckCircle className="w-4 h-4" />
                          Follow-up Scheduled
                        </h5>
                        <p className="text-sm text-blue-700">
                          <strong>Date:</strong> {selectedFollowUpDate.toLocaleDateString('en-US', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </p>
                        <p className="text-sm text-blue-700">
                          <strong>Time:</strong> {selectedFollowUpTime}
                        </p>
                        {followUpNotes && (
                          <p className="text-sm text-blue-700 mt-1">
                            <strong>Notes:</strong> {followUpNotes}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Preview Sidebar */}
          <div className="space-y-6">
            <Card className="shadow-sm hover:shadow-md transition-shadow duration-200">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg text-gray-800 flex items-center gap-2">
                  <Eye className="w-5 h-5 text-blue-600" />
                  Prescription Preview
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-blue-50 p-4 rounded-xl border border-blue-200">
                  <h3 className="font-semibold text-blue-800 mb-2">Patient Information</h3>
                  <p className="text-sm text-blue-700">
                    <strong>Name:</strong> {appointment.patientName}<br />
                    <strong>Date:</strong> {new Date().toLocaleDateString()}<br />
                    <strong>Doctor:</strong> {appointment.doctorName}
                  </p>
                </div>

                {diagnosis && (
                  <div className="bg-gray-50 p-4 rounded-xl">
                    <h4 className="font-semibold text-gray-800 mb-2">Diagnosis</h4>
                    <p className="text-sm text-gray-700">{diagnosis}</p>
                  </div>
                )}

                <div className="space-y-2">
                  <h4 className="font-semibold text-gray-800">Medications</h4>
                  {medicines.filter(med => med.medicine.trim()).map((med, index) => (
                    <div key={med.id} className="bg-white p-3 rounded-lg border border-gray-200">
                      <p className="text-sm font-medium text-gray-800">
                        {index + 1}. {med.medicine}
                      </p>
                      <p className="text-xs text-gray-600">
                        {med.dosage} • {med.frequency}
                        {med.duration && ` for ${med.duration}`}
                      </p>
                      {med.notes && (
                        <p className="text-xs text-blue-600 mt-1">Note: {med.notes}</p>
                      )}
                    </div>
                  ))}
                </div>

                {instructions && (
                  <div className="bg-yellow-50 p-4 rounded-xl border border-yellow-200">
                    <h4 className="font-semibold text-yellow-800 mb-2">Instructions</h4>
                    <p className="text-sm text-yellow-700">{instructions}</p>
                  </div>
                )}

                {followUpNotes && (
                  <div className="bg-green-50 p-4 rounded-xl border border-green-200">
                    <h4 className="font-semibold text-green-800 mb-2">Follow-up Notes</h4>
                    <p className="text-sm text-green-700">{followUpNotes}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <Card className="shadow-sm">
              <CardContent className="p-4 space-y-3">
                <Button
                  onClick={printPrescription}
                  variant="outline"
                  style={{ borderColor: '#5B68EE', color: '#5B68EE' }}
                  className="w-full hover:opacity-80 rounded-xl"
                  disabled={!medicines.some(med => med.medicine.trim())}
                >
                  <Printer className="w-4 h-4 mr-2" />
                  Print Preview
                </Button>
                
                <Button
                  onClick={savePrescriptionData}
                  style={{ backgroundColor: '#5B68EE' }}
                  className="w-full hover:opacity-90 rounded-xl text-white"
                  disabled={isSaving || !medicines.some(med => med.medicine.trim())}
                >
                  {isSaving ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Save & Complete
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrescriptionManagement;