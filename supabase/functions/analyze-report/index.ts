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

    // Download the actual file from storage and pass it to the model
    let dataUrl: string | null = null;
    const isImage = (report.file_type ?? "").startsWith("image/");
    const isPdf = (report.file_type ?? "") === "application/pdf";
    try {
      const { data: blob } = await admin.storage.from("medical-reports").download(report.file_path);
      if (blob) {
        const buf = new Uint8Array(await blob.arrayBuffer());
        let bin = "";
        for (let i = 0; i < buf.length; i++) bin += String.fromCharCode(buf[i]);
        const b64 = btoa(bin);
        dataUrl = `data:${report.file_type};base64,${b64}`;
      }
    } catch (_) { /* ignore — fall back to text-only */ }

    const instruction = `You are a medical lab report analyzer. Read the attached report image/PDF carefully and extract EXACTLY the values shown. Do NOT invent or guess any parameters that are not visible. If a value is unreadable, omit it. Respond ONLY with valid JSON of shape: {"summary": string (2-3 sentences describing what the report says), "confidence": number 0-1 (your OCR confidence), "is_critical": boolean (true only if any parameter is in a clinically critical range), "parameters": [{"name": string, "value": string (with units exactly as printed), "range": string (reference range as printed, or "" if absent), "status": "normal"|"high"|"low"|"critical"}]}. If the file is not a medical report, return {"summary":"Not a medical report","confidence":0,"is_critical":false,"parameters":[]}.`;

    const userContent: any[] = [{ type: "text", text: instruction }];
    if (dataUrl && (isImage || isPdf)) {
      userContent.push({ type: "image_url", image_url: { url: dataUrl } });
    } else {
      userContent.push({ type: "text", text: `File metadata only — title: "${report.title}", type: ${report.file_type}. File contents unavailable.` });
    }

    const aiRes = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${LOVABLE_API_KEY}` },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [{ role: "user", content: userContent }],
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