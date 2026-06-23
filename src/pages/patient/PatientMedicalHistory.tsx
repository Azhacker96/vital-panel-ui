import { Download, FileText } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

type Row = { id: string; title: string | null; created_at: string; status: string; file_path: string };

export default function PatientHistory() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [history, setHistory] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await supabase
        .from("reports")
        .select("id,title,created_at,status,file_path")
        .eq("patient_id", user.id)
        .order("created_at", { ascending: false });
      setHistory((data ?? []) as Row[]);
      setLoading(false);
    })();
  }, [user]);

  const downloadFile = async (path: string) => {
    const { data, error } = await supabase.storage.from("medical-reports").createSignedUrl(path, 60);
    if (error || !data) {
      toast({ title: "Download failed", description: error?.message ?? "Unknown error", variant: "destructive" });
      return;
    }
    window.open(data.signedUrl, "_blank");
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Medical History</h1>
        <p className="text-muted-foreground">View and download your past reports</p>
      </div>

      <div className="space-y-3">
        {loading && <p className="text-sm text-muted-foreground">Loading…</p>}
        {!loading && history.length === 0 && (
          <Card><CardContent className="p-8 text-center text-muted-foreground"><FileText className="h-10 w-10 mx-auto mb-2 opacity-50" />No past reports.</CardContent></Card>
        )}
        {history.map((item, index) => (
          <Card key={item.id} className="animate-slide-up" style={{ animationDelay: `${index * 50}ms` }}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <FileText className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-medium">{item.title ?? "Untitled Report"}</p>
                    <p className="text-sm text-muted-foreground">{new Date(item.created_at).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className="bg-success/20 text-success">{item.status}</Badge>
                  <Button size="sm" variant="outline" className="gap-1" onClick={() => downloadFile(item.file_path)}>
                    <Download className="h-3 w-3" />
                    Open
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
