import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import NavigationHeader from "@/components/NavigationHeader";
import {
  MessageCircle,
  Clock,
  CheckCircle2,
  AlertCircle,
  Plus,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const Support = () => {
  const [showNewTicket, setShowNewTicket] = useState(false);

  const tickets = {
    open: [
      {
        id: "TKT-001",
        subject: "Payment not reflected",
        description: "I paid ₹550 but appointment shows pending",
        status: "In Progress",
        created: "2 hours ago",
        priority: "high",
      },
      {
        id: "TKT-002",
        subject: "Unable to reschedule appointment",
        description: "Getting error when trying to change appointment time",
        status: "Waiting",
        created: "5 hours ago",
        priority: "medium",
      },
    ],
    resolved: [
      {
        id: "TKT-003",
        subject: "OTP not received",
        description: "Not getting OTP on my mobile number",
        status: "Resolved",
        created: "1 day ago",
        resolvedAt: "23 hours ago",
        priority: "high",
      },
      {
        id: "TKT-004",
        subject: "Profile update issue",
        description: "Cannot update my profile information",
        status: "Resolved",
        created: "2 days ago",
        resolvedAt: "1 day ago",
        priority: "low",
      },
    ],
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "In Progress":
        return <Clock className="w-4 h-4" />;
      case "Resolved":
        return <CheckCircle2 className="w-4 h-4" />;
      default:
        return <AlertCircle className="w-4 h-4" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "destructive";
      case "medium":
        return "secondary";
      default:
        return "outline";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-medical">
      <NavigationHeader />
      <div className="container mx-auto px-4 max-w-4xl py-8">
        <div className="flex items-center justify-between mb-6 animate-fade-in">
          <div>
            <h1 className="text-3xl font-bold mb-2">Customer Support</h1>
            <p className="text-muted-foreground">
              We're here to help with any questions or issues
            </p>
          </div>
          <Dialog open={showNewTicket} onOpenChange={setShowNewTicket}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                New Ticket
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[525px]">
              <DialogHeader>
                <DialogTitle>Create Support Ticket</DialogTitle>
                <DialogDescription>
                  Describe your issue and we'll get back to you soon
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div>
                  <Label htmlFor="subject">Subject</Label>
                  <Input
                    id="subject"
                    placeholder="Brief description of your issue"
                    className="mt-1.5"
                  />
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Please provide details about your issue"
                    rows={4}
                    className="mt-1.5"
                  />
                </div>
                <div>
                  <Label htmlFor="priority">Priority</Label>
                  <select
                    id="priority"
                    className="w-full mt-1.5 rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setShowNewTicket(false)}
                >
                  Cancel
                </Button>
                <Button onClick={() => setShowNewTicket(false)}>
                  Submit Ticket
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <Tabs defaultValue="open" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="open">
              Open ({tickets.open.length})
            </TabsTrigger>
            <TabsTrigger value="resolved">
              Resolved ({tickets.resolved.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="open" className="space-y-4 mt-6">
            {tickets.open.map((ticket, index) => (
              <Card
                key={ticket.id}
                className="p-6 animate-fade-in hover:shadow-md transition-all"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <MessageCircle className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-bold">{ticket.subject}</h3>
                        <Badge variant={getPriorityColor(ticket.priority)}>
                          {ticket.priority}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Ticket #{ticket.id}
                      </p>
                    </div>
                  </div>
                  <Badge variant="secondary" className="gap-1">
                    {getStatusIcon(ticket.status)}
                    {ticket.status}
                  </Badge>
                </div>

                <p className="text-sm mb-4">{ticket.description}</p>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">
                    Created {ticket.created}
                  </span>
                  <Button variant="outline" size="sm">
                    View Details
                  </Button>
                </div>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="resolved" className="space-y-4 mt-6">
            {tickets.resolved.map((ticket, index) => (
              <Card
                key={ticket.id}
                className="p-6 animate-fade-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
                      <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-bold">{ticket.subject}</h3>
                        <Badge variant={getPriorityColor(ticket.priority)}>
                          {ticket.priority}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Ticket #{ticket.id}
                      </p>
                    </div>
                  </div>
                  <Badge variant="default" className="gap-1 bg-green-600">
                    <CheckCircle2 className="w-4 h-4" />
                    Resolved
                  </Badge>
                </div>

                <p className="text-sm mb-4">{ticket.description}</p>

                <div className="flex items-center justify-between text-sm">
                  <div className="text-muted-foreground">
                    <span>Created {ticket.created}</span>
                    <span className="mx-2">•</span>
                    <span>Resolved {ticket.resolvedAt}</span>
                  </div>
                  <Button variant="outline" size="sm">
                    View Details
                  </Button>
                </div>
              </Card>
            ))}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Support;
