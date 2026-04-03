"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2, Trash2, Lock, AlertCircle } from "lucide-react";
import { z } from "zod";
import { getErrorMessage } from "@/utils/errors";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";

// ---------------- SCHEMA ----------------
const createPermissionSchema = z.object({
    resource: z.string().min(1),
    action: z.string().min(1),
    description: z.string().min(5),
});

const assignPermissionSchema = z.object({
    resource: z.string().min(1),
    action: z.string().min(1), // ✅ dynamic
});

const DEFAULT_ACTIONS = ["read", "create", "update", "delete"];

export default function PermissionsPage() {
    const qc = useQueryClient();

    // ---------------- STATE ----------------
    const [newResourceName, setNewResourceName] = useState("");
    const [newResourceDescription, setNewResourceDescription] =
        useState("");
    const [newResourceAction, setNewResourceAction] =
        useState("read");

    // ---------------- QUERIES ----------------
    const permissionsQuery = useQuery({
        queryKey: ["permissions"],
        queryFn: async () => {
            try {
                const res = await api.get("/permissions");
                return res.data?.data ?? res.data;
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
                const res = await api.get("/resources");
                return res.data?.data ?? res.data;
            } catch (err: any) {
                if (err.response?.status === 403) return null;
                throw err;
            }
        },
    });

    const { data: permissions, isLoading: lp, error: pe } =
        permissionsQuery;
    const { data: resources, isLoading: lr, error: re } =
        resourcesQuery;

    // ---------------- MUTATIONS ----------------
    const createPermission = useMutation({
        mutationFn: async () => {
            const parsed = createPermissionSchema.parse({
                resource: newResourceName,
                action: newResourceAction,
                description: newResourceDescription,
            });

            const res = await api.post("/permissions", parsed);

            if (res.data?.success === false) {
                throw new Error(res.data.message);
            }

            return res.data;
        },
        onSuccess: () => {
            toast.success("Created");
            setNewResourceName("");
            setNewResourceDescription("");
            qc.invalidateQueries({ queryKey: ["permissions"] });
            qc.invalidateQueries({ queryKey: ["resources"] });
        },
        onError: (err: any) => toast.error(err.message),
    });

    const addAction = useMutation({
        mutationFn: async (data: {
            resource: string;
            action: string;
        }) => {
            const res = await api.post("/permissions", data);

            if (res.data?.success === false) {
                throw new Error(res.data.message);
            }

            return res.data;
        },
        onSuccess: () => {
            toast.success("Action added");
            qc.invalidateQueries({ queryKey: ["permissions"] });
        },
        onError: (err: any) => toast.error(err.message),
    });

    const deletePermission = useMutation({
        mutationFn: async (id: string) =>
            api.delete(`/permissions/${id}`),
        onSuccess: () => {
            toast.success("Deleted");
            qc.invalidateQueries({ queryKey: ["permissions"] });
        },
    });

    const deleteResource = useMutation({
        mutationFn: async (id: string) =>
            api.delete(`/resources/${id}`),
        onSuccess: () => {
            toast.success("Deleted");
            qc.invalidateQueries({ queryKey: ["resources"] });
            qc.invalidateQueries({ queryKey: ["permissions"] });
        },
    });

    // ---------------- DERIVED ----------------
    const safePermissions = Array.isArray(permissions)
        ? permissions
        : [];
    const safeResources = Array.isArray(resources)
        ? resources
        : [];

    const groupedPermissions = safePermissions.reduce<
        Record<string, any[]>
    >((acc, p) => {
        if (!acc[p.resource]) acc[p.resource] = [];
        acc[p.resource].push(p);
        return acc;
    }, {});

    // ---------------- UI STATES ----------------
    if (permissions === null || resources === null) {
        return (
            <Center>
                <Lock />
                <p>No access</p>
            </Center>
        );
    }

    if (lp || lr) {
        return (
            <Center>
                <Loader2 className="animate-spin" />
            </Center>
        );
    }

    if (pe || re) {
        return (
            <Center>
                <AlertCircle />
                <p>Error loading</p>
            </Center>
        );
    }

    // ---------------- UI ----------------
    return (
        <div className="p-6 space-y-6">
            <h1 className="text-2xl font-bold">Permissions</h1>

            {/* CREATE */}
            <Card>
                <CardHeader>Create Permission</CardHeader>
                <CardContent className="flex gap-2 flex-wrap">
                    <Input
                        placeholder="Resource"
                        value={newResourceName}
                        onChange={(e) =>
                            setNewResourceName(e.target.value)
                        }
                    />
                    <Input
                        placeholder="Description"
                        value={newResourceDescription}
                        onChange={(e) =>
                            setNewResourceDescription(e.target.value)
                        }
                    />

                    <Select
                        value={newResourceAction}
                        onValueChange={(v) => setNewResourceAction(v)}
                    >
                        <SelectTrigger className="w-40">
                            <SelectValue placeholder="Action" />
                        </SelectTrigger>
                        <SelectContent>
                            {DEFAULT_ACTIONS.map((a) => (
                                <SelectItem key={a} value={a}>
                                    {a}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    <Button onClick={() => createPermission.mutate()}>
                        Create
                    </Button>
                </CardContent>
            </Card>

            {/* TABLE */}
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Resource</TableHead>
                        <TableHead>Actions</TableHead>
                        <TableHead className="text-right">
                            Manage
                        </TableHead>
                    </TableRow>
                </TableHeader>

                <TableBody>
                    {safeResources.map((r) => {
                        const perms = groupedPermissions[r.name] || [];

                        return (
                            <TableRow key={r.id}>
                                <TableCell>{r.name}</TableCell>

                                {/* ACTIONS */}
                                <TableCell>
                                    <div className="flex gap-2 flex-wrap">
                                        {perms.length === 0 && (
                                            <span className="text-muted-foreground text-sm">
                                                No actions
                                            </span>
                                        )}

                                        {perms.map((p: any) => (
                                            <span
                                                key={p.id}
                                                className="flex items-center gap-1 bg-muted px-2 py-1 rounded text-sm"
                                            >
                                                {p.action}
                                                <button
                                                    className="text-red-500"
                                                    onClick={() =>
                                                        deletePermission.mutate(p.id)
                                                    }
                                                >
                                                    ×
                                                </button>
                                            </span>
                                        ))}
                                    </div>
                                </TableCell>

                                {/* MANAGE */}
                                <TableCell className="flex justify-end gap-2">
                                    <Dialog>
                                        <DialogTrigger asChild>
                                            <Button size="sm" variant="outline">
                                                + Add
                                            </Button>
                                        </DialogTrigger>

                                        <DialogContent>
                                            <DialogHeader>
                                                <DialogTitle>
                                                    Manage Actions → {r.name}
                                                </DialogTitle>
                                                <DialogDescription>
                                                    Actions can be assign or added
                                                </DialogDescription>
                                            </DialogHeader>

                                            <AddActionForm
                                                resource={r.name}
                                                existingActions={perms.map(
                                                    (p: any) => p.action
                                                )}
                                                onSubmit={(data) =>
                                                    addAction.mutate(data)
                                                }
                                            />
                                        </DialogContent>
                                    </Dialog>

                                    <Button
                                        variant="destructive"
                                        size="icon"
                                        onClick={() =>
                                            deleteResource.mutate(r.id)
                                        }
                                    >
                                        <Trash2 size={16} />
                                    </Button>
                                </TableCell>
                            </TableRow>
                        );
                    })}
                </TableBody>
            </Table>
        </div>
    );
}

// ---------------- FORM ----------------
function AddActionForm({
    resource,
    existingActions,
    onSubmit,
}: {
    resource: string;
    existingActions: string[];
    onSubmit: (data: {
        resource: string;
        action: string;
    }) => void;
}) {
    const [action, setAction] = useState("");
    const [customAction, setCustomAction] = useState("");
    const [error, setError] = useState("");

    const finalAction = customAction || action;

    const handleSubmit = () => {
        try {
            if (!finalAction) throw new Error("Action required");

            if (existingActions.includes(finalAction)) {
                throw new Error("Action already exists");
            }

            onSubmit({ resource, action: finalAction });

            setAction("");
            setCustomAction("");
            setError("");
        } catch (err: any) {
            setError(err.message);
        }
    };

    return (
        <div className="space-y-4">
            <Select
                value={action}
                onValueChange={(v) => {
                    setAction(v);
                    setError("");
                }}
            >
                <SelectTrigger>
                    <SelectValue placeholder="Select action" />
                </SelectTrigger>

                <SelectContent>
                    {DEFAULT_ACTIONS.filter(
                        (a) => !existingActions.includes(a)
                    ).map((a) => (
                        <SelectItem key={a} value={a}>
                            {a}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>

            <Input
                placeholder="Custom action (e.g. publish)"
                value={customAction}
                onChange={(e) => {
                    setCustomAction(e.target.value);
                    setError("");
                }}
            />

            {error && (
                <p className="text-sm text-red-500">{error}</p>
            )}

            <Button className="w-full" onClick={handleSubmit}>
                Add Action
            </Button>
        </div>
    );
}

// ---------------- CENTER ----------------
function Center({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex items-center justify-center h-full flex-col gap-2">
            {children}
        </div>
    );
}