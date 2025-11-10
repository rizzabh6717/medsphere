import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import NavigationHeader from "@/components/NavigationHeader";
import { 
  Calendar, 
  Clock, 
  User, 
  Bell, 
  Search,
  CalendarDays,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Filter
} from "lucide-react";
import { 
  getFollowUpsByDoctor, 
  getFollowUps,
  addFollowUp, 
  updateFollowUpStatus, 
  getUserProfile,
  clearAllMedicalData,
  type FollowUp 
} from "@/lib/storage";
import FollowUpScheduler from "@/components/FollowUpScheduler";
import FollowUpCard from "@/components/FollowUpCard";
import { toast } from "sonner";

const FollowUpDashboard = () => {
  const navigate = useNavigate();
  const [followUps, setFollowUps] = useState<FollowUp[]>([]);
  const [filteredFollowUps, setFilteredFollowUps] = useState<FollowUp[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [userProfile, setUserProfile] = useState<any>(null);
  const [userRole, setUserRole] = useState<"patient" | "doctor">("patient");
  const [upcomingCount, setUpcomingCount] = useState(0);
  const [dueSoonCount, setDueSoonCount] = useState(0);
  const [overdueCount, setOverdueCount] = useState(0);

  useEffect(() => {
    const profile = getUserProfile();
    const role = sessionStorage.getItem('userRole') as "patient" | "doctor";
    setUserProfile(profile);
    setUserRole(role);

    loadFollowUps(profile, role);

    // Listen for follow-up updates
    const handleFollowUpUpdate = () => {
      loadFollowUps(profile, role);
    };

    window.addEventListener('followUps:updated', handleFollowUpUpdate);
    return () => window.removeEventListener('followUps:updated', handleFollowUpUpdate);
  }, []);

  const loadFollowUps = (profile: any, role: "patient" | "doctor") => {
    if (!profile) return;

    let userFollowUps: FollowUp[] = [];
    
    if (role === "doctor") {
      const doctorProfile = JSON.parse(sessionStorage.getItem('doctorProfile') || '{}');
      userFollowUps = getFollowUpsByDoctor(doctorProfile.id || "1");
    } else {
      // Simple rule: show follow-ups whose patientName exactly matches the logged-in user's name (case-insensitive)
      const allFollowUps = getFollowUps();
      const nameKey = (profile.name || '').toLowerCase().trim();
      userFollowUps = allFollowUps.filter(f => (f.patientName || '').toLowerCase().trim() === nameKey);
      console.log("🔍 Debug - Using name-only matching:", { nameKey, count: userFollowUps.length });
    }

    setFollowUps(userFollowUps);
    updateCounts(userFollowUps);
    filterFollowUps(userFollowUps, searchQuery, statusFilter);
  };

  const updateCounts = (followUpList: FollowUp[]) => {
    const now = new Date();
    let upcoming = 0;
    let dueSoon = 0;
    let overdue = 0;

    followUpList.forEach(followUp => {
      if (followUp.status !== "scheduled") return;

      const appointmentDate = new Date(`${followUp.date.split('T')[0]}T${followUp.time}:00`);
      const timeDiff = appointmentDate.getTime() - now.getTime();
      const hoursUntil = timeDiff / (1000 * 60 * 60);

      if (hoursUntil < 0) {
        overdue++;
      } else if (hoursUntil <= 24) {
        dueSoon++;
      } else {
        upcoming++;
      }
    });

    setUpcomingCount(upcoming);
    setDueSoonCount(dueSoon);
    setOverdueCount(overdue);

    // Show notifications for overdue and due soon
    if (overdue > 0) {
      toast.error(`You have ${overdue} overdue follow-up(s)!`, { duration: 5000 });
    }
    if (dueSoon > 0) {
      toast.warning(`${dueSoon} follow-up(s) due within 24 hours!`, { duration: 5000 });
    }
  };

  const filterFollowUps = (followUpList: FollowUp[], search: string, status: string) => {
    let filtered = followUpList;

    // Filter by search query
    if (search) {
      const query = search.toLowerCase();
      filtered = filtered.filter(f => 
        (userRole === "doctor" ? f.patientName : f.doctorName).toLowerCase().includes(query) ||
        f.doctorSpecialty.toLowerCase().includes(query)
      );
    }

    // Filter by status
    if (status !== "all") {
      if (status === "upcoming") {
        const now = new Date();
        filtered = filtered.filter(f => {
          if (f.status !== "scheduled") return false;
          const appointmentDate = new Date(`${f.date.split('T')[0]}T${f.time}:00`);
          return appointmentDate.getTime() > now.getTime();
        });
      } else if (status === "overdue") {
        const now = new Date();
        filtered = filtered.filter(f => {
          if (f.status !== "scheduled") return false;
          const appointmentDate = new Date(`${f.date.split('T')[0]}T${f.time}:00`);
          return appointmentDate.getTime() < now.getTime();
        });
      } else {
        filtered = filtered.filter(f => f.status === status);
      }
    }

    // Sort by date (newest first)
    filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    setFilteredFollowUps(filtered);
  };

  useEffect(() => {
    filterFollowUps(followUps, searchQuery, statusFilter);
  }, [followUps, searchQuery, statusFilter]);

  const handleStatusUpdate = (id: string, status: string) => {
    updateFollowUpStatus(id, status);
  };

  const handleReschedule = (newFollowUp: any) => {
    addFollowUp(newFollowUp);
  };

  const getPatientListForScheduler = () => {
    // For demo purposes, return some mock patient data
    // In a real app, this would come from doctor's patient list
    return [
      { id: "patient1", name: "John Doe" },
      { id: "patient2", name: "Jane Smith" },
      { id: "patient3", name: "Bob Johnson" },
    ];
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#FFDDD2' }}>
      <NavigationHeader title="Follow-Up Management" />
      
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Follow-Up Management</h1>
              <p className="text-gray-600">
                {userRole === "doctor" ? "Manage patient follow-ups" : "Your scheduled follow-ups"}
              </p>
            </div>
          </div>
          
          {/* Actions */}
          <div className="flex items-center gap-2">
            <Button
              onClick={() => navigate(userRole === "doctor" ? "/doctor/dashboard" : "/patient/dashboard")}
              className="bg-[#5B68EE] hover:bg-[#4A56DD] text-white"
            >
              Back to Dashboard
            </Button>
            <Button
              onClick={() => {
                if (confirm('This will delete all appointments, prescriptions, chats, and follow-ups. Continue?')) {
                  clearAllMedicalData();
                  toast.success('All data cleared');
                }
              }}
              className="bg-[#5B68EE] hover:bg-[#4A56DD] text-white"
            >
              Clear Data
            </Button>
            {userRole === "doctor" && (
              <FollowUpScheduler
                patientId="demo-patient"
                patientName="Select Patient"
                onSchedule={handleReschedule}
              />
            )}
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="border-l-4 border-l-blue-500">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Follow-ups</p>
                  <p className="text-2xl font-bold text-gray-800">{followUps.length}</p>
                </div>
                <CalendarDays className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-green-500">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Upcoming</p>
                  <p className="text-2xl font-bold text-green-600">{upcomingCount}</p>
                </div>
                <Calendar className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-orange-500">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Due Soon</p>
                  <p className="text-2xl font-bold text-orange-600">{dueSoonCount}</p>
                </div>
                <AlertTriangle className="w-8 h-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-red-500">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Overdue</p>
                  <p className="text-2xl font-bold text-red-600">{overdueCount}</p>
                </div>
                <XCircle className="w-8 h-8 text-red-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder={`Search ${userRole === "doctor" ? "patients" : "doctors"}...`}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <div className="flex gap-2">
                {["all", "scheduled", "upcoming", "overdue", "completed", "missed"].map(status => (
                  <Button
                    key={status}
                    variant={statusFilter === status ? "default" : "outline"}
                    size="sm"
                    onClick={() => setStatusFilter(status)}
                    style={{ 
                      backgroundColor: statusFilter === status ? '#5B68EE' : 'transparent',
                      borderColor: '#5B68EE',
                      color: statusFilter === status ? 'white' : '#5B68EE'
                    }}
                  >
                    <Filter className="w-4 h-4 mr-1" />
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Follow-up Cards */}
        <div className="space-y-4">
          {filteredFollowUps.length > 0 ? (
            filteredFollowUps.map(followUp => (
              <FollowUpCard
                key={followUp.id}
                followUp={followUp}
                onStatusUpdate={handleStatusUpdate}
                onReschedule={handleReschedule}
                viewMode={userRole}
              />
            ))
          ) : (
            <Card>
              <CardContent className="p-12 text-center">
                <CalendarDays className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-600 mb-2">No Follow-ups Found</h3>
                <p className="text-gray-500 mb-4">
                  {statusFilter === "all" 
                    ? "No follow-ups have been scheduled yet." 
                    : `No ${statusFilter} follow-ups found.`}
                </p>
                {userRole === "doctor" && (
                  <FollowUpScheduler
                    patientId="demo-patient"
                    patientName="Select Patient"
                    onSchedule={handleReschedule}
                  />
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default FollowUpDashboard;