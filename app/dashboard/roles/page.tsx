"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Pencil } from "lucide-react"; // <- Lucide edit icon
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";

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
        onSuccess: () => {
            toast.success("Role deleted");
            setSelectedRoleId(null);
            queryClient.invalidateQueries({ queryKey: ["roles"] });
        },
    });

    const togglePermission = useMutation({
        mutationFn: async ({ permissionId, assigned }: any) => {
            if (assigned) {
                return api.delete(`/roles/${selectedRoleId}/permissions/${permissionId}`);
            } else {
                return api.post(`/roles/${selectedRoleId}/permissions/${permissionId}`);
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["role", selectedRoleId] });
        },
    });

    const toggleResource = useMutation({
        mutationFn: async ({ resourceId, assigned }: any) => {
            if (assigned) {
                return api.delete(`/roles/${selectedRoleId}/resources/${resourceId}`);
            } else {
                return api.post(`/roles/${selectedRoleId}/resources/${resourceId}`);
            }
        },
        onSuccess: () => {
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
        onError: (err: any) => {
            toast.error(err.message || "Failed to rename role");
        },
    });

    return (
        <div className="flex h-full">
            {/* LEFT PANEL */}
            <div className="w-80 border-r p-4 space-y-4">
                <Input
                    placeholder="New role..."
                    value={newRole}
                    onChange={(e) => setNewRole(e.target.value)}
                />
                <Button onClick={() => createRole.mutate()} className="w-full">
                    Create Role
                </Button>

                {roles.map((r: any) => (
                    <Card
                        key={r.id}
                        onClick={() => setSelectedRoleId(r.id)}
                        className={`cursor-pointer ${selectedRoleId === r.id ? "border-primary" : ""
                            }`}
                    >
                        <CardContent className="p-3 flex justify-between items-center">
                            {r.name}
                            <div className="flex gap-2">
                                {/* ✏️ Lucide edit icon */}
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setRenameRoleName(r.name);
                                        setSelectedRoleId(r.id);
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
                                    Delete
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* RIGHT PANEL */}
            <div className="flex-1 p-6">
                {!selectedRole ? (
                    <div>Select a role</div>
                ) : (
                    <>
                        <h2 className="text-xl font-bold mb-6">{selectedRole.name}</h2>

                        <div className="space-y-6">
                            {resources.map((res: any) => {
                                const resourcePermissions = res.permissions.map((p: any) => {
                                    const assignedPerm = selectedRole.permissions.find(
                                        (rp: any) => rp.id === p.id
                                    );
                                    return { ...p, assigned: assignedPerm?.assigned || false };
                                });

                                const isAssigned = resourcePermissions.some((p: any) => p.assigned);

                                return (
                                    <Card key={res.id}>
                                        <CardContent className="p-4 space-y-3">
                                            {/* RESOURCE TOGGLE */}
                                            <div className="flex items-center justify-between">
                                                <h3 className="font-semibold">{res.name}</h3>
                                                <Checkbox
                                                    checked={isAssigned}
                                                    onCheckedChange={() =>
                                                        toggleResource.mutate({
                                                            resourceId: res.id,
                                                            assigned: !isAssigned,
                                                        })
                                                    }
                                                />
                                            </div>

                                            {/* INDIVIDUAL PERMISSIONS */}
                                            <div className="flex gap-4 flex-wrap">
                                                {resourcePermissions.map((p: any) => (
                                                    <label
                                                        key={p.id}
                                                        className="flex items-center gap-2 border px-3 py-1 rounded"
                                                    >
                                                        <Checkbox
                                                            checked={p.assigned}
                                                            onCheckedChange={() =>
                                                                togglePermission.mutate({
                                                                    permissionId: p.id,
                                                                    assigned: !p.assigned,
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
                        </div>
                    </>
                )}
            </div>

            {/* RENAME ROLE DIALOG */}
            <Dialog open={openRenameDialog} onOpenChange={setOpenRenameDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Rename Role</DialogTitle>
                        <DialogDescription>
                            Enter a new name for the role. This will update the role's name across the system.
                        </DialogDescription>
                    </DialogHeader>
                    <Input
                        value={renameRoleName}
                        onChange={(e) => setRenameRoleName(e.target.value)}
                        className="mb-4"
                    />
                    <DialogFooter className="flex justify-end gap-2">
                        <Button
                            variant="outline"
                            onClick={() => setOpenRenameDialog(false)}
                        >
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