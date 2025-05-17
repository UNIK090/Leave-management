import { AlertCircle, Check, MessageSquare } from "lucide-react";
import { NotificationType } from "@shared/types";
import { formatDistanceToNow } from "date-fns";

interface NotificationItemProps {
  notification: NotificationType;
}

export default function NotificationItem({
  notification,
}: NotificationItemProps) {
  const getIconByType = () => {
    switch (notification.type) {
      case "comment":
        return (
          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
            <MessageSquare className="h-4 w-4 text-primary" />
          </div>
        );
      case "status":
        return (
          <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
            <Check className="h-4 w-4 text-success" />
          </div>
        );
      case "alert":
        return (
          <div className="w-8 h-8 rounded-full bg-yellow-100 flex items-center justify-center">
            <AlertCircle className="h-4 w-4 text-warning" />
          </div>
        );
      default:
        return (
          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
            <MessageSquare className="h-4 w-4 text-primary" />
          </div>
        );
    }
  };

  const formatTimestamp = (date: string) => {
    return formatDistanceToNow(new Date(date), { addSuffix: true });
  };

  return (
    <div className="p-4 hover:bg-neutral-50 transition-colors duration-150">
      <div className="flex">
        <div className="mr-4 mt-1">{getIconByType()}</div>
        <div>
          <p className="text-sm">
            <span className="font-medium">{notification.title}</span>:{" "}
            {notification.message}
          </p>
          <p className="text-xs text-neutral-500 mt-1">
            {formatTimestamp(notification.createdAt)}
          </p>
        </div>
      </div>
    </div>
  );
}
