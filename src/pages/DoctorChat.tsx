import { useMemo } from "react";
import { useParams } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MessageCircle } from "lucide-react";
import { ensureChatThread } from "@/lib/storage";

const DoctorChat = () => {
  const { patientId } = useParams();
  const doctorProfile = useMemo(() => {
    try { return JSON.parse(localStorage.getItem('doctorProfile') || 'null'); } catch { return null; }
  }, []);

  const thread = useMemo(() => {
    if (!doctorProfile || !patientId) return null;
    return ensureChatThread(doctorProfile.id, patientId);
  }, [doctorProfile, patientId]);

  return (
    <div className="min-h-screen bg-gradient-medical p-6">
      <div className="max-w-3xl mx-auto">
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <MessageCircle className="w-5 h-5 text-primary"/>
            <h1 className="text-xl font-bold">Chat with {patientId}</h1>
          </div>
          <div className="text-sm text-muted-foreground mb-4">
            Thread: {thread?.id || 'n/a'}
          </div>
          <div className="bg-accent/30 rounded-lg p-6 text-center text-muted-foreground">
            Chat UI coming soon. Thread is created/loaded in localStorage['chats'].
          </div>
          <div className="mt-4 text-right">
            <Button className="bg-[#5B68EE] hover:bg-[#4A56DD]">Send Placeholder</Button>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default DoctorChat;