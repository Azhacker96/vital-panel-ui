import { useEffect, useState } from "react";
import { Activity, AlertCircle, Brain, FileText, Shield, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";

const logCategories = [
  { label: "User Activity", value: "activity", icon: Activity },
  { label: "System Errors", value: "errors", icon: AlertCircle },
  { label: "AI Feedback", value: "ai", icon: Brain },
  { label: "Report Workflow", value: "workflow", icon: FileText },
  { label: "Security", value: "security", icon: Shield },
];

type LogRow = { id: string; category: string; user: string; action: string; time: string; level: string };

const levelStyles = {
  info: "bg-secondary/10 text-secondary border-secondary/30",
  success: "bg-success/10 text-success border-success/30",
  warning: "bg-warning/10 text-warning border-warning/30",
  error: "bg-destructive/10 text-destructive border-destructive/30",
};

export default function Logs() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [logs, setLogs] = useState<LogRow[]>([]);

  useEffect(() => {
    (async () => {
      const { data: rows } = await supabase
        .from("activity_logs")
        .select("id,user_id,action,entity,metadata,created_at")
        .order("created_at", { ascending: false })
        .limit(200);
      const userIds = Array.from(new Set((rows ?? []).map((r) => r.user_id).filter(Boolean) as string[]));
      const { data: profiles } = userIds.length
        ? await supabase.from("profiles").select("id,first_name,last_name,email").in("id", userIds)
        : { data: [] as any[] };
      const nameMap = new Map((profiles ?? []).map((p: any) => [p.id, [p.first_name, p.last_name].filter(Boolean).join(" ") || p.email || "User"]));
      setLogs((rows ?? []).map((r) => {
        const meta = (r.metadata ?? {}) as { category?: string; level?: string };
        return {
          id: r.id,
          category: meta.category ?? "activity",
          user: r.user_id ? (nameMap.get(r.user_id) ?? "User") : "System",
          action: r.action,
          time: new Date(r.created_at).toLocaleString(),
          level: meta.level ?? "info",
        };
      }));
    })();
  }, []);

  const filteredLogs = logs.filter((log) => {
    const matchesCategory = !selectedCategory || log.category === selectedCategory;
    const matchesSearch = log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.user.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Logs & Monitoring</h1>
        <p className="text-muted-foreground">View system activity and error logs</p>
      </div>

      {/* Category Tabs */}
      <div className="flex flex-wrap gap-2">
        <Button
          variant={selectedCategory === null ? "default" : "outline"}
          size="sm"
          onClick={() => setSelectedCategory(null)}
        >
          All Logs
        </Button>
        {logCategories.map((category) => (
          <Button
            key={category.value}
            variant={selectedCategory === category.value ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedCategory(category.value)}
            className="gap-2"
          >
            <category.icon className="h-4 w-4" />
            {category.label}
          </Button>
        ))}
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search logs..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Logs Table */}
      <div className="rounded-lg border bg-card overflow-hidden card-shadow">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Time</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Category</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">User</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Action</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Level</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredLogs.length === 0 && (
                <tr><td colSpan={5} className="px-4 py-8 text-center text-sm text-muted-foreground">No logs found.</td></tr>
              )}
              {filteredLogs.map((log, index) => {
                const category = logCategories.find((c) => c.value === log.category);
                return (
                  <tr
                    key={log.id}
                    className="animate-fade-in hover:bg-muted/30 transition-colors"
                    style={{ animationDelay: `${index * 30}ms` }}
                  >
                    <td className="px-4 py-3 text-sm text-muted-foreground whitespace-nowrap">{log.time}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {category && <category.icon className="h-4 w-4 text-muted-foreground" />}
                        <span className="text-sm text-foreground">{category?.label}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm font-medium text-foreground">{log.user}</td>
                    <td className="px-4 py-3 text-sm text-foreground">{log.action}</td>
                    <td className="px-4 py-3">
                      <Badge
                        variant="outline"
                        className={cn("capitalize border", levelStyles[log.level as keyof typeof levelStyles])}
                      >
                        {log.level}
                      </Badge>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
