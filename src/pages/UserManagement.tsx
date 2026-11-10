import { useState, useEffect, useCallback } from "react";
import { Plus, Search, MoreVertical, Edit, Trash2, Shield, Mail, RefreshCw, Power, PowerOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useAuth, UserRole } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const roleColors = {
  admin: "bg-secondary/20 text-secondary border-secondary/30",
  doctor: "bg-success/20 text-success border-success/30",
  patient: "bg-warning/20 text-warning border-warning/30",
};

interface ManagedUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: 'active' | 'inactive';
  avatar: string;
}

export default function UserManagement() {
  const { user: currentUser } = useAuth();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [users, setUsers] = useState<ManagedUser[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    const [{ data: profiles }, { data: roles }] = await Promise.all([
      supabase.from('profiles').select('id, first_name, last_name, email, avatar_url, status').order('created_at', { ascending: false }),
      supabase.from('user_roles').select('user_id, role'),
    ]);
    const roleMap = new Map<string, UserRole>();
    (roles ?? []).forEach((r: any) => roleMap.set(r.user_id, r.role));
    const mapped: ManagedUser[] = (profiles ?? []).map((p: any) => {
      const name = [p.first_name, p.last_name].filter(Boolean).join(' ').trim() || p.email || 'User';
      const initials = name.split(/\s+/).map((s: string) => s[0]).slice(0, 2).join('').toUpperCase();
      return {
        id: p.id,
        name,
        email: p.email ?? '',
        role: roleMap.get(p.id) ?? 'patient',
        status: (p.status as 'active' | 'inactive') ?? 'active',
        avatar: p.avatar_url ?? initials,
      };
    });
    setUsers(mapped);
    setLoading(false);
  }, []);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const filteredUsers = users.filter((user) => {
    const matchesSearch = user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = !selectedRole || user.role === selectedRole.toLowerCase();
    return matchesSearch && matchesRole;
  });

  const handleRoleChange = async (userId: string, newRole: UserRole) => {
    if (userId === currentUser?.id) {
      toast({ title: "Cannot change own role", variant: "destructive" });
      return;
    }
    const { error: delErr } = await supabase.from('user_roles').delete().eq('user_id', userId);
    if (delErr) { toast({ title: 'Failed', description: delErr.message, variant: 'destructive' }); return; }
    const { error } = await supabase.from('user_roles').insert({ user_id: userId, role: newRole });
    if (error) { toast({ title: 'Failed', description: error.message, variant: 'destructive' }); return; }
    toast({ title: "Role Updated", description: `User role changed to ${newRole}` });
    fetchUsers();
  };

  const [edit, setEdit] = useState<{ id: string; first_name: string; last_name: string; phone: string; email: string } | null>(null);
  const [saving, setSaving] = useState(false);

  const openEdit = async (id: string) => {
    const { data } = await supabase.from('profiles').select('first_name,last_name,phone,email').eq('id', id).maybeSingle();
    setEdit({ id, first_name: data?.first_name ?? '', last_name: data?.last_name ?? '', phone: data?.phone ?? '', email: data?.email ?? '' });
  };

  const saveEdit = async () => {
    if (!edit) return;
    if (!edit.first_name.trim()) { toast({ title: 'First name is required', variant: 'destructive' }); return; }
    setSaving(true);
    const { error } = await supabase.from('profiles').update({
      first_name: edit.first_name.trim(), last_name: edit.last_name.trim() || null, phone: edit.phone.trim() || null,
    }).eq('id', edit.id);
    setSaving(false);
    if (error) { toast({ title: 'Failed', description: error.message, variant: 'destructive' }); return; }
    toast({ title: 'User updated' });
    setEdit(null);
    fetchUsers();
  };

  const handleStatusChange = async (userId: string, status: 'active' | 'inactive') => {
    if (userId === currentUser?.id) {
      toast({ title: "Cannot change own status", variant: "destructive" });
      return;
    }
    const { error } = await supabase.from('profiles').update({ status }).eq('id', userId);
    if (error) { toast({ title: 'Failed', description: error.message, variant: 'destructive' }); return; }
    toast({ title: "Status Updated", description: `User ${status === 'active' ? 'activated' : 'deactivated'}` });
    fetchUsers();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">User Management</h1>
          <p className="text-muted-foreground">Manage system users and their roles</p>
        </div>
        <Button className="gap-2" onClick={fetchUsers}><RefreshCw className="h-4 w-4" />Refresh</Button>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search users..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-9" />
        </div>
        <div className="flex gap-2">
          {["Admin", "Doctor", "Patient"].map((role) => (
            <Button key={role} variant={selectedRole === role ? "default" : "outline"} size="sm" onClick={() => setSelectedRole(selectedRole === role ? null : role)}>
              {role}
            </Button>
          ))}
        </div>
      </div>

      {loading && <p className="text-sm text-muted-foreground">Loading users…</p>}
      {!loading && filteredUsers.length === 0 && (
        <p className="text-sm text-muted-foreground">No users match your filters yet.</p>
      )}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filteredUsers.map((user, index) => (
          <div key={user.id} className="min-w-0 rounded-lg border bg-card p-5 card-shadow animate-slide-up" style={{ animationDelay: `${index * 50}ms` }}>
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-3 min-w-0">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground font-semibold">
                  {user.avatar || user.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                </div>
                <div className="min-w-0">
                  <h3 className="font-semibold text-foreground truncate">{user.name}</h3>
                  <p className="text-sm text-muted-foreground truncate">{user.email}</p>
                </div>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8"><MoreVertical className="h-4 w-4" /></Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem className="gap-2" onClick={() => openEdit(user.id)}><Edit className="h-4 w-4" />Edit User</DropdownMenuItem>
                  <DropdownMenuSub>
                    <DropdownMenuSubTrigger className="gap-2"><Shield className="h-4 w-4" />Change Role</DropdownMenuSubTrigger>
                    <DropdownMenuSubContent>
                      <DropdownMenuItem onClick={() => handleRoleChange(user.id, 'admin')}>Admin</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleRoleChange(user.id, 'doctor')}>Doctor</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleRoleChange(user.id, 'patient')}>Patient</DropdownMenuItem>
                    </DropdownMenuSubContent>
                  </DropdownMenuSub>
                  <DropdownMenuSeparator />
                  {user.status === 'active' ? (
                    <DropdownMenuItem className="gap-2 text-destructive" onClick={() => handleStatusChange(user.id, 'inactive')}>
                      <PowerOff className="h-4 w-4" />Deactivate
                    </DropdownMenuItem>
                  ) : (
                    <DropdownMenuItem className="gap-2 text-success" onClick={() => handleStatusChange(user.id, 'active')}>
                      <Power className="h-4 w-4" />Activate
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <div className="mt-4 flex items-center justify-between">
              <Badge variant="outline" className={cn("border capitalize", roleColors[user.role as keyof typeof roleColors])}>
                {user.role}
              </Badge>
              <Badge variant={user.status === "active" ? "default" : "secondary"} className="capitalize">
                {user.status}
              </Badge>
            </div>
          </div>
        ))}
      </div>

      <Dialog open={!!edit} onOpenChange={(o) => !o && setEdit(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Edit User</DialogTitle></DialogHeader>
          {edit && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div><Label>First name</Label><Input value={edit.first_name} onChange={(e) => setEdit({ ...edit, first_name: e.target.value })} maxLength={50} /></div>
                <div><Label>Last name</Label><Input value={edit.last_name} onChange={(e) => setEdit({ ...edit, last_name: e.target.value })} maxLength={50} /></div>
              </div>
              <div><Label>Phone</Label><Input value={edit.phone} onChange={(e) => setEdit({ ...edit, phone: e.target.value })} maxLength={20} /></div>
              <div><Label>Email</Label><Input value={edit.email} disabled /></div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEdit(null)}>Cancel</Button>
            <Button onClick={saveEdit} disabled={saving}>{saving ? "Saving…" : "Save"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
