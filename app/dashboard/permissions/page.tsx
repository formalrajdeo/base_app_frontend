"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
} from "@/components/ui/card";

type Action = "READ" | "CREATE" | "UPDATE" | "DELETE";

type Permission = {
  id: string;
  resource: string;
  action: Action;
};

// 🔥 Action order (important for UX)
const ACTION_ORDER: Action[] = ["READ", "CREATE", "UPDATE", "DELETE"];

// 🔥 Badge color logic
const getBadgeVariant = (action: Action) => {
  switch (action) {
    case "DELETE":
      return "destructive";
    case "CREATE":
      return "default";
    case "UPDATE":
      return "secondary";
    case "READ":
    default:
      return "outline";
  }
};

// 🔥 Group by resource
const groupPermissions = (permissions: Permission[]) => {
  return permissions.reduce((acc, perm) => {
    if (!acc[perm.resource]) {
      acc[perm.resource] = [];
    }
    acc[perm.resource].push(perm);
    return acc;
  }, {} as Record<string, Permission[]>);
};

export default function PermissionsPage() {
  const { data = [], isLoading } = useQuery<Permission[]>({
    queryKey: ["permissions"],
    queryFn: async () => (await api.get("/permissions")).data,
  });

  if (isLoading) {
    return <div className="p-6">Loading permissions...</div>;
  }

  const grouped = groupPermissions(data);

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Permissions</h1>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Object.entries(grouped).map(([resource, perms]) => {
          // 🔥 SORT actions
          const sortedPerms = [...perms].sort(
            (a, b) =>
              ACTION_ORDER.indexOf(a.action) -
              ACTION_ORDER.indexOf(b.action)
          );

          return (
            <Card key={resource} className="shadow-sm">
              <CardHeader className="pb-2">
                <h2 className="text-lg font-semibold capitalize">
                  {resource}
                </h2>
              </CardHeader>

              <CardContent className="flex flex-wrap gap-2">
                {sortedPerms.map((p) => (
                  <Badge
                    key={p.id}
                    variant={getBadgeVariant(p.action)}
                    className="text-xs font-medium px-2 py-1"
                  >
                    {p.action}
                  </Badge>
                ))}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}