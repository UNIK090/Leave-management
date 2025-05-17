import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useQuery, useMutation } from "@tanstack/react-query";
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
import { CheckCircle, Eye, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { format, parseISO } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

export default function AdminDashboard() {
  const { user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("pending");

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  // Fetch all leave requests for admin
  const { data: leaves, isLoading } = useQuery<LeaveRequest[]>({
    queryKey: ["/api/admin/leaves"],
  });

  const approveMutation = useMutation({
    mutationFn: async (leaveId: number) => {
      return await apiRequest("POST", `/api/admin/leaves/${leaveId}/approve`, {});
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Leave request approved successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/leaves"] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to approve leave: ${error}`,
        variant: "destructive",
      });
    },
  });

  const rejectMutation = useMutation({
    mutationFn: async (leaveId: number) => {
      return await apiRequest("POST", `/api/admin/leaves/${leaveId}/reject`, {});
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Leave request rejected successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/leaves"] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to reject leave: ${error}`,
        variant: "destructive",
      });
    },
  });

  if (!user || user.role !== "admin") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50">
        <Card className="w-[400px]">
          <CardHeader>
            <CardTitle className="text-xl text-center text-red-500">Access Denied</CardTitle>
            <CardDescription className="text-center">
              You don't have permission to access this page.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <Link href="/dashboard">
              <Button>Go to Dashboard</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

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

  const handleApprove = (leaveId: number) => {
    approveMutation.mutate(leaveId);
  };

  const handleReject = (leaveId: number) => {
    rejectMutation.mutate(leaveId);
  };

  return (
    <div className="flex min-h-screen bg-neutral-50">
      <Sidebar user={user} isOpen={sidebarOpen} onClose={toggleSidebar} />

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-h-screen">
        <Header onMenuToggle={toggleSidebar} title="Admin Dashboard" />

        {/* Admin Dashboard Content */}
        <div className="flex-1 overflow-auto p-6">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-neutral-800">Leave Request Management</h1>
            <p className="text-neutral-500">
              Review and manage leave requests from all users
            </p>
          </div>

          {/* Leave Requests Table */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
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
                          <TableHead>Student</TableHead>
                          <TableHead>Leave Type</TableHead>
                          <TableHead>Date Range</TableHead>
                          <TableHead>Duration</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredLeaves.map((leave) => (
                          <TableRow key={leave.id}>
                            <TableCell className="font-medium">
                              {leave.user.firstName} {leave.user.lastName}
                            </TableCell>
                            <TableCell className="capitalize">
                              {leave.type} Leave
                            </TableCell>
                            <TableCell>
                              {formatDateRange(leave.startDate, leave.endDate)}
                            </TableCell>
                            <TableCell>
                              {leave.duration} {leave.duration === 1 ? "day" : "days"}
                            </TableCell>
                            <TableCell>{renderStatusBadge(leave.status)}</TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                <Link href={`/leave/${leave.id}`}>
                                  <Button variant="ghost" size="icon">
                                    <Eye className="h-4 w-4" />
                                  </Button>
                                </Link>
                                
                                {leave.status === "pending" && (
                                  <>
                                    <Button 
                                      variant="ghost" 
                                      size="icon" 
                                      className="text-green-600"
                                      onClick={() => handleApprove(leave.id)}
                                      disabled={approveMutation.isPending}
                                    >
                                      <CheckCircle className="h-4 w-4" />
                                    </Button>
                                    <Button 
                                      variant="ghost" 
                                      size="icon" 
                                      className="text-red-600"
                                      onClick={() => handleReject(leave.id)}
                                      disabled={rejectMutation.isPending}
                                    >
                                      <XCircle className="h-4 w-4" />
                                    </Button>
                                  </>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="p-8 text-center">
                    <p className="text-neutral-500">No leave requests found.</p>
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
