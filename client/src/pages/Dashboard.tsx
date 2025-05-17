import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import StatusCard from "@/components/dashboard/StatusCard";
import NotificationItem from "@/components/dashboard/NotificationItem";
import LeaveRequestTable from "@/components/dashboard/LeaveRequestTable";
import UniversityUpdates from "@/components/dashboard/UniversityUpdates";
import LeaveCalendar from "@/components/dashboard/LeaveCalendar";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "wouter";
import { HourglassIcon, CheckCircle, XCircle, Calendar } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { LeaveStatsResponse, LeaveRequest, NotificationType, Update } from "@shared/types";

export default function Dashboard() {
  const { user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { toast } = useToast();

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  // Fetch leave statistics
  const { data: stats, isLoading: isLoadingStats } = useQuery<LeaveStatsResponse>({
    queryKey: ["/api/leaves/stats"],
  });

  // Fetch recent leave requests
  const { data: leaves, isLoading: isLoadingLeaves } = useQuery<LeaveRequest[]>({
    queryKey: ["/api/leaves/recent"],
  });

  // Fetch notifications
  const { data: notifications, isLoading: isLoadingNotifications } = useQuery<NotificationType[]>({
    queryKey: ["/api/notifications"],
  });

  // Fetch university updates
  const { data: updates, isLoading: isLoadingUpdates } = useQuery<Update[]>({
    queryKey: ["/api/updates"],
  });

  if (!user) {
    return null; // Should be handled by App.tsx
  }

  return (
    <div className="flex min-h-screen bg-neutral-50">
      <Sidebar user={user} isOpen={sidebarOpen} onClose={toggleSidebar} />

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-h-screen">
        <Header onMenuToggle={toggleSidebar} title="Dashboard" />

        {/* Dashboard Content */}
        <div className="flex-1 overflow-auto p-6">
          {/* Dashboard Header */}
          <div className="md:flex md:items-center md:justify-between mb-8">
            <div>
              <h1 className="text-2xl font-bold text-neutral-800">Dashboard</h1>
              <p className="text-neutral-500">
                Welcome back, {user.firstName || "User"}!
              </p>
            </div>

            <div className="mt-4 md:mt-0">
              <Link href="/new-request">
                <button className="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-lg font-medium text-sm flex items-center">
                  <span className="material-icons text-sm mr-2">add</span>
                  New Leave Request
                </button>
              </Link>
            </div>
          </div>

          {/* Status Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* Pending Leaves */}
            <StatusCard
              title="Pending Leaves"
              value={isLoadingStats ? "..." : stats?.pending || 0}
              icon={<HourglassIcon className="h-5 w-5 text-primary" />}
              iconBgColor="bg-blue-100"
              linkUrl="/my-leaves?status=pending"
              linkText="View Details"
            />

            {/* Approved Leaves */}
            <StatusCard
              title="Approved Leaves"
              value={isLoadingStats ? "..." : stats?.approved || 0}
              icon={<CheckCircle className="h-5 w-5 text-success" />}
              iconBgColor="bg-green-100"
              linkUrl="/my-leaves?status=approved"
              linkText="View Details"
            />

            {/* Rejected Leaves */}
            <StatusCard
              title="Rejected Leaves"
              value={isLoadingStats ? "..." : stats?.rejected || 0}
              icon={<XCircle className="h-5 w-5 text-error" />}
              iconBgColor="bg-red-100"
              linkUrl="/my-leaves?status=rejected"
              linkText="View Details"
            />

            {/* Leave Balance */}
            <StatusCard
              title="Leave Balance"
              value={`${isLoadingStats ? "..." : stats?.balance || 0} days`}
              icon={<Calendar className="h-5 w-5 text-purple-600" />}
              iconBgColor="bg-purple-100"
              linkUrl="/my-leaves"
              linkText="View Details"
              progress={isLoadingStats ? 0 : stats?.balancePercentage || 0}
              progressText={`${isLoadingStats ? "..." : stats?.balancePercentage || 0}% remaining of your annual leave`}
            />
          </div>

          {/* Recent Notifications and Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {/* Recent Notifications */}
            <div className="lg:col-span-1">
              <Card>
                <CardHeader className="pb-3 border-b border-neutral-100">
                  <CardTitle className="text-lg font-semibold flex items-center">
                    <span className="material-icons text-secondary mr-2">notifications_active</span>
                    Recent Notifications
                  </CardTitle>
                </CardHeader>

                <CardContent className="p-0">
                  <div className="divide-y divide-neutral-100">
                    {isLoadingNotifications ? (
                      <div className="p-8 text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                        <p className="mt-4 text-neutral-500">Loading notifications...</p>
                      </div>
                    ) : notifications && notifications.length > 0 ? (
                      notifications.slice(0, 3).map((notification) => (
                        <NotificationItem key={notification.id} notification={notification} />
                      ))
                    ) : (
                      <div className="p-8 text-center text-neutral-500">
                        No notifications available.
                      </div>
                    )}
                  </div>
                </CardContent>

                <CardFooter className="p-4 border-t border-neutral-100 bg-neutral-50">
                  <Link
                    href="/notifications"
                    className="text-primary text-sm font-medium hover:underline block text-center w-full"
                  >
                    View All Notifications
                  </Link>
                </CardFooter>
              </Card>
            </div>

            {/* Recent Leave Requests */}
            <div className="lg:col-span-2">
              <LeaveRequestTable 
                leaves={leaves || []} 
                isLoading={isLoadingLeaves} 
              />
            </div>
          </div>

          {/* University Updates and Leave Calendar */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* University Updates */}
            <div className="lg:col-span-1">
              <UniversityUpdates 
                updates={updates || []} 
                isLoading={isLoadingUpdates} 
              />
            </div>

            {/* Leave Calendar */}
            <div className="lg:col-span-2">
              <LeaveCalendar leaves={leaves || []} />
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="bg-white border-t border-neutral-100 py-4 px-6 text-center text-neutral-500 text-sm">
          <p>University Leave Management System &copy; {new Date().getFullYear()}</p>
        </footer>
      </main>
    </div>
  );
}
