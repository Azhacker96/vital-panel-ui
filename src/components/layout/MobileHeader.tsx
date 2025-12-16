import { HeartbeatLogo } from "@/components/HeartbeatLogo";
import { useAuth } from "@/hooks/use-auth";

export function MobileHeader() {
  const { user } = useAuth();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-16 border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
      <div className="flex h-full items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <HeartbeatLogo size="sm" />
          <span className="text-sm font-semibold text-foreground leading-tight">
            Self-Learning<br/>Medical Analyst
          </span>
        </div>
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary text-secondary-foreground text-sm font-medium">
          {user?.name?.charAt(0) || "A"}
        </div>
      </div>
    </header>
  );
}
