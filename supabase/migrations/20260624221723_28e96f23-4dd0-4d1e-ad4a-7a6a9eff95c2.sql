
DROP POLICY IF EXISTS "profiles doctor read" ON public.profiles;

CREATE POLICY "profiles doctor read assigned"
ON public.profiles
FOR SELECT
TO authenticated
USING (
  public.has_role(auth.uid(), 'doctor')
  AND public.is_doctor_for_patient(auth.uid(), id)
);
