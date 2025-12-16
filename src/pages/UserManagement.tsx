import { useState } from "react";
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
import { useAuth, UserRole } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";

const roleColors = {
  admin: "bg-secondary/20 text-secondary border-secondary/30",
  doctor: "bg-success/20 text-success border-success/30",
  patient: "bg-warning/20 text-warning border-warning/30",
};

export default function UserManagement() {
  const { getAllUsers, updateUserRole, updateUserStatus, user: currentUser } = useAuth();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const users = getAllUsers();

  const filteredUsers = users.filter((user) => {
    const matchesSearch = user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = !selectedRole || user.role === selectedRole.toLowerCase();
    return matchesSearch && matchesRole;
  });

  const handleRoleChange = (userId: string, newRole: UserRole) => {
    if (userId === currentUser?.id) {
      toast({ title: "Cannot change own role", variant: "destructive" });
      return;
    }
    const success = updateUserRole(userId, newRole);
    if (success) {
      toast({ title: "Role Updated", description: `User role changed to ${newRole}` });
      setRefreshKey(k => k + 1);
    }
  };

  const handleStatusChange = (userId: string, status: 'active' | 'inactive') => {
    if (userId === currentUser?.id) {
      toast({ title: "Cannot change own status", variant: "destructive" });
      return;
    }
    const success = updateUserStatus(userId, status);
    if (success) {
      toast({ title: "Status Updated", description: `User ${status === 'active' ? 'activated' : 'deactivated'}` });
      setRefreshKey(k => k + 1);
    }
  };

  return (
    <div className="space-y-6" key={refreshKey}>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">User Management</h1>
          <p className="text-muted-foreground">Manage system users and their roles</p>
        </div>
        <Button className="gap-2"><Plus className="h-4 w-4" />Add New User</Button>
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

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filteredUsers.map((user, index) => (
          <div key={user.id} className="rounded-lg border bg-card p-5 card-shadow animate-slide-up" style={{ animationDelay: `${index * 50}ms` }}>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground font-semibold">
                  {user.avatar || user.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">{user.name}</h3>
                  <p className="text-sm text-muted-foreground">{user.email}</p>
                </div>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8"><MoreVertical className="h-4 w-4" /></Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem className="gap-2"><Edit className="h-4 w-4" />Edit User</DropdownMenuItem>
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
    </div>
  );
}
