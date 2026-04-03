"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
    Pencil,
    Trash,
    Lock,
    Loader2,
    AlertCircle,
} from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";
import { z } from "zod";

// ---------------- SCHEMA ----------------
export const createRoleSchema = z.object({
    name: z.string().min(3, "Role name must be at least 3 characters"),
});

export default function RolesPage() {
    const qc = useQueryClient();

    // ---------------- STATE ----------------
    const [selectedRoleId, setSelectedRoleId] = useState<string | null>(null);
    const [newRole, setNewRole] = useState("");
    const [renameRoleName, setRenameRoleName] = useState("");
    const [openRenameDialog, setOpenRenameDialog] = useState(false);

    // ---------------- QUERIES ----------------
    const rolesQuery = useQuery({
        queryKey: ["roles"],
        queryFn: async () => {
            try {
                const res = await api.get("/roles");
                return res.data;
            } catch (err: any) {
                if (err.response?.status === 403) return null;
                throw err;
            }
        },
    });

    const selectedRoleQuery = useQuery({
        queryKey: ["role", selectedRoleId],
        enabled: !!selectedRoleId,
        queryFn: async () => {
            try {
                const res = await api.get(`/roles/${selectedRoleId}`);
                return res.data;
            } catch (err: any) {
                if (err.response?.status === 403) return null;
                throw err;
            }
        },
    });

    const resourcesQuery = useQuery({
        queryKey: ["resources"],
        queryFn: async () => {
            try {
                const res = await api.get("/resources/with-permissions");
                return res.data;
            } catch (err: any) {
                if (err.response?.status === 403) return null;
                throw err;
            }
        },
    });

    const { data: roles, isLoading: rolesLoading, error: rolesError } = rolesQuery;
    const { data: selectedRole, isLoading: roleLoading } = selectedRoleQuery;
    const { data: resources, isLoading: resourcesLoading } = resourcesQuery;

    // ---------------- MUTATIONS ----------------
    const createRole = useMutation({
        mutationFn: async () => api.post("/roles", { name: newRole }),
        onSuccess: () => {
            toast.success("Role created");
            setNewRole("");
            qc.invalidateQueries({ queryKey: ["roles"] });
        },
    });

    const deleteRole = useMutation({
        mutationFn: async (id: string) => api.delete(`/roles/${id}`),
        onSuccess: (_data, id) => {
            toast.success("Role deleted");
            if (selectedRoleId === id) setSelectedRoleId(null);
            qc.invalidateQueries({ queryKey: ["roles"] });
        },
    });

    const togglePermission = useMutation({
        mutationFn: async ({ permissionId, assigned }: any) => {
            return assigned
                ? api.delete(`/roles/${selectedRoleId}/permissions/${permissionId}`)
                : api.post(`/roles/${selectedRoleId}/permissions/${permissionId}`);
        },
        onSuccess: () =>
            qc.invalidateQueries({ queryKey: ["role", selectedRoleId] }),
    });

    const toggleResource = useMutation({
        mutationFn: async ({ resourceId, assigned }: any) => {
            return assigned
                ? api.delete(`/roles/${selectedRoleId}/resources/${resourceId}`)
                : api.post(`/roles/${selectedRoleId}/resources/${resourceId}`);
        },
        onSuccess: () =>
            qc.invalidateQueries({ queryKey: ["role", selectedRoleId] }),
    });

    const renameRole = useMutation({
        mutationFn: async () =>
            api.patch(`/roles/${selectedRoleId}`, { name: renameRoleName }),
        onSuccess: () => {
            toast.success("Role renamed");
            qc.invalidateQueries({ queryKey: ["roles"] });
            qc.invalidateQueries({ queryKey: ["role", selectedRoleId] });
            setOpenRenameDialog(false);
        },
    });

    // ---------------- UI STATES ----------------
    if (roles === null) {
        return (
            <Center>
                <Lock />
                <p>No access to roles</p>
            </Center>
        );
    }

    if (rolesLoading) {
        return (
            <Center>
                <Loader2 className="animate-spin" />
            </Center>
        );
    }

    if (rolesError) {
        return (
            <Center>
                <AlertCircle />
                <p>Error loading roles</p>
            </Center>
        );
    }

    // ---------------- UI ----------------
    return (
        <div className="flex h-full">

            {/* LEFT PANEL */}
            <div className="w-80 border-r p-4 space-y-4">
                <Input
                    placeholder="New role..."
                    value={newRole}
                    onChange={(e) => setNewRole(e.target.value)}
                />

                <Button
                    onClick={() => {
                        try {
                            createRoleSchema.parse({ name: newRole });
                            createRole.mutate();
                        } catch (err: any) {
                            toast.error(err.errors?.[0]?.message);
                        }
                    }}
                >
                    Create Role
                </Button>

                {(roles ?? []).map((r: any) => (
                    <Card
                        key={r.id}
                        onClick={() => setSelectedRoleId(r.id)}
                        className={`cursor-pointer ${selectedRoleId === r.id ? "border border-primary" : ""
                            }`}
                    >
                        <CardContent className="flex justify-between">
                            {r.name}

                            <div className="flex gap-2">
                                <Button
                                    size="sm"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setSelectedRoleId(r.id);
                                        setRenameRoleName(r.name);
                                        setOpenRenameDialog(true);
                                    }}
                                >
                                    <Pencil size={16} />
                                </Button>

                                <Button
                                    size="sm"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        deleteRole.mutate(r.id);
                                    }}
                                >
                                    <Trash size={16} />
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* RIGHT PANEL */}
            <div className="flex-1 p-6 space-y-6 overflow-y-auto">
                {!selectedRoleId ? (
                    <p>Select a role</p>
                ) : roleLoading || resourcesLoading ? (
                    <Center>
                        <Loader2 className="animate-spin" />
                    </Center>
                ) : selectedRole === null ? (
                    <p className="text-yellow-600">No permission</p>
                ) : (
                    <>
                        <h2 className="text-2xl font-bold">{selectedRole.name}</h2>

                        {(resources ?? []).map((res: any) => {
                            const resourcePermissions = (res.permissions ?? []).map((p: any) => {
                                const assignedPerm = selectedRole.permissions?.find(
                                    (rp: any) => rp.id === p.id
                                );

                                return {
                                    ...p,
                                    assigned: assignedPerm?.assigned || false,
                                };
                            });

                            const isResourceAssigned = resourcePermissions.some(
                                (p: any) => p.assigned
                            );

                            return (
                                <Card key={res.id}>
                                    <CardContent className="space-y-3">

                                        {/* RESOURCE */}
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

                                        {/* PERMISSIONS */}
                                        <div className="flex flex-wrap gap-2">
                                            {resourcePermissions.map((p: any) => (
                                                <label
                                                    key={p.id}
                                                    className="flex items-center gap-2 border rounded px-3 py-1"
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

            {/* RENAME MODAL */}
            <Dialog open={openRenameDialog} onOpenChange={setOpenRenameDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Rename Role</DialogTitle>
                        <DialogDescription>Update role name</DialogDescription>
                    </DialogHeader>

                    <Input
                        value={renameRoleName}
                        onChange={(e) => setRenameRoleName(e.target.value)}
                    />

                    <DialogFooter>
                        <Button onClick={() => setOpenRenameDialog(false)}>Cancel</Button>
                        <Button onClick={() => renameRole.mutate()}>Rename</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}

// ---------------- CENTER ----------------
function Center({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex items-center justify-center h-full flex-col gap-2">
            {children}
        </div>
    );
}