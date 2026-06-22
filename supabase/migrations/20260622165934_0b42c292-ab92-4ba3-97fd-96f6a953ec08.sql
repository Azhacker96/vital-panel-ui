
-- Lock down helpers to authenticated/service_role only
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.get_user_role(uuid) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.is_doctor_for_report(uuid, uuid) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.is_doctor_for_patient(uuid, uuid) FROM PUBLIC, anon;

-- set_updated_at search_path
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$;

-- Storage policies: files keyed by `<patient_uid>/<filename>`
CREATE POLICY "reports patient upload" ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'medical-reports' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "reports patient read own" ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'medical-reports' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "reports patient delete own" ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'medical-reports' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "reports admin all" ON storage.objects FOR ALL TO authenticated
USING (bucket_id = 'medical-reports' AND public.has_role(auth.uid(),'admin'))
WITH CHECK (bucket_id = 'medical-reports' AND public.has_role(auth.uid(),'admin'));

CREATE POLICY "reports doctor read assigned" ON storage.objects FOR SELECT TO authenticated
USING (
  bucket_id = 'medical-reports'
  AND public.has_role(auth.uid(),'doctor')
  AND EXISTS (
    SELECT 1 FROM public.reports r
    JOIN public.report_assignments ra ON ra.report_id = r.id
    WHERE ra.doctor_id = auth.uid()
      AND r.file_path = storage.objects.name
  )
);
