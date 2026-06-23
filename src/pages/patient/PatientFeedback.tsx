import { MessageSquare, User } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";

type Row = {
  id: string;
  doctor: string;
  date: string;
  report: string;
  comment: string | null;
  followUp: string | null;
};

export default function PatientFeedback() {
  const { user } = useAuth();
  const [feedbacks, setFeedbacks] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    (async () => {
      // Get patient's reports, then reviews
      const { data: reports } = await supabase
        .from("reports")
        .select("id,title")
        .eq("patient_id", user.id);
      const ids = (reports ?? []).map((r) => r.id);
      if (ids.length === 0) { setLoading(false); return; }
      const { data: reviews } = await supabase
        .from("doctor_reviews")
        .select("id,report_id,doctor_id,comments,follow_up,created_at")
        .in("report_id", ids)
        .order("created_at", { ascending: false });
      const doctorIds = Array.from(new Set((reviews ?? []).map((r) => r.doctor_id)));
      const { data: profiles } = doctorIds.length
        ? await supabase.from("profiles").select("id,first_name,last_name").in("id", doctorIds)
        : { data: [] as any[] };
      const docMap = new Map((profiles ?? []).map((p: any) => [p.id, `Dr. ${[p.first_name, p.last_name].filter(Boolean).join(" ") || "Unknown"}`]));
      const repMap = new Map((reports ?? []).map((r) => [r.id, r.title ?? "Report"]));
      setFeedbacks((reviews ?? []).map((r) => ({
        id: r.id,
        doctor: docMap.get(r.doctor_id) ?? "Doctor",
        date: new Date(r.created_at).toLocaleDateString(),
        report: repMap.get(r.report_id) ?? "Report",
        comment: r.comments,
        followUp: r.follow_up,
      })));
      setLoading(false);
    })();
  }, [user]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Doctor Feedback</h1>
        <p className="text-muted-foreground">Comments and recommendations from your doctors</p>
      </div>

      <div className="space-y-4">
        {loading && <p className="text-sm text-muted-foreground">Loading…</p>}
        {!loading && feedbacks.length === 0 && (
          <Card><CardContent className="p-8 text-center text-muted-foreground"><MessageSquare className="h-10 w-10 mx-auto mb-2 opacity-50" />No doctor feedback yet.</CardContent></Card>
        )}
        {feedbacks.map((feedback) => (
          <Card key={feedback.id}>
            <CardContent className="p-5">
              <div className="flex items-start gap-4">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <User className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold">{feedback.doctor}</h3>
                    <span className="text-sm text-muted-foreground">{feedback.date}</span>
                  </div>
                  <Badge variant="outline" className="mt-1">{feedback.report}</Badge>
                  <p className="mt-3 text-sm text-muted-foreground">{feedback.comment}</p>
                  {feedback.followUp && (
                    <div className="mt-3 p-3 bg-primary/5 rounded-lg">
                      <p className="text-sm font-medium text-primary">{feedback.followUp}</p>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
