import { 
  LayoutDashboard, 
  Users, 
  FileText, 
  ClipboardList, 
  History, 
  Bell, 
  Settings, 
  Activity, 
  UserCircle,
  MoreHorizontal
} from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { cn } from "@/lib/utils";
import { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

const primaryNavItems = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard },
  { title: "Reports", url: "/reports", icon: FileText },
  { title: "Users", url: "/users", icon: Users },
  { title: "Alerts", url: "/notifications", icon: Bell },
];

const moreNavItems = [
  { title: "Assign Reports", url: "/assign", icon: ClipboardList },
  { title: "Patient History", url: "/history", icon: History },
  { title: "Settings", url: "/settings", icon: Settings },
  { title: "Logs & Monitoring", url: "/logs", icon: Activity },
  { title: "Profile", url: "/profile", icon: UserCircle },
];

export function MobileNav() {
  const [sheetOpen, setSheetOpen] = useState(false);

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t bg-card safe-area-bottom">
      <div className="flex items-center justify-around py-2">
        {primaryNavItems.map((item) => (
          <NavLink
            key={item.title}
            to={item.url}
            end={item.url === "/"}
            className="flex flex-col items-center gap-1 px-3 py-2 text-muted-foreground transition-colors"
            activeClassName="text-secondary"
          >
            <item.icon className="h-5 w-5" />
            <span className="text-[10px] font-medium">{item.title}</span>
          </NavLink>
        ))}
        
        <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
          <SheetTrigger asChild>
            <button className="flex flex-col items-center gap-1 px-3 py-2 text-muted-foreground transition-colors">
              <MoreHorizontal className="h-5 w-5" />
              <span className="text-[10px] font-medium">More</span>
            </button>
          </SheetTrigger>
          <SheetContent side="bottom" className="h-auto max-h-[70vh] rounded-t-xl">
            <SheetHeader>
              <SheetTitle className="text-left">More Options</SheetTitle>
            </SheetHeader>
            <div className="mt-4 grid grid-cols-3 gap-4 pb-6">
              {moreNavItems.map((item) => (
                <NavLink
                  key={item.title}
                  to={item.url}
                  onClick={() => setSheetOpen(false)}
                  className="flex flex-col items-center gap-2 rounded-lg p-4 text-muted-foreground transition-colors hover:bg-muted"
                  activeClassName="bg-secondary/10 text-secondary"
                >
                  <item.icon className="h-6 w-6" />
                  <span className="text-xs font-medium text-center">{item.title}</span>
                </NavLink>
              ))}
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </nav>
  );
}
