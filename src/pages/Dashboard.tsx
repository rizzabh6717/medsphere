import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";
import NavigationHeader from "@/components/NavigationHeader";
import { getUserProfile } from "@/lib/storage";
import { 
  Search, 
  Calendar, 
  FileText, 
  User, 
  MapPin,
  Star,
  Clock,
  Stethoscope,
  CalendarDays,
  MessageCircle,
  Send
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { generateChatReply, type ChatMessage } from "@/lib/ai";
import { getPrescriptions, getAppointments, getFollowUps } from "@/lib/storage";

const Dashboard = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [userName, setUserName] = useState("Guest");

  // Assistant chat state
  const [chatOpen, setChatOpen] = useState(false);
  const [chatInput, setChatInput] = useState("");
  const [typing, setTyping] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [context, setContext] = useState<string>("");

  // Build assistant context from recent records (prescriptions, appointments, follow-ups)
  useEffect(() => {
    const normalize = (s: string) => (s || '').replace(/\D/g, '');

    const buildContext = () => {
      const profile = getUserProfile();
      if (profile?.name) setUserName(profile.name.split(' ')[0]);
      const phone = normalize(profile?.phone || '');
      const name = (profile?.name || '').trim().toLowerCase();

      // Prescriptions (by phone, fallback to name match)
      const rxAll = getPrescriptions();
      const rxCandidates = rxAll
        .filter((r:any)=> phone ? normalize(r.patientPhone) === phone : true)
        .concat(
          phone ? [] : rxAll.filter((r:any)=> (r.patientName||'').trim().toLowerCase() === name)
        );
      const rxMine = rxCandidates
        .sort((a:any,b:any)=> new Date(b.createdAt).getTime()-new Date(a.createdAt).getTime())
        .slice(0,3);
      const rxLines = rxMine.map((r:any)=>{
        const date = new Date(r.createdAt).toLocaleDateString('en-IN');
        const diag = r.diagnosis || '-';
        const meds = (r.items||[]).map((m:any)=> `${m.medicine}${m.dosage?` ${m.dosage}`:''}${m.duration?`; ${m.duration}`:''}`).join(', ');
        const inst = r.instructions ? ` | Instructions: ${r.instructions}` : '';
        return `${date} • Dx: ${diag} • Meds: ${meds}${inst}`;
      }).join('\n');

      // Appointments (by phone, fallback to name)
      const apAll = getAppointments();
      const apCandidates = apAll
        .filter((a:any)=> phone ? normalize(a.patientPhone)===phone : true)
        .concat(
          phone ? [] : apAll.filter((a:any)=> (a.patientName||'').trim().toLowerCase() === name)
        );
      const apMine = apCandidates
        .sort((a:any,b:any)=> new Date(b.date).getTime()-new Date(a.date).getTime())
        .slice(0,3);
      const apLines = apMine.map((a:any)=> `${new Date(a.date).toLocaleDateString('en-IN')} • ${a.time} • ${a.doctorName} (${a.doctorSpecialty||''}) • ${a.status}${a.symptoms?` • Symptoms: ${a.symptoms}`:''}`).join('\n');

      // Follow-ups (by patientId == phone)
      const fuAll = getFollowUps();
      const fuMine = fuAll.filter((f:any)=> phone && normalize(f.patientId||'')===phone)
        .sort((a:any,b:any)=> new Date(a.date).getTime()-new Date(b.date).getTime())
        .slice(0,3);
      const fuLines = fuMine.map((f:any)=> `${new Date(f.date).toLocaleDateString('en-IN')} ${f.time} • ${f.doctorName} • ${f.status}`).join('\n');

      const ctx = [
        `Patient: ${profile?.name||''}`,
        rxLines ? `Recent Prescriptions:\n${rxLines}` : '',
        apLines ? `Appointments:\n${apLines}` : '',
        fuLines ? `Follow-ups:\n${fuLines}` : ''
      ].filter(Boolean).join('\n\n');
      setContext(ctx);
    };

    buildContext();
    const handler = () => buildContext();
    window.addEventListener('prescriptions:updated', handler);
    window.addEventListener('appointments:updated', handler);
    window.addEventListener('followUps:updated', handler);
    return () => {
      window.removeEventListener('prescriptions:updated', handler);
      window.removeEventListener('appointments:updated', handler);
      window.removeEventListener('followUps:updated', handler);
    };
  }, []);

  // Rebuild context when chat opens (in case data changed and no events fired)
  useEffect(() => {
    if (chatOpen) {
      try {
        // Trigger the existing effect by emitting a no-op event or simply rebuild inline by toggling state
        const profile = getUserProfile();
        setUserName(profile?.name?.split(' ')[0] || userName);
      } catch {}
    }
  }, [chatOpen]);

  const allDoctors = [
    { id: 1,  name: "Dr. Prakash Das",    specialization: "Psychologist",       experience: "7+ years",  availability: "Available today", timing: "09:30 AM - 07:00 PM", rating: 4.8, patients: 500,  gender: 'male' },
    { id: 2,  name: "Dr. Sarah Johnson",   specialization: "Cardiologist",        experience: "10+ years", availability: "Available today", timing: "10:00 AM - 06:00 PM", rating: 4.9, patients: 750,  gender: 'female' },
    { id: 3,  name: "Dr. Rajesh Kumar",    specialization: "Orthopedic",          experience: "12+ years", availability: "Available today", timing: "08:00 AM - 04:00 PM", rating: 4.7, patients: 600,  gender: 'male' },
    { id: 4,  name: "Dr. Priya Sharma",    specialization: "Pediatrician",        experience: "8+ years",  availability: "Available today", timing: "09:00 AM - 05:00 PM", rating: 4.9, patients: 850,  gender: 'female' },
    { id: 5,  name: "Dr. Amit Patel",      specialization: "Dermatologist",       experience: "9+ years",  availability: "Available today", timing: "10:00 AM - 06:00 PM", rating: 4.6, patients: 520,  gender: 'male' },
    { id: 6,  name: "Dr. Neha Gupta",      specialization: "Neurologist",         experience: "11+ years", availability: "Available today", timing: "09:00 AM - 05:00 PM", rating: 4.8, patients: 680,  gender: 'female' },
    { id: 7,  name: "Dr. Vikram Singh",    specialization: "Gastroenterologist",  experience: "14+ years", availability: "Available today", timing: "08:00 AM - 04:00 PM", rating: 4.7, patients: 720,  gender: 'male' },
    { id: 8,  name: "Dr. Anjali Desai",    specialization: "General Physician",   experience: "6+ years",  availability: "Available today", timing: "09:00 AM - 07:00 PM", rating: 4.5, patients: 450,  gender: 'female' },
    { id: 9,  name: "Dr. Rohit Mehta",     specialization: "ENT Specialist",      experience: "10+ years", availability: "Available today", timing: "10:00 AM - 05:00 PM", rating: 4.6, patients: 580,  gender: 'male' },
    { id: 10, name: "Dr. Kavita Rao",      specialization: "Gynecologist",        experience: "13+ years", availability: "Available today", timing: "09:00 AM - 06:00 PM", rating: 4.9, patients: 890,  gender: 'female' },
  ];

  // Filter doctors based on search query
  const doctors = allDoctors.filter(doctor => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      doctor.name.toLowerCase().includes(query) ||
      doctor.specialization.toLowerCase().includes(query)
    );
  });

  const quickActions = [
    { icon: Stethoscope, label: "Find a Doctor", path: "/patient/dashboard" },
    { icon: Calendar, label: "Appointments", path: "/patient/appointments" },
    { icon: FileText, label: "Records", path: "/patient/records" },
    { icon: CalendarDays, label: "Follow-ups", path: "/patient/followups" },
    { icon: User, label: "Profile", path: "/patient/profile" },
  ];

  return (
    <div className="min-h-screen bg-gradient-medical flex flex-col">
      <NavigationHeader />
      
      {/* Header */}
      <div className="bg-card shadow-soft">
        <div className="container mx-auto px-6 py-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Hello, {userName}</h1>
              <div className="flex items-center gap-2 text-muted-foreground mt-1">
                <MapPin className="w-4 h-4" />
                <span>Dombivali, Mumbai</span>
              </div>
            </div>
            <Button
              variant="outline"
              size="icon"
              className="rounded-full"
onClick={() => navigate("/patient/profile")}
            >
              <User className="w-5 h-5" />
            </Button>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search Doctors"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 h-14 rounded-2xl text-lg"
            />
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8 pb-28 flex-1">
        {/* Quick Actions */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          {quickActions.map((action, index) => (
            <button
              key={index}
              onClick={() => navigate(action.path)}
              className="bg-card p-6 rounded-2xl shadow-card hover:shadow-hover transition-all flex flex-col items-center gap-3 animate-scale-in"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="w-14 h-14 rounded-2xl bg-gradient-card flex items-center justify-center">
                <action.icon className="w-7 h-7 text-primary" />
              </div>
              <span className="text-sm font-medium text-foreground text-center">
                {action.label}
              </span>
            </button>
          ))}
        </div>

        {/* Doctors List */}
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-foreground">Available Doctors</h2>
          <Button variant="link" className="text-primary">
            View All
          </Button>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {doctors.map((doctor, index) => (
            <div
              key={doctor.id}
              className="bg-card rounded-2xl shadow-card hover:shadow-hover transition-all p-6 cursor-pointer animate-fade-in"
              style={{ animationDelay: `${index * 0.1}s` }}
onClick={() => navigate(`/patient/doctor/${doctor.id}`)}
            >
              <div className="flex gap-4">
                <div className="w-20 h-20 rounded-2xl bg-gradient-card flex items-center justify-center flex-shrink-0 overflow-hidden">
                  <Avatar className="w-20 h-20">
                    <AvatarImage
                      src={doctor.gender === 'female' ? "/assets/female%20doc.png" : "/assets/male%20doctor.png"}
                      alt={doctor.name}
                    />
                    <AvatarFallback>{doctor.name.split(' ').map(n => n[0]).join('').slice(0,2)}</AvatarFallback>
                  </Avatar>
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-foreground mb-1">
                    {doctor.name}
                  </h3>
                  <p className="text-primary font-medium mb-2">
                    {doctor.specialization}
                  </p>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 fill-primary text-primary" />
                      <span className="font-medium text-foreground">{doctor.rating}</span>
                    </div>
                    <span>{doctor.patients}+ patients</span>
                  </div>
                </div>
              </div>
              
              <div className="mt-4 pt-4 border-t border-border">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Clock className="w-4 h-4" />
                    <span>{doctor.timing}</span>
                  </div>
                  <div className="px-3 py-1 bg-green-100 rounded-full">
                    <span className="text-green-700 text-xs font-medium">
                      {doctor.availability}
                    </span>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  As {doctor.specialization.split(' ')[0]} Dr. {doctor.name.split(' ')[1]} practices about {doctor.experience}.
                </p>
              </div>

              <Button 
                className="w-full mt-4 rounded-xl bg-[#5B68EE] hover:bg-[#4A56DD]" 
                size="lg"
                onClick={(e) => { e.stopPropagation(); navigate('/patient/book-appointment', {
                  state: { 
                    doctorId: doctor.id, 
                    doctorName: doctor.name, 
                    doctorSpecialty: doctor.specialization 
                  } 
                }); }}
              >
                Book Appointment
              </Button>
            </div>
          ))}
        </div>
      </div>

      {/* Floating Assistant Button */}
      <button
        onClick={() => setChatOpen(true)}
        className="fixed bottom-20 right-6 z-50 w-14 h-14 rounded-full bg-[#5B68EE] hover:bg-[#4A56DD] text-white shadow-lg flex items-center justify-center"
        title="MedSphere Assistant"
      >
        <MessageCircle className="w-6 h-6" />
      </button>

      {/* Assistant Floating Window */}
      {chatOpen && (
        <div className="fixed bottom-24 right-6 z-50 w-[360px] max-w-[92vw] h-[480px] rounded-2xl shadow-2xl border bg-white flex flex-col overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3" style={{ backgroundColor: '#5B68EE' }}>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-white/90 flex items-center justify-center text-xs font-bold text-[#5B68EE]">MS</div>
              <div className="leading-tight">
                <div className="text-white font-semibold">MedSphere Assistant</div>
                <div className="text-white/90 text-[11px]">We typically reply in a few minutes</div>
              </div>
            </div>
            <button onClick={() => setChatOpen(false)} className="text-white/90 hover:text-white text-xl leading-none">×</button>
          </div>
          {/* Messages */}
          <div className="p-3 flex-1 overflow-y-auto space-y-3 bg-white">
            {messages.length === 0 && (
              <div className="text-xs text-muted-foreground">Hello and welcome to MedSphere! How can I help you today?</div>
            )}
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role==='user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`${m.role==='user' ? 'bg-[#5B68EE] text-white' : 'bg-gray-100 text-gray-800'} px-3 py-2 rounded-2xl max-w-[80%] whitespace-pre-wrap`}>{m.text}</div>
              </div>
            ))}
            {typing && (
              <div className="flex justify-start">
                <div className="bg-gray-100 text-gray-600 px-3 py-2 rounded-2xl inline-flex items-center gap-1 text-xs">
                  <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:-.2s]"></span>
                  <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:-.1s]"></span>
                  <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></span>
                </div>
              </div>
            )}
          </div>
          {/* Composer */}
          <div className="p-3 border-t flex items-center gap-2 bg-white">
            <Input value={chatInput} onChange={(e)=>setChatInput(e.target.value)} placeholder="Write a message" className="flex-1" />
            <Button
              onClick={async () => {
                if (!chatInput.trim()) return;
                const userMsg: ChatMessage = { role: 'user', text: chatInput.trim() };
                const current = [...messages, userMsg];
                setMessages(current);
                setChatInput('');
                setTyping(true);
                try {
                  const { text } = await generateChatReply(context, current, userMsg.text);
                  setMessages(prev => [...prev, { role: 'model', text }]);
                } catch (e:any) {
                  setMessages(prev => [...prev, { role: 'model', text: 'Sorry, I could not reply right now.' }]);
                } finally {
                  setTyping(false);
                }
              }}
              className="bg-[#5B68EE] hover:bg-[#4A56DD] text-white"
              size="icon"
              title="Send"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-card border-t border-border py-4 px-6">
        <div className="container mx-auto flex items-center justify-around max-w-md">
          {quickActions.map((action, index) => (
            <button
              key={index}
              onClick={() => navigate(action.path)}
              className="flex flex-col items-center gap-1 text-muted-foreground hover:text-primary transition-colors"
            >
              <action.icon className="w-6 h-6" />
              <span className="text-xs">{action.label.split(' ').pop()}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
