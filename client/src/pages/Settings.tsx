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
import { Switch } from "@/components/ui/switch";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Label } from "@/components/ui/label";
import { MoonIcon, SunIcon } from "lucide-react";

const profileFormSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  rollNumber: z.string().min(1, "Roll number is required"),
  branch: z.string().min(1, "Branch is required"),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

export default function Settings() {
  const { user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { toast } = useToast();
  const [isDarkMode, setIsDarkMode] = useState(
    document.documentElement.classList.contains('dark')
  );

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      firstName: user?.firstName || "",
      lastName: user?.lastName || "",
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

  const toggleDarkMode = () => {
    if (isDarkMode) {
      document.documentElement.classList.remove('dark');
    } else {
      document.documentElement.classList.add('dark');
    }
    setIsDarkMode(!isDarkMode);
    
    // Save preference to localStorage
    localStorage.setItem('theme', isDarkMode ? 'light' : 'dark');
  };

  const getInitials = () => {
    if (!user?.firstName && !user?.lastName) return "U";
    return `${user?.firstName?.[0] || ""}${user?.lastName?.[0] || ""}`;
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-neutral-50 dark:bg-neutral-900">
      <Sidebar user={user} isOpen={sidebarOpen} onClose={toggleSidebar} />

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-h-screen">
        <Header onMenuToggle={toggleSidebar} title="Settings" />

        <div className="flex-1 overflow-auto p-6">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-neutral-800 dark:text-white">Account Settings</h1>
            <p className="text-neutral-500 dark:text-neutral-400">
              Manage your account preferences and information
            </p>
          </div>

          <Tabs defaultValue="profile" className="w-full space-y-6">
            <TabsList className="w-full sm:w-auto">
              <TabsTrigger value="profile" className="flex-1 sm:flex-initial">Profile</TabsTrigger>
              <TabsTrigger value="appearance" className="flex-1 sm:flex-initial">Appearance</TabsTrigger>
              <TabsTrigger value="security" className="flex-1 sm:flex-initial">Security</TabsTrigger>
            </TabsList>

            <TabsContent value="profile" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Profile Information</CardTitle>
                  <CardDescription>
                    Update your personal information and how it appears throughout the system
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex flex-col md:flex-row gap-6 items-start">
                    <div className="flex flex-col items-center space-y-2">
                      <Avatar className="w-24 h-24">
                        <AvatarImage src={user.profileImageUrl || undefined} />
                        <AvatarFallback className="text-2xl">{getInitials()}</AvatarFallback>
                      </Avatar>
                      <Button variant="outline" size="sm" className="mt-2">
                        Upload Photo
                      </Button>
                    </div>

                    <div className="flex-1">
                      <Form {...form}>
                        <form
                          onSubmit={form.handleSubmit(onSubmit)}
                          className="space-y-4"
                        >
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                              control={form.control}
                              name="firstName"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>First Name</FormLabel>
                                  <FormControl>
                                    <Input placeholder="Enter your first name" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={form.control}
                              name="lastName"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Last Name</FormLabel>
                                  <FormControl>
                                    <Input placeholder="Enter your last name" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                                    Your academic branch or department
                                  </FormDescription>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>

                          <Button 
                            type="submit" 
                            disabled={profileMutation.isPending}
                            className="mt-2"
                          >
                            {profileMutation.isPending ? "Saving..." : "Save Changes"}
                          </Button>
                        </form>
                      </Form>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="appearance" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Appearance Settings</CardTitle>
                  <CardDescription>
                    Customize how the application looks and feels
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between py-2">
                    <div className="flex items-center space-x-2">
                      {isDarkMode ? <MoonIcon className="h-5 w-5" /> : <SunIcon className="h-5 w-5" />}
                      <Label htmlFor="dark-mode">Dark Mode</Label>
                    </div>
                    <Switch
                      id="dark-mode"
                      checked={isDarkMode}
                      onCheckedChange={toggleDarkMode}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="security" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Security Settings</CardTitle>
                  <CardDescription>
                    Manage your account security preferences
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <p className="text-sm text-neutral-500 dark:text-neutral-400">
                    Your account is secured through Replit Authentication.
                  </p>
                  <Button variant="outline" className="mt-2" asChild>
                    <a href="/api/logout">Sign Out</a>
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Footer */}
        <footer className="bg-white dark:bg-neutral-800 border-t border-neutral-100 dark:border-neutral-700 py-4 px-6 text-center text-neutral-500 dark:text-neutral-400 text-sm">
          <p>University Leave Management System &copy; {new Date().getFullYear()}</p>
        </footer>
      </main>
    </div>
  );
}