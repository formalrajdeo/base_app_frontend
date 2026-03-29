"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Checkbox } from "@/components/ui/checkbox";

type Permission = {
  id: string;
  resource: string;
  action: "READ" | "CREATE" | "UPDATE" | "DELETE";
};

const ACTION_ORDER = ["READ", "CREATE", "UPDATE", "DELETE"];

export default function PermissionMatrix({ roleId }: { roleId: string }) {
  const { data } = useQuery({
    queryKey: ["role-permissions", roleId],
    queryFn: async () => (await api.get(`/roles/${roleId}`)).data,
  });

  const permissions: Permission[] = data?.permissions || [];

  // 🔥 group by resource
  const grouped = permissions.reduce((acc: any, perm) => {
    if (!acc[perm.resource]) acc[perm.resource] = [];
    acc[perm.resource].push(perm);
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      {Object.entries(grouped).map(([resource, perms]: any) => {
        const sorted = perms.sort(
          (a: Permission, b: Permission) =>
            ACTION_ORDER.indexOf(a.action) -
            ACTION_ORDER.indexOf(b.action)
        );

        return (
          <div
            key={resource}
            className="border rounded-xl p-4 bg-background shadow-sm"
          >
            <h3 className="font-semibold capitalize mb-3 text-lg">
              {resource}
            </h3>

            <div className="grid grid-cols-4 gap-4">
              {sorted.map((p: Permission) => (
                <label
                  key={p.id}
                  className="flex items-center gap-2 text-sm"
                >
                  <Checkbox checked />
                  {p.action}
                </label>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}