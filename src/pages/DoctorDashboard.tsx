import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import { useNavigate } from "react-router-dom";
import { addPrescription, ensureChatThread, updateAppointment, getAppointments, clearAllMedicalData, addFollowUp, getReviewsByDoctor } from "@/lib/storage";
import { toast } from "sonner";
import { Bell, HelpCircle, Settings, LayoutDashboard, Calendar, Users, MessageSquare, Pill, LogOut, User, FileText, Heart, Phone, MessageCircle, Check, X, Menu, ChevronLeft, ChevronRight, Scan, Stethoscope, CheckCircle2, Star } from "lucide-react";
import DoctorWeekCalendar from "@/components/DoctorWeekCalendar";

const DoctorDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [doctorProfile, setDoctorProfile] = useState<{ id: string; name: string; specialty: string } | null>(null);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [todayAppointments, setTodayAppointments] = useState<any[]>([]);
  const acceptedAppointments = appointments.filter(a => a.accepted && a.status !== 'cancelled');
  const [reviews, setReviews] = useState<any[]>([]);
  // Reviews filters
  const [revDate, setRevDate] = useState<string>("");
  const [revMinRating, setRevMinRating] = useState<string>("all"); // 'all' | '1'..'5'
  const [revType, setRevType] = useState<'all'|'checkup'|'consultation'|'followup'|'procedure'>("all");
  const [stats, setStats] = useState([
    { label: "Patients", value: 0, icon: Users, color: "bg-purple-500" },
    { label: "Records", value: 0, icon: FileText, color: "bg-blue-500" },
    { label: "Appointments", value: 0, icon: Calendar, color: "bg-green-500" },
    { label: "Treatments", value: 0, icon: Heart, color: "bg-red-500" },
  ]);

  // Patients tab state
  const [query, setQuery] = useState("");
  const [filterDate, setFilterDate] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<'all' | 'upcoming' | 'completed' | 'cancelled'>('all');
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [rxOpenFor, setRxOpenFor] = useState<{ patientPhone: string; aptId?: string } | null>(null);
  const [rxForm, setRxForm] = useState({ medicine: "", dosage: "", duration: "", notes: "" });

  // Next patient (today + accepted + upcoming by time)
  const timeToMinutes = (t: string) => {
    const m = /^(\d{1,2}):(\d{2})\s*(AM|PM)$/i.exec(t || '');
    if (!m) return 24*60;
    let h = parseInt(m[1],10);
    const min = parseInt(m[2],10);
    const ampm = m[3].toUpperCase();
    if (ampm === 'PM' && h !== 12) h += 12;
    if (ampm === 'AM' && h === 12) h = 0;
    return h*60 + min;
  };
  const sortedToday = [...todayAppointments].sort((a,b)=> timeToMinutes(a.time) - timeToMinutes(b.time));
  // Robust: build full local Date for each appointment today and pick the nearest future one
  const parseTime = (t: string) => {
    const m = /^(\d{1,2}):(\d{2})\s*(AM|PM)$/i.exec(t || '');
    if (!m) return { h: 23, m: 59 };
    let h = parseInt(m[1],10);
    const min = parseInt(m[2],10);
    const ampm = m[3].toUpperCase();
    if (ampm === 'PM' && h !== 12) h += 12;
    if (ampm === 'AM' && h === 12) h = 0;
    return { h, m: min };
  };
  const now = new Date();
  const futureToday = sortedToday
    .map(a => {
      const d = new Date(a.date);
      const { h, m } = parseTime(a.time);
      const dt = new Date(d.getFullYear(), d.getMonth(), d.getDate(), h, m, 0);
      return { a, ts: dt.getTime() };
    })
    .filter(x => x.ts >= now.getTime())
    .sort((x,y) => x.ts - y.ts);
  const nextApt = futureToday.length ? futureToday[0].a : null;
  const nextPatient = nextApt ? {
    name: nextApt.patientName,
    address: "",
    dob: nextApt.patientDob || "",
    sex: nextApt.patientGender || "",
    weight: nextApt.patientWeightKg ? `${nextApt.patientWeightKg} kg` : "",
    height: nextApt.patientHeightCm ? `${nextApt.patientHeightCm} cm` : "",
    lastAppointment: "",
    registerDate: nextApt.registerDate ? new Date(nextApt.registerDate).toLocaleDateString() : "",
    phone: nextApt.patientPhone || "",
    conditions: (nextApt.medicalConditions || []).map(c => ({ name: c, color: 'bg-secondary' })),
  } : null;

  const menuItems = [
    { icon: LayoutDashboard, label: "Dashboard", value: "dashboard" },
    { icon: Calendar, label: "Schedule", value: "schedule" },
    { icon: Users, label: "Patients", value: "patients" },
    { icon: MessageSquare, label: "Messages", value: "messages" },
    { icon: Star, label: "Reviews", value: "reviews" },
    { icon: Scan, label: "Body View", value: "bodyview" },
  ];

  // Derived helpers (Schedule)
  const [scheduleQuery, setScheduleQuery] = useState("");
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [viewMode, setViewMode] = useState<"day" | "week">("day");
  const [isLoading, setIsLoading] = useState(false);

  // simulate loading when view or date changes
  useEffect(() => {
    setIsLoading(true);
    const t = setTimeout(() => setIsLoading(false), 300);
    return () => clearTimeout(t);
  }, [selectedDate, viewMode, scheduleQuery]);

  // helpers
  const formatTime = (h: number, m: number) => {
    const ampm = h >= 12 ? "PM" : "AM";
    const hh = ((h + 11) % 12) + 1; // 0->12, 13->1
    const mm = m.toString().padStart(2, "0");
    return `${String(hh).padStart(2, '0')}:${mm} ${ampm}`;
  };
  const TIME_SLOTS = Array.from({ length: ((18 - 8) * 60) / 30 + 1 }, (_, i) => {
    const minutes = 8 * 60 + i * 30;
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return { h, m, label: formatTime(h, m) };
  });

  // Compare dates properly handling UTC stored dates
  const sameDay = (dateStr: string, compareDate: Date) => {
    // Parse the appointment date (stored as ISO UTC string) and get local date
    const aptDateObj = new Date(dateStr);
    const aptLocal = `${aptDateObj.getFullYear()}-${String(aptDateObj.getMonth()+1).padStart(2,'0')}-${String(aptDateObj.getDate()).padStart(2,'0')}`;
    // Get local date from compareDate
    const cmpLocal = `${compareDate.getFullYear()}-${String(compareDate.getMonth()+1).padStart(2,'0')}-${String(compareDate.getDate()).padStart(2,'0')}`;
    return aptLocal === cmpLocal;
  };

  const typeOfApt = (text: string | undefined): "checkup" | "consultation" | "followup" | "procedure" => {
    const t = (text || "").toLowerCase();
    if (t.includes("follow")) return "followup";
    if (t.includes("check")) return "checkup";
    if (t.includes("procedure") || t.includes("surgery")) return "procedure";
    return "consultation";
  };
  const typeColor = (t: string) =>
    ({
      checkup: "bg-blue-100 text-blue-700",
      consultation: "bg-green-100 text-green-700",
      followup: "bg-orange-100 text-orange-700",
      procedure: "bg-purple-100 text-purple-700",
    } as any)[t] || "bg-secondary text-foreground";

  const statusColor = (s: 'upcoming'|'completed'|'cancelled') => (
    s === 'upcoming' ? 'bg-blue-100 text-blue-700' : s === 'completed' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
  );
  const statusText = (s: 'upcoming'|'completed'|'cancelled') => (
    s === 'completed' ? 'Consulted' : s === 'upcoming' ? 'Consultation' : 'Cancelled'
  );

  // filtering
  const filteredAppointments = acceptedAppointments.filter((a) => {
    const matchesName = scheduleQuery
      ? (a.patientName || "").toLowerCase().includes(scheduleQuery.toLowerCase())
      : true;
    const matchesDate = sameDay(a.date, selectedDate);
    return matchesName && (viewMode === "day" ? matchesDate : true);
  });

  const uniquePatients = Array.from(
    new Map(
      appointments
        .filter((a) => a.status === 'completed' && typeOfApt(a.symptoms) === 'checkup')
        .map((a) => [a.patientPhone, { name: a.patientName, phone: a.patientPhone, lastVisit: a.date }])
    ).values()
  );

  const handleLogout = () => {
    try {
      sessionStorage.removeItem("userRole");
      sessionStorage.removeItem("isAuthenticated");
      sessionStorage.removeItem("doctorProfile");
    } catch {}
    navigate("/login");
  };

  useEffect(() => {
    const load = () => {
      const raw = sessionStorage.getItem('doctorProfile') || localStorage.getItem('doctorProfile');
      let profile = raw ? JSON.parse(raw) : null;
      const allApts = getAppointments();
      if (!profile) {
        if (allApts.length > 0) {
          profile = { id: allApts[0].doctorId, name: allApts[0].doctorName, specialty: allApts[0].doctorSpecialty };
          sessionStorage.setItem('doctorProfile', JSON.stringify(profile));
        } else {
          profile = { id: 'unknown', name: 'Doctor', specialty: '' };
        }
      }
      // If profile exists but is unknown and we now have appointments, fix it
      if (profile.id === 'unknown' && allApts.length > 0) {
        profile = { id: allApts[0].doctorId, name: allApts[0].doctorName, specialty: allApts[0].doctorSpecialty };
        sessionStorage.setItem('doctorProfile', JSON.stringify(profile));
      }
      setDoctorProfile(profile);
      const filtered = profile.id === 'unknown' ? [] : allApts.filter((a: any) => a.doctorId === profile.id);
      setAppointments(filtered);
      const todays = filtered.filter((a: any) => sameDay(a.date, new Date()) && a.status === 'upcoming' && a.accepted);
      setTodayAppointments(todays);
      // Load reviews for this doctor and enrich with appointment type
      let revs = profile.id === 'unknown' ? [] : getReviewsByDoctor(profile.id);
      try {
        const byId: Record<string, any> = {};
        allApts.forEach((a:any)=> byId[a.id] = a);
        revs = revs.map((r:any)=>{
          const apt = r.appointmentId ? byId[r.appointmentId] : undefined;
          const t = apt ? typeOfApt(apt.symptoms) : 'consultation';
          return { ...r, aptType: t };
        });
      } catch {}
      setReviews(revs.sort((a:any,b:any)=> new Date(b.createdAt||b.appointmentDate||0).getTime() - new Date(a.createdAt||a.appointmentDate||0).getTime()));
      const totalPatients = new Set(filtered.map(a => a.patientPhone)).size;
      const totalAppointments = filtered.length;
      const completed = filtered.filter(a => a.status === 'completed').length;
      setStats([
        { label: "Patients", value: totalPatients, icon: Users, color: "bg-purple-500" },
        { label: "Records", value: completed, icon: FileText, color: "bg-blue-500" },
        { label: "Appointments", value: totalAppointments, icon: Calendar, color: "bg-green-500" },
        { label: "Treatments", value: completed, icon: Heart, color: "bg-red-500" },
      ]);
    };
    load();
    const handler = () => load();
    window.addEventListener('appointments:updated', handler);
    window.addEventListener('reviews:updated', handler);
    return () => {
      window.removeEventListener('appointments:updated', handler);
      window.removeEventListener('reviews:updated', handler);
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-medical flex">
      {/* Sidebar */}
      <aside className={`bg-card shadow-soft p-6 flex flex-col transition-all duration-300 ${
        sidebarOpen ? 'w-72' : 'w-20'
      }`}>
        {/* Doctor Profile */}
        <div className={`mb-8 transition-all duration-300 ${
          sidebarOpen ? 'text-center' : 'text-center'
        }`}>
          <div className={`rounded-full bg-gradient-card mx-auto mb-4 flex items-center justify-center transition-all duration-300 ${
            sidebarOpen ? 'w-24 h-24' : 'w-12 h-12'
          }`}>
            <User className={`text-primary transition-all duration-300 ${
              sidebarOpen ? 'w-12 h-12' : 'w-6 h-6'
            }`} />
          </div>
          {sidebarOpen && (
            <>
              <h2 className="text-xl font-bold text-foreground">{doctorProfile?.name || 'Doctor'}</h2>
              <p className="text-sm text-muted-foreground">{doctorProfile?.specialty || ''}</p>
            </>
          )}
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 space-y-2">
          {menuItems.map((item) => (
            <button
              key={item.value}
              onClick={() => {
                if (item.value === 'bodyview') {
                  navigate('/doctor/body-view');
                } else if (item.value === 'messages') {
                  navigate('/doctor/messages');
                } else {
                  setActiveTab(item.value);
                }
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                (activeTab === item.value && item.value !== 'bodyview' && item.value !== 'messages')
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:bg-secondary"
              } ${!sidebarOpen ? 'justify-center' : ''}`}
              title={!sidebarOpen ? item.label : ''}
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              {sidebarOpen && <span className="font-medium">{item.label}</span>}
            </button>
          ))}
        </nav>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-red-500 text-white hover:bg-red-600 transition-all mt-4 ${
            !sidebarOpen ? 'justify-center' : ''
          }`}
          title={!sidebarOpen ? 'Logout' : ''}
        >
          <LogOut className="w-5 h-5 flex-shrink-0" />
          {sidebarOpen && <span className="font-medium">Logout</span>}
        </button>
      </aside>

      {/* Main Content */}
      <div className="flex-1 overflow-auto flex flex-col">
        <header className="bg-card shadow-soft px-8 py-6 sticky top-0 z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-2 rounded-xl hover:bg-secondary transition-all"
                title={sidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
              >
                {sidebarOpen ? (
                  <ChevronLeft className="w-6 h-6 text-foreground" />
                ) : (
                  <Menu className="w-6 h-6 text-foreground" />
                )}
              </button>
              <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
            </div>
            <div className="flex items-center gap-4">
              <button className="relative p-2 rounded-xl hover:bg-secondary transition-all">
                <Bell className="w-6 h-6 text-foreground" />
                <span className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                  3
                </span>
              </button>
              <button className="flex items-center gap-2 p-2 px-4 rounded-xl hover:bg-secondary transition-all">
                <HelpCircle className="w-6 h-6 text-foreground" />
                <span className="text-foreground font-medium">Help</span>
              </button>
              <button className="flex items-center gap-2 p-2 px-4 rounded-xl hover:bg-secondary transition-all">
                <Settings className="w-6 h-6 text-foreground" />
                <span className="text-foreground font-medium">Setting</span>
              </button>
            </div>
          </div>
        </header>

        <div className="p-8 flex-1">
          {activeTab === "dashboard" && (
            <>
              {/* Statistics Cards */}
              <div className="grid grid-cols-4 gap-6 mb-8">
                {stats.map((stat, index) => (
                  <div
                    key={index}
                    className="bg-card rounded-2xl shadow-card p-6 animate-scale-in"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={`w-14 h-14 ${stat.color} rounded-xl flex items-center justify-center`}
                      >
                        <stat.icon className="w-7 h-7 text-white" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">{stat.label}</p>
                        <p className="text-3xl font-bold text-foreground">{stat.value}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-3 gap-6">
                {/* Today Appointments */}
                <div className="col-span-2 space-y-6">
              <div className="bg-card rounded-2xl shadow-card p-6">
                <h2 className="text-xl font-bold text-foreground mb-4">
                  Today Appointment
                </h2>
                <div className="space-y-3">
                  {todayAppointments.map((appointment) => (
                    <div
                      key={appointment.id}
                      className="flex items-center justify-between p-4 bg-secondary rounded-xl hover:shadow-sm transition-all"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-gradient-card flex items-center justify-center">
                          <User className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-foreground">
                            {appointment.patientName}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {appointment.symptoms || 'Consultation'}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        {appointment.status === "ongoing" ? (
                          <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                            On Going
                          </span>
                        ) : (
                          <span className="text-sm text-muted-foreground">
                            {appointment.time}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Appointment Requests */}
              <div className="bg-card rounded-2xl shadow-card p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-foreground">
                    Appointment Requests
                  </h2>
                  <Button variant="link" className="text-primary">
                    See All
                  </Button>
                </div>
                <div className="space-y-3">
                  {appointments.filter(a => a.status === 'upcoming' && !a.accepted && new Date(a.date) >= new Date(new Date().toDateString())).map((req) => (
                    <div
                      key={req.id}
                      className="flex items-center justify-between p-4 bg-secondary rounded-xl"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-gradient-card flex items-center justify-center">
                          <User className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-foreground">
                            {req.patientName}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {(req.symptoms || 'Consultation')} • {new Date(req.date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}, {req.time}
                          </p>
                        </div>
                      </div>
                      {true ? (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => updateAppointment(req.id, { accepted: true })}
                            className="p-2 rounded-lg bg-green-100 text-green-700 hover:bg-green-200 transition-all"
                            title="Accept"
                          >
                            <Check className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => updateAppointment(req.id, { status: 'cancelled' })}
                            className="p-2 rounded-lg bg-red-100 text-red-700 hover:bg-red-200 transition-all"
                            title="Reject"
                          >
                            <X className="w-5 h-5" />
                          </button>
                        </div>
                      ) : (
                        <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                          Accepted
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Next Patient Details */}
            <div className="bg-card rounded-2xl shadow-card p-6">
              <h2 className="text-xl font-bold text-foreground mb-4">
                Next Patient Details
              </h2>

              {!nextPatient ? (
                <div className="text-center text-muted-foreground py-12">No next patient today</div>
              ) : (
                <>
                  {/* Patient Photo */}
                  <div className="flex justify-center mb-4">
                    <div className="w-24 h-24 rounded-full bg-gradient-card flex items-center justify-center">
                      <User className="w-12 h-12 text-primary" />
                    </div>
                  </div>

                  {/* Patient Name */}
                  <h3 className="text-xl font-bold text-center text-foreground mb-2">
                    {nextPatient.name}
                  </h3>
                  <p className="text-sm text-center text-muted-foreground mb-6">
                    {nextPatient.address}
                  </p>

                  {/* Patient Information Grid */}
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div>
                      <p className="text-xs text-muted-foreground">D.O.B</p>
                      <p className="text-sm font-medium text-foreground">
                        {nextPatient.dob}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Sex</p>
                      <p className="text-sm font-medium text-foreground">
                        {nextPatient.sex}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Weight</p>
                      <p className="text-sm font-medium text-foreground">
                        {nextPatient.weight}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Height</p>
                      <p className="text-sm font-medium text-foreground">
                        {nextPatient.height}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Last Appointment</p>
                      <p className="text-sm font-medium text-foreground">
                        {nextPatient.lastAppointment}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Register Date</p>
                      <p className="text-sm font-medium text-foreground">
                        {nextPatient.registerDate}
                      </p>
                    </div>
                  </div>

                  {/* Medical Conditions */}
                  <div className="mb-6">
                    <p className="text-xs text-muted-foreground mb-2">Medical Conditions</p>
                    <div className="flex flex-wrap gap-2">
                      {nextPatient.conditions.map((condition, index) => (
                        <span
                          key={index}
                          className={`px-3 py-1 rounded-full text-xs font-medium ${condition.color}`}
                        >
                          {condition.name}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="space-y-3">
                    <Button className="w-full rounded-xl" size="lg">
                      <Phone className="w-4 h-4 mr-2" />
                      {nextPatient.phone}
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full rounded-xl"
                      size="lg"
                    >
                      <FileText className="w-4 h-4 mr-2" />
                      Documents
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full rounded-xl"
                      size="lg"
                      onClick={()=> navigate('/doctor/messages')}
                    >
                      <MessageCircle className="w-4 h-4 mr-2" />
                      Chat
                    </Button>
                  </div>
                </>
              )}
            </div>
          </div>
            </>
          )}

          {activeTab === "schedule" && (
            <div className="space-y-6">
              <div className="bg-card rounded-2xl shadow-card p-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold">Schedule</h2>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" onClick={() => { clearAllMedicalData(); toast.success('Cleared appointments, chats, records, follow-ups, and reviews'); }}>Clear Data</Button>
                    <Button variant="outline" onClick={() => setSelectedDate(new Date())} className="bg-[#5B68EE] hover:bg-[#4A56DD] text-white">Today</Button>
                    <Button variant="outline" size="icon" onClick={() => setSelectedDate(new Date(new Date(selectedDate).setDate(selectedDate.getDate()-1)))}><ChevronLeft className="w-4 h-4"/></Button>
                    <Button variant="outline" size="icon" onClick={() => setSelectedDate(new Date(new Date(selectedDate).setDate(selectedDate.getDate()+1)))}><ChevronRight className="w-4 h-4"/></Button>
                    <Button variant={viewMode === 'day' ? 'default' : 'outline'} onClick={() => setViewMode('day')} className={viewMode==='day'? 'bg-[#5B68EE] hover:bg-[#4A56DD]':''}>Day</Button>
                    <Button variant={viewMode === 'week' ? 'default' : 'outline'} onClick={() => setViewMode('week')} className={viewMode==='week'? 'bg-[#5B68EE] hover:bg-[#4A56DD]':''}>Week</Button>
                  </div>
                </div>
                {/* Filters */}
                <div className="grid grid-cols-3 gap-3 mb-4">
                  <Input placeholder="Search patient..." value={scheduleQuery} onChange={(e) => setScheduleQuery(e.target.value)} />
                  <Input type="date" value={`${selectedDate.getFullYear()}-${String(selectedDate.getMonth()+1).padStart(2,'0')}-${String(selectedDate.getDate()).padStart(2,'0')}`} onChange={(e) => {
                    // Parse date as local date to avoid timezone shift
                    const [y, m, d] = e.target.value.split('-').map(Number);
                    setSelectedDate(new Date(y, m - 1, d, 12, 0, 0));
                  }} />
                  <div className="text-xs text-muted-foreground flex items-center gap-3">
                    <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-700">Consultation</span>
                    <span className="px-2 py-0.5 rounded bg-green-100 text-green-700">Consulted</span>
                    <span className="px-2 py-0.5 rounded bg-red-100 text-red-700">Cancelled</span>
                  </div>
                </div>

                {isLoading ? (
                  <div className="text-center text-muted-foreground py-12">Loading schedule…</div>
                ) : scheduleQuery.trim() ? (
                  <div className="space-y-2">
                    {appointments
                      .filter(a => (!doctorProfile || a.doctorId === doctorProfile.id))
                      .filter(a => a.status !== 'cancelled' && (a.accepted || a.status === 'completed'))
                      .filter(a => (a.patientName || '').toLowerCase().includes(scheduleQuery.toLowerCase()))
                      .sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                      .map((a) => {
                        const s = a.status as 'upcoming' | 'completed' | 'cancelled';
                        return (
                          <div key={a.id} className="p-3 bg-secondary rounded-xl flex items-center justify-between">
                            <div>
                              <div className="font-semibold">{a.patientName}</div>
                              <div className="text-sm text-muted-foreground">{new Date(a.date).toLocaleDateString('en-IN', { month:'short', day:'numeric' })} • {a.time}</div>
                            </div>
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColor(s)}`}>{statusText(s)}</span>
                          </div>
                        );
                      })}
                    {appointments.filter(a => (!doctorProfile || a.doctorId === doctorProfile.id)).filter(a => a.status !== 'cancelled' && (a.accepted || a.status === 'completed')).filter(a => (a.patientName || '').toLowerCase().includes(scheduleQuery.toLowerCase())).length === 0 && (
                      <div className="text-center text-muted-foreground py-8">No matches found</div>
                    )}
                  </div>
                ) : viewMode === 'day' ? (
                  <div className="space-y-2">
                    {TIME_SLOTS.map((slot, idx) => {
                      const itemsDay = appointments.filter(a => (!doctorProfile || a.doctorId === doctorProfile.id) && a.status !== 'cancelled' && (a.accepted || a.status === 'completed') && sameDay(a.date, selectedDate));
                      const current = itemsDay.find(a => (a.time || '') === slot.label);
                      const nextSlot = TIME_SLOTS[Math.min(idx+1, TIME_SLOTS.length-1)];
                      if (current) {
                        const s = current.status as 'upcoming'|'completed'|'cancelled';
                        return (
                          <div key={slot.label} className="p-3 bg-secondary rounded-xl flex items-center justify-between">
                            <div>
                              <div className="font-semibold">{current.patientName}</div>
                              <div className="text-sm text-muted-foreground">{slot.label} - {nextSlot.label} • 30 minutes</div>
                            </div>
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColor(s)}`}>{statusText(s)}</span>
                          </div>
                        );
                      }
                      return (
                        <div key={slot.label} className="p-3 bg-card/50 rounded-xl text-sm text-muted-foreground">
                          {slot.label} • No appointments scheduled
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="overflow-hidden">
                    <DoctorWeekCalendar doctorId={doctorProfile?.id || null} />
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === "patients" && (
            <div className="space-y-4">
              {/* Search & Filters */}
              <div className="bg-card rounded-2xl shadow-card p-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                  <Input placeholder="Search by name or phone" value={query} onChange={(e) => setQuery(e.target.value)} />
                  <Input type="date" value={filterDate} onChange={(e) => setFilterDate(e.target.value)} />
                  <Select value={statusFilter} onValueChange={(v: any) => setStatusFilter(v)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All</SelectItem>
                      <SelectItem value="upcoming">Upcoming</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                  <div />
                </div>
              </div>

              {/* Patients List */}
              <div className="bg-card rounded-2xl shadow-card p-6">
                <h2 className="text-xl font-bold mb-4">Patient Overview</h2>
                <div className="space-y-3">
                  {(() => {
                    // Build rows as appointments (no dedup by phone) and use local date comparisons
                    const toLocalDate = (iso: string) => {
                      const d = new Date(iso);
                      return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
                    };
                    const rows = appointments
                      .filter(a => (!doctorProfile || a.doctorId === doctorProfile.id))
                      .filter(a => a.status !== 'cancelled' && (a.accepted || a.status === 'completed'))
                      .filter(a => {
                        if (!query) return true;
                        const q = query.toLowerCase();
                        return (a.patientName||'').toLowerCase().includes(q) || (a.patientPhone||'').toLowerCase().includes(q);
                      })
                      .filter(a => (filterDate ? toLocalDate(a.date) === filterDate : true))
                      .filter(a => (statusFilter !== 'all' ? a.status === statusFilter : true))
                      .sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime());
                    return rows.length > 0 ? rows.map((p: any) => {
                      const status = p.status as 'upcoming'|'completed'|'cancelled';
                      const color = status === 'upcoming' ? 'bg-blue-100 text-blue-700' : status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700';
                      const age = p.patientDob ? Math.floor((Date.now() - new Date(p.patientDob).getTime()) / (365.25*24*3600*1000)) : null;
                      return (
                        <div key={p.id} className="p-4 bg-secondary rounded-xl flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full bg-gradient-card flex items-center justify-center">
                              <User className="w-6 h-6 text-primary" />
                            </div>
                            <div>
                              <div className="font-semibold">{p.patientName} <span className="text-sm text-muted-foreground">• {p.patientPhone}</span></div>
                              <div className="text-sm text-muted-foreground">{new Date(p.date).toLocaleDateString('en-IN',{month:'short',day:'numeric'})}, {p.time}</div>
                              <div className="text-xs text-muted-foreground">{age !== null ? `Age: ${Math.max(age,0)}` : 'Age: -'} • Gender: -</div>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <Badge className={color} variant="secondary">{status}</Badge>
                            <Button className="bg-[#5B68EE] hover:bg-[#4A56DD]" size="sm" onClick={() => navigate(`/doctor/patient/${p.patientPhone}`)}>
                              <Stethoscope className="w-4 h-4 mr-1"/> View Record
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => { if (doctorProfile) { ensureChatThread(doctorProfile.id, p.patientPhone); navigate(`/doctor/messages/${p.patientPhone}`); }}}>
                              <MessageCircle className="w-4 h-4 mr-1"/> Chat
                            </Button>
                            {status !== 'completed' && (
                              <Button variant="outline" size="sm" onClick={() => setConfirmId(p.id)}>
                                <CheckCircle2 className="w-4 h-4 mr-1"/> Mark Completed
                              </Button>
                            )}
                            <Button variant="outline" size="sm" onClick={() => navigate(`/doctor/prescription/${p.id}`)}>
                              <Pill className="w-4 h-4 mr-1"/> Add Details
                            </Button>
                          </div>
                        </div>
                      );
                    }) : (
                      <div className="text-center text-muted-foreground py-8">No patients found</div>
                    );
                  })()}
                </div>
              </div>

              {/* Confirm complete */}
              <AlertDialog open={!!confirmId} onOpenChange={(o) => !o && setConfirmId(null)}>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Mark appointment as completed?</AlertDialogTitle>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      className="bg-[#5B68EE] hover:bg-[#4A56DD]"
                      onClick={() => {
                        if (confirmId) {
                          updateAppointment(confirmId, { status: 'completed', accepted: true });
                          toast.success('Appointment marked completed');
                          setConfirmId(null);
                        }
                      }}
                    >
                      Confirm
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>

              {/* Add Prescription */}
              <Dialog open={!!rxOpenFor} onOpenChange={(o) => !o && setRxOpenFor(null)}>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>Add Details</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="grid grid-cols-3 gap-3 items-center">
                      <Label className="col-span-1">Diagnosis</Label>
                      <Input className="col-span-2" value={(rxForm as any).diagnosis || ""} onChange={(e) => setRxForm({ ...rxForm, diagnosis: e.target.value } as any)} />
                    </div>
                    <div className="grid grid-cols-3 gap-3 items-center">
                      <Label className="col-span-1">Prescribed Medication</Label>
                      <div className="col-span-2 grid grid-cols-3 gap-2">
                        <Input placeholder="Medicine" value={rxForm.medicine} onChange={(e) => setRxForm({ ...rxForm, medicine: e.target.value })} />
                        <Input placeholder="Dosage" value={rxForm.dosage} onChange={(e) => setRxForm({ ...rxForm, dosage: e.target.value })} />
                        <Input placeholder="Duration" value={rxForm.duration} onChange={(e) => setRxForm({ ...rxForm, duration: e.target.value })} />
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-3 items-center">
                      <Label className="col-span-1">Doctor's Instructions</Label>
                      <Input className="col-span-2" value={(rxForm as any).instructions || ""} onChange={(e) => setRxForm({ ...rxForm, instructions: e.target.value } as any)} />
                    </div>
                    <div className="grid grid-cols-3 gap-3 items-center">
                      <Label className="col-span-1">Follow-up</Label>
                      <Input className="col-span-2" value={(rxForm as any).followUp || ""} onChange={(e) => setRxForm({ ...rxForm, followUp: e.target.value } as any)} />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setRxOpenFor(null)}>Cancel</Button>
                    <Button className="bg-[#5B68EE] hover:bg-[#4A56DD]" onClick={() => {
                      if (!rxOpenFor || !doctorProfile) return;
                      if (!rxForm.medicine || !rxForm.dosage || !rxForm.duration) { toast.error('Fill medication fields'); return; }
                      // Find patient name from appointment or recent matching
                      const allApts = getAppointments();
                      const apt = rxOpenFor.aptId ? allApts.find(a => a.id === rxOpenFor.aptId) : allApts.find(a => a.patientPhone === rxOpenFor.patientPhone && a.doctorId === doctorProfile.id);
                      const patientName = apt?.patientName || '';
                      addPrescription({ doctorId: doctorProfile.id, patientPhone: rxOpenFor.patientPhone, patientName, appointmentId: rxOpenFor.aptId, items: [{ medicine: rxForm.medicine, dosage: rxForm.dosage, duration: rxForm.duration, notes: rxForm.notes }], diagnosis: (rxForm as any).diagnosis, instructions: (rxForm as any).instructions, followUp: (rxForm as any).followUp });
                      // If a follow-up note was provided, also create a follow-up entry for the patient dashboard
                      if ((rxForm as any).followUp) {
                        const defaultDate = new Date();
                        defaultDate.setDate(defaultDate.getDate() + 7); // default: 1 week later
                        const followUpPayload = {
                          patientId: (rxOpenFor.patientPhone || '').replace(/\D/g, ''),
                          patientName,
                          doctorId: doctorProfile.id,
                          doctorName: doctorProfile.name,
                          doctorSpecialty: doctorProfile.specialty || '',
                          date: defaultDate.toISOString(),
                          time: '10:00',
                          notes: (rxForm as any).followUp,
                          status: 'scheduled' as const,
                        };
                        addFollowUp(followUpPayload);
                        toast.success('Follow-up scheduled in patient view');
                      }
                      toast.success('Details saved');
                      setRxForm({ medicine: "", dosage: "", duration: "", notes: "" });
                      setRxOpenFor(null);
                    }}>Save</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          )}

          {activeTab === "messages" && (
            <div className="bg-card rounded-2xl shadow-card p-6 text-muted-foreground">
              <h2 className="text-xl font-bold mb-2 text-foreground">Messages</h2>
              <p>Chat center placeholder. Integrate realtime later.</p>
            </div>
          )}

          {activeTab === "reviews" && (
            <div className="space-y-4">
              <div className="bg-card rounded-2xl shadow-card p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-foreground">Reviews</h2>
                  <div className="text-sm text-muted-foreground">
                    {reviews.length} review{reviews.length!==1?'s':''}
                  </div>
                </div>

                {/* Filters */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-6">
                  <Input type="date" value={revDate} onChange={(e)=>setRevDate(e.target.value)} placeholder="Date" />
                  <Select value={revMinRating} onValueChange={(v)=>setRevMinRating(v)}>
                    <SelectTrigger><SelectValue placeholder="Min rating" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All ratings</SelectItem>
                      <SelectItem value="1">1+</SelectItem>
                      <SelectItem value="2">2+</SelectItem>
                      <SelectItem value="3">3+</SelectItem>
                      <SelectItem value="4">4+</SelectItem>
                      <SelectItem value="5">5</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={revType} onValueChange={(v:any)=>setRevType(v)}>
                    <SelectTrigger><SelectValue placeholder="Appointment type" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All types</SelectItem>
                      <SelectItem value="consultation">Consultation</SelectItem>
                      <SelectItem value="checkup">Check-up</SelectItem>
                      <SelectItem value="followup">Follow-up</SelectItem>
                      <SelectItem value="procedure">Procedure</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button variant="outline" onClick={()=>{ setRevDate(''); setRevMinRating('all'); setRevType('all'); }}>Clear</Button>
                </div>

                {/* Summary + analytics */}
                {(() => {
                  if (!reviews.length) return <div className="text-muted-foreground">No reviews yet.</div>;
                  const avg = (reviews.reduce((s:any,r:any)=> s + (Number(r.rating)||0), 0) / reviews.length).toFixed(1);
                  // Build filtered list
                  const minR = revMinRating === 'all' ? 0 : Number(revMinRating);
                  const filtered = reviews.filter((r:any)=>{
                    const ts = new Date(r.appointmentDate || r.createdAt);
                    const d = `${ts.getFullYear()}-${String(ts.getMonth()+1).padStart(2,'0')}-${String(ts.getDate()).padStart(2,'0')}`;
                    const dateOk = revDate ? (d === revDate) : true;
                    const typeOk = revType === 'all' ? true : (r.aptType === revType);
                    return dateOk && (Number(r.rating)||0) >= minR && typeOk;
                  });
                  const ratingCounts = [1,2,3,4,5].map(n => filtered.filter((r:any)=> Math.round(Number(r.rating)||0) === n).length);
                  const typeCounts: Record<string, number> = { consultation:0, checkup:0, followup:0, procedure:0 };
                  filtered.forEach((r:any)=>{ if (typeCounts[r.aptType]!=null) typeCounts[r.aptType]++; });
                  const bar = (value:number, max:number, color:string) => (
                    <div className="h-2 rounded" style={{ width: `${max?Math.round((value/max)*100):0}%`, backgroundColor: color }} />
                  );
                  const maxRating = Math.max(...ratingCounts, 1);
                  const maxType = Math.max(...Object.values(typeCounts), 1);
                  return (
                    <>
                      <div className="flex items-center gap-2 text-foreground mb-4">
                        <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                        <span className="font-semibold">{avg}</span>
                        <span className="text-muted-foreground text-sm">/ 5 average • {filtered.length} shown</span>
                      </div>
                      {/* mini analytics */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                        <div className="bg-secondary rounded-xl p-4">
                          <div className="text-sm font-semibold mb-2">Rating distribution</div>
                          <div className="space-y-2">
                            {[5,4,3,2,1].map((n,idx)=> (
                              <div key={n} className="flex items-center gap-2 text-xs">
                                <span className="w-6">{n}★</span>
                                <div className="flex-1 bg-background rounded h-2">{bar(ratingCounts[n-1], maxRating, '#f59e0b')}</div>
                                <span className="w-8 text-right">{ratingCounts[n-1]}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                        <div className="bg-secondary rounded-xl p-4">
                          <div className="text-sm font-semibold mb-2">By appointment type</div>
                          <div className="space-y-2 text-xs">
                            {(['consultation','checkup','followup','procedure'] as const).map((t)=> (
                              <div key={t} className="flex items-center gap-2">
                                <span className="capitalize w-24">{t}</span>
                                <div className="flex-1 bg-background rounded h-2">{bar(typeCounts[t], maxType, '#5B68EE')}</div>
                                <span className="w-8 text-right">{typeCounts[t]}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {filtered.map((rev:any) => (
                          <div key={rev.id} className="p-4 bg-secondary rounded-xl shadow-sm">
                            <div className="flex items-center justify-between mb-2">
                              <div className="font-semibold text-foreground">{rev.patientName || 'Patient'}</div>
                              <div className="flex items-center gap-1">
                                {[1,2,3,4,5].map(i => (
                                  <Star key={i} className={`w-4 h-4 ${i <= (rev.rating||0) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} />
                                ))}
                              </div>
                            </div>
                            <div className="text-xs text-muted-foreground mb-1 capitalize">{rev.aptType || 'consultation'}</div>
                            {rev.text && (
                              <p className="text-sm text-foreground mb-3 line-clamp-4">{rev.text}</p>
                            )}
                            <div className="text-xs text-muted-foreground">
                              {rev.appointmentDate ? new Date(rev.appointmentDate).toLocaleDateString('en-IN',{ month:'short', day:'numeric', year:'numeric'}) : ''}
                              {rev.appointmentTime ? `, ${rev.appointmentTime}` : ''}
                            </div>
                          </div>
                        ))}
                        {filtered.length === 0 && (
                          <div className="col-span-full text-center text-muted-foreground py-8">No reviews match the filters.</div>
                        )}
                      </div>
                    </>
                  );
                })()}
              </div>
            </div>
          )}
        </div>

        {/* Simple White Footer Block */}
        <div className="bg-white border-t border-gray-200 py-4 mt-auto">
          <div className="container mx-auto px-4 text-center text-sm text-gray-600">
            © {new Date().getFullYear()} MedSphere. All rights reserved.
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorDashboard;
