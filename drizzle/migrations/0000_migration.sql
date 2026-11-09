CREATE OR REPLACE FUNCTION public.escalate_report(_report_id uuid, _note text DEFAULT NULL)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  _count integer;
  _title text;
BEGIN
  IF NOT (public.has_role(auth.uid(), 'doctor') AND public.is_doctor_for_report(auth.uid(), _report_id)) THEN
    RAISE EXCEPTION 'Not allowed';
  END IF;
  SELECT COALESCE(title, 'Report') INTO _title FROM public.reports WHERE id = _report_id;
  INSERT INTO public.notifications (user_id, type, title, body)
  SELECT ur.user_id, 'alert', 'Critical case escalated',
         'A doctor escalated "' || _title || '"' || COALESCE(': ' || NULLIF(_note, ''), '.')
  FROM public.user_roles ur WHERE ur.role = 'admin';
  GET DIAGNOSTICS _count = ROW_COUNT;
  INSERT INTO public.activity_logs (user_id, action, entity, entity_id, metadata)
  VALUES (auth.uid(), 'Escalated critical case', 'report', _report_id, '{"category":"workflow","level":"warning"}'::jsonb);
  RETURN _count;
END;
$$;
REVOKE ALL ON FUNCTION public.escalate_report(uuid, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.escalate_report(uuid, text) TO authenticated;