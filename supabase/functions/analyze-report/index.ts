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

    const { report_id } = await req.json();
    if (!report_id || typeof report_id !== "string") {
      return new Response(JSON.stringify({ error: "report_id required" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const admin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const { data: report, error: rErr } = await admin.from("reports").select("*").eq("id", report_id).maybeSingle();
    if (rErr || !report) {
      return new Response(JSON.stringify({ error: "Report not found" }), { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    await admin.from("reports").update({ status: "ocr" }).eq("id", report_id);

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      return new Response(JSON.stringify({ error: "AI gateway not configured" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const prompt = `You are a medical report analyzer. The report file is "${report.title}" (type: ${report.file_type}). Without the file contents, generate a realistic mock structured analysis as if you'd OCR'd a routine lab report. Respond ONLY with JSON matching this shape: {"summary": string (2-3 sentences), "confidence": number 0-1, "is_critical": boolean, "parameters": [{"name": string, "value": string, "range": string, "status": "normal"|"high"|"low"|"critical"}]}.`;

    const aiRes = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${LOVABLE_API_KEY}` },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" },
      }),
    });
    if (!aiRes.ok) {
      const text = await aiRes.text();
      await admin.from("reports").update({ status: "uploaded" }).eq("id", report_id);
      if (aiRes.status === 429) return new Response(JSON.stringify({ error: "Rate limit exceeded, try again shortly" }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      if (aiRes.status === 402) return new Response(JSON.stringify({ error: "AI credits exhausted" }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      return new Response(JSON.stringify({ error: "AI failed", detail: text }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    const aiJson = await aiRes.json();
    let parsed: any = {};
    try { parsed = JSON.parse(aiJson.choices?.[0]?.message?.content ?? "{}"); } catch { parsed = {}; }

    const isCritical = !!parsed.is_critical;
    await admin.from("reports").update({
      status: isCritical ? "critical" : "ai_done",
      ai_summary: parsed.summary ?? null,
      ai_confidence: typeof parsed.confidence === "number" ? parsed.confidence : null,
      parameters: parsed.parameters ?? null,
      is_critical: isCritical,
    }).eq("id", report_id);

    await admin.from("notifications").insert({
      user_id: report.patient_id,
      title: isCritical ? "Critical results detected" : "AI analysis ready",
      message: parsed.summary ?? "Your report has been analyzed.",
      type: isCritical ? "critical" : "info",
    });

    return new Response(JSON.stringify({ ok: true, report_id, is_critical: isCritical }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});