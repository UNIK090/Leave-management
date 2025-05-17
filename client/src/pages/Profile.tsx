import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

const profileFormSchema = z.object({
  rollNumber: z.string().min(1, "Roll number is required"),
  branch: z.string().min(1, "Branch is required"),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

export default function Profile() {
  const { user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { toast } = useToast();

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      rollNumber: user?.rollNumber || "",
      branch: user?.branch || "",
    },
  });

  const profileMutation = useMutation({
    mutationFn: async (data: ProfileFormValues) => {
      return await apiRequest("PATCH", "/api/users/profile", data);
    },
    onSuccess: () => {
      toast({
        title: "Profile Updated",
        description: "Your profile information has been updated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
    },
    onError: (error) => {
      toast({
        title: "Update Failed",
        description: `Failed to update profile: ${error}`,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: ProfileFormValues) => {
    profileMutation.mutate(data);
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
        <Header onMenuToggle={toggleSidebar} title="My Profile" />

        <div className="flex-1 overflow-auto p-6">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-neutral-800">Profile Information</h1>
            <p className="text-neutral-500">
              Update your student information for leave verification
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="col-span-3 md:col-span-2">
              <CardHeader>
                <CardTitle>Student Details</CardTitle>
                <CardDescription>
                  This information will be visible to administrators reviewing your leave requests
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="space-y-6"
                  >
                    <FormField
                      control={form.control}
                      name="rollNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Roll Number</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter your roll number" {...field} />
                          </FormControl>
                          <FormDescription>
                            Your university roll number or student ID
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="branch"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Branch/Department</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter your branch or department" {...field} />
                          </FormControl>
                          <FormDescription>
                            Your academic branch or department (e.g., Computer Science, Mechanical)
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button 
                      type="submit" 
                      disabled={profileMutation.isPending}
                      className="w-full md:w-auto"
                    >
                      {profileMutation.isPending ? "Updating..." : "Save Changes"}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>

            <Card className="col-span-3 md:col-span-1">
              <CardHeader>
                <CardTitle>Account Information</CardTitle>
                <CardDescription>
                  Your primary account details
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-neutral-500">Name</h3>
                  <p>{user.firstName} {user.lastName}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-neutral-500">Email</h3>
                  <p>{user.email || "No email provided"}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-neutral-500">Role</h3>
                  <p className="capitalize">{user.role}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-neutral-500">Leave Balance</h3>
                  <p>{user.leaveBalance} days</p>
                </div>
              </CardContent>
            </Card>
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