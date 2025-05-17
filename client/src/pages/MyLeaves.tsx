import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import { LeaveRequest } from "@shared/types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link, useLocation } from "wouter";
import { format, parseISO } from "date-fns";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

export default function MyLeaves() {
  const { user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [location, setLocation] = useLocation();
  
  // Get status from query params if any
  const searchParams = new URLSearchParams(location.split("?")[1] || "");
  const statusParam = searchParams.get("status");
  const [activeTab, setActiveTab] = useState(statusParam || "all");
  
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  // Fetch all leave requests for the user
  const { data: leaves, isLoading } = useQuery<LeaveRequest[]>({
    queryKey: ["/api/leaves"],
  });

  if (!user) {
    return null;
  }

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    if (value === "all") {
      setLocation("/my-leaves");
    } else {
      setLocation(`/my-leaves?status=${value}`);
    }
  };

  const filteredLeaves = leaves?.filter((leave) => {
    if (activeTab === "all") return true;
    return leave.status === activeTab;
  });

  const renderStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="outline" className="leave-status-pending">Pending</Badge>;
      case "approved":
        return <Badge variant="outline" className="leave-status-approved">Approved</Badge>;
      case "rejected":
        return <Badge variant="outline" className="leave-status-rejected">Rejected</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const formatDateRange = (startDate: string, endDate: string) => {
    const start = parseISO(startDate);
    const end = parseISO(endDate);
    
    if (format(start, 'yyyy-MM-dd') === format(end, 'yyyy-MM-dd')) {
      return format(start, 'MMM d, yyyy');
    }
    
    if (start.getFullYear() === end.getFullYear()) {
      if (start.getMonth() === end.getMonth()) {
        return `${format(start, 'MMM d')} - ${format(end, 'd, yyyy')}`;
      }
      return `${format(start, 'MMM d')} - ${format(end, 'MMM d, yyyy')}`;
    }
    
    return `${format(start, 'MMM d, yyyy')} - ${format(end, 'MMM d, yyyy')}`;
  };

  return (
    <div className="flex min-h-screen bg-neutral-50">
      <Sidebar user={user} isOpen={sidebarOpen} onClose={toggleSidebar} />

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-h-screen">
        <Header onMenuToggle={toggleSidebar} title="My Leaves" />

        {/* My Leaves Content */}
        <div className="flex-1 overflow-auto p-6">
          {/* Page Header */}
          <div className="md:flex md:items-center md:justify-between mb-8">
            <div>
              <h1 className="text-2xl font-bold text-neutral-800">My Leave Requests</h1>
              <p className="text-neutral-500">
                View and manage all your leave requests
              </p>
            </div>

            <div className="mt-4 md:mt-0">
              <Link href="/new-request">
                <Button className="bg-primary hover:bg-primary-dark text-white">
                  New Leave Request
                </Button>
              </Link>
            </div>
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
            <TabsList className="mb-6">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="pending">Pending</TabsTrigger>
              <TabsTrigger value="approved">Approved</TabsTrigger>
              <TabsTrigger value="rejected">Rejected</TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab} className="mt-0">
              <div className="bg-white rounded-xl shadow-sm border border-neutral-100 overflow-hidden">
                {isLoading ? (
                  <div className="p-8 text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                    <p className="mt-4 text-neutral-500">Loading leave requests...</p>
                  </div>
                ) : filteredLeaves && filteredLeaves.length > 0 ? (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader className="bg-neutral-50">
                        <TableRow>
                          <TableHead className="w-[180px]">Leave Type</TableHead>
                          <TableHead>Date Range</TableHead>
                          <TableHead>Duration</TableHead>
                          <TableHead>Reason</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredLeaves.map((leave) => (
                          <TableRow key={leave.id}>
                            <TableCell className="font-medium capitalize">
                              {leave.type} Leave
                            </TableCell>
                            <TableCell>
                              {formatDateRange(leave.startDate, leave.endDate)}
                            </TableCell>
                            <TableCell>
                              {leave.duration} {leave.duration === 1 ? "day" : "days"}
                            </TableCell>
                            <TableCell className="max-w-[300px] truncate">
                              {leave.reason}
                            </TableCell>
                            <TableCell>{renderStatusBadge(leave.status)}</TableCell>
                            <TableCell className="text-right">
                              <Link href={`/leave/${leave.id}`}>
                                <Button variant="ghost" size="sm">
                                  <Eye className="h-4 w-4 mr-2" />
                                  View
                                </Button>
                              </Link>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="p-8 text-center">
                    <p className="text-neutral-500">No leave requests found.</p>
                    <Link href="/new-request">
                      <Button className="mt-4">Create New Request</Button>
                    </Link>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Footer */}
        <footer className="bg-white border-t border-neutral-100 py-4 px-6 text-center text-neutral-500 text-sm">
          <p>University Leave Management System &copy; {new Date().getFullYear()}</p>
        </footer>
      </main>
    </div>
  );
}
