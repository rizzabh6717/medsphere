import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
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
        </div>
      </div>
    </div>
  );
};

export default DoctorDashboard;
