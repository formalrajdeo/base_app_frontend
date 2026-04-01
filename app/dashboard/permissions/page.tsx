"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2, Trash2 } from "lucide-react";
import { z } from "zod";
import { getErrorMessage } from "@/utils/errors";

type Action = "read" | "create" | "update" | "delete";
const ACTIONS: Action[] = ["read", "create", "update", "delete"];

// Zod Schemas
const createPermissionSchema = z.object({
    resource: z.string().min(1, "Resource name is required"),
    action: z.enum(ACTIONS),
    description: z.string().min(5, "Description is required").max(200, "Description is too long"),
});

const assignPermissionSchema = z.object({
    resource: z.string().min(1, "Select a resource"),
    action: z.enum(ACTIONS),
});

interface Permission {
    id: string;
    resource: string;
    action: Action;
}

interface Resource {
    id: string;
    name: string;
    description?: string | null;
}

export default function PermissionsPage() {
    const queryClient = useQueryClient();

    // States
    const [newResourceName, setNewResourceName] = useState("");
    const [newResourceDescription, setNewResourceDescription] = useState("");
    const [newResourceAction, setNewResourceAction] = useState<Action>("read");
    const [selectedResourceName, setSelectedResourceName] = useState("");
    const [selectedAction, setSelectedAction] = useState<Action>("read");
    const [inlineActions, setInlineActions] = useState<Record<string, string>>({});

    // Fetch Permissions
    const { data: permissions = [], isLoading: loadingPermissions } = useQuery<Permission[]>({
        queryKey: ["permissions"],
        queryFn: async () => {
            const res = await api.get("/permissions");
            const data = res.data?.data ?? res.data;
            return Array.isArray(data) ? data : [];
        },
    });

    // Fetch Resources
    const { data: resources = [], isLoading: loadingResources } = useQuery<Resource[]>({
        queryKey: ["resources"],
        queryFn: async () => {
            const res = await api.get("/resources");
            const data = res.data?.data ?? res.data;
            return Array.isArray(data) ? data : [];
        },
    });

    // Group permissions by resource
    const groupedPermissions = permissions.reduce<Record<string, Permission[]>>((acc, p) => {
        if (!acc[p.resource]) acc[p.resource] = [];
        acc[p.resource].push(p);
        return acc;
    }, {});

    // Mutations
    const createResourcePermission = useMutation({
        mutationFn: async () => {
            const parsed = createPermissionSchema.parse({ resource: newResourceName, action: newResourceAction, description: newResourceDescription });
            return api.post("/permissions", parsed);
        },
        onSuccess: () => {
            toast.success("Permission created");
            setNewResourceName("");
            setNewResourceDescription("");
            setNewResourceAction("read");
            queryClient.invalidateQueries({ queryKey: ["permissions"] });
            queryClient.invalidateQueries({ queryKey: ["resources"] });
        },
        onError: (err: unknown) => {
            toast.error(getErrorMessage(err));
        }
    });

    const assignAction = useMutation({
        mutationFn: async () => {
            const parsed = assignPermissionSchema.parse({ resource: selectedResourceName, action: selectedAction });
            return api.post("/permissions", parsed);
        },
        onSuccess: () => {
            toast.success("Action assigned");
            setSelectedResourceName("");
            setSelectedAction("read");
            queryClient.invalidateQueries({ queryKey: ["permissions"] });
        },
        onError: (err: unknown) => {
            toast.error(getErrorMessage(err));
        },
    });

    const addInlineAction = useMutation({
        mutationFn: async ({ resource, action }: { resource: string; action: string }) =>
            api.post("/permissions", { resource, action }),
        onSuccess: (_, { resource }) => {
            toast.success("Action added");
            setInlineActions(prev => ({ ...prev, [resource]: "" }));
            queryClient.invalidateQueries({ queryKey: ["permissions"] });
        },
        onError: (err: unknown) => {
            toast.error(getErrorMessage(err));
        },
    });

    const deletePermission = useMutation({
        mutationFn: async (id: string) => api.delete(`/permissions/${id}`),
        onSuccess: () => {
            toast.success("Permission deleted");
            queryClient.invalidateQueries({ queryKey: ["permissions"] });
        },
        onError: (err: unknown) => {
            toast.error(getErrorMessage(err));
        },
    });

    const deleteResource = useMutation({
        mutationFn: async (id: string) => api.delete(`/resources/${id}`),
        onSuccess: () => {
            toast.success("Resource deleted");
            queryClient.invalidateQueries({ queryKey: ["resources"] });
            queryClient.invalidateQueries({ queryKey: ["permissions"] });
        },
        onError: (err: unknown) => {
            toast.error(getErrorMessage(err));
        },
    });

    return (
        <div className="p-6 space-y-6 bg-background text-foreground dark:bg-background dark:text-foreground min-h-screen">
            <h1 className="text-2xl font-bold">Manage Permissions + Resources</h1>

            {/* Create New Resource + Action */}
            <Card className="bg-card dark:bg-card/80 border border-border dark:border-border/70">
                <CardHeader>Create New Resource + Action</CardHeader>
                <CardContent className="flex gap-3 flex-wrap">
                    <Input
                        placeholder="Resource name"
                        value={newResourceName}
                        onChange={e => setNewResourceName(e.target.value)}
                        className="bg-input dark:bg-input/80 text-foreground dark:text-foreground"
                    />
                    <Input
                        placeholder="Resource description"
                        value={newResourceDescription}
                        onChange={e => setNewResourceDescription(e.target.value)}
                        className="bg-input dark:bg-input/80 text-foreground dark:text-foreground"
                    />
                    <select
                        className="border rounded px-3 py-2 bg-input dark:bg-input/80 text-foreground dark:text-foreground border-border dark:border-border/70 appearance-none focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1"
                        value={newResourceAction}
                        onChange={e => setNewResourceAction(e.target.value as Action)}
                    >
                        {ACTIONS.map(a => (
                            <option
                                key={a}
                                value={a}
                                className="bg-background dark:bg-background text-foreground dark:text-foreground"
                            >
                                {a}
                            </option>
                        ))}
                    </select>
                    <Button onClick={() => createResourcePermission.mutate()} disabled={!newResourceName || !newResourceDescription}>
                        Create
                    </Button>
                </CardContent>
            </Card>

            {/* Assign Action to Existing Resource */}
            <Card className="bg-card dark:bg-card/80 border border-border dark:border-border/70">
                <CardHeader>Assign Action to Existing Resource</CardHeader>
                <CardContent className="flex gap-3 flex-wrap">
                    <select
                        className="border rounded px-3 py-2 bg-input dark:bg-input/80 text-foreground dark:text-foreground border-border dark:border-border/70 appearance-none focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1"
                        value={selectedResourceName}
                        onChange={e => setSelectedResourceName(e.target.value)}
                    >
                        <option value="" className="bg-background dark:bg-background text-foreground dark:text-foreground">
                            Select Resource
                        </option>
                        {resources.map(r => (
                            <option
                                key={r.id}
                                value={r.name}
                                className="bg-background dark:bg-background text-foreground dark:text-foreground"
                            >
                                {r.name}
                            </option>
                        ))}
                    </select>

                    <select
                        className="border rounded px-3 py-2 bg-input dark:bg-input/80 text-foreground dark:text-foreground border-border dark:border-border/70 appearance-none focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1"
                        value={selectedAction}
                        onChange={e => setSelectedAction(e.target.value as Action)}
                    >
                        {ACTIONS.map(a => (
                            <option
                                key={a}
                                value={a}
                                className="bg-background dark:bg-background text-foreground dark:text-foreground"
                            >
                                {a}
                            </option>
                        ))}
                    </select>

                    <Button disabled={!selectedResourceName} onClick={() => assignAction.mutate()}>
                        Assign
                    </Button>
                </CardContent>
            </Card>

            {/* List All Resources */}
            {loadingResources || loadingPermissions ? (
                <div className="flex flex-col items-center justify-center py-10 gap-2">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <p className="text-sm text-muted-foreground dark:text-muted-foreground/80">Loading data...</p>
                </div>
            ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {resources.map(r => {
                        const perms = groupedPermissions[r.name] || [];
                        return (
                            <Card key={r.id} className="bg-card dark:bg-card/80 border border-border dark:border-border/70">
                                <CardHeader className="flex justify-between items-center text-foreground dark:text-foreground">
                                    <span className="font-semibold capitalize">{r.name}</span>
                                    <button
                                        onClick={() => deleteResource.mutate(r.id)}
                                        className="text-destructive hover:text-destructive/80"
                                        title="Delete Resource"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </CardHeader>
                                <CardContent className="flex flex-col gap-3">
                                    {perms.length ? (
                                        <div className="flex flex-wrap gap-2">
                                            {perms.map(p => (
                                                <Badge
                                                    key={p.id}
                                                    className="flex items-center gap-1 bg-muted dark:bg-muted/50 text-muted-foreground dark:text-muted-foreground/80"
                                                >
                                                    {p.action}
                                                    <button
                                                        className="ml-1 text-destructive hover:text-destructive/80"
                                                        title="Delete Permission"
                                                        onClick={() => deletePermission.mutate(p.id)}
                                                    >
                                                        ×
                                                    </button>
                                                </Badge>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-muted-foreground dark:text-muted-foreground/80">No permissions yet</div>
                                    )}

                                    {/* Add Inline Action */}
                                    <div className="flex gap-2 mt-2">
                                        <Input
                                            placeholder="New action"
                                            value={inlineActions[r.name] || ""}
                                            onChange={e => setInlineActions({ ...inlineActions, [r.name]: e.target.value })}
                                            className="bg-input dark:bg-input/80 text-foreground dark:text-foreground"
                                        />
                                        <Button
                                            onClick={() =>
                                                addInlineAction.mutate({ resource: r.name, action: inlineActions[r.name] })
                                            }
                                            disabled={!inlineActions[r.name]}
                                        >
                                            Add
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            )}
        </div>
    );
}