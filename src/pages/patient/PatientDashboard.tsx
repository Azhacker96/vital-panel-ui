import { FileText, Clock, AlertTriangle, Activity } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/use-auth";

const stats = [
  { label: "Total Reports", value: "8", icon: FileText, color: "text-primary" },
  { label: "Under Review", value: "2", icon: Clock, color: "text-warning" },
  { label: "Critical Alerts", value: "1", icon: AlertTriangle, color: "text-destructive" },
  { label: "Health Score", value: "85%", icon: Activity, color: "text-success" },
];

export default function PatientDashboard() {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Welcome, {user?.name}</h1>
        <p className="text-muted-foreground">Your health overview</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => (
          <Card key={stat.label} className="animate-slide-up" style={{ animationDelay: `${index * 50}ms` }}>
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <p className="text-3xl font-bold text-foreground mt-1">{stat.value}</p>
                </div>
                <div className={`p-3 rounded-full bg-muted/50 ${stat.color}`}>
                  <stat.icon className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardContent className="p-5">
          <h3 className="font-semibold mb-4">Latest Health Summary</h3>
          <p className="text-sm text-muted-foreground">Your recent blood test shows all values within normal range. Continue maintaining a healthy lifestyle.</p>
          <Badge className="mt-3 bg-success/20 text-success">Good Health</Badge>
        </CardContent>
      </Card>
    </div>
  );
}
