import { useState } from "react";
import { Plus, Search, MoreVertical, Edit, Trash2, Shield, Mail, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

const users = [
  { id: 1, name: "Dr. Sarah Smith", email: "sarah.smith@hospital.com", role: "Doctor", status: "Active", avatar: "SS" },
  { id: 2, name: "John Anderson", email: "john.a@hospital.com", role: "Admin", status: "Active", avatar: "JA" },
  { id: 3, name: "Emily Johnson", email: "emily.j@hospital.com", role: "Patient", status: "Active", avatar: "EJ" },
  { id: 4, name: "Dr. Michael Brown", email: "m.brown@hospital.com", role: "Doctor", status: "Inactive", avatar: "MB" },
  { id: 5, name: "Lisa Davis", email: "lisa.d@hospital.com", role: "Patient", status: "Active", avatar: "LD" },
  { id: 6, name: "Dr. Robert Wilson", email: "r.wilson@hospital.com", role: "Doctor", status: "Active", avatar: "RW" },
];

const roleColors = {
  Admin: "bg-secondary/20 text-secondary border-secondary/30",
  Doctor: "bg-success/20 text-success border-success/30",
  Patient: "bg-warning/20 text-warning border-warning/30",
};

export default function UserManagement() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRole, setSelectedRole] = useState<string | null>(null);

  const filteredUsers = users.filter((user) => {
    const matchesSearch = user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = !selectedRole || user.role === selectedRole;
    return matchesSearch && matchesRole;
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">User Management</h1>
          <p className="text-muted-foreground">Manage system users and their roles</p>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Add New User
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search users..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex gap-2">
          {["Admin", "Doctor", "Patient"].map((role) => (
            <Button
              key={role}
              variant={selectedRole === role ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedRole(selectedRole === role ? null : role)}
            >
              {role}
            </Button>
          ))}
        </div>
      </div>

      {/* User Cards Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filteredUsers.map((user, index) => (
          <div
            key={user.id}
            className="rounded-lg border bg-card p-5 card-shadow animate-slide-up"
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground font-semibold">
                  {user.avatar}
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">{user.name}</h3>
                  <p className="text-sm text-muted-foreground">{user.email}</p>
                </div>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem className="gap-2">
                    <Edit className="h-4 w-4" />
                    Edit User
                  </DropdownMenuItem>
                  <DropdownMenuItem className="gap-2">
                    <Shield className="h-4 w-4" />
                    Change Role
                  </DropdownMenuItem>
                  <DropdownMenuItem className="gap-2">
                    <Mail className="h-4 w-4" />
                    Send Email
                  </DropdownMenuItem>
                  <DropdownMenuItem className="gap-2">
                    <RefreshCw className="h-4 w-4" />
                    Reset Password
                  </DropdownMenuItem>
                  <DropdownMenuItem className="gap-2 text-destructive">
                    <Trash2 className="h-4 w-4" />
                    Delete User
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <div className="mt-4 flex items-center justify-between">
              <Badge variant="outline" className={cn("border", roleColors[user.role as keyof typeof roleColors])}>
                {user.role}
              </Badge>
              <Badge variant={user.status === "Active" ? "default" : "secondary"}>
                {user.status}
              </Badge>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
