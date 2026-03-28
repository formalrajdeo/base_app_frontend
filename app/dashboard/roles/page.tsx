"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Card, CardContent } from "@/components/ui/card";
import { useState } from "react";
import PermissionMatrix from "@/components/permission-matrix";

export default function RolesPage() {
    const { data: roles } = useQuery({
        queryKey: ["roles"],
        queryFn: async () => (await api.get("/roles")).data,
    });

    const [selected, setSelected] = useState<any>(null);

    return (
        <div className="flex flex-1">
            <div className="w-80 p-4 space-y-3">
                {roles?.map((r: any) => (
                    <Card
                        key={r.id}
                        onClick={() => setSelected(r)}
                        className="cursor-pointer hover:shadow-lg transition"
                    >
                        <CardContent className="p-4 font-medium">{r.name}</CardContent>
                    </Card>
                ))}
            </div>

            <div className="flex-1 p-6">
                {selected ? (
                    <>
                        <h2 className="text-xl font-semibold mb-4">
                            {selected.name} Permissions
                        </h2>
                        <PermissionMatrix roleId={selected.id} />
                    </>
                ) : (
                    <div>Select a role</div>
                )}
            </div>
        </div>
    );
}