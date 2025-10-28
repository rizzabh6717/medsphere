import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import Footer from "@/components/Footer";
import { ArrowRight, Heart, Users, Shield, Clock, Star, Activity } from "lucide-react";
import heroDoctorImage from "@/assets/hero-doctor.jpg";
import familyConsultation from "@/assets/family-consultation.jpg";
import telemedicineImage from "@/assets/telemedicine.jpg";
import wellnessImage from "@/assets/wellness-program.jpg";

const Landing = () => {
  const navigate = useNavigate();

  const departments = [
    { name: "Pediatrics", icon: Heart, description: "Child health specialists ensuring the best care for every stage of development" },
    { name: "Orthopedics", icon: Activity, description: "Expert care for bone health to restore mobility and relieve joint pain" },
    { name: "Gastroenterology", icon: Shield, description: "Specialized digestive system care to manage and treat digestive conditions" },
    { name: "Neurology", icon: Users, description: "Diagnose and treat neurological conditions, focusing on brain and nerve health" },
    { name: "Cardiology", icon: Heart, description: "Analyze heart health and provide advanced cardiovascular treatments" },
    { name: "General Care", icon: Clock, description: "Offer health assessments to keep you healthy and address various concerns" },
  ];

  const features = [
    "Virtual consultations from home",
    "Remote vital signs monitoring",
    "24/7 medical support",
  ];

  const wellnessFeatures = [
    "Regular health screenings",
    "Chronic condition care",
    "Personalized health coaching",
  ];

  const solutions = [
    {
      title: "Patient-Centered Care",
      description: "We prioritize comfort, safety, and personalized care that empowers you to take control of your health.",
    },
    {
      title: "Innovative Health Solutions",
      description: "We leverage cutting-edge technology and research to deliver care that's both effective and efficient.",
    },
    {
      title: "Holistic Wellness",
      description: "We focus on both the body and mind with integrated support, ensuring total well-being and resilience.",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-medical">
      {/* Navigation */}
      <nav className="container mx-auto px-6 py-6 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Heart className="w-8 h-8 text-primary fill-primary" />
              <span className="text-2xl font-bold text-foreground">MedSphere</span>
            </div>
        <div className="hidden md:flex items-center gap-8">
          <a href="#home" className="text-foreground hover:text-primary transition-colors">Home</a>
          <a href="#about" className="text-foreground hover:text-primary transition-colors">About</a>
          <a href="#services" className="text-foreground hover:text-primary transition-colors">Services</a>
          <a href="#doctors" className="text-foreground hover:text-primary transition-colors">Doctors</a>
          <a href="#contact" className="text-foreground hover:text-primary transition-colors">Contact</a>
        </div>
        <Button 
          onClick={() => navigate("/login")} 
          className="bg-[#5B68EE] hover:bg-[#4A56DD] text-white rounded-full px-6"
        >
          Get Started
        </Button>
      </nav>

      {/* Hero Section */}
      <section id="home" className="container mx-auto px-6 py-20 grid lg:grid-cols-2 gap-12 items-center">
        <div className="space-y-6 animate-fade-in">
          <div className="inline-block px-4 py-2 bg-primary-light rounded-full text-sm text-primary font-medium">
            Here's one suitable to you
          </div>
          <h1 className="text-5xl lg:text-6xl font-bold text-foreground leading-tight">
            A Modern <span className="text-primary">Safe</span> And<br />
            Effective Approach to<br />
            <span className="text-accent-foreground">Wellbeing</span>
          </h1>
          <p className="text-muted-foreground text-lg max-w-xl">
            Get more targeted care with intelligent diagnostics providers designed to get to the root cause, 
            and treatments that help support your wellbeing.
          </p>
          <div className="flex gap-4">
            <Button 
onClick={() => navigate("/user")} 
              size="lg"
              className="bg-[#5B68EE] hover:bg-[#4A56DD] text-white rounded-full px-8"
            >
              Find Now
            </Button>
            <Button 
onClick={() => navigate("/user")}
              variant="outline" 
              size="lg"
              className="rounded-full px-8 border-foreground text-foreground hover:bg-foreground/5"
            >
              Learn More
            </Button>
          </div>
          <div className="flex gap-6 pt-4">
            <div className="flex items-center gap-2">
              <div className="w-12 h-12 rounded-full bg-primary-light flex items-center justify-center">
                <Users className="w-6 h-6 text-primary" />
              </div>
              <div>
                <div className="font-semibold text-foreground">1500+</div>
                <div className="text-sm text-muted-foreground">Patients</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-12 h-12 rounded-full bg-accent flex items-center justify-center">
                <Activity className="w-6 h-6 text-accent-foreground" />
              </div>
              <div>
                <div className="font-semibold text-foreground">50+</div>
                <div className="text-sm text-muted-foreground">Doctors</div>
              </div>
            </div>
          </div>
        </div>
        <div className="relative animate-float">
          <div className="absolute inset-0 bg-gradient-card rounded-3xl blur-3xl opacity-30"></div>
          <img 
            src={heroDoctorImage} 
            alt="Professional Doctor" 
            className="relative rounded-3xl shadow-hover w-full object-cover"
          />
          <div className="absolute top-8 right-8 bg-card p-4 rounded-2xl shadow-card">
            <div className="text-sm font-medium text-card-foreground mb-2">Available Doctors</div>
            <div className="flex -space-x-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="w-8 h-8 rounded-full bg-primary-light border-2 border-card"></div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-card py-16">
        <div className="container mx-auto px-6">
          <div className="flex items-center gap-2 mb-6">
            <Shield className="w-6 h-6 text-primary" />
            <span className="text-sm font-medium text-muted-foreground">Our Record</span>
          </div>
          <h2 className="text-4xl font-bold text-foreground mb-4">
            We Have Helped 1500+ Families<br />Nationwide in Health
          </h2>
          <div className="grid md:grid-cols-2 gap-8 items-center mt-12">
            <div>
              <img 
                src={familyConsultation} 
                alt="Family Consultation" 
                className="rounded-3xl shadow-card"
              />
            </div>
            <div className="space-y-4">
              <p className="text-muted-foreground text-lg">
                A companion fills my soul, like the peaceful joy of morning. The care here has 
                truly transformed my life. <span className="font-semibold text-foreground">Admin Mark</span>
              </p>
              <div className="text-sm text-muted-foreground">view profile</div>
            </div>
          </div>
        </div>
      </section>

      {/* Departments Section */}
      <section id="services" className="container mx-auto px-6 py-20">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Activity className="w-6 h-6 text-primary" />
            <span className="text-sm font-medium text-muted-foreground">Our Services</span>
          </div>
          <h2 className="text-4xl font-bold text-foreground">
            Different Types of Department<br />We Have for <span className="text-primary">Your Healthcare</span>
          </h2>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {departments.map((dept, index) => (
            <div 
              key={index} 
              className={`p-8 rounded-3xl shadow-card hover:shadow-hover transition-all cursor-pointer animate-scale-in ${
                index === 1 ? 'bg-gradient-card' : 'bg-card'
              }`}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className={`w-14 h-14 rounded-2xl ${index === 1 ? 'bg-card' : 'bg-primary-light'} flex items-center justify-center mb-4`}>
                <dept.icon className={`w-7 h-7 ${index === 1 ? 'text-primary' : 'text-primary'}`} />
              </div>
              <h3 className={`text-xl font-semibold mb-3 ${index === 1 ? 'text-card-foreground' : 'text-foreground'}`}>
                {dept.name}
              </h3>
              <p className={index === 1 ? 'text-card-foreground/80' : 'text-muted-foreground'}>
                {dept.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Telemedicine Section */}
      <section className="bg-card py-20">
        <div className="container mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Clock className="w-6 h-6 text-primary" />
                <span className="text-sm font-medium text-muted-foreground">Smart Care</span>
              </div>
              <h2 className="text-4xl font-bold text-foreground mb-6">
                Comprehensive<br /><span className="text-primary">Telemedicine</span> Services
              </h2>
              <div className="space-y-3 mb-8">
                {features.map((feature, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                      <ArrowRight className="w-4 h-4 text-primary-foreground" />
                    </div>
                    <span className="text-foreground">{feature}</span>
                  </div>
                ))}
              </div>
              <Button className="rounded-full px-8">
                Read More
              </Button>
            </div>
            <div className="relative">
              <img 
                src={telemedicineImage} 
                alt="Telemedicine Services" 
                className="rounded-3xl shadow-card"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Wellness Programs */}
      <section className="container mx-auto px-6 py-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="relative order-2 lg:order-1">
            <img 
              src={wellnessImage} 
              alt="Wellness Programs" 
              className="rounded-3xl shadow-card"
            />
          </div>
          <div className="order-1 lg:order-2">
            <div className="flex items-center gap-2 mb-4">
              <Star className="w-6 h-6 text-primary" />
              <span className="text-sm font-medium text-muted-foreground">Health & Age</span>
            </div>
            <h2 className="text-4xl font-bold text-foreground mb-6">
              Integrated<br /><span className="text-primary">Wellness</span> Programs
            </h2>
            <div className="space-y-3 mb-8">
              {wellnessFeatures.map((feature, index) => (
                <div key={index} className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                    <ArrowRight className="w-4 h-4 text-primary-foreground" />
                  </div>
                  <span className="text-foreground">{feature}</span>
                </div>
              ))}
            </div>
            <Button className="rounded-full px-8">
              Read More
            </Button>
          </div>
        </div>
      </section>

      {/* Solutions Section */}
      <section id="about" className="bg-card py-20">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Shield className="w-6 h-6 text-primary" />
              <span className="text-sm font-medium text-muted-foreground">Our Features</span>
            </div>
            <h2 className="text-4xl font-bold text-foreground mb-4">
              Finding Health Solutions<br />with Top Experts
            </h2>
            <Button variant="outline" className="rounded-full mt-4">
              Read More
            </Button>
          </div>
          <div className="grid md:grid-cols-3 gap-6 mt-12">
            {solutions.map((solution, index) => (
              <div key={index} className="space-y-3">
                <div className="w-12 h-12 rounded-full bg-primary-light flex items-center justify-center">
                  <ArrowRight className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-foreground">{solution.title}</h3>
                <p className="text-muted-foreground">{solution.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-6 py-20">
        <div className="bg-gradient-card rounded-3xl p-12 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Heart className="w-6 h-6 text-primary" />
            <span className="text-sm font-medium text-muted-foreground">Subscribe Now</span>
          </div>
          <h2 className="text-4xl font-bold text-foreground mb-4">
            Unlock More Insights<br />with Less Effort!
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto mb-8">
            Streamline your health and get personalized care with intelligent diagnostics. 
            Sign up for our mailing list to get the most out of modern healthcare.
          </p>
          <Button 
            onClick={() => navigate("/login")}
            size="lg" 
            className="rounded-full px-8"
          >
            Subscribe Now
          </Button>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Landing;
