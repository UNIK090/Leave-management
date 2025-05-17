import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import LeaveRequestForm from "@/components/forms/LeaveRequestForm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function NewRequest() {
  const { user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  if (!user) {
    return null;
  }

  return (
    <div className="flex min-h-screen bg-neutral-50">
      <Sidebar user={user} isOpen={sidebarOpen} onClose={toggleSidebar} />

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-h-screen">
        <Header onMenuToggle={toggleSidebar} title="New Leave Request" />

        {/* New Request Content */}
        <div className="flex-1 overflow-auto p-6">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-neutral-800">New Leave Request</h1>
            <p className="text-neutral-500">
              Fill out the form below to submit a new leave request
            </p>
          </div>

          {/* Leave Request Form */}
          <Card>
            <CardHeader className="border-b border-neutral-100">
              <CardTitle>Leave Request Form</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <LeaveRequestForm />
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
