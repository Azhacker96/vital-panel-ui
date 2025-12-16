import { NavLink } from "@/components/NavLink";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";
import { useNavigate } from "react-router-dom";
import { HeartbeatLogo } from "@/components/HeartbeatLogo";
import {
  LayoutDashboard,
  Upload,
  FileSearch,
  Brain,
  MessageSquare,
  History,
  Bell,
  User,
  ChevronLeft,
  ChevronRight,
  LogOut,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

interface PatientSidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/patient" },
  { icon: Upload, label: "Upload Report", path: "/patient/upload" },
  { icon: FileSearch, label: "Report Status", path: "/patient/status" },
  { icon: Brain, label: "AI Results", path: "/patient/results" },
  { icon: MessageSquare, label: "Doctor Feedback", path: "/patient/feedback" },
  { icon: History, label: "Medical History", path: "/patient/history" },
  { icon: Bell, label: "Notifications", path: "/patient/notifications" },
  { icon: User, label: "Profile", path: "/patient/profile" },
];

export function PatientSidebar({ collapsed, onToggle }: PatientSidebarProps) {
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-40 h-screen bg-card border-r transition-all duration-300 ease-in-out flex flex-col",
        collapsed ? "w-16" : "w-64"
      )}
    >
      {/* Header */}
      <div className="h-16 flex items-center justify-between px-3 border-b shrink-0">
        <div className={cn("flex items-center gap-2 overflow-hidden", collapsed && "justify-center w-full")}>
          <HeartbeatLogo size="sm" />
          {!collapsed && (
            <span className="text-sm font-semibold text-foreground whitespace-nowrap">Patient Portal</span>
          )}
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggle}
          className={cn("h-8 w-8 shrink-0", collapsed && "absolute -right-3 top-6 bg-card border shadow-sm rounded-full")}
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-2 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === "/patient"}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2.5 text-muted-foreground transition-all hover:text-foreground hover:bg-muted/50",
              collapsed && "justify-center px-2"
            )}
            activeClassName="bg-primary/10 text-primary font-medium"
          >
            <item.icon className="h-5 w-5 shrink-0" />
            {!collapsed && <span className="truncate">{item.label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-2 border-t shrink-0">
        {!collapsed && user && (
          <div className="px-3 py-2 mb-2">
            <p className="text-sm font-medium text-foreground truncate">{user.name}</p>
            <p className="text-xs text-muted-foreground truncate">{user.email}</p>
          </div>
        )}
        <Separator className={cn("mb-2", collapsed && "hidden")} />
        <Button
          variant="ghost"
          className={cn(
            "w-full justify-start gap-3 text-muted-foreground hover:text-destructive hover:bg-destructive/10",
            collapsed && "justify-center px-2"
          )}
          onClick={handleLogout}
        >
          <LogOut className="h-5 w-5 shrink-0" />
          {!collapsed && <span>Logout</span>}
        </Button>
      </div>
    </aside>
  );
}
