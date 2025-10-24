import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Users, Plus, Calendar, Trash2, Share2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import NavigationHeader from "@/components/NavigationHeader";
import { toast } from "sonner";
import { getFamilyMembers, saveFamilyMember, deleteFamilyMember, type FamilyMember } from "@/lib/storage";

const FriendsFamily = () => {
  const navigate = useNavigate();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [members, setMembers] = useState<FamilyMember[]>([]);
  const [newMember, setNewMember] = useState({
    name: "",
    relationship: "",
    age: "",
    phone: "",
  });

  useEffect(() => {
    setMembers(getFamilyMembers());
  }, []);

  const handleAddMember = () => {
    if (!newMember.name || !newMember.relationship || !newMember.age) {
      toast.error("Please fill all required fields");
      return;
    }

    const savedMember = saveFamilyMember({
      name: newMember.name,
      relationship: newMember.relationship,
      age: parseInt(newMember.age),
      phone: newMember.phone,
    });

    setMembers(getFamilyMembers());
    setNewMember({ name: "", relationship: "", age: "", phone: "" });
    setIsAddDialogOpen(false);
    toast.success("Care seeker added successfully!");
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to remove this care seeker?")) {
      deleteFamilyMember(id);
      setMembers(getFamilyMembers());
      toast.success("Care seeker removed");
    }
  };

  const handleBookAppointment = (member: any) => {
    toast.success(`Booking appointment for ${member.name}`);
    navigate("/dashboard");
  };

  const handleInvite = (member: any) => {
    toast.success(`Invitation sent to ${member.name}`);
  };

  return (
    <div className="min-h-screen bg-gradient-medical">
      <NavigationHeader />
      <div className="container mx-auto px-4 max-w-4xl py-8">
        <div className="flex items-center justify-between mb-6 animate-fade-in">
          <div className="flex items-center gap-3">
            <Users className="w-8 h-8 text-primary" />
            <h1 className="text-3xl font-bold">Friends & Family</h1>
          </div>
          
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Add Care Seeker
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Care Seeker</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <div>
                  <Label htmlFor="name">Full Name *</Label>
                  <Input
                    id="name"
                    value={newMember.name}
                    onChange={(e) => setNewMember({ ...newMember, name: e.target.value })}
                    placeholder="Enter full name"
                  />
                </div>
                <div>
                  <Label htmlFor="relationship">Relationship *</Label>
                  <Select
                    value={newMember.relationship}
                    onValueChange={(value) => setNewMember({ ...newMember, relationship: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select relationship" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Father">Father</SelectItem>
                      <SelectItem value="Mother">Mother</SelectItem>
                      <SelectItem value="Son">Son</SelectItem>
                      <SelectItem value="Daughter">Daughter</SelectItem>
                      <SelectItem value="Spouse">Spouse</SelectItem>
                      <SelectItem value="Sibling">Sibling</SelectItem>
                      <SelectItem value="Friend">Friend</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="age">Age *</Label>
                  <Input
                    id="age"
                    type="number"
                    value={newMember.age}
                    onChange={(e) => setNewMember({ ...newMember, age: e.target.value })}
                    placeholder="Enter age"
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={newMember.phone}
                    onChange={(e) => setNewMember({ ...newMember, phone: e.target.value })}
                    placeholder="Enter phone number"
                  />
                </div>
                <Button onClick={handleAddMember} className="w-full">
                  Add Care Seeker
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid gap-4">
          {members.map((member, index) => (
            <Card
              key={member.id}
              className="p-6 animate-fade-in hover:shadow-md transition-shadow"
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-xl font-semibold">{member.name}</h3>
                    <Badge variant="secondary">{member.relationship}</Badge>
                  </div>
                  <div className="grid md:grid-cols-2 gap-2 text-sm text-muted-foreground">
                    <p>Age: {member.age} years</p>
                    <p>Phone: {member.phone}</p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleInvite(member)}
                    title="Invite Care Seeker"
                  >
                    <Share2 className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleDelete(member.id)}
                    title="Remove"
                  >
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t">
                <Button
                  onClick={() => handleBookAppointment(member)}
                  className="w-full"
                >
                  <Calendar className="w-4 h-4 mr-2" />
                  Book Appointment for {member.name}
                </Button>
              </div>
            </Card>
          ))}
        </div>

        {members.length === 0 && (
          <Card className="p-12 text-center">
            <Users className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">No Care Seekers Added</h3>
            <p className="text-muted-foreground mb-6">
              Add your family members and friends to quickly book appointments for them
            </p>
            <Button onClick={() => setIsAddDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Your First Care Seeker
            </Button>
          </Card>
        )}

        <Card className="mt-6 p-4 bg-accent/50 animate-fade-in">
          <p className="text-sm text-muted-foreground">
            <strong>Tip:</strong> Use "Invite Care Seeker" to send them an invitation to join the platform.
            They can then manage their own appointments while you stay informed.
          </p>
        </Card>
      </div>
    </div>
  );
};

export default FriendsFamily;
