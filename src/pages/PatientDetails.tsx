import { useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CreditCard, User } from "lucide-react";
import { toast } from "sonner";
import BackButton from "@/components/BackButton";

const PatientDetails = () => {
  const { doctorId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { date, slot } = location.state || {};

  const [formData, setFormData] = useState({
    fullName: "",
    age: "",
    gender: "",
    weight: "",
    mobile: "",
    problem: "",
    relationship: "self",
    visitType: "first-visit",
  });

  const consultationFee = 500;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName || !formData.age || !formData.mobile || !formData.problem) {
      toast.error("Please fill all required fields");
      return;
    }
    navigate("/appointment-scheduled", { 
      state: { doctorId, date, slot, ...formData }
    });
  };

  const handlePayment = () => {
    toast.success("Payment processed successfully!");
    setTimeout(() => {
      navigate("/appointment-scheduled", { 
        state: { doctorId, date, slot, ...formData, paid: true }
      });
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gradient-medical py-8 flex flex-col">
      <div className="container mx-auto px-4 max-w-4xl flex-1">
        <BackButton />
        <h1 className="text-3xl font-bold mb-6 animate-fade-in">Patient Details</h1>

        <div className="grid md:grid-cols-3 gap-6">
          <Card className="md:col-span-2 p-6 animate-fade-in">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="flex items-center gap-2 mb-4">
                <User className="w-5 h-5 text-primary" />
                <h2 className="text-xl font-semibold">Patient Information</h2>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="fullName">Full Name *</Label>
                  <Input
                    id="fullName"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    placeholder="Enter full name"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="age">Age *</Label>
                  <Input
                    id="age"
                    type="number"
                    value={formData.age}
                    onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                    placeholder="Enter age"
                    required
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="gender">Gender</Label>
                  <Select value={formData.gender} onValueChange={(value) => setFormData({ ...formData, gender: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="weight">Weight (kg)</Label>
                  <Input
                    id="weight"
                    type="number"
                    value={formData.weight}
                    onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                    placeholder="Enter weight"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="mobile">Mobile Number *</Label>
                <Input
                  id="mobile"
                  type="tel"
                  value={formData.mobile}
                  onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                  placeholder="Enter mobile number"
                  required
                />
              </div>

              <div>
                <Label htmlFor="problem">Describe Your Problem *</Label>
                <Textarea
                  id="problem"
                  value={formData.problem}
                  onChange={(e) => setFormData({ ...formData, problem: e.target.value })}
                  placeholder="Please describe your symptoms or health concerns"
                  rows={4}
                  required
                />
              </div>

              <div>
                <Label>Relationship to Patient</Label>
                <RadioGroup value={formData.relationship} onValueChange={(value) => setFormData({ ...formData, relationship: value })}>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="self" id="self" />
                    <Label htmlFor="self">Self</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="family" id="family" />
                    <Label htmlFor="family">Family Member</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="friend" id="friend" />
                    <Label htmlFor="friend">Friend</Label>
                  </div>
                </RadioGroup>
              </div>

              <div>
                <Label>Visit Type</Label>
                <RadioGroup value={formData.visitType} onValueChange={(value) => setFormData({ ...formData, visitType: value })}>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="first-visit" id="first-visit" />
                    <Label htmlFor="first-visit">First Visit</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="follow-up" id="follow-up" />
                    <Label htmlFor="follow-up">Follow-up</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="quick-query" id="quick-query" />
                    <Label htmlFor="quick-query">Quick Query</Label>
                  </div>
                </RadioGroup>
              </div>
            </form>
          </Card>

          <div className="space-y-4">
            <Card className="p-6 animate-fade-in" style={{ animationDelay: "0.1s" }}>
              <div className="flex items-center gap-2 mb-4">
                <CreditCard className="w-5 h-5 text-primary" />
                <h2 className="text-xl font-semibold">Payment Summary</h2>
              </div>
              
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Consultation Fee</span>
                  <span className="font-medium">₹{consultationFee}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Platform Fee</span>
                  <span className="font-medium">₹50</span>
                </div>
                <div className="border-t pt-3 flex justify-between">
                  <span className="font-semibold">Total Amount</span>
                  <span className="text-xl font-bold text-primary">₹{consultationFee + 50}</span>
                </div>
              </div>

              <Button className="w-full mt-6" size="lg" onClick={handlePayment}>
                Pay Now
              </Button>
            </Card>

            <Card className="p-4 bg-accent/50">
              <p className="text-sm text-muted-foreground">
                Save patient details to Friends & Family for quick booking next time
              </p>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientDetails;
