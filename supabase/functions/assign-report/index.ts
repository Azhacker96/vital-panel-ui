import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );
    const token = authHeader.replace("Bearer ", "");
    const { data: claims, error: claimsErr } = await supabase.auth.getClaims(token);
    if (claimsErr || !claims?.claims) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    const userId = claims.claims.sub as string;

    const body = await req.json().catch(() => ({}));
    const reportId: string | undefined = body.report_id;
    const mode: string = body.mode ?? "auto";

    const admin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

    // Find active doctors
    const { data: roleRows } = await admin.from("user_roles").select("user_id").eq("role", "doctor");
    const doctorIds = (roleRows ?? []).map((r) => r.user_id);
    if (doctorIds.length === 0) {
      return new Response(JSON.stringify({ error: "No doctors available" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    const { data: profs } = await admin.from("profiles").select("id,status").in("id", doctorIds);
    const active = (profs ?? []).filter((p) => p.status === "active").map((p) => p.id);
    if (active.length === 0) {
      return new Response(JSON.stringify({ error: "No active doctors" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // Pending counts → least-loaded
    const { data: pending } = await admin.from("report_assignments").select("doctor_id").neq("status", "completed");
    const counts = new Map<string, number>();
    active.forEach((id) => counts.set(id, 0));
    (pending ?? []).forEach((p) => counts.set(p.doctor_id, (counts.get(p.doctor_id) ?? 0) + 1));

    // Reports to assign
    const { data: assigned } = await admin.from("report_assignments").select("report_id");
    const assignedSet = new Set((assigned ?? []).map((a) => a.report_id));
    let targets: string[] = [];
    if (reportId) {
      if (!assignedSet.has(reportId)) targets = [reportId];
    } else {
      const { data: reps } = await admin.from("reports").select("id,is_critical").order("is_critical", { ascending: false }).order("created_at", { ascending: true });
      targets = (reps ?? []).filter((r) => !assignedSet.has(r.id)).map((r) => r.id);
    }
    if (targets.length === 0) {
      return new Response(JSON.stringify({ ok: true, assigned: 0 }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const inserts = targets.map((id) => {
      let pickedId = active[0];
      let min = Infinity;
      if (mode === "round_robin") {
        pickedId = active[targets.indexOf(id) % active.length];
      } else {
        for (const d of active) {
          const c = counts.get(d) ?? 0;
          if (c < min) { min = c; pickedId = d; }
        }
        counts.set(pickedId, (counts.get(pickedId) ?? 0) + 1);
      }
      return { report_id: id, doctor_id: pickedId, assigned_by: userId, status: "pending" as const };
    });

    const { error: insErr } = await admin.from("report_assignments").insert(inserts);
    if (insErr) {
      return new Response(JSON.stringify({ error: insErr.message }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // Notify doctors + update report status
    const notifs = inserts.map((i) => ({ user_id: i.doctor_id, title: "New report assigned", message: "A new report is awaiting your review.", type: "info" }));
    await admin.from("notifications").insert(notifs);
    await admin.from("reports").update({ status: "under_review" }).in("id", targets);

    return new Response(JSON.stringify({ ok: true, assigned: inserts.length }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});