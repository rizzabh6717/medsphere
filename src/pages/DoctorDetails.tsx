import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, MapPin, Briefcase, Users, Award, Clock } from "lucide-react";
import NavigationHeader from "@/components/NavigationHeader";

const DoctorDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // Mock doctor data
  const doctor = {
    id,
    name: "Dr. Prakash Das",
    specialty: "Cardiologist",
    education: "MBBS, MD (Cardiology)",
    experience: 15,
    patientsTreated: 5000,
    rating: 4.8,
    reviews: 234,
    location: "Apollo Hospital, Mumbai",
    availability: "Available Today",
    consultationFee: 500,
    about: "Dr. Prakash Das is a highly experienced cardiologist with over 15 years of practice. He specializes in preventive cardiology, heart failure management, and interventional procedures.",
    languages: ["English", "Hindi", "Marathi"],
  };

  return (
    <div className="min-h-screen bg-gradient-medical flex flex-col">
      <NavigationHeader />
      <div className="container mx-auto px-4 py-8 max-w-4xl flex-1 mb-auto">
        <Button
          variant="default"
          onClick={() => navigate("/patient/dashboard")}
          className="mb-6 bg-[#5B68EE] hover:bg-[#4A56DD]"
        >
          Back to Dashboard
        </Button>
        <Card className="p-6 animate-fade-in">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="w-32 h-32 rounded-full bg-gradient-medical flex items-center justify-center text-white text-3xl font-bold">
              {doctor.name.split(' ').map(n => n[0]).join('')}
            </div>
            
            <div className="flex-1">
              <div className="flex items-start justify-between flex-wrap gap-4">
                <div>
                  <h1 className="text-3xl font-bold text-foreground mb-2">{doctor.name}</h1>
                  <p className="text-lg text-muted-foreground mb-2">{doctor.specialty}</p>
                  <p className="text-sm text-muted-foreground">{doctor.education}</p>
                </div>
                <Badge variant="secondary" className="text-sm">
                  {doctor.availability}
                </Badge>
              </div>

              <div className="flex items-center gap-2 mt-4">
                <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                <span className="font-semibold">{doctor.rating}</span>
                <span className="text-muted-foreground">({doctor.reviews} reviews)</span>
              </div>

              <div className="flex flex-wrap gap-4 mt-4">
                <div className="flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-primary" />
                  <span className="text-sm">{doctor.experience} years exp.</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-primary" />
                  <span className="text-sm">{doctor.patientsTreated}+ patients</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-primary" />
                  <span className="text-sm">{doctor.location}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 space-y-6">
            <div>
              <h2 className="text-xl font-semibold mb-3 flex items-center gap-2">
                <Award className="w-5 h-5 text-primary" />
                About
              </h2>
              <p className="text-muted-foreground leading-relaxed">{doctor.about}</p>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Languages</h3>
              <div className="flex gap-2">
                {doctor.languages.map((lang) => (
                  <Badge key={lang} variant="outline">{lang}</Badge>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between pt-6 border-t">
              <div>
                <p className="text-sm text-muted-foreground">Consultation Fee</p>
                <p className="text-2xl font-bold text-primary">₹{doctor.consultationFee}</p>
              </div>
              <Button 
                size="lg"
                onClick={() => navigate('/patient/book-appointment', { state: { doctorId: doctor.id, doctorName: doctor.name, doctorSpecialty: doctor.specialty } })}
                className="px-8 bg-[#5B68EE] hover:bg-[#4A56DD]"
              >
                <Clock className="w-4 h-4 mr-2" />
                Book Appointment
              </Button>
            </div>
          </div>
        </Card>
      </div>
      
      {/* Simple White Footer Block */}
      <div className="bg-white border-t border-gray-200 py-4 mt-auto">
        <div className="container mx-auto px-4 text-center text-sm text-gray-600">
          © {new Date().getFullYear()} MedSphere. All rights reserved.
        </div>
      </div>
    </div>
  );
};

export default DoctorDetails;
