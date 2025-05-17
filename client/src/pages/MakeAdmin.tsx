import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";

export default function MakeAdmin() {
  const { user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { toast } = useToast();

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const makeAdminMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest("PATCH", `/api/users/${user?.id}/role`, { role: "admin" });
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Your account has been upgraded to admin role. Please log out and log back in to see the changes.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to upgrade account: ${error}`,
        variant: "destructive",
      });
    },
  });

  const handleMakeAdmin = () => {
    makeAdminMutation.mutate();
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-neutral-50">
      <Sidebar user={user} isOpen={sidebarOpen} onClose={toggleSidebar} />

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-h-screen">
        <Header onMenuToggle={toggleSidebar} title="Become Admin" />

        <div className="flex-1 overflow-auto p-6">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-neutral-800">Admin Access</h1>
            <p className="text-neutral-500">
              Upgrade your account to access admin features
            </p>
          </div>

          <Card className="max-w-md mx-auto">
            <CardHeader>
              <CardTitle>Become an Admin</CardTitle>
              <CardDescription>
                This will grant you access to view and manage all student leave requests
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="mb-4 text-sm text-neutral-600">
                As an admin, you will be able to:
              </p>
              <ul className="list-disc pl-5 mb-6 text-sm text-neutral-600 space-y-2">
                <li>View all student leave requests</li>
                <li>Approve or reject leave applications</li>
                <li>View detailed student information</li>
                <li>Manage university updates</li>
              </ul>

              <Button 
                onClick={handleMakeAdmin} 
                disabled={makeAdminMutation.isPending || user.role === "admin"}
                className="w-full"
              >
                {makeAdminMutation.isPending 
                  ? "Processing..." 
                  : user.role === "admin" 
                    ? "You are already an admin" 
                    : "Become an Admin"}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Footer */}
        <footer className="bg-white border-t border-neutral-100 py-4 px-6 text-center text-neutral-500 text-sm">
          <p>University Leave Management System &copy; {new Date().getFullYear()}</p>
        </footer>
      </main>
    </div>
  );
}