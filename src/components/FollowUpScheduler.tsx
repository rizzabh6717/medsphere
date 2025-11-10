import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { 
  Calendar, 
  Clock, 
  User, 
  CheckCircle, 
  AlertCircle, 
  XCircle,
  CalendarDays,
  UserCheck
} from "lucide-react";
import { toast } from "sonner";
import { DOCTORS } from "@/lib/doctors";

interface FollowUpSchedulerProps {
  patientId: string;
  patientName: string;
  currentDoctorId?: string;
  onSchedule: (followUp: any) => void;
}

const FollowUpScheduler = ({ 
  patientId, 
  patientName, 
  currentDoctorId, 
  onSchedule 
}: FollowUpSchedulerProps) => {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [selectedDoctor, setSelectedDoctor] = useState(currentDoctorId || "");
  const [notes, setNotes] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);

  // Mock doctor availability data
  const doctorAvailability = {
    "1": { days: [1, 2, 3, 4, 5], slots: ["09:00", "10:00", "11:00", "14:00", "15:00", "16:00"] },
    "2": { days: [1, 2, 4, 5, 6], slots: ["08:30", "09:30", "10:30", "13:30", "14:30", "15:30"] },
    "3": { days: [1, 3, 4, 5, 6], slots: ["09:00", "10:30", "11:30", "14:00", "15:00", "16:30"] },
    "4": { days: [1, 2, 3, 5, 6], slots: ["08:00", "09:00", "10:00", "13:00", "14:00", "15:00"] },
    "5": { days: [1, 2, 3, 4, 6], slots: ["09:30", "10:30", "11:00", "14:30", "15:30", "16:00"] },
  };

  const timeSlots = [
    "08:00", "08:30", "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
    "12:00", "13:00", "13:30", "14:00", "14:30", "15:00", "15:30", "16:00", "16:30"
  ];

  // Generate calendar days for current month
  const generateCalendarDays = () => {
    const firstDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
    const lastDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);
    const firstDayWeek = firstDay.getDay();
    const daysInMonth = lastDay.getDate();
    
    const days = [];
    
    // Previous month's days
    for (let i = firstDayWeek - 1; i >= 0; i--) {
      const prevDate = new Date(firstDay);
      prevDate.setDate(prevDate.getDate() - (i + 1));
      days.push({ date: prevDate, isCurrentMonth: false });
    }
    
    // Current month's days
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
      days.push({ date, isCurrentMonth: true });
    }
    
    // Next month's days to complete the grid
    const remainingSlots = 42 - days.length; // 6 rows * 7 days
    for (let day = 1; day <= remainingSlots; day++) {
      const nextDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, day);
      days.push({ date: nextDate, isCurrentMonth: false });
    }
    
    return days;
  };

  // Check if doctor is available on selected date
  const isDoctorAvailable = (doctorId: string, date: Date) => {
    const availability = doctorAvailability[doctorId as keyof typeof doctorAvailability];
    if (!availability) return false;
    
    const dayOfWeek = date.getDay();
    return availability.days.includes(dayOfWeek);
  };

  // Get available time slots for selected doctor and date
  const getAvailableSlots = (doctorId: string, date: Date) => {
    const availability = doctorAvailability[doctorId as keyof typeof doctorAvailability];
    if (!availability || !isDoctorAvailable(doctorId, date)) return [];
    
    // Mock some slots as booked
    const bookedSlots = ["09:00", "14:00"]; // Simulate booked appointments
    return availability.slots.filter(slot => !bookedSlots.includes(slot));
  };

  // Handle date selection
  const handleDateSelect = (date: Date) => {
    if (date < new Date()) return; // Can't select past dates
    
    setSelectedDate(date);
    setSelectedTime("");
    
    if (selectedDoctor) {
      const slots = getAvailableSlots(selectedDoctor, date);
      setAvailableSlots(slots);
    }
  };

  // Handle doctor selection
  const handleDoctorSelect = (doctorId: string) => {
    setSelectedDoctor(doctorId);
    setSelectedTime("");
    
    if (selectedDate) {
      const slots = getAvailableSlots(doctorId, selectedDate);
      setAvailableSlots(slots);
    }
  };

  // Schedule follow-up
  const handleSchedule = () => {
    if (!selectedDate || !selectedTime || !selectedDoctor) {
      toast.error("Please select date, time, and doctor");
      return;
    }

    const doctor = DOCTORS.find(d => d.id.toString() === selectedDoctor);
    const followUp = {
      id: `followup_${Date.now()}`,
      patientId,
      patientName,
      doctorId: selectedDoctor,
      doctorName: doctor?.name || "Unknown Doctor",
      doctorSpecialty: doctor?.specialization || "",
      date: selectedDate.toISOString(),
      time: selectedTime,
      notes,
      status: "scheduled",
      createdAt: new Date().toISOString(),
      isReassigned: selectedDoctor !== currentDoctorId,
      originalDoctorId: currentDoctorId
    };

    onSchedule(followUp);
    toast.success("Follow-up scheduled successfully!");
    
    // Reset form
    setSelectedDate(null);
    setSelectedTime("");
    setSelectedDoctor(currentDoctorId || "");
    setNotes("");
    setIsOpen(false);
  };

  const calendarDays = generateCalendarDays();
  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button 
          className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl"
          size="sm"
        >
          <CalendarDays className="w-4 h-4 mr-2" />
          Schedule Follow-Up
        </Button>
      </DialogTrigger>
      
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-blue-600" />
            Schedule Follow-Up for {patientName}
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          {/* Calendar Section */}
          <div className="space-y-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center justify-between">
                  <span>Select Date</span>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
                    >
                      ←
                    </Button>
                    <span className="text-sm font-medium py-1 px-3">
                      {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
                    >
                      →
                    </Button>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-7 gap-1 mb-2">
                  {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(day => (
                    <div key={day} className="text-center text-xs font-medium text-gray-500 py-2">
                      {day}
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-7 gap-1">
                  {calendarDays.map((day, index) => {
                    const isToday = day.date.toDateString() === new Date().toDateString();
                    const isPast = day.date < new Date();
                    const isSelected = selectedDate?.toDateString() === day.date.toDateString();
                    const hasAvailability = selectedDoctor ? isDoctorAvailable(selectedDoctor, day.date) : true;
                    
                    return (
                      <button
                        key={index}
                        onClick={() => day.isCurrentMonth && !isPast && handleDateSelect(day.date)}
                        disabled={!day.isCurrentMonth || isPast || (selectedDoctor && !hasAvailability)}
                        className={`
                          aspect-square text-sm rounded-lg transition-all duration-200
                          ${!day.isCurrentMonth ? 'text-gray-300' : ''}
                          ${isPast ? 'text-gray-300 cursor-not-allowed' : ''}
                          ${isToday ? 'bg-blue-100 text-blue-700 font-semibold' : ''}
                          ${isSelected ? 'bg-blue-600 text-white font-semibold' : ''}
                          ${!isSelected && !isPast && day.isCurrentMonth ? 'hover:bg-blue-50' : ''}
                          ${selectedDoctor && !hasAvailability && !isPast ? 'bg-red-50 text-red-400 cursor-not-allowed' : ''}
                        `}
                      >
                        {day.date.getDate()}
                      </button>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Doctor and Time Selection */}
          <div className="space-y-4">
            {/* Doctor Selection */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <User className="w-5 h-5 text-blue-600" />
                  Select Doctor
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {DOCTORS.map(doctor => {
                    const isAvailable = selectedDate ? isDoctorAvailable(doctor.id.toString(), selectedDate) : true;
                    const isSelected = selectedDoctor === doctor.id.toString();
                    
                    return (
                      <div
                        key={doctor.id}
                        onClick={() => isAvailable && handleDoctorSelect(doctor.id.toString())}
                        className={`
                          p-3 rounded-xl border-2 cursor-pointer transition-all duration-200
                          ${isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}
                          ${!isAvailable ? 'opacity-50 cursor-not-allowed bg-gray-50' : 'hover:border-blue-300'}
                        `}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-gray-800">{doctor.name}</p>
                            <p className="text-sm text-gray-600">{doctor.specialization}</p>
                          </div>
                          {isSelected && (
                            <CheckCircle className="w-5 h-5 text-blue-600" />
                          )}
                          {!isAvailable && selectedDate && (
                            <XCircle className="w-5 h-5 text-red-500" />
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Time Selection */}
            {selectedDate && selectedDoctor && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Clock className="w-5 h-5 text-blue-600" />
                    Select Time
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-2">
                    {availableSlots.map(slot => (
                      <Button
                        key={slot}
                        variant={selectedTime === slot ? "default" : "outline"}
                        size="sm"
                        onClick={() => setSelectedTime(slot)}
                        className={`
                          ${selectedTime === slot ? 'bg-blue-600 hover:bg-blue-700' : 'hover:bg-blue-50'}
                        `}
                      >
                        {slot}
                      </Button>
                    ))}
                  </div>
                  {availableSlots.length === 0 && (
                    <p className="text-sm text-gray-500 text-center py-4">
                      No available slots for selected date
                    </p>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Notes */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Notes (Optional)</CardTitle>
              </CardHeader>
              <CardContent>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add any additional notes for the follow-up..."
                  className="w-full p-3 border border-gray-200 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={3}
                />
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Schedule Button */}
        <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
          <Button
            variant="outline"
            onClick={() => setIsOpen(false)}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSchedule}
            disabled={!selectedDate || !selectedTime || !selectedDoctor}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <UserCheck className="w-4 h-4 mr-2" />
            Schedule Follow-Up
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default FollowUpScheduler;