import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Clock, User, Calendar as CalendarIcon, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import NavigationHeader from "@/components/NavigationHeader";
import { saveAppointment, addNotification } from "@/lib/storage";

const BookAppointment = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { doctorId, doctorName, doctorSpecialty } = location.state || {};

  const [date, setDate] = useState<Date | undefined>(new Date());
  const [selectedSlot, setSelectedSlot] = useState<string>("");
  const [formData, setFormData] = useState({
    name: "",
    dob: "",
    phone: "",
    gender: "",
    weight: "",
    height: "",
    lastAppointment: "",
    registerDate: new Date().toISOString().slice(0,10),
    conditions: "",
    symptoms: "",
  });

  const morningSlots = ["09:00 AM", "09:30 AM", "10:00 AM", "10:30 AM", "11:00 AM", "11:30 AM"];
  const eveningSlots = ["02:00 PM", "02:30 PM", "03:00 PM", "03:30 PM", "04:00 PM", "04:30 PM"];

  const handleSlotSelect = (slot: string) => {
    setSelectedSlot(slot);
  };

  const handleBooking = () => {
    // Validate form
    if (!formData.name || !formData.dob || !formData.phone || !formData.symptoms) {
      toast.error("Please fill all required fields");
      return;
    }

    if (!date) {
      toast.error("Please select a date");
      return;
    }

    if (!selectedSlot) {
      toast.error("Please select a time slot");
      return;
    }

    // Save appointment to localStorage with conflict handling
    try {
      // Try to infer last appointment if not provided
      let inferredLast: string | undefined = undefined;
      try {
        const all = JSON.parse(localStorage.getItem('appointments') || '[]');
        const prev = all
          .filter((a: any) => a.patientPhone === formData.phone && a.doctorId === String(doctorId || 'unknown'))
          .sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
        inferredLast = prev ? prev.date : undefined;
      } catch {}

      const appointment = saveAppointment({
        doctorId: doctorId || 'unknown',
        doctorName: doctorName || 'Doctor',
        doctorSpecialty: doctorSpecialty || 'General',
        date: date.toISOString(),
        time: selectedSlot,
        patientName: formData.name,
        patientDob: formData.dob,
        patientPhone: formData.phone,
        symptoms: formData.symptoms,
        status: 'upcoming',
        paid: false,
        patientGender: (formData.gender as any) || undefined,
        patientWeightKg: formData.weight ? Number(formData.weight) : undefined,
        patientHeightCm: formData.height ? Number(formData.height) : undefined,
        lastAppointmentDate: formData.lastAppointment || inferredLast,
        registerDate: formData.registerDate || new Date().toISOString(),
        medicalConditions: formData.conditions
          ? formData.conditions.split(',').map((s) => s.trim()).filter(Boolean)
          : undefined,
      });

      // Add notification
    addNotification({
      type: 'appointment',
      title: 'Appointment Confirmed',
      message: `Your appointment with ${doctorName || 'Doctor'} is confirmed for ${date.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })} at ${selectedSlot}`,
      time: 'Just now',
      read: false,
      icon: 'Calendar',
    });

    // Success
      toast.success("Appointment booked successfully!");
    
    // Navigate to appointments page after a short delay
    setTimeout(() => {
      navigate("/patient/appointments");
    }, 1500);
    } catch (e: any) {
      toast.error(e?.message || 'Unable to book this slot.');
      return;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-medical flex flex-col">
      <NavigationHeader />
      <div className="container mx-auto px-4 max-w-5xl py-8 flex-1 mb-auto">
        <Button
          variant="default"
          onClick={() => navigate(-1)}
          className="mb-6 bg-[#5B68EE] hover:bg-[#4A56DD]"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <h1 className="text-3xl font-bold mb-2 animate-fade-in">Book Appointment</h1>
        {doctorName && (
          <p className="text-muted-foreground mb-6">
            with <span className="font-semibold text-foreground">{doctorName}</span> - {doctorSpecialty}
          </p>
        )}

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Left Column - Calendar & Time Slots */}
          <div className="space-y-6">
            <Card className="p-6 animate-fade-in">
              <div className="flex items-center gap-2 mb-4">
                <CalendarIcon className="w-5 h-5 text-primary" />
                <h2 className="text-xl font-semibold">Select Date</h2>
              </div>
              <div className="flex justify-center">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  disabled={(date) => date < new Date()}
                  className="rounded-md border"
                />
              </div>
            </Card>

            <Card className="p-6 animate-fade-in" style={{ animationDelay: "0.1s" }}>
              <div className="flex items-center gap-2 mb-4">
                <Clock className="w-5 h-5 text-primary" />
                <h2 className="text-xl font-semibold">Select Time Slot</h2>
              </div>

              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-3">Morning</h3>
                  <div className="grid grid-cols-3 gap-2">
                    {morningSlots.map((slot) => (
                      <Button
                        key={slot}
                        variant={selectedSlot === slot ? "default" : "outline"}
                        onClick={() => handleSlotSelect(slot)}
                        className={`text-sm ${selectedSlot === slot ? 'bg-[#5B68EE] hover:bg-[#4A56DD]' : ''}`}
                        size="sm"
                      >
                        {slot}
                      </Button>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-3">Evening</h3>
                  <div className="grid grid-cols-3 gap-2">
                    {eveningSlots.map((slot) => (
                      <Button
                        key={slot}
                        variant={selectedSlot === slot ? "default" : "outline"}
                        onClick={() => handleSlotSelect(slot)}
                        className={`text-sm ${selectedSlot === slot ? 'bg-[#5B68EE] hover:bg-[#4A56DD]' : ''}`}
                        size="sm"
                      >
                        {slot}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Right Column - Patient Details */}
          <div>
            <Card className="p-6 animate-fade-in" style={{ animationDelay: "0.2s" }}>
              <div className="flex items-center gap-2 mb-6">
                <User className="w-5 h-5 text-primary" />
                <h2 className="text-xl font-semibold">Patient Details</h2>
              </div>

              <div className="space-y-5">
                <div>
                  <Label htmlFor="name">Full Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Enter your full name"
                    className="mt-1.5"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="dob">Date of Birth *</Label>
                    <Input
                      id="dob"
                      type="date"
                      value={formData.dob}
                      onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                      className="mt-1.5"
                    />
                  </div>
                  <div>
                    <Label htmlFor="gender">Sex</Label>
                    <select id="gender" value={formData.gender} onChange={(e) => setFormData({ ...formData, gender: e.target.value })} className="mt-1.5 w-full h-10 rounded-md border px-3 bg-background">
                      <option value="">Select</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <Label htmlFor="weight">Weight (kg)</Label>
                    <Input id="weight" inputMode="decimal" value={formData.weight} onChange={(e) => setFormData({ ...formData, weight: e.target.value })} placeholder="e.g. 68" className="mt-1.5" />
                  </div>
                  <div>
                    <Label htmlFor="height">Height (cm)</Label>
                    <Input id="height" inputMode="decimal" value={formData.height} onChange={(e) => setFormData({ ...formData, height: e.target.value })} placeholder="e.g. 172" className="mt-1.5" />
                  </div>
                  <div>
                    <Label htmlFor="registerDate">Register Date</Label>
                    <Input id="registerDate" type="date" value={formData.registerDate} onChange={(e) => setFormData({ ...formData, registerDate: e.target.value })} className="mt-1.5" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="lastAppointment">Last Appointment</Label>
                    <Input id="lastAppointment" type="date" value={formData.lastAppointment} onChange={(e) => setFormData({ ...formData, lastAppointment: e.target.value })} className="mt-1.5" />
                  </div>
                  <div>
                    <Label htmlFor="conditions">Medical Conditions</Label>
                    <Input id="conditions" value={formData.conditions} onChange={(e) => setFormData({ ...formData, conditions: e.target.value })} placeholder="e.g. Diabetes, Hypertension" className="mt-1.5" />
                  </div>
                </div>

                <div>
                  <Label htmlFor="phone">Phone Number *</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="Enter your phone number"
                    className="mt-1.5"
                  />
                </div>

                <div>
                  <Label htmlFor="symptoms">Explain Symptoms *</Label>
                  <Textarea
                    id="symptoms"
                    value={formData.symptoms}
                    onChange={(e) => setFormData({ ...formData, symptoms: e.target.value })}
                    placeholder="Please describe your symptoms or health concerns in detail..."
                    rows={5}
                    className="mt-1.5"
                  />
                </div>

                {/* Summary */}
                {(date || selectedSlot) && (
                  <div className="pt-4 border-t">
                    <h3 className="text-sm font-medium text-muted-foreground mb-3">Appointment Summary</h3>
                    <div className="space-y-2 text-sm">
                      {date && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Date:</span>
                          <span className="font-medium">
                            {date.toLocaleDateString('en-IN', { 
                              weekday: 'short', 
                              year: 'numeric', 
                              month: 'short', 
                              day: 'numeric' 
                            })}
                          </span>
                        </div>
                      )}
                      {selectedSlot && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Time:</span>
                          <span className="font-medium">{selectedSlot}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <Button onClick={handleBooking} className="w-full bg-[#5B68EE] hover:bg-[#4A56DD]" size="lg">
                  Book Appointment
                </Button>
              </div>
            </Card>
          </div>
        </div>
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

export default BookAppointment;
