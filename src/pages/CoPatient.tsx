import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, Calendar, MessageCircle, Star, MapPin } from "lucide-react";
import { useNavigate } from "react-router-dom";
import NavigationHeader from "@/components/NavigationHeader";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const CoPatient = () => {
  const navigate = useNavigate();
  const [showJoinDialog, setShowJoinDialog] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<any>(null);

  const patientGroups = [
    {
      id: 1,
      doctor: "Dr. Prakash Das",
      specialty: "Cardiologist",
      date: "July 28, 2023",
      time: "10:00 AM",
      location: "Apollo Hospital, Mumbai",
      members: 8,
      availableSlots: 3,
      image: "/placeholder.svg",
    },
    {
      id: 2,
      doctor: "Dr. Anjali Sharma",
      specialty: "Pediatrician",
      date: "July 29, 2023",
      time: "2:30 PM",
      location: "Lilavati Hospital, Mumbai",
      members: 5,
      availableSlots: 5,
      image: "/placeholder.svg",
    },
    {
      id: 3,
      doctor: "Dr. Rajesh Kumar",
      specialty: "Orthopedic",
      date: "July 30, 2023",
      time: "11:00 AM",
      location: "Fortis Hospital, Mumbai",
      members: 12,
      availableSlots: 2,
      image: "/placeholder.svg",
    },
  ];

  const handleJoinGroup = (group: any) => {
    setSelectedGroup(group);
    setShowJoinDialog(true);
  };

  const confirmJoin = () => {
    setShowJoinDialog(false);
    // Navigate to book appointment with pre-filled data
navigate("/patient/book-appointment", {
      state: {
        doctorId: selectedGroup.id,
        groupBooking: true,
      },
    });
  };

  return (
    <div className="min-h-screen bg-gradient-medical">
      <NavigationHeader />
      <div className="container mx-auto px-4 max-w-4xl py-8">
        <div className="mb-8 animate-fade-in">
          <h1 className="text-3xl font-bold mb-2">Co-Patient Groups</h1>
          <p className="text-muted-foreground">
            Join other patients visiting the same doctor and share experiences
          </p>
        </div>

        <div className="grid gap-6">
          {patientGroups.map((group, index) => (
            <Card
              key={group.id}
              className="p-6 animate-fade-in hover:shadow-lg transition-all"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="flex flex-col md:flex-row gap-6">
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-bold mb-1">{group.doctor}</h3>
                      <p className="text-muted-foreground">{group.specialty}</p>
                    </div>
                    <Badge variant="secondary">
                      <Users className="w-3 h-3 mr-1" />
                      {group.members} Members
                    </Badge>
                  </div>

                  <div className="space-y-3 mb-4">
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="w-4 h-4 text-primary" />
                      <span>
                        {group.date} at {group.time}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="w-4 h-4 text-primary" />
                      <span>{group.location}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 mb-4">
                    <div className="flex-1">
                      <div className="text-sm text-muted-foreground mb-1">
                        Available Slots
                      </div>
                      <div className="text-2xl font-bold text-primary">
                        {group.availableSlots}
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="text-sm text-muted-foreground mb-1">
                        Group Status
                      </div>
                      <Badge variant="default">Active</Badge>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Button
                      onClick={() => handleJoinGroup(group)}
                      className="flex-1"
                    >
                      <Users className="w-4 h-4 mr-2" />
                      Yes, Join Me
                    </Button>
                    <Button variant="outline" className="flex-1">
                      <MessageCircle className="w-4 h-4 mr-2" />
                      Chat with Group
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>

        <Card className="p-6 mt-8 bg-accent/30 border-primary/20">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Star className="w-6 h-6 text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold mb-2">
                Enjoyed your experience? Leave a review!
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                Help others by sharing your experience on Google Reviews
              </p>
              <Button variant="outline">
                <Star className="w-4 h-4 mr-2" />
                Write a Google Review
              </Button>
            </div>
          </div>
        </Card>
      </div>

      <Dialog open={showJoinDialog} onOpenChange={setShowJoinDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Join Co-Patient Group</DialogTitle>
            <DialogDescription>
              You'll be joining {selectedGroup?.members} other patients visiting{" "}
              {selectedGroup?.doctor} on {selectedGroup?.date} at{" "}
              {selectedGroup?.time}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-muted-foreground">
              Benefits of joining:
            </p>
            <ul className="mt-2 space-y-2 text-sm">
              <li className="flex items-center gap-2">
                <Users className="w-4 h-4 text-primary" />
                Connect with other patients
              </li>
              <li className="flex items-center gap-2">
                <MessageCircle className="w-4 h-4 text-primary" />
                Share experiences and tips
              </li>
              <li className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-primary" />
                Get appointment reminders together
              </li>
            </ul>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowJoinDialog(false)}>
              Cancel
            </Button>
            <Button onClick={confirmJoin}>Confirm & Book Appointment</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CoPatient;
