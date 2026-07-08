DO $$
BEGIN
  BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.reports; EXCEPTION WHEN duplicate_object THEN NULL; END;
  BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.analyze_history; EXCEPTION WHEN duplicate_object THEN NULL; END;
  BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.report_assignments; EXCEPTION WHEN duplicate_object THEN NULL; END;
END $$;
ALTER TABLE public.reports REPLICA IDENTITY FULL;
ALTER TABLE public.analyze_history REPLICA IDENTITY FULL;
ALTER TABLE public.report_assignments REPLICA IDENTITY FULL;