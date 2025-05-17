import { Switch, Route } from "wouter";
import { Suspense, lazy } from "react";
import NotFound from "@/pages/not-found";
import { useAuth } from "@/hooks/useAuth";

// Lazy load pages for better performance
const Dashboard = lazy(() => import("@/pages/Dashboard"));
const MyLeaves = lazy(() => import("@/pages/MyLeaves"));
const NewRequest = lazy(() => import("@/pages/NewRequest"));
const AdminDashboard = lazy(() => import("@/pages/AdminDashboard"));
const LeaveDetails = lazy(() => import("@/pages/LeaveDetails"));
const Landing = lazy(() => import("@/pages/Landing"));
const Profile = lazy(() => import("@/pages/Profile"));
const MakeAdmin = lazy(() => import("@/pages/MakeAdmin"));
const Settings = lazy(() => import("@/pages/Settings"));

function LoadingFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
    </div>
  );
}

function Router() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingFallback />;
  }

  return (
    <Suspense fallback={<LoadingFallback />}>
      <Switch>
        {/* Public routes */}
        <Route path="/" component={user ? Dashboard : Landing} />

        {/* Protected routes */}
        {user && (
          <Switch>
            <Route path="/dashboard" component={Dashboard} />
            <Route path="/my-leaves" component={MyLeaves} />
            <Route path="/new-request" component={NewRequest} />
            <Route path="/leave/:id" component={LeaveDetails} />
            <Route path="/profile" component={Profile} />
            <Route path="/settings" component={Settings} />
            <Route path="/make-admin" component={MakeAdmin} />
            {user.role === "admin" && (
              <Route path="/admin" component={AdminDashboard} />
            )}
          </Switch>
        )}

        {/* Fallback to 404 */}
        <Route component={NotFound} />
      </Switch>
    </Suspense>
  );
}

function App() {
  return <Router />;
}

export default App;
