import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";
import {
  Bell,
  HelpCircle,
  Settings,
  LayoutDashboard,
  Calendar,
  Users,
  MessageSquare,
  Pill,
  LogOut,
  User,
  FileText,
  Heart,
  Phone,
  MessageCircle,
  Check,
  X,
  Menu,
  ChevronLeft,
} from "lucide-react";

const DoctorDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [doctorProfile, setDoctorProfile] = useState<{ id: string; name: string; specialty: string } | null>(null);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [todayAppointments, setTodayAppointments] = useState<any[]>([]);
  const [stats, setStats] = useState([
    { label: "Patients", value: 0, icon: Users, color: "bg-purple-500" },
    { label: "Records", value: 0, icon: FileText, color: "bg-blue-500" },
    { label: "Appointments", value: 0, icon: Calendar, color: "bg-green-500" },
    { label: "Treatments", value: 0, icon: Heart, color: "bg-red-500" },
  ]);

  // Removed mock data; compute from storage

  const nextPatient = appointments.length > 0 ? {
    name: appointments[0].patientName,
    address: "",
    dob: appointments[0].patientDob || "",
    sex: "",
    weight: "",
    height: "",
    lastAppointment: "",
    registerDate: "",
    phone: appointments[0].patientPhone || "",
    conditions: [],
  } : {
    name: "",
    address: "",
    dob: "",
    sex: "",
    weight: "",
    height: "",
    lastAppointment: "",
    registerDate: "",
    phone: "",
    conditions: [],
  };

  const menuItems = [
    { icon: LayoutDashboard, label: "Dashboard", value: "dashboard" },
    { icon: Calendar, label: "Schedule", value: "schedule" },
    { icon: Users, label: "Patients", value: "patients" },
    { icon: MessageSquare, label: "Messages", value: "messages" },
    { icon: Pill, label: "Medicines", value: "medicines" },
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
    return `${hh}:${mm} ${ampm}`;
  };
  const TIME_SLOTS = Array.from({ length: ((18 - 8) * 60) / 30 + 1 }, (_, i) => {
    const minutes = 8 * 60 + i * 30;
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return { h, m, label: formatTime(h, m) };
  });

  const sameDay = (a: Date, b: Date) => a.toDateString() === b.toDateString();

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

  // filtering
  const filteredAppointments = appointments.filter((a) => {
    const matchesName = scheduleQuery
      ? (a.patientName || "").toLowerCase().includes(scheduleQuery.toLowerCase())
      : true;
    const matchesDate = sameDay(new Date(a.date), selectedDate);
    return matchesName && (viewMode === "day" ? matchesDate : true);
  });

  const uniquePatients = Array.from(
    new Map(
      appointments.map((a) => [a.patientPhone, { name: a.patientName, phone: a.patientPhone, lastVisit: a.date }])
    ).values()
  );

  const handleLogout = () => {
    localStorage.removeItem("userRole");
    localStorage.removeItem("isAuthenticated");
    navigate("/user");
  };

  useEffect(() => {
    const load = () => {
      const raw = localStorage.getItem('doctorProfile');
      let profile = raw ? JSON.parse(raw) : null;
      const allApts = JSON.parse(localStorage.getItem('appointments') || '[]');
      if (!profile) {
        if (allApts.length > 0) {
          profile = { id: allApts[0].doctorId, name: allApts[0].doctorName, specialty: allApts[0].doctorSpecialty };
          localStorage.setItem('doctorProfile', JSON.stringify(profile));
        } else {
          profile = { id: 'unknown', name: 'Doctor', specialty: '' };
        }
      }
      setDoctorProfile(profile);
      const filtered = profile.id === 'unknown' ? [] : allApts.filter((a: any) => a.doctorId === profile.id);
      setAppointments(filtered);
      const today = new Date().toDateString();
      const todays = filtered.filter((a: any) => new Date(a.date).toDateString() === today && a.status === 'upcoming');
      setTodayAppointments(todays);
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
    return () => window.removeEventListener('appointments:updated', handler);
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
              onClick={() => setActiveTab(item.value)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                activeTab === item.value
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
      <div className="flex-1 overflow-auto">
        {/* Header */}
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

        <div className="p-8">
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
                  {appointments.filter(a => a.status === 'upcoming').map((req) => (
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
                          <button className="p-2 rounded-lg bg-green-100 text-green-700 hover:bg-green-200 transition-all">
                            <Check className="w-5 h-5" />
                          </button>
                          <button className="p-2 rounded-lg bg-red-100 text-red-700 hover:bg-red-200 transition-all">
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
                >
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Chat
                </Button>
              </div>
            </div>
          </div>
            </>
          )}

          {activeTab === "schedule" && (
            <div className="space-y-6">
              <div className="bg-card rounded-2xl shadow-card p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold">Schedule</h2>
                  <div className="flex gap-2">
                    <Button variant={viewMode === 'day' ? 'default' : 'outline'} onClick={() => setViewMode('day')} className={viewMode==='day'? 'bg-[#5B68EE] hover:bg-[#4A56DD]':''}>Day</Button>
                    <Button variant={viewMode === 'week' ? 'default' : 'outline'} onClick={() => setViewMode('week')} className={viewMode==='week'? 'bg-[#5B68EE] hover:bg-[#4A56DD]':''}>Week</Button>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3 mb-4">
                  <Input placeholder="Search patient..." value={scheduleQuery} onChange={(e) => setScheduleQuery(e.target.value)} />
                  <Input type="date" value={selectedDate.toISOString().slice(0,10)} onChange={(e) => setSelectedDate(new Date(e.target.value))} />
                  <div />
                </div>

                {isLoading ? (
                  <div className="text-center text-muted-foreground py-12">Loading schedule…</div>
                ) : viewMode === 'day' ? (
                  <div className="space-y-2">
                    {TIME_SLOTS.map((slot, idx) => {
                      const current = filteredAppointments.find(a => (a.time || '') === slot.label && sameDay(new Date(a.date), selectedDate));
                      const nextSlot = TIME_SLOTS[Math.min(idx+1, TIME_SLOTS.length-1)];
                      if (current) {
                        const t = typeOfApt(current.symptoms);
                        return (
                          <div key={slot.label} className="p-3 bg-secondary rounded-xl flex items-center justify-between">
                            <div>
                              <div className="font-semibold">{current.patientName}</div>
                              <div className="text-sm text-muted-foreground">{slot.label} - {nextSlot.label} • 30 minutes</div>
                            </div>
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${typeColor(t)}`}>{t.charAt(0).toUpperCase()+t.slice(1)}</span>
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
                  // Week view
                  <div className="overflow-auto">
                    <div className="min-w-[900px]">
                      {(() => {
                        const start = new Date(selectedDate);
                        const day = start.getDay();
                        // Move to Sunday
                        start.setDate(start.getDate() - day);
                        const days = Array.from({ length: 7 }, (_, i) => new Date(start.getFullYear(), start.getMonth(), start.getDate() + i));
                        return (
                          <div>
                            <div className="grid" style={{ gridTemplateColumns: `120px repeat(7, 1fr)`}}>
                              <div />
                              {days.map((d, i) => (
                                <div key={i} className="p-2 text-center font-semibold">
                                  {d.toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric' })}
                                </div>
                              ))}
                              {TIME_SLOTS.map((slot, r) => (
                                <>
                                  <div key={`time-${r}`} className="p-2 text-sm text-muted-foreground border-t">{slot.label}</div>
                                  {days.map((d, c) => {
                                    const item = appointments.find(a => (a.time||'') === slot.label && sameDay(new Date(a.date), d));
                                    const key = `${r}-${c}`;
                                    if (item) {
                                      const t = typeOfApt(item.symptoms);
                                      return (
                                        <div key={key} className="border-t p-1">
                                          <div className={`p-2 rounded-md text-xs ${typeColor(t)} whitespace-nowrap overflow-hidden text-ellipsis`}>
                                            {item.patientName} • {t}
                                          </div>
                                        </div>
                                      );
                                    }
                                    return <div key={key} className="border-t" />;
                                  })}
                                </>
                              ))}
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === "patients" && (
            <div className="space-y-4">
              <div className="bg-card rounded-2xl shadow-card p-6">
                <h2 className="text-xl font-bold mb-4">Patients</h2>
                <div className="grid gap-3">
                  {uniquePatients.map((p) => (
                    <div key={p.phone} className="p-4 bg-secondary rounded-xl flex items-center justify-between">
                      <div>
                        <div className="font-semibold">{p.name}</div>
                        <div className="text-sm text-muted-foreground">{p.phone}</div>
                      </div>
                      <div className="text-sm text-muted-foreground">Last visit: {new Date(p.lastVisit).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}</div>
                    </div>
                  ))}
                  {uniquePatients.length === 0 && (
                    <div className="text-center text-muted-foreground py-8">No patients yet</div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === "messages" && (
            <div className="bg-card rounded-2xl shadow-card p-6 text-muted-foreground">
              <h2 className="text-xl font-bold mb-2 text-foreground">Messages</h2>
              <p>Chat center placeholder. Integrate realtime later.</p>
            </div>
          )}

          {activeTab === "medicines" && (
            <div className="bg-card rounded-2xl shadow-card p-6 text-muted-foreground">
              <h2 className="text-xl font-bold mb-2 text-foreground">Medicines</h2>
              <p>Common medicines and dosage templates (placeholder).</p>
            </div>
          )}
        </div>

        {/* Simple White Footer Block */}
        <div className="bg-white border-t border-gray-200 py-4 mt-8">
          <div className="container mx-auto px-4 text-center text-sm text-gray-600">
            © {new Date().getFullYear()} MedSphere. All rights reserved.
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorDashboard;
