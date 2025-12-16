import { useState } from "react";
import { PatientSidebar } from "./PatientSidebar";
import { PatientMobileNav } from "./PatientMobileNav";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import { HeartbeatLogo } from "@/components/HeartbeatLogo";

interface PatientLayoutProps {
  children: React.ReactNode;
}

export function PatientLayout({ children }: PatientLayoutProps) {
  const [collapsed, setCollapsed] = useState(false);
  const isMobile = useIsMobile();

  return (
    <div className="min-h-screen bg-background">
      {/* Desktop Sidebar */}
      {!isMobile && (
        <PatientSidebar collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />
      )}

      {/* Mobile Header */}
      {isMobile && (
        <header className="h-14 border-b bg-card flex items-center px-4 gap-3">
          <HeartbeatLogo size="sm" />
          <span className="text-sm font-semibold text-foreground leading-tight">Patient<br/>Portal</span>
        </header>
      )}
      
      {/* Main Content */}
      <main
        className={cn(
          "min-h-screen transition-all duration-300 ease-in-out",
          isMobile ? "ml-0 pb-20" : (collapsed ? "ml-16" : "ml-64")
        )}
      >
        <div className="p-4 md:p-6">
          {children}
        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      {isMobile && <PatientMobileNav />}
    </div>
  );
}
