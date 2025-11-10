import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Calendar, 
  Clock, 
  User, 
  Bell, 
  CheckCircle, 
  AlertTriangle, 
  XCircle,
  RefreshCw,
  UserX,
  CalendarX
} from "lucide-react";
import { toast } from "sonner";
import FollowUpScheduler from "./FollowUpScheduler";
import { DOCTORS } from "@/lib/doctors";

interface FollowUp {
  id: string;
  patientId: string;
  patientName: string;
  doctorId: string;
  doctorName: string;
  doctorSpecialty: string;
  date: string;
  time: string;
  notes?: string;
  status: "scheduled" | "completed" | "missed" | "rescheduled";
  createdAt: string;
  isReassigned?: boolean;
  originalDoctorId?: string;
}

interface FollowUpCardProps {
  followUp: FollowUp;
  onStatusUpdate: (id: string, status: string) => void;
  onReschedule: (followUp: FollowUp) => void;
  viewMode?: "doctor" | "patient";
}

const FollowUpCard = ({ 
  followUp, 
  onStatusUpdate, 
  onReschedule, 
  viewMode = "patient" 
}: FollowUpCardProps) => {
  const [timeUntilAppointment, setTimeUntilAppointment] = useState<string>("");
  const [urgencyLevel, setUrgencyLevel] = useState<"normal" | "due-soon" | "overdue">("normal");

  useEffect(() => {
    const updateTimeUntil = () => {
      const now = new Date();
      const appointmentDate = new Date(`${followUp.date.split('T')[0]}T${followUp.time}:00`);
      const timeDiff = appointmentDate.getTime() - now.getTime();
      
      if (timeDiff < 0) {
        // Appointment is overdue
        const overdueDays = Math.floor(Math.abs(timeDiff) / (1000 * 60 * 60 * 24));
        setTimeUntilAppointment(`${overdueDays} day(s) overdue`);
        setUrgencyLevel("overdue");
        
        // Show notification for overdue if not already completed
        if (followUp.status === "scheduled") {
          toast.error(`Follow-up with ${followUp.doctorName} is overdue!`, {
            duration: 5000,
          });
        }
      } else {
        // Appointment is in the future
        const hoursUntil = Math.floor(timeDiff / (1000 * 60 * 60));
        const daysUntil = Math.floor(hoursUntil / 24);
        
        if (hoursUntil <= 24) {
          setTimeUntilAppointment(`${hoursUntil} hour(s) remaining`);
          setUrgencyLevel("due-soon");
          
          // Show notification for upcoming appointment
          if (followUp.status === "scheduled" && hoursUntil <= 2) {
            toast.warning(`Follow-up with ${followUp.doctorName} in ${hoursUntil} hour(s)!`, {
              duration: 5000,
            });
          }
        } else {
          setTimeUntilAppointment(`${daysUntil} day(s) remaining`);
          setUrgencyLevel("normal");
        }
      }
    };

    updateTimeUntil();
    const interval = setInterval(updateTimeUntil, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [followUp.date, followUp.time, followUp.doctorName, followUp.status]);

  const getStatusBadge = () => {
    switch (followUp.status) {
      case "scheduled":
        return urgencyLevel === "overdue" ? (
          <Badge className="bg-red-100 text-red-700 border-red-200">
            <XCircle className="w-3 h-3 mr-1" />
            Overdue
          </Badge>
        ) : urgencyLevel === "due-soon" ? (
          <Badge className="bg-orange-100 text-orange-700 border-orange-200">
            <AlertTriangle className="w-3 h-3 mr-1" />
            Due Soon
          </Badge>
        ) : (
          <Badge className="bg-blue-100 text-blue-700 border-blue-200">
            <Calendar className="w-3 h-3 mr-1" />
            Scheduled
          </Badge>
        );
      case "completed":
        return (
          <Badge className="bg-green-100 text-green-700 border-green-200">
            <CheckCircle className="w-3 h-3 mr-1" />
            Completed
          </Badge>
        );
      case "missed":
        return (
          <Badge className="bg-red-100 text-red-700 border-red-200">
            <CalendarX className="w-3 h-3 mr-1" />
            Missed
          </Badge>
        );
      case "rescheduled":
        return (
          <Badge className="bg-purple-100 text-purple-700 border-purple-200">
            <RefreshCw className="w-3 h-3 mr-1" />
            Rescheduled
          </Badge>
        );
      default:
        return null;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getCardBorderColor = () => {
    if (followUp.status === "completed") return "border-green-200";
    if (followUp.status === "missed") return "border-red-200";
    if (urgencyLevel === "overdue") return "border-red-300";
    if (urgencyLevel === "due-soon") return "border-orange-300";
    return "border-blue-200";
  };

  return (
    <Card className={`hover:shadow-md transition-all duration-200 ${getCardBorderColor()} border-l-4`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <User className="w-5 h-5 text-blue-600" />
              {viewMode === "doctor" ? followUp.patientName : followUp.doctorName}
            </CardTitle>
            {viewMode === "patient" && (
              <p className="text-sm text-gray-600 mt-1">{followUp.doctorSpecialty}</p>
            )}
            {followUp.isReassigned && (
              <div className="mt-2">
                <Badge variant="outline" className="text-xs bg-yellow-50 text-yellow-700 border-yellow-200">
                  <UserX className="w-3 h-3 mr-1" />
                  {(() => {
                    const orig = DOCTORS.find(d => d.id.toString() === String(followUp.originalDoctorId));
                    const name = orig?.name || (followUp.originalDoctorId ? `Dr. ${followUp.originalDoctorId}` : 'Previous Doctor');
                    return `Reassigned from ${name}`;
                  })()}
                </Badge>
              </div>
            )}
          </div>
          <div className="flex flex-col items-end gap-2">
            {getStatusBadge()}
            {followUp.status === "scheduled" && urgencyLevel !== "normal" && (
              <div className="flex items-center gap-1 text-xs text-gray-500">
                <Bell className="w-3 h-3" />
                {timeUntilAppointment}
              </div>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Date and Time */}
        <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-medium">{formatDate(followUp.date)}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-medium">{followUp.time}</span>
          </div>
        </div>

        {/* Notes */}
        {followUp.notes && (
          <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-sm text-blue-800">
              <strong>Notes:</strong> {followUp.notes}
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2 pt-2">
          {followUp.status === "scheduled" && (
            <>
              <Button
                size="sm"
                onClick={() => onStatusUpdate(followUp.id, "completed")}
                className="bg-green-600 hover:bg-green-700 text-white rounded-xl"
              >
                <CheckCircle className="w-4 h-4 mr-1" />
                Mark Complete
              </Button>
              
              <FollowUpScheduler
                patientId={followUp.patientId}
                patientName={followUp.patientName}
                currentDoctorId={followUp.doctorId}
                onSchedule={(newFollowUp) => {
                  onStatusUpdate(followUp.id, "rescheduled");
                  onReschedule(newFollowUp);
                }}
              />
              
            </>
          )}
          
          {followUp.status === "missed" && (
            <FollowUpScheduler
              patientId={followUp.patientId}
              patientName={followUp.patientName}
              currentDoctorId={followUp.doctorId}
              onSchedule={(newFollowUp) => {
                onReschedule(newFollowUp);
              }}
            />
          )}
          
          {followUp.status === "completed" && (
            <div className="flex items-center gap-2 text-green-600 text-sm">
              <CheckCircle className="w-4 h-4" />
              Follow-up completed successfully
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default FollowUpCard;