"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Pencil, Trash } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";
import { z } from "zod";

export const createRoleSchema = z.object({
    name: z.string().min(3, "Role name must be at least 3 characters"),
});

export default function RolesPage() {
    const queryClient = useQueryClient();

    const [selectedRoleId, setSelectedRoleId] = useState<string | null>(null);
    const [newRole, setNewRole] = useState("");
    const [renameRoleName, setRenameRoleName] = useState("");
    const [openRenameDialog, setOpenRenameDialog] = useState(false);

    const { data: roles = [] } = useQuery({
        queryKey: ["roles"],
        queryFn: async () => (await api.get("/roles")).data,
    });

    const { data: selectedRole } = useQuery({
        queryKey: ["role", selectedRoleId],
        enabled: !!selectedRoleId,
        queryFn: async () => (await api.get(`/roles/${selectedRoleId}`)).data,
    });

    const { data: resources = [] } = useQuery({
        queryKey: ["resources"],
        queryFn: async () => (await api.get("/resources/with-permissions")).data,
    });

    const createRole = useMutation({
        mutationFn: async () => api.post("/roles", { name: newRole }),
        onSuccess: () => {
            toast.success("Role created");
            setNewRole("");
            queryClient.invalidateQueries({ queryKey: ["roles"] });
        },
    });

    const deleteRole = useMutation({
        mutationFn: async (roleId: string) => api.delete(`/roles/${roleId}`),
        onSuccess: (_data, roleId) => {
            toast.success("Role deleted");
            if (selectedRoleId === roleId) setSelectedRoleId(null);
            queryClient.invalidateQueries({ queryKey: ["roles"] });
        },
    });

    const togglePermission = useMutation({
        mutationFn: async ({ permissionId, assigned }: any) => {
            if (!selectedRoleId) return;
            return assigned
                ? api.delete(`/roles/${selectedRoleId}/permissions/${permissionId}`)
                : api.post(`/roles/${selectedRoleId}/permissions/${permissionId}`);
        },
        onSuccess: () => {
            if (selectedRoleId)
                queryClient.invalidateQueries({ queryKey: ["role", selectedRoleId] });
        },
    });

    const toggleResource = useMutation({
        mutationFn: async ({ resourceId, assigned }: any) => {
            if (!selectedRoleId) return;
            return assigned
                ? api.delete(`/roles/${selectedRoleId}/resources/${resourceId}`)
                : api.post(`/roles/${selectedRoleId}/resources/${resourceId}`);
        },
        onSuccess: () => {
            if (selectedRoleId)
                queryClient.invalidateQueries({ queryKey: ["role", selectedRoleId] });
        },
    });

    const renameRole = useMutation({
        mutationFn: async () =>
            api.patch(`/roles/${selectedRoleId}`, { name: renameRoleName }),
        onSuccess: () => {
            toast.success("Role renamed");
            queryClient.invalidateQueries({ queryKey: ["roles"] });
            queryClient.invalidateQueries({ queryKey: ["role", selectedRoleId] });
            setOpenRenameDialog(false);
        },
        onError: (err: any) => toast.error(err.message || "Failed to rename role"),
    });

    return (
        <div className="flex h-full text-gray-900 dark:text-gray-100">
            {/* LEFT PANEL */}
            <div className="w-80 border-r border-gray-200 dark:border-gray-700 p-4 flex flex-col gap-4 overflow-y-auto">
                <Input
                    placeholder="New role..."
                    value={newRole}
                    onChange={(e) => setNewRole(e.target.value)}
                />
                <Button
                    className="w-full"
                    onClick={() => {
                        try {
                            // Validate with Zod before calling API
                            createRoleSchema.parse({ name: newRole });
                            createRole.mutate();
                        } catch (err: any) {
                            toast.error(err.errors?.[0]?.message || "Invalid role name");
                        }
                    }}
                >
                    Create Role
                </Button>

                <div className="flex flex-col gap-2">
                    {roles.map((r: any) => (
                        <Card
                            key={r.id}
                            className={`cursor-pointer ${selectedRoleId === r.id ? "border border-primary" : ""
                                }`}
                            onClick={() => setSelectedRoleId(r.id)}
                        >
                            <CardContent className="flex justify-between items-center p-3">
                                <span>{r.name}</span>
                                <div className="flex gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setSelectedRoleId(r.id);
                                            setRenameRoleName(r.name);
                                            setOpenRenameDialog(true);
                                        }}
                                    >
                                        <Pencil className="w-4 h-4" />
                                    </Button>
                                    <Button
                                        variant="destructive"
                                        size="sm"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            deleteRole.mutate(r.id);
                                        }}
                                    >
                                        <Trash className="w-4 h-4" />
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>

            {/* RIGHT PANEL */}
            <div className="flex-1 p-6 overflow-y-auto space-y-6">
                {!selectedRole ? (
                    <div className="text-gray-500 dark:text-gray-400">Select a role</div>
                ) : (
                    <>
                        <h2 className="text-2xl font-bold">{selectedRole.name}</h2>

                        {resources.map((res: any) => {
                            const resourcePermissions = res.permissions.map((p: any) => {
                                const assignedPerm = selectedRole.permissions.find(
                                    (rp: any) => rp.id === p.id
                                );
                                return { ...p, assigned: assignedPerm?.assigned || false };
                            });

                            const isResourceAssigned = resourcePermissions.some((p: any) => p.assigned);

                            return (
                                <Card key={res.id} className="">
                                    <CardContent className="space-y-3">
                                        {/* Resource Toggle */}
                                        <div className="flex justify-between items-center">
                                            <h3 className="font-semibold">{res.name}</h3>
                                            <Checkbox
                                                checked={isResourceAssigned}
                                                onCheckedChange={() =>
                                                    toggleResource.mutate({
                                                        resourceId: res.id,
                                                        assigned: isResourceAssigned,
                                                    })
                                                }
                                            />
                                        </div>

                                        {/* Permissions */}
                                        <div className="flex flex-wrap gap-2">
                                            {resourcePermissions.map((p: any) => (
                                                <label
                                                    key={p.id}
                                                    className="flex items-center gap-2 border border-gray-300 dark:border-gray-700 rounded px-3 py-1"
                                                >
                                                    <Checkbox
                                                        checked={p.assigned}
                                                        onCheckedChange={() =>
                                                            togglePermission.mutate({
                                                                permissionId: p.id,
                                                                assigned: p.assigned,
                                                            })
                                                        }
                                                    />
                                                    {p.action}
                                                </label>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </>
                )}
            </div>

            {/* Rename Role Dialog */}
            <Dialog open={openRenameDialog} onOpenChange={setOpenRenameDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Rename Role</DialogTitle>
                        <DialogDescription>
                            Enter a new name for the role. This will update the role across the system.
                        </DialogDescription>
                    </DialogHeader>
                    <Input
                        value={renameRoleName}
                        onChange={(e) => setRenameRoleName(e.target.value)}
                        className="mb-4"
                    />
                    <DialogFooter className="flex justify-end gap-2">
                        <Button variant="outline" onClick={() => setOpenRenameDialog(false)}>
                            Cancel
                        </Button>
                        <Button
                            onClick={() => renameRole.mutate()}
                            disabled={!renameRoleName.trim()}
                        >
                            Rename
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}