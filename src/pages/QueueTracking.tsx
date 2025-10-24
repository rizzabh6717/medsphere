import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import NavigationHeader from "@/components/NavigationHeader";
import {
  Users,
  Clock,
  Calendar,
  MapPin,
  Bell,
  CheckCircle2,
  ArrowRight,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const QueueTracking = () => {
  const navigate = useNavigate();
  const [currentToken, setCurrentToken] = useState(42);
  const [patientsAhead, setPatientsAhead] = useState(15);
  const [estimatedTime, setEstimatedTime] = useState("8:20 PM");
  const [queueStatus, setQueueStatus] = useState<
    "Waiting" | "Active" | "Completed"
  >("Waiting");

  // Simulate queue progress
  useEffect(() => {
    const interval = setInterval(() => {
      setPatientsAhead((prev) => {
        if (prev > 0) return prev - 1;
        if (prev === 0 && queueStatus === "Waiting") {
          setQueueStatus("Active");
        }
        return prev;
      });
    }, 5000);

    return () => clearInterval(interval);
  }, [queueStatus]);

  const appointment = {
    doctor: "Dr. Prakash Das",
    specialty: "Cardiologist",
    date: "July 28, 2023",
    time: "7:00 PM",
    location: "Apollo Hospital, Mumbai",
    floor: "3rd Floor, Room 302",
  };

  const queueStats = [
    {
      label: "Your Token",
      value: `#${currentToken}`,
      icon: Bell,
      color: "text-primary",
    },
    {
      label: "Current Token",
      value: `#${currentToken - patientsAhead}`,
      icon: Users,
      color: "text-secondary",
    },
    {
      label: "Patients Ahead",
      value: patientsAhead.toString(),
      icon: Users,
      color: "text-accent",
    },
    {
      label: "Expected Time",
      value: estimatedTime,
      icon: Clock,
      color: "text-primary",
    },
  ];

  const getStatusColor = () => {
    switch (queueStatus) {
      case "Waiting":
        return "bg-yellow-500";
      case "Active":
        return "bg-green-500";
      case "Completed":
        return "bg-blue-500";
    }
  };

  const getProgressValue = () => {
    const total = 20; // Total estimated patients
    const completed = total - patientsAhead;
    return (completed / total) * 100;
  };

  return (
    <div className="min-h-screen bg-gradient-medical">
      <NavigationHeader />
      <div className="container mx-auto px-4 max-w-4xl py-8">
        <div className="mb-8 animate-fade-in">
          <h1 className="text-3xl font-bold mb-2">Queue Tracking</h1>
          <p className="text-muted-foreground">
            Real-time updates on your appointment queue status
          </p>
        </div>

        {/* Status Banner */}
        <Card className="p-6 mb-6 animate-scale-in">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div
                className={`w-3 h-3 rounded-full ${getStatusColor()} animate-pulse`}
              ></div>
              <div>
                <h3 className="font-bold text-xl">Status: {queueStatus}</h3>
                <p className="text-sm text-muted-foreground">
                  {queueStatus === "Waiting" &&
                    "You're in the queue. Please wait for your turn."}
                  {queueStatus === "Active" &&
                    "It's your turn! Please proceed to the consultation room."}
                  {queueStatus === "Completed" &&
                    "Your consultation is complete."}
                </p>
              </div>
            </div>
            <Badge
              variant={
                queueStatus === "Active" ? "default" : "secondary"
              }
              className="text-lg px-4 py-2"
            >
              #{currentToken}
            </Badge>
          </div>

          <Progress value={getProgressValue()} className="h-2" />
          <p className="text-xs text-muted-foreground mt-2">
            {Math.round(getProgressValue())}% through the queue
          </p>
        </Card>

        {/* Queue Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {queueStats.map((stat, index) => (
            <Card
              key={stat.label}
              className="p-4 text-center animate-fade-in"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <stat.icon className={`w-6 h-6 mx-auto mb-2 ${stat.color}`} />
              <div className="text-2xl font-bold mb-1">{stat.value}</div>
              <div className="text-xs text-muted-foreground">{stat.label}</div>
            </Card>
          ))}
        </div>

        {/* Appointment Details */}
        <Card className="p-6 mb-6 animate-fade-in">
          <h3 className="font-bold text-lg mb-4">Appointment Details</h3>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <Users className="w-5 h-5 text-primary mt-0.5" />
              <div>
                <p className="text-sm text-muted-foreground">Doctor</p>
                <p className="font-semibold">{appointment.doctor}</p>
                <p className="text-sm text-muted-foreground">
                  {appointment.specialty}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Calendar className="w-5 h-5 text-primary mt-0.5" />
              <div>
                <p className="text-sm text-muted-foreground">Date & Time</p>
                <p className="font-semibold">
                  {appointment.date} at {appointment.time}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-primary mt-0.5" />
              <div>
                <p className="text-sm text-muted-foreground">Location</p>
                <p className="font-semibold">{appointment.location}</p>
                <p className="text-sm text-muted-foreground">
                  {appointment.floor}
                </p>
              </div>
            </div>
          </div>
        </Card>

        {/* Timeline */}
        <Card className="p-6 mb-6">
          <h3 className="font-bold text-lg mb-4">Queue Timeline</h3>
          <div className="space-y-4">
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center flex-shrink-0">
                <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
              <div className="flex-1">
                <p className="font-semibold">Checked In</p>
                <p className="text-sm text-muted-foreground">6:55 PM</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div
                className={`w-8 h-8 rounded-full ${
                  queueStatus === "Waiting"
                    ? "bg-yellow-100 dark:bg-yellow-900/20"
                    : "bg-green-100 dark:bg-green-900/20"
                } flex items-center justify-center flex-shrink-0`}
              >
                {queueStatus === "Waiting" ? (
                  <Clock
                    className={`w-5 h-5 ${
                      queueStatus === "Waiting"
                        ? "text-yellow-600 dark:text-yellow-400"
                        : "text-green-600 dark:text-green-400"
                    }`}
                  />
                ) : (
                  <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />
                )}
              </div>
              <div className="flex-1">
                <p className="font-semibold">In Queue</p>
                <p className="text-sm text-muted-foreground">
                  {patientsAhead} patients ahead
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div
                className={`w-8 h-8 rounded-full ${
                  queueStatus === "Active"
                    ? "bg-blue-100 dark:bg-blue-900/20"
                    : "bg-accent"
                } flex items-center justify-center flex-shrink-0`}
              >
                <ArrowRight
                  className={`w-5 h-5 ${
                    queueStatus === "Active"
                      ? "text-blue-600 dark:text-blue-400"
                      : "text-muted-foreground"
                  }`}
                />
              </div>
              <div className="flex-1">
                <p className="font-semibold">Your Turn</p>
                <p className="text-sm text-muted-foreground">
                  Expected around {estimatedTime}
                </p>
              </div>
            </div>
          </div>
        </Card>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            variant="outline"
            onClick={() => navigate("/appointments")}
            className="flex-1"
          >
            View All Appointments
          </Button>
          <Button onClick={() => navigate("/reschedule")} className="flex-1">
            <Calendar className="w-4 h-4 mr-2" />
            Reschedule
          </Button>
        </div>

        {/* Reminder */}
        <Card className="p-4 mt-6 bg-accent/30 border-primary/20">
          <div className="flex items-start gap-3">
            <Bell className="w-5 h-5 text-primary mt-0.5" />
            <div>
              <p className="font-semibold text-sm">Reminder Enabled</p>
              <p className="text-xs text-muted-foreground">
                You'll receive a notification when it's almost your turn
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default QueueTracking;
