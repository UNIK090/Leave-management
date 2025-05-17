import { Bell, HelpCircle, Menu, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";
import { NotificationType } from "@shared/types";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface HeaderProps {
  onMenuToggle: () => void;
  title: string;
}

export default function Header({ onMenuToggle, title }: HeaderProps) {
  const [notifications, setNotifications] = useState<NotificationType[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const { toast } = useToast();

  useEffect(() => {
    // Set up SSE connection for real-time notifications
    const eventSource = new EventSource("/api/notifications/events");

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        
        // Show toast notification
        toast({
          title: data.title,
          description: data.message,
          duration: 5000,
        });

        // Refresh notifications data
        queryClient.invalidateQueries({ queryKey: ["/api/notifications"] });
      } catch (error) {
        console.error("Error parsing SSE event:", error);
      }
    };

    eventSource.onerror = () => {
      eventSource.close();
      // Try to reconnect after 5 seconds
      setTimeout(() => {
        // The eventSource will be recreated on next render
      }, 5000);
    };

    // Fetch initial notifications
    fetchNotifications();

    return () => {
      eventSource.close();
    };
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await apiRequest("GET", "/api/notifications", undefined);
      const data = await res.json();
      setNotifications(data);
      setUnreadCount(data.filter((n: NotificationType) => !n.read).length);
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await apiRequest("POST", "/api/notifications/read-all", undefined);
      setUnreadCount(0);
      // Update notifications list with all marked as read
      setNotifications(notifications.map(n => ({ ...n, read: true })));
    } catch (error) {
      console.error("Failed to mark notifications as read:", error);
    }
  };

  return (
    <header className="bg-white border-b border-neutral-100 py-3 px-6 flex items-center justify-between">
      {/* Mobile Menu Toggle */}
      <Button
        variant="ghost"
        size="icon"
        className="lg:hidden"
        onClick={onMenuToggle}
      >
        <Menu className="h-6 w-6" />
      </Button>

      {/* Page Title for Mobile */}
      <h1 className="text-lg font-semibold text-primary lg:hidden">{title}</h1>

      {/* Search Bar (Hidden on mobile) */}
      <div className="hidden md:flex items-center bg-neutral-50 rounded-lg px-3 py-2 w-96">
        <Search className="h-5 w-5 text-neutral-400 mr-2" />
        <Input
          type="text"
          placeholder="Search..."
          className="bg-transparent border-none shadow-none focus-visible:ring-0 text-sm w-full"
        />
      </div>

      {/* Notification and Help */}
      <div className="flex items-center space-x-4">
        {/* Notification Bell */}
        <div className="relative">
          <div className="group">
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-secondary text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </Button>
            
            {/* Notification dropdown */}
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-neutral-200 overflow-hidden invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-all duration-300 z-50">
              <div className="p-3 border-b border-neutral-100 flex justify-between items-center">
                <h3 className="font-medium text-sm">Notifications</h3>
                {unreadCount > 0 && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-xs"
                    onClick={markAllAsRead}
                  >
                    Mark all as read
                  </Button>
                )}
              </div>
              
              <div className="max-h-72 overflow-y-auto">
                {notifications.length > 0 ? (
                  notifications.map((notification) => (
                    <div 
                      key={notification.id} 
                      className={`p-3 border-b border-neutral-100 hover:bg-neutral-50 ${!notification.read ? 'bg-blue-50/30' : ''}`}
                    >
                      <p className="text-sm font-medium">{notification.title}</p>
                      <p className="text-xs text-neutral-500 mt-1">{notification.message}</p>
                      <p className="text-xs text-neutral-400 mt-1">{new Date(notification.createdAt).toLocaleString()}</p>
                    </div>
                  ))
                ) : (
                  <div className="p-4 text-center text-neutral-500 text-sm">
                    No notifications
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Help Button */}
        <Button variant="ghost" size="icon">
          <HelpCircle className="h-5 w-5" />
        </Button>
      </div>
    </header>
  );
}
