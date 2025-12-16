import {
  LayoutDashboard,
  FileText,
  AlertTriangle,
  Bell,
  MoreHorizontal,
  ClipboardCheck,
  Users,
  User,
  LogOut,
} from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/use-auth";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

const mainNavItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/doctor" },
  { icon: FileText, label: "Reports", path: "/doctor/reports" },
  { icon: AlertTriangle, label: "Critical", path: "/doctor/critical" },
  { icon: Bell, label: "Alerts", path: "/doctor/notifications" },
];

const moreNavItems = [
  { icon: ClipboardCheck, label: "Review", path: "/doctor/review" },
  { icon: Users, label: "Patients", path: "/doctor/patients" },
  { icon: User, label: "Profile", path: "/doctor/profile" },
];

export function DoctorMobileNav() {
  const [isOpen, setIsOpen] = useState(false);
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card border-t">
      <div className="flex items-center justify-around h-16">
        {mainNavItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === "/doctor"}
            className={cn(
              "flex flex-col items-center gap-1 px-3 py-2 text-muted-foreground transition-colors"
            )}
            activeClassName="text-primary"
          >
            <item.icon className="h-5 w-5" />
            <span className="text-xs">{item.label}</span>
          </NavLink>
        ))}
        
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <button className="flex flex-col items-center gap-1 px-3 py-2 text-muted-foreground">
              <MoreHorizontal className="h-5 w-5" />
              <span className="text-xs">More</span>
            </button>
          </SheetTrigger>
          <SheetContent side="bottom" className="h-auto max-h-[70vh] rounded-t-xl">
            <SheetHeader>
              <SheetTitle>More Options</SheetTitle>
            </SheetHeader>
            <div className="mt-4 grid grid-cols-3 gap-4 pb-6">
              {moreNavItems.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsOpen(false)}
                  className="flex flex-col items-center gap-2 p-4 rounded-lg hover:bg-muted/50 text-muted-foreground"
                  activeClassName="bg-primary/10 text-primary"
                >
                  <item.icon className="h-6 w-6" />
                  <span className="text-sm">{item.label}</span>
                </NavLink>
              ))}
              <button
                onClick={handleLogout}
                className="flex flex-col items-center gap-2 p-4 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive"
              >
                <LogOut className="h-6 w-6" />
                <span className="text-sm">Logout</span>
              </button>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </nav>
  );
}
