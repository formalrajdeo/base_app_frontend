"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";

type Role = {
  id: string;
  name: string;
};

type User = {
  id: string;
  name: string;
  email: string;
  roles: Role[];
};

export default function UsersPage() {
  const queryClient = useQueryClient();

  const { data: users = [] } = useQuery<User[]>({
    queryKey: ["users"],
    queryFn: async () => (await api.get("/users")).data,
  });

  const { data: roles = [] } = useQuery<Role[]>({
    queryKey: ["roles"],
    queryFn: async () => (await api.get("/roles")).data,
  });

  // 🔥 toggle role mutation
  const toggleRole = useMutation({
    mutationFn: async ({ userId, roleId, isAssigned }: { userId: string; roleId: string; isAssigned: boolean }) => {
      if (isAssigned) {
        return api.delete(`/users/${userId}/roles/${roleId}`);
      } else {
        return api.post(`/users/${userId}/roles/${roleId}`);
      }
    },
    onSuccess: (_data, variables) => {
      toast.success(
        variables.isAssigned
          ? "Role removed"
          : "Role assigned"
      );
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
    onError: () => {
      toast.error("Something went wrong");
    },
  });
  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Users</h1>

      <div className="space-y-6">
        {users.map((user) => (
          <div key={user.id} className="border rounded-xl p-4 space-y-3">
            <div>
              <div className="font-semibold">{user.name}</div>
              <div className="text-sm text-muted-foreground">
                {user.email}
              </div>
            </div>

            {/* 🔥 roles badges */}
            <div className="flex gap-2 flex-wrap">
              {user.roles.map((role) => (
                <Badge key={role.id}>{role.name}</Badge>
              ))}
            </div>

            {/* 🔥 role toggles */}
            <div className="flex gap-4 flex-wrap">
              {roles.map((role) => {
                const isAssigned = user.roles.some(
                  (r) => r.id === role.id
                );

                return (
                  <label
                    key={role.id}
                    className="flex items-center gap-2 text-sm"
                  >
                    <Checkbox
                      checked={isAssigned}
                      onCheckedChange={() =>
                        toggleRole.mutate({
                          userId: user.id,
                          roleId: role.id,
                          isAssigned,
                        })
                      }
                    />
                    {role.name}
                  </label>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}