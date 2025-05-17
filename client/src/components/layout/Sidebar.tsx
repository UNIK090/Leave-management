import { cn } from "@/lib/utils";
import { Link, useLocation } from "wouter";
import { User } from "@shared/types";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  BookOpen,
  CalendarDays,
  Home,
  LogOut,
  PlusCircle,
  Settings,
  User as UserIcon,
  Users,
} from "lucide-react";

interface SidebarProps {
  user: User;
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ user, isOpen, onClose }: SidebarProps) {
  const [location] = useLocation();

  // Get the first letter of first name and last name for avatar fallback
  const getInitials = () => {
    if (!user.firstName && !user.lastName) return "U";
    return `${user.firstName?.[0] || ""}${user.lastName?.[0] || ""}`;
  };

  const isLinkActive = (path: string) => {
    return location === path;
  };

  const navItems = [
    {
      label: "Main",
      items: [
        {
          name: "Dashboard",
          href: "/dashboard",
          icon: <Home className="h-5 w-5" />,
        },
        {
          name: "My Leaves",
          href: "/my-leaves",
          icon: <CalendarDays className="h-5 w-5" />,
        },
        {
          name: "New Request",
          href: "/new-request",
          icon: <PlusCircle className="h-5 w-5" />,
        },
      ],
    },
  ];

  // Admin nav items
  if (user.role === "admin") {
    navItems.push({
      label: "Admin",
      items: [
        {
          name: "All Requests",
          href: "/admin",
          icon: <BookOpen className="h-5 w-5" />,
        },
        {
          name: "All Users",
          href: "/admin/users",
          icon: <Users className="h-5 w-5" />,
        },
      ],
    });
  }

  // Account nav items
  navItems.push({
    label: "Account",
    items: [
      {
        name: "Profile",
        href: "/profile",
        icon: <UserIcon className="h-5 w-5" />,
      },
      {
        name: "Settings",
        href: "/settings",
        icon: <Settings className="h-5 w-5" />,
      },
    ],
  });

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-10 lg:hidden"
          onClick={onClose}
        ></div>
      )}

      <aside
        className={cn(
          "fixed lg:relative w-64 bg-white shadow-lg h-screen z-20 transform lg:transform-none transition-transform duration-300",
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        <div className="flex flex-col h-full">
          {/* Logo and App Title */}
          <div className="p-4 border-b border-neutral-100">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white font-bold">
                ULM
              </div>
              <div>
                <h1 className="font-bold text-primary">Leave Manager</h1>
                <p className="text-xs text-neutral-500">University Edition</p>
              </div>
            </div>
          </div>

          {/* User Profile */}
          <div className="p-4 border-b border-neutral-100">
            <div className="flex items-center space-x-3">
              <Avatar>
                <AvatarImage
                  src={user.profileImageUrl || undefined}
                  alt={`${user.firstName} ${user.lastName}`}
                />
                <AvatarFallback>{getInitials()}</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium text-sm">
                  {user.firstName} {user.lastName}
                </p>
                <p className="text-xs text-neutral-500 capitalize">
                  {user.role}
                </p>
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 overflow-y-auto py-4">
            {navItems.map((section, idx) => (
              <div key={idx} className="mb-6">
                <div className="px-4 mb-2 text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                  {section.label}
                </div>
                {section.items.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={onClose}
                    className={cn(
                      "sidebar-link flex items-center pl-3 pr-4 py-3 text-sm font-medium hover:bg-neutral-50",
                      isLinkActive(item.href)
                        ? "active text-primary"
                        : "text-neutral-600"
                    )}
                  >
                    <span className="text-xl mr-3">{item.icon}</span>
                    {item.name}
                  </Link>
                ))}
              </div>
            ))}
          </nav>

          {/* Logout Button */}
          <div className="p-4 border-t border-neutral-100">
            <a
              href="/api/logout"
              className="flex items-center w-full px-4 py-2 text-sm font-medium text-neutral-700 rounded-lg hover:bg-neutral-100"
            >
              <LogOut className="h-5 w-5 mr-3" />
              Sign Out
            </a>
          </div>
        </div>
      </aside>
    </>
  );
}
