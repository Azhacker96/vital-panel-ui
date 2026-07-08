
# Audit Summary

**Current state**
- Pure frontend React/Vite app. No backend.
- Auth is `localStorage` only (`src/hooks/use-auth.tsx`) — passwords stored in plain text in the browser. Critical security issue.
- Roles (`admin` / `doctor` / `patient`) are kept on the user object, not in a separate table. Privilege-escalation risk.
- All medical data (reports, assignments, patient history, notifications, feedback) is hardcoded mock data in the page components.
- Forms present: Login, Signup, Profile edit (mock), Patient Upload (no real upload), Patient Feedback (mock), Settings (mock). All only update local state.
- No DB, no APIs, no file storage, no email, no rate limiting, no audit log.
- SEO: default `index.html` title/meta, no sitemap, no robots refinement.

**Out of scope (per your answer)**
- Public marketing forms (contact / newsletter / appointments / leads). Medical app only.

---

# What I'll build

## Phase 1 — Enable Lovable Cloud + real auth & RBAC
- Enable Lovable Cloud (Supabase managed).
- Replace localStorage auth with Supabase Auth (email + password; Google sign-in optional later).
- DB tables (with GRANTs + RLS):
  - `profiles` (id → auth.users, first_name, last_name, phone, avatar_url, status, created_at, updated_at)
  - `app_role` enum (`admin`, `doctor`, `patient`)
  - `user_roles` (user_id, role) + `has_role()` security-definer function
  - Trigger `handle_new_user` → auto-create profile + default `patient` role on signup
- Rewrite `useAuth` to wrap Supabase, expose `user`, `session`, `roles`, `signIn`, `signUp`, `signOut`, `resetPassword`.
- Add `/reset-password` page.
- Route guard component `<RequireRole roles={[…]}>` for admin/doctor/patient sections.
- Update `Login.tsx`, `Signup.tsx`, `UserManagement.tsx` to use Supabase.

## Phase 2 — Medical core data model
Tables (all with RLS + GRANTs):
- `reports` — id, patient_id, uploaded_by, file_path, file_type, status (`uploaded|ocr|ai_done|under_review|completed|critical`), ocr_text, ai_summary, ai_confidence, parameters jsonb, is_critical, created_at, updated_at
- `report_assignments` — id, report_id, doctor_id, assigned_by, assigned_at, status
- `doctor_reviews` — id, report_id, doctor_id, diagnosis, comments, follow_up, approved, created_at
- `patient_medical_history` — id, patient_id, report_id, summary, recorded_at
- `notifications` — id, user_id, type, title, body, read, created_at
- `feedback` — id, patient_id, report_id, rating, comment, created_at
- `activity_logs` — id, user_id, action, entity, entity_id, ip_address, created_at
- `support_tickets` — id, user_id, subject, description, priority, status, created_at
- Storage bucket `medical-reports` (private) with RLS: patient uploads own; doctor reads assigned; admin reads all.

RLS policies (summary):
- Patients: read/write only their own rows.
- Doctors: read reports/patients assigned to them; write `doctor_reviews` for assigned reports.
- Admins: full read; write via UI.
- All via `has_role(auth.uid(), 'role')`.

Wire existing pages to live data (replace mocks): Patient dashboard/upload/status/results/history/feedback/notifications, Doctor dashboard/assigned/review/patients/critical/notifications, Admin dashboard/user-management/report-management/assign-reports/patient-history/notifications/logs.

## Phase 3 — Admin CRUD + edge functions
- Edge function `assign-report` (auto round-robin / manual) — admin only.
- Edge function `notify-user` — inserts notifications + optional email via Resend connector (deferred unless you ask).
- Admin UI hooks: change role, activate/deactivate user (calls `user_roles` + `profiles.status`), assign reports, view logs.

## Phase 4 — Security & SEO polish
- Server-side validation with `zod` on all forms (client) + RLS as server-side guard.
- Spam/dup protection: unique-by-time DB constraints on uploads + simple rate-limit check in edge functions (per `auth.uid()`).
- Audit logging trigger on critical tables → `activity_logs`.
- Enable HIBP leaked-password check.
- SEO: per-route `<title>`/`<meta description>` via a small `Seo` component, Open Graph defaults, `public/robots.txt`, generated `public/sitemap.xml` via `scripts/generate-sitemap.ts` (only public routes: `/`, `/login`, `/signup`).
- Accessibility pass: labels, focus states, aria on icon buttons.

---

# Technical details

```text
auth.users ──< profiles
auth.users ──< user_roles (role: app_role)
auth.users ──< reports (patient_id, uploaded_by)
reports ──< report_assignments >── auth.users (doctor_id)
reports ──< doctor_reviews >── auth.users (doctor_id)
reports ──< patient_medical_history
auth.users ──< notifications
auth.users ──< feedback ── reports
auth.users ──< support_tickets
auth.users ──< activity_logs
storage.medical-reports (bucket)
```

Every `CREATE TABLE public.*` migration ships with:
1. `GRANT SELECT/INSERT/UPDATE/DELETE … TO authenticated`
2. `GRANT ALL … TO service_role`
3. `ENABLE ROW LEVEL SECURITY`
4. Policies using `public.has_role(auth.uid(), '<role>')`

Auth listener pattern: register `onAuthStateChange` first, then `getSession()`; use `getUser()` whenever code makes an authorization decision.

---

# Delivery order

I'll implement in this order, committing each phase so you can test:
1. **Phase 1** (Cloud on, auth migration, roles, route guards) — ship first.
2. **Phase 2** (medical schema + wire pages to live data).
3. **Phase 3** (edge functions + admin CRUD wiring).
4. **Phase 4** (security hardening, audit logs, SEO, sitemap, a11y).

Approve and I'll start with Phase 1 (enabling Lovable Cloud + auth migration). The existing localStorage users will be wiped — anyone testing will need to sign up again.
