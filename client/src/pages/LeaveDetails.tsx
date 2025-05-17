import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useQuery, useMutation } from "@tanstack/react-query";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import { useParams } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { LeaveRequest } from "@shared/types";
import { format, parseISO } from "date-fns";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, CheckCircle, PenLine, Trash, XCircle } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useLocation } from "wouter";

export default function LeaveDetails() {
  const { user } = useAuth();
  const { id } = useParams();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { toast } = useToast();
  const [comment, setComment] = useState("");
  const [, navigate] = useLocation();

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  // Fetch leave details
  const { data: leave, isLoading } = useQuery<LeaveRequest>({
    queryKey: [`/api/leaves/${id}`],
  });

  const addCommentMutation = useMutation({
    mutationFn: async (comment: string) => {
      return await apiRequest("POST", `/api/leaves/${id}/comments`, { content: comment });
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Comment added successfully",
      });
      setComment("");
      queryClient.invalidateQueries({ queryKey: [`/api/leaves/${id}`] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to add comment: ${error}`,
        variant: "destructive",
      });
    },
  });

  const cancelMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest("POST", `/api/leaves/${id}/cancel`, {});
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Leave request cancelled successfully",
      });
      queryClient.invalidateQueries({ queryKey: [`/api/leaves/${id}`] });
      queryClient.invalidateQueries({ queryKey: ["/api/leaves"] });
      queryClient.invalidateQueries({ queryKey: ["/api/leaves/stats"] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to cancel leave: ${error}`,
        variant: "destructive",
      });
    },
  });

  const approveMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest("POST", `/api/admin/leaves/${id}/approve`, {});
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Leave request approved successfully",
      });
      queryClient.invalidateQueries({ queryKey: [`/api/leaves/${id}`] });
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
    mutationFn: async () => {
      return await apiRequest("POST", `/api/admin/leaves/${id}/reject`, {});
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Leave request rejected successfully",
      });
      queryClient.invalidateQueries({ queryKey: [`/api/leaves/${id}`] });
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

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (comment.trim()) {
      addCommentMutation.mutate(comment);
    }
  };

  const handleCancel = () => {
    if (window.confirm("Are you sure you want to cancel this leave request?")) {
      cancelMutation.mutate();
    }
  };

  const handleApprove = () => {
    approveMutation.mutate();
  };

  const handleReject = () => {
    rejectMutation.mutate();
  };

  if (!user) {
    return null;
  }

  const renderStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge className="leave-status-pending">Pending</Badge>;
      case "approved":
        return <Badge className="leave-status-approved">Approved</Badge>;
      case "rejected":
        return <Badge className="leave-status-rejected">Rejected</Badge>;
      case "cancelled":
        return <Badge variant="outline" className="bg-gray-100 text-gray-700">Cancelled</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const formatDateRange = (startDate?: string, endDate?: string) => {
    if (!startDate || !endDate) return "";

    const start = parseISO(startDate);
    const end = parseISO(endDate);
    
    if (format(start, 'yyyy-MM-dd') === format(end, 'yyyy-MM-dd')) {
      return format(start, 'MMMM d, yyyy');
    }
    
    if (start.getFullYear() === end.getFullYear()) {
      if (start.getMonth() === end.getMonth()) {
        return `${format(start, 'MMMM d')} - ${format(end, 'd, yyyy')}`;
      }
      return `${format(start, 'MMMM d')} - ${format(end, 'MMMM d, yyyy')}`;
    }
    
    return `${format(start, 'MMMM d, yyyy')} - ${format(end, 'MMMM d, yyyy')}`;
  };

  const isOwnLeave = leave && user.id === leave.userId;
  const canCancel = leave && isOwnLeave && leave.status === "pending";
  const canApproveReject = user.role === "admin" && leave && leave.status === "pending";

  return (
    <div className="flex min-h-screen bg-neutral-50">
      <Sidebar user={user} isOpen={sidebarOpen} onClose={toggleSidebar} />

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-h-screen">
        <Header onMenuToggle={toggleSidebar} title="Leave Details" />

        {/* Leave Details Content */}
        <div className="flex-1 overflow-auto p-6">
          {/* Back Button */}
          <Button
            variant="ghost"
            className="mb-6"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>

          {isLoading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="mt-4 text-neutral-500">Loading leave details...</p>
            </div>
          ) : leave ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Leave Details Card */}
              <div className="md:col-span-2">
                <Card>
                  <CardHeader className="border-b border-neutral-100">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="capitalize">
                          {leave.type} Leave Request
                        </CardTitle>
                        <CardDescription>
                          Submitted on {format(parseISO(leave.createdAt), 'MMMM d, yyyy')}
                        </CardDescription>
                      </div>
                      {renderStatusBadge(leave.status)}
                    </div>
                  </CardHeader>
                  <CardContent className="pt-6 space-y-4">
                    <div>
                      <h3 className="text-sm font-medium text-neutral-500 mb-1">Date Range</h3>
                      <p className="text-base">{formatDateRange(leave.startDate, leave.endDate)}</p>
                    </div>
                    
                    <div>
                      <h3 className="text-sm font-medium text-neutral-500 mb-1">Duration</h3>
                      <p className="text-base">{leave.duration} {leave.duration === 1 ? "day" : "days"}</p>
                    </div>
                    
                    <div>
                      <h3 className="text-sm font-medium text-neutral-500 mb-1">Reason</h3>
                      <p className="text-base">{leave.reason}</p>
                    </div>
                    
                    <div>
                      <h3 className="text-sm font-medium text-neutral-500 mb-1">Contact During Leave</h3>
                      <p className="text-base">{leave.contactInfo}</p>
                    </div>
                    
                    {leave.documents && leave.documents.length > 0 && (
                      <div>
                        <h3 className="text-sm font-medium text-neutral-500 mb-1">Attached Documents</h3>
                        <div className="flex flex-wrap gap-2">
                          {leave.documents.map((doc, index) => (
                            <a
                              key={index}
                              href={doc.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center p-2 bg-neutral-100 rounded-md hover:bg-neutral-200 text-sm"
                            >
                              <PenLine className="h-4 w-4 mr-2" />
                              {doc.name}
                            </a>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                  
                  {/* Card Footer with Actions */}
                  {(canCancel || canApproveReject) && (
                    <CardFooter className="border-t border-neutral-100 pt-4 flex justify-end space-x-2">
                      {canCancel && (
                        <Button 
                          variant="outline" 
                          className="text-red-600 hover:text-red-700"
                          onClick={handleCancel}
                          disabled={cancelMutation.isPending}
                        >
                          <Trash className="h-4 w-4 mr-2" />
                          Cancel Request
                        </Button>
                      )}
                      
                      {canApproveReject && (
                        <>
                          <Button 
                            variant="outline" 
                            className="text-red-600 hover:text-red-700"
                            onClick={handleReject}
                            disabled={rejectMutation.isPending}
                          >
                            <XCircle className="h-4 w-4 mr-2" />
                            Reject
                          </Button>
                          <Button 
                            variant="default" 
                            className="bg-green-600 hover:bg-green-700"
                            onClick={handleApprove}
                            disabled={approveMutation.isPending}
                          >
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Approve
                          </Button>
                        </>
                      )}
                    </CardFooter>
                  )}
                </Card>

                {/* Comments Section */}
                <Card className="mt-6">
                  <CardHeader className="border-b border-neutral-100">
                    <CardTitle className="text-base">Comments</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-6">
                    {leave.comments && leave.comments.length > 0 ? (
                      <div className="space-y-4">
                        {leave.comments.map((comment) => (
                          <div key={comment.id} className="flex gap-4">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={comment.user.profileImageUrl || undefined} />
                              <AvatarFallback>
                                {comment.user.firstName?.[0] || ""}{comment.user.lastName?.[0] || ""}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <p className="font-medium text-sm">
                                  {comment.user.firstName} {comment.user.lastName}
                                </p>
                                <span className="text-xs text-neutral-500">
                                  {format(parseISO(comment.createdAt), 'MMM d, yyyy h:mm a')}
                                </span>
                              </div>
                              <p className="text-sm mt-1">{comment.content}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-center text-neutral-500 text-sm py-4">
                        No comments yet.
                      </p>
                    )}

                    <Separator className="my-4" />

                    <form onSubmit={handleCommentSubmit}>
                      <Textarea
                        placeholder="Add a comment..."
                        className="min-h-[100px] mb-4"
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                      />
                      <div className="flex justify-end">
                        <Button 
                          type="submit" 
                          disabled={!comment.trim() || addCommentMutation.isPending}
                        >
                          {addCommentMutation.isPending ? "Sending..." : "Add Comment"}
                        </Button>
                      </div>
                    </form>
                  </CardContent>
                </Card>
              </div>

              {/* Sidebar */}
              <div className="md:col-span-1">
                <Card>
                  <CardHeader className="border-b border-neutral-100">
                    <CardTitle className="text-base">Requestor</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-4">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={leave.user?.profileImageUrl || undefined} />
                        <AvatarFallback>
                          {leave.user?.firstName?.[0] || ""}{leave.user?.lastName?.[0] || ""}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">
                          {leave.user?.firstName} {leave.user?.lastName}
                        </p>
                        <p className="text-sm text-neutral-500 capitalize">
                          {leave.user?.role}
                        </p>
                      </div>
                    </div>
                    
                    {leave.user?.email && (
                      <div className="mt-4">
                        <h3 className="text-sm font-medium text-neutral-500 mb-1">Email</h3>
                        <p className="text-sm">{leave.user.email}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card className="mt-6">
                  <CardHeader className="border-b border-neutral-100">
                    <CardTitle className="text-base">Leave History</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm font-medium">Pending</span>
                        <span className="text-sm">2</span>
                      </div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm font-medium">Approved</span>
                        <span className="text-sm">5</span>
                      </div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm font-medium">Rejected</span>
                        <span className="text-sm">1</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm font-medium">Total</span>
                        <span className="text-sm">8</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-neutral-500">Leave request not found.</p>
              <Button onClick={() => navigate("/my-leaves")} className="mt-4">
                View All Leaves
              </Button>
            </div>
          )}
        </div>

        {/* Footer */}
        <footer className="bg-white border-t border-neutral-100 py-4 px-6 text-center text-neutral-500 text-sm">
          <p>University Leave Management System &copy; {new Date().getFullYear()}</p>
        </footer>
      </main>
    </div>
  );
}
