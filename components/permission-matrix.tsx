"use client";

import { api } from "@/lib/api";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Checkbox } from "./ui/checkbox";

type Permission = {
  id: string;
  resource: string;
  action: "READ" | "CREATE" | "UPDATE" | "DELETE";
};

type RoleWithPermissions = {
  id: string;
  name: string;
  permissions: Permission[];
};

const actions = ["READ", "CREATE", "UPDATE", "DELETE"];

export default function PermissionMatrix({ roleId }: { roleId: string }) {
  const { data: permissions } = useQuery({
    queryKey: ["permissions"],
    queryFn: async () => (await api.get("/permissions")).data,
  });

  const { data: role } = useQuery<RoleWithPermissions>({
    queryKey: ["role", roleId],
    queryFn: async () =>
      (await api.get(`/roles/${roleId}`)).data,
  });

  const rolePermissions: Permission[] = role?.permissions || [];

  const mutation = useMutation({
    mutationFn: (payload: any) =>
      api.post(`/roles/${roleId}`, payload),
  });

  const isChecked = (permId: string) =>
    rolePermissions.some((p) => p.id === permId);

  const resources = [...new Set(permissions?.map((p: any) => p.resource))];

  return (
    <div className="rounded-xl border p-4">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b">
            <th className="text-left p-2">Resource</th>
            {actions.map((a) => (
              <th key={a} className="p-2">
                {a}
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {resources.map((resource: any) => (
            <tr key={resource} className="border-b">
              <td className="p-2 font-medium">{resource}</td>

              {actions.map((action) => {
                const perm = permissions.find(
                  (p: any) => p.resource === resource && p.action === action
                );

                if (!perm) return <td key={action} />;

                return (
                  <td key={action} className="text-center">
                    <Checkbox
                      checked={isChecked(perm.id)}
                      onCheckedChange={() =>
                        mutation.mutate({ permissionId: perm.id })
                      }
                    />
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}