import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Bell, Calendar, CreditCard, Star, Clock, X } from "lucide-react";
import NavigationHeader from "@/components/NavigationHeader";
import { getNotifications, markNotificationAsRead, type Notification } from "@/lib/storage";

const Notifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    const stored = getNotifications();
    setNotifications(stored);
  }, []);

  const handleMarkAsRead = (id: string) => {
    markNotificationAsRead(id);
    setNotifications(getNotifications());
  };

  const iconMap: Record<string, any> = {
    Calendar,
    CreditCard,
    Star,
    Clock,
    X,
  };

  return (
    <div className="min-h-screen bg-gradient-medical flex flex-col">
      <NavigationHeader />
      <div className="container mx-auto px-4 max-w-3xl py-8 flex-1">
        <div className="bg-white rounded-lg px-6 py-3 mb-6 animate-fade-in">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold">Notifications</h1>
            <Badge variant="secondary" className="bg-[#5B68EE] text-white">{notifications.filter(n => !n.read).length} New</Badge>
          </div>
        </div>

        <div className="space-y-3">
          {notifications.length > 0 ? (
            notifications.map((notification, index) => {
              const Icon = iconMap[notification.icon] || Bell;
            return (
              <Card
                key={notification.id}
                onClick={() => !notification.read && handleMarkAsRead(notification.id)}
                className={`p-4 cursor-pointer transition-all hover:shadow-md animate-fade-in ${
                  !notification.read ? "border-l-4 border-l-primary bg-accent/30" : ""
                }`}
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <div className="flex gap-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                    !notification.read ? "bg-primary/10" : "bg-accent"
                  }`}>
                    <Icon className={`w-5 h-5 ${!notification.read ? "text-primary" : "text-muted-foreground"}`} />
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-1">
                      <h3 className={`font-semibold ${!notification.read ? "text-foreground" : "text-muted-foreground"}`}>
                        {notification.title}
                      </h3>
                      {!notification.read && (
                        <div className="w-2 h-2 rounded-full bg-primary"></div>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{notification.message}</p>
                    <p className="text-xs text-muted-foreground">{notification.time}</p>
                  </div>
                </div>
              </Card>
            );
            })
          ) : (
            <Card className="p-12 text-center">
              <Bell className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">No Notifications</h3>
              <p className="text-muted-foreground">You don't have any notifications yet</p>
            </Card>
          )}
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

export default Notifications;
