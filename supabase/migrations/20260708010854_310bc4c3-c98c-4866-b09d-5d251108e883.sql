
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_user_role(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_doctor_for_report(uuid, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_doctor_for_patient(uuid, uuid) TO authenticated;
