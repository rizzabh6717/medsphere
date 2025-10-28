import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Bell,
  Menu,
  Users,
  MessageCircle,
  HeartPulse,
  UserPlus,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";

const NavigationHeader = () => {
  const navigate = useNavigate();

  return (
    <div className="bg-card/80 backdrop-blur-sm border-b border-border sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div
            className="flex items-center gap-2 cursor-pointer"
onClick={() => navigate("/user/patient/dashboard")}
          >
            <HeartPulse className="w-6 h-6 text-primary" />
            <span className="text-xl font-bold text-foreground">MedSphere</span>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
onClick={() => navigate("/user/patient/notifications")}
              className="relative hover:bg-[#5B68EE]/10"
            >
              <Bell className="w-5 h-5 text-[#5B68EE]" />
              <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs bg-[#5B68EE]">
                3
              </Badge>
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="hover:bg-[#5B68EE]/10">
                  <Menu className="w-5 h-5 text-[#5B68EE]" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 bg-card">
                <DropdownMenuLabel>Quick Access</DropdownMenuLabel>
                <DropdownMenuSeparator />
<DropdownMenuItem onClick={() => navigate("/user/patient/appointments")}>
                  <Users className="w-4 h-4 mr-2" />
                  My Appointments
                </DropdownMenuItem>
<DropdownMenuItem onClick={() => navigate("/user/patient/friends-family")}>
                  <UserPlus className="w-4 h-4 mr-2" />
                  Friends & Family
                </DropdownMenuItem>
<DropdownMenuItem onClick={() => navigate("/user/patient/co-patient")}>
                  <Users className="w-4 h-4 mr-2" />
                  Co-Patient Groups
                </DropdownMenuItem>
<DropdownMenuItem onClick={() => navigate("/user/patient/queue")}>
                  <HeartPulse className="w-4 h-4 mr-2" />
                  Queue Tracking
                </DropdownMenuItem>
                <DropdownMenuSeparator />
<DropdownMenuItem onClick={() => navigate("/user/patient/support")}>
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Customer Support
                </DropdownMenuItem>
<DropdownMenuItem onClick={() => navigate("/user/patient/feedback/new")}>
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Give Feedback
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NavigationHeader;
