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
  Stethoscope
} from "lucide-react";

const Dashboard = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [userName, setUserName] = useState("Guest");

  useEffect(() => {
    const profile = getUserProfile();
    if (profile) {
      setUserName(profile.name.split(' ')[0]); // Get first name
    }
  }, []);

  const allDoctors = [
    {
      id: 1,
      name: "Dr. Prakash Das",
      specialization: "Psychologist",
      experience: "7+ years",
      availability: "Available today",
      timing: "09:30 AM - 07:00 PM",
      rating: 4.8,
      patients: 500,
    },
    {
      id: 2,
      name: "Dr. Sarah Johnson",
      specialization: "Cardiologist",
      experience: "10+ years",
      availability: "Available today",
      timing: "10:00 AM - 06:00 PM",
      rating: 4.9,
      patients: 750,
    },
    {
      id: 3,
      name: "Dr. Rajesh Kumar",
      specialization: "Orthopedic",
      experience: "12+ years",
      availability: "Available today",
      timing: "08:00 AM - 04:00 PM",
      rating: 4.7,
      patients: 600,
    },
    {
      id: 4,
      name: "Dr. Priya Sharma",
      specialization: "Pediatrician",
      experience: "8+ years",
      availability: "Available today",
      timing: "09:00 AM - 05:00 PM",
      rating: 4.9,
      patients: 850,
    },
    {
      id: 5,
      name: "Dr. Amit Patel",
      specialization: "Dermatologist",
      experience: "9+ years",
      availability: "Available today",
      timing: "10:00 AM - 06:00 PM",
      rating: 4.6,
      patients: 520,
    },
    {
      id: 6,
      name: "Dr. Neha Gupta",
      specialization: "Neurologist",
      experience: "11+ years",
      availability: "Available today",
      timing: "09:00 AM - 05:00 PM",
      rating: 4.8,
      patients: 680,
    },
    {
      id: 7,
      name: "Dr. Vikram Singh",
      specialization: "Gastroenterologist",
      experience: "14+ years",
      availability: "Available today",
      timing: "08:00 AM - 04:00 PM",
      rating: 4.7,
      patients: 720,
    },
    {
      id: 8,
      name: "Dr. Anjali Desai",
      specialization: "General Physician",
      experience: "6+ years",
      availability: "Available today",
      timing: "09:00 AM - 07:00 PM",
      rating: 4.5,
      patients: 450,
    },
    {
      id: 9,
      name: "Dr. Rohit Mehta",
      specialization: "ENT Specialist",
      experience: "10+ years",
      availability: "Available today",
      timing: "10:00 AM - 05:00 PM",
      rating: 4.6,
      patients: 580,
    },
    {
      id: 10,
      name: "Dr. Kavita Rao",
      specialization: "Gynecologist",
      experience: "13+ years",
      availability: "Available today",
      timing: "09:00 AM - 06:00 PM",
      rating: 4.9,
      patients: 890,
    },
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
    { icon: Stethoscope, label: "Find a Doctor", path: "/dashboard" },
    { icon: Calendar, label: "Appointments", path: "/appointments" },
    { icon: FileText, label: "Records", path: "/records" },
    { icon: User, label: "Profile", path: "/profile" },
  ];

  return (
    <div className="min-h-screen bg-gradient-medical">
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
              onClick={() => navigate("/profile")}
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

      <div className="container mx-auto px-6 py-8 pb-28">
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
              onClick={() => navigate(`/doctor/${doctor.id}`)}
            >
              <div className="flex gap-4">
                <div className="w-20 h-20 rounded-2xl bg-gradient-card flex items-center justify-center flex-shrink-0">
                  <Stethoscope className="w-10 h-10 text-primary" />
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
                  <div className="px-3 py-1 bg-primary-light rounded-full">
                    <span className="text-primary text-xs font-medium">
                      {doctor.availability}
                    </span>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  As {doctor.specialization.split(' ')[0]} Dr. {doctor.name.split(' ')[1]} practices about {doctor.experience}.
                </p>
              </div>

              <Button 
                className="w-full mt-4 rounded-xl" 
                size="lg"
                onClick={() => navigate('/book-appointment', { 
                  state: { 
                    doctorId: doctor.id, 
                    doctorName: doctor.name, 
                    doctorSpecialty: doctor.specialization 
                  } 
                })}
              >
                Book Appointment
              </Button>
            </div>
          ))}
        </div>
      </div>

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
