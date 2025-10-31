import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { MessageCircle, LayoutDashboard, Calendar, Users, Pill, Menu, ChevronLeft, Bell, HelpCircle, Settings, Phone, Stethoscope, Mic, Send, User, FileText, Heart } from "lucide-react";
import { ensureChatThread, getAppointments, getChats } from "@/lib/storage";
import { toast } from "sonner";

const DoctorMessages = () => {
  const navigate = useNavigate();
  const params = useParams();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [query, setQuery] = useState("");
  const [threads, setThreads] = useState<any[]>([]);
  const [activePhone, setActivePhone] = useState<string | null>(null);
  const [messageInput, setMessageInput] = useState("");
  const [appointments, setAppointments] = useState<any[]>([]);

  const doctorProfile = useMemo(() => {
    try { return JSON.parse(sessionStorage.getItem('doctorProfile') || localStorage.getItem('doctorProfile') || 'null'); } catch { return null; }
  }, []);

  // Load appointments and refresh on events
  useEffect(() => {
    const loadApts = () => setAppointments(getAppointments());
    loadApts();
    const handler = () => loadApts();
    window.addEventListener('appointments:updated', handler);
    return () => window.removeEventListener('appointments:updated', handler);
  }, []);

  useEffect(() => {
    // Build list from appointments (all patients with this doctor), enrich with existing chat thread if present
    const chats = getChats();
    const mineChats = doctorProfile ? chats.filter(t => t.doctorId === doctorProfile.id) : [];
    const pats = doctorProfile ? appointments.filter((a:any)=> a.doctorId === doctorProfile.id) : [];
    const byKey: Record<string, any> = {};
    pats.forEach((a:any) => {
      const pkey = `${a.patientPhone || ''}|${(a.patientName||'')}`; // unique per name+phone
      if (!byKey[pkey]) byKey[pkey] = { patientPhone: pkey, displayName: a.patientName, realPhone: a.patientPhone };
    });
    // Merge existing chats (works for both old phone-only keys and new name|phone keys)
    mineChats.forEach((t:any) => {
      const last = t.messages[t.messages.length-1];
      const key = t.patientPhone; // may already be name|phone or just phone
      if (!byKey[key]) byKey[key] = { patientPhone: key, displayName: key, realPhone: key };
      byKey[key] = {
        ...byKey[key],
        id: t.id,
        messages: t.messages,
        lastText: last?.text || "",
        lastTs: last?.timestamp || "",
      };
    });
    const list = Object.values(byKey).sort((a:any,b:any)=> new Date(b.lastTs||0).getTime() - new Date(a.lastTs||0).getTime());
    setThreads(list);
  }, [doctorProfile, appointments]);

  useEffect(() => {
    if (params.patientId) {
      setActivePhone(String(params.patientId));
      if (doctorProfile) ensureChatThread(doctorProfile.id, String(params.patientId));
    }
  }, [params.patientId, doctorProfile]);

  const menuItems = [
    { icon: LayoutDashboard, label: "Dashboard", value: "dashboard", to: "/doctor/dashboard" },
    { icon: Calendar, label: "Schedule", value: "schedule", to: "/doctor/dashboard" },
    { icon: Users, label: "Patients", value: "patients", to: "/doctor/dashboard" },
    { icon: MessageCircle, label: "Messages", value: "messages", to: "/doctor/messages" },
    { icon: Pill, label: "Medicines", value: "medicines", to: "/doctor/dashboard" },
  ];

  const activeThread = threads.find(t => t.patientPhone === activePhone);
  const [phonePart, namePart] = (activePhone||'').split('|');
  const patientApts = appointments.filter((a:any)=> {
    if (!activePhone) return false;
    if (namePart !== undefined) {
      return a.patientPhone === phonePart && a.patientName === namePart && (!doctorProfile || a.doctorId===doctorProfile.id);
    }
    return a.patientPhone === activePhone && (!doctorProfile || a.doctorId===doctorProfile.id);
  });
  const latest = patientApts.sort((a:any,b:any)=> new Date(b.date).getTime()-new Date(a.date).getTime())[0];

  const sendMessage = () => {
    if (!messageInput.trim() || !doctorProfile || !activePhone) return;
    const all = getChats();
    const id = `thread-${doctorProfile.id}-${activePhone}`;
    const idx = all.findIndex(t=>t.id===id);
    const msg = { id: `msg-${Date.now()}`, sender: 'doctor', text: messageInput.trim(), timestamp: new Date().toISOString() };
    if (idx>=0) {
      all[idx].messages.push(msg);
      localStorage.setItem('chats', JSON.stringify(all));
    }
    setMessageInput("");
    toast.success("Message sent");
  };

  const filteredThreads = threads.filter(t => !query ? true : t.displayName.toLowerCase().includes(query.toLowerCase()));

  const statusHeuristic = (a:any) => {
    const text = (a?.symptoms||"").toLowerCase();
    return (text.includes('severe') || text.includes('pain') || text.includes('urgent') || text.includes('anxiety')) ? 'critical' : 'stable';
  };

  return (
    <div className="min-h-screen bg-gradient-medical flex">
      {/* Sidebar */}
      <aside className={`bg-card shadow-soft p-6 flex flex-col transition-all duration-300 ${sidebarOpen ? 'w-72' : 'w-20'}`}>
        <div className={`mb-8 transition-all duration-300 ${sidebarOpen ? 'text-center' : 'text-center'}`}>
          <div className={`rounded-full bg-gradient-card mx-auto mb-4 flex items-center justify-center transition-all duration-300 ${sidebarOpen ? 'w-24 h-24' : 'w-12 h-12'}`}>
            <User className={`text-primary transition-all duration-300 ${sidebarOpen ? 'w-12 h-12' : 'w-6 h-6'}`} />
          </div>
          {sidebarOpen && (
            <>
              <h2 className="text-xl font-bold text-foreground">{doctorProfile?.name || 'Doctor'}</h2>
              <p className="text-sm text-muted-foreground">{doctorProfile?.specialty || ''}</p>
            </>
          )}
        </div>
        <nav className="flex-1 space-y-2">
          {menuItems.map((item) => (
            <button
              key={item.value}
              onClick={() => navigate(item.to)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${item.value==='messages' ? "bg-[#5B68EE] text-white shadow-sm" : "text-muted-foreground hover:bg-secondary"} ${!sidebarOpen ? 'justify-center' : ''}`}
              title={!sidebarOpen ? item.label : ''}
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              {sidebarOpen && <span className="font-medium">{item.label}</span>}
            </button>
          ))}
        </nav>
      </aside>

      {/* Main */}
      <div className="flex-1 grid grid-cols-12">
        {/* Conversations */}
        <div className="col-span-3 border-r bg-card/60">
          <div className="p-4 flex flex-wrap gap-2">
            <Input className="min-w-[200px] flex-1" placeholder="Search patients..." value={query} onChange={(e)=>setQuery(e.target.value)} />
            <Button className="shrink-0" variant="outline" onClick={()=>{ import("@/lib/storage").then(m=>{ m.clearChatsAll(); m.clearAppointmentsAll(); }); toast.success('Cleared conversations & appointments'); }}>Clear</Button>
          </div>
          <div className="overflow-y-auto h-[calc(100vh-80px)] p-2 space-y-1">
            {filteredThreads.map((t)=>{
              const apt = appointments.find((a:any)=> a.patientPhone===t.patientPhone && (!doctorProfile || a.doctorId===doctorProfile.id));
              const status = statusHeuristic(apt);
              return (
                <button key={t.patientPhone} onClick={()=>setActivePhone(t.patientPhone)} className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-left hover:bg-secondary ${activePhone===t.patientPhone?'bg-secondary':''}`}>
                  <Avatar className="w-10 h-10">
                    <AvatarImage src="/assets/male%20doctor.png" />
                    <AvatarFallback>{(t.displayName||'P').slice(0,2)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <div className="font-semibold truncate">{t.displayName}</div>
                      <div className="text-xs text-muted-foreground">{t.lastTs ? new Date(t.lastTs).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'}) : ''}</div>
                    </div>
                    <div className="text-xs text-muted-foreground truncate">{t.lastText}</div>
                  </div>
                  <span className={`w-2 h-2 rounded-full ${status==='critical'?'bg-red-500':'bg-green-500'}`} />
                </button>
              );
            })}
            {filteredThreads.length===0 && (
              <div className="p-6 text-center text-sm text-muted-foreground">No conversations</div>
            )}
          </div>
        </div>

        {/* Active Chat */}
        <div className="col-span-6 flex flex-col">
          {/* Header */}
          <div className="bg-card px-4 py-3 border-b flex flex-col md:flex-row md:items-center md:justify-between gap-2">
            <div className="flex items-center gap-3 min-w-0">
              <Avatar className="w-10 h-10"><AvatarImage src="/assets/male%20doctor.png" /><AvatarFallback>PT</AvatarFallback></Avatar>
              <div className="min-w-0">
                <div className="font-semibold truncate">{activeThread?.displayName || 'Select a patient'}</div>
                {activeThread && <div className="text-xs text-muted-foreground truncate">{latest?.patientPhone || activeThread?.realPhone || ''}</div>}
              </div>
            </div>
            {activeThread && (
              <div className="flex flex-wrap items-center gap-2 md:justify-end">
                <Button className="shrink-0 whitespace-nowrap" variant="outline" size="sm" onClick={()=> navigate(`/doctor/patient/${activePhone}`)}><FileText className="w-4 h-4 mr-1"/>View Medical History</Button>
                <Button className="shrink-0 whitespace-nowrap" variant="outline" size="sm" onClick={()=> navigate(`/doctor/dashboard`)}><Calendar className="w-4 h-4 mr-1"/>Schedule Follow-Up</Button>
                <Button className="shrink-0 whitespace-nowrap" variant="destructive" size="sm" onClick={()=> toast.success('Chat ended')}><Heart className="w-4 h-4 mr-1"/>End Chat</Button>
              </div>
            )}
          </div>
          {/* Chat body */}
          {activeThread ? (
            <>
              <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-accent/20">
                {activeThread?.messages?.map((m:any)=> (
                  <div key={m.id} className={`flex ${m.sender==='doctor' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[70%] rounded-2xl px-4 py-2 text-sm ${m.sender==='doctor' ? 'bg-[#5B68EE] text-white' : 'bg-card'} shadow-sm`}>
                      <div>{m.text}</div>
                      <div className="text-[10px] opacity-70 mt-1 text-right">{new Date(m.timestamp).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</div>
                    </div>
                  </div>
                ))}
              </div>
              {/* Input */}
              <div className="bg-card border-t p-3 flex items-center gap-2">
                <Button variant="outline" size="icon" className="rounded-full shrink-0"><Mic className="w-4 h-4"/></Button>
                <Input placeholder="Type a message..." value={messageInput} onChange={(e)=>setMessageInput(e.target.value)} className="h-12 rounded-xl" />
                <Button className="bg-[#5B68EE] hover:bg-[#4A56DD] h-12 shrink-0 whitespace-nowrap" onClick={sendMessage}><Send className="w-4 h-4 mr-1"/>Send</Button>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-muted-foreground">Select a conversation to start</div>
          )}
        </div>

        {/* Patient Details */}
        <div className="col-span-3 bg-card/60 border-l p-4 space-y-4">
          {activeThread ? (
            <>
              <div className="flex items-center gap-3">
                <Avatar className="w-14 h-14"><AvatarImage src="/assets/male%20doctor.png" /><AvatarFallback>PT</AvatarFallback></Avatar>
                <div>
                  <div className="font-semibold text-lg">{activeThread?.displayName || '-'}</div>
                  <Badge variant="secondary">{latest ? (statusHeuristic(latest)==='critical'?'Critical':'Stable') : 'Unknown'}</Badge>
                </div>
              </div>
              <Separator />
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <div className="text-muted-foreground text-xs">D.O.B</div>
                  <div className="font-medium">{latest?.patientDob || '-'}</div>
                </div>
                <div>
                  <div className="text-muted-foreground text-xs">Sex</div>
                  <div className="font-medium">{latest?.patientGender || '-'}</div>
                </div>
                <div>
                  <div className="text-muted-foreground text-xs">Weight</div>
                  <div className="font-medium">{latest?.patientWeightKg ? `${latest.patientWeightKg} kg` : '-'}</div>
                </div>
                <div>
                  <div className="text-muted-foreground text-xs">Height</div>
                  <div className="font-medium">{latest?.patientHeightCm ? `${latest.patientHeightCm} cm` : '-'}</div>
                </div>
                <div>
                  <div className="text-muted-foreground text-xs">Last Appointment</div>
                  <div className="font-medium">{latest ? new Date(latest.date).toLocaleDateString('en-IN',{month:'short', day:'numeric', year:'numeric'}) : '-'}</div>
                </div>
                <div>
                  <div className="text-muted-foreground text-xs">Register Date</div>
                  <div className="font-medium">{latest?.registerDate ? new Date(latest.registerDate).toLocaleDateString() : '-'}</div>
                </div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground mb-1">Medical Conditions</div>
                <div className="flex flex-wrap gap-2">
                  {(latest?.medicalConditions || []).map((c:string, i:number)=> (
                    <span key={i} className="px-3 py-1 rounded-full bg-secondary text-xs">{c}</span>
                  ))}
                  {(!latest?.medicalConditions || latest.medicalConditions.length===0) && (
                    <span className="text-xs text-muted-foreground">None recorded</span>
                  )}
                </div>
              </div>
              <Button className="w-full bg-[#5B68EE] hover:bg-[#4A56DD]"><Phone className="w-4 h-4 mr-2"/>{latest?.patientPhone || activeThread?.realPhone || ''}</Button>
            </>
          ) : (
            <div className="h-full w-full flex items-center justify-center text-muted-foreground">No patient selected</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DoctorMessages;
