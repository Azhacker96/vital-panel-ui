
CREATE TABLE public.analyze_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  report_id UUID NOT NULL REFERENCES public.reports(id) ON DELETE CASCADE,
  confidence NUMERIC,
  is_critical BOOLEAN NOT NULL DEFAULT false,
  status TEXT NOT NULL,
  parameter_count INTEGER NOT NULL DEFAULT 0,
  error TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX idx_analyze_history_report ON public.analyze_history(report_id, created_at DESC);

GRANT SELECT ON public.analyze_history TO authenticated;
GRANT ALL ON public.analyze_history TO service_role;

ALTER TABLE public.analyze_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins view all analyze history"
ON public.analyze_history FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Doctors view assigned report history"
ON public.analyze_history FOR SELECT TO authenticated
USING (public.is_doctor_for_report(auth.uid(), report_id));

CREATE POLICY "Patients view their report history"
ON public.analyze_history FOR SELECT TO authenticated
USING (EXISTS (SELECT 1 FROM public.reports r WHERE r.id = report_id AND r.patient_id = auth.uid()));
