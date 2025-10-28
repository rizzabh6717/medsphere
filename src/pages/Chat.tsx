import { useState, useRef, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar } from "@/components/ui/avatar";
import { Send, Phone, Video, MoreVertical } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import BackButton from "@/components/BackButton";

const Chat = () => {
  const { doctorId } = useParams();
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([
    { id: 1, sender: "doctor", text: "Hello! How can I help you today?", time: "10:00 AM" },
    { id: 2, sender: "patient", text: "Hi Doctor, I've been having chest pain for the past few days.", time: "10:02 AM" },
    { id: 3, sender: "doctor", text: "I understand. Can you describe the pain? Is it sharp or dull?", time: "10:03 AM" },
    { id: 4, sender: "patient", text: "It's more of a dull ache, especially when I climb stairs.", time: "10:05 AM" },
    { id: 5, sender: "doctor", text: "I see. It's important we check this. Please avoid strenuous activities and try to stay calm. Can you come in for an in-person consultation tomorrow?", time: "10:07 AM" },
  ]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const doctor = {
    name: "Dr. Prakash Das",
    specialty: "Cardiologist",
    status: "online",
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = () => {
    if (!message.trim()) return;

    const newMessage = {
      id: messages.length + 1,
      sender: "patient",
      text: message,
      time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages([...messages, newMessage]);
    setMessage("");

    // Simulate doctor response
    setTimeout(() => {
      setMessages(prev => [...prev, {
        id: prev.length + 1,
        sender: "doctor",
        text: "Thank you for sharing that. I'll review your details and get back to you shortly.",
        time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      }]);
    }, 2000);
  };

  return (
    <div className="h-screen flex flex-col bg-gradient-medical">
      <div className="container mx-auto px-4 pt-4">
        <BackButton to="/appointments" />
      </div>
      {/* Header */}
      <Card className="rounded-none border-x-0 border-t-0 p-4">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="w-12 h-12 bg-gradient-medical text-white flex items-center justify-center font-semibold">
              PD
            </Avatar>
            <div>
              <h2 className="font-semibold">{doctor.name}</h2>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="text-xs">
                  <span className="w-2 h-2 rounded-full bg-green-500 mr-1"></span>
                  {doctor.status}
                </Badge>
                <span className="text-xs text-muted-foreground">{doctor.specialty}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon">
              <Phone className="w-5 h-5" />
            </Button>
            <Button variant="ghost" size="icon">
              <Video className="w-5 h-5" />
            </Button>
            <Button variant="ghost" size="icon">
              <MoreVertical className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </Card>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto">
        <div className="container mx-auto px-4 py-6 space-y-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.sender === "patient" ? "justify-end" : "justify-start"} animate-fade-in`}
            >
              <div className={`max-w-[70%] ${msg.sender === "patient" ? "order-2" : "order-1"}`}>
                <div
                  className={`rounded-2xl p-4 ${
                    msg.sender === "patient"
                      ? "bg-primary text-primary-foreground"
                      : "bg-card border"
                  }`}
                >
                  <p className="text-sm">{msg.text}</p>
                </div>
                <p className="text-xs text-muted-foreground mt-1 px-2">{msg.time}</p>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input */}
      <Card className="rounded-none border-x-0 border-b-0 p-4 mt-auto">
        <div className="container mx-auto flex items-center gap-3">
          <Input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSend()}
            placeholder="Type your message..."
            className="flex-1"
          />
          <Button onClick={handleSend} size="icon">
            <Send className="w-5 h-5" />
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default Chat;
