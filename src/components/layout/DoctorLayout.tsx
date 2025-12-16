import { useState } from "react";
import { DoctorSidebar } from "./DoctorSidebar";
import { DoctorMobileNav } from "./DoctorMobileNav";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import { HeartbeatLogo } from "@/components/HeartbeatLogo";

interface DoctorLayoutProps {
  children: React.ReactNode;
}

export function DoctorLayout({ children }: DoctorLayoutProps) {
  const [collapsed, setCollapsed] = useState(false);
  const isMobile = useIsMobile();

  return (
    <div className="min-h-screen bg-background">
      {/* Desktop Sidebar */}
      {!isMobile && (
        <DoctorSidebar collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />
      )}

      {/* Mobile Header */}
      {isMobile && (
        <header className="h-14 border-b bg-card flex items-center px-4 gap-3">
          <HeartbeatLogo size="sm" />
          <span className="text-sm font-semibold text-foreground leading-tight">Doctor<br/>Panel</span>
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
      {isMobile && <DoctorMobileNav />}
    </div>
  );
}
